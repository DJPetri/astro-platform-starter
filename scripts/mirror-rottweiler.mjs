import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";

const origin = "https://rottweiler-zucht.net";
const outDir = path.resolve("public", "rottweiler");

const localCss = `html {
  -webkit-text-size-adjust: 100%;
}

body {
  overflow-x: auto;
}

img {
  max-width: 100%;
  height: auto;
}

@media (max-width: 920px) {
  body {
    background-size: auto 100%;
  }

  body > div[align="center"] {
    width: 100%;
    overflow-x: auto;
  }

  body > div[align="center"] > table {
    min-width: 900px;
  }
}
`;

const pages = [
  ["", "index.html"],
  ["Wurfplanung", "wurfplanung.html"],
  ["Wurfmeldung", "wurfmeldung.html"],
  ["Huendinnen", "huendinnen.html"],
  ["Rueden", "rueden.html"],
  ["Junghunde", "junghunde.html"],
  ["Welpen", "welpen.html"],
  ["zu-Verkaufen", "zu-verkaufen.html"],
  ["Unvergessen", "unvergessen.html"],
  ["G%26auml%3Bstebuch", "gaestebuch.html"],
  ["Links", "links.html"],
  ["News", "news.html"],
  ["Kontakt", "kontakt.html"],
  ["Datenschutz", "datenschutz.html"],
];

const pageByQuery = new Map(pages.map(([query, file]) => [decodeQuery(query), file]));
pageByQuery.set("G&auml;stebuch", "gaestebuch.html");
pageByQuery.set("Gästebuch", "gaestebuch.html");
pageByQuery.set("", "index.html");

const assetUrls = new Set();

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, "rottweiler-local.css"), localCss);

for (const [query, file] of pages) {
  const url = query ? `${origin}/?${query}` : `${origin}/`;
  const html = await fetchText(url);
  const rewritten = rewriteHtml(html, file);
  await writeFile(path.join(outDir, file), rewritten);
  collectHtmlAssets(rewritten);
  console.log(`saved ${file}`);
}

for (const assetUrl of [...assetUrls]) {
  await downloadAsset(assetUrl);
}

for (const cssRel of [...assetUrls].filter((url) => url.endsWith(".css"))) {
  const localPath = path.join(outDir, filePathFromUrl(cssRel));
  let css = await readFile(localPath, "utf8");
  css = css.replace(/url\((['"]?)([^)'"]+)\1\)/gi, (_match, quote, raw) => {
    if (/^(data:|https?:|#)/i.test(raw)) return `url(${quote}${raw}${quote})`;
    const absolute = new URL(raw, new URL(cssRel, `${origin}/`)).pathname;
    assetUrls.add(absolute);
    return `url(${quote}${relativePath(path.dirname(urlPath(cssRel)), absolute)}${quote})`;
  });
  await writeFile(localPath, css);
}

for (const assetUrl of [...assetUrls]) {
  await downloadAsset(assetUrl);
}

console.log(`Rottweiler mirror written to ${outDir}`);

function rewriteHtml(html, currentFile) {
  return html
    .replace(/<form action="\/" method="get">[\s\S]*?<\/form>/i, "")
    .replace(/www\.rottweiler-zucht\.net/g, "www.petrievents.de/rottweiler")
    .replace(/https:\/\/rottweiler-zucht\.net\/\?datenschutz\.html/g, "https://www.petrievents.de/rottweiler/datenschutz.html")
    .replace(/<link\s*><link/gi, "<link")
    .replace(
      /(<link rel="stylesheet" href="core\/css\/plugins\.css" type="text\/css">)/i,
      '$1\n<link rel="stylesheet" href="rottweiler-local.css" type="text/css">'
    )
    .replace(/(<meta http-equiv="content-type" content="text\/html;charset=)UTF-8(">)/i, "$1UTF-8$2")
    .replace(/href="\/\?([^"]*)"/gi, (_match, query) => `href="${pageHref(query, currentFile)}"`)
    .replace(/href="\?([^"]*)"/gi, (_match, query) => `href="${pageHref(query, currentFile)}"`)
    .replace(/href="index\.php"/gi, 'href="index.html"')
    .replace(/href="\//gi, 'href="')
    .replace(/src="\//gi, 'src="')
    .replace(/background="\//gi, 'background="')
    .replace(/href="\.\//gi, 'href="')
    .replace(/src="\.\//gi, 'src="')
    .replace(/background="\.\//gi, 'background="')
    .replace(/rel="next" href="[^"]*"/gi, "")
    .replace(/<base[^>]*>/gi, "");
}

function pageHref(query, currentFile) {
  const cleaned = decodeQuery(query.split("&")[0] ?? "").trim();
  if (!cleaned || cleaned === "Zwinger") return "index.html";
  if (cleaned === "mailform") return "kontakt.html";
  if (cleaned === "sitemap" || cleaned === "print" || cleaned === "login") return currentFile;
  return pageByQuery.get(cleaned) ?? "index.html";
}

function collectHtmlAssets(html) {
  const patterns = [
    /\s(?:src|href|background)="([^"]+)"/gi,
    /url\((['"]?)([^)'"]+)\1\)/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const raw = match[2] ?? match[1];
      if (!raw || /^(mailto:|tel:|https?:|#|data:|javascript:)/i.test(raw)) continue;
      if (raw.endsWith(".html")) continue;
      if (raw.includes("?")) continue;
      if (/\.(css|js|jpe?g|png|gif|webp|ico)$/i.test(raw)) {
        assetUrls.add(`/${raw.replace(/^\/+/, "")}`);
      }
    }
  }
}

async function downloadAsset(assetUrl) {
  const rel = filePathFromUrl(assetUrl);
  const target = path.join(outDir, rel);
  await mkdir(path.dirname(target), { recursive: true });
  try {
    const response = await fetch(`${origin}/${urlPath(assetUrl)}`);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    await writeFile(target, bytes);
    console.log(`asset ${rel}`);
  } catch (error) {
    console.warn(`missing ${rel}: ${error.message}`);
  }
}

async function fetchText(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status} ${response.statusText}`);
  return response.text();
}

function decodeQuery(value) {
  return decodeURIComponent(value.replace(/\+/g, " "));
}

function urlPath(assetUrl) {
  return assetUrl.replace(/^\/+/, "");
}

function filePathFromUrl(assetUrl) {
  return decodeURIComponent(urlPath(assetUrl));
}

function relativePath(fromDir, targetPath) {
  const rel = path.posix.relative(fromDir.replaceAll("\\", "/"), urlPath(targetPath));
  return rel || path.posix.basename(targetPath);
}
