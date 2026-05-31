import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';
import confetti from 'canvas-confetti';

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

  return (
    <div>
      {/* Match selector */}
      <div className="match-selector">
        {matches.map(match => (
          <button
            key={match.id}
            className={`match-chip ${selectedMatch?.id === match.id ? 'active' : ''}`}
            onClick={() => setSelectedMatch(match)}
          >
            {match.teamA} - {match.teamB}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      {questions.length > 0 && (
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
      {currentQuestion ? (
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
                  <span>{selectedMatch.teamA}</span>
                  <span style={{ opacity: 0.5, margin: '0 4px' }}>vs</span>
                  <span>{selectedMatch.teamB}</span>
                </>
              )}
            </div>

            {selectedMatch && new Date() >= new Date(selectedMatch.startTime) ? (
              <div 
                className="not-more-bets-msg" 
                style={{ 
                  width: '100%',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#fb7185',
                  fontSize: '14px',
                  fontWeight: '700',
                  textAlign: 'center',
                  lineHeight: '1.5'
                }}
              >
                not more bets, המשחק התחיל ולכן לא ניתן לנחש עוד
              </div>
            ) : (
              <div className="swipe-options">
                <button
                  className="swipe-btn option-a"
                  onClick={() => handleAnswer('A')}
                >
                  {currentQuestion.optionA}
                </button>
                <button
                  className="swipe-btn option-b"
                  onClick={() => handleAnswer('B')}
                >
                  {currentQuestion.optionB}
                </button>
              </div>
            )}
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
        <div className="no-more-cards">
          <div className="emoji">🎉</div>
          <h3>
            {questions.length === 0 && currentIndex === 0
              ? 'בחר משחק למעלה!'
              : 'סיימת את כל השאלות!'}
          </h3>
          <p>
            {questions.length === 0 && currentIndex === 0
              ? 'בחר משחק מהרשימה למעלה כדי להתחיל לנחש'
              : 'כל הכבוד! 🏆 בוא נראה מה יקרה במשחק. בינתיים, לך תבדוק את הטבלה בקבוצות שלך!'}
          </p>
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
