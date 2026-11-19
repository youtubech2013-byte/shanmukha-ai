# SHANMUKHA AI

A small bilingual (Telugu + English) AI chat website using:
- Static HTML/CSS/JS
- Cloudflare Pages Functions (server-side API proxy)
- Gemini API (free-tier text/chat and image understanding where available)

## Features
- AI chat in Telugu and English
- Upload PNG/JPEG/WebP images for image understanding (max 4 MB)
- Chat history stored in this browser's localStorage
- Dark/light appearance
- Image-prompt helper
- Optional image-generation API endpoint (Gemini image generation currently has no free tier in published pricing; may require paid billing)

## 1. Get a Gemini API key
1. Open https://aistudio.google.com/
2. Sign in and create an API key.
3. Keep the key private. Never paste it into `index.html`, GitHub, or a public message.

## 2. Test locally (simple method)
Install Node.js LTS from https://nodejs.org/ and a code editor such as VS Code.
Open this folder in VS Code, then open Terminal and run:

```bash
npm install -g wrangler
```

Create a file named `.dev.vars` in the project root:
```text
GEMINI_API_KEY="PASTE_YOUR_KEY_HERE"
GEMINI_MODEL="gemini-2.5-flash-lite"
GEMINI_IMAGE_MODEL="gemini-3.1-flash-image"
```
Do not upload `.dev.vars` to GitHub. Then run:
```bash
npx wrangler pages dev . --compatibility-date=2026-11-18
```
Open the local URL shown in the terminal.

## 3. Free public launch with Cloudflare Pages
1. Create/sign in to GitHub: https://github.com/
2. Create a new private repository named `shanmukha-ai` (recommended).
3. Upload `index.html`, the `functions` folder and `.gitignore` to the repository. Do NOT upload `.dev.vars`.
4. Sign in at https://dash.cloudflare.com/ and open Workers & Pages.
5. Create application > Pages > Connect to Git.
6. Choose your repository. Framework preset: None. Build command: `exit 0`. Build output directory: `/`.
7. Deploy. Cloudflare gives you a `*.pages.dev` address.
8. In your Pages project, open Settings > Variables and Secrets > Add. Add an encrypted Secret:
   - Name: `GEMINI_API_KEY`
   - Value: your key from AI Studio
9. Add plain-text variables if desired:
   - `GEMINI_MODEL` = `gemini-2.5-flash-lite`
   - `GEMINI_IMAGE_MODEL` = `gemini-3.1-flash-image`
10. Save and trigger a new deployment.

Cloudflare Pages Functions live in the top-level `functions/` directory. Keep your API key as an encrypted secret.

## Notes
- Free-tier models, quota, geography and availability can change. Check current Gemini API pricing and limits: https://ai.google.dev/gemini-api/docs/pricing
- Image generation endpoint is optional and can return a billing/model-access error on a free account.
- Browser history is local to one browser/device. It is not a cloud account or shared history.
- This starter has no user login, database, or abuse protection. Do not publish a public AI service for heavy traffic without adding rate limiting and safeguards.
- Do not collect sensitive personal information from visitors.
