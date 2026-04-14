/**
 * data.js
 * Este archivo simula la persistencia en una "Base de Datos" JSON.
 */

// ==== CLAVES PARA EL LOCALSTORAGE ====
const USERS_KEY = "acme_users";
const ACCOUNTS_KEY = "acme_accounts";
const TRANSACTIONS_KEY = "acme_transactions";

// ==== FUNCIONES DE LECTURA (JSON.parse) ====

// Obtiene la lista de usuarios desde LocalStorage.
function getUsers() {
    const data = localStorage.getItem(USERS_KEY);
    if (data) {
        return JSON.parse(data);
    }
    return [];
}

// Obtiene el diccionario de cuentas desde LocalStorage.
function getAccounts() {
    const data = localStorage.getItem(ACCOUNTS_KEY);
    return data ? JSON.parse(data) : {};
}

// Obtiene el historial de transacciones desde LocalStorage.
function getTransactions() {
    const data = localStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : {};
}

// ==== FUNCIONES DE ESCRITURA (JSON.stringify) ====

// Guarda la lista de usuarios en LocalStorage.
function saveUsers(usersArray) {
    localStorage.setItem(USERS_KEY, JSON.stringify(usersArray));
}

// Guarda el diccionario de cuentas en LocalStorage.
function saveAccounts(accountsObj) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accountsObj));
}

// Guarda las transacciones en LocalStorage.
function saveTransactions(transactionsObj) {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactionsObj));
}

// ==== FUNCIONES DEL NEGOCIO (LÓGICA DEL BANCO) ====

// Genera un número de cuenta aleatorio de 10 dígitos.
function generateAccountNumber() {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// Crea una referencia única aleatoria para cada transacción.
function generateReference() {
    return 'REF-' + Math.floor(100000 + Math.random() * 900000).toString();
}

// Registra un usuario y crea su cuenta bancaria.
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

// Valida credenciales e inicia sesión de un usuario.
function loginUser(idType, idNumber, password) {
    const users = getUsers();
    const user = users.find(u => u.idType === idType && u.idNumber === idNumber && u.password === password);
    return user ? user : null;
}

// Trae los datos de saldo de una cuenta específica.
function getAccountData(accountNumber) {
    const accounts = getAccounts();
    return accounts[accountNumber];
}

// Da formato de moneda local (COP) a los números.
function formatCurrency(amount) {
    // Usamos la API nativa de JavaScript (Intl) para formatear monedas fácilmente
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

// Ajusta las fechas a un formato de texto legible a nivel local.
function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CO', { 
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// Registra transacciones y actualiza el balance de la cuenta.
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
