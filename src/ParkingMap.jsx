import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet'
import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import allSpots from './parking_lots.json'

function distance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function toImperial(meters) {
  const feet = meters * 3.28084
  if (feet < 1000) return `${Math.round(feet)} ft`
  return `${(feet / 5280).toFixed(1)} mi`
}

function RecenterMap({ position, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (position[0] && position[1]) map.setView(position, zoom)
  }, [map, position, zoom])
  return null
}

function ZoomControls() {
  const map = useMap()
  return (
    <div style={{
      position: 'absolute', bottom: 180, left: 10, zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <button onClick={() => map.zoomIn()} style={{
        width: 36, height: 36, background: '#fff', border: '1px solid #d1d5db',
        borderRadius: '8px 8px 4px 4px', fontSize: 20, fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151',
      }}>+</button>
      <button onClick={() => map.zoomOut()} style={{
        width: 36, height: 36, background: '#fff', border: '1px solid #d1d5db',
        borderRadius: '4px 4px 8px 8px', fontSize: 20, fontWeight: 700,
        cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151',
      }}>−</button>
    </div>
  )
}

// Preload all icons at module level so images are cached before panning
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
})

const recommendedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
})

const SPOT_ICONS = {
  green: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [20, 33], iconAnchor: [10, 33],
  }),
  yellow: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [20, 33], iconAnchor: [10, 33],
  }),
  blue: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [20, 33], iconAnchor: [10, 33],
  }),
}

function getSpotIcon(type) {
  if (type === 'multi-storey' || type === 'underground') return SPOT_ICONS.green
  if (type === 'street_side') return SPOT_ICONS.yellow
  return SPOT_ICONS.blue
}

async function getAiRecommendation(spots, lat, lng) {
  const top = spots
    .map(s => ({ ...s, dist: distance(lat, lng, s.lat, s.lng) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 8)
    .filter(s => s.rate_1hr)
  if (top.length === 0) return null

  const spotsText = top.map((s, i) =>
    `[${i}] ${s.name || 'Unnamed'}: $${s.rate_1hr}/hr, ${toImperial(s.dist)} away`
  ).join('\n')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `Nearby parking:\n${spotsText}\n\nReply with JSON only: {"recommended_index":<number>,"explanation":"<1 sentence, mention price and distance>"}`,
      }],
      max_tokens: 80,
    }),
  })
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  try {
    const parsed = JSON.parse(text)
    const picked = top[parsed.recommended_index]
    return picked ? { recommended_id: picked.id, explanation: parsed.explanation } : null
  } catch { return null }
}

