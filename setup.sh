#!/usr/bin/env bash
# FDE workstation checks and opt-in repairs. Bash 3.2 / Windows Git Bash.
# Keep this file together with scripts/setup-json.cjs. No project dependencies needed.
set -u
set -o pipefail

usage() {
  cat <<'HELP'
Usage: bash setup.sh [--check | --install] [--yes] [--profile NAME]
  --check        Non-interactive diagnostics (default). No installs or logins.
  --install      Review and confirm missing-tool/integration repairs.
  --yes          Authorize those repairs without per-action prompts; requires --install.
                 Includes package/source agreements. Does not select accounts,
                 log in, change SSH trust, or overwrite conflicting MCP settings.
  --profile NAME Explicit Databricks profile; names with spaces must be quoted.
  --help         Show this help without checks or changes.

macOS: run with Bash from Terminal. Windows: install Git for Windows through
an approved route, open Git Bash, then run this command. WSL is not supported.
Homebrew/WinGet must already be available and permitted for automated repairs.
No automatic elevation, package-manager bootstrap, SDD-framework requirement,
project dependency installation, .env generation, or cloud resource mutations.
Check mode may access services through existing credentials (vendor caches may refresh).

Exit 0: AUTOMATED_CHECKS_PASSED; manual/project checks can remain.
Exit 2: required checks incomplete, policy/network blocked, or unsupported OS.
Exit 1: invalid invocation or internal failure.
FDE_SETUP_TIMEOUT_SECONDS: per-check deadline, 1..300 (default 30).
HELP
}
invalid() { printf 'ERROR: %s\n' "$1" >&2; exit 1; }
mode=check; explicit_mode=; assume_yes=0; profile=; want_help=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --check|--install)
      selected=${1#--}
      [ -z "$explicit_mode" ] || [ "$explicit_mode" = "$selected" ] || invalid 'Choose --check or --install.'
      explicit_mode=$selected; mode=$selected ;;
    --yes) assume_yes=1 ;;
    --profile)
      [ "$#" -ge 2 ] || invalid '--profile requires a name.'
      case "$2" in ''|--*|*$'\n'*|*$'\r'*) invalid 'Invalid profile name.' ;; esac
      profile=$2; shift ;;
    --help|-h) want_help=1 ;;
    *) invalid "Unknown option. Use --help." ;;
  esac
  shift
done
[ "$assume_yes" = 0 ] || [ "$mode" = install ] || invalid '--yes requires --install.'
[ "$want_help" = 0 ] || { usage; exit 0; }
timeout=${FDE_SETUP_TIMEOUT_SECONDS:-30}
case "$timeout" in ''|*[!0-9]*|0*) invalid 'FDE_SETUP_TIMEOUT_SECONDS must be 1..300.' ;; esac
[ "${#timeout}" -le 3 ] && [ "$timeout" -le 300 ] || invalid 'FDE_SETUP_TIMEOUT_SECONDS must be 1..300.'
script_dir=$(CDPATH= cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd) || exit 1
json_helper="$script_dir/scripts/setup-json.cjs"
[ -f "$json_helper" ] || invalid 'Missing scripts/setup-json.cjs; obtain the complete setup distribution.'
case "$(uname -s)" in
  Darwin) platform=macos ;;
  MINGW*|MSYS*) platform=windows ;;
  *) printf 'ACTION_REQUIRED | platform | Use macOS Bash or Windows Git Bash; WSL/Linux are outside this version.\n'; exit 2 ;;
esac

