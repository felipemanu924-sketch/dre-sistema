'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import {
  collection, doc, setDoc, updateDoc, deleteDoc,
  onSnapshot, writeBatch,
} from 'firebase/firestore'
import { db, COL } from '@/lib/firebase'
import { DataStore, Lancamento, Categoria, CentroCusto, ContaBancaria, User, FormaPagamento } from '@/types'
import { generateId } from '@/lib/utils'
import {
  INITIAL_CATEGORIAS, INITIAL_CENTROS_CUSTO, INITIAL_CONTAS_BANCARIAS,
  INITIAL_FORMAS_PAGAMENTO, INITIAL_COMPANY, INITIAL_USERS,
} from '@/lib/mockData'

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

const EMPTY_STORE: DataStore = {
  users: [],
  company: INITIAL_COMPANY,
  lancamentos: [],
  categorias: [],
  centrosCusto: [],
  contasBancarias: [],
  formasPagamento: [],
  initialized: false,
}

const DataContext = createContext<DataContextType | null>(null)

async function seedAll() {
  const batch = writeBatch(db)
  INITIAL_CATEGORIAS.forEach(c => batch.set(doc(db, COL.categorias, c.id), c))
  INITIAL_CENTROS_CUSTO.forEach(c => batch.set(doc(db, COL.centrosCusto, c.id), c))
  INITIAL_CONTAS_BANCARIAS.forEach(c => batch.set(doc(db, COL.contasBancarias, c.id), c))
  INITIAL_FORMAS_PAGAMENTO.forEach(f => batch.set(doc(db, COL.formasPagamento, f.id), f))
  batch.set(doc(db, COL.company, INITIAL_COMPANY.id), INITIAL_COMPANY)
  INITIAL_USERS.forEach(u => batch.set(doc(db, COL.users, u.id), u))
  await batch.commit()
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<DataStore>(EMPTY_STORE)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let seeded = false
    const loadedCols = new Set<string>()
    const TOTAL_COLS = 6

    const markLoaded = (col: string) => {
      loadedCols.add(col)
      if (loadedCols.size >= TOTAL_COLS && mounted) setIsLoading(false)
    }

    const unsubs: (() => void)[] = []

    unsubs.push(onSnapshot(collection(db, COL.lancamentos), snap => {
      if (!mounted) return
      setStore(prev => ({ ...prev, lancamentos: snap.docs.map(d => d.data() as Lancamento) }))
      markLoaded(COL.lancamentos)
    }))

    unsubs.push(onSnapshot(collection(db, COL.categorias), async snap => {
      if (!mounted) return
      if (snap.empty && !seeded) {
        seeded = true
        await seedAll()
        return
      }
      const categorias = snap.docs.map(d => d.data() as Categoria).sort((a, b) => a.ordem - b.ordem)
      setStore(prev => ({ ...prev, categorias }))
      markLoaded(COL.categorias)
    }))

    unsubs.push(onSnapshot(collection(db, COL.centrosCusto), snap => {
      if (!mounted) return
      setStore(prev => ({ ...prev, centrosCusto: snap.docs.map(d => d.data() as CentroCusto) }))
      markLoaded(COL.centrosCusto)
    }))

    unsubs.push(onSnapshot(collection(db, COL.contasBancarias), snap => {
      if (!mounted) return
      setStore(prev => ({ ...prev, contasBancarias: snap.docs.map(d => d.data() as ContaBancaria) }))
      markLoaded(COL.contasBancarias)
    }))

    unsubs.push(onSnapshot(collection(db, COL.formasPagamento), snap => {
      if (!mounted) return
      setStore(prev => ({ ...prev, formasPagamento: snap.docs.map(d => d.data() as FormaPagamento) }))
      markLoaded(COL.formasPagamento)
    }))

    unsubs.push(onSnapshot(collection(db, COL.company), snap => {
      if (!mounted) return
      const company = snap.docs[0]?.data() as DataStore['company'] ?? INITIAL_COMPANY
      setStore(prev => ({ ...prev, company, initialized: true }))
      markLoaded(COL.company)
    }))

    unsubs.push(onSnapshot(collection(db, COL.users), snap => {
      if (!mounted) return
      setStore(prev => ({ ...prev, users: snap.docs.map(d => d.data() as User) }))
    }))

    return () => {
      mounted = false
      unsubs.forEach(fn => fn())
    }
  }, [])

  const addLancamento = useCallback((l: Omit<Lancamento, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString()
    const id = generateId()
    setDoc(doc(db, COL.lancamentos, id), { ...l, id, createdAt: now, updatedAt: now }).catch(console.error)
  }, [])

  const updateLancamento = useCallback((id: string, updates: Partial<Lancamento>) => {
    updateDoc(doc(db, COL.lancamentos, id), { ...updates, updatedAt: new Date().toISOString() }).catch(console.error)
  }, [])

  const deleteLancamento = useCallback((id: string) => {
    deleteDoc(doc(db, COL.lancamentos, id)).catch(console.error)
  }, [])

  const addCategoria = useCallback((c: Omit<Categoria, 'id'>) => {
    const id = generateId()
    setDoc(doc(db, COL.categorias, id), { ...c, id }).catch(console.error)
  }, [])

  const updateCategoria = useCallback((id: string, updates: Partial<Categoria>) => {
    updateDoc(doc(db, COL.categorias, id), updates as Record<string, unknown>).catch(console.error)
  }, [])

  const deleteCategoria = useCallback((id: string) => {
    deleteDoc(doc(db, COL.categorias, id)).catch(console.error)
  }, [])

  const addCentroCusto = useCallback((c: Omit<CentroCusto, 'id'>) => {
    const id = generateId()
    setDoc(doc(db, COL.centrosCusto, id), { ...c, id }).catch(console.error)
  }, [])

  const updateCentroCusto = useCallback((id: string, updates: Partial<CentroCusto>) => {
    updateDoc(doc(db, COL.centrosCusto, id), updates as Record<string, unknown>).catch(console.error)
  }, [])

  const deleteCentroCusto = useCallback((id: string) => {
    deleteDoc(doc(db, COL.centrosCusto, id)).catch(console.error)
  }, [])

  const addContaBancaria = useCallback((c: Omit<ContaBancaria, 'id'>) => {
    const id = generateId()
    setDoc(doc(db, COL.contasBancarias, id), { ...c, id }).catch(console.error)
  }, [])

  const updateContaBancaria = useCallback((id: string, updates: Partial<ContaBancaria>) => {
    updateDoc(doc(db, COL.contasBancarias, id), updates as Record<string, unknown>).catch(console.error)
  }, [])

  const deleteContaBancaria = useCallback((id: string) => {
    deleteDoc(doc(db, COL.contasBancarias, id)).catch(console.error)
  }, [])

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
    const id = store.company?.id || INITIAL_COMPANY.id
    updateDoc(doc(db, COL.company, id), updates as Record<string, unknown>).catch(console.error)
  }, [store.company])

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
