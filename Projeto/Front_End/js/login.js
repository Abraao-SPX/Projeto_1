
/**
 * Sistema de Autenticação - Formulário de Login
 * Validação e manipulação de formulário
 */

document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('loginForm');
    const inputEmail = document.getElementById('email');
    const inputSenha = document.getElementById('senha');
    const checkboxLembrar = document.getElementById('lembrarSenha');

    /**
     * Valida formato de email
     * @param {string} email - Email a validar
     * @returns {boolean} - True se válido
     */
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Exibe mensagem temporária (toast)
     */
    function showToast(message, type = 'error') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3500);
    }

    /**
     * Exibe mensagem de erro no input
     * @param {HTMLElement} element - Elemento do input
     * @param {string} mensagem - Mensagem de erro
     */
    function mostrarErro(element, mensagem) {
        element.classList.add('input-erro');
        
        let errorMsg = element.parentElement.querySelector('.error-message');
        if (!errorMsg) {
            errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            element.parentElement.appendChild(errorMsg);
        }
        errorMsg.textContent = mensagem;
    }

    /**
     * Remove mensagem de erro do input
     * @param {HTMLElement} element - Elemento do input
     */
    function limparErro(element) {
        element.classList.remove('input-erro');
        const errorMsg = element.parentElement.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    /**
     * Manipula o envio do formulário
     */
    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        // Limpa erros anteriores
        limparErro(inputEmail);
        limparErro(inputSenha);

        let formularioValido = true;

        // Valida email
        if (!inputEmail.value.trim()) {
            mostrarErro(inputEmail, 'Por favor, insira seu email');
            formularioValido = false;
        } else if (!validarEmail(inputEmail.value)) {
            mostrarErro(inputEmail, 'Email inválido');
            formularioValido = false;
        }

        // Valida senha
        if (!inputSenha.value) {
            mostrarErro(inputSenha, 'Por favor, insira sua senha');
            formularioValido = false;
        } else if (inputSenha.value.length < 6) {
            mostrarErro(inputSenha, 'Senha deve ter no mínimo 6 caracteres');
            formularioValido = false;
        }

        // Se válido, envia
        if (formularioValido) {
            enviarFormulario();
        }
    });

    /**
     * Envia o formulário (simula envio)
     */
    function enviarFormulario() {
        const dados = {
            email: inputEmail.value,
            senha: inputSenha.value
        };
        console.log('Enviando login para API...', dados);

        // Desabilita botão e mostra carregando
        const submitBtn = formulario.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Entrando...'; }

        // Enviar para backend (ajuste porta/host se necessário)
        fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro no login');

            // Sucesso: salva preferência, token e redireciona
            if (checkboxLembrar.checked) {
                localStorage.setItem('email_salvo', inputEmail.value);
            } else {
                localStorage.removeItem('email_salvo');
            }
            if (data.token) localStorage.setItem('auth_token', data.token);
            window.location.href = './dashboard.html';
        })
        .catch((err) => {
            console.error('Login error:', err);
            const msg = err.message || 'Falha ao logar';
            mostrarErro(inputSenha, msg);
            showToast(msg, 'error');
        })
        .finally(() => {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Entrar na Conta'; }
        });
    }

    /**
     * Carrega email salvo se existir
     */
    window.addEventListener('load', () => {
        const emailSalvo = localStorage.getItem('email_salvo');
        if (emailSalvo) {
            inputEmail.value = emailSalvo;
            checkboxLembrar.checked = true;
        }
    });

    /**
     * Remove erro ao focar no input
     */
    inputEmail.addEventListener('focus', () => limparErro(inputEmail));
    inputSenha.addEventListener('focus', () => limparErro(inputSenha));

    /**
     * Monitora mudanças no email para manter sincronizado com localStorage
     */
    inputEmail.addEventListener('change', () => {
        if (checkboxLembrar.checked) {
            localStorage.setItem('email_salvo', inputEmail.value);
        }
    });
});
