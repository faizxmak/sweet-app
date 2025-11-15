import { useContext } from 'react'
import { AuthContext, type AuthContextType } from './AuthContextValue'

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext) as AuthContextType | undefined
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