# Private, short-lived command output. Never echo raw vendor output or secrets.
umask 077
tmp=$(mktemp -d "${TMPDIR:-/tmp}/fde-setup.XXXXXX") || invalid 'Cannot create temporary workspace.'
cmd_pid=; timer_pid=
cleanup() {
  [ -z "$cmd_pid" ] || kill -KILL -- "-$cmd_pid" 2>/dev/null || :
  [ -z "$timer_pid" ] || kill -KILL -- "-$timer_pid" 2>/dev/null || :
  rm -rf -- "$tmp"
}
trap cleanup EXIT
trap 'exit 1' INT TERM
# Give each command/watchdog its own process group for bounded child cleanup.
set -m
run() {
  local limit=$1 rc=0
  shift
  rm -f -- "$tmp/timed-out"
  ( "$@" < /dev/null > "$tmp/output" 2> "$tmp/error" ) &
  cmd_pid=$!
  ( sleep "$limit"; : > "$tmp/timed-out"; kill -KILL -- "-$cmd_pid" 2>/dev/null || : ) &
  timer_pid=$!
  wait "$cmd_pid" 2>/dev/null || rc=$?
  kill -KILL -- "-$timer_pid" 2>/dev/null || :
  wait "$timer_pid" 2>/dev/null || :
  cmd_pid=; timer_pid=
  if [ -f "$tmp/timed-out" ]; then rc=124; fi
  return "$rc"
}
incomplete=0
report() {
  printf '%s | %s | %s\n' "$1" "$2" "$3"
  case "$1" in ACTION_REQUIRED|ERROR) incomplete=1 ;; esac
}
confirm() {
  local answer=
  [ "$mode" = install ] || return 1
  [ "$assume_yes" = 0 ] || return 0
  [ -t 0 ] || return 1
  printf '%s [y/N] ' "$1"
  IFS= read -r answer || return 1
  case "$answer" in y|Y|yes|YES) return 0 ;; *) return 1 ;; esac
}
repair() {
  local title=$1
  shift
  [ "$mode" = install ] || return 1
  printf 'Proposed repair: %s\n  ' "$title"
  printf '%q ' "$@"; printf '\n'
  confirm 'Run this repair using your company-approved installation route?' || return 1
  if run 600 "$@"; then
    hash -r
    return 0
  fi
  report ACTION_REQUIRED "$title" 'Repair failed or timed out. Use your company portal/administrator or rerun the displayed command to diagnose. A restart may be needed; rerun checks in a new terminal. No elevation or policy bypass attempted.'
  return 1
}
# Only missing tools use automatic package installs. Existing incompatible tools
# may be managed by nvm/asdf/IT; their update is deliberately a manual repair.
install_tool() {
  local tool=$1 formula= package=
  case "$tool" in
    git) formula=git; package=Git.Git ;;
    gh) formula=gh; package=GitHub.cli ;;
    databricks) formula=databricks/tap/databricks; package=Databricks.DatabricksCLI ;;
    node) formula=node; package=OpenJS.NodeJS.LTS ;;
    code) formula=visual-studio-code; package=Microsoft.VisualStudioCode ;;
    codex)
      command -v npm >/dev/null 2>&1 || return 1
      repair 'Install Codex CLI' npm install --global @openai/codex
      return $? ;;
    *) return 1 ;;
  esac
  if [ "$platform" = macos ] && command -v brew >/dev/null 2>&1; then
    # Noninteractive Homebrew fails rather than asking sudo for a password.
    if [ "$tool" = code ]; then
      repair "Install $tool" env NONINTERACTIVE=1 HOMEBREW_NO_AUTO_UPDATE=1 brew install --cask "$formula"
    else
      repair "Install $tool" env NONINTERACTIVE=1 HOMEBREW_NO_AUTO_UPDATE=1 brew install "$formula"
    fi
  elif [ "$platform" = windows ] && command -v winget >/dev/null 2>&1; then
    # User scope prevents machine-wide elevation. Packages without a user installer
    # intentionally fall back to an IT/manual installation route.
    repair "Install $tool (user scope; accept package/source agreements)" winget install --id "$package" --exact --source winget --scope user --silent --disable-interactivity --accept-package-agreements --accept-source-agreements
  else
    return 1
  fi
}
version_of() {
  local line
  line=$(LC_ALL=C sed -nE 's/^[^0-9]*([0-9]+\.[0-9]+\.[0-9]+).*/\1/p' "$tmp/output" | head -n 1)
  [ -n "$line" ] || return 1
  printf '%s' "$line"
}
at_least() {
  local current=$1 minimum=$2 c1 c2 c3 m1 m2 m3
  IFS=. read -r c1 c2 c3 <<< "$current"
  IFS=. read -r m1 m2 m3 <<< "$minimum"
  [ "$((10#$c1))" -gt "$((10#$m1))" ] || {
    [ "$((10#$c1))" -eq "$((10#$m1))" ] && {
      [ "$((10#$c2))" -gt "$((10#$m2))" ] || {
        [ "$((10#$c2))" -eq "$((10#$m2))" ] && [ "$((10#$c3))" -ge "$((10#$m3))" ]
      }
    }
  }
}
check_tool() {
  local tool=$1 minimum=$2 version paths
  if ! command -v "$tool" >/dev/null 2>&1; then install_tool "$tool" || :; fi
  if ! command -v "$tool" >/dev/null 2>&1; then
    report ACTION_REQUIRED "$tool" "Not on PATH. Install through an approved route; open a new terminal if just installed. Minimum $minimum."
    return 1
  fi
  paths=$(type -a -p "$tool" | awk '!seen[$0]++')
  case "$paths" in *$'\n'*) report MANUAL "$tool paths" "Multiple executables: ${paths//$'\n'/; }. Check PATH precedence if versions conflict." ;; esac
  if ! run "$timeout" "$tool" --version || ! version=$(version_of); then
    report ACTION_REQUIRED "$tool" "Executable present but version check failed. Inspect PATH and your installation of $tool."
    return 1
  fi
  if ! at_least "$version" "$minimum"; then
    report ACTION_REQUIRED "$tool" "$version is below $minimum. Update through its existing package/version manager or IT; setup preserves existing installations."
    return 1
  fi
  report PASS "$tool" "$version (minimum $minimum)"
}
json() { node "$json_helper" "$@"; }

