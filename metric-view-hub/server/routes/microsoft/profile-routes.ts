import type { Application } from 'express';
import { z } from 'zod';
import { createGraphClient, GraphRequestError } from './graph-client';

interface AppKitWithServer {
  server: { extend(fn: (app: Application) => void): void };
}

const Email = z.email();

export function currentProfileEmail(
  request: { header(name: string): string | undefined },
  environment: NodeJS.ProcessEnv = process.env
): string | null {
  const forwarded = request.header('x-forwarded-email');
  const local = environment.NODE_ENV === 'development' ? environment.LOCAL_DEV_EMAIL : undefined;
  const parsed = Email.safeParse((forwarded ?? local)?.trim().toLowerCase());
  return parsed.success ? parsed.data : null;
}

export function setupMicrosoftProfileRoutes(appkit: AppKitWithServer): void {
  const graph = createGraphClient();
  appkit.server.extend((app) => {
    app.get('/api/microsoft/profile', async (request, response) => {
      response.setHeader('Cache-Control', 'private, no-store');
      if (!graph.isConfigured()) {
        response.status(503).json({ code: 'unavailable', error: 'Microsoft profile is not configured' });
        return;
      }
      const email = currentProfileEmail(request);
      if (!email) {
        response.status(401).json({ code: 'unauthorized', error: 'Signed-in identity is unavailable' });
        return;
      }
      try {
        response.json(await graph.getProfile(email));
      } catch (error) {
        if (error instanceof GraphRequestError && error.kind === 'not_found') {
          response.status(404).json({ code: 'no_match', error: 'No matching Microsoft profile was found' });
          return;
        }
        if (error instanceof GraphRequestError && error.kind === 'denied') {
          response.status(403).json({ code: 'permission_denied', error: 'Microsoft profile access is not granted' });
          return;
        }
        response.status(502).json({ code: 'connection_error', error: 'Microsoft profile could not be loaded' });
      }
    });

    app.get('/api/microsoft/profile/photo', async (request, response) => {
      response.setHeader('Cache-Control', 'private, no-store');
      if (!graph.isConfigured()) {
        response.status(503).end();
        return;
      }
      const email = currentProfileEmail(request);
      if (!email) {
        response.status(401).end();
        return;
      }
      try {
        const photo = await graph.getPhoto(email);
        if (!photo) {
          response.status(404).end();
          return;
        }
        response.setHeader('Content-Type', photo.contentType);
        response.setHeader('X-Content-Type-Options', 'nosniff');
        response.send(Buffer.from(photo.bytes));
      } catch {
        response.status(502).end();
      }
    });
  });
}
