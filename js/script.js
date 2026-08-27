

let valorcarrinho =0

//redenrizaçao de produtos
async function renderizarProdutos() {
    const containerNike = document.getElementById('container-nike');
    const containerAdidas = document.getElementById('container-adidas');

    // 1. Busca os dados no Supabase (usando a variável 'db' do seu config)
    const { data: produtos, error } = await db
        .from('produtos')
        .select('*');

    if (error) {
        console.error("Erro ao carregar produtos:", error.message);
        return;
    }

    // Limpa os containers antes de renderizar
    containerNike.innerHTML = "";
    containerAdidas.innerHTML = "";

    // 2. Faz o loop nos produtos
    produtos.forEach(produto => {
        // Cria o HTML do card exatamente como o seu estilo original
         // Se o produto NÃO estiver em estoque (!produto.em_estoque), então ele está esgotado (true)
        const isEsgotado = !produto.em_estoque;
        const cardHTML = `
                <div class="card-produto ${isEsgotado ? 'produto-esgotado' : ''}">
                    <div class="img-card">
                        <img src="${produto.imagem_url}" alt="${produto.nome}">
                    </div>
                    <div class="info-card">
                        <h3>${produto.nome}</h3>
                        <p class="preco">R$ ${produto.preco.toFixed(2).replace('.', ',')}</p>
                        
                        <div class="selecao">
                            <span>Tamanho:</span>
                            <div class="opcao">
                                <input type="radio" name="size-${produto.id}" id="p-${produto.id}" value="P" ${isEsgotado ? 'disabled' : ''}><label for="p-${produto.id}">P</label>
                                <input type="radio" name="size-${produto.id}" id="m-${produto.id}" value="M" ${isEsgotado ? 'disabled' : ''}><label for="m-${produto.id}">M</label>
                                <input type="radio" name="size-${produto.id}" id="g-${produto.id}" value="G" ${isEsgotado ? 'disabled' : ''}><label for="g-${produto.id}">G</label>
                                <input type="radio" name="size-${produto.id}" id="gg-${produto.id}" value="GG" ${isEsgotado ? 'disabled' : ''}><label for="gg-${produto.id}">GG</label>
                            </div>
                        </div>

                        <div class="selecao">
                            <span>Cor:</span>
                            <div class="opicao-cores">
                                <input type="radio" name="color-${produto.id}" id="preto-${produto.id}" value="preto" ${isEsgotado ? 'disabled' : ''}>
                                <label for="preto-${produto.id}" style="background-color: black;"></label>

                                <input type="radio" name="color-${produto.id}" id="branco-${produto.id}" value="branco" ${isEsgotado ? 'disabled' : ''}>
                                <label for="branco-${produto.id}" style="background-color: white; border: 1px solid #ddd;"></label>

                                <input type="radio" name="color-${produto.id}" id="cinza-${produto.id}" value="cinza" ${isEsgotado ? 'disabled' : ''}>
                                <label for="cinza-${produto.id}" style="background-color: gray;"></label>

                                <input type="radio" name="color-${produto.id}" id="vermelho-${produto.id}" value="vermelho" ${isEsgotado ? 'disabled' : ''}>
                                <label for="vermelho-${produto.id}" style="background-color: red;"></label>

                                <input type="radio" name="color-${produto.id}" id="azul-${produto.id}" value="azul" ${isEsgotado ? 'disabled' : ''}>
                                <label for="azul-${produto.id}" style="background-color: #00008B;"></label>
                            </div>
                        </div>
                        
                        <button 
                            class="btn-adc-carrinho" 
                            ${isEsgotado ? 'disabled' : ''}
                            onclick="adicionarAoCarrinho('${produto.id}', '${produto.nome}', ${produto.preco}, '${produto.imagem_url}', this.closest('.card-produto'))"
                        >
                            ${isEsgotado ? 'Esgotado' : 'Adicionar ao carrinho'}
                        </button>
                    </div>
                </div>
            `;

        // 3. Filtra por marca para saber onde injetar
        if (produto.marca.toLowerCase() === 'nike') {
            containerNike.innerHTML += cardHTML;
        } else if (produto.marca.toLowerCase() === 'adidas') {
            containerAdidas.innerHTML += cardHTML;
        }
    });
    mostrarsecao('container-nike');
}

document.addEventListener('DOMContentLoaded', renderizarProdutos);

function mostrarsecao(idsecao) {
    const secoes = document.querySelectorAll('.cards-Produtos');
    
    secoes.forEach(secao => {
    secao.style.display = 'none';
  });

     const secaoParaMostrar = document.getElementById(idsecao);
 if (secaoParaMostrar) {
        secaoParaMostrar.style.display = 'flex';
    } else {
        console.error("Seção não encontrada: " + idsecao);
    }

}

function abrirFecharCarrinho() {
    const carrinho = document.getElementById('carrinho-lateral');
    carrinho.classList.toggle('hidden');
}

// Opcional: Fechar o carrinho se clicar fora dele (melhora a experiência)
window.onclick = function(event) {
    const carrinho = document.getElementById('carrinho-lateral');
    const iconeCarrinho = document.querySelector('.cardcout');
    
    // Se o clique não foi no carrinho nem no botão de abrir, fecha o carrinho
    if (!carrinho.contains(event.target) && !iconeCarrinho.contains(event.target) && !carrinho.classList.contains('hidden')) {
        carrinho.classList.add('hidden');
    }
} 




