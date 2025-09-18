const fs = require('fs');
const content = fs.readFileSync('src/store/useCanvasStore.ts', 'utf8');
const lines = content.split('\n');
lines[83] = '    }),';
fs.writeFileSync('src/store/useCanvasStore.ts', lines.join('\n'));
