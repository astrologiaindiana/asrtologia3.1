// === settings.js ===
// Funções para gerenciar configurações

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar eventos da seção de configurações
    initSettingsSection();
});

// Função para inicializar eventos da seção de configurações
function initSettingsSection() {
    // Botão para adicionar novo tipo de mapa
    const addTipoMapaBtn = document.getElementById('add-tipo-mapa');
    if (addTipoMapaBtn) {
        addTipoMapaBtn.addEventListener('click', function() {
            openNewMapTypeModal();
        });
    }
    
    // Formulário de edição de tipo de mapa
    const editTipoMapaForm = document.getElementById('edit-tipo-mapa-form');
    if (editTipoMapaForm) {
        editTipoMapaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const mapTypeId = document.getElementById('tipo-mapa-id').value;
            const mapTypeData = {
                name: document.getElementById('map-type-name').value,
                value: parseFloat(document.getElementById('map-type-value').value)
            };
            
            if (mapTypeId) {
                // Atualizar tipo de mapa existente
                updateMapType(mapTypeId, mapTypeData);
            } else {
                // Criar novo tipo de mapa
                createMapType(mapTypeData);
            }
            
            closeModal('tipo-mapa-modal');
        });
    }
}
