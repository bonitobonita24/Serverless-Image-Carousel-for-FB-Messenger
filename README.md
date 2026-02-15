# Static Image Gallery for Facebook Messenger

A serverless, multi-client image carousel gallery optimized for viewing inside Facebook Messenger's in-app browser. Deployed on **Cloudflare Pages**.

## How It Works

Each client gets their own folder with images. The gallery page dynamically loads images based on the URL:

```
https://your-domain.com/clients/lushcamp     → Lushcamp gallery
https://your-domain.com/clients/acme-corp    → Acme Corp gallery
https://your-domain.com/clients/hotel-xyz    → Hotel XYZ gallery
```

Share the client URL in Facebook Messenger — it loads directly in the in-app browser as a swipeable image carousel with fullscreen tap support.

## Project Structure

```
├── public/                        ← Deployed to Cloudflare Pages
│   ├── index.html                 ← Generic gallery (reads URL to detect client)
│   ├── _headers                   ← Cloudflare Pages custom headers
│   ├── _redirects                 ← SPA-style routing for /clients/* URLs
│   └── clients/
│       ├── lushcamp/              ← Client folder
│       │   ├── manifest.json      ← Auto-generated image list
│       │   ├── AirconRooms.jpg
│       │   ├── CabinRooms.jpg
│       │   └── DayTour.jpg
│       └── another-client/        ← Add more clients here
│           ├── manifest.json
│           └── ...
├── generate_manifests.py          ← Script to auto-generate manifest.json files
├── package.json                   ← npm scripts for dev/deploy
├── wrangler.toml                  ← Cloudflare Wrangler config
└── README.md
```

## Adding a New Client

1. **Create a folder** under `public/clients/`:

   ```bash
   mkdir public/clients/new-client-name
   ```

2. **Drop images** into the folder (JPG, PNG, WebP, GIF, SVG supported)

3. **Generate the manifest**:

   ```bash
   python3 generate_manifests.py
   # Or for a specific client:
   python3 generate_manifests.py new-client-name
   ```

4. **Deploy** — the gallery is now accessible at `/clients/new-client-name`

## Features

- **Multi-client** — one codebase for unlimited client galleries
- **Swipe/touch carousel** — smooth swipe navigation between images
- **Fullscreen view** — tap any image to view it fullscreen
- **Dynamic loading** — fetches `manifest.json` for each client, supports any number of images
- **Facebook Messenger compatible** — OG meta tags, `X-Frame-Options: ALLOWALL`, touch-optimized
- **Keyboard navigation** — Arrow keys, Enter/Space for fullscreen, Escape to close
- **Responsive** — works on mobile, tablet, and desktop
- **Zero dependencies** — pure HTML/CSS/JS, no frameworks
- **Auto-captioning** — filenames like `AirconRooms.jpg` become "Aircon Rooms"

## Local Development

### ⚠️ Important: Use Wrangler for proper routing!

The app requires SPA-style routing (`/clients/<name>` → `index.html`) to extract the client name from the URL. This is handled by the `_redirects` file on Cloudflare Pages.

**Option 1: Wrangler (Recommended - Emulates Cloudflare Pages locally)**

```bash
npm run dev
# Opens on http://localhost:8080
# Access: http://localhost:8080/clients/lushcamp
```

Wrangler properly emulates the `_redirects` configuration, so the routing works correctly.

**Option 2: Python HTTP Server (Simpler but has limitations)**

```bash
python3 -m http.server 8080 --directory public
# Then access the root directory option
```

⚠️ **Note:** Python's simple HTTP server doesn't honor `_redirects`, so:

- ✗ `localhost:8080/clients/lushcamp` → shows directory listing
- ✓ `localhost:8080/index.html?client=lushcamp` → **would work IF app supported it** (currently doesn't)

**If you see "No Client Specified" error:**

- Make sure you're using Wrangler (`npm run dev`)
- Check browser console (F12) for debug logs
- Verify the URL pattern is `/clients/clientname` (with client name)

**Troubleshooting:**

1. **"Address already in use" error**: Kill the process using port 8080:

   ```bash
   pkill -f "wrangler\|http.server"
   ```

2. **"Loading..." never completes**: Check console (F12) for errors. Common issues:
   - Manifest.json not found (wrong client name)
   - Images failing to load (check image paths)
   - CORS issues (shouldn't happen locally)

3. **Enable debugging**: Browser console shows detailed logs with `[DEBUG]` prefix

## Deploy to Cloudflare Pages

### Option 1: CLI Deploy

```bash
npx wrangler pages deploy public --project-name=static-image-gallery
```

### Option 2: Git Integration (recommended)

1. Push this repo to GitHub/GitLab
2. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com/?to=/:account/pages)
3. Click **Create a project** → **Connect to Git**
4. Select this repository
5. Set **Build output directory** to `public`
6. Leave **Build command** empty (no build step)
7. Deploy!

## Troubleshooting

### Gallery shows "Loading..." forever

1. **Open browser console** (F12) and look for `[DEBUG]` messages
2. Check if client name was detected (should show in console)
3. Verify manifest.json exists: `public/clients/clientname/manifest.json`
4. Check if images are accessible and forming correct paths

### "No Client Specified" error appears

- You're likely not using Wrangler for local dev (Pytho HTTP server doesn't support routing)
- **Run:** `npm run dev` instead
- **Or** check that your URL matches `/clients/clientname` pattern

### Images won't load

- Verify image files exist in `public/clients/clientname/` directory
- Run `python3 generate_manifests.py` to regenerate manifest.json
- Check file permissions

## Manifest Format

Each `manifest.json` follows this structure:

```json
{
  "client": "lushcamp",
  "title": "Lushcamp Image Gallery",
  "images": [
    {
      "src": "AirconRooms.jpg",
      "alt": "Aircon Rooms",
      "caption": "Aircon Rooms"
    }
  ]
}
```

You can edit `manifest.json` manually to customize titles and captions, or re-run `generate_manifests.py` to auto-generate from filenames.

## Commands Reference

All commands are run from the **project root** (`/workspaces/StaticImagesforFBMessenger`).

| Command                                | What it does                                                  |
| -------------------------------------- | ------------------------------------------------------------- |
| `npm run dev`                          | Start dev server with Wrangler (recommended, handles routing) |
| `npm run serve`                        | Start dev server with Node.js (lightweight fallback)          |
| `npm run deploy`                       | Deploy to Cloudflare Pages                                    |
| `npm run manifest`                     | Generate `manifest.json` for **all** clients                  |
| `python3 generate_manifests.py`        | Same as above                                                 |
| `python3 generate_manifests.py <name>` | Generate manifest for a **specific** client                   |
| `python3 generate_manifests.py a b c`  | Generate manifests for **multiple** specific clients          |

### Adding a new client (quick steps)

```bash
# 1. Create folder and add images
mkdir public/clients/newclient
cp /path/to/images/*.jpg public/clients/newclient/

# 2. Generate manifest (run from project root!)
python3 generate_manifests.py newclient

# 3. Visit
# http://localhost:8080/clients/newclient
```

## Facebook Messenger Compatibility

The page includes:

- **Open Graph meta tags** — Messenger shows a rich link preview
- **`X-Frame-Options: ALLOWALL`** — allows loading inside Messenger's webview
- **Touch-optimized UI** — large tap targets, swipe gestures, no hover-only interactions
- **Viewport meta** — proper scaling on mobile devices
- **No popups or redirects** — Messenger's browser blocks these
