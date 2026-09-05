const CACHE_NAME = 'tiffin-bill-pwa-v48';
const APP_SHELL = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./sw.js'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;

  // Network-first for HTML navigation: published GitHub Pages changes are
  // picked up while online, with the cached shell retained for offline use.
  if(request.mode==='navigate'){
    event.respondWith(
      fetch(request,{cache:'no-cache'})
        .then(response=>{
          if(response&&response.ok){
            const copy=response.clone();
            caches.open(CACHE_NAME).then(cache=>cache.put('./index.html',copy));
          }
          return response;
        })
        .catch(()=>caches.match('./index.html').then(cached=>cached?cached:Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached=>{
      if(cached) return cached;
      return fetch(request).then(response=>{
        if(response&&response.ok&&new URL(request.url).origin===self.location.origin){
          const copy=response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
        }
        return response;
      });
    })
  );
});
