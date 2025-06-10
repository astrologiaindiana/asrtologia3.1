// === clients.js ===
// Funções para gerenciar clientes

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos da seção de clientes
    initClientsSection();
});

// Função para inicializar eventos da seção de clientes
function initClientsSection() {
    // Botão para adicionar novo cliente
    const addClienteBtn = document.getElementById('add-cliente');
    if (addClienteBtn) {
        addClienteBtn.addEventListener('click', function() {
            openNewClientModal();
        });
    }
    
    // Formulário de edição de cliente
    const editClienteForm = document.getElementById('edit-cliente-form');
    if (editClienteForm) {
        editClienteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const clientId = document.getElementById('cliente-id').value;
            const clientData = {
                name: document.getElementById('edit-nome').value,
                whatsapp: document.getElementById('edit-whatsapp').value,
                email: document.getElementById('edit-email').value
            };
            
            if (clientId) {
                // Atualizar cliente existente
                updateClient(clientId, clientData);
            } else {
                // Criar novo cliente
                createClient(clientData);
            }
            
            closeModal('cliente-modal');
        });
    }
    
    // Inicializar paginação
    initClientsPagination();
}

// Função para inicializar paginação de clientes
function initClientsPagination() {
    const prevPageBtn = document.getElementById('prev-page-clientes');
    const nextPageBtn = document.getElementById('next-page-clientes');
    const pageInfo = document.getElementById('page-info-clientes');
    
    if (prevPageBtn && nextPageBtn && pageInfo) {
        // Variáveis de paginação
        window.clientsPagination = {
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            totalClients: 0
        };
        
        // Botão de página anterior
        prevPageBtn.addEventListener('click', function() {
            if (window.clientsPagination.currentPage > 1) {
                window.clientsPagination.currentPage--;
                updateClientsPage();
            }
        });
        
        // Botão de próxima página
        nextPageBtn.addEventListener('click', function() {
            if (window.clientsPagination.currentPage < window.clientsPagination.totalPages) {
                window.clientsPagination.currentPage++;
                updateClientsPage();
            }
        });
    }
}

// Função para atualizar página de clientes
function updateClientsPage() {
    const pagination = window.clientsPagination;
    const pageInfo = document.getElementById('page-info-clientes');
    const prevPageBtn = document.getElementById('prev-page-clientes');
    const nextPageBtn = document.getElementById('next-page-clientes');
    
    if (pageInfo) {
        pageInfo.textContent = `Página ${pagination.currentPage} de ${pagination.totalPages}`;
    }
    
    if (prevPageBtn) {
        prevPageBtn.disabled = pagination.currentPage === 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = pagination.currentPage === pagination.totalPages;
    }
    
    // Filtrar clientes para a página atual
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const pageClients = window.allClients.slice(startIndex, endIndex);
    
    // Atualizar tabela com clientes da página atual
    updateClientsTable(pageClients);
}

// Sobrescrever função de carregar clientes para incluir paginação
const originalLoadClients = window.loadClients;
window.loadClients = function(search = '') {
    console.log('Carregando clientes com paginação...');
    
    // Opções de consulta
    const queryOptions = {
        view: 'Grid view'
    };
    
    if (search) {
        queryOptions.filterByFormula = `OR(FIND('${search.toLowerCase()}', LOWER({Nome})), FIND('${search.toLowerCase()}', LOWER({WhatsApp})))`;
    }
    
    // Array para armazenar todos os clientes
    window.allClients = [];
    
    window.airtableBase(window.TABLES.CLIENTS).select(queryOptions).eachPage(function page(records, fetchNextPage) {
        const clients = records.map(record => ({
            id: record.id,
            name: record.get('Nome'),
            whatsapp: record.get('WhatsApp'),
            email: record.get('Email') || '',
            orders: record.get('Pedidos') || []
        }));
        
        // Adicionar clientes ao array global
        window.allClients = window.allClients.concat(clients);
        
        // Buscar próxima página se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar clientes:', err);
            showToast('Erro ao carregar clientes', 'error');
            return;
        }
        
        console.log('Clientes carregados:', window.allClients.length);
        
        // Configurar paginação
        const pagination = window.clientsPagination;
        pagination.totalClients = window.allClients.length;
        pagination.totalPages = Math.ceil(pagination.totalClients / pagination.pageSize) || 1;
        pagination.currentPage = 1;
        
        // Atualizar página
        updateClientsPage();
        
        // Preencher select de clientes para videochamadas
        populateClientSelect(window.allClients);
    });
};
