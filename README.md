# opencode-pixi-python-block

Small OpenCode plugin. Purpose: block `python` and `python3` shell calls, then tell agent to use Pixi.

Scope intentionally narrow.
- Blocks OpenCode `bash` tool calls when executable is `python`, `python3`, `/usr/bin/python`, or `/usr/bin/python3`
- Also catches simple nested shell forms like `bash -lc "python ..."`
- Does **not** rewrite commands
- Does **not** manage Pixi environments
- Does **not** touch non-`bash` tools

## Why

Prompt rules like `Python must use pixi.` are advisory only.
This plugin adds hard failure with explicit hint.

## Install

```bash
git clone https://github.com/Rizqiansyah/opencode-pixi-python-block.git
cd opencode-pixi-python-block
bash install.sh
```

Installer actions:
1. Copies plugin into `~/.config/opencode/plugins/opencode-pixi-python-block/`
2. Adds plugin entry to `~/.config/opencode/opencode.jsonc`
3. Leaves `opencode.jsonc.bak` backup when config changed

Then restart OpenCode session.

## Uninstall

```bash
cd opencode-pixi-python-block
bash uninstall.sh
```

## Block message

When blocked, agent sees message like:

```text
Blocked: python3 is deliberately disabled for OpenCode shell execution. Reason: this project must use Pixi-managed Python environments, not bare python/python3. Use: pixi run python ... Example: pixi run python -m pytest
```

## Development

Run tests:

```bash
npm test
```

## Notes

Current OpenCode plugin arg-rewrite behavior is not reliable across versions. This plugin only blocks and hints. It does not attempt command mutation.

## License

MIT
