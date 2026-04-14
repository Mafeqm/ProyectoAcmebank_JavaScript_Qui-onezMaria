/**
 * app.js
 * Este archivo se encarga de cambiar lo que se ve en pantalla (Manipulación del DOM),
 * escuchar los clicks (Eventos), y conectar con lo que guarda data.js
 */

// ==== VARIABLES GLOBALES DE SESIÓN ====
// Aquí guardaremos en memoria quién está conectado actualmente
let currentUser = null; 

// ==== FUNCIONES DE NAVEGACIÓN (SPA) ====

// Muestra una de las vistas principales (Login, Registro, etc.) y oculta las demás.
function showView(viewId) {
    // Mapear las vistas antiguas al nuevo contenedor unificado
    const wrapper = document.getElementById('auth-wrapper');

    if (viewId === 'view-login') {
        viewId = 'view-auth';
        if (wrapper) wrapper.classList.remove('register-mode');
    } else if (viewId === 'view-register') {
        viewId = 'view-auth';
        if (wrapper) wrapper.classList.add('register-mode');
    }

    // Busca todas las secciones que tengan la clase .view-section
    const views = document.querySelectorAll('.view-section');
    views.forEach(section => {
        section.classList.remove('active'); // Las oculta
        section.classList.add('hidden');
    });

    // Muestra solo la solicitada
    const target = document.getElementById(viewId);
    if(target) {
        target.classList.remove('hidden');
        target.classList.add('active');
    }
}

// Cambia la vista interna del Dashboard y actualiza el menú.
function showDashboardView(viewId) {
    // Ocultar todas las sub-vistas
    const views = document.querySelectorAll('.dash-view');
    views.forEach(view => {
        view.classList.remove('active');
        view.classList.add('hidden');
    });

    // Quitar color activo de todos los enlaces del menú
    document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));

    // Mostrar el contenedor solicitado
    document.getElementById(viewId).classList.remove('hidden');
    document.getElementById(viewId).classList.add('active');

    // Cambiar color del enlace en el nav
    document.getElementById(`nav-${viewId}`).classList.add('active');

    // Llamamos las funciones para pintar los datos si se entra a ciertas secciones
    if(viewId === 'dash-home') loadDashboardHome();
    if(viewId === 'dash-transactions') loadTransactionsTable();
}

// Llena los datos del usuario logueado en la interfaz (nombre y cuenta).
function fillSessionDataDOM() {
    if(!currentUser) return;
    
    // Escribimos el nombre en los campos configurados para eso
    document.querySelectorAll('.session-name').forEach(el => {
        el.textContent = `${currentUser.names} ${currentUser.surnames}`;
    });
    
    // Escribimos la cuenta en los lugares configurados
    document.querySelectorAll('.session-account').forEach(el => {
        el.textContent = currentUser.accountNumber;
    });
}

// ==== EVENTOS DE AUTENTICACION ====

// --> Formulario de Login
document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página se recargue

    const idType = document.getElementById('login-id-type').value;
    const idNum = document.getElementById('login-id-number').value;
    const pass = document.getElementById('login-password').value;
    const errorBox = document.getElementById('login-error');

    // Usamos el data.js para buscar
    const user = loginUser(idType, idNum, pass);

    if (user) {
        // Exito
        currentUser = user; 
        errorBox.classList.add('hidden');
        document.getElementById('form-login').reset(); // Limpia los inputs

        // Preparamos al dashboard
        fillSessionDataDOM();
        loadDashboardHome();
        showView('view-dashboard');
        showDashboardView('dash-home'); // Vamos al resumen principal
    } else {
        // Error
        errorBox.classList.remove('hidden');
    }
});

// Cierra la sesión activa y vuelve al login.
function logout() {
    currentUser = null;
    showView('view-login');
}

// ==== EVENTOS DE LOS BOTONES DE OVERLAY (Transición Login <-> Registro) ====
document.getElementById('btn-go-register').addEventListener('click', function() {
    document.getElementById('auth-wrapper').classList.add('register-mode');
});

document.getElementById('btn-go-login').addEventListener('click', function() {
    document.getElementById('auth-wrapper').classList.remove('register-mode');
});


