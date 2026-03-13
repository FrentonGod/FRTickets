import { useRef, useState } from 'react'
import html2pdf from 'html2pdf.js'

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

function formatDateExtended(isoString) {
  if (!isoString) return { date: '—', time: '—' }
  const dateObj = new Date(isoString)
  if (isNaN(dateObj.getTime())) return { date: '—', time: '—' }
  
  const d = dateObj.getDate().toString().padStart(2, '0')
  const m = (dateObj.getMonth() + 1).toString().padStart(2, '0')
  const y = dateObj.getFullYear()
  
  // Usar la hora y minutos actuales
  const now = new Date()
  let hours = now.getHours()
  const minutes = now.getMinutes().toString().padStart(2, '0')
  const seconds = now.getSeconds().toString().padStart(2, '0')
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.'
  hours = hours % 12
  hours = hours ? hours : 12 
  
  return {
    date: `${d}/${m}/${y}`,
    time: `${hours}:${minutes}:${seconds} ${ampm}`
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount ?? 0)
}

export default function TicketPreview({ transaction, size }) {
  const printRef = useRef(null)
  const selectorRef = useRef(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [showPaymentError, setShowPaymentError] = useState(false)

  // Desactivar error si elige un método
  const selectMethodWithFeedback = (m) => {
    setSelectedMethod(m)
    setShowPaymentError(false)
  }

  const triggerValidation = () => {
    // Resetear el estado de error para forzar el reinicio de la animación CSS
    setShowPaymentError(false)
    setTimeout(() => {
      setShowPaymentError(true)
      selectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 10)
  }

  if (!transaction) {
    return (
      <div className="ticket-empty">
        <svg viewBox="0 96 960 960" fill="currentColor" width="52" height="52" opacity="0.25">
          <path d="M168 936q-29.7 0-50.85-21.15Q96 893.7 96 864V693q0-12.75 8.675-21.375Q113.35 663 126.1 663q20.9 0 35.4-14.625Q176 633.75 176 613q0-20.75-14.5-35.375T126.1 563q-12.75 0-21.425-8.625Q96 545.75 96 533V360q0-29 21-50.5T168 288h625q29.7 0 50.85 21.5Q865 331 865 360v173q0 12.75-8.675 21.375Q847.65 563 834.9 563q-20.9 0-35.4 14.625Q785 592.25 785 613q0 20.75 14.5 35.375T834.9 663q12.75 0 21.425 8.625Q865 680.25 865 693v171q0 29.7-21.15 50.85Q822.7 936 793 936H168Zm0-72h625V754.35q-29.55-16.1-47.275-43.725Q728 682.5 728 650.5q0-32-17.725-59.625T663 547V432H168v115q29.55 16.1 47.275 43.725Q233 618.35 233 650.5q0 32-17.725 59.125T168 753.65V864Zm298.5-120q20.5 0 34.5-14t14-34.5q0-20.5-14-34.5t-34.5-14q-20.5 0-34.5 14t-14 34.5q0 20.5 14 34.5t34.5 14Zm0-160q20.5 0 34.5-14t14-34.5q0-20.5-14-34.5t-34.5-14q-20.5 0-34.5 14t-14 34.5q0 20.5 14 34.5t34.5 14Zm0-160q20.5 0 34.5-14t14-34.5q0-20.5-14-34.5t-34.5-14q-20.5 0-34.5 14t-14 34.5q0 20.5 14 34.5t34.5 14ZM168 864V432v432Z"/>
        </svg>
        <p>Selecciona una transacción<br/>para previsualizar el ticket</p>
      </div>
    )
  }

  const ticketWidth = size === 58 ? '219px' : '302px'
  const { date, time } = formatDateExtended(transaction.fecha_transaction)
  const idTx = transaction.id_transaccion
  const year = (transaction.fecha_transaction ?? '').split('T')[0].split('-')[0] ?? new Date().getFullYear()
  const ticketCode = `MQ-${year}-${String(idTx).padStart(4, '0')}`

  const alumno = transaction.alumnos?.nombre_alumno ?? '—'
  const grupo = transaction.alumnos?.grupo ?? 'Sin asignar'
  const curso = transaction.cursos?.nombre_curso ?? '—'
  const referencia = transaction.referencia ?? 'Pago de colegiatura correspondiente'
  const metodo = transaction.metodo_transferencia
  const monto = transaction.monto
  const incentivo = transaction.incentivo_premium ?? 0
  const pendiente = transaction.pendiente ?? 0
  const total = transaction.total ?? 0
  
  const handlePrint = (e) => {
    e?.preventDefault()
    if (!selectedMethod) {
      triggerValidation()
      return
    }
    const printContents = printRef.current.innerHTML
    
    // Si estamos en un móvil, usamos directamente el iframe oculto o la ventana actual para forzar la vista de impresión nativa (que incluye guardar/compartir PDF)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    
    if (isMobile) {
      // En mobile es mejor no abrir popups no solicitados, usamos la misma ventana
      const originalBody = document.body.innerHTML
      const originalTitle = document.title
      
      document.title = ticketCode
      document.body.innerHTML = `
        <div style="font-family: 'Inter', sans-serif; display: flex; justify-content: flex-start; background: white; padding: 4px;">
          <div style="width: ${ticketWidth}; font-size: 10px; line-height: 1.3; color: #000;">
            ${printContents.replace(/padding-[^;]+;/g, '')} 
          </div>
        </div>
      `
      
      window.print()
      
      // Restauramos
      document.body.innerHTML = originalBody
      document.title = originalTitle
      window.location.reload() // Necesario para react-dom
      return
    }

    // Modal para Desktop
    const win = window.open('', '_blank', 'width=450,height=700')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <title>${ticketCode}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: 'Inter', sans-serif; display: flex; justify-content: center; background: white; padding: 4px; }
            .ticket-paper { width: ${ticketWidth}; background: #fff; color: #000; padding: 4px; font-size: 10px; line-height: 1.3; }
            .ticket-header-content { text-align: center; margin-bottom: 8px; }
            .ticket-academy-name { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
            .ticket-academy-desc { font-size: 10px; color: #333; margin-bottom: 8px; }
            .ticket-info-block { font-size: 9px; line-height: 1.4; margin-bottom: 10px; }
            .ticket-info-row { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 2px; }
            .ticket-bold { font-weight: 700; }
            .ticket-dashed-line { border-top: 1px dashed #000; margin: 6px 0; width: 100%; }
            .ticket-main-title { font-size: 16px; font-weight: 700; text-align: center; margin: 4px 0; letter-spacing: 1px; }
            .ticket-section-header { font-size: 11px; font-weight: 700; margin-bottom: 2px; }
            .ticket-client-info { font-size: 10px; padding: 4px 0; }
            .ticket-col-label { width: 70px; display: inline-block; }
            .ticket-method-center { text-align: center; margin: 8px 0; font-size: 10px; }
            .ticket-concept-table { width: 100%; border-collapse: collapse; margin-top: 4px; }
            .ticket-concept-table th { border-bottom: 1px dashed #000; text-align: left; padding-bottom: 4px; font-size: 10px; font-weight: 700; }
            .ticket-concept-table td { padding: 5px 0; vertical-align: top; font-size: 10px; }
            .ticket-importe-cell { text-align: right; }
            .ticket-footer-legal { text-align: center; margin-top: 12px; font-size: 8px; line-height: 1.4; }
            .ticket-thanks { font-weight: 700; margin-top: 8px; }
            .ticket-director { margin-top: 8px; font-size: 8px; text-transform: uppercase; color: #444; text-align: center; }
            .ticket-logo-svg { margin: 0 auto 8px; display: block; }
          </style>
        </head>
        <body>
          <div class="ticket-paper">${printContents}</div>
        </body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  const handleSharePDF = async (e) => {
    e?.preventDefault()
    if (isGenerating) return
    if (!selectedMethod) {
      triggerValidation()
      return
    }
    setIsGenerating(true)

    try {
      // 1. Clonar el elemento a imprimir para no afectar la UI
      const printElement = printRef.current.cloneNode(true)
      
      // Asegurarnos de que el clon tiene estilos para captura correcta
      printElement.style.width = ticketWidth
      printElement.style.padding = '16px'
      printElement.style.background = '#ffffff'
      printElement.style.color = '#000000'
      printElement.style.margin = '0'
      
      // Adjuntar temporalmente al DOM para medir el alto real
      document.body.appendChild(printElement)
      const elementHeight = printElement.offsetHeight
      const elementWidth = printElement.offsetWidth
      document.body.removeChild(printElement)

      // Calcular alto en pulgadas basado en el ancho seleccionado
      const pdfWidth = size === 58 ? 2.28 : 3.14
      // Añadimos un pequeño margen de seguridad de 0.05 para evitar hojas fantasmas por redondeo
      const pdfHeight = ((elementHeight * pdfWidth) / elementWidth) + 0.05

      const opt = {
        margin:       0,
        filename:     `${ticketCode}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'in', format: [pdfWidth, pdfHeight], orientation: 'portrait' },
        pagebreak:    { mode: 'avoid-all' }
      }

      // Convertir a blob en lugar de descargar directamente
      const pdfBlob = await html2pdf().set(opt).from(printElement).output('blob')
      const file = new File([pdfBlob], `${ticketCode}.pdf`, { type: 'application/pdf' })

      // Verificar si el navegador soporta compartir archivos
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Comprobante de Pago - ${ticketCode}`,
          text: `Aquí tienes tu comprobante de pago de MQerK Academy.`
        })
      } else {
        // Fallback: Descarga directa si no soporta compartir
        const url = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${ticketCode}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error al generar o compartir el PDF:", error)
      alert("Hubo un error al generar el PDF. Asegúrate de tener permisos.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="ticket-preview-wrapper">
      <div 
        ref={selectorRef}
        className={`payment-selector-container ${showPaymentError ? 'error' : ''}`}
      >
        <div className="payment-selector-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Seleccionar Método de Pago
        </div>
        <div className="payment-chips">
          {['Efectivo', 'Depósito', 'Transferencia'].map((m) => (
            <button
              key={m}
              className={`payment-chip ${selectedMethod === m ? 'active' : ''}`}
              onClick={() => selectMethodWithFeedback(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="ticket-actions" style={{ justifyContent: 'space-between', padding: '0 8px' }}>
        <button 
          className="btn-primary btn-whatsapp" 
          onClick={handleSharePDF} 
          disabled={isGenerating}
          style={{ 
            flex: 1, 
            marginRight: '8px', 
            opacity: isGenerating ? 0.6 : (!selectedMethod ? 0.5 : 1),
            cursor: (isGenerating || !selectedMethod) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {isGenerating ? (
            <span style={{ fontSize: '11px' }}>Generando PDF...</span>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Compartir
            </>
          )}
        </button>
        
        <button 
          className="btn-primary" 
          onClick={handlePrint} 
          disabled={isGenerating}
          style={{ 
            flex: 1,
            opacity: isGenerating ? 0.6 : (!selectedMethod ? 0.5 : 1),
            cursor: (isGenerating || !selectedMethod) ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <svg viewBox="0 96 960 960" fill="currentColor" width="16" height="16">
            <path d="M640 896v-160H320v160H200V596q0-35.85 25.075-60.925Q250.15 510 286 510h388q35.85 0 60.925 25.075Q760 560.15 760 596v300H640Zm-320-60h320v-100H320v100ZM160 510V316q0-35 25.5-60t60.5-25h468q35 0 60.5 25t25.5 60v194H160Zm284-202H516v-60h-72v60Zm-36 494h144v-60H408v60ZM196 453h568V316H196v137Z"/>
          </svg>
          Imprimir
        </button>
      </div>

      <div className="ticket-paper-container">
        <div 
          className="ticket-paper" 
          ref={printRef} 
          style={{ width: ticketWidth, padding: '16px' }}
        >
          {/* Logo & Header */}
          <div className="ticket-header-content">
            <img 
              src="/MQerK_logo.png" 
              alt="MQerK Logo" 
              className="ticket-logo-img"
              style={{ width: '80px', height: 'auto', marginBottom: '8px' }}
            />
            <div className="ticket-academy-name">MQerKAcademy</div>
            <div className="ticket-academy-desc">Asesores Especializados en la Enseñanza de las Ciencias y Tecnología</div>
          </div>

          {/* Company Info */}
          <div className="ticket-info-block">
            <div><span className="ticket-bold">Domicilio:</span> Calle Juárez #25 Colonia. Centro, Tuxtepec, Oaxaca C.P. 68300.</div>
            <div><span className="ticket-bold">WhatsApp:</span> 287-151-5760</div>
            <div><span className="ticket-bold">Llama a oficinas al:</span> 287-237-4498</div>
            <div><span className="ticket-bold">RFC:</span> GORK980908K61</div>
          </div>

          <div className="ticket-info-block" style={{ marginTop: '8px' }}>
            <div className="ticket-info-row">
              <span className="ticket-bold">Fecha de pago:</span>
              <span>{date} &nbsp; {time}</span>
            </div>
            <div className="ticket-info-row">
              <span className="ticket-bold">Tipo de comprobante:</span>
              <span>ingreso</span>
            </div>
            <div className="ticket-info-row">
              <span className="ticket-bold">Folio:</span>
              <span className="ticket-bold">{ticketCode}</span>
            </div>
          </div>

          <div className="ticket-dashed-line"></div>
          <div className="ticket-main-title">RECIBO DE PAGO</div>
          <div className="ticket-dashed-line"></div>

          {/* Cliente Section */}
          <div className="ticket-client-info">
            <div className="ticket-section-header">Cliente</div>
            <div className="ticket-dashed-line" style={{ margin: '2px 0' }}></div>
            <div style={{ padding: '4px 0' }}>
              <div className="ticket-info-row" style={{ justifyContent: 'flex-start', gap: '4px' }}>
                <span className="ticket-col-label">Nombre:</span>
                <span className="ticket-bold">{alumno}</span>
              </div>
              <div className="ticket-info-row" style={{ justifyContent: 'flex-start', gap: '4px' }}>
                <span className="ticket-col-label">Dirección:</span>
                <span className="ticket-bold">San Juan Bautista Tuxtepec</span>
              </div>
              <div style={{ marginTop: '4px' }}>
                <span className="ticket-bold">Curso: &nbsp;</span>
                <span className="ticket-bold">{curso}</span>
              </div>
              <div className="ticket-info-row" style={{ justifyContent: 'flex-start', gap: '4px', marginTop: '2px' }}>
                <span className="ticket-col-label">Grupo:</span>
                <span className="ticket-bold">{grupo}</span>
              </div>
              <div style={{ marginTop: '4px' }}>
                <span className="ticket-bold">Descripción:</span>
                <span> {referencia}</span>
              </div>
            </div>
          </div>

          <div className="ticket-dashed-line"></div>

          {/* Concepts Table */}
          <table className="ticket-concept-table">
            <thead>
              <tr>
                <th width="15%">Unidad</th>
                <th width="55%">Concepto</th>
                <th width="30%" className="ticket-importe-cell">Importe</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ textAlign: 'center' }}>1</td>
                <td>{curso}</td>
                <td className="ticket-importe-cell">{formatMoney(monto)}</td>
              </tr>
              {/* Financial Breakdown - Explicit Order */}
              <tr>
                <td></td>
                <td><span className="ticket-bold">Precio del curso:</span></td>
                <td className="ticket-importe-cell">{formatMoney(monto)}</td>
              </tr>
              {incentivo > 0 && (
                <tr>
                  <td></td>
                  <td><span className="ticket-bold">Incentivo Premium:</span></td>
                  <td className="ticket-importe-cell">-{formatMoney(incentivo)}</td>
                </tr>
              )}
              <tr>
                <td></td>
                <td><span className="ticket-bold">Anticipo / Pago:</span></td>
                <td className="ticket-importe-cell" style={{ borderBottom: '1px solid #000' }}>{formatMoney(total - pendiente)}</td>
              </tr>
              <tr>
                <td></td>
                <td className="ticket-bold">Pendiente:</td>
                <td className="ticket-importe-cell ticket-bold">{formatMoney(pendiente)}</td>
              </tr>
              <tr>
                <td></td>
                <td className="ticket-bold" style={{ fontSize: '11px' }}>Total a pagar:</td>
                <td className="ticket-importe-cell ticket-bold" style={{ fontSize: '11px' }}>{formatMoney(total)}</td>
              </tr>
            </tbody>
          </table>

          <div className="ticket-dashed-line"></div>
          
          <div className="ticket-method-center">
            <div className="ticket-bold">Método de pago:</div>
            <div>{selectedMethod || (metodo ? `${metodo.banco} (${metodo.titular})` : 'Efectivo')}</div>
          </div>

          <div className="ticket-dashed-line"></div>

          {/* Footer Info */}
          <div className="ticket-footer-legal">
            <div className="ticket-bold">*CONSERVE ESTE COMPROBANTE*</div>
            <div>Pago realizado con éxito</div>
            <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
              UNA VEZ REALIZADO EL PAGO, ESTE NO ES SUJETO A REEMBOLSO.
            </div>
            <div className="ticket-thanks">¡GRACIAS POR ELEGIRNOS!</div>
            <div style={{ marginTop: '4px' }}>DUDAS O QUEJAS AL: 287-151-5760</div>
            <div style={{fontWeight: 'bolder'}} className="ticket-director">
              DIRECCIÓN: LIC. KELVIN VALENTÍN GÓMEZ RAMÍREZ
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
