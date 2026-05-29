import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD5v5yzp8ErUkLosr3tPyjZxTPrxMqVjfg",
  authDomain: "gutorhear.firebaseapp.com",
  projectId: "gutorhear",
  storageBucket: "gutorhear.firebasestorage.app",
  messagingSenderId: "993830606544",
  appId: "1:993830606544:web:e9f8a11c663ae02e1df0d5",
  measurementId: "G-0KBQ2GC9HC"
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

export { firestore, auth };
