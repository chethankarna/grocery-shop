// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBL83onFWj8psW6qER2RrTXbBPDMDXcACI",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "much-shop.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "much-shop",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "much-shop.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "693565449450",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:693565449450:web:655f23fdbab20f1a102393",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1023QD3DC9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
// const analytics = getAnalytics(app);