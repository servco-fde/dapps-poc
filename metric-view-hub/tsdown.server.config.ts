import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'server/server.ts',
  unbundle: false,
  // Keep package imports external while bundling resolved Windows application paths.
  external: (id) => !id.startsWith('.') && !id.startsWith('/') && !/^[A-Za-z]:[\\/]/.test(id),
  tsconfig: 'tsconfig.server.json',
  outExtensions: () => ({
    js: '.js',
  }),
});
