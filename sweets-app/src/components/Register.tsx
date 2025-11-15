import { useState } from 'react'
import { useAuth } from '../context/useAuth'
import api from '../api'
import '../styles/Auth.css'

interface RegisterProps {
  onSwitchToLogin: () => void
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const { register, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState<'register' | 'verify-admin'>('register')
  const [verifyLoading, setVerifyLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await register(username, email, password)
      setStep('verify-admin')
    } catch {
      setError('Registration failed. Please try again.')
    }
  }

  const handleVerifyAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setVerifyLoading(true)

    try {
      await api.post('/api/auth/verify-admin-code', {
        email,
        adminCode
      })
      
      setAdminCode('')
      alert('Admin status granted! You can now manage the sweet shop.')
      setStep('register')
      setEmail('')
      setUsername('')
      setPassword('')
      setConfirmPassword('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to verify admin code. Please try again.')
      }
    } finally {
      setVerifyLoading(false)
    }
  }

  if (step === 'verify-admin') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>🍬 Admin Verification</h1>
            <p>Check your email for the admin code</p>
          </div>

          <form onSubmit={handleVerifyAdmin} className="auth-form">
            <div className="form-group">
              <label htmlFor="admin-code">Admin Code</label>
              <input
                id="admin-code"
                type="text"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code from email"
                maxLength={6}
                disabled={verifyLoading}
              />
              <small>Check your email for the 6-digit admin verification code</small>
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-button" disabled={verifyLoading}>
              {verifyLoading ? 'Verifying...' : 'Verify Admin Code'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              <button 
                type="button" 
                className="link-button" 
                onClick={() => {
                  setStep('register')
                  setError('')
                  setAdminCode('')
                }}
              >
                Back to Register
              </button>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🍬 Sweet Haven</h1>
          <p>Join Us Today!</p>
        </div>

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              disabled={isLoading}
            />
          </div>

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

          <div className="form-group">
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <button type="button" className="link-button" onClick={onSwitchToLogin}>Sign in</button></p>
        </div>
      </div>
    </div>
  )
}
