const fs = require('fs');
console.log('Node.js version:', process.version);
try {
  fs.writeFileSync('test_file.txt', 'Test content');
  console.log('Successfully wrote test file');
} catch (err) {
  console.error('Error writing file:', err);
}
