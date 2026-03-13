import { useMemo, useState } from 'react'

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function formatDate(isoString) {
  if (!isoString) return '—'
  const [datePart] = isoString.split('T')
  const [y, m, d] = datePart.split('-')
  return `${d}/${m}/${y}`
}

function formatMoney(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount ?? 0)
}

function SortHeader({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort.key === sortKey
  const isAsc = currentSort.dir === 'asc'

  return (
    <th onClick={() => onSort(sortKey)} className="sortable-header">
      <span>{label}</span>
      <svg
        className={`sort-icon ${isActive ? 'sort-active' : ''}`}
        viewBox="0 96 960 960"
        fill="currentColor"
        width="14"
        height="14"
      >
        {isActive && isAsc
          ? <path d="M440 896V351L231 560l-56-57 305-305 305 305-56 57-209-209v545h-80Z"/>
          : <path d="M480 896 175 591l56-57 209 209V198h80v545l209-209 56 57-305 305Z"/>
        }
      </svg>
    </th>
  )
}

export default function TransactionTable({ data, loading, query, onSelect, selected, showPendingOnly, setShowPendingOnly }) {
  const [sort, setSort] = useState({ key: 'fecha_transaction', dir: 'desc' })
  const [selectedCourse, setSelectedCourse] = useState('')

  const handleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { key, dir: 'asc' }
    )
  }

  // Cursos únicos derivados del data cargado
  const courseOptions = useMemo(() => {
    if (!data) return []
    const seen = new Set()
    return data
      .map((r) => r.cursos?.nombre_curso)
      .filter((c) => c && !seen.has(c) && seen.add(c))
      .sort()
  }, [data])

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()

    return data.filter((row) => {
      // Filtro de Pendientes (si está activo, solo mostrar pendiente > 0)
      if (showPendingOnly && (row.pendiente ?? 0) <= 0) return false

      // Filtro por curso seleccionado
      if (selectedCourse && row.cursos?.nombre_curso !== selectedCourse) return false

      // Filtro por texto
      if (!q) return true
      const alumno = row.alumnos?.nombre_alumno?.toLowerCase() ?? ''
      const curso = row.cursos?.nombre_curso?.toLowerCase() ?? ''
      const ref = row.referencia?.toLowerCase() ?? ''
      const monto = String(row.monto ?? '')
      const datePart = (row.fecha_transaction ?? '').split('T')[0] ?? ''
      const [y, m, d] = datePart.split('-')
      const dateFormatted = `${d}/${m}/${y}`
      const monthName = MONTHS_ES[(parseInt(m, 10) - 1)] ?? ''

      return (
        alumno.includes(q) ||
        curso.includes(q) ||
        ref.includes(q) ||
        monto.includes(q) ||
        dateFormatted.includes(q) ||
        monthName.includes(q) ||
        y?.includes(q)
      )
    })
  }, [data, query, selectedCourse, showPendingOnly])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sort.key]
      let valB = b[sort.key]

      if (sort.key === 'alumno') {
        valA = a.alumnos?.nombre_alumno ?? ''
        valB = b.alumnos?.nombre_alumno ?? ''
      } else if (sort.key === 'curso') {
        valA = a.cursos?.nombre_curso ?? ''
        valB = b.cursos?.nombre_curso ?? ''
      }

      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sort.dir === 'asc' ? -1 : 1
      if (valA > valB) return sort.dir === 'asc' ? 1 : -1
      // Secondary: fecha, Tertiary: id
      const fa = a.fecha_transaction ?? ''
      const fb = b.fecha_transaction ?? ''
      if (fa < fb) return 1
      if (fa > fb) return -1
      return (b.id_transaccion ?? 0) - (a.id_transaccion ?? 0)
    })
  }, [filtered, sort])

  if (loading) {
    return (
      <div className="table-empty">
        <span className="spinner large" />
        <p>Cargando transacciones…</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="table-empty">
        <svg viewBox="0 96 960 960" fill="currentColor" width="48" height="48" opacity="0.3">
          <path d="M796 935 533 672q-30 26-69.959 40.5T378 727q-108.162 0-183.081-75Q120 577 120 471t75-181q75-75 181.5-75t181 75Q632 365 632 471.15 632 513 618 553t-40 69l264 262-46 51ZM377 667q81.25 0 138.125-57.5T572 471q0-81-56.875-138.5T377 275q-82.083 0-139.542 57.5Q180 390 180 471t57.458 138.5Q294.917 667 377 667Z"/>
        </svg>
        <p>Realiza una búsqueda para mostrar transacciones</p>
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="table-empty">
        <svg viewBox="0 96 960 960" fill="currentColor" width="48" height="48" opacity="0.3">
          <path d="M480 616q17 0 28.5-11.5T520 576q0-17-11.5-28.5T480 536q-17 0-28.5 11.5T440 576q0 17 11.5 28.5T480 616Zm-40-160h80V296h-80v160Zm40 480q-83 0-156-31.5T197 823q-54-54-85.5-127T80 540q0-83 31.5-156T197 257q54-54 127-85.5T480 140q83 0 156 31.5T763 257q54 54 85.5 127T880 540q0 83-31.5 156T763 823q-54 54-127 85.5T480 936Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
        </svg>
        <p>Sin resultados para "<strong>{query}</strong>"</p>
      </div>
    )
  }

  return (
    <div className="table-wrapper">
      {/* Filtros de la tabla */}
      <div className="table-filters-row" style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        {/* Chip de Pendientes */}
        <button 
          className={`chip ${showPendingOnly ? 'chip-active' : ''}`}
          onClick={() => setShowPendingOnly(prev => !prev)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <svg viewBox="0 96 960 960" fill="currentColor" width="14" height="14">
            <path d="M440 656h80V416h-80v240Zm40 280q-83 0-156-31.5T197 820q-54-54-85.5-127T80 537q0-83 31.5-156T197 254q54-54 127-85.5T480 137q83 0 156 31.5T763 254q54 54 85.5 127T880 537q0 83-31.5 156T763 820q-54 54-127 85.5T480 936Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
          </svg>
          Pendientes
        </button>

        {/* Filtro de curso */}
        {courseOptions.length > 0 && (
          <div className="course-filter" style={{ margin: 0 }}>
            <svg viewBox="0 96 960 960" fill="currentColor" width="15" height="15">
              <path d="M400 776q-17 0-28.5-11.5T360 736v-240L136 224q-15-20-4.5-42T160 160h640q23 0 33.5 22T829 224L600 496v336q0 14-9 23t-23 9H400Zm80-280 201-280H279l201 280h-1Zm0 0Z"/>
            </svg>
            <select
              className="course-select"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Todos los cursos</option>
              {courseOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {selectedCourse && (
              <button className="filter-clear-btn" onClick={() => setSelectedCourse('')} title="Quitar filtro">
                <svg viewBox="0 96 960 960" fill="currentColor" width="14" height="14">
                  <path d="m256 856-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                </svg>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="table-meta">
        <span>{sorted.length} resultado{sorted.length !== 1 ? 's' : ''}</span>
        {selectedCourse && <span className="filter-tag">· {selectedCourse}</span>}
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <SortHeader label="Transacción" sortKey="id_transaccion" currentSort={sort} onSort={handleSort} />
              <SortHeader label="Alumno" sortKey="alumno" currentSort={sort} onSort={handleSort} />
              <SortHeader label="Curso" sortKey="curso" currentSort={sort} onSort={handleSort} />
              <SortHeader label="Monto" sortKey="monto" currentSort={sort} onSort={handleSort} />
              <SortHeader label="Fecha" sortKey="fecha_transaction" currentSort={sort} onSort={handleSort} />
              <th className="col-metodo">Método</th>
              <th className="col-ref">Referencia</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.id_transaccion}
                className={`data-row ${selected?.id_transaccion === row.id_transaccion ? 'row-selected' : ''}`}
                onClick={() => onSelect(row)}
              >
                <td className="id-cell">
                  MQ-{(row.fecha_transaction ?? '').split('T')[0].split('-')[0]}-{String(row.id_transaccion).padStart(4, '0')}
                </td>
                <td className="name-cell">{row.alumnos?.nombre_alumno ?? '—'}</td>
                <td className="col-curso">{row.cursos?.nombre_curso ?? '—'}</td>
                <td className="money-cell">{formatMoney(row.monto)}</td>
                <td className="date-cell">{formatDate(row.fecha_transaction)}</td>
                <td className="col-metodo">
                  <span className={`method-badge method-${row.metodo_id ? 'transfer' : 'cash'}`}>
                    {row.metodo_transferencia
                      ? row.metodo_transferencia.banco
                      : 'Efectivo'}
                  </span>
                </td>
                <td className="ref-cell col-ref">{row.referencia ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