export default function ParkingMap({
  prefs, onSpotSelect, onFilterOpen, onOrdersOpen, activeOrderCount,
  position, setPosition, zoom, setZoom, spots, setSpots,
  savedSpots, setSavedSpots,
  searchQuery, setSearchQuery,
  hasSearched, setHasSearched,
  aiTip, setAiTip,
  aiLoading, setAiLoading,
  recommendedId, setRecommendedId,
  onNavigate,
}) {
  const [suggestions, setSuggestions] = useState([])
  const [showSpots, setShowSpots] = useState(true)
  const [userPosition, setUserPosition] = useState(null)
  const [aiCollapsed, setAiCollapsed] = useState(false)
  const lastPositionRef = useRef(null)
  const aiCacheRef = useRef({})

  const filteredSpots = spots.filter(spot => {
    const typeMatch =
      (prefs.types.includes('garage') && (spot.type === 'multi-storey' || spot.type === 'underground')) ||
      (prefs.types.includes('street') && spot.type === 'street_side') ||
      (prefs.types.includes('lot') && (spot.type === 'surface' || spot.type === 'lot'))
    const rateMatch = !spot.rate_1hr || spot.rate_1hr <= prefs.maxRate
    return typeMatch && rateMatch
  })

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.log('error:', err)
    )
  }, [])

  useEffect(() => {
    const key = `${position[0].toFixed(4)},${position[1].toFixed(4)}`
    if (lastPositionRef.current === key) return
    if (filteredSpots.filter(s => s.rate_1hr).length === 0) return
    lastPositionRef.current = key

    if (aiCacheRef.current[key]) {
      const cached = aiCacheRef.current[key]
      setAiTip(cached.explanation)
      setRecommendedId(cached.recommended_id)
      setAiCollapsed(false)
      return
    }

    setAiLoading(true)
    getAiRecommendation(filteredSpots, position[0], position[1])
      .then(result => {
        if (result) {
          aiCacheRef.current[key] = result
          setAiTip(result.explanation)
          setRecommendedId(result.recommended_id)
          setAiCollapsed(false)
        }
        setAiLoading(false)
      })
      .catch(() => setAiLoading(false))
  }, [position, filteredSpots])

  function goToUserLocation(fromSearch = false) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setPosition([lat, lng])
        setZoom(16)
        setUserPosition([lat, lng])
        const nearby = allSpots.filter(s => distance(lat, lng, s.lat, s.lng) < (prefs?.radius || 1000))
        setSpots(nearby)
        if (fromSearch) setHasSearched(true)
      },
      (err) => console.log('error:', err)
    )
  }

  const myLocationSuggestion = userPosition ? [{
    place_id: 'my-location',
    display_name: 'My Location',
    lat: userPosition[0],
    lon: userPosition[1],
  }] : []

  async function fetchSuggestions(q) {
    if (!q.trim()) { setSuggestions([]); return }
    if (q.toLowerCase().includes('my location') || q.toLowerCase().includes('my loc')) {
      setSuggestions(myLocationSuggestion); return
    }
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&viewbox=-122.6,47.9,-121.9,47.3&bounded=1`
    )
    const data = await res.json()
    setSuggestions([...myLocationSuggestion, ...data])
  }

  function selectSuggestion(item) {
    setHasSearched(true)
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)
    setPosition([lat, lng])
    setZoom(16)
    const nearby = allSpots.filter(s => distance(lat, lng, s.lat, s.lng) < (prefs?.radius || 1000))
    setSpots(nearby)
    setSearchQuery(item.display_name.split(',')[0])
    setSuggestions([])
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>

      <div style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1000 }}>

        {/* 顶部一行：search bar + 🅿️ + 📋 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{
              background: '#fff',
              borderRadius: suggestions.length > 0 ? '12px 12px 0 0' : 12,
              padding: '10px 14px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); fetchSuggestions(e.target.value) }}
                onFocus={() => { if (!searchQuery) setSuggestions(myLocationSuggestion) }}
                onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                onKeyDown={e => {
                  if (e.key === 'Escape') setSuggestions([])
                  if (e.key === 'Enter' && suggestions.length > 0) selectSuggestion(suggestions[0])
                }}
                placeholder="Search destination..."
                style={{
                  flex: 1, border: 'none', outline: 'none',
                  fontSize: 15, fontWeight: 600, color: '#111827', background: 'transparent',
                }}
              />
              {searchQuery && (
                <button onClick={() => {
                  setSearchQuery(''); setSuggestions([])
                  setHasSearched(false); setAiTip(null); setRecommendedId(null)
                  goToUserLocation()
                }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18, padding: 0 }}>
                  ×
                </button>
              )}
              <button onClick={onFilterOpen} style={{
                background: '#3b82f6', border: 'none', borderRadius: 8,
                padding: '6px 10px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>⚙️</button>
            </div>

            {suggestions.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1001,
                background: '#fff', borderRadius: '0 0 12px 12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                borderTop: '1px solid #f3f4f6', overflow: 'hidden',
              }}>
                {suggestions.map(item => (
                  <button key={item.place_id} onClick={() => {
                    if (item.place_id === 'my-location') { goToUserLocation(true); setSearchQuery(''); setSuggestions([]) }
                    else selectSuggestion(item)
                  }} style={{
                    width: '100%', textAlign: 'left', padding: '10px 14px',
                    border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: 14, color: '#111827', borderBottom: '1px solid #f9fafb',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    {item.place_id === 'my-location' ? '🎯' : '📍'}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.display_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 🅿️ 和 📋 在 search bar 外面 */}
          <button onClick={() => setShowSpots(s => !s)} style={{
            background: showSpots ? '#22c55e' : '#e5e7eb', border: 'none', borderRadius: 8,
            padding: '10px 11px', color: showSpots ? '#fff' : '#6b7280',
            fontWeight: 600, fontSize: 15, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', flexShrink: 0,
          }}>🅿️</button>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button onClick={onOrdersOpen} style={{
              background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 8,
              padding: '10px 11px', fontWeight: 600, fontSize: 15, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>📋</button>
            {activeOrderCount > 0 && (
              <div style={{
                position: 'absolute', top: -6, right: -6,
                background: '#ef4444', color: '#fff', borderRadius: '50%',
                width: 18, height: 18, fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{activeOrderCount}</div>
            )}
          </div>
        </div>

        {/* AI card */}
        {aiCollapsed ? (
          <button onClick={() => setAiCollapsed(false)} style={{
            marginTop: 8,
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            border: 'none', borderRadius: 20, padding: '7px 14px',
            color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>✨ AI</button>
        ) : (
          <div style={{
            marginTop: 8,
            background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            borderRadius: 14, padding: '10px 14px',
            boxShadow: '0 4px 16px rgba(59,130,246,0.4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>✨</span>
                {aiLoading
                  ? <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Finding best spot...</span>
                  : aiTip
                    ? <span style={{ fontSize: 13, color: '#fff', lineHeight: 1.4 }}>{aiTip}</span>
                    : <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Loading nearby recommendations...</span>
                }
              </div>
              <button onClick={() => setAiCollapsed(true)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)', fontSize: 18, padding: 0, flexShrink: 0,
              }}>×</button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 58, left: 10, zIndex: 1000,
        background: 'rgba(255,255,255,0.95)', borderRadius: 10, padding: '7px 11px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)', fontSize: 11, fontWeight: 600,
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2a81cb' }}/>Surface / Lot
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#2aad27' }}/>Garage / Underground
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#cac428' }}/>Street Side
        </div>
        {recommendedId && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f97316' }}/>✨ AI Pick
          </div>
        )}
      </div>

      <MapContainer
        center={position}
        zoom={zoom}
        zoomControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomControls />
        <Marker position={position} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
        {showSpots && filteredSpots.map(spot => {
          const isSaved = savedSpots?.some(s => s.id === spot.id)
          const isRecommended = recommendedId && spot.id === recommendedId
          return (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lng]}
              icon={isRecommended ? recommendedIcon : getSpotIcon(spot.type)}
              zIndexOffset={isRecommended ? 1000 : 0}
            >
              <Popup>
                {isRecommended && (
                  <div style={{ color: '#f97316', fontWeight: 700, marginBottom: 4 }}>✨ AI Recommended</div>
                )}
                <b>{spot.name}</b><br />
                Type: {spot.type || 'lot'}<br />
                {spot.address}<br />
                Stalls: {spot.stalls}<br />
                {spot.rate_1hr && `$${spot.rate_1hr}/hr`}<br />
                <button onClick={() => onSpotSelect(spot)} style={{
                  marginTop: 8, padding: '6px 12px', background: '#3b82f6',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontWeight: 600, cursor: 'pointer', width: '100%',
                }}>View Details →</button>
                <button onClick={() => onNavigate(spot)} style={{
                  marginTop: 6, padding: '6px 12px', background: '#10b981',
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontWeight: 600, cursor: 'pointer', width: '100%',
                }}>Get Directions 🗺️</button>
                <button onClick={() => {
                  if (isSaved) setSavedSpots(prev => prev.filter(s => s.id !== spot.id))
                  else setSavedSpots(prev => [...prev, { ...spot, category: 'Other' }])
                }} style={{
                  marginTop: 6, padding: '6px 12px',
                  background: isSaved ? '#fee2e2' : '#f9fafb',
                  color: isSaved ? '#ef4444' : '#6b7280',
                  border: '1.5px solid #e5e7eb', borderRadius: 8,
                  fontWeight: 600, cursor: 'pointer', width: '100%',
                }}>{isSaved ? '❤️ Saved' : '🤍 Save'}</button>
              </Popup>
            </Marker>
          )
        })}
        <RecenterMap position={position} zoom={zoom} />
      </MapContainer>
    </div>
  )
}
