import { useState, useEffect } from 'react'
import { AuthProvider } from './AuthContext'
import { useAuth } from './AuthContext'
import { db } from './firebase'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'
import SplashScreen from './SplashScreen'
import ParkingMap from './ParkingMap'
import DetailScreen from './DetailScreen'
import FilterScreen from './FilterScreen'
import PaymentScreen from './PaymentScreen'
import SuccessScreen from './SuccessScreen'
import OrdersScreen from './OrdersScreen'
import SavedScreen from './SavedScreen'
import HistoryScreen from './HistoryScreen'
import ProfileScreen from './ProfileScreen'
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

const LS_KEY = 'seattle-parking-orders'
const LS_SEARCH_KEY = 'seattle-parking-searches'

function AppInner() {
  const { user } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [screen, setScreen] = useState('map')
  const [navTab, setNavTab] = useState('map')
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [selectedHours, setSelectedHours] = useState(2)
  const [orders, setOrders] = useState(() => {
    // Load from localStorage on first render
    try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]') } catch { return [] }
  })
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
  const [searchHistory, setSearchHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_SEARCH_KEY) || '[]') } catch { return [] }
  })
  const [aiTip, setAiTip] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [recommendedId, setRecommendedId] = useState(null)

  // Load orders from Firestore when user logs in
  useEffect(() => {
    if (!user) return
    const ref = collection(db, 'users', user.uid, 'orders')
    getDocs(query(ref, orderBy('startTime', 'desc'))).then(snap => {
      const firestoreOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      // Merge with localStorage orders (avoid duplicates by id)
      setOrders(prev => {
        const ids = new Set(firestoreOrders.map(o => o.id))
        const localOnly = prev.filter(o => !ids.has(o.id))
        return [...firestoreOrders, ...localOnly]
      })
    }).catch(console.error)
  }, [user])

  // Persist orders to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(orders))
  }, [orders])

  function handleSearch(entry) {
    setSearchHistory(prev => {
      // Deduplicate by query string, keep latest at top, max 50
      const filtered = prev.filter(s => s.query !== entry.query)
      const updated = [entry, ...filtered].slice(0, 50)
      localStorage.setItem(LS_SEARCH_KEY, JSON.stringify(updated))
      return updated
    })
  }

  // Save new order to Firestore if logged in
  async function handleOrderCreated(order) {
    const newOrder = { ...order, startTime: Date.now() }
    setOrders(prev => [newOrder, ...prev])
    if (user) {
      try {
        const ref = collection(db, 'users', user.uid, 'orders')
        await addDoc(ref, newOrder)
      } catch (e) { console.error('Firestore write failed:', e) }
    }
  }

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

  const showNav = screen === 'map' || screen === 'saved' || screen === 'receipt' || screen === 'profile'
  const activeOrders = orders.filter(o => o.endTime > Date.now())

  if (showSplash) return <SplashScreen onDone={() => setShowSplash(false)} />

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
            onSearch={handleSearch}
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
            onOrderCreated={handleOrderCreated}
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
        {screen === 'receipt' && (
          <OrdersScreen orders={orders} onBack={() => { setScreen('map'); setNavTab('map') }} />
        )}
        {screen === 'profile' && (
          <ProfileScreen />
        )}
      </div>
      {showNav && <NavBar active={navTab} setActive={v => { setNavTab(v); setScreen(v) }} orderCount={activeOrders.length} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}
