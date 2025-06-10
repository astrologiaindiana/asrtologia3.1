// === video-calls.js ===
// Funções para gerenciar videochamadas

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos da seção de videochamadas
    initVideoCallsSection();
});

// Função para inicializar eventos da seção de videochamadas
function initVideoCallsSection() {
    // Botão para adicionar nova videochamada
    const addVideochamadaBtn = document.getElementById('add-videochamada');
    if (addVideochamadaBtn) {
        addVideochamadaBtn.addEventListener('click', function() {
            openNewVideoCallModal();
        });
    }
    
    // Formulário de edição de videochamada
    const editVideochamadaForm = document.getElementById('edit-videochamada-form');
    if (editVideochamadaForm) {
        editVideochamadaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const videoCallId = document.getElementById('videochamada-id').value;
            const videoCallData = {
                client: document.getElementById('videochamada-cliente').value,
                date: document.getElementById('videochamada-data').value,
                time: document.getElementById('videochamada-hora').value,
                link: document.getElementById('videochamada-link').value,
                notes: document.getElementById('videochamada-notas').value
            };
            
            if (videoCallId) {
                // Atualizar videochamada existente
                updateVideoCall(videoCallId, videoCallData);
            } else {
                // Criar nova videochamada
                createVideoCall(videoCallData);
            }
            
            closeModal('videochamada-modal');
        });
    }
    
    // Carregar videochamadas do mês atual
    const today = new Date();
    loadVideoCalls(today.getMonth(), today.getFullYear());
}