printf 'FDE setup | platform=%s | mode=%s\n' "$platform" "$mode"
if [ "$mode" = install ] && [ "$assume_yes" = 0 ] && [ ! -t 0 ]; then
  report ACTION_REQUIRED install 'Non-interactive input: no changes made. Proposed actions are missing-tool installs and Codex skills/MCP repairs. Run --check for gaps, then use an interactive terminal or --install --yes to authorize repairs.'
  exit 2
fi
node_ready=0; db_ready=0; gh_ready=0; codex_ready=0; git_ready=0; code_bin=
check_tool node 22.0.0 && node_ready=1
if [ "$platform" = windows ] && [ "$node_ready" = 1 ]; then
  if ! run "$timeout" node -p process.platform || [ "$(tr -d '\r\n' < "$tmp/output")" != win32 ]; then
    report ACTION_REQUIRED 'Node.js platform' 'Use native Windows Node.js on the Git Bash PATH, not a WSL/Linux runtime.'
    node_ready=0
  fi
fi
check_tool npm 1.0.0 || :
check_tool git 2.0.0 && git_ready=1
check_tool gh 2.0.0 && gh_ready=1
check_tool databricks 1.0.0 && db_ready=1
check_tool codex 0.1.0 && codex_ready=1

# Locate the editor without installing a duplicate when its launcher is absent.
find_code() {
  local candidate base
  if command -v code >/dev/null 2>&1; then code_bin=$(command -v code); return; fi
  if [ "$platform" = macos ]; then
    for base in "$HOME/Applications" /Applications; do
      candidate="$base/Visual Studio Code.app/Contents/Resources/app/bin/code"
      if [ -f "$candidate" ]; then code_bin=$candidate; return; fi
    done
  else
    for base in "${LOCALAPPDATA:-}" "${ProgramFiles:-}"; do
      [ -n "$base" ] || continue
      if command -v cygpath >/dev/null 2>&1; then base=$(cygpath -u "$base"); fi
      for candidate in "$base/Programs/Microsoft VS Code/bin/code" "$base/Microsoft VS Code/bin/code"; do
        if [ -f "$candidate" ]; then code_bin=$candidate; return; fi
      done
    done
  fi
}
find_code
if [ -z "$code_bin" ]; then install_tool code || :; find_code; fi
if [ -n "$code_bin" ] && run "$timeout" "$code_bin" --version && version=$(version_of); then
  report PASS 'VS Code' "$version; launcher found"
  if run "$timeout" "$code_bin" --list-extensions; then
    if ! tr -d '\r' < "$tmp/output" | grep -Fxiq 'openai.chatgpt'; then
      repair 'Install Codex VS Code extension' "$code_bin" --install-extension openai.chatgpt || :
      run "$timeout" "$code_bin" --list-extensions || : > "$tmp/output"
    fi
    if tr -d '\r' < "$tmp/output" | grep -Fxiq 'openai.chatgpt'; then
      report PASS 'Codex editor extension' 'openai.chatgpt is registered in the default VS Code profile.'
    else
      report ACTION_REQUIRED 'Codex editor extension' 'Install openai.chatgpt in VS Code, or select the default VS Code profile for CLI verification.'
    fi
  else
    report MANUAL 'Codex editor extension' 'CLI extension listing unavailable. Verify Codex in the VS Code profile you use.'
  fi
