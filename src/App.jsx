import { useState, useEffect } from 'react'
import ParkingMap from './ParkingMap'
import DetailScreen from './DetailScreen'
import FilterScreen from './FilterScreen'
import PaymentScreen from './PaymentScreen'
import SuccessScreen from './SuccessScreen'
import OrdersScreen from './OrdersScreen'
import SavedScreen from './SavedScreen'
import NavBar from './NavBar'
import NavigationScreen from './NavigationScreen'
import allSpots from './parking_lots.json'

function distance(lat1, lng1, lat2, lng2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function App() {
  const [screen, setScreen] = useState('map')
  const [navTab, setNavTab] = useState('map')
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [selectedHours, setSelectedHours] = useState(2)
  const [orders, setOrders] = useState([])
  const [savedSpots, setSavedSpots] = useState([])
  const [position, setPosition] = useState([47.6097, -122.3331])
  const [userPosition, setUserPosition] = useState(null)
  const [zoom, setZoom] = useState(16)
  const [spots, setSpots] = useState([])
  const [navSpot, setNavSpot] = useState(null)
  const [prefs, setPrefs] = useState({
    types: ['garage', 'street', 'lot'],
    maxRate: 6,
    radius: 1000,
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [aiTip, setAiTip] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [recommendedId, setRecommendedId] = useState(null)

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setPosition([lat, lng])
        setUserPosition([lat, lng])
        const nearby = allSpots.filter(s => distance(lat, lng, s.lat, s.lng) < (prefs?.radius || 1000))
        setSpots(nearby)
      },
      (err) => console.log('error:', err)
    )
  }, [])

  const showNav = screen === 'map' || screen === 'saved' || screen === 'history' || screen === 'profile'
  const activeOrders = orders.filter(o => o.endTime > Date.now())

  if (navSpot) return (
    <NavigationScreen
      spot={navSpot}
      userPosition={userPosition}
      onBack={() => setNavSpot(null)}
    />
  )

  return (
    <div style={{
      width: '100vw', height: '100dvh',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      boxSizing: 'border-box',
    }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {screen === 'map' && (
          <ParkingMap
            prefs={prefs}
            position={position} setPosition={setPosition}
            zoom={zoom} setZoom={setZoom}
            spots={spots} setSpots={setSpots}
            savedSpots={savedSpots} setSavedSpots={setSavedSpots}
            searchQuery={searchQuery} setSearchQuery={setSearchQuery}
            hasSearched={hasSearched} setHasSearched={setHasSearched}
            aiTip={aiTip} setAiTip={setAiTip}
            aiLoading={aiLoading} setAiLoading={setAiLoading}
            recommendedId={recommendedId} setRecommendedId={setRecommendedId}
            onSpotSelect={spot => { setSelectedSpot(spot); setScreen('detail') }}
            onFilterOpen={() => setScreen('filter')}
            onOrdersOpen={() => setScreen('orders')}
            activeOrderCount={activeOrders.length}
            onNavigate={setNavSpot}
          />
        )}
        {screen === 'filter' && (
          <FilterScreen prefs={prefs} setPrefs={setPrefs} onBack={() => setScreen('map')} />
        )}
        {screen === 'detail' && selectedSpot && (
          <DetailScreen
            spot={selectedSpot}
            onBack={() => setScreen('map')}
            onPay={(spot, hours) => { setSelectedSpot(spot); setSelectedHours(hours); setScreen('pay') }}
          />
        )}
        {screen === 'pay' && selectedSpot && (
          <PaymentScreen
            spot={selectedSpot}
            hours={selectedHours}
            onBack={() => setScreen('detail')}
            onSuccess={() => setScreen('success')}
          />
        )}
        {screen === 'success' && selectedSpot && (
          <SuccessScreen
            spot={selectedSpot}
            hours={selectedHours}
            onHome={() => { setScreen('map'); setNavTab('map') }}
            onOrderCreated={order => setOrders(prev => [...prev, order])}
          />
        )}
        {screen === 'orders' && (
          <OrdersScreen orders={orders} onBack={() => setScreen('map')} />
        )}
        {screen === 'saved' && (
          <SavedScreen
            savedSpots={savedSpots}
            setSavedSpots={setSavedSpots}
            onSpotSelect={spot => { setSelectedSpot(spot); setScreen('detail') }}
          />
        )}
        {screen === 'history' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: 16 }}>
            No history yet
          </div>
        )}
        {screen === 'profile' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af', fontSize: 16 }}>
            Profile coming soon
          </div>
        )}
      </div>
      {showNav && <NavBar active={navTab} setActive={v => { setNavTab(v); setScreen(v) }} />}
    </div>
  )
}
