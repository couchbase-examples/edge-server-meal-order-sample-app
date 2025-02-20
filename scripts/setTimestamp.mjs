import fs from 'fs';
import path from 'path';

const timestamp = new Date().toISOString();
const __dirname = path.resolve();
const filePath = path.join(__dirname, 'timestamp.json');

fs.writeFileSync(filePath, JSON.stringify({ timestamp }));