else
  report ACTION_REQUIRED 'VS Code' 'Locate/install VS Code through an approved route and verify its launcher. Existing installations outside standard locations may need code on PATH.'
fi
report MANUAL 'Editor access' 'Open VS Code and Codex, sign in through your approved account, and verify access in the editor profile you use.'

if [ "$git_ready" = 1 ]; then
  if run "$timeout" git config --get user.name && [ -s "$tmp/output" ] && run "$timeout" git config --get user.email && [ -s "$tmp/output" ]; then
    report PASS 'Git author' 'Effective user.name and user.email are set; verify they are your intended commit identity.'
  else
    report ACTION_REQUIRED 'Git author' 'Set your own git user.name and user.email at the intended repository/global scope. No identity inferred.'
  fi
fi
if [ "$gh_ready" = 1 ]; then
  # `gh auth status --active` was added after some still-supported gh 2.x
  # releases. The API call verifies the currently selected account across gh 2.x.
  if run "$timeout" gh api --hostname github.com user; then
    report PASS 'GitHub authentication' 'Selected github.com account can call the API. Confirm the intended account with gh auth status.'
  else
    report ACTION_REQUIRED 'GitHub authentication' 'Run gh auth status, then explicitly authenticate/switch the intended account. Check network access if the API call fails.'
  fi
fi
report MANUAL 'Git transport' 'Verify your chosen remote and transport separately. For SSH use ssh -T git@github.com after independently verifying the host key; successful GitHub authentication can return exit 1. API authentication does not prove repository access.'

if [ "$node_ready" = 1 ] && [ "$db_ready" = 1 ]; then
  # Only help commands here: no manifest/resource discovery or implicit profile.
  if run "$timeout" databricks apps run-local --help && run "$timeout" databricks aitools install --help && grep -q -- '--agents' "$tmp/output"; then
    report PASS 'Databricks command surface' 'Apps run-local and agent-scoped AI-tools installation available.'
  else
    report ACTION_REQUIRED 'Databricks command surface' 'Update the modern CLI through its existing installation route; Apps run-local and aitools --agents are required.'
  fi
  if run "$timeout" databricks auth profiles --skip-validate -o json; then
    cp "$tmp/output" "$tmp/profiles.json"
    if json profiles "$tmp/profiles.json" > "$tmp/profile-display"; then
      printf 'Available Databricks profiles (not auto-selected):\n'
      cat "$tmp/profile-display"
      if [ -z "$profile" ] && [ "$mode" = install ] && [ -t 0 ]; then
        printf 'Type the exact profile name to select it (Enter to skip): '
        IFS= read -r profile || profile=
      fi
      if [ -n "$profile" ] && json profile-exists "$tmp/profiles.json" "$profile"; then
        if run "$timeout" databricks current-user me --profile "$profile" -o json && identity=$(json identity "$tmp/output"); then
          report PASS 'Databricks authentication' "Selected profile authenticated as $identity. Resource permissions are not verified."
        else
          report ACTION_REQUIRED 'Databricks authentication' 'Selected-profile lookup failed or timed out. Verify connectivity and explicitly reauthenticate with databricks auth login --profile NAME --host WORKSPACE_URL.'
        fi
      else
        report ACTION_REQUIRED 'Databricks profile' 'Supply --profile with an exact listed name. To create one, run databricks auth login --profile NAME --host WORKSPACE_URL yourself; DEFAULT and environment settings are not selected automatically.'
      fi
    else
      report ACTION_REQUIRED 'Databricks profiles' 'Unrecognized profile response; update/check the CLI. Raw configuration was not printed.'
    fi
  else
    report ACTION_REQUIRED 'Databricks profiles' 'Unable to list profiles; inspect CLI configuration. No fallback profile used.'
  fi
  if run "$timeout" databricks aitools list --scope global -o json; then
    skills_rc=0; skills=$(json skills "$tmp/output") || skills_rc=$?
    if [ "$skills_rc" = 2 ]; then
      if repair 'Install Databricks skills for Codex only' databricks aitools install --agents codex --scope global -o json; then
        skills_rc=1
        if run "$timeout" databricks aitools list --scope global -o json; then skills_rc=0; skills=$(json skills "$tmp/output") || skills_rc=$?; fi
      fi
    fi
    if [ "$skills_rc" = 0 ]; then
      report PASS 'Databricks skills' "Codex global $skills; restart Codex to load newly installed skills."
    else
      report ACTION_REQUIRED 'Databricks skills' 'Codex installation missing or status schema unrecognized. Verify databricks aitools list and its --agents codex installer; no other agents are targeted.'
    fi
  else
    report ACTION_REQUIRED 'Databricks skills' 'Status request failed or timed out (it needs network access). Retry with registry access; failure is not evidence that skills are absent.'
  fi
