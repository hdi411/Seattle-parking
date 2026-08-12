import { useAuth } from './AuthContext'

export default function ProfileScreen() {
  const { user, signIn, signOut } = useAuth()

  if (user === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ color: '#9ca3af', fontSize: 15 }}>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', gap: 20, padding: 32,
      }}>
        <div style={{ fontSize: 64 }}>👤</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>Sign in</div>
        <div style={{ fontSize: 14, color: '#6b7280', textAlign: 'center' }}>
          Sign in to save your parking history across devices
        </div>
        <button
          onClick={signIn}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 24px', borderRadius: 14, border: '1.5px solid #e5e7eb',
            background: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)', color: '#111827',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.9 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"/>
            <path fill="#34A853" d="M6.3 14.7l7 5.1C15 16.1 19.2 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 7.4 6.3 14.7z"/>
            <path fill="#FBBC05" d="M24 46c5.8 0 10.7-1.9 14.3-5.2l-6.6-5.4C29.8 37 27 38 24 38c-5.8 0-10.8-3.9-12.5-9.3l-7 5.4C7.9 41.3 15.4 46 24 46z"/>
            <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-.9 2.6-2.6 4.8-4.9 6.3l6.6 5.4C41.6 37.1 45 31 45 24c0-1.3-.2-2.7-.5-4z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '20px 20px 24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user.photoURL
            ? <img src={user.photoURL} alt="avatar" style={{ width: 56, height: 56, borderRadius: '50%' }} />
            : <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: '#3b82f6', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 24, color: '#fff', fontWeight: 700,
              }}>{user.displayName?.[0] || '?'}</div>
          }
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111827' }}>
              {user.displayName || 'User'}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>
              {user.email}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '24px 20px' }}>
        <div style={{
          background: '#fff', borderRadius: 14,
          border: '1px solid #f3f4f6',
          overflow: 'hidden',
        }}>
          <button
            onClick={signOut}
            style={{
              width: '100%', padding: '16px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              border: 'none', background: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 600, color: '#ef4444',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}
