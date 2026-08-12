import { useAuth } from './AuthContext'

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export default function HistoryScreen({ orders }) {
  const { user } = useAuth()

  const sorted = [...orders].sort((a, b) => (b.startTime || 0) - (a.startTime || 0))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: '#fff', padding: 20,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0,
      }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>History</div>
        {!user && (
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            Sign in from Profile to save history across devices
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px' }}>
        {sorted.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '60%', gap: 12,
          }}>
            <div style={{ fontSize: 48 }}>🅿️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>No parking history yet</div>
            <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
              Your parking sessions will appear here
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sorted.map((order, i) => (
              <div key={order.id || i} style={{
                background: '#fff', borderRadius: 14,
                padding: '14px 16px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                      {order.spot?.name || 'Parking'}
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      {order.spot?.address || ''}
                    </div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
                      {formatDate(order.startTime)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#111827' }}>
                      ${((order.spot?.rate_1hr || 0) * (order.hours || 1)).toFixed(2)}
                    </div>
                    <div style={{
                      fontSize: 11, marginTop: 4, fontWeight: 600,
                      color: order.endTime > Date.now() ? '#16a34a' : '#9ca3af',
                    }}>
                      {order.endTime > Date.now() ? 'Active' : `${order.hours}h`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
