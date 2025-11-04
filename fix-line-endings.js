#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function convertCRLFtoLF(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fixed = content.replace(/\r\n/g, '\n');
    if (content !== fixed) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
  }
  return false;
}

function walkDir(dir, fileTypes) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath, fileTypes);
      }
    } else if (fileTypes.some(ext => file.endsWith(ext))) {
      convertCRLFtoLF(filePath);
    }
  });
}

const baseDir = process.argv[2] || '.';
const fileTypes = ['.ts', '.tsx', '.js', '.jsx'];

console.log(`Converting CRLF to LF in ${baseDir}...`);
walkDir(baseDir, fileTypes);
console.log('Done!');

