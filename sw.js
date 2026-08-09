const CACHE='tarot-smith-waite-v5';
const CORE=['./','index.html','styles.css','app.js','cards.js','deep.js','manifest.webmanifest','icon-192.png','icon-512.png','apple-touch-icon.png'];

self.window=self;
importScripts('cards.js?v=5');
const CARD_IMAGES=self.TAROT_CARDS.map(card=>card.image);
delete self.window;

async function cacheImage(cache,url,attempt=0){
  try{
    const request=new Request(url,{mode:'no-cors',cache:'reload'});
    const response=await fetch(request);
    if(!response.ok&&response.type!=='opaque')throw new Error(`Image ${response.status}`);
    await cache.put(url,response);
  }catch(error){
    if(attempt>=2)throw error;
    await new Promise(resolve=>setTimeout(resolve,500*(attempt+1)));
    return cacheImage(cache,url,attempt+1);
  }
}

async function cacheDeck(cache){
  const batchSize=8;
  for(let index=0;index<CARD_IMAGES.length;index+=batchSize){
    await Promise.all(CARD_IMAGES.slice(index,index+batchSize).map(url=>cacheImage(cache,url)));
  }
}

self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await cache.addAll(CORE);
  await cacheDeck(cache);
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const local=new URL(event.request.url).origin===self.location.origin;
  if(local){
    event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;}).catch(()=>caches.match(event.request).then(hit=>hit||caches.match('index.html'))));
  }else{
    event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(response=>{const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));return response;})));
  }
});
