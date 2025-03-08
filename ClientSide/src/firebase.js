// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "lebestate-6c2fe.firebaseapp.com",
    projectId: "lebestate-6c2fe",
    storageBucket: "lebestate-6c2fe.appspot.com",
    messagingSenderId: "739633881491",
    appId: "1:739633881491:web:4645799a4a7013c1378866"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);