else
  report ACTION_REQUIRED 'Databricks integrations' 'Working Node.js 22+ and modern Databricks CLI are needed for structured checks. Repair prerequisites and rerun.'
fi
if [ "$node_ready" = 1 ] && [ "$codex_ready" = 1 ]; then
  if run "$timeout" codex mcp list --json && mcp_state=$(json mcp "$tmp/output"); then
    if [ "$mcp_state" = missing ]; then
      repair 'Register Developer Hub Docs MCP' codex mcp add devhub-docs --url https://developers.databricks.com/api/mcp || :
    elif [ "$mcp_state" = conflict ]; then
      # Replacing a registration can discard custom auth/headers. Leave the actual
      # replacement to an explicit CLI action by the operator, preserving that entry.
      report ACTION_REQUIRED 'Docs MCP conflict' 'devhub-docs exists with different/disabled settings. Review it in Codex and explicitly repair that entry yourself; --yes does not overwrite it.'
    fi
    if [ "$mcp_state" = missing ]; then
      if run "$timeout" codex mcp list --json; then mcp_state=$(json mcp "$tmp/output") || mcp_state=unknown; else mcp_state=unknown; fi
    fi
    if [ "$mcp_state" = ready ]; then
      report PASS 'Docs MCP registration' 'devhub-docs enabled at the expected HTTPS endpoint.'
    elif [ "$mcp_state" != conflict ]; then
      report ACTION_REQUIRED 'Docs MCP registration' 'Register devhub-docs with codex mcp add devhub-docs --url https://developers.databricks.com/api/mcp, then rerun.'
    fi
  else
    report ACTION_REQUIRED 'Docs MCP registration' 'Unable to inspect structured MCP registration. Verify codex mcp list --json; existing settings preserved.'
  fi
else
  report ACTION_REQUIRED 'Docs MCP registration' 'Working Node.js and Codex CLI are needed for structured MCP checks.'
fi
report MANUAL 'Live skills and Docs MCP' 'In a new Codex session, confirm Databricks skills are available and ask devhub-docs to list documentation pages. Registration alone is not a functional MCP test.'
printf '\nProject follow-ups (outside workstation checks):\n'
printf '%s\n' '  Choose your own SDD framework, if any; none is required by setup.' '  Establish your repository/remote and verify intended Git access.' '  Select app resources and confirm workspace, UC, warehouse, and optional Lakebase permissions.' '  Install project dependencies separately; create an ignored .env and unique developer schema.' '  Verify local app startup/data access, then verify deployed OBO behavior separately.'
if [ "$incomplete" = 0 ]; then
  printf '\nAUTOMATED_CHECKS_PASSED — complete the MANUAL and project follow-ups above.\n'
  exit 0
fi
printf '\nACTION_REQUIRED — resolve required checks and rerun; no full app readiness claim.\n'
exit 2
