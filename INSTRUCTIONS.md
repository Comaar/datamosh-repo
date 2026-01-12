
# Flux Repository Deployment Guide

## 1. Local Development
1. Open this folder in **VS Code**.
2. Open the terminal (Ctrl+` or Cmd+`).
3. Run `npm install` to install dependencies.
4. Run `npm run dev` to start the local server.
5. Visit `http://localhost:3000` in your browser.

## 2. Adding Your Own Files
1. Create a folder named `public` in the root directory.
2. Inside `public`, create a folder named `media`.
3. Put your images and videos there.
4. Open `constants.ts` and add them to `MEDIA_COLLECTION`:
   ```ts
   { id: 'unique-id', type: 'image', url: '/media/my-file.jpg' },
   ```

## 3. Public Deployment (Free)
### Option A: Vercel (Recommended)
1. Push your code to a **GitHub** repository.
2. Go to [Vercel.com](https://vercel.com).
3. Click **"New Project"** and import your GitHub repo.
4. Vercel will automatically detect Vite and deploy it.

### Option B: Netlify
1. Go to [Netlify.com](https://netlify.com).
2. Drag and drop your project folder (after running `npm run build`, drop the `dist` folder) or connect to GitHub.

## 4. Controls
- **Spacebar:** Trigger 7-second Datamosh Explosion.
- **Left Click:** Anchor (Lock) an asset in position.
