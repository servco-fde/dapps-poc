import { describe, expect, it } from 'vitest';
import { currentProfileEmail } from './profile-routes';

const request = (forwarded?: string) => ({
  header: (name: string) => (name === 'x-forwarded-email' ? forwarded : undefined),
});

describe('current Microsoft profile identity', () => {
  it('uses the forwarded identity instead of a local fallback', () => {
    expect(currentProfileEmail(request('Roberto.Delgado@servco.com'), {
      NODE_ENV: 'development',
      LOCAL_DEV_EMAIL: 'other@servco.com',
    })).toBe('roberto.delgado@servco.com');
  });

  it('allows the documented local identity only in development', () => {
    expect(currentProfileEmail(request(), {
      NODE_ENV: 'development',
      LOCAL_DEV_EMAIL: 'roberto.delgado@servco.com',
    })).toBe('roberto.delgado@servco.com');
    expect(currentProfileEmail(request(), {
      NODE_ENV: 'production',
      LOCAL_DEV_EMAIL: 'roberto.delgado@servco.com',
    })).toBeNull();
  });

  it('fails closed for an invalid forwarded value', () => {
    expect(currentProfileEmail(request('not-an-email'), {
      NODE_ENV: 'development',
      LOCAL_DEV_EMAIL: 'roberto.delgado@servco.com',
    })).toBeNull();
  });
});
