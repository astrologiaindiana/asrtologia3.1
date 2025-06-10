// === new-sale.js ===
// Funções para gerenciar nova venda

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar formulário de nova venda
    initNewSaleForm();
});

// Função para inicializar formulário de nova venda
function initNewSaleForm() {
    const newSaleForm = document.getElementById('nova-venda-form');
    
    if (newSaleForm) {
        newSaleForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Coletar dados do formulário
            const orderData = {
                clientName: document.getElementById('cliente-nome').value,
                whatsapp: document.getElementById('cliente-whatsapp').value,
                email: document.getElementById('cliente-email').value,
                birthDate: document.getElementById('data-nascimento').value,
                birthTime: document.getElementById('hora-nascimento').value,
                birthPlace: document.getElementById('local-nascimento').value,
                mapType: document.getElementById('tipo-mapa').value,
                responsavel: document.getElementById('responsavel').value,
                status: document.getElementById('status').value,
                requiresVideoCall: document.getElementById('requer-videochamada').checked
            };
            
            // Criar novo pedido
            createOrder(orderData);
            
            // Limpar formulário
            newSaleForm.reset();
            
            // Mostrar mensagem de sucesso
            showToast('Venda registrada com sucesso!', 'success');
        });
    }
}
