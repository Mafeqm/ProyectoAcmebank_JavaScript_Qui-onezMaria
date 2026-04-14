/**
 * data.js
 * Este archivo simula la persistencia en una "Base de Datos" JSON.
 * Ya que el navegador no nos permite sobrescribir archivos físicos .json directamente
 * mediante JS por razones de seguridad, utilizamos `localStorage`.
 * Al convertir datos (Objetos) a formato de texto JSON (JSON.stringify) y viceversa 
 * (JSON.parse), cumplimos con el requerimiento de guardar las estructuras como JSON.
 */

// ==== CLAVES PARA EL LOCALSTORAGE ====
const USERS_KEY = "acme_users";
const ACCOUNTS_KEY = "acme_accounts";
const TRANSACTIONS_KEY = "acme_transactions";

// ==== FUNCIONES DE LECTURA (JSON.parse) ====

/**
 * Lee y convierte el string JSON de LocalStorage a un arreglo (Array) de usuarios.
 * Si no existe, retorna un arreglo vacío [].
 */
function getUsers() {
    const data = localStorage.getItem(USERS_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

/**
 * Lee el diccionario (Object) de cuentas (ej: {"1234567890": { balance: 500 }} )
 */
function getAccounts() {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : {};
}

/**
 * Lee el diccionario de transacciones. Está mapeado por número de cuenta.
 * ej: {"1234567890": [ {fecha, tipo, monto} ] }
 */
function getTransactions() {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : {};
}

// ==== FUNCIONES DE ESCRITURA (JSON.stringify) ====

/**
 * Convierte el objeto de datos a texto (String) y lo guarda en LocalStorage.
 * Esto "crea" o sobrescribe nuestro "archivo json virtual".
 */
function saveUsers(usersArray) {
    localStorage.setItem(USERS_KEY, JSON.stringify(usersArray));
}

function saveAccounts(accountsObj) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accountsObj));
}

function saveTransactions(transactionsObj) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactionsObj));
}

// ==== FUNCIONES DEL NEGOCIO (LÓGICA DEL BANCO) ====

/** Genera un número de cuenta aleatorio de 10 dígitos */
function generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

/** Genera un número de referencia aleatorio para la transacción */
function generateReference() {
    return 'REF-' + Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Registra un nuevo usuario en la Base de Datos json y le crea una cuenta en 0.
 * Retorna el usuario creado o false si hubo un error.
 */
function registerUser(userData) {
    const users = getUsers();
    
    // Verificamos si ya existe alguien con esta cédula
    const exists = users.find(u => u.idNumber === userData.idNumber && u.idType === userData.idType);
    if (exists) {
        alert("Ya existe un usuario registrado con este documento.");
        return false;
    }

    // Le asignamos sus datos de banco
    userData.accountNumber = generateAccountNumber();
    userData.createdAt = new Date().toISOString(); 

    // Guardamos el usuario
    users.push(userData);
    saveUsers(users);

    // Creamos la cuenta en cero (0)
    const accounts = getAccounts();
    accounts[userData.accountNumber] = {
        balance: 0,
        userIdNumber: userData.idNumber,
        createdAt: userData.createdAt
    };
    saveAccounts(accounts);

    // Inicializamos sus transacciones vacías
    const transactions = getTransactions();
    transactions[userData.accountNumber] = [];
    saveTransactions(transactions);

    return userData;
}

/**
 * Busca al usuario por su tipo y número de ID y su contraseña
 * Retorna el usuario si los datos son correctos, si no retorna null.
 */
function loginUser(idType, idNumber, password) {
    const users = getUsers();
    const user = users.find(u => u.idType === idType && u.idNumber === idNumber && u.password === password);
    return user ? user : null;
}

/** Obtiene la cuenta en base a un numero de cuenta */
function getAccountData(accountNumber) {
    const accounts = getAccounts();
    return accounts[accountNumber];
}

/** Formatea una cantidad en dinero Colombiano (COP) */
function formatCurrency(amount) {
    // Usamos la API nativa de JavaScript (Intl) para formatear monedas fácilmente
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

/** Formatea una fecha a algo legible, ej: "10 de Abril, 2024" */
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CO', { 
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

/**
 * Añade una transacción y actualiza el saldo de la cuenta automáticamente
 */
function addTransaction(accountNumber, type, concept, value) {
    const accounts = getAccounts();
    const account = accounts[accountNumber];
    
    // Convertimos el input a número para no caer en el riesgo matemático '10' + '20' = '1020'
    const numericValue = parseFloat(value); 

    // Si es retiro, validamos que haya dinero.
    if (type === "Retiro") {
        if (numericValue > account.balance) {
            return false; // Error: Sin fondos suficientes
        }
        account.balance -= numericValue; // Disminuimos
    } else if (type === "Consignación") {
        account.balance += numericValue; // Aumentamos
    }

    saveAccounts(accounts); // Guardamos la actualización de la cuenta

    // Registramos la transacción
    const transactions = getTransactions();
    const newTx = {
        date: new Date().toISOString(),
        reference: generateReference(),
        type: type,
        concept: concept,
        value: numericValue
    };
    
    transactions[accountNumber].push(newTx);
    saveTransactions(transactions); // Guardamos el nuevo JSON de transacciones

    return newTx; // Retornamos el ticket para el resumen
}
