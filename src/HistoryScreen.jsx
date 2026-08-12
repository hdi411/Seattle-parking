const LS_SEARCH_KEY = 'seattle-parking-searches'

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function HistoryScreen({ searchHistory, setSearchHistory }) {
  function clearAll() {
    setSearchHistory([])
    localStorage.removeItem(LS_SEARCH_KEY)
  }

  function removeItem(index) {
    setSearchHistory(prev => {
      const updated = prev.filter((_, i) => i !== index)
      localStorage.setItem(LS_SEARCH_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '20px 20px 16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: '#111827' }}>Search History</div>
        {searchHistory.length > 0 && (
          <button onClick={clearAll} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, color: '#ef4444', fontWeight: 600, padding: '4px 8px',
          }}>Clear all</button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {searchHistory.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '60%', gap: 12,
          }}>
            <div style={{ fontSize: 48 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#374151' }}>No search history</div>
            <div style={{ fontSize: 13, color: '#9ca3af', textAlign: 'center' }}>
              Searches you make will appear here
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {searchHistory.map((item, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 12,
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#eff6ff', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, fontSize: 18,
                }}>📍</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 700, fontSize: 14, color: '#111827',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{item.query}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                    {timeAgo(item.timestamp)}
                  </div>
                </div>
                <button onClick={() => removeItem(i)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#d1d5db', fontSize: 18, padding: '4px', flexShrink: 0,
                }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
