import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBB1z3rUwUfYo_U4Pywcjr-kh_QcVNY3Qc",
  authDomain: "celevainvitation.firebaseapp.com",
  projectId: "celevainvitation",
  storageBucket: "celevainvitation.firebasestorage.app",
  messagingSenderId: "193249763135",
  appId: "1:193249763135:web:3e820a38be0aa198aa7d8a",
  measurementId: "G-9Q0SLLVLY8"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "celeva");
export const storage = getStorage(app);