import fs from 'node:fs';
import path from 'node:path';

const [configPath, pluginRef] = process.argv.slice(2);
if (!configPath || !pluginRef) {
  console.error('usage: node scripts/add-plugin-to-config.mjs <configPath> <pluginRef>');
  process.exit(2);
}

const exists = fs.existsSync(configPath);
if (!exists) {
  const content = `{
  "$schema": "https://opencode.ai/config.json",
  "plugin": [
    ${JSON.stringify(pluginRef)}
  ]
}\n`;
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, content);
  console.log(`created ${configPath}`);
  process.exit(0);
}

const original = fs.readFileSync(configPath, 'utf8');
if (original.includes(JSON.stringify(pluginRef))) {
  console.log('plugin already configured');
  process.exit(0);
}

let updated = original;
const pluginArray = /("plugin"\s*:\s*\[)([\s\S]*?)(\])/m;
if (pluginArray.test(original)) {
  updated = original.replace(pluginArray, (_, start, inner, end) => {
    const trimmed = inner.trim();
    const prefix = trimmed ? `${inner.replace(/\s*$/, '')},\n    ` : '\n    ';
    return `${start}${prefix}${JSON.stringify(pluginRef)}\n  ${end}`;
  });
} else {
  const closing = original.lastIndexOf('}');
  if (closing === -1) {
    console.error('could not locate closing brace in config');
    process.exit(1);
  }
  const needsComma = /}\s*$/.test(original.trim()) && /\S/.test(original.slice(0, closing));
  const insertion = `${needsComma ? ',' : ''}\n  "plugin": [\n    ${JSON.stringify(pluginRef)}\n  ]\n`;
  updated = `${original.slice(0, closing)}${insertion}${original.slice(closing)}`;
}

if (updated === original) {
  console.error('config not changed');
  process.exit(1);
}

const backupPath = `${configPath}.bak`;
fs.writeFileSync(backupPath, original);
fs.writeFileSync(configPath, updated);
console.log(`updated ${configPath}`);
console.log(`backup ${backupPath}`);
