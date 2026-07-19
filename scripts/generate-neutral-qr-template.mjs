import sharp from "sharp";

const WIDTH = 2480;
const HEIGHT = 3508;

const inputFile =
  "public/bilder/event-templates/neutral/background.jpg";

const outputFile =
  "public/bilder/event-templates/neutral/qr-card.png";

const photo = await sharp(inputFile)
  .resize(WIDTH, 1180, {
    fit: "cover"
  })
  .modulate({
    brightness: 0.78,
    saturation: 0.9
  })
  .toBuffer();

const layout = Buffer.from(`
<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect y="1080" width="100%" height="2428" fill="#f8f4ee"/>
  <rect y="1080" width="100%" height="12" fill="#242424" opacity="0.16"/>
  <text
    x="1240"
    y="910"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="82"
    font-weight="700"
    letter-spacing="10"
    fill="#ffffff"
  >FOTO &amp; VIDEO UPLOAD</text>
  <text
    x="1240"
    y="2650"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="46"
    letter-spacing="3"
    fill="#6f6760"
  >Einfach QR-Code scannen und Dateien hochladen</text>
</svg>
`);

await sharp({
  create: {
    width: WIDTH,
    height: HEIGHT,
    channels: 4,
    background: "#f8f4ee"
  }
})
  .composite([
    {
      input: photo,
      top: 0,
      left: 0
    },
    {
      input: layout,
      top: 0,
      left: 0
    }
  ])
  .png()
  .toFile(outputFile);

console.log(`Neutrale QR-Vorlage gespeichert: ${outputFile}`);
