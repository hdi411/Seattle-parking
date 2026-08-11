import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }) {
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2000)
    const doneTimer = setTimeout(() => onDone(), 2600)
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer) }
  }, [])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(160deg, #1e40af 0%, #1d6fd8 50%, #0ea5e9 100%)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 0,
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.6s ease',
    }}>

      {/* Logo */}
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ marginBottom: 24 }}>
        {/* Space Needle stem + P shape */}
        <ellipse cx="60" cy="108" rx="28" ry="7" fill="rgba(255,255,255,0.15)"/>
        {/* Map grid at bottom */}
        <ellipse cx="60" cy="102" rx="22" ry="5" fill="rgba(255,255,255,0.2)"/>
        <line x1="42" y1="97" x2="42" y2="107" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        <line x1="52" y1="97" x2="52" y2="107" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        <line x1="62" y1="97" x2="62" y2="107" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        <line x1="72" y1="97" x2="72" y2="107" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
        {/* Needle + P combined */}
        <path d="M54 95 L54 50 L54 45" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
        {/* Needle top disc */}
        <ellipse cx="54" cy="44" rx="16" ry="5" fill="#fff" opacity="0.9"/>
        <ellipse cx="54" cy="38" rx="10" ry="4" fill="#fff"/>
        {/* P curve on right */}
        <path d="M54 28 Q54 8 76 20 Q88 28 76 42 Q66 50 54 48"
          stroke="#fff" strokeWidth="8" strokeLinecap="round" fill="none"/>
        {/* Star */}
        <path d="M82 14 L83.5 18 L88 18 L84.5 21 L86 25 L82 22.5 L78 25 L79.5 21 L76 18 L80.5 18 Z"
          fill="rgba(255,255,255,0.9)"/>
        {/* Parking pin at bottom of needle */}
        <circle cx="54" cy="90" r="10" fill="#10b981" stroke="#fff" strokeWidth="2.5"/>
        <text x="54" y="94.5" textAnchor="middle" fontSize="11" fontWeight="900" fill="#fff">P</text>
        <path d="M54 100 L50 90 L58 90 Z" fill="#10b981"/>
      </svg>

      {/* App name */}
      <div style={{
        fontSize: 32, fontWeight: 800, color: '#fff',
        letterSpacing: '-0.5px', lineHeight: 1.1,
        textAlign: 'center',
      }}>
        Seattle Parking
      </div>

      {/* Powered by */}
      <div style={{
        marginTop: 12, fontSize: 13, color: 'rgba(255,255,255,0.65)',
        fontWeight: 500, letterSpacing: '0.05em',
      }}>
        powered by <span style={{ color: '#fff', fontWeight: 700 }}>SPARK</span>
      </div>

      {/* Loading dots */}
      <div style={{
        position: 'absolute', bottom: 60,
        display: 'flex', gap: 8,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)',
            animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
