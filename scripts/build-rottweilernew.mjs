import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceDir = path.resolve("public", "rottweiler");
const outDir = path.resolve("public", "rottweilernew");

const stylesheet = `:root {
  --ink: #211b18;
  --muted: #665b55;
  --line: #e4ded8;
  --paper: #fffaf4;
  --panel: rgba(255, 255, 255, 0.88);
  --brand: #7a1f18;
  --brand-dark: #49110d;
  --gold: #bf8b45;
  --green: #2f5f4d;
  --shadow: 0 22px 70px rgba(54, 32, 18, 0.16);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  color: var(--ink);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 17px;
  line-height: 1.65;
  background:
    linear-gradient(120deg, rgba(122, 31, 24, 0.09), rgba(47, 95, 77, 0.1)),
    #fbf5ed;
}

a {
  color: var(--brand);
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
}

.site-hero {
  position: relative;
  min-height: min(620px, 82vh);
  display: grid;
  align-items: end;
  overflow: hidden;
  isolation: isolate;
  color: #fff;
}

.site-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(23, 13, 9, 0.78), rgba(23, 13, 9, 0.34) 58%, rgba(23, 13, 9, 0.62)),
    linear-gradient(0deg, rgba(23, 13, 9, 0.8), rgba(23, 13, 9, 0) 42%);
}

.hero-media {
  position: absolute;
  inset: 0;
  z-index: -2;
  display: grid;
  grid-template-columns: 1.3fr 0.9fr;
  grid-template-rows: 1fr 1fr;
  gap: 6px;
  background: #1d1714;
}

.hero-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-media img:first-child {
  grid-row: 1 / span 2;
}

.hero-copy {
  width: min(1120px, calc(100% - 40px));
  margin: 0 auto;
  padding: 110px 0 56px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #f1c879;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  max-width: 760px;
  margin: 0;
  font-size: clamp(2.6rem, 7vw, 5.6rem);
  line-height: 0.98;
}

.hero-copy p:not(.eyebrow) {
  max-width: 680px;
  margin: 20px 0 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 1.14rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 28px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 18px;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: none;
}

.button.primary {
  color: #fff;
  background: var(--brand);
}

.button.secondary {
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.62);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.mobile-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: none;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(73, 17, 13, 0.14);
  background: rgba(255, 250, 244, 0.95);
  backdrop-filter: blur(18px);
}

.mobile-nav a,
.side-nav a {
  border-radius: 6px;
  color: var(--ink);
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.mobile-nav a {
  padding: 8px 12px;
}

.mobile-nav a[aria-current="page"],
.side-nav a[aria-current="page"] {
  color: #fff;
  background: var(--brand);
}

.page-shell {
  display: grid;
  grid-template-columns: 290px minmax(0, 1fr);
  gap: 34px;
  width: min(1180px, calc(100% - 40px));
  margin: 34px auto 70px;
}

.sidebar {
  position: sticky;
  top: 22px;
  align-self: start;
  display: grid;
  gap: 18px;
}

.brand,
.contact-card,
.article {
  border: 1px solid rgba(73, 17, 13, 0.11);
  background: var(--panel);
  box-shadow: var(--shadow);
  backdrop-filter: blur(16px);
}

.brand {
  display: grid;
  gap: 4px;
  padding: 20px;
  border-radius: 8px;
  color: var(--ink);
  text-decoration: none;
}

.brand span {
  color: var(--muted);
  font-size: 0.9rem;
}

.brand strong {
  font-size: 1.35rem;
  line-height: 1.15;
}

.side-nav {
  display: grid;
  gap: 6px;
  padding: 10px;
  border-left: 3px solid var(--gold);
}

.side-nav a {
  padding: 9px 12px;
}

.side-nav a:hover,
.mobile-nav a:hover {
  background: rgba(122, 31, 24, 0.1);
}

.contact-card {
  display: grid;
  gap: 11px;
  padding: 20px;
  border-radius: 8px;
  color: var(--muted);
  font-size: 0.96rem;
}

.contact-card strong {
  color: var(--ink);
  font-size: 1.1rem;
}

.content {
  min-width: 0;
}

.notice {
  margin-bottom: 18px;
  padding: 14px 18px;
  border-radius: 8px;
  color: #fff;
  background: linear-gradient(90deg, var(--brand), var(--brand-dark));
  font-weight: 800;
  text-align: center;
  box-shadow: 0 12px 36px rgba(122, 31, 24, 0.22);
}

.article {
  padding: clamp(24px, 4vw, 54px);
  border-radius: 8px;
}

.article h2,
.article h3,
.article strong {
  color: var(--ink);
}

.article p {
  margin: 0 0 18px;
}

.article p:empty {
  display: none;
}

.article img {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 760px;
  margin: 20px auto 30px;
  border-radius: 8px;
  box-shadow: 0 18px 48px rgba(43, 28, 18, 0.2);
}

.article table {
  width: auto;
  max-width: 100%;
  margin: 20px auto 30px;
  border-collapse: separate;
  border-spacing: 14px;
}

.article td {
  vertical-align: top;
}

.article hr {
  border: 0;
  border-top: 1px solid var(--line);
}

.to-top {
  display: inline-flex;
  margin-top: 18px;
  padding: 10px 14px;
  border-radius: 6px;
  color: var(--brand);
  background: rgba(255, 255, 255, 0.74);
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 900px) {
  body {
    font-size: 16px;
  }

  .site-hero {
    min-height: 500px;
  }

  .hero-media {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
  }

  .hero-media img:not(:first-child) {
    display: none;
  }

  .hero-copy {
    width: min(100% - 28px, 680px);
    padding-bottom: 34px;
  }

  .mobile-nav {
    display: flex;
  }

  .page-shell {
    display: block;
    width: min(100% - 28px, 760px);
    margin-top: 22px;
  }

  .sidebar {
    position: static;
    margin-bottom: 18px;
  }

  .side-nav {
    display: none;
  }

  .article {
    padding: 20px;
  }

  .article table,
  .article tbody,
  .article tr,
  .article td {
    display: block;
    width: 100%;
  }

  .article table {
    border-spacing: 0;
  }

  .article img {
    max-height: none;
    margin: 16px auto 24px;
  }
}

@media (max-width: 520px) {
  .hero-copy h1 {
    font-size: 2.55rem;
  }

  .hero-actions {
    display: grid;
  }

  .button {
    width: 100%;
  }
}
`;

