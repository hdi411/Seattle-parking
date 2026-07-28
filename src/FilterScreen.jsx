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
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>PARKING TYPE</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'garage', label: 'Garage / Underground', emoji: '🏢' },
              { id: 'street', label: 'Street Side', emoji: '🛣️' },
              { id: 'lot', label: 'Surface / Lot', emoji: '🅿️' },
            ].map(t => (
              <button key={t.id} onClick={() => {
                const types = prefs.types.includes(t.id)
                  ? prefs.types.filter(x => x !== t.id)
                  : [...prefs.types, t.id]
                setPrefs({ ...prefs, types })
              }} style={{
                padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                border: prefs.types.includes(t.id) ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                background: prefs.types.includes(t.id) ? '#eff6ff' : '#fff',
                color: prefs.types.includes(t.id) ? '#1d4ed8' : '#374151',
              }}>
                {t.emoji} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>MAX HOURLY RATE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input type="range" min={1} max={20} step={0.5}
              value={prefs.maxRate}
              onChange={e => setPrefs({ ...prefs, maxRate: parseFloat(e.target.value) })}
              style={{ flex: 1, accentColor: '#3b82f6' }}
            />
            <span style={{ fontWeight: 800, fontSize: 18, color: '#1d4ed8', minWidth: 56 }}>
              ${prefs.maxRate}/hr
            </span>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>SEARCH RADIUS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input type="range" min={161} max={8047} step={161}
              value={prefs.radius}
              onChange={e => setPrefs({ ...prefs, radius: parseInt(e.target.value) })}
              style={{ flex: 1, accentColor: '#3b82f6' }}
            />
            <span style={{ fontWeight: 800, fontSize: 18, color: '#1d4ed8', minWidth: 64 }}>
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
