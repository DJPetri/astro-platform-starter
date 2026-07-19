import path from "path";
import fs from "fs";
import sharp from "sharp";
import QRCode from "qrcode";

const QR_CARD_BACKGROUNDS = {
  wedding: "./public/bilder/CardBG.png",
  neutral: "./public/bilder/event-templates/neutral/qr-card.png"
};

export async function generateQrCard({
  brideAndGroom,
  date,
  eventUrl,
  eventId,
  eventVariant = "wedding"
}) {

  /* =========================
     FORMAT
  ========================= */

  const WIDTH = 2480;
  const HEIGHT = 3508;

  /* =========================
     POSITIONEN
  ========================= */

  const NAME_X = WIDTH / 2;
  const NAME_Y = 1360;

  const DATE_X = WIDTH / 2;
  const DATE_Y = 1510;

  const QR_SIZE = 700;
  const QR_X = Math.floor((WIDTH - QR_SIZE) / 2);
  const QR_Y = 1730;

  /* =========================
     DATEI
  ========================= */

  const outputFile = path.join(
    "./public/qr",
    `${date}_${eventId}_card.png`
  );

  /* =========================
     HINTERGRUND
  ========================= */

  const requestedBackground =
    QR_CARD_BACKGROUNDS[eventVariant] || QR_CARD_BACKGROUNDS.wedding;

  const backgroundPath =
    fs.existsSync(requestedBackground)
      ? requestedBackground
      : QR_CARD_BACKGROUNDS.wedding;

  if (backgroundPath !== requestedBackground) {
    console.log(
      `Hinweis: QR-Hintergrund fehlt (${requestedBackground}), verwende ${backgroundPath}`
    );
  }

  const backgroundImage = await sharp(
    backgroundPath
  )
    .resize(WIDTH, HEIGHT)
    .toBuffer();

  /* =========================
     QR CODE
  ========================= */

  const qrBuffer = await QRCode.toBuffer(
    eventUrl,
    {
      width: QR_SIZE,
      margin: 1
    }
  );

  /* =========================
     DATUM
  ========================= */

  const formattedDate =
    `${parseInt(date.slice(6, 8), 10)}/` +
    `${parseInt(date.slice(4, 6), 10)}/` +
    `${date.slice(0, 4)}`;

  /* =========================
     XML ESCAPE
  ========================= */

  const safeBrideAndGroom = brideAndGroom
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  /* =========================
     TEXT OVERLAY
  ========================= */

  const textOverlay = Buffer.from(`
  <svg width="${WIDTH}" height="${HEIGHT}">
    <style>

      .title {
        font-size: 140px;
        font-family: Georgia, serif;
        fill: #111111;
      }

      .date {
        font-size: 60px;
        font-family: Georgia, serif;
        fill: #8b817b;
      }

    </style>

    <text
      x="${NAME_X}"
      y="${NAME_Y}"
      text-anchor="middle"
      class="title"
    >
      ${safeBrideAndGroom}
    </text>

    <text
      x="${DATE_X}"
      y="${DATE_Y}"
      text-anchor="middle"
      class="date"
    >
      ${formattedDate}
    </text>

  </svg>
  `);

  /* =========================
     ERZEUGEN
  ========================= */

  await sharp(backgroundImage)
    .composite([
      {
        input: qrBuffer,
        top: QR_Y,
        left: QR_X
      },
      {
        input: textOverlay,
        top: 0,
        left: 0
      }
    ])
    .png()
    .toFile(outputFile);

  console.log(
    `✅ QR-Karte gespeichert: ${outputFile}`
  );

  return outputFile;
}
