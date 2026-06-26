import fs from 'node:fs';

const [configPath, pluginRef] = process.argv.slice(2);
if (!configPath || !pluginRef) {
  console.error('usage: node scripts/remove-plugin-from-config.mjs <configPath> <pluginRef>');
  process.exit(2);
}

if (!fs.existsSync(configPath)) {
  console.log('config missing; nothing to remove');
  process.exit(0);
}

const original = fs.readFileSync(configPath, 'utf8');
const quotedRef = JSON.stringify(pluginRef);
const pluginArray = /(\"plugin\"\s*:\s*\[)([\s\S]*?)(\])/m;

if (!pluginArray.test(original)) {
  console.log('plugin entry not found');
  process.exit(0);
}

const updated = original.replace(pluginArray, (_, start, inner, end) => {
  const entries = inner
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== quotedRef);

  const rebuilt = entries.length
    ? `\n    ${entries.join(',\n    ')}\n  `
    : '\n  ';

  return `${start}${rebuilt}${end}`;
});

if (updated === original) {
  console.log('plugin entry not found');
  process.exit(0);
}

fs.writeFileSync(`${configPath}.bak`, original);
fs.writeFileSync(configPath, updated);
console.log(`updated ${configPath}`);
