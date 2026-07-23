// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyALpgK3LFnek38V0VSHGtfUwPus5FWMmBk",
  authDomain: "nexus-gen-3d165.firebaseapp.com",
  projectId: "nexus-gen-3d165",
  storageBucket: "nexus-gen-3d165.firebasestorage.app",
  messagingSenderId: "656012452147",
  appId: "1:656012452147:web:b2f1b63cc0ec1ff6a19e46",
  measurementId: "G-N03Y4N4F2E"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
