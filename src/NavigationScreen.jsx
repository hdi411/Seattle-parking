import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'

const OSRM_MODES = { driving: 'driving', walking: 'foot', cycling: 'bike' }

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

function distance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function parseStepInstruction(step) {
  const maneuver = step.maneuver
  const type = maneuver?.type || ''
  const modifier = maneuver?.modifier || ''
  const name = step.name || ''

  if (type === 'depart') return `Head ${modifier} on ${name || 'the road'}`
  if (type === 'arrive') return 'You have arrived'
  if (type === 'turn') {
    if (modifier === 'left') return `Turn left onto ${name || 'the road'}`
    if (modifier === 'right') return `Turn right onto ${name || 'the road'}`
    if (modifier === 'slight left') return `Bear left onto ${name || 'the road'}`
    if (modifier === 'slight right') return `Bear right onto ${name || 'the road'}`
    if (modifier === 'sharp left') return `Sharp left onto ${name || 'the road'}`
    if (modifier === 'sharp right') return `Sharp right onto ${name || 'the road'}`
    return `Turn onto ${name || 'the road'}`
  }
  if (type === 'continue') return `Continue on ${name || 'the road'}`
  if (type === 'merge') return `Merge onto ${name || 'the road'}`
  if (type === 'ramp') return `Take the ramp onto ${name || 'the road'}`
  if (type === 'fork') return `Keep ${modifier} at the fork`
  if (type === 'roundabout') return `Enter the roundabout`
  if (type === 'rotary') return `Enter the rotary`
  return `Continue on ${name || 'the road'}`
}

function getManeuverIcon(step) {
  const type = step.maneuver?.type || ''
  const modifier = step.maneuver?.modifier || ''
  if (type === 'arrive') return '🏁'
  if (type === 'depart') return '🚀'
  if (modifier === 'left' || modifier === 'sharp left') return '⬅️'
  if (modifier === 'right' || modifier === 'sharp right') return '➡️'
  if (modifier === 'slight left') return '↖️'
  if (modifier === 'slight right') return '↗️'
  if (modifier === 'uturn') return '↩️'
  if (type === 'roundabout' || type === 'rotary') return '🔄'
  return '⬆️'
}

function FollowMap({ userPos, navigating }) {
  const map = useMap()
  useEffect(() => {
    if (navigating && userPos) {
      map.setView(userPos, 17, { animate: true })
    }
  }, [userPos, navigating])
  return null
}

