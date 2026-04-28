# Mega Movie Tube - MTV Edition 📺🎸

Detta är en retro-hemsida i gammalt MTV-tema (90-tals estetik) som kombinerar streaminglänkar med ett koncept för AI-genererade gitarr-tabulaturer via YouTube.

## Innehåll
- `index.html`: Hemsidan med MTV-design, scanlines och rörliga element.
- `app.js`: Logik för ljud-synthesizer och förberedelse för AI-anrop.
- `styles.css`: CSS för 90-tals estetik (neon, graffiti, CRT-effekt).

## Hur man använder Gitarr-Tab funktionen
Eftersom GitHub Pages inte kan köra Python (AI-motorn), rekommenderas följande setup:
1. Driftsätt en Python-backend (t.ex. på Hugging Face Spaces eller Railway) som kör `basic-pitch`.
2. Uppdatera API-URL:en i `app.js` för att peka på din backend.
3. Frontenden skickar YouTube-länken, backenden returnerar MIDI/JSON, och AlphaTab renderar tabben.

## Licens
Klassiskt 90-tals "Beavis & Butt-head"-vibe. Gör vad du vill!
