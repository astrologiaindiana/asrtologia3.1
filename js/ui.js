// === ui.js ===
// Funções para manipulação da interface do usuário

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar navegação do menu lateral
    initSidebarNavigation();
    
    // Inicializar modais
    initModals();
    
    // Inicializar eventos de filtros
    initFilters();
    
    // Inicializar eventos de busca
    initSearch();
});

// Função para inicializar navegação do menu lateral
function initSidebarNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remover classe 'active' de todos os itens
            menuItems.forEach(i => i.classList.remove('active'));
            
            // Adicionar classe 'active' ao item clicado
            this.classList.add('active');
            
            // Obter seção a ser exibida
            const sectionId = this.getAttribute('data-section');
            
            // Esconder todas as seções
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Exibir seção correspondente
            document.getElementById(`${sectionId}-section`).classList.add('active');
        });
    });
}

// Função para inicializar modais
function initModals() {
    // Botões para abrir modais
    document.querySelectorAll('[data-modal]').forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });
    
    // Botões para fechar modais
    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Fechar modal ao clicar no overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
}

// Função para abrir modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

// Função para fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        
        // Resetar formulário se existir
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Função para inicializar filtros
function initFilters() {
    // Filtros de pedidos
    const filterStatus = document.getElementById('filter-status');
    const filterResponsavel = document.getElementById('filter-responsavel');
    const filterTipoMapa = document.getElementById('filter-tipo-mapa');
    
    if (filterStatus && filterResponsavel && filterTipoMapa) {
        [filterStatus, filterResponsavel, filterTipoMapa].forEach(filter => {
            filter.addEventListener('change', function() {
                applyOrdersFilters();
            });
        });
    }
    
    // Filtro de período financeiro
    const periodoFinanceiro = document.getElementById('periodo-financeiro');
    if (periodoFinanceiro) {
        periodoFinanceiro.addEventListener('change', function() {
            loadFinancialData(this.value);
        });
    }
}

// Função para aplicar filtros de pedidos
function applyOrdersFilters() {
    const status = document.getElementById('filter-status').value;
    const responsavel = document.getElementById('filter-responsavel').value;
    const tipoMapa = document.getElementById('filter-tipo-mapa').value;
    const search = document.getElementById('pedidos-search').value;
    
    loadOrders({
        status: status,
        responsavel: responsavel,
        tipoMapa: tipoMapa,
        search: search
    });
}

// Função para inicializar eventos de busca
function initSearch() {
    // Busca de pedidos
    const pedidosSearch = document.getElementById('pedidos-search');
    if (pedidosSearch) {
        pedidosSearch.addEventListener('input', debounce(function() {
            applyOrdersFilters();
        }, 500));
    }
    
    // Busca de clientes
    const clientesSearch = document.getElementById('clientes-search');
    if (clientesSearch) {
        clientesSearch.addEventListener('input', debounce(function() {
            loadClients(this.value);
        }, 500));
    }
}

// Função para preencher selects de tipos de mapa
function populateMapTypeSelects(mapTypes) {
    // Selects de tipo de mapa
    const selects = [
        document.getElementById('tipo-mapa'),
        document.getElementById('edit-tipo-mapa'),
        document.getElementById('filter-tipo-mapa')
    ];
    
    selects.forEach(select => {
        if (select) {
            // Limpar opções existentes, mantendo a primeira (se for filtro)
            while (select.options.length > (select.id === 'filter-tipo-mapa' ? 1 : 0)) {
                select.remove(select.options.length - 1);
            }
            
            // Adicionar opções
            mapTypes.forEach(mapType => {
                const option = document.createElement('option');
                option.value = mapType.name;
                option.textContent = `${mapType.name} (${formatCurrency(mapType.value)})`;
                select.appendChild(option);
            });
        }
    });
}

// Função para preencher select de clientes
function populateClientSelect(clients) {
    const select = document.getElementById('videochamada-cliente');
    
    if (select) {
        // Limpar opções existentes
        while (select.options.length > 0) {
            select.remove(0);
        }
        
        // Adicionar opções
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.name;
            option.textContent = client.name;
            select.appendChild(option);
        });
    }
}

