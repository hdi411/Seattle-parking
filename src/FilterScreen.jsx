const GarageIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* left ramp ribs */}
    <rect x="1" y="9" width="2.5" height="12" rx="0.5" fill="#9ca3af" stroke="#374151" strokeWidth="1"/>
    <line x1="1" y1="12.5" x2="3.5" y2="12.5" stroke="#6b7280" strokeWidth="0.8"/>
    <line x1="1" y1="16" x2="3.5" y2="16" stroke="#6b7280" strokeWidth="0.8"/>
    {/* main building body */}
    <rect x="3.5" y="8" width="18.5" height="13" rx="1" fill="#d1d5db" stroke="#374151" strokeWidth="1.5"/>
    {/* floor dividers */}
    <line x1="3.5" y1="12" x2="22" y2="12" stroke="#374151" strokeWidth="1"/>
    <line x1="3.5" y1="16" x2="22" y2="16" stroke="#374151" strokeWidth="1"/>
    {/* floor 1 windows */}
    <rect x="5.5" y="9" width="3.5" height="2.5" rx="0.4" fill="#374151"/>
    <rect x="10.5" y="9" width="3.5" height="2.5" rx="0.4" fill="#374151"/>
    <rect x="16" y="9" width="3.5" height="2.5" rx="0.4" fill="#374151"/>
    {/* floor 2 windows */}
    <rect x="5.5" y="13" width="3.5" height="2.5" rx="0.4" fill="#374151"/>
    <rect x="10.5" y="13" width="3.5" height="2.5" rx="0.4" fill="#374151"/>
    <rect x="16" y="13" width="3.5" height="2.5" rx="0.4" fill="#374151"/>
    {/* floor 3 windows */}
    <rect x="5.5" y="17" width="3.5" height="2.5" rx="0.4" fill="#374151"/>
    <rect x="10.5" y="17" width="3.5" height="2.5" rx="0.4" fill="#374151"/>
    <rect x="16" y="17" width="3.5" height="2.5" rx="0.4" fill="#374151"/>
    {/* P sign circle */}
    <circle cx="12.5" cy="5" r="3.2" fill="#fff" stroke="#374151" strokeWidth="1.5"/>
    <path d="M11.2 7V3.2h1.8a1.4 1.4 0 0 1 0 2.8H11.2" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const StreetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="0" y1="30" x2="40" y2="30" stroke="#111827" strokeWidth="2"/>
    <rect x="6.5" y="20" width="2" height="10" fill="#78716c" stroke="#111827" strokeWidth="1"/>
    <path d="M4.5 30 L5.5 23 L9.5 23 L10.5 30Z" fill="#57534e" stroke="#111827" strokeWidth="1"/>
    <rect x="1" y="5" width="13" height="10" rx="1.5" fill="#2563eb" stroke="#111827" strokeWidth="1.5"/>
    <path d="M6 13V7h2.5a2 2 0 0 1 0 4H6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <rect x="16" y="13" width="23" height="16" rx="4" fill="#f59e0b" stroke="#111827" strokeWidth="2"/>
    <rect x="18" y="13" width="19" height="9" rx="3" fill="#bfdbfe" stroke="#111827" strokeWidth="1.5"/>
    <rect x="19" y="15" width="5" height="6" rx="1" fill="#92400e"/>
    <rect x="27" y="15" width="5" height="6" rx="1" fill="#92400e"/>
    <circle cx="19.5" cy="25" r="2.5" fill="#fff" stroke="#111827" strokeWidth="1.5"/>
    <circle cx="35.5" cy="25" r="2.5" fill="#fff" stroke="#111827" strokeWidth="1.5"/>
    <rect x="24" y="23" width="7" height="2.5" rx="0.5" fill="#111827"/>
    <line x1="25.5" y1="23" x2="25.5" y2="25.5" stroke="#f59e0b" strokeWidth="0.8"/>
    <line x1="27.5" y1="23" x2="27.5" y2="25.5" stroke="#f59e0b" strokeWidth="0.8"/>
    <line x1="29.5" y1="23" x2="29.5" y2="25.5" stroke="#f59e0b" strokeWidth="0.8"/>
    <rect x="23" y="27" width="9" height="2" rx="0.5" fill="#fff" stroke="#111827" strokeWidth="0.8"/>
  </svg>
)

const LotIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" strokeLinejoin="round"/>
  </svg>
)

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const parkingTypes = [
  { id: 'garage', label: 'Garage / Underground', Icon: GarageIcon },
  { id: 'street', label: 'Street Side', Icon: StreetIcon },
  { id: 'lot', label: 'Surface / Lot', Icon: LotIcon },
]

export default function FilterScreen({ onBack, prefs, setPrefs }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      <div style={{
        background: '#fff', padding: 20, display: 'flex', alignItems: 'center',
        gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: '#f3f4f6', border: 'none', borderRadius: 10,
          padding: '8px 12px', cursor: 'pointer', fontSize: 18,
        }}>←</button>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>Filters</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 10 }}>
            PARKING TYPE
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {parkingTypes.map(t => {
              const active = prefs.types.includes(t.id)
              const color = active ? '#1d4ed8' : '#6b7280'
              return (
                <button key={t.id} onClick={() => {
                  const types = active
                    ? prefs.types.filter(x => x !== t.id)
                    : [...prefs.types, t.id]
                  setPrefs({ ...prefs, types })
                }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  border: active ? '2px solid #3b82f6' : '1.5px solid #e5e7eb',
                  background: active ? '#eff6ff' : '#fff',
                }}>
                  {(t.id === 'garage' || t.id === 'street') ? <t.Icon active={active} /> : <t.Icon color={color} />}
                  <span style={{ fontSize: 14, fontWeight: 600, color: active ? '#1d4ed8' : '#374151', flex: 1 }}>
                    {t.label}
                  </span>
                  {active && <CheckIcon />}
                </button>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 10 }}>
            MAX HOURLY RATE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input type="range" min={1} max={20} step={0.5}
              value={prefs.maxRate}
              onChange={e => setPrefs({ ...prefs, maxRate: parseFloat(e.target.value) })}
              style={{ flex: 1, accentColor: '#3b82f6' }}
            />
            <span style={{ fontWeight: 800, fontSize: 17, color: '#1d4ed8', minWidth: 56 }}>
              ${prefs.maxRate}/hr
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 10 }}>
            SEARCH RADIUS
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input type="range" min={161} max={8047} step={161}
              value={prefs.radius}
              onChange={e => setPrefs({ ...prefs, radius: parseInt(e.target.value) })}
              style={{ flex: 1, accentColor: '#3b82f6' }}
            />
            <span style={{ fontWeight: 800, fontSize: 17, color: '#1d4ed8', minWidth: 64 }}>
              {(prefs.radius / 1609).toFixed(1)} mi
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 20px', background: '#fff', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
        <button onClick={onBack} style={{
          width: '100%', padding: 14, background: '#3b82f6', border: 'none', borderRadius: 14,
          color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer',
        }}>
          Apply Filters
        </button>
      </div>
    </div>
  )
}
