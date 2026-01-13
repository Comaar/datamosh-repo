
# MARCO PICCOLO - Guida al Deploy su Vercel

Questo sito è un repository multimediale con effetti di "Datamoshing" in tempo reale.

## 1. Caricare i tuoi file (Immagini e Video)
Il sito è configurato per leggere i file dalla cartella `public`.
1. Crea una cartella chiamata `public` nella cartella principale (root) del progetto.
2. All'interno di `public`, crea una cartella chiamata `media`.
3. Inserisci qui i tuoi file (es. `foto1.jpg`, `video1.mp4`).
4. Apri `constants.ts` e aggiungi i file alla lista `MEDIA_COLLECTION`:
   ```ts
   { id: 'mio-file', type: 'image', url: '/media/foto1.jpg' },
   ```

## 2. Pubblicazione su Vercel (Gratis)
1. Carica la cartella del progetto su un nuovo repository **GitHub**.
2. Vai su [Vercel.com](https://vercel.com) e accedi con il tuo account GitHub.
3. Clicca su **"Add New"** > **"Project"**.
4. Importa il repository appena creato.
5. Clicca su **"Deploy"**.

Ogni volta che caricherai nuove foto su GitHub, Vercel aggiornerà il sito automaticamente in meno di un minuto.

## 3. Comandi e Interazioni
- **Barra Spaziatrice:** Attiva l'effetto Datamosh (esplosione liquida dei pixel).
- **Click su un elemento:** "Ancora" l'immagine o il video, bloccandolo nella sua posizione attuale.
