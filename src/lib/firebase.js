// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpfU9zo_nUzVEetRJa8XS5agyxjHb591g",
  authDomain: "login-b778c.firebaseapp.com",
  projectId: "login-b778c",
  storageBucket: "login-b778c.firebasestorage.app",
  messagingSenderId: "801089153945",
  appId: "1:801089153945:web:b66e2b53285873b0718108",
  measurementId: "G-KPPQHQWYCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services we actually need
export const db = getFirestore(app);
export const auth = getAuth(app);

// Export app if needed elsewhere
export default app;

// Removed analytics for now - we'll add it later
