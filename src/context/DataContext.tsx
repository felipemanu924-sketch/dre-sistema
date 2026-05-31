'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { DataStore, Lancamento, Categoria, CentroCusto, ContaBancaria } from '@/types'
import { loadDataStore, saveDataStore } from '@/lib/storage'
import { generateId } from '@/lib/utils'

interface DataContextType {
  store: DataStore
  addLancamento: (l: Omit<Lancamento, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateLancamento: (id: string, l: Partial<Lancamento>) => void
  deleteLancamento: (id: string) => void
  addCategoria: (c: Omit<Categoria, 'id'>) => void
  updateCategoria: (id: string, c: Partial<Categoria>) => void
  deleteCategoria: (id: string) => void
  addCentroCusto: (c: Omit<CentroCusto, 'id'>) => void
  updateCentroCusto: (id: string, c: Partial<CentroCusto>) => void
  deleteCentroCusto: (id: string) => void
  addContaBancaria: (c: Omit<ContaBancaria, 'id'>) => void
  updateContaBancaria: (id: string, c: Partial<ContaBancaria>) => void
  deleteContaBancaria: (id: string) => void
  getLancamentosByPeriod: (year: number, month: number) => Lancamento[]
  getLancamentosByYear: (year: number) => Lancamento[]
  getCategoria: (id: string) => Categoria | undefined
  getCentroCusto: (id: string) => CentroCusto | undefined
  getContaBancaria: (id: string) => ContaBancaria | undefined
  updateCompany: (c: Partial<DataStore['company']>) => void
  isLoading: boolean
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<DataStore>({} as DataStore)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const data = loadDataStore()
    setStore(data)
    setIsLoading(false)
  }, [])

  const persist = useCallback((updater: (s: DataStore) => DataStore) => {
    setStore(prev => {
      const next = updater(prev)
      saveDataStore(next)
      return next
    })
  }, [])

  const addLancamento = useCallback((l: Omit<Lancamento, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    persist(s => ({ ...s, lancamentos: [...s.lancamentos, { ...l, id: generateId(), createdAt: now, updatedAt: now }] }))
  }, [persist])

  const updateLancamento = useCallback((id: string, updates: Partial<Lancamento>) => {
    persist(s => ({ ...s, lancamentos: s.lancamentos.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l) }))
  }, [persist])

  const deleteLancamento = useCallback((id: string) => {
    persist(s => ({ ...s, lancamentos: s.lancamentos.filter(l => l.id !== id) }))
  }, [persist])

  const addCategoria = useCallback((c: Omit<Categoria, 'id'>) => {
    persist(s => ({ ...s, categorias: [...s.categorias, { ...c, id: generateId() }] }))
  }, [persist])

  const updateCategoria = useCallback((id: string, updates: Partial<Categoria>) => {
    persist(s => ({ ...s, categorias: s.categorias.map(c => c.id === id ? { ...c, ...updates } : c) }))
  }, [persist])

  const deleteCategoria = useCallback((id: string) => {
    persist(s => ({ ...s, categorias: s.categorias.filter(c => c.id !== id) }))
  }, [persist])

  const addCentroCusto = useCallback((c: Omit<CentroCusto, 'id'>) => {
    persist(s => ({ ...s, centrosCusto: [...s.centrosCusto, { ...c, id: generateId() }] }))
  }, [persist])

  const updateCentroCusto = useCallback((id: string, updates: Partial<CentroCusto>) => {
    persist(s => ({ ...s, centrosCusto: s.centrosCusto.map(c => c.id === id ? { ...c, ...updates } : c) }))
  }, [persist])

  const deleteCentroCusto = useCallback((id: string) => {
    persist(s => ({ ...s, centrosCusto: s.centrosCusto.filter(c => c.id !== id) }))
  }, [persist])

  const addContaBancaria = useCallback((c: Omit<ContaBancaria, 'id'>) => {
    persist(s => ({ ...s, contasBancarias: [...s.contasBancarias, { ...c, id: generateId() }] }))
  }, [persist])

  const updateContaBancaria = useCallback((id: string, updates: Partial<ContaBancaria>) => {
    persist(s => ({ ...s, contasBancarias: s.contasBancarias.map(c => c.id === id ? { ...c, ...updates } : c) }))
  }, [persist])

  const deleteContaBancaria = useCallback((id: string) => {
    persist(s => ({ ...s, contasBancarias: s.contasBancarias.filter(c => c.id !== id) }))
  }, [persist])

  const getLancamentosByPeriod = useCallback((year: number, month: number) => {
    const comp = `${year}-${String(month).padStart(2, '0')}`
    return (store.lancamentos || []).filter(l => l.competencia === comp && l.status !== 'cancelado')
  }, [store.lancamentos])

  const getLancamentosByYear = useCallback((year: number) => {
    return (store.lancamentos || []).filter(l => l.competencia.startsWith(String(year)) && l.status !== 'cancelado')
  }, [store.lancamentos])

  const getCategoria = useCallback((id: string) => store.categorias?.find(c => c.id === id), [store.categorias])
  const getCentroCusto = useCallback((id: string) => store.centrosCusto?.find(c => c.id === id), [store.centrosCusto])
  const getContaBancaria = useCallback((id: string) => store.contasBancarias?.find(c => c.id === id), [store.contasBancarias])

  const updateCompany = useCallback((updates: Partial<DataStore['company']>) => {
    persist(s => ({ ...s, company: { ...s.company, ...updates } }))
  }, [persist])

  return (
    <DataContext.Provider value={{
      store, addLancamento, updateLancamento, deleteLancamento,
      addCategoria, updateCategoria, deleteCategoria,
      addCentroCusto, updateCentroCusto, deleteCentroCusto,
      addContaBancaria, updateContaBancaria, deleteContaBancaria,
      getLancamentosByPeriod, getLancamentosByYear,
      getCategoria, getCentroCusto, getContaBancaria,
      updateCompany, isLoading,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
