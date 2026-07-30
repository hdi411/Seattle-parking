import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import { useState, useEffect } from 'react'
import L from 'leaflet'

const OSRM_MODES = { driving: 'driving', walking: 'foot', cycling: 'bike' }

function FitRoute({ coords }) {
  const map = useMap()
  useEffect(() => {
    if (coords?.length > 1) map.fitBounds(L.latLngBounds(coords), { padding: [60, 60] })
  }, [coords])
  return null
}

function toImperial(meters) {
  const feet = meters * 3.28084
  if (feet < 1000) return `${Math.round(feet)} ft`
  return `${(feet / 5280).toFixed(1)} mi`
}

function formatDuration(seconds) {
  const mins = Math.round(seconds / 60)
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}min`
}

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41],
})

export default function NavigationScreen({ spot, userPosition, onBack }) {
  const [mode, setMode] = useState('driving')
  const [routeCoords, setRouteCoords] = useState(null)
  const [routeInfo, setRouteInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  const origin = userPosition || [47.6062, -122.3321]

  useEffect(() => { fetchRoute(mode) }, [mode])

  async function fetchRoute(m) {
    setLoading(true)
    const url = `https://router.project-osrm.org/route/v1/${OSRM_MODES[m]}/${origin[1]},${origin[0]};${spot.lng},${spot.lat}?overview=full&geometries=geojson`
    try {
      const res = await fetch(url)
      const data = await res.json()
      const route = data.routes?.[0]
      if (route) {
        setRouteCoords(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]))
        setRouteInfo({ distance: route.distance, duration: route.duration })
      }
    } catch (e) { console.log('Route error:', e) }
    setLoading(false)
  }

  function startNav() {
    const travelmode = mode === 'walking' ? 'walking' : mode === 'cycling' ? 'bicycling' : 'driving'
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=${travelmode}`, '_blank')
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
        background: '#fff', padding: '12px 16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={onBack} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 22, color: '#374151', padding: 0,
        }}>←</button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {spot.name}
          </div>
          {spot.address && (
            <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {spot.address}
            </div>
          )}
        </div>
      </div>

      {/* Map */}
      <div style={{ position: 'absolute', top: 68, left: 0, right: 0, bottom: 148 }}>
        <MapContainer center={origin} zoom={13} zoomControl style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {routeCoords && (
            <>
              <Polyline positions={routeCoords} pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.85 }} />
              <FitRoute coords={routeCoords} />
            </>
          )}
          <Marker position={origin} icon={userIcon} />
          <Marker position={[spot.lat, spot.lng]} icon={destIcon} />
        </MapContainer>
      </div>

      {/* Bottom panel */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
        background: '#fff', padding: '16px',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.1)',
        borderRadius: '20px 20px 0 0',
      }}>
        {/* Mode selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { key: 'driving', label: '🚗 Drive' },
            { key: 'walking', label: '🚶 Walk' },
            { key: 'cycling', label: '🚴 Bike' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setMode(key)} style={{
              flex: 1, padding: '8px 0', border: 'none', borderRadius: 10,
              background: mode === key ? '#3b82f6' : '#f3f4f6',
              color: mode === key ? '#fff' : '#374151',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>

        {/* Route info */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          {loading ? (
            <span style={{ fontSize: 14, color: '#9ca3af' }}>Calculating route...</span>
          ) : routeInfo ? (
            <>
              <div>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{formatDuration(routeInfo.duration)}</span>
                <span style={{ fontSize: 14, color: '#6b7280', marginLeft: 8 }}>{toImperial(routeInfo.distance)}</span>
              </div>
              {spot.rate_1hr && <div style={{ fontSize: 13, color: '#6b7280' }}>${spot.rate_1hr}/hr</div>}
            </>
          ) : null}
        </div>

        <button onClick={startNav} style={{
          width: '100%', padding: '14px', background: '#22c55e',
          color: '#fff', border: 'none', borderRadius: 14,
          fontSize: 16, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
        }}>Start Navigation →</button>
      </div>
    </div>
  )
}