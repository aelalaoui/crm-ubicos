#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need specific formatting fixes
const filesToFix = [
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\app\\(auth)\\login\\page.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\app\\(auth)\\register\\page.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\app\\(dashboard)\\dashboard\\page.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\app\\layout.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\app\\page.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\components\\auth\\login-form.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\components\\auth\\register-form.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\components\\ui\\button.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\components\\ui\\card.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\components\\ui\\input.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\components\\ui\\label.tsx',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\lib\\api\\auth.ts',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\lib\\api\\client.ts',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\lib\\socket\\socket.ts',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\lib\\utils.ts',
  'C:\\Users\\AdilO\\OneDrive\\Desktop\\Github\\crm-ubicos\\apps\\web\\src\\store\\auth-store.ts',
];

filesToFix.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      // Ensure LF endings
      const fixed = content.replace(/\r\n/g, '\n');
      fs.writeFileSync(file, fixed, 'utf8');
      console.log(`Ensured LF in: ${path.basename(file)}`);
    } catch (err) {
      console.error(`Error processing ${file}:`, err.message);
    }
  }
});

console.log('Done!');

