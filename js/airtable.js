// === airtable.js ===
// Funções para interagir com o Airtable

// Verificar se as dependências necessárias estão disponíveis
function checkDependencies() {
    if (typeof window.airtableBase === 'undefined') {
        console.error('Erro: airtableBase não está definido. Verifique se config.js foi carregado corretamente.');
        return false;
    }
    
    if (typeof window.TABLES === 'undefined') {
        console.error('Erro: TABLES não está definido. Verifique se config.js foi carregado corretamente.');
        return false;
    }
    
    return true;
}

// Função para carregar dados iniciais após autenticação
function loadInitialData() {
    console.log('Carregando dados iniciais...');
    
    // Verificar dependências antes de prosseguir
    if (!checkDependencies()) {
        console.error('Não foi possível carregar dados iniciais devido a dependências ausentes.');
        showToast('Erro ao carregar dados. Recarregue a página.', 'error');
        return;
    }
    
    // Carregar tipos de mapa
    loadMapTypes();
    
    // Carregar pedidos
    loadOrders();
    
    // Carregar clientes
    loadClients();
    
    // Carregar videochamadas
    loadVideoCalls();
    
    // Carregar dados financeiros
    loadFinancialData();
}

// Função para carregar tipos de mapa
function loadMapTypes() {
    console.log('Carregando tipos de mapa...');
    
    // Verificar dependências antes de prosseguir
    if (!checkDependencies()) {
        console.error('Não foi possível carregar tipos de mapa devido a dependências ausentes.');
        return;
    }
    
    window.airtableBase(window.TABLES.MAP_TYPES).select({
        view: 'Grid view'
    }).eachPage(function page(records, fetchNextPage) {
        const mapTypes = records.map(record => ({
            id: record.id,
            name: record.get('Nome'),
            value: record.get('Valor')
        }));
        
        console.log('Tipos de mapa carregados:', mapTypes);
        
        // Armazenar tipos de mapa globalmente
        window.mapTypes = mapTypes;
        
        // Preencher selects de tipos de mapa
        populateMapTypeSelects(mapTypes);
        
        // Atualizar tabela de tipos de mapa
        updateMapTypesTable(mapTypes);
        
        // Buscar próxima página se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar tipos de mapa:', err);
            showToast('Erro ao carregar tipos de mapa', 'error');
        }
    });
}

// Função para carregar pedidos
function loadOrders(filters = {}) {
    console.log('Carregando pedidos...');
    
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
        
        console.log('Pedidos carregados:', orders);
        
        // Atualizar tabela de pedidos
        updateOrdersTable(orders);
        
        // Buscar próxima página se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar pedidos:', err);
            showToast('Erro ao carregar pedidos', 'error');
        }
    });
}

// Função para carregar clientes
function loadClients(search = '') {
    console.log('Carregando clientes...');
    
    // Opções de consulta
    const queryOptions = {
        view: 'Grid view'
    };
    
    if (search) {
        queryOptions.filterByFormula = `OR(FIND('${search.toLowerCase()}', LOWER({Nome})), FIND('${search.toLowerCase()}', LOWER({WhatsApp})))`;
    }
    
    window.airtableBase(window.TABLES.CLIENTS).select(queryOptions).eachPage(function page(records, fetchNextPage) {
        const clients = records.map(record => ({
            id: record.id,
            name: record.get('Nome'),
            whatsapp: record.get('WhatsApp'),
            email: record.get('Email') || '',
            orders: record.get('Pedidos') || []
        }));
        
        console.log('Clientes carregados:', clients);
        
        // Armazenar clientes globalmente
        window.clients = clients;
        
        // Atualizar tabela de clientes
        updateClientsTable(clients);
        
        // Preencher select de clientes para videochamadas
        populateClientSelect(clients);
        
        // Buscar próxima página se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar clientes:', err);
            showToast('Erro ao carregar clientes', 'error');
        }
    });
}

// Função para carregar videochamadas
function loadVideoCalls(month = new Date().getMonth(), year = new Date().getFullYear()) {
    console.log('Carregando videochamadas...');
    
    // Construir datas para filtro
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    window.airtableBase(window.TABLES.VIDEO_CALLS).select({
        view: 'Grid view',
        filterByFormula: `AND(IS_AFTER({Data}, '${startDateStr}'), IS_BEFORE({Data}, '${endDateStr}'))`
    }).eachPage(function page(records, fetchNextPage) {
        const videoCalls = records.map(record => ({
            id: record.id,
            client: record.get('Cliente'),
            date: record.get('Data'),
            time: record.get('Hora'),
            link: record.get('Link') || '',
            notes: record.get('Notas') || ''
        }));
        
        console.log('Videochamadas carregadas:', videoCalls);
        
        // Atualizar calendário e lista de videochamadas
        updateVideoCallsCalendar(videoCalls, month, year);
        updateUpcomingCalls(videoCalls);
        
        // Buscar próxima página se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar videochamadas:', err);
            showToast('Erro ao carregar videochamadas', 'error');
        }
    });
}

