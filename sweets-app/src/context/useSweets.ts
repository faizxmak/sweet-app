import { useContext } from 'react'
import { SweetContext, type SweetContextType } from './SweetContextValue'

export function useSweets(): SweetContextType {
  const context = useContext(SweetContext) as SweetContextType | undefined
  if (context === undefined) {
    throw new Error('useSweets must be used within a SweetProvider')
  }
  return context
}
