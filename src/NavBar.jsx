export default function NavBar({ active, setActive }) {
  const tabs = [
    { id: 'map', label: 'Find', icon: '🔍' },
    { id: 'saved', label: 'Saved', icon: '❤️' },
    { id: 'history', label: 'History', icon: '🕐' },
    { id: 'profile', label: 'Profile', icon: '👤' },
  ]
  return (
    <div style={{
      display: 'flex', background: '#fff',
      borderTop: '1px solid #f3f4f6', padding: '8px 0 4px',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)',
      flexShrink: 0,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
          border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 0',
        }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: active === t.id ? '#3b82f6' : '#9ca3af' }}>
            {t.label}
          </span>
          {active === t.id && <div style={{ width: 4, height: 4, borderRadius: 2, background: '#3b82f6' }}/>}
        </button>
      ))}
    </div>
  )
}