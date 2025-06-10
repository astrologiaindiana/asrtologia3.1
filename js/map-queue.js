// === map-queue.js ===
// Funções para gerenciar o painel de pedidos

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos do painel de pedidos
    initOrdersPanel();
});

// Função para inicializar eventos do painel de pedidos
function initOrdersPanel() {
    // Botão de exportar para CSV
    const exportButton = document.getElementById('export-pedidos');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            exportOrdersToCSV(window.currentOrders || []);
        });
    }
    
    // Formulário de edição de pedido
    const editPedidoForm = document.getElementById('edit-pedido-form');
    if (editPedidoForm) {
        editPedidoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const orderId = document.getElementById('pedido-id').value;
            const orderData = {
                clientName: document.getElementById('edit-cliente-nome').value,
                whatsapp: document.getElementById('edit-cliente-whatsapp').value,
                birthDate: document.getElementById('edit-data-nascimento').value,
                birthTime: document.getElementById('edit-hora-nascimento').value,
                birthPlace: document.getElementById('edit-local-nascimento').value,
                mapType: document.getElementById('edit-tipo-mapa').value,
                responsavel: document.getElementById('edit-responsavel').value,
                status: document.getElementById('edit-status').value,
                requiresVideoCall: document.getElementById('edit-requer-videochamada').checked
            };
            
            updateOrder(orderId, orderData);
            closeModal('pedido-modal');
        });
    }
    
    // Inicializar paginação
    initOrdersPagination();
}

// Função para inicializar paginação de pedidos
function initOrdersPagination() {
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    if (prevPageBtn && nextPageBtn && pageInfo) {
        // Variáveis de paginação
        window.ordersPagination = {
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            totalOrders: 0
        };
        
        // Botão de página anterior
        prevPageBtn.addEventListener('click', function() {
            if (window.ordersPagination.currentPage > 1) {
                window.ordersPagination.currentPage--;
                updateOrdersPage();
            }
        });
        
        // Botão de próxima página
        nextPageBtn.addEventListener('click', function() {
            if (window.ordersPagination.currentPage < window.ordersPagination.totalPages) {
                window.ordersPagination.currentPage++;
                updateOrdersPage();
            }
        });
    }
}

// Função para atualizar página de pedidos
function updateOrdersPage() {
    const pagination = window.ordersPagination;
    const pageInfo = document.getElementById('page-info');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    
    if (pageInfo) {
        pageInfo.textContent = `Página ${pagination.currentPage} de ${pagination.totalPages}`;
    }
    
    if (prevPageBtn) {
        prevPageBtn.disabled = pagination.currentPage === 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = pagination.currentPage === pagination.totalPages;
    }
    
    // Filtrar pedidos para a página atual
    const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    const pageOrders = window.allOrders.slice(startIndex, endIndex);
    
    // Atualizar tabela com pedidos da página atual
    updateOrdersTable(pageOrders);
    
    // Armazenar pedidos atuais para exportação
    window.currentOrders = pageOrders;
}

// Sobrescrever função de carregar pedidos para incluir paginação
const originalLoadOrders = window.loadOrders;
window.loadOrders = function(filters = {}) {
    console.log('Carregando pedidos com paginação...');
    
    // Construir filtro
    let filterByFormula = '';
    if (filters.status) {
        filterByFormula = `{Status} = '${filters.status}'`;
    }
    if (filters.responsavel) {
        const responsavelFilter = `{Responsável} = '${filters.responsavel}'`;
        filterByFormula = filterByFormula ? `AND(${filterByFormula}, ${responsavelFilter})` : responsavelFilter;
    }
    if (filters.tipoMapa) {
        const tipoMapaFilter = `{Tipo de Mapa} = '${filters.tipoMapa}'`;
        filterByFormula = filterByFormula ? `AND(${filterByFormula}, ${tipoMapaFilter})` : tipoMapaFilter;
    }
    if (filters.search) {
        const searchFilter = `OR(FIND('${filters.search.toLowerCase()}', LOWER({Nome do Cliente})), FIND('${filters.search.toLowerCase()}', LOWER({WhatsApp})))`;
        filterByFormula = filterByFormula ? `AND(${filterByFormula}, ${searchFilter})` : searchFilter;
    }
    
    // Opções de consulta
    const queryOptions = {
        view: 'Grid view',
        sort: [{field: 'Data de Criação', direction: 'desc'}]
    };
    
    if (filterByFormula) {
        queryOptions.filterByFormula = filterByFormula;
    }
    
    // Array para armazenar todos os pedidos
    window.allOrders = [];
    
    window.airtableBase(window.TABLES.ORDERS).select(queryOptions).eachPage(function page(records, fetchNextPage) {
        const orders = records.map(record => ({
            id: record.id,
            clientName: record.get('Nome do Cliente'),
            whatsapp: record.get('WhatsApp'),
            birthDate: record.get('Data Nascimento'),
            birthTime: record.get('Hora Nascimento'),
            birthPlace: record.get('Local'),
            mapType: record.get('Tipo de Mapa'),
            responsavel: record.get('Responsável'),
            status: record.get('Status'),
            requiresVideoCall: record.get('Requer Videochamada') || false,
            createdAt: record.get('Data de Criação')
        }));
        
        // Adicionar pedidos ao array global
        window.allOrders = window.allOrders.concat(orders);
        
        // Buscar próxima página se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar pedidos:', err);
            showToast('Erro ao carregar pedidos', 'error');
            return;
        }
        
        console.log('Pedidos carregados:', window.allOrders.length);
        
        // Configurar paginação
        const pagination = window.ordersPagination;
        pagination.totalOrders = window.allOrders.length;
        pagination.totalPages = Math.ceil(pagination.totalOrders / pagination.pageSize) || 1;
        pagination.currentPage = 1;
        
        // Atualizar página
        updateOrdersPage();
    });
};
