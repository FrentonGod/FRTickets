import { useState } from 'react'

export default function SearchBar({ value, onChange, onSearch, loading }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch()
  }

  return (
    <div className="search-bar">
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 96 960 960" fill="currentColor">
          <path d="M796 935 533 672q-30 26-69.959 40.5T378 727q-108.162 0-183.081-75Q120 577 120 471t75-181q75-75 181.5-75t181 75Q632 365 632 471.15 632 513 618 553t-40 69l264 262-46 51ZM377 667q81.25 0 138.125-57.5T572 471q0-81-56.875-138.5T377 275q-82.083 0-139.542 57.5Q180 390 180 471t57.458 138.5Q294.917 667 377 667Z"/>
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Buscar por nombre de alumno, curso o fecha (DD/MM/AAAA)…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {value && (
          <button className="clear-btn" onClick={() => onChange('')} title="Limpiar">
            <svg viewBox="0 96 960 960" fill="currentColor">
              <path d="m256 856-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
            </svg>
          </button>
        )}
      </div>
      <button className="btn-primary search-btn" onClick={onSearch} disabled={loading}>
        {loading ? (
          <span className="spinner" />
        ) : (
          <>
            <svg viewBox="0 96 960 960" fill="currentColor" width="18" height="18">
              <path d="M796 935 533 672q-30 26-69.959 40.5T378 727q-108.162 0-183.081-75Q120 577 120 471t75-181q75-75 181.5-75t181 75Q632 365 632 471.15 632 513 618 553t-40 69l264 262-46 51ZM377 667q81.25 0 138.125-57.5T572 471q0-81-56.875-138.5T377 275q-82.083 0-139.542 57.5Q180 390 180 471t57.458 138.5Q294.917 667 377 667Z"/>
            </svg>
            Buscar
          </>
        )}
      </button>
    </div>
  )
}
