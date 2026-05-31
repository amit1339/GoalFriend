import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, getDocs, updateDoc, query, collection, where, setDoc } from "firebase/firestore";
import readline from "readline";

// =========================================================================
// 🎯 PRESET GAME ANSWERS (EASY TO MAINTAIN)
// Define correct answers for games here to resolve them automatically!
// Format: gameId: ["q1_ans", "q2_ans", "q3_ans", "q4_ans", "q5_ans", "q6_ans"]
// Use "A", "B", or "" (to skip/leave unresolved).
// If a game is not defined here, the script runs in interactive prompt mode!
// =========================================================================
const PRESET_ANSWERS = {
  wc01: ["A", "A", "B", "B", "A", "B"], // Preset correct answers for Mexico vs South Africa game
  
  // You can easily add new games here as the tournament progresses:
  // wc02: ["A", "B", "A", "B", "A", "B"],
};

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

// Readline setup for interactive prompt
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (queryText) => {
  return new Promise((resolve) => rl.question(queryText, resolve));
};

// ==========================================
// 🏆 POINT RESOLUTION LOGIC
// ==========================================
const resolveSingleQuestionInFirestore = async (questionId, correctAnswer) => {
  const qRef = doc(firestore, 'predictions', questionId);
  const qSnap = await getDoc(qRef);
  if (!qSnap.exists()) throw new Error(`Question ${questionId} not found in database.`);
  
  const qData = qSnap.data();
  const prevAnswer = qData.correctAnswer || "";
  const points = qData.points || 0;
  const usersA = qData.usersA || [];
  const usersB = qData.usersB || [];

  if (prevAnswer === correctAnswer) {
    console.log(`ℹ️  No change for ${questionId}. Already set to "${correctAnswer}".`);
    return;
  }

  console.log(`🔄 Resolving ${questionId}: "${prevAnswer || "UNRESOLVED"}" ➡️  "${correctAnswer}"`);

  // 1. Revert previous resolution if it existed
  if (prevAnswer === 'A' || prevAnswer === 'B') {
    console.log(`↩️  Reverting previous points awarded for "${prevAnswer}"...`);
    const winners = prevAnswer === 'A' ? usersA : usersB;
    const losers = prevAnswer === 'A' ? usersB : usersA;

    for (const uid of winners) {
      const uRef = doc(firestore, 'users', uid);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        const uData = uSnap.data();
        await updateDoc(uRef, {
          score: Math.max(0, (uData.score || 0) - points),
          correct: Math.max(0, (uData.correct || 0) - 1),
          total: Math.max(0, (uData.total || 0) - 1),
          streak: Math.max(0, (uData.streak || 0) - 1)
        });
      }
    }
    for (const uid of losers) {
      const uRef = doc(firestore, 'users', uid);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        const uData = uSnap.data();
        await updateDoc(uRef, {
          total: Math.max(0, (uData.total || 0) - 1)
        });
      }
    }
  }

  // 2. Apply new resolution
  await updateDoc(qRef, { correctAnswer });

  if (correctAnswer === 'A' || correctAnswer === 'B') {
    const winners = correctAnswer === 'A' ? usersA : usersB;
    const losers = correctAnswer === 'A' ? usersB : usersA;

    console.log(`🎉 Awarding +${points} points to ${winners.length} correct users...`);
    for (const uid of winners) {
      const uRef = doc(firestore, 'users', uid);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        const uData = uSnap.data();
        await updateDoc(uRef, {
          score: (uData.score || 0) + points,
          correct: (uData.correct || 0) + 1,
          total: (uData.total || 0) + 1,
          streak: (uData.streak || 0) + 1
        });
      }
    }
    for (const uid of losers) {
      const uRef = doc(firestore, 'users', uid);
      const uSnap = await getDoc(uRef);
      if (uSnap.exists()) {
        const uData = uSnap.data();
        await updateDoc(uRef, {
          total: (uData.total || 0) + 1,
          streak: 0
        });
      }
    }
  }
  
  console.log(`✅ ${questionId} resolved successfully!\n`);
};

