import fs from "fs";
import path from "path";
import crypto from "crypto";
import readline from "readline";
import QRCode from "qrcode";
import { generateQrCard } from "./generate-qr-card.mjs";
/* =========================
KONFIGURATION
========================= */

const EVENTS_PATH = "./src/data/events.json";

const QR_OUTPUT_DIR = "./public/qr";

const QR_BACKUP_DIR =
"N:/Meine Ablage/PC2Handy_Videos/QRCodes";

const EVENT_URL_BASE =
"https://petrievents.de/fotos";

const EVENT_VARIANTS = {
hochzeit: {
  key: "wedding",
  label: "Hochzeit"
},
neutral: {
  key: "neutral",
  label: "Neutral"
}
};

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

const QR_WIDTH = 1000;
const QR_MARGIN = 2;

/* =========================
HILFSFUNKTIONEN
========================= */

const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

const ask = (question) =>
new Promise((resolve) =>
rl.question(question, resolve)
);

function ensureDirectory(directory) {
if (!fs.existsSync(directory)) {
fs.mkdirSync(directory, {
recursive: true
});
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

const year =
parseInt(date.substring(0, 4), 10);

const month =
parseInt(date.substring(4, 6), 10);

const day =
parseInt(date.substring(6, 8), 10);

const testDate =
new Date(year, month - 1, day);

return (
testDate.getFullYear() === year &&
testDate.getMonth() === month - 1 &&
testDate.getDate() === day &&
year >= MIN_YEAR &&
year <= MAX_YEAR
);
}

function formatDate(dateObj) {

const year =
dateObj.getFullYear();

const month =
String(dateObj.getMonth() + 1)
.padStart(2, "0");

const day =
String(dateObj.getDate())
.padStart(2, "0");

return `${year}${month}${day}`;
}

async function askEventVariant() {
while (true) {

const answer =
(await ask("Variante (hochzeit/neutral) [hochzeit]: "))
.trim()
.toLowerCase();

const selectedVariant =
answer || "hochzeit";

if (EVENT_VARIANTS[selectedVariant]) {
return EVENT_VARIANTS[selectedVariant];
}

console.log(
"Ungueltige Variante. Bitte hochzeit oder neutral eingeben."
);
}
}

/* =========================
HAUPTPROGRAMM
========================= */

const brideAndGroom =
await ask("Event-Titel / Brautpaar: ");

const eventVariant =
await askEventVariant();

let date;

while (true) {

date =
await ask("Datum (YYYYMMDD): ");

if (!isValidDate(date)) {

  console.log(
    "❌ Ungültiges Datum. Beispiel: 20260610"
  );

  continue;
}

break;
}

ensureDirectory(
path.dirname(EVENTS_PATH)
);

let events = {};

if (fs.existsSync(EVENTS_PATH)) {

events = JSON.parse(
fs.readFileSync(
EVENTS_PATH,
"utf8"
)
);
}

/* =========================
EVENT-ID
========================= */

let eventId;

do {

eventId =
crypto.randomBytes(4)
.toString("hex");

} while (events[eventId]);

/* =========================
EVENT-DATEN
========================= */

const safeName =
createSafeName(brideAndGroom);

const storageFolder =
`${date}_${safeName}_${eventId}`;

const eventDate = new Date(
parseInt(date.substring(0, 4), 10),
parseInt(date.substring(4, 6), 10) - 1,
parseInt(date.substring(6, 8), 10)
);

/* Upload Ende = +72h */

const uploadUntilDate =
new Date(eventDate);

uploadUntilDate.setDate(
uploadUntilDate.getDate() + 3
);

const uploadUntil =
formatDate(uploadUntilDate);

/* Löschung = +3 Monate */

const deleteAfterDate =
new Date(eventDate);

deleteAfterDate.setMonth(
deleteAfterDate.getMonth() + 3
);

const deleteAfter =
formatDate(deleteAfterDate);

/* =========================
EVENT SPEICHERN
========================= */

events[eventId] = {

title: brideAndGroom,

date,

storageFolder,

eventVariant: eventVariant.key,

uploadUntil,

deleteAfter,

createdAt:
new Date().toISOString()
};

fs.writeFileSync(
EVENTS_PATH,
JSON.stringify(events, null, 2)
);

/* =========================
QR-CODE
========================= */

const eventUrl =
`${EVENT_URL_BASE}/${eventId}`;

const qrFileName =
`${date}_${safeName}_${eventId}.png`;

ensureDirectory(QR_OUTPUT_DIR);
ensureDirectory(QR_BACKUP_DIR);

const qrFile =
path.join(
QR_OUTPUT_DIR,
qrFileName
);

const backupFile =
path.join(
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

fs.copyFileSync(
qrFile,
backupFile
);

/* =========================
QR-KARTE ERZEUGEN
========================= */

const qrCardFile =
  await generateQrCard({
    brideAndGroom,
    date,
    eventUrl,
    eventId,
    eventVariant: eventVariant.key
  });

  const qrCardBackupFile =
  path.join(
    QR_BACKUP_DIR,
    path.basename(qrCardFile)
  );

fs.copyFileSync(
  qrCardFile,
  qrCardBackupFile
);

/* =========================
AUSGABE
========================= */

console.log("\n✅ Event erstellt");

console.log(
`ID: ${eventId}`
);

console.log(
`URL: ${eventUrl}`
);

console.log(
`Variante: ${eventVariant.label}`
);

console.log(
`Storage: ${storageFolder}`
);

console.log(
`Upload bis: ${uploadUntil}`
);

console.log(
`Löschung: ${deleteAfter}`
);

console.log(
`QR-Code: ${qrFile}`
);

console.log(
`Kopie: ${backupFile}`
);

rl.close();
