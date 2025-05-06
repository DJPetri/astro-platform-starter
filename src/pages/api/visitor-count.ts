// src/pages/api/visitor-count.ts
import fs from 'fs';
import path from 'path';

export async function GET() {
  const filePath = path.resolve('visitor-count.txt');

  // Datei erstellen, falls sie noch nicht existiert
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '0');
  }

  // Zähler erhöhen
  let count = parseInt(fs.readFileSync(filePath, 'utf-8') || '0', 10);
  count++;
  fs.writeFileSync(filePath, count.toString());

  return new Response(JSON.stringify({ count }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
