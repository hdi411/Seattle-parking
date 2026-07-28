import { useState } from 'react'

const typeIcon = { garage: '🏢', street: '🛣️', lot: '🅿️' }

export default function DetailScreen({ spot, onBack, onPay }) {
  const [hours, setHours] = useState(2)
  const [editing, setEditing] = useState(false)
  const [inputVal, setInputVal] = useState('2')
  const rate = spot.rate_1hr ? parseFloat(spot.rate_1hr) : 3
  const total = (rate * hours).toFixed(2)

  function commitEdit(val) {
    const n = parseFloat(val)
    if (!isNaN(n) && n > 0 && n <= 24) setHours(Math.round(n * 2) / 2)
    setEditing(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        height: 180, background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        position: 'relative', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          position: 'absolute', top: 20, left: 16,
          background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 10,
          padding: '8px 12px', cursor: 'pointer', color: '#fff', fontSize: 18,
        }}>←</button>
        <div style={{ position: 'absolute', bottom: 20, left: 20 }}>
          <div style={{ fontSize: 28 }}>{typeIcon[spot.type] || '🅿️'}</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginTop: 4 }}>{spot.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 2 }}>
            📍 {spot.address || 'Seattle, WA'}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Hourly', value: `$${rate}` },
            { label: 'All Day', value: spot.rate_allday ? `$${spot.rate_allday}` : 'N/A' },
            { label: 'Stalls', value: spot.stalls || '?' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#fff', borderRadius: 14, padding: '14px 10px',
              textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#111827' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Duration picker */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 18, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#374151', marginBottom: 14 }}>Select Duration</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <button onClick={() => setHours(h => Math.max(0.5, Math.round((h - 0.5) * 2) / 2))} style={{
              width: 40, height: 40, borderRadius: 10, border: '2px solid #e5e7eb',
              background: '#f9fafb', fontWeight: 800, fontSize: 22, cursor: 'pointer',
            }}>−</button>

            <div style={{ flex: 1, textAlign: 'center' }}>
              {editing ? (
                <input
                  autoFocus
                  type="number"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onBlur={e => commitEdit(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && commitEdit(inputVal)}
                  style={{
                    width: 80, textAlign: 'center', fontWeight: 800, fontSize: 28,
                    color: '#111827', border: '2px solid #3b82f6', borderRadius: 8,
                    outline: 'none', padding: '4px 8px',
                    background: '#fff',
                  }}
                />
              ) : (
                <span
                  onClick={() => { setInputVal(String(hours)); setEditing(true) }}
                  style={{ fontWeight: 800, fontSize: 28, color: '#111827', cursor: 'text', borderBottom: '2px dashed #d1d5db' }}
                >
                  {hours}
                </span>
              )}
              <span style={{ color: '#6b7280', fontSize: 16, marginLeft: 4 }}>hr{hours !== 1 ? 's' : ''}</span>
            </div>

            <button onClick={() => setHours(h => Math.min(24, Math.round((h + 0.5) * 2) / 2))} style={{
              width: 40, height: 40, borderRadius: 10, border: '2px solid #3b82f6',
              background: '#eff6ff', fontWeight: 800, fontSize: 22, cursor: 'pointer', color: '#3b82f6',
            }}>+</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[1, 2, 3, 4].map(h => (
              <button key={h} onClick={() => setHours(h)} style={{
                flex: 1, padding: 8, borderRadius: 10,
                border: hours === h ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                background: hours === h ? '#eff6ff' : '#f9fafb',
                fontWeight: 700, fontSize: 13,
                color: hours === h ? '#1d4ed8' : '#374151', cursor: 'pointer',
              }}>{h}h</button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div style={{
          background: '#eff6ff', borderRadius: 14, padding: '14px 18px', marginTop: 14,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ color: '#1d4ed8', fontWeight: 600, fontSize: 14 }}>Estimated Total</span>
          <span style={{ color: '#1d4ed8', fontWeight: 800, fontSize: 22 }}>${total}</span>
        </div>

        {/* Quick Pay button — right below total */}
        <button onClick={() => onPay(spot, hours)} style={{
          width: '100%', padding: 14, background: '#3b82f6', border: 'none', borderRadius: 14,
          color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', marginTop: 12,
        }}>
          ⚡ Quick Pay — ${total}
        </button>
      </div>
    </div>
  )
}