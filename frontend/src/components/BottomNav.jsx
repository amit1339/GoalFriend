export default function BottomNav({ active, onChange }) {
  const items = [
    { id: 'swipe', label: 'ניחושים', icon: '🎯' },
    { id: 'groups', label: 'קבוצות', icon: '👥' },
    { id: 'profile', label: 'פרופיל', icon: '👤' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map(item => (
        <button
          key={item.id}
          className={`nav-item ${active === item.id ? 'active' : ''}`}
          onClick={() => onChange(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}
