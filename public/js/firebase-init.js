import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Get config from server or use a public-safe method
const firebaseConfig = {
  // Use the config provided in firebase-applet-config.json
  // Since this is client-side, make sure no secrets are here.
  // The RPC setup provides it. I need to make sure it's accessible.
};

// For now, let's fetch it from a secure endpoint
async function initFirebase() {
  const response = await fetch('/api/firebase-config');
  const config = await response.json();
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);
  const auth = getAuth(app);
  
  window.db = db;
  window.auth = auth;
  console.log("Firebase initialized");
}

initFirebase();
