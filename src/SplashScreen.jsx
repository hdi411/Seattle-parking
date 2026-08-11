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

      {/*
        Space Needle logo — clean geometric version:
        Spire → upper obs ring → upper stem → saucer (= P sign) → lower stem → tripod legs
      */}
      <svg width="100" height="148" viewBox="0 0 100 148" fill="none" style={{ marginBottom: 28 }}>

        {/* ── Spire ── */}
        <line x1="50" y1="2" x2="50" y2="18"
          stroke="white" strokeWidth="2.5" strokeLinecap="round"/>

        {/* ── Upper observation ring ── */}
        <ellipse cx="50" cy="18" rx="7" ry="2.5" fill="rgba(255,255,255,0.55)"/>

        {/* ── Upper stem (obs ring → saucer) ── */}
        <rect x="47.5" y="20" width="5" height="13" rx="2.5" fill="white"/>

        {/* ── Saucer dome arch (top of flying disc) ── */}
        <path d="M22 38 Q50 24 78 38"
          fill="rgba(255,255,255,0.18)" stroke="white" strokeWidth="2"/>

        {/* ── Saucer rim (outer ring) ── */}
        <ellipse cx="50" cy="40" rx="28" ry="8"
          fill="rgba(255,255,255,0.12)" stroke="white" strokeWidth="2"/>

        {/* ── P parking sign (the saucer centre) ── */}
        <circle cx="50" cy="38" r="20" fill="#1e40af"/>
        <circle cx="50" cy="38" r="19" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
        <text
          x="50" y="46"
          textAnchor="middle"
          fontSize="23" fontWeight="900" fill="white"
          fontFamily="-apple-system, 'Helvetica Neue', Arial, sans-serif"
        >P</text>

        {/* ── Lower stem (saucer → base ring) ── */}
        <rect x="47" y="58" width="6" height="32" rx="3" fill="white"/>

        {/* ── Base ring ── */}
        <ellipse cx="50" cy="90" rx="13" ry="4.5"
          fill="rgba(255,255,255,0.3)" stroke="white" strokeWidth="1.5"/>

        {/* ── Tripod left leg ── */}
        <path d="M46 93 Q36 108 20 122"
          stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>

        {/* ── Tripod right leg ── */}
        <path d="M54 93 Q64 108 80 122"
          stroke="white" strokeWidth="4" strokeLinecap="round" fill="none"/>

        {/* ── Left foot brace ── */}
        <line x1="16" y1="122" x2="30" y2="122"
          stroke="white" strokeWidth="3.5" strokeLinecap="round"/>

        {/* ── Right foot brace ── */}
        <line x1="70" y1="122" x2="84" y2="122"
          stroke="white" strokeWidth="3.5" strokeLinecap="round"/>

        {/* ── Ground shadow ── */}
        <ellipse cx="50" cy="130" rx="32" ry="5"
          fill="rgba(255,255,255,0.1)"/>

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