function FitRoute({ coords }) {
  const map = useMap()
  const fitted = useRef(false)
  useEffect(() => {
    if (coords?.length > 1 && !fitted.current) {
      map.fitBounds(L.latLngBounds(coords), { padding: [80, 80] })
      fitted.current = true
    }
  }, [coords])
  return null
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
  const [steps, setSteps] = useState([])
  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const [loading, setLoading] = useState(false)
  const [navigating, setNavigating] = useState(false)
  const [livePos, setLivePos] = useState(userPosition)
  const [remainingDist, setRemainingDist] = useState(null)
  const watchRef = useRef(null)

  const origin = userPosition || [47.6062, -122.3321]

  useEffect(() => { fetchRoute(mode) }, [mode])

  useEffect(() => {
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [])

  async function fetchRoute(m) {
    setLoading(true)
    setCurrentStepIdx(0)
    const url = `https://router.project-osrm.org/route/v1/${OSRM_MODES[m]}/${origin[1]},${origin[0]};${spot.lng},${spot.lat}?overview=full&geometries=geojson&steps=true`
    try {
      const res = await fetch(url)
      const data = await res.json()
      const route = data.routes?.[0]
      if (route) {
        setRouteCoords(route.geometry.coordinates.map(([lng, lat]) => [lat, lng]))
        const dist = route.distance
        const duration =
          m === 'walking' ? dist / 1.4 :
          m === 'cycling' ? dist / 4.2 :
          route.duration
        setRouteInfo({ distance: dist, duration })
        setRemainingDist(dist)

        // Flatten steps from all legs
        const allSteps = route.legs?.flatMap(leg => leg.steps || []) || []
        setSteps(allSteps)
      }
    } catch (e) { console.log('Route error:', e) }
    setLoading(false)
  }

  function startNavigation() {
    setNavigating(true)
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = [pos.coords.latitude, pos.coords.longitude]
        setLivePos(newPos)

        // Find closest step
        if (steps.length > 0) {
          let closestIdx = currentStepIdx
          let minDist = Infinity
          for (let i = currentStepIdx; i < Math.min(currentStepIdx + 5, steps.length); i++) {
            const stepLoc = steps[i].maneuver?.location
            if (stepLoc) {
              const d = distance(newPos[0], newPos[1], stepLoc[1], stepLoc[0])
              if (d < minDist) { minDist = d; closestIdx = i }
              // Auto-advance if within 30m of next step
              if (i === currentStepIdx + 1 && d < 30) {
                setCurrentStepIdx(i)
              }
            }
          }
          // Update remaining distance to destination
          const distToDest = distance(newPos[0], newPos[1], spot.lat, spot.lng)
          setRemainingDist(distToDest)

          // Check if arrived
          if (distToDest < 30) {
            setCurrentStepIdx(steps.length - 1)
          }
        }
      },
      (err) => console.log('GPS error:', err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    )
  }

  function stopNavigation() {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    setNavigating(false)
  }

  const currentStep = steps[currentStepIdx]
  const nextStep = steps[currentStepIdx + 1]

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#1a1a2e' }}>

      {/* Top bar */}
      {!navigating ? (
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
      ) : (
        /* Navigation top — current step instruction */
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000,
          background: '#1d4ed8', padding: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{currentStep ? getManeuverIcon(currentStep) : '⬆️'}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                {currentStep ? parseStepInstruction(currentStep) : 'Follow the route'}
              </div>
              {currentStep?.distance > 0 && (
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                  in {toImperial(currentStep.distance)}
                </div>
              )}
            </div>
            <button onClick={stopNavigation} style={{
              background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8,
              padding: '6px 12px', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}>End</button>
          </div>

          {/* Next step preview */}
          {nextStep && (
            <div style={{
              marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 16, opacity: 0.8 }}>{getManeuverIcon(nextStep)}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Then: {parseStepInstruction(nextStep)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Map */}
      <div style={{
        position: 'absolute',
        top: navigating ? 100 : 68,
        left: 0, right: 0,
        bottom: navigating ? 80 : 148,
      }}>
        <MapContainer center={livePos || origin} zoom={13} zoomControl={!navigating} style={{ width: '100%', height: '100%' }}>
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {routeCoords && (
            <>
              <Polyline positions={routeCoords} pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.9 }} />
              {!navigating && <FitRoute coords={routeCoords} />}
            </>
          )}
          {navigating && livePos && <FollowMap userPos={livePos} navigating={navigating} />}
          <Marker position={livePos || origin} icon={userIcon} />
          <Marker position={[spot.lat, spot.lng]} icon={destIcon} />
        </MapContainer>
      </div>

      {/* Bottom panel — pre-navigation */}
      {!navigating && (
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

          <button onClick={startNavigation} disabled={!routeCoords} style={{
            width: '100%', padding: '14px', background: routeCoords ? '#22c55e' : '#d1d5db',
            color: '#fff', border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700, cursor: routeCoords ? 'pointer' : 'default',
            boxShadow: routeCoords ? '0 4px 12px rgba(34,197,94,0.4)' : 'none',
          }}>Start Navigation →</button>
        </div>
      )}

      {/* Bottom bar — during navigation */}
      {navigating && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: '#1e293b', padding: '12px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Remaining</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
              {remainingDist !== null ? toImperial(remainingDist) : '—'}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Destination</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {spot.name}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>ETA</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>
              {remainingDist !== null ? formatDuration(mode === 'walking' ? remainingDist / 1.4 : mode === 'cycling' ? remainingDist / 4.2 : remainingDist / 13) : '—'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 