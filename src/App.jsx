import { useState, useEffect } from 'react'
import { AuthProvider } from './AuthContext'
import { useAuth } from './AuthContext'
import { db } from './firebase'
import { collection, addDoc, getDocs, query, orderBy, doc, setDoc, deleteDoc } from 'firebase/firestore'
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
  // Orders: always load from localStorage so receipts survive refresh even when not logged in
  const [orders, setOrders] = useState(() => {
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
  const [searchHistory, setSearchHistory] = useState([])
  const [aiTip, setAiTip] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [recommendedId, setRecommendedId] = useState(null)

  // Persist orders to localStorage on every change (works even without login)
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(orders))
  }, [orders])

  // Load from Firestore when logged in; clear session data when logged out
  useEffect(() => {
    if (user === undefined) return // still loading auth state
    if (!user) {
      setSearchHistory([])
      setSavedSpots([])
      return
    }
    // Orders — merge localStorage with Firestore
    const ordersRef = collection(db, 'users', user.uid, 'orders')
    getDocs(query(ordersRef, orderBy('startTime', 'desc'))).then(snap => {
      const firestoreOrders = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setOrders(prev => {
        const ids = new Set(firestoreOrders.map(o => o.id))
        const localOnly = prev.filter(o => !ids.has(o.id))
        return [...firestoreOrders, ...localOnly]
      })
    }).catch(console.error)
    // Search history
    const searchRef = collection(db, 'users', user.uid, 'searches')
    getDocs(query(searchRef, orderBy('timestamp', 'desc'))).then(snap => {
      setSearchHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }).catch(console.error)
    // Saved spots
    const savedRef = collection(db, 'users', user.uid, 'saved')
    getDocs(savedRef).then(snap => {
      setSavedSpots(snap.docs.map(d => ({ ...d.data() })))
    }).catch(console.error)
  }, [user])

  // Wrap setSavedSpots to also sync adds/removes to Firestore
  function handleSetSavedSpots(updater) {
    setSavedSpots(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      if (!user) return next
      const prevIds = new Set(prev.map(s => String(s.id)))
      const nextIds = new Set(next.map(s => String(s.id)))
      // Added spots
      next.filter(s => !prevIds.has(String(s.id))).forEach(spot => {
        setDoc(doc(db, 'users', user.uid, 'saved', String(spot.id)), spot).catch(console.error)
      })
      // Removed spots
      prev.filter(s => !nextIds.has(String(s.id))).forEach(spot => {
        deleteDoc(doc(db, 'users', user.uid, 'saved', String(spot.id))).catch(console.error)
      })
      return next
    })
  }

  function handleSearch(entry) {
    setSearchHistory(prev => {
      const filtered = prev.filter(s => s.query !== entry.query)
      return [entry, ...filtered].slice(0, 50)
    })
    // Use setDoc with place name as doc ID — auto-deduplicates same location
    if (user) {
      const docId = entry.query.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100)
      const ref = doc(db, 'users', user.uid, 'searches', docId)
      setDoc(ref, entry).catch(console.error)
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
            savedSpots={savedSpots} setSavedSpots={handleSetSavedSpots}
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
            setSavedSpots={handleSetSavedSpots}
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
