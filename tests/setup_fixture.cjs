'use strict';
const fs = require('node:fs');
const path = require('node:path');
const tool = process.argv[2];
const args = process.argv.slice(3);
const dir = process.env.FDE_TEST_DIR;
const config = JSON.parse(fs.readFileSync(path.join(dir, 'config.json')));
const statePath = path.join(dir, 'state.json');
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath)) : {};
fs.appendFileSync(path.join(dir, 'calls.jsonl'), JSON.stringify([tool, ...args]) + '\n');
const out = (value) => console.log(typeof value === 'string' ? value : JSON.stringify(value));
const save = () => fs.writeFileSync(statePath, JSON.stringify(state));
const starts = (...prefix) => prefix.every((s, i) => args[i] === s);
if (config.timeoutTool === tool && !starts('--version')) {
  setTimeout(() => {}, 60000);
} else if (tool === 'node' && starts('-p')) {
  out(config.nodePlatform || (String(config.platform).startsWith('MINGW') ? 'win32' : 'darwin'));
} else if (starts('--version')) {
  out(
    {
      node: 'v' + (config.nodeVersion || '22.20.0'),
      npm: '10.9.0',
      git: 'git version 2.50.0',
      gh: 'gh version 2.80.0',
      databricks: 'Databricks CLI v' + (config.dbVersion || '1.16.1'),
      codex: 'codex-cli 0.120.0',
      code: '1.104.0',
    }[tool] || '1.0.0'
  );
} else if (tool === 'uname') out(config.platform || 'Darwin');
else if (tool === 'git') {
  if (starts('config', '--get') && !config.missingAuthor) out('present');
  else process.exitCode = 1;
} else if (tool === 'gh') {
  if (config.ghFailure) {
    console.error('SECRET-TOKEN-DO-NOT-PRINT');
    process.exitCode = 1;
  } else out('Authenticated');
} else if (tool === 'databricks') {
  if (args.includes('--help')) out('--agents --scope --profile');
  else if (starts('auth', 'profiles'))
    out({
      profiles: [
        { name: 'Team Profile', host: 'https://workspace.example' },
        { name: 'DEFAULT', host: 'https://default.example' },
      ],
    });
  else if (starts('current-user', 'me')) {
    if (config.dbAuthFailure) {
      console.error('SECRET-TOKEN-DO-NOT-PRINT');
      process.exitCode = 1;
    } else out({ id: '123', userName: 'fde@example.test' });
  } else if (starts('aitools', 'list')) {
    if (config.skillsNetworkFailure) process.exitCode = 1;
    else if (config.skillsSchemaChange)
      out({ agents: [{ name: 'codex', installed: { global: { delivery: 'unknown' } } }] });
    else
      out({
        agents: [
          {
            name: 'codex',
            installed:
              config.missingSkills && !state.skills ? {} : { global: { delivery: 'plugin', version: '0.2.17' } },
          },
        ],
      });
  } else if (starts('aitools', 'install')) {
    if (config.installFailure) process.exitCode = 1;
    else {
      state.skills = true;
      save();
      out({ status: 'installed' });
    }
  } else {
    out('UNEXPECTED DATABRICKS ACTION');
    process.exitCode = 1;
  }
} else if (tool === 'code') {
  if (starts('--list-extensions'))
    out(config.missingExtension && !state.extension ? 'unrelated.extension' : 'unrelated.extension\nopenai.chatgpt');
  else if (starts('--install-extension')) {
    state.extension = true;
    save();
  }
} else if (tool === 'codex') {
  if (starts('mcp', 'list')) {
    if (config.malformedMcp) out('SECRET-TOKEN-DO-NOT-PRINT');
    else
      out(
        config.missingMcp && !state.mcp
          ? []
          : [
              {
                name: 'unrelated',
                enabled: true,
                transport: { type: 'streamable_http', url: 'https://unrelated.example' },
              },
              {
                name: 'devhub-docs',
                enabled: true,
                transport: {
                  type: 'streamable_http',
                  url: config.mcpConflict ? 'https://custom.example' : 'https://developers.databricks.com/api/mcp',
                },
              },
            ]
      );
  } else if (starts('mcp', 'add')) {
    if (config.installFailure) process.exitCode = 1;
    else {
      state.mcp = true;
      save();
    }
  }
} else if (tool === 'brew' || tool === 'winget') {
  if (config.installFailure) {
    console.error('SECRET-TOKEN-DO-NOT-PRINT');
    process.exitCode = 1;
  } else if (!config.restartRequired) {
    // Package installation makes a previously missing executable available.
    fs.copyFileSync(path.join(dir, 'template-gh'), path.join(dir, 'bin', 'gh'));
    fs.chmodSync(path.join(dir, 'bin', 'gh'), 0o755);
  }
} else process.exitCode = 1;
