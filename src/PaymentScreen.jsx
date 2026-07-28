import { useState } from 'react'

const SAVED_PLATES = ['WA · ABC-1234', 'WA · XYZ-5678']
const SAVED_CARDS = [
  { id: 1, label: 'Visa ···· 4242', icon: '💳' },
  { id: 2, label: 'Apple Pay', icon: '📱' },
]

export default function PaymentScreen({ spot, hours, onBack, onSuccess }) {
  const [plate, setPlate] = useState(SAVED_PLATES[0])
  const [card, setCard] = useState(1)
  const rate = spot.rate_1hr ? parseFloat(spot.rate_1hr) : 3
  const total = (rate * hours).toFixed(2)

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
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>Quick Pay</div>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{spot.name}</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
        {/* Summary */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
          borderRadius: 16, padding: 18, marginBottom: 24, color: '#fff',
        }}>
          <div style={{ opacity: 0.7, fontSize: 12, fontWeight: 600, marginBottom: 8 }}>PARKING SUMMARY</div>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{spot.name}</div>
          <div style={{ opacity: 0.8, fontSize: 13, marginBottom: 12 }}>
            {spot.address || 'Seattle, WA'} · {hours} hr{hours !== 1 ? 's' : ''}
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12,
          }}>
            <span style={{ opacity: 0.8, fontSize: 13 }}>${rate}/hr × {hours} hrs</span>
            <span style={{ fontWeight: 800, fontSize: 24 }}>${total}</span>
          </div>
        </div>

        {/* Plate */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>LICENSE PLATE</div>
          {SAVED_PLATES.map(p => (
            <button key={p} onClick={() => setPlate(p)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              width: '100%', background: '#fff', borderRadius: 12, marginBottom: 8,
              border: plate === p ? '2px solid #3b82f6' : '2px solid #e5e7eb',
              cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#111827',
            }}>
              🚗 {p}
              {plate === p && <span style={{ marginLeft: 'auto', color: '#3b82f6' }}>✓</span>}
            </button>
          ))}
        </div>

        {/* Card */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 10 }}>PAYMENT METHOD</div>
          {SAVED_CARDS.map(c => (
            <button key={c.id} onClick={() => setCard(c.id)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              width: '100%', background: '#fff', borderRadius: 12, marginBottom: 8,
              border: card === c.id ? '2px solid #3b82f6' : '2px solid #e5e7eb',
              cursor: 'pointer', fontWeight: 600, fontSize: 14, color: '#111827',
            }}>
              {c.icon} {c.label}
              {card === c.id && <span style={{ marginLeft: 'auto', color: '#3b82f6' }}>✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '16px 20px', background: '#fff', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)' }}>
        <button onClick={onSuccess} style={{
          width: '100%', padding: 16,
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          border: 'none', borderRadius: 14, color: '#fff', fontWeight: 800, fontSize: 17, cursor: 'pointer',
        }}>
          ✓ Confirm & Pay ${total}
        </button>
        <div style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 8 }}>
          🔒 Secured payment · Auto-pay on entry
        </div>
      </div>
    </div>
  )
}