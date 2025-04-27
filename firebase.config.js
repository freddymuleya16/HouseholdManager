// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAXxRwvfV7kLjpLRBEOQxHvO4CLEI7_arA",
    authDomain: "household-manager-11a8d.firebaseapp.com",
    projectId: "household-manager-11a8d",
    storageBucket: "household-manager-11a8d.firebasestorage.app",
    messagingSenderId: "513639398069",
    appId: "1:513639398069:web:7130875371dbd6c6ea9cfc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const FIRESTORE_DB = getFirestore(app)
export const auth = getAuth(app)
//const analytics = getAnalytics(app);