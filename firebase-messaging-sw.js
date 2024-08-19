//firebase FCM Service Worker file
// sw.js
self.addEventListener('push', (event) => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon
    });
});
console.log('This is "firebase-messaging-sw.js" file.');