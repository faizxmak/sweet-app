import { createContext } from 'react'

export interface Sweet {
  id: number
  name: string
  price: number
  quantity: number
  image: string
  image_url?: string
  description: string
  category: string
}

export interface SweetContextType {
  sweets: Sweet[]
  addSweet: (sweet: Omit<Sweet, 'id'>) => void
  updateSweet: (id: number, sweet: Partial<Sweet>) => void
  deleteSweet: (id: number) => void
  getSweet: (id: number) => Sweet | undefined
}

export const SweetContext = createContext<SweetContextType | undefined>(undefined)
