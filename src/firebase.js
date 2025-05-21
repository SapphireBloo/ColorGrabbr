// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOtvAsl8n1yYYI474_iD6f2bC5okohVlQ",
  authDomain: "color-picker-fe592.firebaseapp.com",
  projectId: "color-picker-fe592",
  storageBucket: "color-picker-fe592.appspot.com", // ✅ Fixed typo
  messagingSenderId: "364300221921",
  appId: "1:364300221921:web:9d3c6dcf9edb41d6f7a6a0",
  measurementId: "G-B82L74R61E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
