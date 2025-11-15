import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import '../styles/Auth.css'

interface LoginProps {
  onSwitchToRegister: () => void
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const { login, isLoading } = useAuth()
  const [email, setEmail] = useState('admin@sweets.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      await login(email, password)
    } catch {
      setError('Login failed. Please try again.')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🍬 Sweet Haven</h1>
          <p>Welcome Back!</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <button type="button" className="link-button" onClick={onSwitchToRegister}>Sign up</button></p>
        </div>

        <div className="demo-info">
          <p className="info-title">Demo Credentials:</p>
          <p><strong>Admin:</strong> admin@sweets.com / password123</p>
          <p><strong>User:</strong> user@sweets.com / password123</p>
        </div>
      </div>
    </div>
  )
}