// Função para atualizar tabela de pedidos
function updateOrdersTable(orders) {
    const tableBody = document.querySelector('#pedidos-table tbody');
    
    if (tableBody) {
        // Limpar tabela
        tableBody.innerHTML = '';
        
        if (orders.length === 0) {
            // Exibir mensagem de nenhum pedido
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 7;
            cell.textContent = 'Nenhum pedido encontrado.';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }
        
        // Preencher tabela com pedidos
        orders.forEach(order => {
            const row = document.createElement('tr');
            
            // Nome do Cliente
            const nameCell = document.createElement('td');
            nameCell.textContent = order.clientName;
            row.appendChild(nameCell);
            
            // WhatsApp
            const whatsappCell = document.createElement('td');
            whatsappCell.textContent = order.whatsapp;
            row.appendChild(whatsappCell);
            
            // Tipo de Mapa
            const mapTypeCell = document.createElement('td');
            mapTypeCell.textContent = order.mapType;
            row.appendChild(mapTypeCell);
            
            // Responsável
            const responsavelCell = document.createElement('td');
            responsavelCell.textContent = order.responsavel;
            row.appendChild(responsavelCell);
            
            // Status
            const statusCell = document.createElement('td');
            const statusBadge = document.createElement('span');
            statusBadge.className = 'status-badge';
            statusBadge.classList.add(order.status.toLowerCase().replace(' ', '-'));
            statusBadge.textContent = order.status;
            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);
            
            // Videochamada
            const videochamadaCell = document.createElement('td');
            videochamadaCell.textContent = order.requiresVideoCall ? 'Sim' : 'Não';
            row.appendChild(videochamadaCell);
            
            // Ações
            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions';
            
            // Botão Editar
            const editButton = document.createElement('button');
            editButton.className = 'action-btn edit';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', function() {
                openEditOrderModal(order);
            });
            actionsCell.appendChild(editButton);
            
            // Botão Excluir
            const deleteButton = document.createElement('button');
            deleteButton.className = 'action-btn delete';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', function() {
                confirmAction(`Deseja realmente excluir o pedido de ${order.clientName}?`, function() {
                    deleteOrder(order.id);
                });
            });
            actionsCell.appendChild(deleteButton);
            
            row.appendChild(actionsCell);
            
            tableBody.appendChild(row);
        });
    }
}

// Função para abrir modal de edição de pedido
function openEditOrderModal(order) {
    // Preencher formulário com dados do pedido
    document.getElementById('pedido-id').value = order.id;
    document.getElementById('edit-cliente-nome').value = order.clientName;
    document.getElementById('edit-cliente-whatsapp').value = order.whatsapp;
    document.getElementById('edit-data-nascimento').value = order.birthDate;
    document.getElementById('edit-hora-nascimento').value = order.birthTime;
    document.getElementById('edit-local-nascimento').value = order.birthPlace;
    document.getElementById('edit-tipo-mapa').value = order.mapType;
    document.getElementById('edit-responsavel').value = order.responsavel;
    document.getElementById('edit-status').value = order.status;
    document.getElementById('edit-requer-videochamada').checked = order.requiresVideoCall;
    
    // Abrir modal
    openModal('pedido-modal');
}

// Função para atualizar tabela de clientes
function updateClientsTable(clients) {
    const tableBody = document.querySelector('#clientes-table tbody');
    
    if (tableBody) {
        // Limpar tabela
        tableBody.innerHTML = '';
        
        if (clients.length === 0) {
            // Exibir mensagem de nenhum cliente
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 5;
            cell.textContent = 'Nenhum cliente encontrado.';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }
        
        // Preencher tabela com clientes
        clients.forEach(client => {
            const row = document.createElement('tr');
            
            // Nome
            const nameCell = document.createElement('td');
            nameCell.textContent = client.name;
            row.appendChild(nameCell);
            
            // WhatsApp
            const whatsappCell = document.createElement('td');
            whatsappCell.textContent = client.whatsapp;
            row.appendChild(whatsappCell);
            
            // E-mail
            const emailCell = document.createElement('td');
            emailCell.textContent = client.email || '-';
            row.appendChild(emailCell);
            
            // Pedidos
            const pedidosCell = document.createElement('td');
            pedidosCell.textContent = client.orders ? client.orders.length : 0;
            row.appendChild(pedidosCell);
            
            // Ações
            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions';
            
            // Botão Editar
            const editButton = document.createElement('button');
            editButton.className = 'action-btn edit';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', function() {
                openEditClientModal(client);
            });
            actionsCell.appendChild(editButton);
            
            // Botão Excluir
            const deleteButton = document.createElement('button');
            deleteButton.className = 'action-btn delete';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', function() {
                confirmAction(`Deseja realmente excluir o cliente ${client.name}?`, function() {
                    deleteClient(client.id);
                });
            });
            actionsCell.appendChild(deleteButton);
            
            row.appendChild(actionsCell);
            
            tableBody.appendChild(row);
        });
    }
}

// Função para abrir modal de edição de cliente
function openEditClientModal(client) {
    // Atualizar título do modal
    document.getElementById('cliente-modal-title').textContent = 'Editar Cliente';
    
    // Preencher formulário com dados do cliente
    document.getElementById('cliente-id').value = client.id;
    document.getElementById('edit-nome').value = client.name;
    document.getElementById('edit-whatsapp').value = client.whatsapp;
    document.getElementById('edit-email').value = client.email || '';
    
    // Abrir modal
    openModal('cliente-modal');
}

