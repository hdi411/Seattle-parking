const GarageIcon = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
    <rect x="4" y="14" width="32" height="22" rx="2" fill="#d1d5db" stroke="#111827" strokeWidth="2.5"/>
    <line x1="4" y1="21" x2="36" y2="21" stroke="#111827" strokeWidth="1.5"/>
    <line x1="4" y1="28" x2="36" y2="28" stroke="#111827" strokeWidth="1.5"/>
    <rect x="8" y="15.5" width="6" height="4.5" rx="1" fill="#374151"/>
    <rect x="17" y="15.5" width="6" height="4.5" rx="1" fill="#374151"/>
    <rect x="26" y="15.5" width="6" height="4.5" rx="1" fill="#374151"/>
    <rect x="8" y="22.5" width="6" height="4.5" rx="1" fill="#374151"/>
    <rect x="17" y="22.5" width="6" height="4.5" rx="1" fill="#374151"/>
    <rect x="26" y="22.5" width="6" height="4.5" rx="1" fill="#374151"/>
    <rect x="15" y="30" width="10" height="6" rx="1" fill="#6b7280"/>
    <circle cx="20" cy="8" r="7" fill="#fff" stroke="#111827" strokeWidth="2.5"/>
    <text x="20" y="12" textAnchor="middle" fontSize="9" fontWeight="800" fill="#111827">P</text>
  </svg>
)

const StreetIcon = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
    <rect x="0" y="33" width="40" height="4" rx="2" fill="#374151"/>
    <rect x="8" y="20" width="24" height="13" rx="4" fill="#f59e0b" stroke="#111827" strokeWidth="2.5"/>
    <path d="M12 20 Q20 12 28 20" fill="#93c5fd" stroke="#111827" strokeWidth="2"/>
    <circle cx="12" cy="31" r="3" fill="#111827"/>
    <circle cx="28" cy="31" r="3" fill="#111827"/>
    <rect x="16.5" y="28" width="7" height="2" rx="0.5" fill="#fff"/>
    <circle cx="5" cy="18" r="5" fill="#2563eb" stroke="#111827" strokeWidth="2"/>
    <text x="5" y="21.5" textAnchor="middle" fontSize="7" fontWeight="900" fill="#fff">P</text>
    <rect x="3.5" y="23" width="3" height="10" fill="#78716c" stroke="#111827" strokeWidth="1.5"/>
  </svg>
)

const LotIcon = () => (
  <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
    <ellipse cx="20" cy="32" rx="18" ry="5" fill="#d1d5db" stroke="#111827" strokeWidth="2"/>
    <line x1="8" y1="27" x2="8" y2="37" stroke="#fff" strokeWidth="1.5"/>
    <line x1="16" y1="27" x2="16" y2="37" stroke="#fff" strokeWidth="1.5"/>
    <line x1="24" y1="27" x2="24" y2="37" stroke="#fff" strokeWidth="1.5"/>
    <line x1="32" y1="27" x2="32" y2="37" stroke="#fff" strokeWidth="1.5"/>
    <circle cx="20" cy="14" r="12" fill="#22c55e" stroke="#111827" strokeWidth="2.5"/>
    <text x="20" y="19.5" textAnchor="middle" fontSize="12" fontWeight="900" fill="#fff">LOT</text>
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
              return (
                <button key={t.id} onClick={() => {
                  const types = active
                    ? prefs.types.filter(x => x !== t.id)
                    : [...prefs.types, t.id]
                  setPrefs({ ...prefs, types })
                }} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  border: active ? '2px solid #3b82f6' : '1.5px solid #e5e7eb',
                  background: active ? '#eff6ff' : '#fff',
                }}>
                  <t.Icon />
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
