// Selecionando os elementos do formulário
const cepInput = document.querySelector('#cep');
const ruaInput = document.querySelector('#rua');
const cidadeInput = document.querySelector('#cidade');

// Função para escutar quando o usuário termina de digitar o CEP
cepInput.addEventListener('blur', () => {
    // Remove qualquer caractere que não seja número
    let cep = cepInput.value.replace(/\D/g, '');

    // Verifica se o CEP possui o tamanho correto (8 dígitos)
    if (cep.length === 8) {
        // Faz a requisição para a API (Exemplo usando ViaCEP)
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(response => response.json())
            .then(dados => {
                if (!dados.erro) {
                    // Preenche os campos com os dados da API
                    ruaInput.value = dados.logradouro;
                    cidadeInput.value = dados.localidade;
                    
                    // Coloca o foco no campo número para agilizar
                    document.querySelector('#numero').focus();
                } else {
                    alert('CEP não encontrado.');
                }
            })
            .catch(error => {
                console.error('Erro ao buscar CEP:', error);
            });
    }
});