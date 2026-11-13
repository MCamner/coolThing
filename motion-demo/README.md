# Motion / rörelselabb

Fristående lokal React-demo med spring-rubrik, tre interaktiva kort,
scrollutlöst fade-in och layoutövergång när kortens ordning ändras.
Systemets `prefers-reduced-motion` stänger av rörelsen och visar scrollpanelen direkt.

Kör från denna katalog (Node 22.12+):

```sh
npm ci
npm run dev
```

Öppna adressen som Vite skriver ut. Detta projekt publiceras inte automatiskt till GitHub Pages.

```sh
npm run build
npm run preview -- --port 4173
```

Med preview-servern igång i en annan terminal:

```sh
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install chromium
npm test
```

Testet mäter transform/opacity i Chromium, kontrollerar tangentbordsflöde,
reduced-motion, mobilbredd och axe-regler. Det ersätter inte manuell skärmläsargranskning.
Skärmbilder sparas i `output/playwright/` i denna katalog.
