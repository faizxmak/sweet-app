import React, { useState, useEffect, type ReactNode } from 'react'
import api from '../api';
import { SweetContext, type Sweet } from './SweetContextValue'

// Mock data for fallback (currently fetched from API)
// const initialSweets: Sweet[] = [...]; // Remove to avoid unused variable

export function SweetProvider({ children }: { children: ReactNode }) {
  const [sweets, setSweets] = useState<Sweet[]>([]);

  // Fetch sweets from backend API
  const fetchSweets = async () => {
    try {
      const res = await api.get('/api/sweets');
      setSweets(res.data);
    } catch (err) {
      console.error('Failed to fetch sweets:', err);
    }
  };

  // Fetch sweets on mount
  useEffect(() => {
    const loadSweets = async () => {
      await fetchSweets();
    };
    loadSweets();
  }, []);

  // Add sweet using backend API (JWT required)
  const addSweet = async (sweet: Omit<Sweet, 'id'>) => {
    try {
      const res = await api.post('/api/sweets', sweet);
      setSweets((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to add sweet:', err);
    }
  };

  // Update sweet using backend API (JWT required)
  const updateSweet = async (id: number, updates: Partial<Sweet>) => {
    try {
      const res = await api.put(`/api/sweets/${id}`, updates);
      setSweets((prev) => prev.map((sweet) => sweet.id === id ? res.data : sweet));
    } catch (err) {
      console.error('Failed to update sweet:', err);
    }
  };

  // Delete sweet using backend API (JWT required)
  const deleteSweet = async (id: number) => {
    try {
      await api.delete(`/api/sweets/${id}`);
      setSweets((prev) => prev.filter((sweet) => sweet.id !== id));
    } catch (err) {
      console.error('Failed to delete sweet:', err);
    }
  };

  const getSweet = (id: number) => sweets.find((sweet) => sweet.id === id);

  // Fetch sweets on mount
  React.useEffect(() => {
    fetchSweets();
  }, []);

  // Only export Axios-based CRUD

  return (
    <SweetContext.Provider value={{ sweets, addSweet, updateSweet, deleteSweet, getSweet }}>
      {children}
    </SweetContext.Provider>
  )
}
