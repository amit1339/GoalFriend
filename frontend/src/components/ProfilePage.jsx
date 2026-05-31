import { useState, useEffect } from 'react';
import { api, getTeamFlagUrl } from '../api';

export function TeamLabel({ name, style }) {
  if (!name) return null;
  const flagUrl = getTeamFlagUrl(name);
  const displayName = name.replace(/\b[A-Za-z]{2}\b/g, '').replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
  
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle', ...style }}>
      {flagUrl && (
        <img 
          src={flagUrl} 
          alt="" 
          style={{ width: '16px', height: '11px', objectFit: 'cover', borderRadius: '1px', boxShadow: '0 1px 2px rgba(0,0,0,0.15)', flexShrink: 0 }} 
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      )}
      <span>{displayName}</span>
    </span>
  );
}

export default function ProfilePage({ user, onLogout }) {
  const [stats, setStats] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        api.getStats(user.id),
        api.getPredictions(user.id)
      ])
        .then(([statsRes, predsRes]) => {
          setStats({
            ...statsRes,
            totalPredictions: predsRes.length
          });
          // Show newest predictions first
          setPredictions(predsRes.reverse());
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to load profile data:', err);
          setLoading(false);
        });
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <span style={{ fontSize: 32, display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</span>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>טוען פרופיל...</p>
      </div>
    );
  }

  // Dynamic Intuition Title
  let intuitionTitle = 'מנחש מתחיל ⚽';
  if (stats) {
    const { accuracy, totalPredictions, streak } = stats;
    if (accuracy >= 75 && totalPredictions >= 5) {
      intuitionTitle = 'האינטואיציה של המדינה 🧠';
    } else if (streak >= 3) {
      intuitionTitle = 'במזל מטורף! 🔥';
    } else if (accuracy < 30 && totalPredictions >= 5) {
      intuitionTitle = 'לב של זהב (אפס בטן) 💔';
    } else if (totalPredictions >= 10) {
      intuitionTitle = 'המהמר השפוי 🧐';
    }
  }

  return (
    <div className="profile-page animate-slide-in">
      {/* User Header Details */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: 24, marginBottom: 16 }}>
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'var(--gradient-fun)',
          display: 'flex', alignItems: 'center',
          fontSize: 42,
          marginBottom: 12,
          boxShadow: 'var(--shadow-md)',
          border: '3px solid white',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          {user.avatar?.startsWith('http') ? (
            <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user.avatar || '😎'
          )}
        </div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>{user.name}</h2>
        <span className="streak-badge" style={{ marginTop: 8, fontSize: 13, background: 'var(--primary)', padding: '6px 16px' }}>
          {intuitionTitle}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
          הצטרף למשחק ב: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('he-IL') : new Date().toLocaleDateString('he-IL')}
        </span>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalScore}</div>
            <div className="stat-label">ניקוד כולל ⭐</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.accuracy}%</div>
            <div className="stat-label">אחוזי דיוק 🎯</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">🔥 {stats.streak}</div>
            <div className="stat-label">רצף נוכחי</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.totalPredictions}</div>
            <div className="stat-label">ניחושים שהוגשו 📊</div>
          </div>
        </div>
      )}

      {/* History of predictions */}
      <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
        היסטוריית הניחושים שלי ⏱️
      </h3>

      {predictions.length === 0 ? (
        <div className="card empty-state" style={{ padding: 24 }}>
          <div className="emoji">🎯</div>
          <h3>אין ניחושים בהיסטוריה</h3>
          <p>עדיין לא הגשת אף ניחוש. עבור לכרטיסיית הניחושים כדי להתחיל להרגיש את הבטן או הלב!</p>
        </div>
      ) : (
        <div className="predictions-history">
          {(showAllHistory ? predictions : predictions.slice(0, 5)).map(pred => {
            const pointsGained = pred.isCorrect ? pred.question?.points : 0;
            return (
              <div key={pred.id} className="card" style={{ marginBottom: 12, padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="card-category" style={{
                    background: pred.question?.category === 'ניחוש' ? 'var(--primary)' :
                      pred.question?.category === 'כיף' ? 'var(--secondary)' :
                        pred.question?.category === 'דרמה' ? '#e17055' : 'var(--accent-green)',
                    padding: '4px 10px',
                    fontSize: 11
                  }}>
                    {pred.question?.emoji} {pred.question?.category}
                  </span>

                  {pred.isCorrect === true ? (
                    <span className="streak-badge" style={{ background: 'var(--accent-green)', fontSize: 11 }}>
                      ✅ צדקת! (+{pointsGained} נק׳)
                    </span>
                  ) : pred.isCorrect === false ? (
                    <span className="streak-badge" style={{ background: 'var(--secondary)', fontSize: 11 }}>
                      ❌ טעית (0 נק׳)
                    </span>
                  ) : (
                    <span className="streak-badge" style={{ background: 'var(--text-light)', color: 'var(--text-primary)', fontSize: 11 }}>
                      ⏳ ממתין לתוצאה
                    </span>
                  )}
                </div>

                <h4 style={{ fontSize: 15, fontWeight: 700, margin: '6px 0 10px', direction: 'rtl', textAlign: 'right' }}>
                  {pred.question?.text}
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 8 }}>
                  <div>
                    <span>הניחוש שלך: </span>
                    <strong style={{ color: 'var(--primary)', fontWeight: 700 }}>
                      <TeamLabel name={pred.answer === 'A' ? pred.question?.optionA : pred.question?.optionB} />
                    </strong>
                  </div>
                  {pred.question?.correctAnswer && (
                    <div>
                      <span>התוצאה הנכונה: </span>
                      <strong style={{ color: 'var(--accent-green)', fontWeight: 700 }}>
                        <TeamLabel name={pred.question.correctAnswer === 'A' ? pred.question.optionA : pred.question.optionB} />
                      </strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {predictions.length > 5 && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', maxWidth: 280, fontSize: 14, background: 'rgba(108, 92, 231, 0.1)', color: 'var(--primary)', border: '1px dashed var(--primary)' }} 
                onClick={() => setShowAllHistory(!showAllHistory)}
              >
                {showAllHistory ? 'הצג פחות 👆' : `הצג את כל ה-${predictions.length} ניחושים 👇`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Logout button */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <button className="btn btn-secondary btn-large" style={{ width: '100%', maxWidth: 280, color: 'var(--secondary)', borderColor: 'var(--secondary)' }} onClick={onLogout}>
          🚪 התנתק מהמערכת
        </button>
      </div>
    </div>
  );
}
