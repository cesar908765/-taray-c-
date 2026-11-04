// worker.js - Service Worker Proxy Katmanı
const CACHE_NAME = 'microbrowser-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Sadece HTTP/HTTPS web isteklerini yakala
  if (!url.startsWith('http://') && !url.startsWith('https://')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // iframe engelleyici başlıkları temizle
        const newHeaders = new Headers(response.headers);
        newHeaders.delete('x-frame-options');
        newHeaders.delete('content-security-policy');
        newHeaders.set('Access-Control-Allow-Origin', '*');

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      })
      .catch(() => {
        // Bağlantı hatası durumunda fallback
        return new Response('<html><body style="background:#000;color:#fff;font-size:10px;text-align:center;padding:10px;">Sayfa yüklenemedi veya CORS engeline takıldı.</body></html>', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      })
  );
});