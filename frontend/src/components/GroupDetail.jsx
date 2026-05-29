import { useState, useEffect } from 'react';
import { api } from '../api';

export default function GroupDetail({ user, groupId, onBack }) {
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchGroupDetails = () => {
    Promise.all([
      api.getGroup(groupId),
      api.getLeaderboard(groupId).catch(() => []) // Fallback to empty array if fails
    ])
      .then(([groupRes, leaderboardRes]) => {
        setGroup({ ...groupRes, leaderboard: leaderboardRes });
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch group details:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
    }
  }, [groupId]);

  const handleCopyCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.inviteCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy code:', err));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <span style={{ fontSize: 32, display: 'inline-block', animation: 'spin 1s linear infinite' }}>🔄</span>
        <p style={{ marginTop: 8, color: 'var(--text-secondary)' }}>טוען את פרטי הקבוצה...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="card empty-state">
        <div className="emoji">⚠️</div>
        <h3>הקבוצה לא נמצאה</h3>
        <p>נראה שהקבוצה הזו לא קיימת או שנמחקה.</p>
        <button className="btn btn-primary" onClick={onBack}>חזרה לקבוצות שלי</button>
      </div>
    );
  }

  const { leaderboard = [] } = group;
  const first = leaderboard[0];
  const second = leaderboard[1];
  const third = leaderboard[2];
  const last = leaderboard.length > 1 ? leaderboard[leaderboard.length - 1] : null;

  // Prize calculations
  const totalPool = group.totalPool || 0;
  const firstPrize = Math.round(totalPool * 0.6);
  const secondPrize = Math.round(totalPool * 0.3);
  const consolationPrize = Math.round(totalPool * 0.1);

  const renderAvatar = (avatar) => {
    if (!avatar) return '😎';
    if (avatar.startsWith('http')) {
      return <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
    }
    return avatar;
  };

  return (
    <div className="group-detail animate-slide-in">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button className="btn btn-secondary btn-icon" onClick={onBack} style={{ fontSize: 18 }}>
          ➡️
        </button>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <span>{group.emoji}</span>
            <span>{group.name}</span>
          </h2>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>
            מנהל קבוצה: {group.creatorName} • {group.memberCount} חברים
          </span>
        </div>
      </div>

      {/* Invite Code display */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 700, display: 'block' }}>
              קוד הזמנה לחברים:
            </span>
            <span className="invite-code">{group.inviteCode}</span>
          </div>
          <button
            className="btn btn-secondary"
            style={{ padding: '8px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}
            onClick={handleCopyCode}
          >
            {copied ? (
              <>
                <span>הועתק!</span>
                <span>📋</span>
              </>
            ) : (
              <>
                <span>העתק קוד</span>
                <span>🔗</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prize Pool details */}
      <div className="prize-pool-card">
        <div className="prize-pool-title">קופה משותפת לקבוצה 💰</div>
        <div className="prize-pool-amount">{totalPool} ₪</div>
        <div className="prize-distribution">
          <div className="prize-row">
            <span className="label">🥇 מקום 1 (60%):</span>
            <span className="amount">{firstPrize} ₪ {first ? `(${first.name})` : ''}</span>
          </div>
          <div className="prize-row">
            <span className="label">🥈 מקום 2 (30%):</span>
            <span className="amount">{secondPrize} ₪ {second ? `(${second.name})` : ''}</span>
          </div>
          <div className="prize-row" style={{ borderTop: '1px dashed rgba(255,255,255,0.3)', paddingTop: 6, marginTop: 4 }}>
            <span className="label">💔 פרס הלב השבור (הכי גרוע) (10%):</span>
            <span className="amount">
              {consolationPrize} ₪ {last ? `(${last.name} 😉)` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Leaderboard Podium (Only if there's someone in the leaderboard) */}
      {leaderboard.length > 0 && (
        <div className="card" style={{ marginBottom: 16, padding: '16px 8px' }}>
          <h3 className="section-title" style={{ fontSize: 16, paddingRight: 8, marginBottom: 8 }}>
            שלישיית המובילים 👑
          </h3>

          <div className="leaderboard-podium">
            {/* 2nd Place (Left) */}
            {second ? (
              <div className="podium-item second">
                <span className="podium-badge">🥈</span>
                <div className="podium-avatar" style={{ padding: second.avatar?.startsWith('http') ? 0 : undefined, overflow: 'hidden' }}>
                  {renderAvatar(second.avatar)}
                </div>
                <span className="podium-name" style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {second.name}
                </span>
                <span className="podium-score">{second.score} נק׳</span>
              </div>
            ) : (
              <div className="podium-item second" style={{ opacity: 0.3 }}>
                <span className="podium-badge">🥈</span>
                <div className="podium-avatar">👤</div>
                <span className="podium-name">אין</span>
                <span className="podium-score">-</span>
              </div>
            )}

            {/* 1st Place (Center) */}
            {first ? (
              <div className="podium-item first">
                <span className="podium-badge">👑</span>
                <div className="podium-avatar" style={{ border: '3px solid var(--accent)', padding: first.avatar?.startsWith('http') ? 0 : undefined, overflow: 'hidden' }}>
                  {renderAvatar(first.avatar)}
                </div>
                <span className="podium-name" style={{ fontWeight: 800, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {first.name}
                </span>
                <span className="podium-score" style={{ fontWeight: 800 }}>{first.score} נק׳</span>
              </div>
            ) : (
              <div className="podium-item first" style={{ opacity: 0.3 }}>
                <span className="podium-badge">👑</span>
                <div className="podium-avatar">👤</div>
                <span className="podium-name">אין</span>
                <span className="podium-score">-</span>
              </div>
            )}

            {/* 3rd Place (Right) */}
            {third ? (
              <div className="podium-item third">
                <span className="podium-badge">🥉</span>
                <div className="podium-avatar" style={{ padding: third.avatar?.startsWith('http') ? 0 : undefined, overflow: 'hidden' }}>
                  {renderAvatar(third.avatar)}
                </div>
                <span className="podium-name" style={{ maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {third.name}
                </span>
                <span className="podium-score">{third.score} נק׳</span>
              </div>
            ) : (
              <div className="podium-item third" style={{ opacity: 0.3 }}>
                <span className="podium-badge">🥉</span>
                <div className="podium-avatar">👤</div>
                <span className="podium-name">אין</span>
                <span className="podium-score">-</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <h3 className="section-title" style={{ fontSize: 18, marginBottom: 12 }}>
        טבלת הניקוד המלאה 📊
      </h3>

      <div className="leaderboard-list">
        {leaderboard.map((member, index) => {
          const memberId = member.userId || member.id || `mock_${index}`;
          const isCurrentUser = memberId === user.id;
          const winRate = member.total > 0 ? Math.round((member.correct / member.total) * 100) : 0;

          return (
            <div
              key={memberId}
              className={`leader-row ${isCurrentUser ? 'highlighted' : ''}`}
            >
              <span className="leader-rank">
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </span>
              <span className="leader-avatar" style={{ padding: member.avatar?.startsWith('http') ? 0 : undefined, overflow: 'hidden' }}>
                {renderAvatar(member.avatar)}
              </span>
              <div className="leader-info">
                <div className="leader-name" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: isCurrentUser ? 800 : 600 }}>
                    {member.name} {isCurrentUser && '(אתה)'}
                  </span>
                  {member.streak >= 3 && (
                    <span className="streak-badge" title={`רצף של ${member.streak} פגיעות!`}>
                      🔥 {member.streak}
                    </span>
                  )}
                  {index === leaderboard.length - 1 && leaderboard.length > 1 && (
                    <span className="streak-badge" style={{ background: '#e17055' }} title="פרס הניחומים מחכה לך!">
                      💔 זמני באחרון
                    </span>
                  )}
                </div>
                <div className="leader-stats">
                  ניחש {member.total} פעמים • {member.correct} פגיעות ({winRate}%)
                </div>
              </div>
              <span className="leader-score">{member.score} נק׳</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
