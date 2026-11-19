importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "soss-7ed46.firebaseapp.com",
  projectId: "soss-7ed46",
  storageBucket: "soss-7ed46.firebasestorage.app",
  messagingSenderId: "209917304590",
  appId: "1:209917304590:web:45f026fece75ef4a6e015f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg',
    requireInteraction: true,
    vibrate: [300, 100, 300, 100, 300]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