// Função para carregar dados financeiros
function loadFinancialData(period = 'mes') {
    console.log('Carregando dados financeiros...');
    
    // Construir filtro baseado no período
    let filterByFormula = '';
    const today = new Date();
    
    switch (period) {
        case 'mes':
            // Este mês
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            filterByFormula = `IS_AFTER({Data de Criação}, '${startOfMonth.toISOString()}')`;
            break;
        case 'trimestre':
            // Último trimestre (3 meses)
            const startOfQuarter = new Date(today);
            startOfQuarter.setMonth(today.getMonth() - 3);
            filterByFormula = `IS_AFTER({Data de Criação}, '${startOfQuarter.toISOString()}')`;
            break;
        case 'ano':
            // Este ano
            const startOfYear = new Date(today.getFullYear(), 0, 1);
            filterByFormula = `IS_AFTER({Data de Criação}, '${startOfYear.toISOString()}')`;
            break;
        case 'total':
            // Todos os registros
            filterByFormula = '';
            break;
    }
    
    // Opções de consulta
    const queryOptions = {
        view: 'Grid view'
    };
    
    if (filterByFormula) {
        queryOptions.filterByFormula = filterByFormula;
    }
    
    window.airtableBase(window.TABLES.ORDERS).select(queryOptions).eachPage(function page(records, fetchNextPage) {
        const orders = records.map(record => ({
            id: record.id,
            clientName: record.get('Nome do Cliente'),
            mapType: record.get('Tipo de Mapa'),
            responsavel: record.get('Responsável'),
            status: record.get('Status'),
            createdAt: record.get('Data de Criação')
        }));
        
        console.log('Dados financeiros carregados:', orders);
        
        // Processar dados financeiros
        processFinancialData(orders);
        
        // Buscar próxima página se houver
        fetchNextPage();
    }, function done(err) {
        if (err) {
            console.error('Erro ao carregar dados financeiros:', err);
            showToast('Erro ao carregar dados financeiros', 'error');
        }
    });
}

// Função para criar novo pedido
function createOrder(orderData) {
    console.log('Criando novo pedido:', orderData);
    
    window.airtableBase(window.TABLES.ORDERS).create([
        {
            fields: {
                'Nome do Cliente': orderData.clientName,
                'WhatsApp': orderData.whatsapp,
                'Data Nascimento': orderData.birthDate,
                'Hora Nascimento': orderData.birthTime,
                'Local': orderData.birthPlace,
                'Tipo de Mapa': orderData.mapType,
                'Responsável': orderData.responsavel,
                'Status': orderData.status,
                'Requer Videochamada': orderData.requiresVideoCall
            }
        }
    ], function(err, records) {
        if (err) {
            console.error('Erro ao criar pedido:', err);
            showToast('Erro ao criar pedido', 'error');
            return;
        }
        
        console.log('Pedido criado com sucesso:', records[0].getId());
        showToast('Pedido criado com sucesso!', 'success');
        
        // Verificar se o cliente já existe
        checkAndCreateClient(orderData.clientName, orderData.whatsapp, orderData.email || '');
        
        // Recarregar pedidos
        loadOrders();
    });
}

// Função para atualizar pedido existente
function updateOrder(orderId, orderData) {
    console.log('Atualizando pedido:', orderId, orderData);
    
    window.airtableBase(window.TABLES.ORDERS).update([
        {
            id: orderId,
            fields: {
                'Nome do Cliente': orderData.clientName,
                'WhatsApp': orderData.whatsapp,
                'Data Nascimento': orderData.birthDate,
                'Hora Nascimento': orderData.birthTime,
                'Local': orderData.birthPlace,
                'Tipo de Mapa': orderData.mapType,
                'Responsável': orderData.responsavel,
                'Status': orderData.status,
                'Requer Videochamada': orderData.requiresVideoCall
            }
        }
    ], function(err, records) {
        if (err) {
            console.error('Erro ao atualizar pedido:', err);
            showToast('Erro ao atualizar pedido', 'error');
            return;
        }
        
        console.log('Pedido atualizado com sucesso:', records[0].getId());
        showToast('Pedido atualizado com sucesso!', 'success');
        
        // Recarregar pedidos
        loadOrders();
    });
}

