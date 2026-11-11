const CACHE='hualien-learning-map-v1';
const ASSETS=['./','./index.html','./manifest.webmanifest','./xlsx.full.min.js','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png','./icons/apple-touch-icon.png','./icons/favicon-64.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==location.origin){
    // Google 字型：有網路就用，離線就略過（改用系統字型）
    e.respondWith(caches.open(CACHE).then(c=>fetch(req).then(r=>{if(r.ok)c.put(req,r.clone());return r;}).catch(()=>c.match(req).then(m=>m||new Response('',{status:504})))));
    return;
  }
  if(req.mode==='navigate'){
    // 頁面：先抓新版，失敗再用快取（離線也能開）
    e.respondWith(fetch(req).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return r;}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(m=>m||fetch(req).then(r=>{if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return r;})));
});
