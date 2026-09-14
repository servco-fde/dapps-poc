"""Isolated integration tests. Python is only a test-runner dependency, not setup's.
Run: python3 -m unittest discover -s tests -p 'test_setup.py' -v
"""
import json
import os
import pty
import select
import time
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
NODE = shutil.which('node')
BASH = '/bin/bash'

class SetupTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='fde setup test ')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.bin = self.root / 'bin'
        self.bin.mkdir()
        self.home = self.root / 'home'
        self.home.mkdir()
        self.config = {}
        # Isolated PATH: missing tools cannot fall through to the real workstation.
        for tool in ['bash', 'dirname', 'uname', 'mktemp', 'sleep', 'rm', 'sed', 'head',
                     'awk', 'tr', 'grep', 'cat', 'cp', 'env']:
            path = shutil.which(tool)
            if path:
                (self.bin / tool).symlink_to(path)
        self.tools = ['node', 'npm', 'git', 'gh', 'databricks', 'codex', 'code', 'brew', 'winget', 'uname']
        for tool in self.tools:
            p = self.bin / tool
            if p.exists(): p.unlink()
            p.write_text(self.wrapper(tool))
            p.chmod(0o755)
        (self.root / 'template-gh').write_text(self.wrapper('gh'))
        self.env = {k:v for k,v in os.environ.items() if not k.startswith(('DATABRICKS_', 'CODEX_', 'FDE_'))}
        self.env.update(PATH=str(self.bin), HOME=str(self.home), FDE_TEST_DIR=str(self.root),
                        FDE_SETUP_TIMEOUT_SECONDS='3', TMPDIR=str(self.root))
        self.sentinel = self.home / '.databrickscfg'
        self.sentinel.write_text('PRESERVE-EXISTING-CONFIG\n')

    def wrapper(self, tool):
        special = 'if [ "$1" != "--version" ] && [ "$1" != "-p" ]; then exec "' + NODE + '" "$@"; fi\n' if tool == 'node' else ''
        return '#!/bin/bash\n' + special + 'exec "' + NODE + '" "' + str(ROOT / 'tests/setup_fixture.cjs') + '" ' + tool + ' "$@"\n'

    def run_setup(self, *args, script=None):
        (self.root / 'config.json').write_text(json.dumps(self.config))
        result = subprocess.run([BASH, str(script or ROOT / 'setup.sh'), *args], env=self.env,
                                cwd=self.root, capture_output=True, text=True, timeout=20)
        self.assertNotIn('SECRET-TOKEN-DO-NOT-PRINT', result.stdout + result.stderr)
        self.assertEqual(self.sentinel.read_text(), 'PRESERVE-EXISTING-CONFIG\n')
        return result

    def calls(self):
        p = self.root / 'calls.jsonl'
        return [json.loads(line) for line in p.read_text().splitlines()] if p.exists() else []

    def assert_no_mutations(self):
        for call in self.calls():
            if '--help' in call: continue
            self.assertFalse(any(x in call for x in ['install', 'upgrade', 'login', 'add', 'remove', '--install-extension']), call)

    def test_ready_and_manual_limits(self):
        r = self.run_setup('--profile', 'Team Profile')
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn('AUTOMATED_CHECKS_PASSED', r.stdout)
        self.assertIn('MANUAL | Live skills', r.stdout)
        self.assertIn(['databricks', 'current-user', 'me', '--profile', 'Team Profile', '-o', 'json'], self.calls())
        self.assert_no_mutations()

    def test_no_profile_never_uses_default_or_environment(self):
        self.env['DATABRICKS_CONFIG_PROFILE'] = 'DEFAULT'
        r = self.run_setup()
        self.assertEqual(r.returncode, 2)
        self.assertNotIn('current-user', str(self.calls()))
        self.assert_no_mutations()

    def test_unknown_profile_never_falls_back(self):
        r = self.run_setup('--profile', 'Unknown')
        self.assertEqual(r.returncode, 2)
        self.assertNotIn('current-user', str(self.calls()))

    def test_invalid_options_do_not_execute_tools(self):
        for args in [('--check','--install'), ('--yes',), ('--profile',), ('--profile','--yes'), ('--bad',)]:
            with self.subTest(args=args):
                self.assertEqual(self.run_setup(*args).returncode, 1)
        self.assertEqual(self.calls(), [])

    def test_help_without_checks(self):
        self.assertEqual(self.run_setup('--help').returncode, 0)
        self.assertEqual(self.calls(), [])

    def test_noninteractive_install_no_hang_or_changes(self):
        self.assertEqual(self.run_setup('--install').returncode, 2)
        self.assert_no_mutations()

    def test_unsupported_linux_and_wsl(self):
        self.config['platform'] = 'Linux'
        r = self.run_setup('--install','--yes')
        self.assertEqual(r.returncode, 2)
        self.assert_no_mutations()

    def test_semantic_version_comparison_and_manual_upgrade(self):
        self.config.update(nodeVersion='9.99.0', dbVersion='0.294.0')
        r = self.run_setup('--install','--yes','--profile','Team Profile')
        self.assertEqual(r.returncode, 2)
        self.assertIn('9.99.0 is below 22.0.0', r.stdout)
        self.assertIn('0.294.0 is below 1.0.0', r.stdout)
        self.assertNotIn('upgrade', str(self.calls()))

    def test_missing_tool_check_mode(self):
        (self.bin / 'gh').unlink()
        r = self.run_setup('--profile','Team Profile')
        self.assertEqual(r.returncode, 2)
        self.assert_no_mutations()

    def test_homebrew_missing_tool_repaired(self):
        (self.bin / 'gh').unlink()
        r = self.run_setup('--install','--yes','--profile','Team Profile')
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn(['brew','install','gh'], self.calls())

    def test_windows_adapter_user_scope(self):
        self.config['platform'] = 'MINGW64_NT-10.0-26100'
        (self.bin / 'gh').unlink()
        r = self.run_setup('--install','--yes','--profile','Team Profile')
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        installs = [c for c in self.calls() if c[0]=='winget']
        self.assertEqual(len(installs), 1)
        self.assertIn('--scope', installs[0]); self.assertIn('user', installs[0])
        self.assertIn('--disable-interactivity', installs[0])
        self.assertFalse(any(c[0]=='brew' for c in self.calls()))

    def test_install_failure_and_restart_remain_incomplete(self):
        (self.bin / 'gh').unlink()
        for key in ['installFailure', 'restartRequired']:
            self.config = {key:True}
            r = self.run_setup('--install','--yes','--profile','Team Profile')
            self.assertEqual(r.returncode, 2)
            self.assertNotIn('AUTOMATED_CHECKS_PASSED', r.stdout)

    def test_no_package_manager_manual_route(self):
        for tool in ['gh','brew','winget']: (self.bin/tool).unlink()
        r = self.run_setup('--install','--yes','--profile','Team Profile')
        self.assertEqual(r.returncode, 2)
        self.assert_no_mutations()

    def test_integrations_repair_and_second_run(self):
        self.config.update(missingSkills=True, missingMcp=True, missingExtension=True)
        r = self.run_setup('--install','--yes','--profile','Team Profile')
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn(['databricks','aitools','install','--agents','codex','--scope','global','-o','json'], self.calls())
        (self.root/'calls.jsonl').unlink()
        self.assertEqual(self.run_setup('--install','--yes','--profile','Team Profile').returncode, 0)
        self.assert_no_mutations()

    def test_mcp_conflict_not_overwritten(self):
        self.config['mcpConflict'] = True
        r = self.run_setup('--install','--yes','--profile','Team Profile')
        self.assertEqual(r.returncode, 2)
        self.assert_no_mutations()

    def test_malformed_mcp_preserves_settings(self):
        self.config['malformedMcp'] = True
        self.assertEqual(self.run_setup('--install','--yes','--profile','Team Profile').returncode, 2)
        self.assert_no_mutations()

    def test_network_failure_is_not_missing_install(self):
        self.config.update(skillsNetworkFailure=True, ghFailure=True, dbAuthFailure=True)
        self.assertEqual(self.run_setup('--install','--yes','--profile','Team Profile').returncode, 2)
        self.assert_no_mutations()

    def test_changed_skills_schema_does_not_trigger_install(self):
        self.config['skillsSchemaChange'] = True
        self.assertEqual(self.run_setup('--install','--yes','--profile','Team Profile').returncode, 2)
        self.assert_no_mutations()

    def test_timeout_bounded(self):
        self.config['timeoutTool']='gh'
        self.env['FDE_SETUP_TIMEOUT_SECONDS']='1'
        r = self.run_setup('--profile','Team Profile')
        self.assertEqual(r.returncode, 2)
        self.assertIn('GitHub authentication', r.stdout)

    def test_no_sdd_checks_and_independent_working_directory(self):
        for framework in ['reffy-cli','another-sdd','none']:
            (self.root/'package.json').write_text(json.dumps({'packageManager':'pnpm@10.0.0','dependencies':{framework:'1.0.0'}}))
            self.assertEqual(self.run_setup('--profile','Team Profile').returncode, 0)
        self.assertFalse(any(c[0] in ['reffy','pnpm','another-sdd'] for c in self.calls()))
        self.assert_no_mutations()

    def test_distribution_in_path_with_spaces(self):
        target = self.root / 'distribution with spaces'
        target.mkdir(); (target/'scripts').mkdir()
        shutil.copy(ROOT/'setup.sh',target/'setup.sh')
        shutil.copy(ROOT/'scripts/setup-json.cjs',target/'scripts/setup-json.cjs')
        r = self.run_setup('--profile','Team Profile',script=target/'setup.sh')
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)

    def test_missing_helper_internal_failure(self):
        target=self.root/'standalone.sh'
        shutil.copy(ROOT/'setup.sh',target)
        self.assertEqual(self.run_setup(script=target).returncode, 1)

    def test_interactive_repair_accept_and_decline(self):
        (self.bin / 'gh').unlink()
        for answer, expected in [('n', 2), ('y', 0)]:
            (self.root / 'config.json').write_text(json.dumps(self.config))
            master, slave = pty.openpty()
            process = subprocess.Popen([BASH, str(ROOT/'setup.sh'), '--install', '--profile', 'Team Profile'],
                                       env=self.env, cwd=self.root, stdin=slave, stdout=slave, stderr=slave)
            os.close(slave)
            output = b''
            try:
                os.write(master, (answer + '\n').encode())
                deadline = time.monotonic() + 20
                while time.monotonic() < deadline:
                    if select.select([master], [], [], 0.1)[0]:
                        try: output += os.read(master, 65536)
                        except OSError: break
                    if process.poll() is not None: break
                self.assertEqual(process.wait(timeout=2), expected, output.decode(errors='replace'))
            finally:
                if process.poll() is None: process.kill(); process.wait()
                os.close(master)
        self.assertIn(['brew','install','gh'], self.calls())

    def test_mac_editor_outside_path_is_not_duplicated(self):
        (self.bin/'code').unlink()
        editor=self.home/'Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
        editor.parent.mkdir(parents=True)
        editor.write_text(self.wrapper('code')); editor.chmod(0o755)
        result=self.run_setup('--install','--yes','--profile','Team Profile')
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertFalse(any(c[0]=='brew' for c in self.calls()))

    def test_native_windows_node_required(self):
        self.config.update(platform='MINGW64_NT-10.0', nodePlatform='linux')
        result=self.run_setup('--profile','Team Profile')
        self.assertEqual(result.returncode, 2)
        self.assertIn('native Windows Node.js', result.stdout)

    def test_only_read_only_databricks_actions(self):
        self.run_setup('--profile','Team Profile')
        for c in self.calls():
            if c[0]=='databricks':
                self.assertTrue('--help' in c or '--version' in c or c[1:3] in [['auth','profiles'], ['current-user','me'], ['aitools','list']], c)

if __name__ == '__main__': unittest.main()