// Função para abrir modal de novo cliente
function openNewClientModal() {
    // Atualizar título do modal
    document.getElementById('cliente-modal-title').textContent = 'Novo Cliente';
    
    // Limpar formulário
    document.getElementById('cliente-id').value = '';
    document.getElementById('edit-cliente-form').reset();
    
    // Abrir modal
    openModal('cliente-modal');
}

// Função para atualizar tabela de tipos de mapa
function updateMapTypesTable(mapTypes) {
    const tableBody = document.querySelector('#tipos-mapa-table tbody');
    
    if (tableBody) {
        // Limpar tabela
        tableBody.innerHTML = '';
        
        if (mapTypes.length === 0) {
            // Exibir mensagem de nenhum tipo de mapa
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 3;
            cell.textContent = 'Nenhum tipo de mapa encontrado.';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            tableBody.appendChild(row);
            return;
        }
        
        // Preencher tabela com tipos de mapa
        mapTypes.forEach(mapType => {
            const row = document.createElement('tr');
            
            // Nome
            const nameCell = document.createElement('td');
            nameCell.textContent = mapType.name;
            row.appendChild(nameCell);
            
            // Valor
            const valueCell = document.createElement('td');
            valueCell.textContent = formatCurrency(mapType.value);
            row.appendChild(valueCell);
            
            // Ações
            const actionsCell = document.createElement('td');
            actionsCell.className = 'actions';
            
            // Botão Editar
            const editButton = document.createElement('button');
            editButton.className = 'action-btn edit';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', function() {
                openEditMapTypeModal(mapType);
            });
            actionsCell.appendChild(editButton);
            
            // Botão Excluir
            const deleteButton = document.createElement('button');
            deleteButton.className = 'action-btn delete';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', function() {
                confirmAction(`Deseja realmente excluir o tipo de mapa ${mapType.name}?`, function() {
                    deleteMapType(mapType.id);
                });
            });
            actionsCell.appendChild(deleteButton);
            
            row.appendChild(actionsCell);
            
            tableBody.appendChild(row);
        });
    }
}

// Função para abrir modal de edição de tipo de mapa
function openEditMapTypeModal(mapType) {
    // Atualizar título do modal
    document.getElementById('tipo-mapa-modal-title').textContent = 'Editar Tipo de Mapa';
    
    // Preencher formulário com dados do tipo de mapa
    document.getElementById('tipo-mapa-id').value = mapType.id;
    document.getElementById('map-type-name').value = mapType.name;
    document.getElementById('map-type-value').value = mapType.value;
    
    // Abrir modal
    openModal('tipo-mapa-modal');
}

// Função para abrir modal de novo tipo de mapa
function openNewMapTypeModal() {
    // Atualizar título do modal
    document.getElementById('tipo-mapa-modal-title').textContent = 'Novo Tipo de Mapa';
    
    // Limpar formulário
    document.getElementById('tipo-mapa-id').value = '';
    document.getElementById('edit-tipo-mapa-form').reset();
    
    // Abrir modal
    openModal('tipo-mapa-modal');
}

// Função para atualizar calendário de videochamadas
function updateVideoCallsCalendar(videoCalls, month, year) {
    // Atualizar título do mês
    document.getElementById('current-month').textContent = `${getMonthName(month)} ${year}`;
    
    // Gerar dias do calendário
    const calendarDays = generateCalendar(month, year);
    
    // Adicionar eventos ao calendário
    videoCalls.forEach(call => {
        const callDate = new Date(call.date);
        
        // Encontrar o dia correspondente no calendário
        const calendarDay = calendarDays.find(day => 
            day.day === callDate.getDate() && 
            day.month === callDate.getMonth() && 
            day.year === callDate.getFullYear()
        );
        
        if (calendarDay) {
            calendarDay.events.push({
                id: call.id,
                title: call.client,
                time: call.time
            });
        }
    });
    
    // Renderizar calendário
    const calendarContainer = document.getElementById('calendar-days');
    calendarContainer.innerHTML = '';
    
    calendarDays.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (!day.isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (day.isToday) {
            dayElement.classList.add('today');
        }
        
        // Número do dia
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day.day;
        dayElement.appendChild(dayNumber);
        
        // Eventos do dia
        if (day.events.length > 0) {
            const eventsContainer = document.createElement('div');
            eventsContainer.className = 'events';
            
            day.events.forEach(event => {
                const eventElement = document.createElement('div');
                eventElement.className = 'event';
                eventElement.textContent = `${event.time} - ${event.title}`;
                eventElement.setAttribute('data-id', event.id);
                eventElement.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const callId = this.getAttribute('data-id');
                    const call = videoCalls.find(c => c.id === callId);
                    if (call) {
                        openEditVideoCallModal(call);
                    }
                });
                eventsContainer.appendChild(eventElement);
            });
            
            dayElement.appendChild(eventsContainer);
        }
        
        // Adicionar evento de clique para adicionar nova videochamada
        dayElement.addEventListener('click', function() {
            if (day.isCurrentMonth) {
                openNewVideoCallModal(day.year, day.month, day.day);
            }
        });
        
        calendarContainer.appendChild(dayElement);
    });
    
    // Configurar botões de navegação
    document.getElementById('prev-month').onclick = function() {
        let newMonth = month - 1;
        let newYear = year;
        
        if (newMonth < 0) {
            newMonth = 11;
            newYear--;
        }
        
        loadVideoCalls(newMonth, newYear);
    };
    
    document.getElementById('next-month').onclick = function() {
        let newMonth = month + 1;
        let newYear = year;
        
        if (newMonth > 11) {
            newMonth = 0;
            newYear++;
        }
        
        loadVideoCalls(newMonth, newYear);
    };
}

