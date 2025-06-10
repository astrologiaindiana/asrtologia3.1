// === app.js ===
// Script principal da aplicação

document.addEventListener('DOMContentLoaded', function() {
    console.log('Aplicação Astrologia Indiana inicializada');
    
    // Inicializar eventos globais
    initGlobalEvents();
    
    // Criar dados de teste se necessário
    if (typeof window.createMockData === 'function') {
        // Verificar se já existem dados
        window.airtableBase(window.TABLES.MAP_TYPES).select({
            maxRecords: 1,
            view: 'Grid view'
        }).firstPage(function(err, records) {
            if (err) {
                console.error('Erro ao verificar dados existentes:', err);
                return;
            }
            
            if (records.length === 0) {
                console.log('Nenhum dado encontrado, criando dados de teste...');
                window.createMockData();
            } else {
                console.log('Dados existentes encontrados, pulando criação de dados de teste');
            }
        });
    }
});

// Função para inicializar eventos globais
function initGlobalEvents() {
    // Fechar modais com tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
    
    // Inicializar service worker para PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.error('Erro ao registrar Service Worker:', error);
            });
    }
}
