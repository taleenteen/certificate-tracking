const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, '../components/super-admin'),
];

const REPLACEMENTS = [
  { from: /\bborder-default\b/g, to: 'border-gray-200' },
  { from: /\bborder-neutral\b/g, to: 'border-gray-200' },
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

console.log('Starting border color refactoring...');
for (const dir of DIRECTORIES) {
  scanDir(dir);
}
console.log('Border color refactoring completed!');
