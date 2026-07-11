#!/usr/bin/env bash
set -euo pipefail

message="${*:-}"

if [ -z "$message" ]; then
  exit 0
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
config_dir="$repo_root/.agentvibes/config"
mute_flag="$config_dir/muted"

if [ -f "$mute_flag" ]; then
  printf 'TTS muted: %s\n' "$message" >&2
  exit 0
fi

pretext=""
config_file="$config_dir/agentvibes.json"
if [ -f "$config_file" ] && command -v python3 >/dev/null 2>&1; then
  pretext="$(python3 - "$config_file" <<'PY' 2>/dev/null || true
import json
import sys

try:
    with open(sys.argv[1], "r", encoding="utf-8") as f:
        data = json.load(f)
    print(data.get("pretext", "") or "")
except Exception:
    pass
PY
)"
fi

if [ -n "$pretext" ]; then
  message="$pretext: $message"
fi

# Keep spoken output compact and strip control characters that can make TTS odd.
message="$(printf '%s' "$message" | tr '\n\r\t' '   ' | tr -cd '[:print:] ')"
message="${message:0:500}"

if command -v say >/dev/null 2>&1; then
  # Run in the background so hooks don't block Codex work.
  say "$message" >/dev/null 2>&1 &
  disown 2>/dev/null || true
  exit 0
fi

printf 'TTS unavailable: %s\n' "$message" >&2
exit 0
