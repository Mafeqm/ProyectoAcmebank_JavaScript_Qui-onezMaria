🏦 Plataforma de Autogestión - Banco Acme

Aplicación web de autogestión bancaria construida con HTML, CSS y JavaScript puro. Permite a los usuarios del Banco Acme gestionar sus cuentas, transacciones y servicios de forma intuitiva y segura desde el navegador.

👩‍💼 Desarrolladora
María Fernanda Quiñonez Moreno


🚀 Instalación y Ejecución Rápida
No necesitas servidor ni dependencias complejas. ¡En 30 segundos estás listo!

Clonar/Descargar el repositorio a tu computadora.

Abrir el archivo index.html con doble clic en tu navegador.

Recomendado: Usa la extensión Live Server en VS Code para recarga automática.

💾 Datos persistentes: Todo se guarda en localStorage del navegador (Usuarios, Cuentas, Transacciones en JSON). ¡No pierdes nada al recargar!

✨ Funcionalidades Completadas
🎯 Módulo	✅ Características Principales
Autenticación	Validación en tiempo real, redirección al Dashboard, alertas de error
Registro Usuario	Formulario completo, cuenta bancaria única (10 dígitos aleatorios), persistencia JSON
Recuperar Contraseña	Validación por usuario/correo + nuevo formulario de cambio
Dashboard	Tarjeta con saldo en COP, resumen transacciones, todas las operaciones
📊 Operaciones del Dashboard
Resumen Transacciones: Últimas 10 + botón imprimir (window.print())

Consignación Electrónica: Cargar fondos + registro + imprimir

Retiro: Validación saldo + registro + imprimir

Pago Servicios: Energía, Agua, Gas, Internet + registro + imprimir

Certificado Bancario: Modelo imprimible con fecha creación

Cerrar Sesión: Limpieza de sesión + redirección

🛠️ Tecnologías y Diseño
text
Frontend: HTML5 | CSS3 | JavaScript ES6+
Estilos: Morados, Blancos, Tonos Serios (Responsive 100%)
Tipografía: Inter/Roboto (Google Fonts)
Almacenamiento: localStorage + JSON
💻 100% Cliente: Sin backend ni servidor requerido

📱 Responsive: Móviles, Tablets, Desktop

🎨 Diseño Profesional: Cumple especificaciones de colores institucionales

📸 Demo
text
graph TD
    A[Login/Registro] --> B[Dashboard]
    B --> C[Consignar]
    B --> D[Retirar]
    B --> E[Pagar Servicios]
    B --> F[Certificado]
    B --> G[Cerrar Sesión]
📝 Notas Finales
Moneda: Peso Colombiano (COP) en toda la app

Impresión: Todas las operaciones incluyen opción window.print()

Seguridad: Validaciones completas en frontend