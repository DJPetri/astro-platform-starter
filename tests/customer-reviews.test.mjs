import test from "node:test";
import assert from "node:assert/strict";
import { customerReviews, GOOGLE_PROFILE_URL } from "../src/data/customer-reviews.mjs";

test("Screenshot enthält genau die beiden bereitgestellten Namen und fünf Sterne", () => {
  assert.deepEqual(customerReviews.map(({ author, rating }) => ({ author, rating })), [
    { author: "Stefanie Franzi", rating: 5 },
    { author: "Frank Kraus", rating: 5 },
  ]);
  for (const review of customerReviews) assert.deepEqual(Object.keys(review).sort(), ["author", "rating", "text"]);
});

test("Stefanies Rezension wird vollständig und unverändert übernommen", () => {
  assert.equal(customerReviews[0].text, "Er hat unsere Hochzeitsfeier mit den perfekten Beats ausklingen lassen.Wir können Christian absolut weiterempfehlen. Er ist zuverlässig, engagiert und wir haben uns ab dem ersten Gespräch super aufgehoben gefühlt.");
});

test("Franks Rezension einschließlich zweiter Zeile bleibt erhalten", () => {
  assert.equal(customerReviews[1].text, "Es war super mit Chris, wir würden ihn immer wieder buchen.\nFotos haben wir leider noch nicht!");
});

test("Google-Profillink bleibt unverändert erhalten", () => {
  assert.equal(GOOGLE_PROFILE_URL, "https://maps.app.goo.gl/iamQFzDbw6iayR3a9");
});
