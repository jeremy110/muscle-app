/**
 * Service Worker — 肌肉互動 PWA
 *
 * 快取策略:
 *  - App shell (HTML / manifest / icons):cache-first
 *  - 外部函式庫 (three.js / draco from unpkg):cache-first
 *  - .glb / .gltf 模型檔:network-first(載最新,離線時退到快取)
 *  - 其他:network-first
 *
 * 升版:改 CACHE_VERSION,瀏覽器會在下次訪問時清掉舊快取。
 */

const CACHE_VERSION = 'muscle-app-v7';
const APP_SHELL_CACHE = `${CACHE_VERSION}-shell`;
const LIB_CACHE = `${CACHE_VERSION}-libs`;
const MODEL_CACHE = `${CACHE_VERSION}-models`;

// App shell:安裝時就快取
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
];

// 外部函式庫主機(從 CDN 來的就 cache-first)
const LIB_HOSTS = ['unpkg.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'];

// === 安裝 ===
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// === 啟用:清掉舊版快取 ===
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

// === 攔截 fetch ===
self.addEventListener('fetch', (event) => {
  const req = event.request;
  // 只處理 GET
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 模型檔:network-first
  if (url.pathname.endsWith('.glb') || url.pathname.endsWith('.gltf')) {
    event.respondWith(networkFirst(req, MODEL_CACHE));
    return;
  }

  // 外部函式庫:cache-first
  if (LIB_HOSTS.some((h) => url.hostname.includes(h))) {
    event.respondWith(cacheFirst(req, LIB_CACHE));
    return;
  }

  // 同網域 app shell:cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, APP_SHELL_CACHE));
    return;
  }

  // 其他:照常 fetch
});

// ---------------- 策略 ----------------

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const resp = await fetch(req);
    if (resp && resp.ok) cache.put(req, resp.clone());
    return resp;
  } catch (e) {
    // 離線且沒快取
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const resp = await fetch(req);
    if (resp && resp.ok) cache.put(req, resp.clone());
    return resp;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response('Offline and no cache', { status: 503 });
  }
}
