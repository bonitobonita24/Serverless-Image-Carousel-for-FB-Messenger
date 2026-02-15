// Cloudflare Pages Function: intercepts /clients/:name requests
// Reads the client's manifest.json and injects the first image as og:image
// so Facebook Messenger shows a proper preview thumbnail.

export async function onRequest(context) {
  const { params, request, env } = context;
  const clientName = params.name;
  const origin = new URL(request.url).origin;

  // Fetch the original index.html from static assets
  const assetResponse = await env.ASSETS.fetch(new URL('/index.html', request.url));
  let html = await assetResponse.text();

  try {
    // Fetch the client's manifest.json
    const manifestResponse = await env.ASSETS.fetch(
      new URL(`/clients/${clientName}/manifest.json`, request.url)
    );

    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json();
      const title = manifest.title || `${manifest.client || clientName} Gallery`;
      const description = `View ${title}`;

      // Use the first image as the OG preview
      let imageUrl = '';
      if (manifest.images && manifest.images.length > 0) {
        imageUrl = `${origin}/clients/${clientName}/${manifest.images[0].src}`;
      }

      const pageUrl = `${origin}/clients/${clientName}`;

      // Replace placeholder OG tags with real values (use regex for multiple occurrences)
      html = html.replace(/__OG_TITLE__/g, escapeAttr(title));
      html = html.replace(/__OG_DESCRIPTION__/g, escapeAttr(description));
      html = html.replace(/__OG_URL__/g, escapeAttr(pageUrl));
      html = html.replace(/__OG_IMAGE__/g, escapeAttr(imageUrl));
      html = html.replace(/<title>Image Gallery<\/title>/g, `<title>${escapeAttr(title)}</title>`);
    }
  } catch (err) {
    console.error('OG injection error:', err);
    // If anything fails, serve page with default meta tags
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
