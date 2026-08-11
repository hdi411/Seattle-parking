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
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.6s ease',
    }}>

      <img
        src="/spark-logo.png"
        alt="SPARK logo"
        style={{ width: 180, height: 180, objectFit: 'contain', marginBottom: 16 }}
      />

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
        marginTop: 10, fontSize: 13, color: 'rgba(255,255,255,0.65)',
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
