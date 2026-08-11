const GarageIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <line x1="9" y1="22" x2="9" y2="12"/>
    <line x1="15" y1="22" x2="15" y2="12"/>
    <line x1="9" y1="12" x2="15" y2="12"/>
  </svg>
)

const StreetIcon = ({ color }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="9" width="14" height="8" rx="2"/>
    <path d="M5 9l1.5-3h7L15 9"/>
    <circle cx="6" cy="17" r="1.5" fill={color}/>
    <circle cx="12" cy="17" r="1.5" fill={color}/>
    <line x1="2" y1="20" x2="22" y2="20" strokeWidth="2.5"/>
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
                  <t.Icon color={color} />
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
