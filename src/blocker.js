const DIRECT_PYTHON = /^(?:python3?|\/usr\/bin\/python3?)$/;
const LEADING_WRAPPERS = new Set(['sudo', 'command', 'env', 'time', 'nice', 'nohup']);
const SHELLS = new Set(['bash', 'sh', 'zsh', 'fish']);

function splitShellWords(command) {
  const words = [];
  let current = '';
  let quote = null;
  let escaped = false;

  for (const ch of command) {
    if (escaped) {
      current += ch;
      escaped = false;
      continue;
    }

    if (ch === '\\') {
      escaped = true;
      current += ch;
      continue;
    }

    if (quote) {
      current += ch;
      if (ch === quote) quote = null;
      continue;
    }

    if (ch === '"' || ch === "'") {
      quote = ch;
      current += ch;
      continue;
    }

    if (/\s/.test(ch)) {
      if (current) {
        words.push(current);
        current = '';
      }
      continue;
    }

    current += ch;
  }

  if (current) words.push(current);
  return words;
}

function stripOuterQuotes(text) {
  if (text.length < 2) return text;
  const first = text[0];
  const last = text[text.length - 1];
  if ((first === '"' || first === "'") && first === last) {
    return text.slice(1, -1);
  }
  return text;
}

function unwrapNestedShell(words) {
  if (!words.length) return null;

  let idx = 0;
  while (idx < words.length) {
    const word = words[idx];
    if (LEADING_WRAPPERS.has(word)) {
      idx += 1;
      if (word === 'env') {
        while (idx < words.length && /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(words[idx])) idx += 1;
      }
      continue;
    }

    if (/^[A-Za-z_][A-Za-z0-9_]*=.*/.test(word)) {
      idx += 1;
      continue;
    }

    break;
  }

  const shell = words[idx];
  const flag = words[idx + 1];
  const payload = words[idx + 2];
  if (!SHELLS.has(shell) || flag !== '-lc' || !payload) return null;
  return stripOuterQuotes(payload);
}

function firstExecutable(words) {
  let idx = 0;

  while (idx < words.length) {
    const word = words[idx];
    if (LEADING_WRAPPERS.has(word)) {
      idx += 1;
      if (word === 'env') {
        while (idx < words.length && /^[A-Za-z_][A-Za-z0-9_]*=.*/.test(words[idx])) idx += 1;
      }
      continue;
    }

    if (/^[A-Za-z_][A-Za-z0-9_]*=.*/.test(word)) {
      idx += 1;
      continue;
    }

    return word;
  }

  return null;
}

function classifyOnce(command) {
  const words = splitShellWords(command.trim());
  if (!words.length) return { blocked: false };

  const nested = unwrapNestedShell(words);
  if (nested && nested !== command) return classifyOnce(nested);

  const executable = firstExecutable(words);
  if (!executable) return { blocked: false };

  if (!DIRECT_PYTHON.test(executable)) {
    return { blocked: false };
  }

  return {
    blocked: true,
    executable,
    command: command.trim(),
  };
}

export function classifyBlockedCommand(command) {
  if (typeof command !== 'string') return { blocked: false };
  return classifyOnce(command);
}

export function buildBlockMessage(match) {
  const executable = match?.executable || 'python';
  return [
    `Blocked: ${executable} is deliberately disabled for OpenCode shell execution.`,
    'Reason: this project must use Pixi-managed Python environments, not bare python/python3.',
    'Use: pixi run python ...',
    'Example: pixi run python -m pytest',
  ].join(' ');
}
