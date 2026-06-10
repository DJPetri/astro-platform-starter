import fs from "fs";
import path from "path";
import crypto from "crypto";
import readline from "readline";
import QRCode from "qrcode";

/* =========================
KONFIGURATION
========================= */

const EVENTS_PATH = "./src/data/events.json";
const QR_OUTPUT_DIR = "./public/qr";
const QR_BACKUP_DIR = "N:/Meine Ablage/PC2Handy_Videos/QRCodes";

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

const QR_WIDTH = 1000;
const QR_MARGIN = 2;

const EVENT_URL_BASE = "https://petrievents.de/fotos";

/* =========================
HILFSFUNKTIONEN
========================= */

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

const ask = (question) =>
new Promise((resolve) => rl.question(question, resolve));

function ensureDirectory(directory) {
if (!fs.existsSync(directory)) {
fs.mkdirSync(directory, { recursive: true });
}
}

function createSafeName(name) {
return name
.replace(/&/g, "und")
.replace(/ä/g, "ae")
.replace(/ö/g, "oe")
.replace(/ü/g, "ue")
.replace(/Ä/g, "Ae")
.replace(/Ö/g, "Oe")
.replace(/Ü/g, "Ue")
.replace(/ß/g, "ss")
.replace(/[^a-zA-Z0-9 ]/g, "")
.replace(/\s+/g, "-");
}

function isValidDate(date) {
if (!/^\d{8}$/.test(date)) {
return false;
}

const year = parseInt(date.substring(0, 4), 10);
const month = parseInt(date.substring(4, 6), 10);
const day = parseInt(date.substring(6, 8), 10);

const testDate = new Date(year, month - 1, day);

const valid =
testDate.getFullYear() === year &&
testDate.getMonth() === month - 1 &&
testDate.getDate() === day;

return (
valid &&
year >= MIN_YEAR &&
year <= MAX_YEAR
);
}

/* =========================
HAUPTPROGRAMM
========================= */

const brideAndGroom = await ask("Brautpaar: ");

let date;

while (true) {
date = await ask("Datum (YYYYMMDD): ");

if (!isValidDate(date)) {
console.log(
`❌ Ungültiges Datum. Beispiel: ${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}`
);
continue;
}

break;
}

ensureDirectory(path.dirname(EVENTS_PATH));

let events = {};

if (fs.existsSync(EVENTS_PATH)) {
events = JSON.parse(
fs.readFileSync(EVENTS_PATH, "utf8")
);
}

let eventId;

do {
eventId = crypto.randomBytes(4).toString("hex");
} while (events[eventId]);

events[eventId] = {
title: brideAndGroom,
date,
active: true,
createdAt: new Date().toISOString()
};

fs.writeFileSync(
EVENTS_PATH,
JSON.stringify(events, null, 2)
);

const eventUrl = `${EVENT_URL_BASE}/${eventId}`;

const safeName = createSafeName(brideAndGroom);

const qrFileName =
`${date}_${safeName}_${eventId}.png`;

ensureDirectory(QR_OUTPUT_DIR);
ensureDirectory(QR_BACKUP_DIR);

const qrFile = path.join(
QR_OUTPUT_DIR,
qrFileName
);

const backupFile = path.join(
QR_BACKUP_DIR,
qrFileName
);

await QRCode.toFile(
qrFile,
eventUrl,
{
width: QR_WIDTH,
margin: QR_MARGIN
}
);

fs.copyFileSync(qrFile, backupFile);

console.log("\n✅ Event erstellt");
console.log(`ID: ${eventId}`);
console.log(`URL: ${eventUrl}`);
console.log(`QR-Code: ${qrFile}`);
console.log(`Kopie: ${backupFile}`);

rl.close();
