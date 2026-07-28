import { useState, useEffect } from 'react'

function Countdown({ endTime }) {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now())

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(endTime - Date.now())
    }, 1000)
    return () => clearInterval(timer)
  }, [endTime])

  if (timeLeft <= 0) return <span style={{ color: '#ef4444', fontWeight: 700 }}>Expired</span>

  const hrs = Math.floor(timeLeft / 3600000)
  const mins = Math.floor((timeLeft % 3600000) / 60000)
  const secs = Math.floor((timeLeft % 60000) / 1000)

  return (
    <span style={{ fontWeight: 800, fontSize: 22, color: '#3b82f6', fontVariantNumeric: 'tabular-nums' }}>
      {String(hrs).padStart(2,'0')}:{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
    </span>
  )
}

export default function OrdersScreen({ orders, onBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      <div style={{
        background: '#fff', padding: '20px', display: 'flex', alignItems: 'center',
        gap: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          background: '#f3f4f6', border: 'none', borderRadius: 10,
          padding: '8px 12px', cursor: 'pointer', fontSize: 18,
        }}>←</button>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>My Orders</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: 60, fontSize: 16 }}>
            No active orders
          </div>
        )}
        {orders.map(order => (
          <div key={order.id} style={{
            background: '#fff', borderRadius: 16, padding: 20,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 4 }}>
              {order.spot.name}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
              {order.spot.address || 'Seattle, WA'} · {order.hours} hr{order.hours !== 1 ? 's' : ''}
            </div>

            <div style={{ background: '#f0f9ff', borderRadius: 12, padding: '14px 16px', textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Time Remaining</div>
              <Countdown endTime={order.endTime} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6b7280' }}>Total Paid</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>${order.total}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 4 }}>
              <span style={{ color: '#6b7280' }}>Plate</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>WA · ABC-1234</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}