const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, '../components/super-admin'),
  path.join(__dirname, '../app/(super-admin)'),
];

const REPLACEMENTS = [
  { from: /text-text-placeholder/g, to: 'text-placeholder' },
  { from: /text-text-primary/g, to: 'text-main' },
  { from: /text-text-secondary/g, to: 'text-sub' },
  { from: /text-text-tertiary/g, to: 'text-muted-text' },
  { from: /text-text-disable/g, to: 'text-disabled' },
  { from: /border-border-default/g, to: 'border-default' },
  { from: /border-border-neutral/g, to: 'border-neutral' },
  { from: /border-border-hover/g, to: 'border-hover' },
  { from: /border-border-critical/g, to: 'border-critical' },
  { from: /border-border-disable/g, to: 'border-disabled' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const rep of REPLACEMENTS) {
    if (rep.from.test(content)) {
      content = content.replace(rep.from, rep.to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored: ${filePath}`);
  }
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (stat.isFile() && /\.(tsx|ts|js|jsx)$/.test(file)) {
      processFile(fullPath);
    }
  }
}

console.log('Starting refactoring...');
for (const dir of DIRECTORIES) {
  scanDir(dir);
}
console.log('Refactoring completed!');
