// === financial.js ===
// Funções para gerenciar resumo financeiro

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar gráficos financeiros
    initFinancialCharts();
});

// Função para inicializar gráficos financeiros
function initFinancialCharts() {
    // Criar gráficos vazios
    createVendasTipoChart();
    createFaturamentoMesChart();
    createVendasResponsavelChart();
    
    // Carregar dados financeiros
    loadFinancialData('mes');
}

// Função para processar dados financeiros
function processFinancialData(orders) {
    console.log('Processando dados financeiros...');
    
    // Calcular total de vendas
    const totalVendas = orders.length;
    
    // Calcular faturamento total
    let totalFaturamento = 0;
    orders.forEach(order => {
        const mapTypeValue = getMapTypeValue(order.mapType);
        totalFaturamento += mapTypeValue;
    });
    
    // Calcular ticket médio
    const ticketMedio = totalVendas > 0 ? totalFaturamento / totalVendas : 0;
    
    // Atualizar cards do dashboard
    document.getElementById('total-vendas').textContent = totalVendas;
    document.getElementById('total-faturamento').textContent = formatCurrency(totalFaturamento);
    document.getElementById('ticket-medio').textContent = formatCurrency(ticketMedio);
    
    // Processar dados para gráficos
    processChartData(orders);
}

// Função para processar dados para gráficos
function processChartData(orders) {
    // Dados para gráfico de vendas por tipo de mapa
    const vendasPorTipo = {};
    const faturamentoPorTipo = {};
    
    // Dados para gráfico de faturamento por mês
    const faturamentoPorMes = {};
    
    // Dados para gráfico de vendas por responsável
    const vendasPorResponsavel = {};
    
    // Processar pedidos
    orders.forEach(order => {
        // Vendas por tipo de mapa
        if (!vendasPorTipo[order.mapType]) {
            vendasPorTipo[order.mapType] = 0;
            faturamentoPorTipo[order.mapType] = 0;
        }
        vendasPorTipo[order.mapType]++;
        faturamentoPorTipo[order.mapType] += getMapTypeValue(order.mapType);
        
        // Faturamento por mês
        const date = new Date(order.createdAt);
        const monthYear = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
        if (!faturamentoPorMes[monthYear]) {
            faturamentoPorMes[monthYear] = 0;
        }
        faturamentoPorMes[monthYear] += getMapTypeValue(order.mapType);
        
        // Vendas por responsável
        if (!vendasPorResponsavel[order.responsavel]) {
            vendasPorResponsavel[order.responsavel] = 0;
        }
        vendasPorResponsavel[order.responsavel]++;
    });
    
    // Atualizar gráficos
    updateVendasTipoChart(vendasPorTipo, faturamentoPorTipo);
    updateFaturamentoMesChart(faturamentoPorMes);
    updateVendasResponsavelChart(vendasPorResponsavel);
}

// Função para criar gráfico de vendas por tipo de mapa
function createVendasTipoChart() {
    const ctx = document.getElementById('chart-vendas-tipo');
    
    if (ctx) {
        window.vendasTipoChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Função para atualizar gráfico de vendas por tipo de mapa
function updateVendasTipoChart(vendasPorTipo, faturamentoPorTipo) {
    if (window.vendasTipoChart) {
        const labels = Object.keys(vendasPorTipo);
        const data = Object.values(vendasPorTipo);
        const backgroundColor = getRandomColors(labels.length);
        
        // Adicionar valor ao label
        const labelsWithValue = labels.map(label => {
            const valor = formatCurrency(faturamentoPorTipo[label]);
            return `${label} (${valor})`;
        });
        
        window.vendasTipoChart.data.labels = labelsWithValue;
        window.vendasTipoChart.data.datasets[0].data = data;
        window.vendasTipoChart.data.datasets[0].backgroundColor = backgroundColor;
        window.vendasTipoChart.update();
    }
}

// Função para criar gráfico de faturamento por mês
function createFaturamentoMesChart() {
    const ctx = document.getElementById('chart-faturamento-mes');
    
    if (ctx) {
        window.faturamentoMesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Faturamento',
                    data: [],
                    backgroundColor: 'rgba(123, 63, 167, 0.7)',
                    borderColor: 'rgba(123, 63, 167, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Função para atualizar gráfico de faturamento por mês
function updateFaturamentoMesChart(faturamentoPorMes) {
    if (window.faturamentoMesChart) {
        // Ordenar meses cronologicamente
        const sortedMonths = Object.keys(faturamentoPorMes).sort((a, b) => {
            const [monthA, yearA] = a.split(' ');
            const [monthB, yearB] = b.split(' ');
            
            if (yearA !== yearB) {
                return parseInt(yearA) - parseInt(yearB);
            }
            
            const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                           'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
            
            return months.indexOf(monthA) - months.indexOf(monthB);
        });
        
        const data = sortedMonths.map(month => faturamentoPorMes[month]);
        
        window.faturamentoMesChart.data.labels = sortedMonths;
        window.faturamentoMesChart.data.datasets[0].data = data;
        window.faturamentoMesChart.update();
    }
}

// Função para criar gráfico de vendas por responsável
function createVendasResponsavelChart() {
    const ctx = document.getElementById('chart-vendas-responsavel');
    
    if (ctx) {
        window.vendasResponsavelChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Função para atualizar gráfico de vendas por responsável
function updateVendasResponsavelChart(vendasPorResponsavel) {
    if (window.vendasResponsavelChart) {
        const labels = Object.keys(vendasPorResponsavel);
        const data = Object.values(vendasPorResponsavel);
        const backgroundColor = getRandomColors(labels.length);
        
        window.vendasResponsavelChart.data.labels = labels;
        window.vendasResponsavelChart.data.datasets[0].data = data;
        window.vendasResponsavelChart.data.datasets[0].backgroundColor = backgroundColor;
        window.vendasResponsavelChart.update();
    }
}
