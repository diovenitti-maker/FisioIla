import { useState, useEffect } from 'react'
import Login from './components/Login'
import AdminPanel from './components/AdminPanel'
import PatientView from './components/PatientView'

// ============================================================
// 🔐 PASSWORD ADMIN — Cambia qui la password di Ilaria
// ============================================================
export const ADMIN_PASSWORD = 'Ilaria2026'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('fisio_session')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch (e) { localStorage.removeItem('fisio_session') }
    }
    setLoading(false)
  }, [])

  const login = (userData) => {
    setUser(userData)
    localStorage.setItem('fisio_session', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('fisio_session')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#080814', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#00d4aa', fontSize: '18px' }}>🩺 Caricamento...</div>
      </div>
    )
  }

  if (!user) return <Login onLogin={login} />
  if (user.type === 'admin') return <AdminPanel onLogout={logout} />
  return <PatientView user={user} onLogout={logout} />
}
