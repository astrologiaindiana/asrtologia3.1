// === mock-data.js ===
// Dados de teste para a aplicação

// Verificar se as dependências necessárias estão disponíveis
function checkMockDependencies() {
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

// Função para criar dados de teste
function createMockData() {
    console.log('Criando dados de teste...');
    
    // Verificar dependências antes de prosseguir
    if (!checkMockDependencies()) {
        console.error('Não foi possível criar dados de teste devido a dependências ausentes.');
        alert('Erro ao criar dados de teste. Verifique o console para mais detalhes.');
        return;
    }
    
    try {
        // Criar tipos de mapa
        createMockMapTypes();
        
        // Criar clientes
        createMockClients();
        
        // Criar pedidos
        createMockOrders();
        
        // Criar videochamadas
        createMockVideoCalls();
        
        alert('Dados de teste criados com sucesso! Recarregue a página para ver os resultados.');
    } catch (e) {
        console.error('Erro ao criar dados de teste:', e);
        alert('Erro ao criar dados de teste: ' + e.message);
    }
}

// Função para criar tipos de mapa de teste
function createMockMapTypes() {
    console.log('Criando tipos de mapa de teste...');
    
    const mapTypes = [
        { name: 'Mapa Natal', value: 250 },
        { name: 'Mapa Sinastria', value: 350 },
        { name: 'Mapa Trânsitos', value: 200 },
        { name: 'Mapa Progresso', value: 300 },
        { name: 'Consulta Completa', value: 500 }
    ];
    
    // Verificar se airtableBase é um objeto ou uma função
    if (typeof window.airtableBase === 'function') {
        // Versão antiga da API Airtable
        mapTypes.forEach(mapType => {
            window.airtableBase(window.TABLES.MAP_TYPES).create([
                {
                    fields: {
                        'Nome': mapType.name,
                        'Valor': mapType.value
                    }
                }
            ], function(err, records) {
                if (err) {
                    console.error('Erro ao criar tipo de mapa de teste:', err);
                    return;
                }
                
                console.log('Tipo de mapa de teste criado:', records[0].getId());
            });
        });
    } else if (typeof window.airtableBase === 'object') {
        // Versão nova da API Airtable
        mapTypes.forEach(mapType => {
            window.airtableBase.table(window.TABLES.MAP_TYPES).create([
                {
                    fields: {
                        'Nome': mapType.name,
                        'Valor': mapType.value
                    }
                }
            ]).then(records => {
                console.log('Tipo de mapa de teste criado:', records[0].id);
            }).catch(err => {
                console.error('Erro ao criar tipo de mapa de teste:', err);
            });
        });
    } else {
        console.error('Formato de airtableBase desconhecido:', typeof window.airtableBase);
        throw new Error('Formato de airtableBase desconhecido: ' + typeof window.airtableBase);
    }
}

// Função para criar clientes de teste
function createMockClients() {
    console.log('Criando clientes de teste...');
    
    const clients = [
        { name: 'Maria Silva', whatsapp: '+5511987654321', email: 'maria@email.com' },
        { name: 'João Santos', whatsapp: '+5511976543210', email: 'joao@email.com' },
        { name: 'Ana Oliveira', whatsapp: '+5511965432109', email: 'ana@email.com' },
        { name: 'Pedro Costa', whatsapp: '+5511954321098', email: 'pedro@email.com' },
        { name: 'Carla Souza', whatsapp: '+5511943210987', email: 'carla@email.com' }
    ];
    
    clients.forEach(client => {
        window.airtableBase(window.TABLES.CLIENTS).create([
            {
                fields: {
                    'Nome': client.name,
                    'WhatsApp': client.whatsapp,
                    'Email': client.email
                }
            }
        ], function(err, records) {
            if (err) {
                console.error('Erro ao criar cliente de teste:', err);
                return;
            }
            
            console.log('Cliente de teste criado:', records[0].getId());
        });
    });
}

// Função para criar pedidos de teste
function createMockOrders() {
    console.log('Criando pedidos de teste...');
    
    const orders = [
        {
            clientName: 'Maria Silva',
            whatsapp: '+5511987654321',
            birthDate: '1985-05-15',
            birthTime: '14:30',
            birthPlace: 'São Paulo, SP',
            mapType: 'Mapa Natal',
            responsavel: 'Conrado',
            status: 'Concluído',
            requiresVideoCall: true,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias atrás
        },
        {
            clientName: 'João Santos',
            whatsapp: '+5511976543210',
            birthDate: '1990-08-22',
            birthTime: '08:15',
            birthPlace: 'Rio de Janeiro, RJ',
            mapType: 'Mapa Sinastria',
            responsavel: 'Kavi',
            status: 'Em andamento',
            requiresVideoCall: true,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15 dias atrás
        },
        {
            clientName: 'Ana Oliveira',
            whatsapp: '+5511965432109',
            birthDate: '1988-12-10',
            birthTime: '22:45',
            birthPlace: 'Belo Horizonte, MG',
            mapType: 'Mapa Trânsitos',
            responsavel: 'Conrado',
            status: 'Aguardando',
            requiresVideoCall: false,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias atrás
        },
        {
            clientName: 'Pedro Costa',
            whatsapp: '+5511954321098',
            birthDate: '1982-03-28',
            birthTime: '10:20',
            birthPlace: 'Salvador, BA',
            mapType: 'Mapa Progresso',
            responsavel: 'Kavi',
            status: 'Concluído',
            requiresVideoCall: false,
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString() // 45 dias atrás
        },
        {
            clientName: 'Carla Souza',
            whatsapp: '+5511943210987',
            birthDate: '1995-07-03',
            birthTime: '16:50',
            birthPlace: 'Curitiba, PR',
            mapType: 'Consulta Completa',
            responsavel: 'Conrado',
            status: 'Em andamento',
            requiresVideoCall: true,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias atrás
        }
    ];
    
    orders.forEach(order => {
        window.airtableBase(window.TABLES.ORDERS).create([
            {
                fields: {
                    'Nome do Cliente': order.clientName,
                    'WhatsApp': order.whatsapp,
                    'Data Nascimento': order.birthDate,
                    'Hora Nascimento': order.birthTime,
                    'Local': order.birthPlace,
                    'Tipo de Mapa': order.mapType,
                    'Responsável': order.responsavel,
                    'Status': order.status,
                    'Requer Videochamada': order.requiresVideoCall,
                    'Data de Criação': order.createdAt
                }
            }
        ], function(err, records) {
            if (err) {
                console.error('Erro ao criar pedido de teste:', err);
                return;
            }
            
            console.log('Pedido de teste criado:', records[0].getId());
        });
    });
}

// Função para criar videochamadas de teste
function createMockVideoCalls() {
    console.log('Criando videochamadas de teste...');
    
    const today = new Date();
    const videoCalls = [
        {
            client: 'Maria Silva',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0],
            time: '14:00',
            link: 'https://meet.google.com/abc-defg-hij',
            notes: 'Primeira consulta após mapa natal'
        },
        {
            client: 'João Santos',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0],
            time: '10:30',
            link: 'https://meet.google.com/jkl-mnop-qrs',
            notes: 'Dúvidas sobre sinastria'
        },
        {
            client: 'Carla Souza',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0],
            time: '16:00',
            link: 'https://meet.google.com/tuv-wxyz-123',
            notes: 'Consulta completa - primeira parte'
        }
    ];
    
    videoCalls.forEach(call => {
        window.airtableBase(window.TABLES.VIDEO_CALLS).create([
            {
                fields: {
                    'Cliente': call.client,
                    'Data': call.date,
                    'Hora': call.time,
                    'Link': call.link,
                    'Notas': call.notes
                }
            }
        ], function(err, records) {
            if (err) {
                console.error('Erro ao criar videochamada de teste:', err);
                return;
            }
            
            console.log('Videochamada de teste criada:', records[0].getId());
        });
    });
}

// Exportar função para uso global
window.createMockData = createMockData;
