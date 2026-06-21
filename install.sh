#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Install a skill from this repository into Codex/Cloud-compatible skills directory.

Usage:
  ./install.sh <skill-name> [--force]

Examples:
  ./install.sh risk-oriented-code-review
  ./install.sh risk-oriented-code-review --force
  SKILLS_DIR=/custom/skills ./install.sh risk-oriented-code-review

Environment:
  SKILLS_DIR        Override the destination skills directory.
  CODEX_HOME        Used to derive the default destination when SKILLS_DIR is unset.
                    Defaults to ~/.codex when CODEX_HOME is unset.
  SKILLS_REPO_URL   Optional git URL or local path used when the script is run
                    outside this repository, such as via curl | bash.
USAGE
}

fail() {
  echo "Error: $*" >&2
  exit 1
}

script_source="${BASH_SOURCE[0]:-$0}"
if [[ -f "$script_source" ]]; then
  repo_root="$(cd "$(dirname "$script_source")" && pwd)"
else
  repo_root="$(pwd)"
fi
temp_repo=""
skill_name=""
force="false"

while [[ $# -gt 0 ]]; do
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --force)
      force="true"
      shift
      ;;
    --*)
      fail "unknown option: $1"
      ;;
    *)
      if [[ -n "$skill_name" ]]; then
        fail "only one skill name can be provided"
      fi
      skill_name="$1"
      shift
      ;;
  esac
done

[[ -n "$skill_name" ]] || { usage; fail "missing skill name"; }
[[ "$skill_name" != *"/"* && "$skill_name" != *".."* ]] || fail "invalid skill name: $skill_name"

source_dir="$repo_root/skills/$skill_name"

if [[ ! -d "$source_dir" && -n "${SKILLS_REPO_URL:-}" ]]; then
  temp_repo="$(mktemp -d)"
  cleanup() {
    [[ -z "$temp_repo" ]] || rm -rf "$temp_repo"
  }
  trap cleanup EXIT

  if [[ -d "$SKILLS_REPO_URL" ]]; then
    cp -R "$SKILLS_REPO_URL/." "$temp_repo/"
  else
    command -v git >/dev/null 2>&1 || fail "git is required to clone SKILLS_REPO_URL"
    git clone --depth 1 "$SKILLS_REPO_URL" "$temp_repo" >/dev/null
  fi

  repo_root="$temp_repo"
  source_dir="$repo_root/skills/$skill_name"
fi

[[ -d "$source_dir" ]] || fail "skill not found: $skill_name. Run from the repository root, or set SKILLS_REPO_URL when using curl | bash."
[[ -f "$source_dir/SKILL.md" ]] || fail "skill is missing SKILL.md: $source_dir"

if [[ -n "${SKILLS_DIR:-}" ]]; then
  dest_root="$SKILLS_DIR"
elif [[ -n "${CODEX_HOME:-}" ]]; then
  dest_root="$CODEX_HOME/skills"
else
  dest_root="$HOME/.codex/skills"
fi

dest_dir="$dest_root/$skill_name"

mkdir -p "$dest_root"

if [[ -e "$dest_dir" ]]; then
  if [[ "$force" != "true" ]]; then
    fail "destination already exists: $dest_dir (use --force to overwrite)"
  fi
  rm -rf "$dest_dir"
fi

cp -R "$source_dir" "$dest_dir"

cat <<EOF_DONE
Installed skill: $skill_name
Destination: $dest_dir

Next steps:
  1. Restart Codex/Cloud session if it does not pick up new skills automatically.
  2. Ask the agent to use the '$skill_name' skill when the task matches its description.
EOF_DONE
