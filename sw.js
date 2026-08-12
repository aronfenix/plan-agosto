/* sw.js — cachea todo para funcionamiento offline completo.
   Sube CACHE (v2, v3…) cada vez que edites archivos para forzar la actualización. */
const CACHE = 'plan-agosto-v4';
const ASSETS = [
  './',
  './index.html',
  './app.css',
  './data.js',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  /* cache:'reload' evita que el navegador sirva una copia vieja al instalar.
     NO se llama a skipWaiting() aquí: el nuevo sw espera a que el usuario
     pulse "Actualizar ahora", para no recargar la pantalla mientras registra. */
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS.map(u => new Request(u, { cache:'reload' }))))
  );
});

/* La app pide el relevo cuando el usuario pulsa "Actualizar ahora" */
self.addEventListener('message', e => { if(e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const claves = await caches.keys();
    await Promise.all(claves.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

/* Cache first: la app no necesita red para nada. */
self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  e.respondWith(
    caches.match(req, { ignoreSearch:true }).then(hit => {
      if(hit) return hit;
      return fetch(req).then(res => {
        if(res && res.status === 200 && res.type === 'basic'){
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({ type:'window', includeUncontrolled:true }).then(ls => {
    for(const c of ls){ if('focus' in c) return c.focus(); }
    if(clients.openWindow) return clients.openWindow('./index.html');
  }));
});
