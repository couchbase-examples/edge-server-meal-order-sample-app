import fs from 'fs';
import path from 'path';

const timestamp = new Date().toISOString();
const __dirname = path.resolve();
const filePath = path.join(__dirname, 'public', 'timestamp.json');

fs.writeFileSync(filePath, JSON.stringify({ timestamp }));
