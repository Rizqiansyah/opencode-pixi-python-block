#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/opencode"
PLUGIN_DIR="$CONFIG_DIR/plugins/opencode-pixi-python-block"
CONFIG_PATH="$CONFIG_DIR/opencode.jsonc"
PLUGIN_REF="./plugins/opencode-pixi-python-block/plugin.js"

mkdir -p "$PLUGIN_DIR"
cp "$REPO_DIR/plugin.js" "$PLUGIN_DIR/plugin.js"
cp "$REPO_DIR/package.json" "$PLUGIN_DIR/package.json"

node "$REPO_DIR/scripts/add-plugin-to-config.mjs" "$CONFIG_PATH" "$PLUGIN_REF"

echo "Installed OpenCode plugin at: $PLUGIN_DIR"
echo "Configured plugin entry: $PLUGIN_REF"
echo "Restart OpenCode session after install."
