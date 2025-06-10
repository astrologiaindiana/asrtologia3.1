// === config.js ===
// Configuração global para Firebase e Airtable

// Verificar se as dependências estão carregadas
if (typeof firebase === 'undefined') {
  console.error('Firebase não está carregado. Verifique a ordem dos scripts.');
  // Criar um objeto vazio para evitar erros
  window.firebase = {};
}

if (typeof Airtable === 'undefined') {
  console.error('Airtable não está carregado. Verifique a ordem dos scripts.');
  // Criar um objeto vazio para evitar erros
  window.Airtable = function() {
    return {
      base: function() { return {}; }
    };
  };
}

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAngAB_zoXr5lsi1N8WocVJeHFq6QjdUUs",
  authDomain: "astrologia-indiana-app.firebaseapp.com",
  projectId: "astrologia-indiana-app",
  storageBucket: "astrologia-indiana-app.appspot.com",
  messagingSenderId: "1055729827966",
  appId: "1:1055729827966:web:51954b0cabee762653d82f"
};

// Inicializar Firebase com tratamento de erro
try {
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase inicializado com sucesso");
} catch (e) {
  console.error("Erro ao inicializar Firebase:", e);
}

// Inicializar Airtable com tratamento de erro
try {
  window.airtableBase = new Airtable({
    apiKey: "patkcHF16ytjQFYtf.2d2b97aeab44b5961a1c7e4c68e6f5e2bdef0b81f2cd0303dc2580f9d96df10d"
  }).base("appc74NoitSC8w1XQ");
  console.log("Airtable inicializado com sucesso");
} catch (e) {
  console.error("Erro ao inicializar Airtable:", e);
  // Criar um objeto mock para evitar erros
  window.airtableBase = {
    select: function() { return { firstPage: function(callback) { callback(null, []); } }; },
    create: function(records, callback) { callback(null, []); }
  };
}

// Mapeamento das tabelas do Airtable
window.TABLES = {
  MAP_TYPES: "Tipos de Mapa",
  ORDERS: "Pedidos",
  CLIENTS: "Clientes",
  VIDEO_CALLS: "Videochamadas"
};

// Verificar se as variáveis globais estão disponíveis
console.log("Firebase disponível:", typeof firebase !== 'undefined');
console.log("Airtable disponível:", typeof Airtable !== 'undefined');
console.log("Base Airtable configurada:", typeof window.airtableBase !== 'undefined');
console.log("Tabelas configuradas:", window.TABLES);