let carrinho = JSON.parse(localStorage.getItem('carrinho_vianna')) || [];

function adicionarAoCarrinho(id, nome, preco, imagem,elementoCard) {
    const tamanho = elementoCard.querySelector('.opcao input:checked')?.value;
    const cor = elementoCard.querySelector('.opicao-cores input:checked')?.value;
    // Verifica se o produto já está no carrinho
   // Criamos uma chave única para o item (mesmo ID com tamanhos diferentes são itens separados)
   if (!tamanho || !cor) {
         Swal.fire({
            icon: 'warning',
            title: 'Escolha as opções',
            text: 'Selecione um tamanho e uma cor antes de adicionar!',
            confirmButtonColor: '#fb1601'
        });
        return;
    }
    const itemChave = `${id}-${tamanho}-${cor}`;
    const itemExistente = carrinho.find(item => item.chave === itemChave);
    
    
        if (itemExistente) {
        itemExistente.quantidade += 1;
    } else {
        const novoItem = {
            id: id,
            chave: itemChave,
            nome: nome,
            preco: preco,
            imagem: imagem,
            tamanho: tamanho,
            cor: cor,
            quantidade: 1
        };
        carrinho.push(novoItem);
    }

    // Salva no LocalStorage e atualiza a interface
    salvarCarrinho();
    atualizarInterfaceCarrinho();
    
    // Feedback visual opcional
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500
    });
    Toast.fire({ icon: 'success', title: 'Produto adicionado!' });
}

function salvarCarrinho() {
    localStorage.setItem('carrinho_vianna', JSON.stringify(carrinho));
}


function atualizarInterfaceCarrinho() {
    const containerItens = document.getElementById('carrinho-itens');
    const contador = document.querySelector('.contador');
    const totalElemento = document.getElementById('cart-total');
    
    containerItens.innerHTML = '';
    let totalGeral = 0;
    let totalItens = 0;
    let precopromo = 30
    carrinho.forEach((item, index) => {
        totalGeral += item.preco * item.quantidade;
        totalItens += item.quantidade;
       
      

        containerItens.innerHTML += `
    <div class="item-carrinho" style="display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
        <img src="${item.imagem}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        <div style="flex: 1;">
            <p style="font-size: 12px; font-weight: bold; margin: 0;">${item.nome}</p>
            <p style="font-size: 11px; color: #666; margin: 2px 0;">Tam: ${item.tamanho} | Cor: ${item.cor}</p>
            <p style="font-size: 12px; margin: 0;">${item.quantidade}x R$ ${item.preco.toFixed(2)}</p>
        </div>
        <button onclick="removerDoCarrinho('${item.chave}')" style="background: none; border: none; color: #fb1601; cursor: pointer;">
            <span class="material-symbols-outlined">delete</span>
        </button>
    </div>
`});
   let ultimaPromoAtivada = 0;
   
  let htmlPromo = '';

    // --- LÓGICA DE PROMOÇÃO E FRASE DE SUCESSO ---
    if (totalItens === 3) {
        totalGeral = 100.00;
        htmlPromo = `
            <div style="background-color: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center; font-size: 11px; font-weight: bold; border: 1px solid #2e7d32;">
                🔥 PARABÉNS! Você garantiu a promoção: 3 peças por R$ 100,00!
            </div>`;
        
        if (ultimaPromoAtivada !== 3) {
            lancarToastPromo("3 Peças por R$ 100,00! 🔥");
            ultimaPromoAtivada = 3;
        }
    } 
    else if (totalItens >= 4) {

        totalGeral=precopromo*totalItens
        htmlPromo = `
            <div style="background-color: #e8f5e9; color: #2e7d32; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center; font-size: 11px; font-weight: bold; border: 1px solid #2e7d32;">
                🚀 INCRÍVEL! Promoção ativada: Apartir de 4 peças sai R$ 30,00 p/unidade!
            </div>`;
            
        if (ultimaPromoAtivada !== 4) {
            lancarToastPromo("4 Peças por R$ 120,00! 🚀");
            ultimaPromoAtivada = 4;
        }
    } else {
        ultimaPromoAtivada = 0;
    }

    // Renderiza a frase de promoção logo acima do total, se houver
  
    if (htmlPromo !== '') {
        containerItens.innerHTML += htmlPromo;
    }

    // ... (resto do código de atualização do totalElemento e contador)
    contador.innerHTML = totalItens;
    totalElemento.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    valorcarrinho=totalGeral
    console.log(valorcarrinho)
}

function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    salvarCarrinho();
    atualizarInterfaceCarrinho();
}

// Chame ao carregar a página para o carrinho não iniciar vazio se houver dados salvos
document.addEventListener('DOMContentLoaded', atualizarInterfaceCarrinho);

//funçao lançar toast promoçao
function lancarToastPromo(mensagem) {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        background: '#fb1601', // Cor vermelha da sua marca
        color: '#ffffff'
    });

    Toast.fire({
        icon: 'info', // Ícone de informação/anúncio
        iconColor: '#ffffff',
        title: mensagem
    });
}
function finalizarCarrinho(){
  const carrinhostorege = valorcarrinho
   localStorage.setItem('valorcarrinho', carrinhostorege)
   window.location.href='pagamento.html'
   
}