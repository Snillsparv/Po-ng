# Poäng

En liten poängtavla för mig och Hannes: två staplar, våra ansikten och knappar för plus- och minuspoäng.
Poängen sparas i telefonen där appen används och appen fungerar även utan nät.

När appen öppnas visas **MAMMELIMAMMAS POÄNG-APP!** och introljudet spelas. Telefoner tillåter inte att en sida
spelar ljud innan man har tryckt på skärmen, så då visas en knapp, *Tryck för att starta*, som sätter igång ljudet.
Ett tryck medan ljudet spelar hoppar över startskärmen. Den visas igen om appen har legat i bakgrunden i minst en minut.

## Publicera

Appen är bara statiska filer och körs på GitHub Pages:

1. Gå till **Settings → Pages** i repot.
2. Under *Build and deployment*, välj **Deploy from a branch**, välj grenen och mappen `/ (root)`, och spara.
3. Efter någon minut finns appen på `https://snillsparv.github.io/Po-ng/`.

## Lägg på hemskärmen

- **iPhone (Safari):** öppna länken, tryck på dela-knappen och välj **Lägg till på hemskärmen**.
- **Android (Chrome):** öppna länken, tryck på menyn ⋮ och välj **Lägg till på startskärmen** (eller **Installera app**).

## Ändra

- Ansiktena ligger i `img/jag.jpg` och `img/hannes.jpg`.
- Färgerna är `--jag` och `--hannes` i `style.css`.
- Introljudet är `sound/pannekage.mp3`.
- Appen hämtar nya versioner i bakgrunden, så en ändring syns andra gången appen öppnas efter publiceringen.