// --> Formulario de Registro
document.getElementById('form-register').addEventListener('submit', function(e) {
    e.preventDefault();

    // Recolectar datos
    const newUser = {
        idType: document.getElementById('reg-id-type').value,
        idNumber: document.getElementById('reg-id-number').value,
        names: document.getElementById('reg-names').value,
        surnames: document.getElementById('reg-surnames').value,
        gender: document.getElementById('reg-gender').value,
        phone: document.getElementById('reg-phone').value,
        email: document.getElementById('reg-email').value,
        city: document.getElementById('reg-city').value,
        address: document.getElementById('reg-address').value,
        password: document.getElementById('reg-password').value
    };

    // Intentamos registrar (con función de data.js)
    const result = registerUser(newUser);

    if (result) {
        // Se generó exitosamente
        alert(`¡Registro exitoso!\nSu número de cuenta asignado es: ${result.accountNumber}`);
        showView('view-login');
        document.getElementById('form-register').reset();
    }
});


// --> Recuperación de contraseña
let recoveryUserTarget = null; // Guardará el usuario que solicita recuperar contraseña

document.getElementById('form-recovery-step1').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const idType = document.getElementById('rec-id-type').value;
    const idNum = document.getElementById('rec-id-number').value;
    const email = document.getElementById('rec-email').value;
    const errBox = document.getElementById('recovery-error');

    const users = getUsers(); // Llamada a data.js
    // Buscamos coincidencia exacta
    recoveryUserTarget = users.find(u => u.idType === idType && u.idNumber === idNum && u.email === email);

    if (recoveryUserTarget) {
        // Concuerda, ocultamos paso 1 y mostramos clave nueva
        document.getElementById('form-recovery-step1').classList.add('hidden');
        document.getElementById('form-recovery-step2').classList.remove('hidden');
        errBox.classList.add('hidden');
    } else {
        errBox.classList.remove('hidden');
    }
});

document.getElementById('form-recovery-step2').addEventListener('submit', function(e) {
    e.preventDefault();
    const newPass = document.getElementById('rec-new-password').value;
    
    // Obtenemos todos los usuarios para modificar
    const users = getUsers();
    // Buscamos la posición de nuestra victima (quien recupera o intenta recuperar)
    const index = users.findIndex(u => u.idNumber === recoveryUserTarget.idNumber);
    
    if(index !== -1) {
        users[index].password = newPass;
        saveUsers(users); // Actualizamos JSON (data.js)
        
        document.getElementById('recovery-success').classList.remove('hidden');
        
        // Esperamos 2 segundos y retornamos al login
        setTimeout(() => {
            document.getElementById('form-recovery-step1').reset();
            document.getElementById('form-recovery-step2').reset();
            document.getElementById('form-recovery-step1').classList.remove('hidden');
            document.getElementById('form-recovery-step2').classList.add('hidden');
            document.getElementById('recovery-success').classList.add('hidden');
            showView('view-login');
        }, 2000);
    }
});

// ==== FUNCIONES DEL DASHBOARD ====

// Carga y muestra los datos generales y saldo en el inicio del Dashboard.
function loadDashboardHome() {
    if(!currentUser) return;
    
    document.getElementById('dash-user-name').textContent = currentUser.names;
    document.getElementById('dash-account-number').textContent = currentUser.accountNumber;
    
    // Formatear Fecha
    const formattedDate = formatDate(currentUser.createdAt);
    document.getElementById('dash-created-at').textContent = formattedDate;

    // Obtener Cuenta y Saldo (desde data.js)
    const account = getAccountData(currentUser.accountNumber);
    document.getElementById('dash-balance').textContent = formatCurrency(account.balance);
    
    // Datos del Certificado
    document.getElementById('cert-id').textContent = currentUser.idNumber;
    document.getElementById('cert-date').textContent = formattedDate;
    document.getElementById('cert-current-date').textContent = formatDate(new Date().toISOString());
}

