self.addEventListener('push', function(event){
  try{
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Revy';
    const options = {
      body: data.body || 'Nouveau conseil',
      data: { url: data.url || '/' }
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }catch(e){ console.error(e); }
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  const url = event.notification.data && event.notification.data.url || '/';
  event.waitUntil(clients.openWindow(url));
});