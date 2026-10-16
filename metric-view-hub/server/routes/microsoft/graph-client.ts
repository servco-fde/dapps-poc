import { z } from 'zod';

const GRAPH_SCOPE = 'https://graph.microsoft.com/.default';
const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 10_000;

const TokenResponse = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().positive(),
});

const UserResponse = z.object({
  id: z.string().min(1),
  displayName: z.string().nullish(),
  mail: z.string().nullish(),
  userPrincipalName: z.string().min(1),
  jobTitle: z.string().nullish(),
  department: z.string().nullish(),
  employeeId: z.string().nullish(),
  officeLocation: z.string().nullish(),
});

export interface MicrosoftProfile {
  displayName: string | null;
  email: string;
  jobTitle: string | null;
  department: string | null;
  employeeId: string | null;
  officeLocation: string | null;
}

export type GraphErrorKind = 'not_found' | 'denied' | 'unavailable' | 'invalid_response';

export class GraphRequestError extends Error {
  constructor(public readonly kind: GraphErrorKind) {
    super(kind);
  }
}

function classifyStatus(status: number): GraphRequestError {
  if (status === 404) return new GraphRequestError('not_found');
  if (status === 401 || status === 403) return new GraphRequestError('denied');
  return new GraphRequestError('unavailable');
}

export function createGraphClient(
  environment: NodeJS.ProcessEnv = process.env,
  fetcher: typeof fetch = fetch
) {
  const tenantId = environment.MICROSOFT_GRAPH_TENANT_ID?.trim();
  const clientId = environment.MICROSOFT_GRAPH_CLIENT_ID?.trim();
  const clientSecret = environment.MICROSOFT_GRAPH_CLIENT_SECRET;
  let cachedToken: { value: string; expiresAt: number } | null = null;
  let pendingToken: Promise<string> | null = null;

  const isConfigured = () => Boolean(tenantId && clientId && clientSecret);

  async function accessToken(): Promise<string> {
    if (!isConfigured()) throw new GraphRequestError('unavailable');
    if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
    if (pendingToken) return pendingToken;

    pendingToken = (async () => {
      let response: Response;
      try {
        response = await fetcher(`https://login.microsoftonline.com/${encodeURIComponent(tenantId!)}/oauth2/v2.0/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            grant_type: 'client_credentials',
            scope: GRAPH_SCOPE,
          }),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
      } catch {
        throw new GraphRequestError('unavailable');
      }
      if (!response.ok) throw classifyStatus(response.status);
      const parsed = TokenResponse.safeParse(await response.json().catch(() => null));
      if (!parsed.success) throw new GraphRequestError('invalid_response');
      cachedToken = {
        value: parsed.data.access_token,
        expiresAt: Date.now() + parsed.data.expires_in * 1000,
      };
      return cachedToken.value;
    })();
    try {
      return await pendingToken;
    } finally {
      pendingToken = null;
    }
  }

  async function graphGet(path: string): Promise<Response> {
    const token = await accessToken();
    try {
      return await fetcher(`${GRAPH_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      throw new GraphRequestError('unavailable');
    }
  }

  async function getProfile(email: string): Promise<MicrosoftProfile> {
    const fields = 'id,displayName,mail,userPrincipalName,jobTitle,department,employeeId,officeLocation';
    const response = await graphGet(`/users/${encodeURIComponent(email)}?$select=${fields}`);
    if (!response.ok) throw classifyStatus(response.status);
    const parsed = UserResponse.safeParse(await response.json().catch(() => null));
    if (!parsed.success) throw new GraphRequestError('invalid_response');
    const user = parsed.data;
    if (user.userPrincipalName.toLowerCase() !== email.toLowerCase()) throw new GraphRequestError('not_found');
    return {
      displayName: user.displayName ?? null,
      email: user.mail ?? user.userPrincipalName,
      jobTitle: user.jobTitle ?? null,
      department: user.department ?? null,
      employeeId: user.employeeId ?? null,
      officeLocation: user.officeLocation ?? null,
    };
  }

  async function getPhoto(email: string): Promise<{ bytes: Uint8Array; contentType: string } | null> {
    const response = await graphGet(`/users/${encodeURIComponent(email)}/photo/$value`);
    if (response.status === 404 || response.status === 403) return null;
    if (!response.ok) throw classifyStatus(response.status);
    const contentType = response.headers.get('content-type')?.split(';')[0].toLowerCase();
    if (contentType !== 'image/jpeg' && contentType !== 'image/png' && contentType !== 'image/webp') {
      throw new GraphRequestError('invalid_response');
    }
    const length = Number(response.headers.get('content-length'));
    if (length > MAX_PHOTO_BYTES) throw new GraphRequestError('invalid_response');
    const reader = response.body?.getReader() as ReadableStreamDefaultReader<Uint8Array> | undefined;
    if (!reader) throw new GraphRequestError('invalid_response');
    const parts: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_PHOTO_BYTES) {
        await reader.cancel();
        throw new GraphRequestError('invalid_response');
      }
      parts.push(value);
    }
    const bytes = new Uint8Array(total);
    let offset = 0;
    for (const part of parts) {
      bytes.set(part, offset);
      offset += part.byteLength;
    }
    return { bytes, contentType };
  }

  return { isConfigured, getProfile, getPhoto };
}
