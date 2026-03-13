import { useState } from 'react'
import { supabase } from '../lib/supabase'

const DOMAINS = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com']

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message === 'Invalid login credentials' 
        ? 'Credenciales inválidas. Revisa tu correo y contraseña.' 
        : authError.message
      )
      setLoading(false)
    }
  }

  const updateSuggestions = (val) => {
    if (val.includes('@')) {
      const parts = val.split('@')
      const local = parts[0]
      const domainPart = parts[1]

      if (local && local.length > 0) {
        if (domainPart !== undefined) {
          const filtered = DOMAINS.filter(d => d.startsWith(domainPart))
          setSuggestions(filtered.length > 0 ? filtered : [])
        } else {
          setSuggestions(DOMAINS)
        }
      } else {
        setSuggestions([])
      }
    } else {
      setSuggestions([])
    }
  }

  const handleEmailChange = (e) => {
    const val = e.target.value
    
    // Bloquear el @ si no hay nada escrito antes
    if (val.startsWith('@')) return

    setEmail(val)
    updateSuggestions(val)
    setActiveIndex(-1)
  }

  const handleEmailFocus = () => {
    updateSuggestions(email)
  }

  const handleEmailBlur = () => {
    // Pequeño delay para permitir que el click en la sugerencia se procese
    setTimeout(() => {
      setSuggestions([])
      setActiveIndex(-1)
    }, 200)
  }

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0) {
        e.preventDefault()
        selectSuggestion(suggestions[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setSuggestions([])
      setActiveIndex(-1)
    }
  }

  const selectSuggestion = (domain) => {
    const [local] = email.split('@')
    setEmail(`${local}@${domain}`)
    setSuggestions([])
    setActiveIndex(-1)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg viewBox="0 96 960 960" fill="currentColor" width="40" height="40">
              <path d="M480 976q-83 0-156-31.5T197 859q-54-54-85.5-127T80 576q0-83 31.5-156T197 293q54-54 127-85.5T480 176q83 0 156 31.5T763 293q54 54 85.5 127T880 576q0 83-31.5 156T763 859q-54 54-127 85.5T480 976Zm0-400Zm0 320q134 0 227-93t93-227q0-104-54-188t-146-126q-11-5-21-3.5t-17 10.5l-192 192q-7 7-7 17t7 17l64 64q7 7 17 7t17-7l47-47 114 114q10 10 10.5 24t-10.5 24l-32 32q-10 10-24 10.5T490 895l-74-74q-7-7-17-7t-17 7l-32 32q-10 10-10.5 24t10.5 24l43 43q11 11 11 26t-11 26l-32 32q-10 10-24 10.5T324 956l-35-35q-8-8-8-19.5t8-19.5l40-40q5-5 5-11.5t-5-11.5l-40-40q-5-5-11.5-5t-11.5 5l-40 40q-8 8-19.5 8t-19.5-8l-43-43q11-134 104.5-227.5T480 336q134 0 227 93t93 227q0 134-93 227t-227 93Z"/>
            </svg>
          </div>
          <h1>Bienvenido</h1>
          <p>Fenix Retail — Tickets</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label>Correo electrónico</label>
            <div className="email-input-wrapper">
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={handleEmailChange}
                onKeyDown={handleKeyDown}
                onFocus={handleEmailFocus}
                onBlur={handleEmailBlur}
                required
              />
              {suggestions.length > 0 && (
                <ul className="email-suggestions">
                  {suggestions.map((d, index) => (
                    <li 
                      key={d} 
                      onClick={() => selectSuggestion(d)} 
                      className={`suggestion-item ${index === activeIndex ? 'active' : ''}`}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <span className="suggestion-at">@</span>{d}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="login-footer">
          <p>MQerK Academy &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  )
}
