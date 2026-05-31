import { useState, useEffect, useCallback } from 'react';
import { api, getTeamFlagUrl } from '../api';
import confetti from 'canvas-confetti';

export function TeamLabel({ name, style }) {
  if (!name) return null;
  const flagUrl = getTeamFlagUrl(name);
  const displayName = name.replace(/\b[A-Za-z]{2}\b/g, '').replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', verticalAlign: 'middle', ...style }}>
      {flagUrl && (
        <img 
          src={flagUrl} 
          alt="" 
          style={{ width: '20px', height: '14px', objectFit: 'cover', borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', flexShrink: 0 }} 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <span>{displayName}</span>
    </span>
  );
}

export default function SwipePage({ user }) {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(null);
  const [answeredCount, setAnsweredCount] = useState(0);

  useEffect(() => {
    api.getMatches().then(m => {
      setMatches(m);
      if (m.length > 0) setSelectedMatch(m[0]);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedMatch || !user) return;
    api.getUnanswered(user.id, selectedMatch.id).then(q => {
      setQuestions(q);
      setCurrentIndex(0);
    }).catch(console.error);
  }, [selectedMatch, user]);

  const fireConfetti = useCallback(() => {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#6C5CE7', '#A29BFE', '#FECA57', '#FF6B6B', '#00D2D3'] });
  }, []);

  const handleAnswer = async (answer) => {
    const question = questions[currentIndex];
    if (!question) return;

    try {
      await api.submitPrediction(user.id, question.id, answer);
      setAnsweredCount(prev => prev + 1);

      // Show a fun result
      const isOptionA = answer === 'A';
      setShowResult({
        emoji: isOptionA ? '💜' : '❤️',
        text: isOptionA ? question.optionA : question.optionB,
        subtext: `+${question.points} נקודות אם תצדק!`,
        type: isOptionA ? 'a' : 'b',
      });

      fireConfetti();

      setTimeout(() => {
        setShowResult(null);
        setCurrentIndex(prev => prev + 1);
      }, 1200);
    } catch (err) {
      console.error('Failed to submit:', err);
      // Skip to next if already answered
      setCurrentIndex(prev => prev + 1);
    }
  };

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0;
  const isExpired = selectedMatch && new Date() >= new Date(selectedMatch.startTime);

  return (
    <div>
      {/* Match selector */}
      <div className="match-selector">
        {matches.map(match => (
          <button
            key={match.id}
            className={`match-chip ${selectedMatch?.id === match.id ? 'active' : ''}`}
            onClick={() => setSelectedMatch(match)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <TeamLabel name={match.teamA} />
            <span style={{ opacity: 0.5, margin: '0 2px' }}>-</span>
            <TeamLabel name={match.teamB} />
          </button>
        ))}
      </div>

      {/* Progress bar */}
      {questions.length > 0 && !isExpired && (
        <div style={{ height: 5, borderRadius: 3, background: 'rgba(255, 255, 255, 0.06)', marginBottom: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.03)' }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
            borderRadius: 3,
            transition: 'width 0.4s ease',
          }} />
        </div>
      )}

      {/* Card area */}
      {isExpired ? (
        <div className="swipe-card-wrapper">
          <div className="swipe-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🔒</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--secondary)', marginBottom: 12 }}>
              not more bets
            </h3>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 600, maxWidth: 280, lineHeight: 1.6 }}>
              המשחק התחיל ולכן לא ניתן לנחש עוד
            </p>
          </div>
        </div>
      ) : currentQuestion ? (
        <div className="swipe-card-wrapper">
          <div className="swipe-card" data-category={currentQuestion.category}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span className={`card-category ${currentQuestion.category}`}>
                {currentQuestion.emoji} {currentQuestion.category}
              </span>
              <span className="card-points">⭐ {currentQuestion.points} נק׳</span>
            </div>

            <div className="card-emoji">{currentQuestion.emoji}</div>
            <h2 className="card-question">{currentQuestion.text}</h2>

            <div className="card-match-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {selectedMatch && (
                <>
                  <TeamLabel name={selectedMatch.teamA} />
                  <span style={{ opacity: 0.5, margin: '0 4px' }}>vs</span>
                  <TeamLabel name={selectedMatch.teamB} />
                </>
              )}
            </div>

            <div className="swipe-options">
              <button
                className="swipe-btn option-a"
                onClick={() => handleAnswer('A')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <TeamLabel name={currentQuestion.optionA} />
              </button>
              <button
                className="swipe-btn option-b"
                onClick={() => handleAnswer('B')}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <TeamLabel name={currentQuestion.optionB} />
              </button>
            </div>
          </div>

          {/* Remaining counter */}
          <div style={{
            textAlign: 'center', marginTop: 14,
            fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600,
          }}>
            {currentIndex + 1} / {questions.length} שאלות
          </div>
        </div>
      ) : (
        <div className="swipe-card-wrapper">
          <div className="swipe-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, padding: 24, textAlign: 'center' }}>
            <div className="emoji" style={{ fontSize: 60, marginBottom: 16 }}>
              {questions.length === 0 && currentIndex === 0 ? '🎉' : '🏆'}
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>
              {questions.length === 0 && currentIndex === 0
                ? 'הניחושים למשחק זה הושלמו! 🎉'
                : 'סיימת את כל השאלות! 🏆'}
            </h3>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 600, maxWidth: 280, lineHeight: 1.6 }}>
              {questions.length === 0 && currentIndex === 0
                ? 'כבר ענית על כל השאלות למשחק זה. כל הכבוד! הניחושים שלך שמורים וממתינים לשריקת הפתיחה.'
                : 'כל הכבוד! 🏆 בוא נראה מה יקרה במשחק. בינתיים, לך תבדוק את הטבלה בקבוצות שלך!'}
            </p>
          </div>
        </div>
      )}

      {/* Fun stats */}
      {answeredCount > 0 && !currentQuestion && (
        <div className="card animate-slide-in" style={{ textAlign: 'center', marginTop: 16 }}>
          <div style={{ fontSize: 40 }}>🔥</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>ענית על {answeredCount} שאלות היום!</div>
          <div style={{ fontSize: 14, color: '#636E72', marginTop: 4 }}>
            עכשיו רק נשאר לחכות ולראות אם הבטן או הלב צדקו 😄
          </div>
        </div>
      )}

      {/* Answer result overlay */}
      {showResult && (
        <div className="result-overlay" onClick={() => setShowResult(null)}>
          <div className="result-content">
            <div className="result-emoji">{showResult.emoji}</div>
            <div className="result-text">בחרת!</div>
            <div className="result-subtext">{showResult.text}</div>
            <div className="card-points" style={{ display: 'inline-flex' }}>
              {showResult.subtext}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
