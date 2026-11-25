#!/usr/bin/env python3
"""Local static server WITH byte-range support (206) — python's http.server ignores Range, which makes <video> seeking / looping flaky.
Usage: python3 tools/serve.py [port]   (from the site root)"""
import os, re, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
class H(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.mp4': 'video/mp4', '.webm': 'video/webm', '.webp': 'image/webp', '.woff': 'font/woff'}
    def send_head(self):
        path = self.translate_path(self.path); rng = self.headers.get('Range')
        if not rng or not os.path.isfile(path): return super().send_head()
        m = re.match(r'bytes=(\d*)-(\d*)', rng); size = os.path.getsize(path)
        a = int(m.group(1)) if m and m.group(1) else 0; b = int(m.group(2)) if m and m.group(2) else size - 1; b = min(b, size - 1)
        if a > b: self.send_error(416); return None
        f = open(path, 'rb'); f.seek(a); self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path)); self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {a}-{b}/{size}'); self.send_header('Content-Length', str(b - a + 1)); self.end_headers()
        self._left = b - a + 1; return f
    def copyfile(self, src, dst):
        left = getattr(self, '_left', None)
        if left is None: return super().copyfile(src, dst)
        while left > 0:
            chunk = src.read(min(65536, left))
            if not chunk: break
            try: dst.write(chunk)
            except (BrokenPipeError, ConnectionResetError): break
            left -= len(chunk)
        self._left = None
    def end_headers(self):
        if self.path.split('?')[0].endswith(('.mp4', '.webm')): self.send_header('Accept-Ranges', 'bytes'); self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        super().end_headers()
if __name__ == '__main__':
    ThreadingHTTPServer(('', int(sys.argv[1]) if len(sys.argv) > 1 else 8765), H).serve_forever()
