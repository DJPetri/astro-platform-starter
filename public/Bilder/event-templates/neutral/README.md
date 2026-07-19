Neutrale Eventbilder
====================

Diese Dateien werden fuer Events mit der Variante `neutral` verwendet:

- `background.jpg`: Titelbild auf der Uploadseite, Erfolgsseite und Ablaufseite.
- `qr-card.png`: Hintergrund fuer die QR-Karte im Format 2480 x 3508 px.

Wenn `qr-card.png` fehlt, verwendet `scripts/create-event.mjs` automatisch den bisherigen Standardhintergrund `public/bilder/CardBG.png`.

Nach dem Austausch von `background.jpg` kann die QR-Vorlage neu erzeugt werden:

```bash
node scripts/generate-neutral-qr-template.mjs
```
