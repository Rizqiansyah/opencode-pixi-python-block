import test from 'node:test';
import assert from 'node:assert/strict';

import { PixiPythonBlockPlugin } from '../plugin.js';

test('plugin blocks bash python command with hint', async () => {
  const plugin = await PixiPythonBlockPlugin();

  await assert.rejects(
    plugin['tool.execute.before'](
      { tool: 'bash' },
      { args: { command: 'python3 -m pytest' } },
    ),
    /deliberately disabled.*pixi run python/i,
  );
});

test('plugin ignores non-bash tools', async () => {
  const plugin = await PixiPythonBlockPlugin();
  await assert.doesNotReject(async () => {
    await plugin['tool.execute.before'](
      { tool: 'read' },
      { args: { command: 'python3 -m pytest' } },
    );
  });
});

test('plugin allows pixi invocation', async () => {
  const plugin = await PixiPythonBlockPlugin();
  await assert.doesNotReject(async () => {
    await plugin['tool.execute.before'](
      { tool: 'bash' },
      { args: { command: 'pixi run python -m pytest' } },
    );
  });
});
