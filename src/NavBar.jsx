export default function NavBar({ active, setActive }) {
  const tabs = [
    {
      id: 'map',
      label: 'Find',
      icon: (isActive) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#3b82f6' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      ),
    },
    {
      id: 'saved',
      label: 'Saved',
      icon: (isActive) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? '#f59e0b' : 'none'} stroke={isActive ? '#f59e0b' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'History',
      icon: (isActive) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#3b82f6' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (isActive) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isActive ? '#3b82f6' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{
      display: 'flex', background: '#fff',
      borderTop: '1px solid #f3f4f6',
      padding: '8px 0',
      paddingBottom: 'env(safe-area-inset-bottom)',
      flexShrink: 0,
    }}>
      {tabs.map(t => {
        const isActive = active === t.id
        return (
          <button key={t.id} onClick={() => setActive(t.id)} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px 0',
          }}>
            {t.icon(isActive)}
            <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? '#3b82f6' : '#9ca3af' }}>
              {t.label}
            </span>
            {isActive && <div style={{ width: 4, height: 4, borderRadius: 2, background: '#3b82f6' }}/>}
          </button>
        )
      })}
    </div>
  )
}
