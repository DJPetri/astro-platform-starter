import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { customerReviews } from "../src/data/customer-reviews.mjs";

const browserPath = process.env.REVIEW_TEST_BROWSER || [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].find((candidate) => existsSync(candidate));
assert.ok(browserPath, "Chrome/Edge fehlt; REVIEW_TEST_BROWSER auf einen Chromium-Browser setzen.");
const liveBase = process.env.REVIEW_TEST_BASE_URL || "http://127.0.0.1:4321";
const output = path.resolve(".netlify/review-layout-check");
await mkdir(output, { recursive: true });
const temporaryProfile = await mkdtemp(path.join(tmpdir(), "review-layout-"));
let browser;
let socket;
let send;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  browser = spawn(browserPath, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=0", `--user-data-dir=${temporaryProfile}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  const debugUrl = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Browser-Debugging nicht gestartet")), 15000);
    let logs = "";
    browser.stderr.on("data", (data) => {
      logs += data;
      const match = logs.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
    browser.once("error", reject);
  });
  socket = new WebSocket(debugUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  let nextId = 0;
  const pending = new Map();
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    const task = pending.get(message.id);
    if (!task) return;
    pending.delete(message.id);
    clearTimeout(task.timer);
    if (message.error) task.reject(new Error(message.error.message)); else task.resolve(message.result);
  });
  send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    const id = ++nextId;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
  const command = (method, params) => send(method, params, sessionId);
  const evaluate = async (expression) => {
    const response = await command("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  };
  await command("Page.enable");
  await command("Runtime.enable");
  const checks = [];
  for (const state of ["manuelle-rezensionen", "synthetischer-langtext"]) {
    for (const width of [320, 375, 430, 768, 900, 901, 1280, 1440]) {
        await command("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width <= 900 });
        await command("Page.navigate", { url: new URL("/bewertungen", liveBase).href });
        let loaded = false;
        for (let attempt = 0; attempt < 80; attempt++) {
          loaded = await evaluate("document.readyState === 'complete' && !!document.querySelector('.review-controls:not([hidden])')");
          if (loaded) break;
          await sleep(100);
        }
        assert.ok(loaded, `Seite nicht geladen: ${state}/${width}`);
        assert.equal(await evaluate("document.querySelector('.nav-contact')?.nextElementSibling?.getAttribute('href')"), "/bewertungen");
        await evaluate("Promise.race([document.fonts.ready.then(() => true), new Promise(r => setTimeout(() => r(false), 2000))])");
        const renderedReviews = await evaluate("[...document.querySelectorAll('.review-card')].map(card => ({author: card.querySelector('.author-name').textContent, text: card.querySelector('.review-text').textContent}))");
        assert.deepEqual(renderedReviews, customerReviews.map(({ author, text }) => ({ author, text })));
        const visibleAuthor = () => evaluate("document.querySelector('.review-card:not([hidden]) .author-name').textContent");
        assert.equal(await visibleAuthor(), customerReviews[0].author);
        await evaluate("document.querySelector('[data-review-next]').click()");
        assert.equal(await visibleAuthor(), customerReviews[1].author);
        await evaluate("document.querySelector('[data-review-prev]').click()");
        assert.equal(await visibleAuthor(), customerReviews[0].author);
        await evaluate("document.querySelector('[data-review-prev]').click()");
        assert.equal(await visibleAuthor(), customerReviews[1].author);
        await evaluate("document.querySelector('[data-review-next]').click()");
        assert.equal(await visibleAuthor(), customerReviews[0].author);
        await evaluate("document.querySelector('[data-review-carousel]').focus()");
        for (const [key, code, expected] of [["ArrowRight", "ArrowRight", customerReviews[1].author], ["ArrowLeft", "ArrowLeft", customerReviews[0].author]]) {
          await command("Input.dispatchKeyEvent", { type: "keyDown", key, code });
          await command("Input.dispatchKeyEvent", { type: "keyUp", key, code });
          assert.equal(await visibleAuthor(), expected);
        }
        if (state === "synthetischer-langtext") {
          await evaluate(`document.querySelectorAll('.review-card').forEach(card => {
            card.querySelector('.author-name').textContent = 'SYNTHETISCHERTESTNAME'.repeat(5);
            card.querySelector('.review-text p').textContent = ('SYNTHETISCHE LAYOUTTESTDATEN, KEINE ECHTE REZENSION. ' + 'UngetrenntesTestwort'.repeat(12) + '\\nZweiter Testabsatz. ').repeat(8);
          })`);
        }
        for (let slide = 0; slide < customerReviews.length; slide++) {
        const result = await evaluate(`(() => {
          const issues = [];
          const visible = el => el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0;
          const selectors = '.reviews-heading, .reviews-section, .google-reviews, .review-summary, .review-content, .review-card, .author-info, .review-text, .profile-link, .review-controls, .review-controls button';
          for (const el of document.querySelectorAll(selectors)) {
            if (!visible(el)) continue;
            const box = el.getBoundingClientRect();
            if (box.left < -1 || box.right > innerWidth + 1) issues.push('Außerhalb: ' + el.className);
            if (el.scrollWidth > el.clientWidth + 2) issues.push('Horizontal abgeschnitten: ' + el.className);
            if (el.matches('.review-text') && el.scrollHeight > el.clientHeight + 2) issues.push('Text vertikal abgeschnitten');
          }
          const rectangles = [...document.querySelectorAll('.review-card')].filter(visible).map(el => el.getBoundingClientRect());
          for (let i = 0; i < rectangles.length; i++) for (let j = i + 1; j < rectangles.length; j++) {
            const a = rectangles[i], b = rectangles[j];
            if (Math.min(a.right,b.right)-Math.max(a.left,b.left) > 1 && Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top) > 1) issues.push('Bewertungskarten überschneiden sich');
          }
          const summary = document.querySelector('.review-summary').getBoundingClientRect();
          const content = document.querySelector('.review-content').getBoundingClientRect();
          if (Math.min(summary.right,content.right)-Math.max(summary.left,content.left) > 1 && Math.min(summary.bottom,content.bottom)-Math.max(summary.top,content.top) > 1) issues.push('Zusammenfassung überschneidet Inhalte');
          return { issues, reviewCount: rectangles.length, width: innerWidth };
        })()`);
        assert.deepEqual(result.issues, [], `${state}/${width}: ${result.issues.join(', ')}`);
        assert.equal(result.reviewCount, 1);
        assert.equal(await evaluate("document.querySelector('[data-review-position]').textContent"), `Bewertung ${slide + 1} von 2`);
        checks.push({ state, width, slide, ...result });
        if ([375, 1440].includes(width)) {
          const image = await command("Page.captureScreenshot", { format: "png" });
          await writeFile(path.join(output, `${state}-${width}-${slide + 1}.png`), Buffer.from(image.data, "base64"));
        }
        await evaluate("document.querySelector('[data-review-next]').click()");
        }
    }
  }
  await writeFile(path.join(output, "results.json"), JSON.stringify(checks, null, 2));
  console.log(`${checks.length} Browserprüfungen erfolgreich: finale Bewertungsseite, beide Rezensionen, 320–1440 px, Vor/Zurück und Pfeiltasten, zusätzlich synthetische Langtexte. Screenshots: ${output}`);
} finally {
  if (send && socket?.readyState === WebSocket.OPEN) { try { await send("Browser.close"); } catch {} }
  socket?.close();
  browser?.kill();
  await sleep(500);
  await rm(temporaryProfile, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }).catch(() => {});
}
