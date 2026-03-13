import { useState, useCallback, useEffect } from 'react'
import { supabase } from './lib/supabase'
import SearchBar from './components/SearchBar'
import TransactionTable from './components/TransactionTable'
import TicketPreview from './components/TicketPreview'
import SizeSelector from './components/SizeSelector'
import Login from './components/Login'
import './App.css'

export default function App() {
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [ticketSize, setTicketSize] = useState(80)
  const [session, setSession] = useState(null)
  const [showPendingOnly, setShowPendingOnly] = useState(true)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const handleSearch = useCallback(async () => {
    setLoading(true)
    setError(null)
    setSelected(null)

    let queryBuilder = supabase
      .from('transacciones')
      .select(`
        id_transaccion,
        monto,
        fecha_transaction,
        referencia,
        alumno_id,
        curso_id,
        metodo_id,
        incentivo_premium,
        pendiente,
        total,
        alumnos!fk_transacciones_alumno ( id_alumno, nombre_alumno, grupo ),
        cursos!fk_transacciones_curso ( id_curso, nombre_curso ),
        metodo_transferencia!fk_transacciones_metodo ( id_metodo, titular, banco, numero_tarjetaclabe )
      `)

    if (showPendingOnly) {
      queryBuilder = queryBuilder.gt('pendiente', 0)
    }

    const { data: rows, error: err } = await queryBuilder
      .order('fecha_transaction', { ascending: false })
      .limit(200)

    if (err) {
      setError(`Error al obtener datos: ${err.message}`)
      setData(null)
    } else {
      setData(rows)
      if (rows && rows.length > 0) {
        setSelected(rows[0])
      }
    }

    setLoading(false)
  }, [showPendingOnly])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => { 
    if (session) {
      handleSearch() 
    }
  }, [session, showPendingOnly, handleSearch])

  const handleSizeChange = (size) => {
    setTicketSize(size)
    // Keep selected, just re-render preview
  }

  return (
    <div className="app-layout">
      {/* ── Header ──────────────────────────────── */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon">
            <svg viewBox="0 96 960 960" fill="currentColor" width="22" height="22">
              <path d="M168 936q-29.7 0-50.85-21.15Q96 893.7 96 864V693q0-12.75 8.675-21.375Q113.35 663 126.1 663q20.9 0 35.4-14.625Q176 633.75 176 613q0-20.75-14.5-35.375T126.1 563q-12.75 0-21.425-8.625Q96 545.75 96 533V360q0-29 21-50.5T168 288h625q29.7 0 50.85 21.5Q865 331 865 360v173q0 12.75-8.675 21.375Q847.65 563 834.9 563q-20.9 0-35.4 14.625Q785 592.25 785 613q0 20.75 14.5 35.375T834.9 663q12.75 0 21.425 8.625Q865 680.25 865 693v171q0 29.7-21.15 50.85Q822.7 936 793 936H168Z"/>
            </svg>
          </div>
          <div>
            <h1 className="brand-name">FR Tickets</h1>
            <p className="brand-sub">Fenix Retail — Generador de Comprobantes</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn-theme" 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
          {session && (
            <div className="header-actions-auth">
              <div className="header-badge">
                <span className="dot-live" />
                Conectado
              </div>
              <button className="btn-logout" onClick={() => supabase.auth.signOut()}>
                <svg viewBox="0 96 960 960" fill="currentColor" width="16" height="16">
                  <path d="M200 956q-33 0-56.5-23.5T120 876V276q0-33 23.5-56.5T200 196h280v80H200v600h280v80H200Zm440-160-55-58 102-102H360v-80h327L585 354l55-58 200 200-200 200Z"/>
                </svg>
                Salir
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Main ────────────────────────────────── */}
      {!session ? (
        <Login />
      ) : (
        <main className="app-main">
          {/* Left panel: search + table */}
          <section className="panel panel-left">
            <div className="panel-title">
              <svg viewBox="0 96 960 960" fill="currentColor" width="18" height="18">
                <path d="M200 856v-556h-64v-80h624v80h-64v556H200Zm80-80h400V300H280v476Zm120-180h160v-76h-160v76Zm0-156h160v-80h-160v80ZM280 776V300v476Z"/>
              </svg>
              Transacciones
            </div>
            <SearchBar
              value={query}
              onChange={setQuery}
              onSearch={handleSearch}
              loading={loading}
            />
            {error && (
              <div className="error-banner">
                <svg viewBox="0 96 960 960" fill="currentColor" width="18" height="18">
                  <path d="M480 936q-83 0-156-31.5T197 823q-54-54-85.5-127T80 540q0-83 31.5-156T197 257q54-54 127-85.5T480 140q83 0 156 31.5T763 257q54 54 85.5 127T880 540q0 83-31.5 156T763 823q-54 54-127 85.5T480 936Zm-40-360h80V416h-80v160Zm40 180q17 0 28.5-11.5T520 716q0-17-11.5-28.5T480 676q-17 0-28.5 11.5T440 716q0 17 11.5 28.5T480 756Z"/>
                </svg>
                {error}
              </div>
            )}
            <TransactionTable
              data={data}
              loading={loading}
              query={query}
              onSelect={setSelected}
              selected={selected}
              showPendingOnly={showPendingOnly}
              setShowPendingOnly={setShowPendingOnly}
            />
          </section>

          {/* Right panel: ticket */}
          <section className="panel panel-right">
            <div className="panel-title">
              <svg viewBox="0 96 960 960" fill="currentColor" width="18" height="18">
                <path d="M168 936q-29.7 0-50.85-21.15Q96 893.7 96 864V693q0-12.75 8.675-21.375Q113.35 663 126.1 663q20.9 0 35.4-14.625Q176 633.75 176 613q0-20.75-14.5-35.375T126.1 563q-12.75 0-21.425-8.625Q96 545.75 96 533V360q0-29 21-50.5T168 288h625q29.7 0 50.85 21.5Q865 331 865 360v173q0 12.75-8.675 21.375Q847.65 563 834.9 563q-20.9 0-35.4 14.625Q785 592.25 785 613q0 20.75 14.5 35.375T834.9 663q12.75 0 21.425 8.625Q865 680.25 865 693v171q0 29.7-21.15 50.85Q822.7 936 793 936H168Z"/>
              </svg>
              Vista Previa del Ticket
            </div>
            <SizeSelector value={ticketSize} onChange={handleSizeChange} />
            <TicketPreview transaction={selected} size={ticketSize} />
          </section>
        </main>
      )}
    </div>
  )
}
