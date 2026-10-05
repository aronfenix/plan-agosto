/* Service worker: la app funciona sin conexión.
   Para publicar cambios: sube el número de CACHE. La app avisará de que hay versión nueva. */
const CACHE = 'plan-v3-001';
const ARCHIVOS = ['./','index.html','app.css','app.js','figura.js','ejercicios.js','estiramientos.js','textos.js',
                  'manifest.json','icon-192.png','icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ARCHIVOS);
    /* Paso único desde la app antigua (plan-agosto): tomar el control sin esperar */
    const ks = await caches.keys();
    if(ks.some(k => k.startsWith('plan-agosto'))) await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const ks = await caches.keys();
    await Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => { if(e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const enCache = await caches.match(req, { ignoreSearch:true });
    if(enCache) return enCache;
    try{
      const res = await fetch(req);
      if(res && res.ok){ const c = await caches.open(CACHE); c.put(req, res.clone()); }
      return res;
    }catch(err){
      if(req.mode === 'navigate') return caches.match('index.html');
      throw err;
    }
  })());
});
