import logoUrl from '../assets/logo.png'
import { useState } from 'react'
import { ADMIN_PASSWORD } from '../App'
import { db } from '../firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

const C = {
  bg: '#080814', s1: '#10101f', s2: '#181830', s3: '#202040',
  accent: '#00d4aa', accent2: '#a855f7', text: '#e2e8f0',
  muted: '#7a8a9a', border: '#252550', err: '#ef4444',
}

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('patient')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loginAsPatient = async () => {
    if (!code.trim()) { setError('Inserisci il codice accesso'); return }
    setLoading(true); setError('')
    try {
      const q = query(collection(db, 'patients'), where('code', '==', code.trim().toUpperCase()))
      const snap = await getDocs(q)
      if (snap.empty) {
        setError('Codice non trovato. Contatta Ilaria per il tuo codice.')
      } else {
        const d = snap.docs[0].data()
        onLogin({ type: 'patient', code: d.code, name: d.name, surname: d.surname, id: snap.docs[0].id })
      }
    } catch (e) {
      setError('Errore di connessione. Verifica la connessione e riprova.')
    }
    setLoading(false)
  }

  const loginAsAdmin = () => {
    if (password === ADMIN_PASSWORD) {
      onLogin({ type: 'admin' })
    } else {
      setError('Password non corretta')
    }
  }

  const inp = {
    width: '100%', padding: '13px 16px', background: C.s2, border: `1px solid ${C.border}`,
    borderRadius: '10px', color: C.text, fontSize: '16px', outline: 'none',
    boxSizing: 'border-box', marginBottom: '14px', letterSpacing: '3px',
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src={logoUrl} alt="Ilaria Melaranci Fisioterapia"
            style={{ width: '200px', marginBottom: '4px', filter: 'brightness(0) invert(1) opacity(0.85)' }} />
        </div>

        {/* Card */}
        <div style={{ background: C.s1, borderRadius: '18px', overflow: 'hidden', border: `1px solid ${C.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
            {[['patient','👤 Paziente'],['admin','🔐 Ilaria']].map(([t, label]) => (
              <button key={t} onClick={() => { setTab(t); setError(''); setCode(''); setPassword('') }}
                style={{ flex: 1, padding: '15px 8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: tab === t ? '600' : '400',
                  background: tab === t ? C.s2 : 'transparent', color: tab === t ? C.accent : C.muted, transition: 'all 0.2s',
                  borderBottom: tab === t ? `2px solid ${C.accent}` : '2px solid transparent' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div style={{ padding: '28px' }}>
            {tab === 'patient' ? (
              <>
                <p style={{ color: C.muted, fontSize: '14px', marginBottom: '18px', lineHeight: '1.5' }}>
                  Inserisci il codice personale che ti ha fornito Ilaria per accedere al tuo percorso riabilitativo.
                </p>
                <input
                  value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && loginAsPatient()}
                  placeholder="ES: ABC123" style={inp} maxLength={10}
                  autoComplete="off" autoCapitalize="characters"
                />
                <button onClick={loginAsPatient} disabled={loading}
                  style={{ width: '100%', padding: '14px', background: loading ? '#333' : C.accent,
                    border: 'none', borderRadius: '10px', color: '#000', fontWeight: '700',
                    fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s' }}>
                  {loading ? '⏳ Verifica codice...' : 'Accedi al mio percorso →'}
                </button>
              </>
            ) : (
              <>
                <p style={{ color: C.muted, fontSize: '14px', marginBottom: '18px' }}>
                  Accesso riservato ad Ilaria per gestire pazienti, esercizi e contenuti.
                </p>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loginAsAdmin()}
                  placeholder="Password admin" style={{ ...inp, letterSpacing: '5px' }}
                />
                <button onClick={loginAsAdmin}
                  style={{ width: '100%', padding: '14px', background: C.accent2,
                    border: 'none', borderRadius: '10px', color: 'white', fontWeight: '700',
                    fontSize: '15px', cursor: 'pointer' }}>
                  Accedi come Admin →
                </button>
              </>
            )}

            {error && (
              <div style={{ marginTop: '14px', padding: '12px', background: 'rgba(239,68,68,0.1)',
                borderRadius: '8px', border: `1px solid ${C.err}`, color: C.err, fontSize: '14px', textAlign: 'center' }}>
                ⚠️ {error}
              </div>
            )}
          </div>
        </div>

        <p style={{ color: C.muted, textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
          Non hai il codice? Contatta il tuo fisioterapista
        </p>
      </div>
    </div>
  )
}