const pages = [
  ["index.html", "Zwinger", "Der Rottweiler-Zwinger vom heiligen Häuschen in Worms-Pfeddersheim."],
  ["wurfplanung.html", "Wurfplanung", "Aktuelle Planung und Informationen zu kommenden Würfen."],
  ["wurfmeldung.html", "Wurfmeldung", "Neuigkeiten und Angaben zu gemeldeten Würfen."],
  ["huendinnen.html", "Hündinnen", "Unsere ausgewählten, gesunden und charakterfesten Hündinnen."],
  ["rueden.html", "Rüden", "Informationen und Fotos zu den Rüden im Zwinger."],
  ["junghunde.html", "Junghunde", "Junge Hunde aus unserer Zucht."],
  ["welpen.html", "Welpen", "Aktuelle Fotos und Eindrücke aus der Welpenaufzucht."],
  ["zu-verkaufen.html", "Zu Verkaufen", "Hinweise zu aktuell abzugebenden Hunden."],
  ["unvergessen.html", "Unvergessen", "Erinnerungen an Hunde, die uns begleitet haben."],
  ["gaestebuch.html", "Gästebuch", "Einträge und Rückmeldungen unserer Besucher."],
  ["links.html", "Links", "Weiterführende Links rund um Rottweiler und Zucht."],
  ["news.html", "News", "Aktuelles aus dem Zwinger vom heiligen Häuschen."],
  ["kontakt.html", "Kontakt", "So erreichen Sie Volker Trutzel direkt."],
  ["datenschutz.html", "Datenschutz", "Datenschutzhinweise für den Rottweiler-Bereich."],
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await cp(path.join(sourceDir, "images"), path.join(outDir, "images"), { recursive: true });
await cp(path.join(sourceDir, "userfiles"), path.join(outDir, "userfiles"), { recursive: true });
await cp(path.join(sourceDir, "plugins", "gbook"), path.join(outDir, "plugins", "gbook"), { recursive: true });

await writeFile(path.join(outDir, "styles.css"), stylesheet);

for (const [file, title, description] of pages) {
  const html = await readFile(path.join(sourceDir, file), "utf8");
  const content = transformContent(extractContent(html));
  await writeFile(path.join(outDir, file), renderPage({ file, title, description, content }));
  console.log(`modern ${file}`);
}

console.log(`Modern Rottweiler site written to ${outDir}`);

function extractContent(html) {
  const start = html.search(/<h1\b/i);
  if (start === -1) throw new Error("Missing h1 in source page");
  const endMarker = '</td></tr><!--webbot bot="HTMLMarkup" endspan i-checksum="9291"';
  const end = html.indexOf(endMarker, start);
  if (end === -1) throw new Error("Missing content end marker in source page");
  return html.slice(start, end);
}

function transformContent(html) {
  return html
    .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/i, "")
    .replace(/<p[^>]*>(?:\s|&nbsp;|Â )*<\/p>/gi, "")
    .replace(/Â /g, "&nbsp;")
    .replace(/<img\b/gi, '<img loading="lazy" decoding="async"')
    .replace(/action="\?G%26auml%3Bstebuch"/gi, 'action="gaestebuch.html"')
    .replace(/\s(width|height)="[^"]*"/gi, "")
    .replace(/\sstyle="[^"]*"/gi, "")
    .replace(/\sborder="[^"]*"/gi, "")
    .replace(/\scellspacing="[^"]*"/gi, "")
    .replace(/\scellpadding="[^"]*"/gi, "")
    .replace(/\salign="[^"]*"/gi, "")
    .replace(/\sclass="[^"]*"/gi, "")
    .replace(/<span>/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "");
}

