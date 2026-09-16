import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const configPath = fileURLToPath(new URL('../databricks.yml', import.meta.url));
const config = readFileSync(configPath, 'utf8');

function targetBlock(name: string): string {
  const lines = config.split(/\r?\n/);
  const start = lines.findIndex((line) => line === `  ${name}:`);

  if (start === -1) {
    return '';
  }

  const endOffset = lines.slice(start + 1).findIndex((line) => /^ {2}[a-zA-Z0-9_-]+:$/.test(line));
  const end = endOffset === -1 ? lines.length : start + 1 + endOffset;
  return lines.slice(start, end).join('\n');
}

describe('Databricks deployment targets', () => {
  it('preserves the development target and its bindings', () => {
    const development = targetBlock('default');

    expect(development).toContain('default: true');
    expect(development).toContain('https://adb-4192082222593323.3.azuredatabricks.net');
    expect(development).toContain('sql_warehouse_id: d789a5e994a1ea33');
    expect(development).toContain('postgres_project: projects/metric-view-hub');
  });

  it('keeps the BA target isolated from development resource values', () => {
    const ba = targetBlock('hawaii-ba');

    expect(ba).toContain('https://adb-3146664464193453.13.azuredatabricks.net');
    expect(ba).not.toContain('adb-4192082222593323.3.azuredatabricks.net');
    expect(ba).not.toContain('d789a5e994a1ea33');
    expect(ba).not.toContain('variables:');
  });

  it('retains the OBO scope and least-required app resource permissions', () => {
    expect(config).toMatch(/user_api_scopes:\s*\n\s*- sql/);
    expect(config).toContain('permission: CAN_USE');
    expect(config).toContain('permission: CAN_CONNECT_AND_CREATE');
  });
});
