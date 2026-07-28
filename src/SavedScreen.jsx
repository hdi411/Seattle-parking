import { useState } from 'react'

const CATEGORIES = ['All', 'Work', 'Home', 'Shopping', 'Airport', 'Other']

const TYPE_COLOR = {
  'multi-storey': '#2aad27',
  'underground': '#2aad27',
  'street_side': '#cac428',
  'surface': '#2a81cb',
  'lot': '#2a81cb',
}

export default function SavedScreen({ savedSpots, setSavedSpots, onSpotSelect }) {
  const [activeCategory, setActiveCategory] = useState('All')
  const [editingId, setEditingId] = useState(null)

  const filtered = activeCategory === 'All'
    ? savedSpots
    : savedSpots.filter(s => s.category === activeCategory)

  function changeCategory(spotId, category) {
    setSavedSpots(prev => prev.map(s => s.id === spotId ? { ...s, category } : s))
    setEditingId(null)
  }

  function removeSpot(spotId) {
    setSavedSpots(prev => prev.filter(s => s.id !== spotId))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#f9fafb' }}>
      {/* Header */}
      <div style={{
        background: '#fff', padding: '16px 20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)', flexShrink: 0,
      }}>
        <div style={{ fontWeight: 800, fontSize: 20, color: '#111827', marginBottom: 12 }}>❤️ Saved</div>
        {/* Category tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={{
              padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap',
              background: activeCategory === cat ? '#3b82f6' : '#f3f4f6',
              color: activeCategory === cat ? '#fff' : '#6b7280',
            }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: 15 }}>
            No saved spots{activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
          </div>
        ) : (
          filtered.map(spot => (
            <div key={spot.id} style={{
              background: '#fff', borderRadius: 14, marginBottom: 12,
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)', overflow: 'hidden',
            }}>
              {/* Spot info */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: '50%',
                        background: TYPE_COLOR[spot.type] || '#2a81cb', flexShrink: 0,
                      }}/>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{spot.name || 'Parking Spot'}</span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 2 }}>{spot.address || '—'}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'capitalize' }}>{spot.type?.replace('_', ' ') || 'lot'}</div>
                  </div>
                  <button onClick={() => removeSpot(spot.id)} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 18, color: '#ef4444', padding: '0 0 0 8px',
                  }}>
                    ❤️
                  </button>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <div style={{
                    flex: 1, background: '#f9fafb', borderRadius: 10, padding: '8px 10px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>HOURLY</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
                      {spot.rate_1hr ? `$${spot.rate_1hr}` : '—'}
                    </div>
                  </div>
                  <div style={{
                    flex: 1, background: '#f9fafb', borderRadius: 10, padding: '8px 10px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>ALL DAY</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
                      {spot.rate_allday ? `$${spot.rate_allday}` : '—'}
                    </div>
                  </div>
                  <div style={{
                    flex: 1, background: '#f9fafb', borderRadius: 10, padding: '8px 10px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>STALLS</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#111827' }}>
                      {spot.stalls || '—'}
                    </div>
                  </div>
                </div>

                {/* Category + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => setEditingId(editingId === spot.id ? null : spot.id)} style={{
                    padding: '4px 10px', borderRadius: 12, border: '1.5px solid #e5e7eb',
                    background: '#f9fafb', fontSize: 11, fontWeight: 600, color: '#6b7280', cursor: 'pointer',
                  }}>
                    📁 {spot.category || 'Other'}
                  </button>
                  <button onClick={() => onSpotSelect(spot)} style={{
                    marginLeft: 'auto', padding: '6px 14px', borderRadius: 10,
                    background: '#3b82f6', border: 'none', color: '#fff',
                    fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  }}>
                    View →
                  </button>
                </div>
              </div>

              {/* Category picker */}
              {editingId === spot.id && (
                <div style={{
                  borderTop: '1px solid #f3f4f6', padding: '10px 16px',
                  display: 'flex', gap: 6, flexWrap: 'wrap', background: '#fafafa',
                }}>
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <button key={cat} onClick={() => changeCategory(spot.id, cat)} style={{
                      padding: '4px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                      fontWeight: 600, fontSize: 11,
                      background: spot.category === cat ? '#3b82f6' : '#e5e7eb',
                      color: spot.category === cat ? '#fff' : '#374151',
                    }}>
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}