// Função para excluir pedido
function deleteOrder(orderId) {
    console.log('Excluindo pedido:', orderId);
    
    window.airtableBase(window.TABLES.ORDERS).destroy([orderId], function(err, deletedRecords) {
        if (err) {
            console.error('Erro ao excluir pedido:', err);
            showToast('Erro ao excluir pedido', 'error');
            return;
        }
        
        console.log('Pedido excluído com sucesso:', deletedRecords[0].id);
        showToast('Pedido excluído com sucesso!', 'success');
        
        // Recarregar pedidos
        loadOrders();
    });
}

// Função para verificar se cliente existe e criar se necessário
function checkAndCreateClient(name, whatsapp, email = '') {
    console.log('Verificando cliente:', name, whatsapp);
    
    window.airtableBase(window.TABLES.CLIENTS).select({
        filterByFormula: `{WhatsApp} = '${whatsapp}'`
    }).firstPage(function(err, records) {
        if (err) {
            console.error('Erro ao verificar cliente:', err);
            return;
        }
        
        if (records.length === 0) {
            // Cliente não existe, criar novo
            createClient({name, whatsapp, email});
        } else {
            console.log('Cliente já existe:', records[0].getId());
        }
    });
}

// Função para criar novo cliente
function createClient(clientData) {
    console.log('Criando novo cliente:', clientData);
    
    window.airtableBase(window.TABLES.CLIENTS).create([
        {
            fields: {
                'Nome': clientData.name,
                'WhatsApp': clientData.whatsapp,
                'Email': clientData.email || ''
            }
        }
    ], function(err, records) {
        if (err) {
            console.error('Erro ao criar cliente:', err);
            showToast('Erro ao criar cliente', 'error');
            return;
        }
        
        console.log('Cliente criado com sucesso:', records[0].getId());
        showToast('Cliente criado com sucesso!', 'success');
        
        // Recarregar clientes
        loadClients();
    });
}

// Função para atualizar cliente existente
function updateClient(clientId, clientData) {
    console.log('Atualizando cliente:', clientId, clientData);
    
    window.airtableBase(window.TABLES.CLIENTS).update([
        {
            id: clientId,
            fields: {
                'Nome': clientData.name,
                'WhatsApp': clientData.whatsapp,
                'Email': clientData.email || ''
            }
        }
    ], function(err, records) {
        if (err) {
            console.error('Erro ao atualizar cliente:', err);
            showToast('Erro ao atualizar cliente', 'error');
            return;
        }
        
        console.log('Cliente atualizado com sucesso:', records[0].getId());
        showToast('Cliente atualizado com sucesso!', 'success');
        
        // Recarregar clientes
        loadClients();
    });
}

// Função para excluir cliente
function deleteClient(clientId) {
    console.log('Excluindo cliente:', clientId);
    
    window.airtableBase(window.TABLES.CLIENTS).destroy([clientId], function(err, deletedRecords) {
        if (err) {
            console.error('Erro ao excluir cliente:', err);
            showToast('Erro ao excluir cliente', 'error');
            return;
        }
        
        console.log('Cliente excluído com sucesso:', deletedRecords[0].id);
        showToast('Cliente excluído com sucesso!', 'success');
        
        // Recarregar clientes
        loadClients();
    });
}

// Função para criar nova videochamada
function createVideoCall(videoCallData) {
    console.log('Criando nova videochamada:', videoCallData);
    
    window.airtableBase(window.TABLES.VIDEO_CALLS).create([
        {
            fields: {
                'Cliente': videoCallData.client,
                'Data': videoCallData.date,
                'Hora': videoCallData.time,
                'Link': videoCallData.link || '',
                'Notas': videoCallData.notes || ''
            }
        }
    ], function(err, records) {
        if (err) {
            console.error('Erro ao criar videochamada:', err);
            showToast('Erro ao criar videochamada', 'error');
            return;
        }
        
        console.log('Videochamada criada com sucesso:', records[0].getId());
        showToast('Videochamada criada com sucesso!', 'success');
        
        // Recarregar videochamadas
        const date = new Date(videoCallData.date);
        loadVideoCalls(date.getMonth(), date.getFullYear());
    });
}

