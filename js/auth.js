// === auth.js ===
// Gerenciamento de autenticação com Firebase

document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos do DOM
    const loginScreen = document.getElementById('login-screen');
    const mainPanel = document.getElementById('main-panel');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const userName = document.getElementById('user-name');

    // Verificar estado de autenticação ao carregar a página
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Usuário está autenticado
            console.log('Usuário autenticado:', user.email);
            showMainPanel(user);
            loadInitialData(); // Carregar dados após autenticação
        } else {
            // Usuário não está autenticado
            console.log('Usuário não autenticado');
            showLoginScreen();
        }
    });

    // Manipular envio do formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Mostrar mensagem de carregamento
            loginError.textContent = 'Autenticando...';
            
            // Autenticar com Firebase
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Login bem-sucedido
                    loginError.textContent = '';
                    console.log('Login bem-sucedido');
                })
                .catch((error) => {
                    // Erro no login
                    console.error('Erro no login:', error);
                    loginError.textContent = traduzirErroFirebase(error.code);
                });
        });
    }

    // Manipular clique no botão de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            firebase.auth().signOut()
                .then(() => {
                    console.log('Logout bem-sucedido');
                })
                .catch((error) => {
                    console.error('Erro no logout:', error);
                    showToast('Erro ao fazer logout. Tente novamente.', 'error');
                });
        });
    }

    // Função para mostrar o painel principal
    function showMainPanel(user) {
        loginScreen.classList.add('hidden');
        mainPanel.classList.remove('hidden');
        
        // Atualizar nome do usuário
        if (userName) {
            userName.textContent = user.email.split('@')[0];
        }
    }

    // Função para mostrar a tela de login
    function showLoginScreen() {
        mainPanel.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        
        // Limpar campos do formulário
        if (loginForm) {
            loginForm.reset();
            loginError.textContent = '';
        }
    }

    // Função para traduzir mensagens de erro do Firebase
    function traduzirErroFirebase(errorCode) {
        switch (errorCode) {
            case 'auth/invalid-email':
                return 'E-mail inválido.';
            case 'auth/user-disabled':
                return 'Usuário desativado.';
            case 'auth/user-not-found':
                return 'Usuário não encontrado.';
            case 'auth/wrong-password':
                return 'Senha incorreta.';
            default:
                return 'Erro na autenticação. Tente novamente.';
        }
    }

    // Função para criar usuários de teste (apenas para desenvolvimento)
    // Esta função deve ser removida em produção
    function createTestUsers() {
        const testUsers = [
            { email: 'conrado@astrologiaindiana.com', password: 'senha123' },
            { email: 'kavi@astrologiaindiana.com', password: 'senha123' }
        ];

        testUsers.forEach(user => {
            firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
                .then(() => console.log(`Usuário ${user.email} criado com sucesso`))
                .catch(error => {
                    // Ignorar erro se o usuário já existir
                    if (error.code !== 'auth/email-already-in-use') {
                        console.error(`Erro ao criar usuário ${user.email}:`, error);
                    }
                });
        });
    }

    // Descomente a linha abaixo para criar usuários de teste (apenas em desenvolvimento)
    // createTestUsers();
});
