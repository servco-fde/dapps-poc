import { describe, expect, it, vi } from 'vitest';
import { createGraphClient, GraphRequestError } from './graph-client';

const environment = {
  MICROSOFT_GRAPH_TENANT_ID: '9dbf86ac-e706-4657-a4ab-4e7f21704abc',
  MICROSOFT_GRAPH_CLIENT_ID: 'de20878a-8ec2-4238-a2c6-ea756cc9bf60',
  MICROSOFT_GRAPH_CLIENT_SECRET: 'test-secret',
};

const token = () => Response.json({ access_token: 'test-token', expires_in: 3600 });

describe('Microsoft Graph profile client', () => {
  it('requests the selected user fields with an application token and reuses that token', async () => {
    const fetcher = vi.fn((input: string | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.includes('/oauth2/v2.0/token')) {
        expect(init?.body).toBeInstanceOf(URLSearchParams);
        expect((init?.body as URLSearchParams).get('scope')).toBe('https://graph.microsoft.com/.default');
        return Promise.resolve(token());
      }
      expect(url).toContain('/users/roberto.delgado%40servco.com?');
      expect(url).toContain('employeeId');
      expect(init?.headers).toEqual({ Authorization: 'Bearer test-token' });
      return Promise.resolve(Response.json({
        id: 'user-1',
        displayName: 'Roberto Delgado',
        mail: 'roberto.delgado@servco.com',
        userPrincipalName: 'roberto.delgado@servco.com',
        jobTitle: 'Engineer',
        department: 'Digital',
        employeeId: null,
        officeLocation: 'Honolulu',
        manager: { displayName: 'Someone else' },
      }));
    });
    const client = createGraphClient(environment, fetcher as typeof fetch);
    const first = await client.getProfile('roberto.delgado@servco.com');
    const second = await client.getProfile('roberto.delgado@servco.com');

    expect(first).toEqual({
      displayName: 'Roberto Delgado',
      email: 'roberto.delgado@servco.com',
      jobTitle: 'Engineer',
      department: 'Digital',
      employeeId: null,
      officeLocation: 'Honolulu',
    });
    expect(second).toEqual(first);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it('rejects a Graph user whose UPN does not match the trusted identity', async () => {
    const fetcher = vi.fn((input: string | URL) =>
      String(input).includes('/token')
        ? Promise.resolve(token())
        : Promise.resolve(Response.json({ id: 'user-2', userPrincipalName: 'different@servco.com' }))
    );
    const client = createGraphClient(environment, fetcher as typeof fetch);
    await expect(client.getProfile('roberto.delgado@servco.com')).rejects.toEqual(new GraphRequestError('not_found'));
  });

  it('treats a missing photo as optional and never fetches without configuration', async () => {
    const fetcher = vi.fn((input: string | URL) =>
      Promise.resolve(String(input).includes('/token') ? token() : new Response(null, { status: 404 }))
    );
    const client = createGraphClient(environment, fetcher as typeof fetch);
    expect(await client.getPhoto('roberto.delgado@servco.com')).toBeNull();

    const unconfigured = createGraphClient({}, fetcher as typeof fetch);
    expect(unconfigured.isConfigured()).toBe(false);
    await expect(unconfigured.getProfile('roberto.delgado@servco.com')).rejects.toEqual(
      new GraphRequestError('unavailable')
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
