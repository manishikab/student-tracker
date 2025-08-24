// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwDhnFakDxAt1eqfyTnKLf4fcXMGXzFFo",
  authDomain: "student-dashboard-ai.firebaseapp.com",
  projectId: "student-dashboard-ai",
  storageBucket: "student-dashboard-ai.firebasestorage.app",
  messagingSenderId: "184717811431",
  appId: "1:184717811431:web:c9aea9dbfed1d9eae14c42",
  measurementId: "G-Q1B6MR7X7F"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
