// firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwDhnFakDxAt1eqfyTnKLf4fcXMGXzFFo",
  authDomain: "student-dashboard-ai.firebaseapp.com",
  projectId: "student-dashboard-ai",
  storageBucket: "student-dashboard-ai.firebasestorage.app",
  messagingSenderId: "184717811431",
  appId: "1:184717811431:web:c9aea9dbfed1d9eae14c42",
  measurementId: "G-Q1B6MR7X7F"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };