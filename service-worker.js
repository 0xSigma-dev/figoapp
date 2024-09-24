const CACHE_NAME = 'loader-cache-v1';
const LOTTIE_FOLDER = '/lottie/'; // Updated path for public directory
import { setLogLevel } from 'workbox-core';

setLogLevel('error');

// Cache Lottie files during installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    fetch(`${LOTTIE_FOLDER}manifest.json`)
      .then(response => response.json())
      .then(data => {
        const urlsToCache = data.files.map(file => `${LOTTIE_FOLDER}${file}`);
        return caches.open(CACHE_NAME).then((cache) => {
          return cache.addAll(urlsToCache);
        });
      })
      .catch(error => {
        console.error('Failed to fetch Lottie manifest:', error);
      })
  );
});

// Serve cached files and update cache when new files are fetched
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // Return cached response
      }
      return fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    }).catch((error) => {
      console.error('Fetch failed:', error);
      throw error;
    })
  );
});


self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).catch((error) => {
      console.error('Activation failed:', error);
    })
  );
});


self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'New Message';
  const options = {
    body: data.body || 'You have received a new message.',
    icon: '/icons/Figo.png',
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});


self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});



