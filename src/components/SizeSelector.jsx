export default function SizeSelector({ value, onChange }) {
  const sizes = [
    { label: '58 mm', value: 58 },
    { label: '80 mm', value: 80 },
  ]

  return (
    <div className="size-selector">
      <span className="size-label">
        <svg viewBox="0 96 960 960" fill="currentColor" width="16" height="16">
          <path d="M180 936q-24 0-42-18t-18-42V276q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600V276H180v600Zm60-120h120v-60H300v-60h60v-60h-60v-60h120v-60H240v300Zm210 0h60V516h-60v240Zm150 0h60V636h60v-60h-60v-60h60v-60h-120v300Z"/>
        </svg>
        Tamaño de ticket:
      </span>
      <div className="chip-group">
        {sizes.map((s) => (
          <button
            key={s.value}
            className={`chip ${value === s.value ? 'chip-active' : ''}`}
            onClick={() => onChange(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
