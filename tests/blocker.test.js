import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyBlockedCommand, buildBlockMessage } from '../src/blocker.js';

const blocked = [
  'python',
  'python script.py',
  'python3 -m pytest',
  '/usr/bin/python3 foo.py',
  'PYTHONUNBUFFERED=1 python -m pytest',
  'env FOO=bar python3 app.py',
  'sudo python3 -m pytest',
  'bash -lc "python -m pytest"',
  "sh -lc 'python3 app.py'",
];

for (const command of blocked) {
  test(`blocks: ${command}`, () => {
    const result = classifyBlockedCommand(command);
    assert.equal(result.blocked, true);
    assert.match(buildBlockMessage(result), /pixi run python/);
  });
}

const allowed = [
  'pixi run python -m pytest',
  'python-build --help',
  './python script.py',
  'uv run python -m pytest',
  'bash -lc "pixi run python -m pytest"',
  'echo python3',
  '',
];

for (const command of allowed) {
  test(`allows: ${command || '<empty>'}`, () => {
    const result = classifyBlockedCommand(command);
    assert.equal(result.blocked, false);
  });
}