// Muestra las últimas 10 transacciones en la tabla del historial.
function loadTransactionsTable() {
    if(!currentUser) return;
    const Tbody = document.getElementById('table-transactions-body');
    Tbody.innerHTML = ""; // Limpiar antes de llenar
    
    const allTransactions = getTransactions()[currentUser.accountNumber] || [];
    
    // Tomamos sólo las últimas 10 (las más recientes arriba)
    const last10 = allTransactions.slice(-10).reverse();

    // Cuenta para header de impresión
    document.querySelector('.print-account').textContent = currentUser.accountNumber;

    if (last10.length === 0) {
        Tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">No tienes movimientos recientes.</td></tr>`;
        return;
    }

    last10.forEach(tx => {
        // Por seguridad en UI y UX, pintamos los retiros de rojo y las consignaciones de verde
        const isIncome = tx.type === 'Consignación';
        const color = isIncome ? 'var(--success-color)' : 'var(--error-color)';
        const sign = isIncome ? '+' : '-';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatDate(tx.date)}</td>
            <td>${tx.reference}</td>
            <td>${tx.type}</td>
            <td>${tx.concept}</td>
            <td style="color: ${color}; font-weight: bold;">${sign} ${formatCurrency(tx.value)}</td>
        `;
        Tbody.appendChild(tr);
    });
}

// ==== TRANSACCIONES MANUALES ====

// Abre un modal mostrando los detalles de una transacción.
function mostrarComprobante(tx) {
    const modal = document.getElementById('receipt-modal');
    const bdy = document.getElementById('receipt-body');
    
    document.getElementById('receipt-title').textContent = "Comprobante de " + tx.type;
    
    bdy.innerHTML = `
        <p><strong>Fecha:</strong> ${formatDate(tx.date)}</p>
        <p><strong>Referencia:</strong> ${tx.reference}</p>
        <p><strong>Cuenta:</strong> ${currentUser.accountNumber}</p>
        <p><strong>Concepto:</strong> ${tx.concept}</p>
        <p><strong>Valor:</strong> ${formatCurrency(tx.value)}</p>
    `;
    
    modal.showModal(); // API nativa de dialogos de HTML5
}

// Cierra el modal de comprobantes.
function cerrarModal() {
    document.getElementById('receipt-modal').close();
}

// Abre la ventana de impresión para un área específica.
function imprimirZona(elementId) {
    // Le decimos a todo el body que no aplique estilos normales a los que no tienen 'printable'
    document.body.classList.add('printing-mode');
    
    // Al elemento solicitado le aplicamos la clase para que el @media print de CSS lo detecte
    document.getElementById(elementId).classList.add('printable');
    
    // Lanzar print de navegador
    window.print();
    
    // Quitar la clase de impresión tras imprimir
    document.getElementById(elementId).classList.remove('printable');
    document.body.classList.remove('printing-mode');
}

// --> Ejecutar Consignación
document.getElementById('form-deposit').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = document.getElementById('dep-amount').value;
    
    const tx = addTransaction(
        currentUser.accountNumber, 
        "Consignación", 
        "Consignación por canal electrónico", 
        amount
    );
    
    if (tx) {
        document.getElementById('form-deposit').reset();
        mostrarComprobante(tx);
    }
});

// --> Ejecutar Retiro
document.getElementById('form-withdraw').addEventListener('submit', function(e) {
    e.preventDefault();
    const amount = document.getElementById('wit-amount').value;
    const err = document.getElementById('wit-error');
    
    const tx = addTransaction(
        currentUser.accountNumber, 
        "Retiro", 
        "Retiro de dinero", 
        amount
    );
    
    if (tx) {
        err.classList.add('hidden');
        document.getElementById('form-withdraw').reset();
        mostrarComprobante(tx);
    } else {
        err.classList.remove('hidden'); // Insuficiente
    }
});

// --> Ejecutar Pago Servicios
document.getElementById('form-services').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const serviceName = document.getElementById('srv-type').value;
    const amount = document.getElementById('srv-amount').value;
    const err = document.getElementById('srv-error');
    
    const tx = addTransaction(
        currentUser.accountNumber, 
        "Retiro", 
        `Pago de servicio público ${serviceName}`, 
        amount
    );
    
    if (tx) {
        err.classList.add('hidden');
        document.getElementById('form-services').reset();
        mostrarComprobante(tx);
    } else {
        err.classList.remove('hidden'); // Insuficiente
    }
});
