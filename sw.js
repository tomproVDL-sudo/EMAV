/* EMAV : application utilisable sans réseau. Version 1afe495ac6 (changée automatiquement à chaque nouvelle version de index.html).
   La page est gardée en cache et mise à jour en arrière-plan ; les bibliothèques PDF sont gardées au premier lancement avec réseau. */
const C='emav-1afe495ac6',FILES=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'],
  LIBS=['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(async c=>{await c.addAll(FILES);await Promise.all(LIBS.map(u=>fetch(u,{mode:'no-cors'}).then(r=>c.put(u,r)).catch(()=>{})))}));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);
  if(u.origin===location.origin){e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);return hit||net}));return}
  if(/(^|\.)cdnjs\.cloudflare\.com$|^fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(e.request)||await c.match(u.href);if(hit)return hit;try{const r=await fetch(e.request);c.put(e.request,r.clone());return r}catch(x){return Response.error()}}))});
