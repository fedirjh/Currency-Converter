importScripts('idb.js');
var staticCacheName = 'converter-v1';

self.addEventListener('install', function(event) {
  // TODO: cache /skeleton rather than the root page

  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        'index.html',
        'idb.js',
        'https://free.currencyconverterapi.com/api/v5/currencies',
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('wittr-') &&
                 cacheName != staticCacheName;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  var requestUrl = new URL(event.request.url);
  var apiurlcur = new URL('https://free.currencyconverterapi.com/api/v5/currencies');
  var apiurl = new URL('https://free.currencyconverterapi.com/api/v5/convert'+requestUrl.search);

  if(requestUrl === apiurlcur){
      event.respondWith(caches.match('/api/v5/currencies'));
      return;
  }
  if(requestUrl === apiurl){
      var dbPromise = idb.open('Converter', 2);
      var objx;
        dbPromise.then(db => {
          return db.transaction('mycurrency')
            .objectStore('mycurrency').get(querySt(event.request.url,'q'));
        }).then(obj => objx = obj);
      if(objx){
        event.respondWith(obj);
        return;
      }
      else{
        event.respondWith(fetch(event.request));
        return;
      }
  }
  event.respondWith(
    caches.match(event.request.url).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

function querySt(url,Key) {
    KeysValues = url.split(/[\?&]+/);
    for (i = 0; i < KeysValues.length; i++) {
        KeyValue = KeysValues[i].split("=");
        if (KeyValue[0] == Key) {
            return KeyValue[1];
        }
    }
}