// Função para atualizar videochamada existente
function updateVideoCall(videoCallId, videoCallData) {
    console.log('Atualizando videochamada:', videoCallId, videoCallData);
    
    window.airtableBase(window.TABLES.VIDEO_CALLS).update([
        {
            id: videoCallId,
            fields: {
                'Cliente': videoCallData.client,
                'Data': videoCallData.date,
                'Hora': videoCallData.time,
                'Link': videoCallData.link || '',
                'Notas': videoCallData.notes || ''
            }
        }
    ], function(err, records) {
        if (err) {
            console.error('Erro ao atualizar videochamada:', err);
            showToast('Erro ao atualizar videochamada', 'error');
            return;
        }
        
        console.log('Videochamada atualizada com sucesso:', records[0].getId());
        showToast('Videochamada atualizada com sucesso!', 'success');
        
        // Recarregar videochamadas
        const date = new Date(videoCallData.date);
        loadVideoCalls(date.getMonth(), date.getFullYear());
    });
}

// Função para excluir videochamada
function deleteVideoCall(videoCallId) {
    console.log('Excluindo videochamada:', videoCallId);
    
    window.airtableBase(window.TABLES.VIDEO_CALLS).destroy([videoCallId], function(err, deletedRecords) {
        if (err) {
            console.error('Erro ao excluir videochamada:', err);
            showToast('Erro ao excluir videochamada', 'error');
            return;
        }
        
        console.log('Videochamada excluída com sucesso:', deletedRecords[0].id);
        showToast('Videochamada excluída com sucesso!', 'success');
        
        // Recarregar videochamadas
        const today = new Date();
        loadVideoCalls(today.getMonth(), today.getFullYear());
    });
}

// Função para criar novo tipo de mapa
function createMapType(mapTypeData) {
    console.log('Criando novo tipo de mapa:', mapTypeData);
    
    window.airtableBase(window.TABLES.MAP_TYPES).create([
        {
            fields: {
                'Nome': mapTypeData.name,
                'Valor': mapTypeData.value
            }
        }
    ], function(err, records) {
        if (err) {
            console.error('Erro ao criar tipo de mapa:', err);
            showToast('Erro ao criar tipo de mapa', 'error');
            return;
        }
        
        console.log('Tipo de mapa criado com sucesso:', records[0].getId());
        showToast('Tipo de mapa criado com sucesso!', 'success');
        
        // Recarregar tipos de mapa
        loadMapTypes();
    });
}

// Função para atualizar tipo de mapa existente
function updateMapType(mapTypeId, mapTypeData) {
    console.log('Atualizando tipo de mapa:', mapTypeId, mapTypeData);
    
    window.airtableBase(window.TABLES.MAP_TYPES).update([
        {
            id: mapTypeId,
            fields: {
                'Nome': mapTypeData.name,
                'Valor': mapTypeData.value
            }
        }
    ], function(err, records) {
        if (err) {
            console.error('Erro ao atualizar tipo de mapa:', err);
            showToast('Erro ao atualizar tipo de mapa', 'error');
            return;
        }
        
        console.log('Tipo de mapa atualizado com sucesso:', records[0].getId());
        showToast('Tipo de mapa atualizado com sucesso!', 'success');
        
        // Recarregar tipos de mapa
        loadMapTypes();
    });
}

// Função para excluir tipo de mapa
function deleteMapType(mapTypeId) {
    console.log('Excluindo tipo de mapa:', mapTypeId);
    
    window.airtableBase(window.TABLES.MAP_TYPES).destroy([mapTypeId], function(err, deletedRecords) {
        if (err) {
            console.error('Erro ao excluir tipo de mapa:', err);
            showToast('Erro ao excluir tipo de mapa', 'error');
            return;
        }
        
        console.log('Tipo de mapa excluído com sucesso:', deletedRecords[0].id);
        showToast('Tipo de mapa excluído com sucesso!', 'success');
        
        // Recarregar tipos de mapa
        loadMapTypes();
    });
}

// Função para exportar pedidos para CSV
function exportOrdersToCSV(orders) {
    console.log('Exportando pedidos para CSV...');
    
    // Cabeçalhos do CSV
    const headers = [
        'Nome do Cliente',
        'WhatsApp',
        'Data Nascimento',
        'Hora Nascimento',
        'Local',
        'Tipo de Mapa',
        'Responsável',
        'Status',
        'Requer Videochamada'
    ];
    
    // Linhas do CSV
    const rows = orders.map(order => [
        order.clientName,
        order.whatsapp,
        order.birthDate,
        order.birthTime,
        order.birthPlace,
        order.mapType,
        order.responsavel,
        order.status,
        order.requiresVideoCall ? 'Sim' : 'Não'
    ]);
    
    // Montar CSV
    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Criar blob e link para download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
