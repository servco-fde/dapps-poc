// Narrow, allowlisted projections only: never print complete vendor responses.
'use strict';
const fs = require('node:fs');
const [mode, filename, argument] = process.argv.slice(2);
const clean = (value) =>
  String(value)
    .replace(/[\x00-\x1f\x7f]/g, ' ')
    .slice(0, 300);
try {
  const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
  switch (mode) {
    case 'profiles': {
      if (!Array.isArray(data.profiles)) throw Error('schema');
      for (const p of data.profiles) {
        if (typeof p.name !== 'string' || typeof p.host !== 'string') throw Error('schema');
        const host = new URL(p.host);
        if (!['https:', 'http:'].includes(host.protocol)) throw Error('schema');
        // Drop embedded credentials, query strings and paths from display.
        console.log(`${clean(p.name)}\t${host.origin}`);
      }
      break;
    }
    case 'profile-exists':
      if (!Array.isArray(data.profiles)) throw Error('schema');
      process.exit(data.profiles.some((p) => p.name === argument) ? 0 : 2);
      break;
    case 'identity':
      if (!data.id || typeof data.userName !== 'string') throw Error('schema');
      console.log(clean(data.userName));
      break;
    case 'skills': {
      if (!Array.isArray(data.agents)) throw Error('schema');
      const agent = data.agents.find((a) => a.name === 'codex');
      if (!agent || !agent.installed || typeof agent.installed !== 'object') throw Error('schema');
      const install = agent.installed.global;
      if (!install) process.exit(2);
      if (typeof install.version !== 'string' || !['plugin', 'skills'].includes(install.delivery))
        throw Error('schema');
      console.log(`${clean(install.delivery)} ${clean(install.version)}`);
      break;
    }
    case 'mcp': {
      if (
        !Array.isArray(data) ||
        data.some((e) => !e || typeof e.name !== 'string' || typeof e.enabled !== 'boolean' || !e.transport)
      )
        throw Error('schema');
      const entry = data.find((e) => e.name === 'devhub-docs');
      if (!entry) {
        console.log('missing');
        break;
      }
      console.log(
        entry.enabled === true &&
          entry.transport?.type === 'streamable_http' &&
          entry.transport?.url === 'https://developers.databricks.com/api/mcp'
          ? 'ready'
          : 'conflict'
      );
      break;
    }
    default:
      throw Error('mode');
  }
} catch {
  // No vendor payload or exception text: those can contain credentials.
  process.exitCode = 1;
}
