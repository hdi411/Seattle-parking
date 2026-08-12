import { useEffect } from 'react'

export default function SuccessScreen({ spot, hours, onHome, onOrderCreated }) {
  const rate = spot.rate_1hr ? parseFloat(spot.rate_1hr) : 3
  const total = (rate * hours).toFixed(2)

  useEffect(() => {
    onOrderCreated({
      id: Date.now(),
      spot,
      hours,
      total,
      startTime: Date.now(),
      endTime: Date.now() + hours * 3600000,
    })
  }, [])

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: '100%', padding: '32px 24px', background: '#f9fafb', textAlign: 'center',
    }}>
      <div style={{
        width: 90, height: 90, borderRadius: '50%',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24, boxShadow: '0 8px 32px rgba(34,197,94,0.35)',
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div style={{ fontWeight: 800, fontSize: 26, color: '#111827', marginBottom: 8 }}>Parking Reserved!</div>
      <div style={{ color: '#6b7280', fontSize: 15, marginBottom: 28 }}>Your spot is confirmed and ready.</div>

      <div style={{
        background: '#fff', borderRadius: 20, padding: 24, width: '100%',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)', marginBottom: 28,
      }}>
        {[
          ['Location', spot.name],
          ['Duration', `${hours} hr${hours !== 1 ? 's' : ''}`],
          ['Total Paid', `$${total}`],
          ['Plate', 'WA · ABC-1234'],
        ].map(([k, v]) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between',
            padding: '10px 0', borderBottom: '1px solid #f3f4f6',
          }}>
            <span style={{ color: '#6b7280', fontSize: 14 }}>{k}</span>
            <span style={{ color: '#111827', fontWeight: 700, fontSize: 14 }}>{v}</span>
          </div>
        ))}
      </div>

      <button onClick={onHome} style={{
        width: '100%', padding: 14, background: '#3b82f6', border: 'none', borderRadius: 14,
        color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer',
      }}>
        Back to Home
      </button>
    </div>
  )
}