#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
CONFIG_PATH="$CONFIG_DIR/opencode.jsonc"
PLUGIN_DIR="$CONFIG_DIR/plugins/opencode-pixi-python-block"
PLUGIN_REF="./plugins/opencode-pixi-python-block/plugin.js"

node "$REPO_DIR/scripts/remove-plugin-from-config.mjs" "$CONFIG_PATH" "$PLUGIN_REF"
rm -rf "$PLUGIN_DIR"

echo "Removed OpenCode plugin from: $PLUGIN_DIR"
echo "Restart OpenCode session after uninstall."