// Função para atualizar lista de próximas videochamadas
function updateUpcomingCalls(videoCalls) {
    const callsList = document.getElementById('upcoming-calls-list');
    
    if (callsList) {
        // Limpar lista
        callsList.innerHTML = '';
        
        // Filtrar chamadas futuras
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingCalls = videoCalls.filter(call => {
            const callDate = new Date(call.date);
            callDate.setHours(0, 0, 0, 0);
            return callDate >= today;
        }).sort((a, b) => {
            // Ordenar por data e hora
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        }).slice(0, 5); // Limitar a 5 chamadas
        
        if (upcomingCalls.length === 0) {
            // Exibir mensagem de nenhuma chamada
            const noCallsMessage = document.createElement('div');
            noCallsMessage.textContent = 'Nenhuma videochamada agendada.';
            noCallsMessage.style.textAlign = 'center';
            noCallsMessage.style.padding = '1rem';
            callsList.appendChild(noCallsMessage);
            return;
        }
        
        // Preencher lista com chamadas
        upcomingCalls.forEach(call => {
            const callItem = document.createElement('div');
            callItem.className = 'call-item';
            
            // Informações da chamada
            const callInfo = document.createElement('div');
            callInfo.className = 'call-info';
            
            const callClient = document.createElement('div');
            callClient.className = 'call-client';
            callClient.textContent = call.client;
            callInfo.appendChild(callClient);
            
            const callDatetime = document.createElement('div');
            callDatetime.className = 'call-datetime';
            callDatetime.textContent = `${formatDate(call.date)} às ${call.time}`;
            callInfo.appendChild(callDatetime);
            
            callItem.appendChild(callInfo);
            
            // Ações
            const callActions = document.createElement('div');
            callActions.className = 'call-actions';
            
            // Botão Editar
            const editButton = document.createElement('button');
            editButton.className = 'action-btn edit';
            editButton.innerHTML = '<i class="fas fa-edit"></i>';
            editButton.addEventListener('click', function() {
                openEditVideoCallModal(call);
            });
            callActions.appendChild(editButton);
            
            // Botão Excluir
            const deleteButton = document.createElement('button');
            deleteButton.className = 'action-btn delete';
            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteButton.addEventListener('click', function() {
                confirmAction(`Deseja realmente excluir a videochamada com ${call.client}?`, function() {
                    deleteVideoCall(call.id);
                });
            });
            callActions.appendChild(deleteButton);
            
            callItem.appendChild(callActions);
            
            callsList.appendChild(callItem);
        });
    }
}

// Função para abrir modal de edição de videochamada
function openEditVideoCallModal(call) {
    // Atualizar título do modal
    document.getElementById('videochamada-modal-title').textContent = 'Editar Videochamada';
    
    // Preencher formulário com dados da videochamada
    document.getElementById('videochamada-id').value = call.id;
    document.getElementById('videochamada-cliente').value = call.client;
    document.getElementById('videochamada-data').value = call.date;
    document.getElementById('videochamada-hora').value = call.time;
    document.getElementById('videochamada-link').value = call.link || '';
    document.getElementById('videochamada-notas').value = call.notes || '';
    
    // Abrir modal
    openModal('videochamada-modal');
}

// Função para abrir modal de nova videochamada
function openNewVideoCallModal(year, month, day) {
    // Atualizar título do modal
    document.getElementById('videochamada-modal-title').textContent = 'Nova Videochamada';
    
    // Limpar formulário
    document.getElementById('videochamada-id').value = '';
    document.getElementById('edit-videochamada-form').reset();
    
    // Preencher data se fornecida
    if (year !== undefined && month !== undefined && day !== undefined) {
        const date = new Date(year, month, day);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('videochamada-data').value = formattedDate;
    }
    
    // Abrir modal
    openModal('videochamada-modal');
}

// Função para debounce (limitar frequência de execução)
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}
