// 최소한의 서비스워커: 설치 가능(installable) 조건을 만족시키기 위한 용도.
// 게임 자체는 실시간으로 Firebase와 통신해야 하므로 적극적인 오프라인 캐싱은 하지 않고,
// 앱 껍데기(HTML)만 가볍게 캐싱합니다.
const CACHE_NAME = 'station706-shell-v1';
const SHELL_FILES = [ './index.html' ];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// network-first: 온라인이면 항상 최신 버전을 받아오고, 실패했을 때만 캐시로 폴백
self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
