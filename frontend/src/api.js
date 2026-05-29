import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, 
  query, where, addDoc, arrayUnion
} from 'firebase/firestore';

import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, firestore } from './firebase';

// Helper to handle Firebase errors gracefully
const tryFirebase = async (firebaseFunc, fallbackFunc) => {
  try {
    return await firebaseFunc();
  } catch (err) {
    console.warn("Firebase Error:", err.message, "Using local fallback.");
    return fallbackFunc();
  }
};

export const api = {
  loginWithGoogle: async () => {
    return tryFirebase(
      async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userId = user.uid;
        
        // Ensure user exists in Firestore
        const userRef = doc(firestore, 'users', userId);
        const snap = await getDoc(userRef);
        let userData;
        
        if (!snap.exists()) {
          userData = { id: userId, name: user.displayName, avatar: user.photoURL || '😎', score: 0, streak: 0, correct: 0, total: 0, groups: [] };
          await setDoc(userRef, userData);
        } else {
          userData = snap.data();
        }
        
        return userData;
      },
      async () => {
        // Fallback for local testing if Firebase is still blocked
        const userId = 'u_' + Math.random().toString(36).substr(2, 9);
        const userData = { id: userId, name: 'משתמש גוגל (טסט)', avatar: '😎', score: 0, streak: 0, correct: 0, total: 0, groups: [] };
        localStorage.setItem('gut_or_heart_user', JSON.stringify(userData));
        return userData;
      }
    );
  },

  getUser: async (id) => {
    return tryFirebase(
      async () => {
        const docSnap = await getDoc(doc(firestore, 'users', id));
        if (docSnap.exists()) return docSnap.data();
        throw new Error('Not found');
      },
      () => {
        const user = localStorage.getItem('gut_or_heart_user');
        if (user) return JSON.parse(user);
        throw new Error('Not found');
      }
    );
  },

  getMatches: async () => {
    return tryFirebase(
      async () => {
        const snap = await getDocs(collection(firestore, 'matches'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },
      () => {
        const NATIONS = {
          'ארגנטינה': 'https://flagcdn.com/w40/ar.png',
          'ברזיל': 'https://flagcdn.com/w40/br.png',
          'צרפת': 'https://flagcdn.com/w40/fr.png',
          'אנגליה': 'https://flagcdn.com/w40/gb-eng.png',
          'ספרד': 'https://flagcdn.com/w40/es.png',
          'גרמניה': 'https://flagcdn.com/w40/de.png',
          'פורטוגל': 'https://flagcdn.com/w40/pt.png',
          'איטליה': 'https://flagcdn.com/w40/it.png',
          'הולנד': 'https://flagcdn.com/w40/nl.png',
          'בלגיה': 'https://flagcdn.com/w40/be.png',
          'קרואטיה': 'https://flagcdn.com/w40/hr.png',
          'אורוגוואי': 'https://flagcdn.com/w40/uy.png',
          'קולומביה': 'https://flagcdn.com/w40/co.png',
          'מקסיקו': 'https://flagcdn.com/w40/mx.png',
          'ארה"ב': 'https://flagcdn.com/w40/us.png',
          'קנדה': 'https://flagcdn.com/w40/ca.png',
          'קוריאה הדרומית': 'https://flagcdn.com/w40/kr.png',
          'יפן': 'https://flagcdn.com/w40/jp.png',
          'איראן': 'https://flagcdn.com/w40/ir.png',
          'ערב הסעודית': 'https://flagcdn.com/w40/sa.png',
          'סנגל': 'https://flagcdn.com/w40/sn.png',
          'מרוקו': 'https://flagcdn.com/w40/ma.png',
          'ניגריה': 'https://flagcdn.com/w40/ng.png',
          'מצרים': 'https://flagcdn.com/w40/eg.png',
          'קמרון': 'https://flagcdn.com/w40/cm.png',
          'חוף השנהב': 'https://flagcdn.com/w40/ci.png',
          'אוסטרליה': 'https://flagcdn.com/w40/au.png',
          'שוויץ': 'https://flagcdn.com/w40/ch.png',
          'דנמרק': 'https://flagcdn.com/w40/dk.png',
          'שבדיה': 'https://flagcdn.com/w40/se.png',
          'פולין': 'https://flagcdn.com/w40/pl.png',
          'סרביה': 'https://flagcdn.com/w40/rs.png',
          'ווילס': 'https://flagcdn.com/w40/gb-wls.png',
          'אקוודור': 'https://flagcdn.com/w40/ec.png',
          'פרו': 'https://flagcdn.com/w40/pe.png',
          'צ\'ילה': 'https://flagcdn.com/w40/cl.png',
          'פרגוואי': 'https://flagcdn.com/w40/py.png',
          'אלג\'יריה': 'https://flagcdn.com/w40/dz.png',
          'תוניסיה': 'https://flagcdn.com/w40/tn.png',
          'מאלי': 'https://flagcdn.com/w40/ml.png',
          'גאנה': 'https://flagcdn.com/w40/gh.png',
          'ניו זילנד': 'https://flagcdn.com/w40/nz.png',
          'קוסטה ריקה': 'https://flagcdn.com/w40/cr.png',
          'פנמה': 'https://flagcdn.com/w40/pa.png',
          'ג\'מייקה': 'https://flagcdn.com/w40/jm.png',
          'דרום אפריקה': 'https://flagcdn.com/w40/za.png',
          'קטאר': 'https://flagcdn.com/w40/qa.png',
          'סקוטלנד': 'https://flagcdn.com/w40/gb-sct.png',
          'צ\'כיה': 'https://flagcdn.com/w40/cz.png',
          'בוסניה': 'https://flagcdn.com/w40/ba.png',
          'האיטי': 'https://flagcdn.com/w40/ht.png'
        };

        return [
          { id: 'm1', teamA: 'מקסיקו', teamB: 'דרום אפריקה', teamAFlag: NATIONS['מקסיקו'], teamBFlag: NATIONS['דרום אפריקה'], time: '11 יוני, 22:00', status: 'upcoming' },
          { id: 'm2', teamA: 'קוריאה הדרומית', teamB: 'צ\'כיה', teamAFlag: NATIONS['קוריאה הדרומית'], teamBFlag: NATIONS['צ\'כיה'], time: '12 יוני, 05:00', status: 'upcoming' },
          { id: 'm3', teamA: 'קנדה', teamB: 'בוסניה', teamAFlag: NATIONS['קנדה'], teamBFlag: NATIONS['בוסניה'], time: '12 יוני, 22:00', status: 'upcoming' },
          { id: 'm4', teamA: 'ארה"ב', teamB: 'פרגוואי', teamAFlag: NATIONS['ארה"ב'], teamBFlag: NATIONS['פרגוואי'], time: '13 יוני, 04:00', status: 'upcoming' },
          { id: 'm5', teamA: 'קטאר', teamB: 'שוויץ', teamAFlag: NATIONS['קטאר'], teamBFlag: NATIONS['שוויץ'], time: '13 יוני, 22:00', status: 'upcoming' },
          { id: 'm6', teamA: 'ברזיל', teamB: 'מרוקו', teamAFlag: NATIONS['ברזיל'], teamBFlag: NATIONS['מרוקו'], time: '14 יוני, 01:00', status: 'upcoming' },
          { id: 'm7', teamA: 'האיטי', teamB: 'סקוטלנד', teamAFlag: NATIONS['האיטי'], teamBFlag: NATIONS['סקוטלנד'], time: '14 יוני, 04:00', status: 'upcoming' }
        ];
      }
    );
  },

  getQuestions: async (matchId) => {
    return tryFirebase(
      async () => {
        const q = query(collection(firestore, 'questions'), where('matchId', '==', matchId));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },
      () => {
        const matches = [
          { id: 'm1', teamA: 'מקסיקו', teamB: 'דרום אפריקה' },
          { id: 'm2', teamA: 'קוריאה הדרומית', teamB: 'צ\'כיה' },
          { id: 'm3', teamA: 'קנדה', teamB: 'בוסניה' },
          { id: 'm4', teamA: 'ארה"ב', teamB: 'פרגוואי' },
          { id: 'm5', teamA: 'קטאר', teamB: 'שוויץ' },
          { id: 'm6', teamA: 'ברזיל', teamB: 'מרוקו' },
          { id: 'm7', teamA: 'האיטי', teamB: 'סקוטלנד' }
        ];
        const m = matches.find(x => x.id === matchId) || matches[0];
        const ta = m.teamA;
        const tb = m.teamB;

        const winnerQ = { id: `${matchId}_q_win`, text: 'מי תנצח את המשחק בסוף?', category: 'winner', points: 20, emoji: '🏆', optionA: ta, optionB: tb };

        const pool = [
          { id: `${matchId}_q1`, text: 'מי תכבוש ראשונה?', category: 'goals', points: 10, emoji: '⚽', optionA: ta, optionB: tb },
          { id: `${matchId}_q2`, text: 'האם יהיו מעל 2.5 שערים במשחק?', category: 'goals', points: 10, emoji: '🔥', optionA: 'ברור!', optionB: 'ממש לא' },
          { id: `${matchId}_q3`, text: 'האם שופט ה-VAR יפסול שער?', category: 'drama', points: 15, emoji: '📺', optionA: 'כן, בדוק', optionB: 'המשחק יזרום' },
          { id: `${matchId}_q4`, text: 'איזה קהל יעשה יותר רעש?', category: 'fans', points: 5, emoji: '🏟️', optionA: `האוהדים של ${ta}`, optionB: `האוהדים של ${tb}` },
          { id: `${matchId}_q5`, text: 'מי תספוג יותר כרטיסים צהובים?', category: 'cards', points: 10, emoji: '🟨', optionA: ta, optionB: tb },
          { id: `${matchId}_q6`, text: 'האם נראה כרטיס אדום במשחק?', category: 'cards', points: 20, emoji: '🟥', optionA: 'כן, משחק אגרסיבי', optionB: 'לא יהיה אדום' },
          { id: `${matchId}_q7`, text: 'מי תרוץ יותר קילומטרים?', category: 'stats', points: 10, emoji: '🏃', optionA: ta, optionB: tb },
          { id: `${matchId}_q8`, text: 'האם יובקע שער ב-15 הדקות הראשונות?', category: 'time', points: 15, emoji: '⏱️', optionA: 'כן, פתיחה סוערת', optionB: 'לא, יתחילו רגוע' },
          { id: `${matchId}_q9`, text: 'האם נראה פנדל מוחמץ?', category: 'drama', points: 25, emoji: '🥅', optionA: 'כן!', optionB: 'אין סיכוי' },
          { id: `${matchId}_q10`, text: 'איזו קבוצה תיראה יותר לחוצה במחצית הראשונה?', category: 'gut', points: 10, emoji: '🧠', optionA: ta, optionB: tb },
          { id: `${matchId}_q11`, text: 'מי המאמן שיתעצבן ראשון על השופט?', category: 'gut', points: 10, emoji: '😤', optionA: `המאמן של ${ta}`, optionB: `המאמן של ${tb}` },
          { id: `${matchId}_q12`, text: 'האם שחקן מחליף יכבוש שער?', category: 'players', points: 15, emoji: '🔄', optionA: 'כן, חילוף מנצח', optionB: 'לא' },
          { id: `${matchId}_q13`, text: 'האם יובקע שער בתוספת הזמן (דקה 90+)?', category: 'drama', points: 20, emoji: '⏳', optionA: 'דרמה בסיום!', optionB: 'לא' },
          { id: `${matchId}_q14`, text: 'מי תחזיק יותר בכדור (פוזשן)?', category: 'stats', points: 10, emoji: '📊', optionA: ta, optionB: tb },
          { id: `${matchId}_q15`, text: 'האם נראה שער בבעיטה חופשית ישירה?', category: 'magic', points: 20, emoji: '✨', optionA: 'שער לחיבורים!', optionB: 'לא' },
          { id: `${matchId}_q16`, text: 'מי תבצע יותר עבירות?', category: 'cards', points: 10, emoji: '⚔️', optionA: ta, optionB: tb },
          { id: `${matchId}_q17`, text: 'האם המשחק יסתיים בתיקו?', category: 'winner', points: 15, emoji: '🤝', optionA: 'כן, יגמר שוויון', optionB: 'תהיה הכרעה' }
        ];

        // Seed random choice based on matchId to keep questions stable on reload
        const hash = parseInt(matchId.replace(/\D/g, '') || '1');
        const selected = [];
        for (let i = 0; i < 4; i++) {
          const index = (hash * 7 + i * 5) % pool.length;
          selected.push(pool[index]);
        }

        return [winnerQ, ...selected];
      }
    );
  },

  getPredictions: async (userId) => {
    return tryFirebase(
      async () => {
        const q = query(collection(firestore, 'predictions'), where('userId', '==', userId));
        const snap = await getDocs(q);
        return snap.docs.map(d => d.data());
      },
      () => {
        return JSON.parse(localStorage.getItem('gut_preds') || '[]');
      }
    );
  },

  getUnanswered: async (userId, matchId) => {
    const questions = await api.getQuestions(matchId);
    const predictions = await api.getPredictions(userId);
    const answeredIds = predictions.map(p => p.questionId);
    return questions.filter(q => !answeredIds.includes(q.id));
  },

  getAllQuestions: async (userId) => {
    const matches = await api.getMatches();
    const predictions = await api.getPredictions(userId);
    const predMap = {};
    predictions.forEach(p => predMap[p.questionId] = p.answer);

    // For simplicity, just return the mock questions for each match
    return matches.map(match => {
      // Get the questions for this match synchronously (in mock) or we can just fetch
      // But since getAllQuestions is just for display, let's keep it simple
      return {
        ...match,
        questions: [] 
      };
    });
  },

  submitPrediction: async (userId, questionId, answer) => {
    const predId = `${userId}_${questionId}`;
    return tryFirebase(
      async () => {
        await setDoc(doc(firestore, 'predictions', predId), { userId, questionId, answer });
        return { success: true };
      },
      () => {
        const preds = JSON.parse(localStorage.getItem('gut_preds') || '[]');
        preds.push({ questionId, answer });
        localStorage.setItem('gut_preds', JSON.stringify(preds));
        return { success: true };
      }
    );
  },

  createGroup: async (name, creatorId, poolAmount, emoji) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const groupData = { name, creatorId, poolAmount, emoji, inviteCode, members: [creatorId] };
    
    return tryFirebase(
      async () => {
        const groupRef = await addDoc(collection(firestore, 'groups'), groupData);
        await updateDoc(doc(firestore, 'users', creatorId), { groups: arrayUnion(groupRef.id) });
        return { id: groupRef.id, inviteCode };
      },
      () => {
        groupData.id = 'g_' + inviteCode;
        const groups = JSON.parse(localStorage.getItem('gut_groups') || '[]');
        groups.push(groupData);
        localStorage.setItem('gut_groups', JSON.stringify(groups));
        return { id: groupData.id, inviteCode };
      }
    );
  },

  getUserGroups: async (userId) => {
    return tryFirebase(
      async () => {
        const userSnap = await getDoc(doc(firestore, 'users', userId));
        const groupIds = userSnap.data()?.groups || [];
        const groups = [];
        for (const gid of groupIds) {
          const gSnap = await getDoc(doc(firestore, 'groups', gid));
          if (gSnap.exists()) groups.push({ id: gSnap.id, ...gSnap.data() });
        }
        return groups;
      },
      () => {
        return JSON.parse(localStorage.getItem('gut_groups') || '[]');
      }
    );
  },

  joinGroup: async (userId, inviteCode) => {
    return tryFirebase(
      async () => {
        const q = query(collection(firestore, 'groups'), where('inviteCode', '==', inviteCode.toUpperCase()));
        const snap = await getDocs(q);
        if (snap.empty) throw new Error('Invalid code');
        await updateDoc(doc(firestore, 'users', userId), { groups: arrayUnion(snap.docs[0].id) });
        return { success: true };
      },
      () => {
        const groups = JSON.parse(localStorage.getItem('gut_groups') || '[]');
        const g = groups.find(g => g.inviteCode === inviteCode.toUpperCase());
        if (!g) throw new Error('Invalid code');
        return { success: true };
      }
    );
  },

  getGroup: async (id) => {
    return tryFirebase(
      async () => {
        const docSnap = await getDoc(doc(firestore, 'groups', id));
        if (!docSnap.exists()) throw new Error('Group not found');
        return { id: docSnap.id, ...docSnap.data() };
      },
      () => {
        const groups = JSON.parse(localStorage.getItem('gut_groups') || '[]');
        return groups.find(g => g.id === id) || { id, name: 'קבוצה לדוגמה', emoji: '⚽', poolAmount: 100, inviteCode: 'ABCDEF', members: [] };
      }
    );
  },

  getLeaderboard: async (groupId) => {
    return tryFirebase(
      async () => {
        const group = await api.getGroup(groupId);
        if (!group.members) return [];
        const users = [];
        for (const uid of group.members) {
          const uSnap = await getDoc(doc(firestore, 'users', uid));
          if (uSnap.exists()) users.push(uSnap.data());
        }
        return users.sort((a, b) => (b.score || 0) - (a.score || 0));
      },
      () => {
        const localUser = JSON.parse(localStorage.getItem('gut_or_heart_user') || '{}');
        return [localUser];
      }
    );
  },

  getStats: async (userId) => {

    return tryFirebase(
      async () => {
        const user = await api.getUser(userId);
        return { rank: 1, score: user.score || 0, hitRate: 85, nextPrize: 'חולצת מונדיאל', activeGroups: 1 };
      },
      () => ({ rank: 1, score: 0, hitRate: 100, nextPrize: 'חולצת מונדיאל', activeGroups: 1 })
    );
  }
};
