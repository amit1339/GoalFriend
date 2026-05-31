import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// ==========================================
// 🔥 FIREBASE INITIALIZATION
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyD5v5yzp8ErUkLosr3tPyjZxTPrxMqVjfg",
  authDomain: "gutorhear.firebaseapp.com",
  projectId: "gutorhear",
  storageBucket: "gutorhear.firebasestorage.app",
  messagingSenderId: "993830606544",
  appId: "1:993830606544:web:e9f8a11c663ae02e1df0d5",
  measurementId: "G-0KBQ2GC9HC"
};

console.log("⚡ Connecting to GoalFriend Database...");
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// =========================================================================
// 📝 DEFINE YOUR CUSTOM QUESTIONS TO UPLOAD HERE!
//
// Format:
//   id: Unique question ID (e.g. wc01_q1, wc01_q7, wc02_q1...)
//   matchId: The game ID (e.g. wc01, wc02)
//   text: The question in Hebrew
//   category: The category (e.g. goals, winner, fans, cards, gut, stats)
//   points: Points awarded if correct (number)
//   emoji: Visual icon
//   optionA: Label for option A
//   optionB: Label for option B
// =========================================================================
const QUESTIONS_TO_UPLOAD = [
  // -----------------------------------------------------------------
  // ⚽ Match wc01 - מקסיקו vs דרום אפריקה
  // -----------------------------------------------------------------
  {
    id: "wc01_q1",
    matchId: "wc01",
    text: "מי תנצח את המשחק בסוף?",
    category: "winner",
    points: 20,
    emoji: "🏆",
    optionA: "מקסיקו",
    optionB: "דרום אפריקה"
  },
  {
    id: "wc01_q2",
    matchId: "wc01",
    text: "האם יובקע שער ב-15 הדקות הראשונות?",
    category: "time",
    points: 15,
    emoji: "⏱️",
    optionA: "כן, פתיחה סוערת",
    optionB: "לא, יתחילו רגוע"
  },
  {
    id: "wc01_q3",
    matchId: "wc01",
    text: "האם יובקע שער בתוספת הזמן (דקה 90+)?",
    category: "drama",
    points: 20,
    emoji: "⏳",
    optionA: "דרמה בסיום!",
    optionB: "לא"
  },
  {
    id: "wc01_q4",
    matchId: "wc01",
    text: "מי תכבוש ראשונה?",
    category: "goals",
    points: 10,
    emoji: "⚽",
    optionA: "מקסיקו",
    optionB: "דרום אפריקה"
  },
  {
    id: "wc01_q5",
    matchId: "wc01",
    text: "האם נראה כרטיס אדום במשחק?",
    category: "cards",
    points: 20,
    emoji: "🟥",
    optionA: "כן, משחק אגרסיבי",
    optionB: "לא יהיה אדום"
  },
  {
    id: "wc01_q6",
    matchId: "wc01",
    text: "מי המאמן שיתעצבן ראשון על השופט?",
    category: "gut",
    points: 10,
    emoji: "😤",
    optionA: "המאמן של מקסיקו",
    optionB: "המאמן של דרום אפריקה"
  },
  
  // 🌟 ADDING NEW EXTRA QUESTIONS TO wc01 (E.G. q7, q8!)
  {
    id: "wc01_q7",
    matchId: "wc01",
    text: "איזה קהל יעשה יותר רעש באצטדיון?",
    category: "fans",
    points: 10,
    emoji: " Stadium",
    optionA: "האוהדים של מקסיקו",
    optionB: "האוהדים של דרום אפריקה"
  },

  // -----------------------------------------------------------------
  // ⚽ Match wc02 - קוריאה הדרומית vs צ'כיה (ADD YOUR QUESTIONS HERE)
  // -----------------------------------------------------------------
  {
    id: "wc02_q1",
    matchId: "wc02",
    text: "מי תנצח את המשחק בסוף?",
    category: "winner",
    points: 20,
    emoji: "🏆",
    optionA: "קוריאה הדרומית",
    optionB: "צ'כיה"
  }
];

// ==========================================
// 🚀 UPLOAD PROCESS
// ==========================================
const uploadQuestions = async () => {
  try {
    console.log("\n==============================================");
    console.log("📝 GoalFriend Questions Upload Tool 📝");
    console.log("==============================================\n");
    console.log(`🚀 Preparing to upload ${QUESTIONS_TO_UPLOAD.length} questions...`);

    let addedCount = 0;
    let updatedCount = 0;

    for (const q of QUESTIONS_TO_UPLOAD) {
      const qRef = doc(firestore, 'predictions', q.id);
      const qSnap = await getDoc(qRef);

      if (!qSnap.exists()) {
        // Document does not exist: create it with default list arrays
        const newQuestion = {
          ...q,
          usersA: [],
          usersB: [],
          correctAnswer: ""
        };
        await setDoc(qRef, newQuestion);
        console.log(`➕ Created: ${q.id} - "${q.text}"`);
        addedCount++;
      } else {
        // Document exists: merge the changes to preserve usersA, usersB, and correctAnswer
        const existing = qSnap.data();
        const mergedQuestion = {
          ...existing, // Keep usersA, usersB, correctAnswer, and other existing data
          ...q // Overwrite with new question text, option labels, category, points, emoji
        };
        await setDoc(qRef, mergedQuestion);
        console.log(`🔄 Updated (Preserving answers): ${q.id} - "${q.text}"`);
        updatedCount++;
      }
    }

    console.log("\n==============================================");
    console.log(`🎉 Questions Uploaded Successfully!`);
    console.log(`   ➕ Created new: ${addedCount}`);
    console.log(`   🔄 Updated existing: ${updatedCount}`);
    console.log("==============================================\n");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Upload failed with error:", err.message);
    process.exit(1);
  }
};

uploadQuestions();
