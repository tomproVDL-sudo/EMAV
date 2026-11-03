/* EMAV : application utilisable sans réseau. La page est gardée en cache et mise à jour en arrière-plan. */
const C='emav-v2',FILES=['./','index.html','manifest.webmanifest','icones/emav.png','icones/emav_192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
  e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(e.request,{ignoreSearch:true});const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);return hit||net}))});
