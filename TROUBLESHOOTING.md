# Troubleshooting Guide

## Common Issues

### 1. Page Shows "Loading..." Forever or Spinner Won't Stop

**Cause:** The most common reason is routing not working, preventing the app from loading the manifest.

**Solutions:**

1. **Make sure you're using Wrangler:**

   ```bash
   npm run dev
   ```

   NOT the Python HTTP server, which doesn't support SPA routing.

2. **Open browser console (F12)** and look for `[DEBUG]` messages:
   - Should show: `[DEBUG] pathname: /clients/lushcamp | cleaned path: /clients/lushcamp | match: ...`
   - Should show: `[DEBUG] Client detected: lushcamp`
   - Should show: `[DEBUG] Fetching manifest from: /clients/lushcamp/manifest.json`

3. **Check the manifest response:**
   - Look for: `[DEBUG] Manifest loaded: { client: "lushcamp", title: ..., images: [...] }`
   - If not, look for error like: `[DEBUG] Gallery error: Manifest not found (HTTP 404)`

4. **Verify files exist:**

   ```bash
   ls -la public/clients/lushcamp/
   # Should show: AirconRooms.jpg, CabinRooms.jpg, DayTour.jpg, manifest.json
   ```

5. **Try regenerating manifest:**
   ```bash
   python3 generate_manifests.py lushcamp
   ```

---

### 2. "No Client Specified" Error Appears

**Cause:** The app couldn't extract the client name from the URL (routing failed).

**Solutions:**

1. **Verify URL format:**
   - ✓ Correct: `http://localhost:8080/clients/lushcamp`
   - ✗ Wrong: `http://localhost:8080/`
   - ✗ Wrong: `http://localhost:8080/index.html`

2. **Using Wrangler?** (Run: `npm run dev`)
   - Wrangler reads `_redirects` and internal rewrites `/clients/:name` to `index.html`
   - Without Wrangler, routing breaks!

3. **Check console logs:**
   - Should see: `[DEBUG] pathname: /clients/lushcamp ...`
   - If you see: `[DEBUG] NO CLIENT MATCH`, then routing failed

4. **Kill any stuck processes:**
   ```bash
   pkill -f "wrangler\|http.server"
   sleep 1
   npm run dev
   ```

---

### 3. "Gallery Not Found" Error

**Cause:** Manifest file exists but can't be read, or doesn't contain images.

**Solutions:**

1. **Check manifest.json syntax:**

   ```bash
   python3 -c "import json; json.load(open('public/clients/lushcamp/manifest.json'))"
   # Should show no error
   ```

2. **Verify manifest contains images:**

   ```bash
   cat public/clients/lushcamp/manifest.json | jq '.images'
   # Should show array of image objects
   ```

3. **Regenerate the manifest:**

   ```bash
   python3 generate_manifests.py lushcamp
   ```

4. **Check console for exact error:**
   ```
   [DEBUG] Gallery error: No images found in manifest
   [DEBUG] Gallery error: Manifest not found (HTTP 404)
   ```

---

### 4. Images Won't Display (Blank Page After Loading)

**Cause:** Images exist but aren't loading or paths are wrong.

**Solutions:**

1. **Verify image files exist and are accessible:**

   ```bash
   curl -I http://localhost:8000/clients/lushcamp/AirconRooms.jpg
   # Should show: HTTP 200 OK
   ```

2. **Check console for image errors:**
   - Open DevTools → Network tab
   - Reload page
   - Look for failed requests to .jpg files

3. **Verify image paths in manifest:**

   ```bash
   cat public/clients/lushcamp/manifest.json | jq '.images[0].src'
   # Should be: "AirconRooms.jpg" (not "/clients/lushcamp/AirconRooms.jpg")
   ```

4. **Check file permissions:**

   ```bash
   ls -la public/clients/lushcamp/
   # Images should be readable (644 or similar)
   ```

5. **Port 8000 or 8080 issues?**
   - Try different port if already in use:
   - Edit package.json: `"dev": "npx wrangler pages dev public --port 9000"`
   - Then access: `http://localhost:9000/clients/lushcamp`

---

### 5. "Address Already In Use" Error

**Cause:** Port 8000/8080 is already in use by another process.

**Solution:**

```bash
# Kill all Node processes
pkill -f "node\|wrangler\|http.server"

# Or kill specific port (need lsof or fuser)
lsof -i :8000 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Then retry
npm run dev
```

---

### 6. Page Works Locally but Not on Cloudflare Pages

**Common causes:**

1. **Missing files in deployment:**
   - Ensure images are committed to git: `git add public/clients/*/`
   - Check build output includes `public/` directory

2. **Wrong deploy path:**

   ```bash
   # Correct use 'public' folder
   npx wrangler pages deploy public --project-name=static-image-gallery
   ```

3. **Cloudflare Pages settings:**
   - Build output directory: `public`
   - Build command: (leave empty)
   - Root directory: `/` (default)

4. **Check deployment logs:**
   - Go to Cloudflare Dashboard → Your Project → Deployments
   - Click latest deployment to see build logs

---

## Debug Mode

The app includes detailed console logging. To use it:

1. **Open browser console:** Press `F12`
2. **Go to Console tab**
3. **Reload page:** Press `Ctrl+R`
4. **Look for `[DEBUG]` messages:**
   ```
   [DEBUG] pathname: /clients/lushcamp | cleaned path: /clients/lushcamp | match: ...
   [DEBUG] Client detected: lushcamp
   [DEBUG] Fetching manifest from: /clients/lushcamp/manifest.json
   [DEBUG] Manifest response: 200 OK
   [DEBUG] Manifest loaded: { client: "lushcamp", title: "...", images: [...] }
   ```

### If you see errors:

```
[DEBUG] Gallery error: Manifest not found (HTTP 404)
[DEBUG] Gallery error: No images found in manifest
```

These messages in console tell you exactly what went wrong.

---

## Getting Help

If issues persist:

1. **Collect debug info:**

   ```bash
   # Paste the [DEBUG] console messages
   # Run: npm run manifest to regenerate manifests
   # Run: npm run dev and check console
   ```

2. **Check file structure:**

   ```bash
   tree public/clients/ -L 2
   # Should show all clients with manifest.json and images
   ```

3. **Verify Wrangler is working:**
   ```bash
   npm run dev
   # Should show: "[wrangler:info] Ready on http://localhost:8000"
   ```
