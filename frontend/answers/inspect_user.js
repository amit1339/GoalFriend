import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, getDocs, query, collection, where } from "firebase/firestore";

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

const run = async () => {
  const uid = "VoHdEC7ELyZ3L5SGLUIjqHWROW63";
  
  // Fetch user
  const uSnap = await getDoc(doc(firestore, 'users', uid));
  console.log("👤 USER DOC IN FIRESTORE:", uSnap.data());

  // Fetch predictions
  const qA = query(collection(firestore, 'predictions'), where('usersA', 'array-contains', uid));
  const qB = query(collection(firestore, 'predictions'), where('usersB', 'array-contains', uid));
  const [snapA, snapB] = await Promise.all([getDocs(qA), getDocs(qB)]);

  console.log("\n📝 PREDICTIONS IN FIRESTORE:");
  snapA.docs.forEach(d => {
    const q = d.data();
    console.log(`- [A] ${q.id}: "${q.text}" | pts: ${q.points} | correctAnswer: "${q.correctAnswer || "UNRESOLVED"}"`);
  });
  snapB.docs.forEach(d => {
    const q = d.data();
    console.log(`- [B] ${q.id}: "${q.text}" | pts: ${q.points} | correctAnswer: "${q.correctAnswer || "UNRESOLVED"}"`);
  });

  process.exit(0);
};

run();
