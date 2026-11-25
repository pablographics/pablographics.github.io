# Server settings for the hero video (production)
The video must be served with **byte-range support** (`Accept-Ranges: bytes`, `206 Partial Content`), the right `Content-Type` and long caching.
Without ranges the browser cannot seek / loop smoothly and may stall. Pick the snippet for your host:

## Netlify / Cloudflare Pages — `_headers` (placed in the site root)
```
/assets/hero/*.mp4
  Content-Type: video/mp4
  Accept-Ranges: bytes
  Cache-Control: public, max-age=31536000, immutable
/assets/hero/*.webm
  Content-Type: video/webm
  Accept-Ranges: bytes
  Cache-Control: public, max-age=31536000, immutable
```
## Apache — `.htaccess`
```
AddType video/mp4 .mp4
AddType video/webm .webm
<FilesMatch "\.(mp4|webm)$">
  Header set Accept-Ranges bytes
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
```
## nginx
```
location ~* \.(mp4|webm)$ { add_header Accept-Ranges bytes; add_header Cache-Control "public, max-age=31536000, immutable"; types { video/mp4 mp4; video/webm webm; } mp4; }
```
Local test server with ranges: `python3 tools/serve.py 8765`.