// ==========================================
// 🚀 MAIN EXECUTION
// ==========================================
const run = async () => {
  try {
    console.log("\n==============================================");
    console.log("🏆 GoalFriend Game Resolution System 🏆");
    console.log("==============================================\n");

    // 1. Choose game ID
    const gameIdInput = await askQuestion("👉 Enter game ID (e.g. wc01, wc02): ");
    const gameId = gameIdInput.trim().toLowerCase();
    
    if (!gameId) {
      console.log("❌ Game ID cannot be empty.");
      process.exit(1);
    }

    // 2. Fetch questions for this match from Firestore
    console.log(`\n🔍 Fetching questions for ${gameId}...`);
    const q = query(collection(firestore, 'predictions'), where('matchId', '==', gameId));
    const snap = await getDocs(q);

    let questions = [];
    if (snap.empty) {
      console.log(`⚠️  No questions found for ${gameId} in the database.`);
      const autoGen = await askQuestion("Do you want to auto-generate and upload these questions now? (y/n): ");
      if (autoGen.trim().toLowerCase() === 'y') {
        console.log("🌱 Seeding questions...");
        // Match lists to find teams
        const ALL_MATCHES = [
          { id: 'wc01', teamA: 'מקסיקו', teamB: 'דרום אפריקה' },
          { id: 'wc02', teamA: 'קוריאה הדרומית', teamB: 'צ\'כיה' },
          { id: 'wc03', teamA: 'קנדה', teamB: 'בוסניה' },
          { id: 'wc04', teamA: 'ארה"ב', teamB: 'פרגוואי' },
          { id: 'wc05', teamA: 'קטאר', teamB: 'שוויץ' },
          { id: 'wc06', teamA: 'ברזיל', teamB: 'מרוקו' },
          { id: 'wc07', teamA: 'האיטי', teamB: 'סקוטלנד' },
          { id: 'wc08', teamA: 'ארגנטינה', teamB: 'אורוגוואי' },
          { id: 'wc09', teamA: 'צרפת', teamB: 'קולומביה' },
          { id: 'wc10', teamA: 'ספרד', teamB: 'אקוודור' },
          { id: 'wc11', teamA: 'גרמניה', teamB: 'יפן' },
          { id: 'wc12', teamA: 'פורטוגל', teamB: 'סנגל' },
          { id: 'wc13', teamA: 'אנגליה', teamB: 'ניגריה' },
          { id: 'wc14', teamA: 'הולנד', teamB: 'קרואטיה' },
          { id: 'wc15', teamA: 'בלגיה', teamB: 'דנמרק' },
          { id: 'wc16', teamA: 'איטליה', teamB: 'איראן' },
          { id: 'wc17', teamA: 'מקסיקו', teamB: 'צ\'כיה' },
          { id: 'wc18', teamA: 'דרום אפריקה', teamB: 'קוריאה הדרומית' },
          { id: 'wc19', teamA: 'קנדה', teamB: 'שוויץ' },
          { id: 'wc20', teamA: 'בוסניה', teamB: 'קטאר' },
          { id: 'wc21', teamA: 'ברזיל', teamB: 'סקוטלנד' },
          { id: 'wc22', teamA: 'מרוקו', teamB: 'האיטי' },
          { id: 'wc23', teamA: 'ארה"ב', teamB: 'קולומביה' },
          { id: 'wc24', teamA: 'פרגוואי', teamB: 'צרפת' }
        ];

        const m = ALL_MATCHES.find(x => x.id === gameId) || { teamA: 'קבוצה א', teamB: 'קבוצה ב' };
        const ta = m.teamA;
        const tb = m.teamB;

        const winnerQ = { id: `${gameId}_q1`, text: 'מי תנצח את המשחק בסוף?', category: 'winner', points: 20, emoji: '🏆', optionA: ta, optionB: tb };
        
        const pool = [
          { text: 'מי תכבוש ראשונה?', category: 'goals', points: 10, emoji: '⚽', optionA: ta, optionB: tb },
          { text: 'האם יהיו מעל 2.5 שערים במשחק?', category: 'goals', points: 10, emoji: '🔥', optionA: 'ברור!', optionB: 'ממש לא' },
          { text: 'האם שופט ה-VAR יפסול שער?', category: 'drama', points: 15, emoji: '📺', optionA: 'כן, בדוק', optionB: 'המשחק יזרום' },
          { text: 'איזה קהל יעשה יותר רעש?', category: 'fans', points: 5, emoji: '🏟️', optionA: `האוהדים של ${ta}`, optionB: `האוהדים של ${tb}` },
          { text: 'מי תספוג יותר כרטיסים צהובים?', category: 'cards', points: 10, emoji: '🟨', optionA: ta, optionB: tb },
          { text: 'האם נראה כרטיס אדום במשחק?', category: 'cards', points: 20, emoji: '🟥', optionA: 'כן, משחק אגרסיבי', optionB: 'לא יהיה אדום' },
          { text: 'מי תרוץ יותר קילומטרים?', category: 'stats', points: 10, emoji: '🏃', optionA: ta, optionB: tb }
        ];

        const hash = parseInt(gameId.replace(/\D/g, '') || '1');
        const initial = [winnerQ];
        for (let i = 0; i < 5; i++) {
          const index = (hash * 7 + i * 5) % pool.length;
          initial.push({
            ...pool[index],
            id: `${gameId}_q${i + 2}`,
            matchId: gameId,
            usersA: [],
            usersB: [],
            correctAnswer: ""
          });
        }

        for (const item of initial) {
          await setDoc(doc(firestore, 'predictions', item.id), {
            ...item,
            matchId: gameId,
            usersA: [],
            usersB: [],
            correctAnswer: ""
          });
        }
        console.log("🌱 Questions seeded and uploaded successfully! Restarting resolution...\n");
        process.exit(0);
      } else {
        console.log("❌ Cannot proceed without questions in database.");
        process.exit(1);
      }
    } else {
      questions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }

    // Sort questions from q1 to q6
    questions.sort((a, b) => a.id.localeCompare(b.id));

    console.log(`\n✅ Loaded ${questions.length} questions for ${gameId}.`);
    
    const presets = PRESET_ANSWERS[gameId];
    if (presets) {
      console.log(`🚀 Found predefined preset answers for ${gameId}: [${presets.join(", ")}]`);
    }
    console.log("");

    // 3. Loop and resolve each question
    for (let i = 0; i < questions.length; i++) {
      const qData = questions[i];
      console.log("----------------------------------------------");
      console.log(`📝 Question ${i + 1}/${questions.length} (${qData.id}) - ⭐ ${qData.points} pts`);
      console.log(`❓ ${qData.text}`);
      console.log(`🅰️  Option A: "${qData.optionA}"  [Guessed by: ${qData.usersA?.length || 0} users]`);
      console.log(`🅱️  Option B: "${qData.optionB}"  [Guessed by: ${qData.usersB?.length || 0} users]`);
      console.log(`Current Answer in DB: "${qData.correctAnswer || "UNRESOLVED"}"`);
      console.log("----------------------------------------------");
      
      let ans = "";
      
      // If a preset exists for this question, use it!
      if (presets && presets[i] !== undefined) {
        const presetVal = presets[i].trim().toUpperCase();
        if (presetVal === "A" || presetVal === "B") {
          ans = presetVal;
          console.log(`👉 Using Preset Answer: "${ans}"`);
        } else {
          console.log("⏭️  Preset specified empty answer. Skipping question.");
        }
      } else {
        // Fall back to interactive prompt
        let valid = false;
        while (!valid) {
          const input = await askQuestion("👉 Enter correct answer (A / B, or press Enter to skip/leave unchanged): ");
          const sanitized = input.trim().toUpperCase();
          
          if (sanitized === "") {
            console.log("⏭️  Skipped (leaving unchanged).");
            valid = true;
          } else if (sanitized === "A" || sanitized === "B") {
            ans = sanitized;
            valid = true;
          } else {
            console.log("❌ Invalid input! Please enter only 'A' or 'B', or press Enter to skip.");
          }
        }
      }

      if (ans) {
        await resolveSingleQuestionInFirestore(qData.id, ans);
      }
    }

    console.log("==============================================");
    console.log("🎉 All questions for this game processed successfully!");
    console.log("==============================================\n");
    process.exit(0);

  } catch (err) {
    console.error("\n❌ An error occurred:", err.message);
    process.exit(1);
  }
};

run();
