# Sistema de Gestión de Transacciones y Recibos

Una solución web profesional diseñada para la generación, gestión y envío de recibos de transacciones y comprobantes de registro. Esta plataforma optimiza los flujos de trabajo administrativos proporcionando una interfaz en tiempo real para el seguimiento financiero y la generación de documentos.

## 🚀 Características

- **Autenticación Segura:** Control de acceso basado en roles a través de un sistema de inicio de sesión localizado.
- **Entrada de Datos Inteligente:** Formularios intuitivos con autocompletado de correo electrónico y reglas de validación inteligentes.
- **Panel Interactivo:** Tabla de transacciones en tiempo real con filtrado avanzado (ej. saldos pendientes, categorías de cursos).
- **Plantillas Profesionales:** Generación de tickets de alta fidelidad con sincronización dinámica de datos.
- **Envío Fluido:** Motor de PDF integrado para compartir directamente vía WhatsApp y menús de compartición del sistema operativo móvil.
- **Optimizado para Impresión:** Diseños de tickets para impresoras térmicas (58mm/80mm) con tipografía nítida y soporte de marca.
- **Interfaz Adaptativa:** Diseño totalmente responsivo con modos Claro y Oscuro sincronizados con el sistema.

## 🛠️ Stack Tecnológico

- **Frontend:** [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Backend/Base de Datos:** [Supabase](https://supabase.com/) (Auth & PostgreSQL)
- **Generación de PDF:** [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/)
- **Estilos:** Vanilla CSS (Sistema de diseño personalizado)
- **Iconos:** SVGs con estilo Feather/Lucide

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd sistema-gestion-recibos
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configuración del Entorno:**
   Crea un archivo `.env` en el directorio raíz y añade tus credenciales (consulta `.env.example`):
   ```env
   VITE_SUPABASE_URL=tu_url_de_proyecto
   VITE_SUPABASE_ANON_KEY=tu_clave_anon
   ```

4. **Ejecutar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 🏗️ Estructura del Proyecto

- `src/components/`: Componentes modulares de React (Tabla, Login, Búsqueda, Vista Previa de Ticket).
- `src/lib/`: Configuración de la base de datos e inicialización de librerías de terceros.
- `public/`: Archivos estáticos y logos.
- `App.css`: Estilos globales y tokens de tema para los modos claro/oscuro.

## 📄 Licencia

Este proyecto es privado y está destinado únicamente para uso interno.
