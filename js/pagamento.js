
let carrinho = JSON.parse(localStorage.getItem('carrinho_vianna')) || [];

// Captura os elementos do DOM
const bairro = document.getElementById('bairros');
const txentrega = document.getElementById('tx-entrega');
const totalpedido = document.getElementById('total');

// Função centralizada para calcular e exibir o total
function atualizarTotal() {
    let valorsalvo = localStorage.getItem('valorcarrinho');
    let carrinhototal = valorsalvo ? parseFloat(valorsalvo) : 0;

    // Pega o valor diretamente do <select> e tenta converter para número
    let valorEntregaText = bairro.value;
    let valorEntrega = parseFloat(valorEntregaText);

    // Se o valor for um número válido (ou seja, diferente da opção "Outro")
    if (!isNaN(valorEntrega)) {
        carrinhototal += valorEntrega;
    }

    // Exibe o total final formatado
    totalpedido.innerHTML = `R$ ${carrinhototal.toFixed(2).replace('.', ',')}`;
}

// Evento: Quando o usuário muda o bairro no <select>
bairro.addEventListener('change', () => {
    const valorSelecionado = bairro.value;
    const valorNumerico = parseFloat(valorSelecionado);

    // Verifica se é número para formatar, senão exibe o texto normal ("consultar valor...")
    if (!isNaN(valorNumerico)) {
        txentrega.innerHTML = `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`;
    } else {
        txentrega.innerHTML = valorSelecionado; 
    }

    // Chama a função para recalcular o total da compra
    atualizarTotal();
});

// Evento: Quando a página terminar de carregar
document.addEventListener('DOMContentLoaded', () => {
    // Força a exibição inicial da taxa de entrega baseada na opção que já vem selecionada no HTML
    const valorInicial = bairro.value;
    if (!isNaN(parseFloat(valorInicial))) {
         txentrega.innerHTML = `R$ ${parseFloat(valorInicial).toFixed(2).replace('.', ',')}`;
    } else {
         txentrega.innerHTML = valorInicial;
    }

    // Calcula o total inicial
    atualizarTotal();
});

// Captura o formulário
// Captura o formulário
const formCheckout = document.getElementById('form-checkout');


formCheckout.addEventListener('submit', (evento) => {
    // 1. Evita que a página recarregue
    evento.preventDefault(); 
    
  const carrinho = JSON.parse(localStorage.getItem('carrinho_vianna')) || [];

   if (carrinho.length === 0) {
        alert("Seu carrinho está vazio!");
        return;
    }
    
    // 2. FORMATAR A LISTA DE PRODUTOS PARA A MENSAGEM
    let itensFormatados = "";
    carrinho.forEach(item => {
        const subtotalItem = item.preco * item.quantidade;
        itensFormatados += `- ${item.quantidade}x ${item.nome} (${item.tamanho}/${item.cor}) - R$ ${subtotalItem.toFixed(2).replace('.', ',')}\n`;
    });


    
    // 2. Pegando os dados de texto comuns digitados nos inputs
    const nome = document.getElementById('nome').value;
    const cep = document.getElementById('cep').value;
    const cidade = document.getElementById('cidade').value;
    const rua = document.getElementById('rua').value;
    const numero = document.getElementById('numero').value;

    // 3. Pegando o NOME do bairro selecionado (e não o valor numérico dele)
    const selectBairro = document.getElementById('bairros');
    const nomeBairro = selectBairro.options[selectBairro.selectedIndex].text;

    // 4. Pegando os selects de entrega e pagamento
    const modeloEntrega = document.getElementById('modelo-entrega').value;
    const formaPagamento = document.getElementById('forma-pagamento').value;

    // 5. Pegando os valores finais formatados que estão nos <span>
    const taxaEntrega = document.getElementById('tx-entrega').innerText;
    const totalGeral = document.getElementById('total').innerText;
    
    // 6. Montando a mensagem organizada (perfeita para WhatsApp)
    const mensagemFinal = 
`*NOVO PEDIDO - VIANNA FIT* 🏋️‍♂️📦

*Dados do Cliente:*
Nome: ${nome}
Endereço: Rua ${rua}, Nº ${numero}
Bairro: ${nomeBairro}
Cidade: ${cidade} | CEP: ${cep}

*🛒 Itens do Pedido:*
${itensFormatados}
*Resumo do Pedido:*
Modelo de Entrega: ${modeloEntrega}
Taxa de Entrega: ${taxaEntrega}
Forma de Pagamento: ${formaPagamento}

*TOTAL FINAL: ${totalGeral}*`;

    // Mostra no console para você verificar se pegou tudo certinho
    console.log(mensagemFinal);

  
    const seuNumero = "558594519240"; // Coloque o DDI (55) + DDD + Número
    const urlWhatsApp = `https://wa.me/${seuNumero}?text=${encodeURIComponent(mensagemFinal)}`;
     window.open(urlWhatsApp, '_blank'); 


     // 8. ZERAR O CARRINHO NO LOCALSTORAGE
    localStorage.removeItem('carrinho_vianna');
    localStorage.removeItem('valorcarrinho');
    
    // 9. VOLTAR PARA A PÁGINA INICIAL (opcional, mas evita envios duplicados)
    // Usamos um pequeno atraso (timeout) para dar tempo de o WhatsApp abrir tranquilo
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
});
