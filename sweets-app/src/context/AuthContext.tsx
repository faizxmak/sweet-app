import { useState, useEffect, type ReactNode } from 'react'
import axios from 'axios';
import api from '../api';
import { AuthContext, type User } from './AuthContextValue'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Login using backend API
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // POST to backend login endpoint
      const res = await api.post('/api/auth/login', { email, password });
      const { token, user } = res.data;
      setUser({
        id: user.id,
        username: user.name,
        email: user.email,
        role: user.is_admin ? 'admin' : 'user',
      });
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || 'Login failed');
      } else {
        alert('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  } // API call documented above

  // Register using backend API
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // POST to backend register endpoint
      const res = await api.post('/api/auth/register', { name: username, email, password });
      const user = res.data.user;
      setUser({
        id: user.id,
        username: user.name,
        email: user.email,
        role: user.is_admin ? 'admin' : 'user',
      });
      localStorage.setItem('user', JSON.stringify(user));
      // Note: Token is not provided on registration, user must login after verifying admin code
      alert(res.data.message || 'Registration successful! Check your email.');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error || 'Registration failed');
        throw new Error(err.response?.data?.error || 'Registration failed');
      } else {
        alert('Registration failed');
        throw new Error('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Logout clears user and token
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  // Initialize user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
