document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('cadastroForm');
    const inputNome = document.getElementById('nome');
    const inputEmail = document.getElementById('email');
    const inputSenha = document.getElementById('senha');
    const inputConfirmaSenha = document.getElementById('confirmaSenha');
    const checkboxTermos = document.getElementById('termos');
    const passwordStrength = document.getElementById('passwordStrength');

    function validarNome(nome) {
        return nome.trim().length >= 3;
    }

    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function showToast(message, type = 'success') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 3500);
    }

    function avaliarForcaSenha(senha) {
        if (senha.length < 6) return 'weak';
        
        let forca = 0;
        if (/[a-z]/.test(senha)) forca++;
        if (/[A-Z]/.test(senha)) forca++;
        if (/[0-9]/.test(senha)) forca++;
        if (/[^a-zA-Z0-9]/.test(senha)) forca++;
        
        if (forca <= 1) return 'weak';
        if (forca <= 2) return 'medium';
        return 'strong';
    }

    function validarConfirmacaoSenha(senha, confirmaSenha) {
        return senha === confirmaSenha && senha.length > 0;
    }

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

    function limparErro(element) {
        element.classList.remove('input-erro');
        const errorMsg = element.parentElement.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    function atualizarIndicadorSenha() {
        const senha = inputSenha.value;
        
        if (!senha) {
            passwordStrength.className = 'password-strength';
            return;
        }

        const forca = avaliarForcaSenha(senha);
        passwordStrength.className = `password-strength ${forca}`;
    }

    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        limparErro(inputNome);
        limparErro(inputEmail);
        limparErro(inputSenha);
        limparErro(inputConfirmaSenha);

        let formularioValido = true;

        if (!inputNome.value.trim()) {
            mostrarErro(inputNome, 'Por favor, insira seu nome');
            formularioValido = false;
        } else if (!validarNome(inputNome.value)) {
            mostrarErro(inputNome, 'Nome deve ter no mínimo 3 caracteres');
            formularioValido = false;
        }

        if (!inputEmail.value.trim()) {
            mostrarErro(inputEmail, 'Por favor, insira seu email');
            formularioValido = false;
        } else if (!validarEmail(inputEmail.value)) {
            mostrarErro(inputEmail, 'Email inválido');
            formularioValido = false;
        }

        if (!inputSenha.value) {
            mostrarErro(inputSenha, 'Por favor, insira uma senha');
            formularioValido = false;
        } else if (inputSenha.value.length < 6) {
            mostrarErro(inputSenha, 'Senha deve ter no mínimo 6 caracteres');
            formularioValido = false;
        }

        if (!inputConfirmaSenha.value) {
            mostrarErro(inputConfirmaSenha, 'Por favor, confirme sua senha');
            formularioValido = false;
        } else if (!validarConfirmacaoSenha(inputSenha.value, inputConfirmaSenha.value)) {
            mostrarErro(inputConfirmaSenha, 'As senhas não coincidem');
            formularioValido = false;
        }

        if (!checkboxTermos.checked) {
            alert('Você deve aceitar os termos de uso e política de privacidade');
            formularioValido = false;
        }

        if (formularioValido) {
            enviarFormulario();
        }
    });

    function enviarFormulario() {
        const dados = {
            nome: inputNome.value,
            email: inputEmail.value,
            senha: inputSenha.value
        };
        console.log('Enviando cadastro para API...', dados);

        const submitBtn = formulario.querySelector('button[type="submit"]');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Cadastrando...'; }

        fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        })
        .then(async (res) => {
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Erro no cadastro');
            try {
                const loginRes = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: inputEmail.value, senha: inputSenha.value })
                });
                const loginData = await loginRes.json();
                if (!loginRes.ok) throw new Error(loginData.message || 'Erro ao logar');
                localStorage.setItem('email_salvo', inputEmail.value);
                if (loginData.token) localStorage.setItem('auth_token', loginData.token);
                formulario.reset();
                atualizarIndicadorSenha();
                window.location.href = './dashboard.html';
            } catch (err) {
                console.error('Auto-login após cadastro falhou:', err);
                showToast('Conta criada, por favor faça login.', 'success');
                formulario.reset();
                atualizarIndicadorSenha();
            }
        })
        .catch((err) => {
            console.error('Cadastro error:', err);
            const msg = err.message || 'Falha ao cadastrar';
            mostrarErro(inputEmail, msg);
            showToast(msg, 'error');
        })
        .finally(() => {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Criar Conta'; }
        });
    }

    inputSenha.addEventListener('input', atualizarIndicadorSenha);

    inputNome.addEventListener('focus', () => limparErro(inputNome));
    inputEmail.addEventListener('focus', () => limparErro(inputEmail));
    inputSenha.addEventListener('focus', () => limparErro(inputSenha));
    inputConfirmaSenha.addEventListener('focus', () => limparErro(inputConfirmaSenha));
});
