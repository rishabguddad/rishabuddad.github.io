const CACHE_NAME = 'tiffin-bill-pwa-v46';
const APP_SHELL = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./sw.js'];

// iPhone/iPad get a slightly roomier menu-card layout so the UI feels as
// readable as the Android version instead of fitting an extra row on screen.
const IOS_LAYOUT = `
<style id="ios-layout-v46">
.ios-layout .grid{gap:6px}
.ios-layout .pic{height:72px}
.ios-layout .body{padding:4px 5px 5px}
.ios-layout .name{font-size:14px;line-height:1.14}
.ios-layout .price{font-size:15px;margin-top:3px}
.ios-layout .add{height:30px;margin-top:5px;font-size:14px}
</style>
<script>
(function(){
  var p=navigator.platform||'';
  var ios=/iPhone|iPad|iPod/.test(p)||(p==='MacIntel'&&navigator.maxTouchPoints>1);
  if(ios)document.documentElement.classList.add('ios-layout');
})();
</script>`;

function applyIOSLayout(response) {
  return response.text().then(html => {
    if (html.indexOf('ios-layout-v46') !== -1) return new Response(html, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
    const updated = html.replace('</head>', IOS_LAYOUT + '</head>');
    return new Response(updated, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    });
  });
}

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  // Navigation is network-first so GitHub Pages updates are picked up
  // immediately. The cached app remains available when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
          }
          return applyIOSLayout(response);
        })
        .catch(() => caches.match('./index.html').then(cached => cached ? applyIOSLayout(cached) : Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok && new URL(request.url).origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
