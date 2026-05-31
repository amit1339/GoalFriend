import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, getDocs, updateDoc, query, collection, where } from "firebase/firestore";

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

const run = async () => {
  try {
    console.log("\n==============================================");
    console.log("📊 Global Stats Recalculation System 📊");
    console.log("==============================================\n");

    // 1. Fetch all users
    console.log("🔍 Fetching all users from database...");
    const userSnap = await getDocs(collection(firestore, 'users'));
    const users = userSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    console.log(`✅ Loaded ${users.length} users.\n`);

    for (const user of users) {
      console.log(`----------------------------------------------`);
      console.log(`👤 Processing User: "${user.name}" (${user.id})`);

      // A. Fetch predictions
      const qA = query(collection(firestore, 'predictions'), where('usersA', 'array-contains', user.id));
      const qB = query(collection(firestore, 'predictions'), where('usersB', 'array-contains', user.id));
      const [snapA, snapB] = await Promise.all([getDocs(qA), getDocs(qB)]);

      const userPreds = [];
      snapA.docs.forEach(d => {
        userPreds.push({ ...d.data(), userAns: 'A' });
      });
      snapB.docs.forEach(d => {
        userPreds.push({ ...d.data(), userAns: 'B' });
      });

      // B. Sort predictions chronologically (e.g. wc01_q1 < wc01_q6 < wc02_q1)
      userPreds.sort((a, b) => a.id.localeCompare(b.id));
      console.log(`   📝 Found ${userPreds.length} total predictions.`);

      // C. Calculate stats
      let score = 0;
      let correct = 0;
      let total = 0;
      let streak = 0;
      let bestStreak = 0;

      for (const pred of userPreds) {
        if (pred.correctAnswer && pred.correctAnswer !== "") {
          total += 1;
          const isCorrect = (pred.userAns === pred.correctAnswer);
          if (isCorrect) {
            score += (pred.points || 0);
            correct += 1;
            streak += 1;
            bestStreak = Math.max(bestStreak, streak);
          } else {
            streak = 0;
          }
        }
      }

      console.log(`   📊 Calculated Stats:`);
      console.log(`      ⭐ Score: ${score} (Old: ${user.score || 0})`);
      console.log(`      🔥 Streak: ${streak} (Old: ${user.streak || 0})`);
      console.log(`      🏆 Best Streak: ${bestStreak} (Old: ${user.bestStreak || 0})`);
      console.log(`      🎯 Correct: ${correct}/${total}`);

      // D. Save back to Firestore
      const uRef = doc(firestore, 'users', user.id);
      await updateDoc(uRef, {
        score,
        correct,
        total,
        streak,
        bestStreak
      });
      console.log(`   ✅ Stats updated successfully!`);
    }

    console.log("\n==============================================");
    console.log("🎉 All users recalculated successfully!");
    console.log("==============================================\n");
    process.exit(0);

  } catch (err) {
    console.error("❌ An error occurred during recalculation:", err.message);
    process.exit(1);
  }
};

run();
