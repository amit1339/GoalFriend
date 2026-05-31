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
//   category: The category (goals, winner, fans, cards, gut, stats,
//             camera, coaches, crowd, celebrations, random_tv)
//   points: Points awarded if correct (number)
//   emoji: Visual icon
//   optionA: Label for option A
//   optionB: Label for option B
//
// 📺 6 שאלות לכל משחק: 2 כדורגל + 4 טלוויזיה מצחיקות
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
    text: "מי תכבוש ראשונה?",
    category: "goals",
    points: 10,
    emoji: "⚽",
    optionA: "מקסיקו",
    optionB: "דרום אפריקה"
  },
  {
    id: "wc01_q3",
    matchId: "wc01",
    text: "על איזה מאמן יהיה זום ראשון?",
    category: "camera",
    points: 10,
    emoji: "🎥",
    optionA: "המאמן של מקסיקו",
    optionB: "המאמן של דרום אפריקה"
  },
  {
    id: "wc01_q4",
    matchId: "wc01",
    text: "איזו אוהדת יראו ראשונה במצלמה?",
    category: "camera",
    points: 10,
    emoji: "📸",
    optionA: "אוהדת של מקסיקו",
    optionB: "אוהדת של דרום אפריקה"
  },
  {
    id: "wc01_q5",
    matchId: "wc01",
    text: "האם נראה ילד בוכה ביציע?",
    category: "crowd",
    points: 15,
    emoji: "😢",
    optionA: "כן, תמיד יש אחד",
    optionB: "לא, רק שמחה!"
  },
  {
    id: "wc01_q6",
    matchId: "wc01",
    text: "איזה מאמן יוריד את הז'קט ראשון?",
    category: "coaches",
    points: 10,
    emoji: "🧥",
    optionA: "המאמן של מקסיקו",
    optionB: "המאמן של דרום אפריקה"
  },

  // -----------------------------------------------------------------
  // ⚽ Match wc02 - קוריאה הדרומית vs צ'כיה
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
  },
  {
    id: "wc02_q2",
    matchId: "wc02",
    text: "האם נראה כרטיס אדום במשחק?",
    category: "cards",
    points: 20,
    emoji: "🟥",
    optionA: "כן, משחק אגרסיבי",
    optionB: "לא יהיה אדום"
  },
  {
    id: "wc02_q3",
    matchId: "wc02",
    text: "מה נראה קודם — שחקן יורק או שחקן מתנשף?",
    category: "camera",
    points: 5,
    emoji: "🤢",
    optionA: "יריקה אגדית",
    optionB: "נשיפה דרמטית"
  },
  {
    id: "wc02_q4",
    matchId: "wc02",
    text: "האם נראה אוהד עם פנים צבועות?",
    category: "crowd",
    points: 5,
    emoji: "🎨",
    optionA: "כן, צביעת פנים מלאה!",
    optionB: "לא, אוהדים רגילים"
  },
  {
    id: "wc02_q5",
    matchId: "wc02",
    text: "האם שחקן יחגוג שער עם סלטה?",
    category: "celebrations",
    points: 15,
    emoji: "🤸",
    optionA: "כן, אקרובטיקה!",
    optionB: "לא, חגיגה רגועה"
  },
  {
    id: "wc02_q6",
    matchId: "wc02",
    text: "מי יזרוק בקבוק מים ראשון — מאמן או שחקן?",
    category: "coaches",
    points: 10,
    emoji: "💦",
    optionA: "מאמן עצבני",
    optionB: "שחקן מתוסכל"
  },

  // -----------------------------------------------------------------
  // ⚽ Match wc03 - קנדה vs בוסניה
  // -----------------------------------------------------------------
  {
    id: "wc03_q1",
    matchId: "wc03",
    text: "מי תנצח את המשחק בסוף?",
    category: "winner",
    points: 20,
    emoji: "🏆",
    optionA: "קנדה",
    optionB: "בוסניה"
  },
  {
    id: "wc03_q2",
    matchId: "wc03",
    text: "האם יובקע שער ב-15 הדקות הראשונות?",
    category: "time",
    points: 15,
    emoji: "⏱️",
    optionA: "כן, פתיחה סוערת",
    optionB: "לא, יתחילו רגוע"
  },
  {
    id: "wc03_q3",
    matchId: "wc03",
    text: "איזה מאמן יעשה פרצוף מאוכזב ראשון?",
    category: "coaches",
    points: 5,
    emoji: "😩",
    optionA: "המאמן של קנדה",
    optionB: "המאמן של בוסניה"
  },
  {
    id: "wc03_q4",
    matchId: "wc03",
    text: "האם נתפוס זוג מתנשק ביציע?",
    category: "crowd",
    points: 10,
    emoji: "💋",
    optionA: "כן, kiss cam!",
    optionB: "לא הפעם"
  },
  {
    id: "wc03_q5",
    matchId: "wc03",
    text: "מה תהיה חגיגת השער הראשונה?",
    category: "celebrations",
    points: 10,
    emoji: "💃",
    optionA: "ריקוד מטורף",
    optionB: "חיבוק קבוצתי"
  },
  {
    id: "wc03_q6",
    matchId: "wc03",
    text: "האם הכדור יפגע במצלמה או בשופט?",
    category: "random_tv",
    points: 20,
    emoji: "🎯",
    optionA: "כן, headshot!",
    optionB: "לא, הכל בשליטה"
  },

  // -----------------------------------------------------------------
  // ⚽ Match wc04 - ארה"ב vs פרגוואי
  // -----------------------------------------------------------------
  {
    id: "wc04_q1",
    matchId: "wc04",
    text: "מי תנצח את המשחק בסוף?",
    category: "winner",
    points: 20,
    emoji: "🏆",
    optionA: "ארה\"ב",
    optionB: "פרגוואי"
  },
  {
    id: "wc04_q2",
    matchId: "wc04",
    text: "מי המאמן שיתעצבן ראשון על השופט?",
    category: "gut",
    points: 10,
    emoji: "😤",
    optionA: "המאמן של ארה\"ב",
    optionB: "המאמן של פרגוואי"
  },
  {
    id: "wc04_q3",
    matchId: "wc04",
    text: "על איזה מאמן יהיה זום ראשון?",
    category: "camera",
    points: 10,
    emoji: "🎥",
    optionA: "המאמן של ארה\"ב",
    optionB: "המאמן של פרגוואי"
  },
  {
    id: "wc04_q4",
    matchId: "wc04",
    text: "האם נראה אוהד עם שלט מצחיק?",
    category: "crowd",
    points: 10,
    emoji: "🪧",
    optionA: "כן, תמיד יש קומיקאי",
    optionB: "לא, אוהדים רציניים"
  },
  {
    id: "wc04_q5",
    matchId: "wc04",
    text: "האם נראה שחקן מצביע למצלמה אחרי שער?",
    category: "celebrations",
    points: 5,
    emoji: "👆",
    optionA: "כן, דרישת שלום למשפחה",
    optionB: "לא"
  },
  {
    id: "wc04_q6",
    matchId: "wc04",
    text: "האם נראה אוהד ישן ביציע?",
    category: "random_tv",
    points: 15,
    emoji: "😴",
    optionA: "כן, משעמם לו",
    optionB: "אין סיכוי, האצטדיון רועש!"
  },

  // -----------------------------------------------------------------
  // ⚽ Match wc05 - קטאר vs שוויץ
  // -----------------------------------------------------------------
  {
    id: "wc05_q1",
    matchId: "wc05",
    text: "מי תנצח את המשחק בסוף?",
    category: "winner",
    points: 20,
    emoji: "🏆",
    optionA: "קטאר",
    optionB: "שוויץ"
  },
  {
    id: "wc05_q2",
    matchId: "wc05",
    text: "האם יובקע שער בתוספת הזמן (דקה 90+)?",
    category: "drama",
    points: 20,
    emoji: "⏳",
    optionA: "דרמה בסיום!",
    optionB: "לא"
  },
  {
    id: "wc05_q3",
    matchId: "wc05",
    text: "איזו אוהדת יראו ראשונה במצלמה?",
    category: "camera",
    points: 10,
    emoji: "📸",
    optionA: "אוהדת של קטאר",
    optionB: "אוהדת של שוויץ"
  },
  {
    id: "wc05_q4",
    matchId: "wc05",
    text: "מי יעשה 'גל' (wave) ראשון ביציע?",
    category: "crowd",
    points: 10,
    emoji: "🌊",
    optionA: "אוהדי קטאר",
    optionB: "אוהדי שוויץ"
  },
  {
    id: "wc05_q5",
    matchId: "wc05",
    text: "איזה מאמן יוריד את הז'קט ראשון?",
    category: "coaches",
    points: 10,
    emoji: "🧥",
    optionA: "המאמן של קטאר",
    optionB: "המאמן של שוויץ"
  },
  {
    id: "wc05_q6",
    matchId: "wc05",
    text: "האם יהיה עיכוב משעשע (פולש למגרש, בעיה טכנית)?",
    category: "random_tv",
    points: 15,
    emoji: "🚨",
    optionA: "כן, הפתעות!",
    optionB: "לא, הכל חלק"
  },

  // -----------------------------------------------------------------
  // ⚽ Match wc06 - ברזיל vs מרוקו
  // -----------------------------------------------------------------
  {
    id: "wc06_q1",
    matchId: "wc06",
    text: "מי תנצח את המשחק בסוף?",
    category: "winner",
    points: 20,
    emoji: "🏆",
    optionA: "ברזיל",
    optionB: "מרוקו"
  },
  {
    id: "wc06_q2",
    matchId: "wc06",
    text: "איזה קהל יעשה יותר רעש באצטדיון?",
    category: "fans",
    points: 10,
    emoji: "🏟️",
    optionA: "האוהדים של ברזיל",
    optionB: "האוהדים של מרוקו"
  },
  {
    id: "wc06_q3",
    matchId: "wc06",
    text: "על איזה מאמן יהיה זום ראשון?",
    category: "camera",
    points: 10,
    emoji: "🎥",
    optionA: "המאמן של ברזיל",
    optionB: "המאמן של מרוקו"
  },
  {
    id: "wc06_q4",
    matchId: "wc06",
    text: "האם נראה אוהד עם פנים צבועות?",
    category: "crowd",
    points: 5,
    emoji: "🎨",
    optionA: "כן, צביעת פנים מלאה!",
    optionB: "לא, אוהדים רגילים"
  },
  {
    id: "wc06_q5",
    matchId: "wc06",
    text: "האם נראה שחקן שעושה 'שששש' לקהל היריב?",
    category: "celebrations",
    points: 15,
    emoji: "🤫",
    optionA: "כן, פרובוקציה!",
    optionB: "לא, כולם מכבדים"
  },
  {
    id: "wc06_q6",
    matchId: "wc06",
    text: "האם המצלמה תתפוס VIP ביציע?",
    category: "random_tv",
    points: 10,
    emoji: "⭐",
    optionA: "כן, מפורסמים באצטדיון!",
    optionB: "לא נראה"
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

    // ==========================================
    // 🔄 UPDATE MATCH PREDICTIONS ARRAYS
    // ==========================================
    console.log("\n🔄 Updating match predictions arrays in matches collection...");
    const matchQuestionMap = {};
    for (const q of QUESTIONS_TO_UPLOAD) {
      if (!matchQuestionMap[q.matchId]) matchQuestionMap[q.matchId] = [];
      matchQuestionMap[q.matchId].push(q.id);
    }

    let matchesUpdated = 0;
    for (const [matchId, questionIds] of Object.entries(matchQuestionMap)) {
      const matchRef = doc(firestore, 'matches', matchId);
      const matchSnap = await getDoc(matchRef);
      if (matchSnap.exists()) {
        const matchData = matchSnap.data();
        const existingPreds = matchData.predictions || [];
        const allPreds = [...new Set([...existingPreds, ...questionIds])].sort();
        await setDoc(matchRef, { ...matchData, predictions: allPreds });
        console.log(`   ✅ ${matchId}: predictions updated (${existingPreds.length} → ${allPreds.length} questions)`);
        matchesUpdated++;
      } else {
        console.log(`   ⚠️  ${matchId}: match document not found in Firestore (will be created on first app load)`);
      }
    }

    console.log("\n==============================================");
    console.log(`🎉 Upload Complete!`);
    console.log(`   📝 Questions: ➕ ${addedCount} created, 🔄 ${updatedCount} updated`);
    console.log(`   🏟️  Matches updated: ${matchesUpdated}`);
    console.log("==============================================\n");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ Upload failed with error:", err.message);
    process.exit(1);
  }
};

uploadQuestions();
