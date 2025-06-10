// === utils.js ===
// Funções utilitárias para a aplicação

// Função para mostrar notificação toast
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    // Definir mensagem
    toastMessage.textContent = message;
    
    // Definir ícone baseado no tipo
    toastIcon.className = 'fas';
    switch (type) {
        case 'success':
            toastIcon.classList.add('fa-check-circle', 'success');
            break;
        case 'error':
            toastIcon.classList.add('fa-exclamation-circle', 'error');
            break;
        case 'warning':
            toastIcon.classList.add('fa-exclamation-triangle', 'warning');
            break;
        default:
            toastIcon.classList.add('fa-info-circle', 'info');
            break;
    }
    
    // Mostrar toast
    toast.classList.add('active');
    
    // Esconder toast após 3 segundos
    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Função para formatar data (YYYY-MM-DD para DD/MM/YYYY)
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// Função para formatar hora (HH:MM para HH:MM)
function formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr;
}

// Função para formatar valor monetário
function formatCurrency(value) {
    if (value === undefined || value === null) return 'R$ 0,00';
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para obter nome do mês
function getMonthName(month) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return months[month];
}

// Função para gerar calendário
function generateCalendar(month, year) {
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    // Dia da semana do primeiro dia (0 = Domingo, 6 = Sábado)
    const firstDayOfWeek = firstDay.getDay();
    
    // Total de dias no mês
    const daysInMonth = lastDay.getDate();
    
    // Array para armazenar os dias do calendário
    const calendarDays = [];
    
    // Adicionar dias do mês anterior
    for (let i = 0; i < firstDayOfWeek; i++) {
        const prevMonthDay = new Date(year, month, -i);
        calendarDays.unshift({
            day: prevMonthDay.getDate(),
            month: prevMonthDay.getMonth(),
            year: prevMonthDay.getFullYear(),
            isCurrentMonth: false,
            isToday: false,
            events: []
        });
    }
    
    // Adicionar dias do mês atual
    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(year, month, i);
        calendarDays.push({
            day: i,
            month: month,
            year: year,
            isCurrentMonth: true,
            isToday: (
                currentDate.getDate() === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear()
            ),
            events: []
        });
    }
    
    // Adicionar dias do próximo mês para completar a grade
    const totalDaysNeeded = 42; // 6 semanas x 7 dias
    const remainingDays = totalDaysNeeded - calendarDays.length;
    
    for (let i = 1; i <= remainingDays; i++) {
        const nextMonthDay = new Date(year, month + 1, i);
        calendarDays.push({
            day: nextMonthDay.getDate(),
            month: nextMonthDay.getMonth(),
            year: nextMonthDay.getFullYear(),
            isCurrentMonth: false,
            isToday: false,
            events: []
        });
    }
    
    return calendarDays;
}

// Função para obter cores aleatórias para gráficos
function getRandomColors(count) {
    const colors = [];
    
    for (let i = 0; i < count; i++) {
        // Gerar cores com boa saturação e luminosidade
        const hue = Math.floor(Math.random() * 360);
        const saturation = 70 + Math.floor(Math.random() * 20); // 70-90%
        const lightness = 45 + Math.floor(Math.random() * 10); // 45-55%
        
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    
    return colors;
}

// Função para verificar se duas datas são do mesmo dia
function isSameDay(date1, date2) {
    return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
    );
}

// Função para obter valor de um tipo de mapa pelo nome
function getMapTypeValue(mapTypeName) {
    if (!window.mapTypes) return 0;
    
    const mapType = window.mapTypes.find(type => type.name === mapTypeName);
    return mapType ? parseFloat(mapType.value) : 0;
}

// Função para confirmar ação
function confirmAction(message, callback) {
    if (confirm(message)) {
        callback();
    }
}
