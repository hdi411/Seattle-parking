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
  // Start empty — loaded from Firestore (logged in) or stay in-memory only (not logged in)
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
  const [searchHistory, setSearchHistory] = useState([])
  const [aiTip, setAiTip] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [recommendedId, setRecommendedId] = useState(null)

  // Load from Firestore when logged in; clear when logged out
  useEffect(() => {
    if (user === undefined) return // still loading auth state
    if (!user) {
      // Not logged in — clear persisted data, keep session in-memory only
      setOrders([])
      setSearchHistory([])
      localStorage.removeItem(LS_KEY)
      localStorage.removeItem(LS_SEARCH_KEY)
      return
    }
    // Logged in — load orders from Firestore
    const ordersRef = collection(db, 'users', user.uid, 'orders')
    getDocs(query(ordersRef, orderBy('startTime', 'desc'))).then(snap => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }).catch(console.error)
    // Load search history from Firestore
    const searchRef = collection(db, 'users', user.uid, 'searches')
    getDocs(query(searchRef, orderBy('timestamp', 'desc'))).then(snap => {
      setSearchHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }).catch(console.error)
  }, [user])

  function handleSearch(entry) {
    setSearchHistory(prev => {
      const filtered = prev.filter(s => s.query !== entry.query)
      return [entry, ...filtered].slice(0, 50)
    })
    // Only persist if logged in
    if (user) {
      const ref = collection(db, 'users', user.uid, 'searches')
      addDoc(ref, entry).catch(console.error)
    }
  }

  // Save new order — only persists to Firestore if logged in
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
            searchHistory={searchHistory}
            onSpotSelect={spot => { setSelectedSpot(spot); setScreen('detail') }}
            onFilterOpen={() => setScreen('filter')}
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