function renderPage({ file, title, description, content }) {
  const nav = pages
    .map(([href, label]) => {
      const active = href === file ? ' aria-current="page"' : "";
      return `<a href="${href}"${active}>${label}</a>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title} | Rottweiler-Zwinger vom heiligen Häuschen</title>
  <meta name="description" content="${description}">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-hero" id="top">
    <div class="hero-media" aria-hidden="true">
      <img src="images/Garten.jpg" alt="">
      <img src="userfiles/images/wicky neu 19072026.JPG" alt="">
      <img src="images/heiligeshauschen_klein1.jpg" alt="">
    </div>
    <div class="hero-copy">
      <p class="eyebrow">Rottweiler-Zwinger</p>
      <h1>${title}</h1>
      <p>${description}</p>
      <div class="hero-actions">
        <a class="button primary" href="kontakt.html">Kontakt aufnehmen</a>
        <a class="button secondary" href="welpen.html">Welpen ansehen</a>
      </div>
    </div>
  </header>

  <nav class="mobile-nav" aria-label="Seitennavigation">
${nav}
  </nav>

  <div class="page-shell">
    <aside class="sidebar">
      <a class="brand" href="index.html">
        <span>Vom heiligen Häuschen</span>
        <strong>Rottweiler-Zucht</strong>
      </a>
      <nav class="side-nav" aria-label="Seitennavigation">
${nav}
      </nav>
      <section class="contact-card" aria-label="Kontakt">
        <strong>Volker Trutzel</strong>
        <span>Dirmsteiner Str. 6<br>67551 Worms-Pfeddersheim</span>
        <span>Tel. + Fax: 06247 - 1597<br>Mobil: 0173 2306311</span>
        <a href="mailto:vtrutzel@t-online.de">vtrutzel@t-online.de</a>
      </section>
    </aside>

    <main class="content">
      <section class="notice">Wir erwarten im August/September Welpen!!!</section>
      <article class="article">
${content}
      </article>
      <a class="to-top" href="#top">Seitenanfang</a>
    </main>
  </div>
</body>
</html>
`;
}
