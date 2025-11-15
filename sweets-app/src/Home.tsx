import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'

export default function Home() {
  const { isAuthenticated } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (!isAuthenticated) {
    return showRegister ? (
      <Register onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <Login onSwitchToRegister={() => setShowRegister(true)} />
    )
  }

  return <Dashboard />
}
