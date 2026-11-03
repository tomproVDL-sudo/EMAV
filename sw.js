/* EMAV terrain — fonctionnement hors ligne.
   Ce fichier ne fait que garder une copie de l'application sur l'appareil.
   Il n'envoie aucune donnée : les visites et photos restent dans l'appareil jusqu'à l'export. */
const VERSION = 'emav-2026-11-03';
const APP = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
/* bibliothèques publiques pour les PDF, gardées en copie pour marcher sans réseau */
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];
const CDN = /^https:\/\/(cdnjs\.cloudflare\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(APP);
    for (const u of LIBS) { try { await c.put(u, await fetch(u, { mode: 'no-cors' })); } catch (_) {} }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;
  const same = url.startsWith(self.location.origin);
  if (!same && !CDN.test(url)) return;
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    /* page : réseau d'abord (pour recevoir les mises à jour), copie locale sinon */
    if (req.mode === 'navigate') {
      /* réseau faible : au bout de 3 s on ouvre la copie locale */
      const local = await c.match('./index.html');
      try {
        const net = fetch(req).then(r => { if (r.ok) c.put('./index.html', r.clone()); return r; });
        if (!local) return await net;
        return await Promise.race([net, new Promise(ok => setTimeout(() => ok(local), 3000))]);
      } catch (_) { return local || Response.error(); }
    }
    /* le reste : copie locale d'abord */
    const hit = await c.match(req, { ignoreSearch: same });
    if (hit) return hit;
    try {
      const r = await fetch(req);
      if (r.ok || r.type === 'opaque') c.put(req, r.clone());
      return r;
    } catch (_) { return Response.error(); }
  })());
});
