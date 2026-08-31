

let valorcarrinho =0

//menu lateral
function abrirFecharMenu() {
    const menu = document.getElementById('menu-lateral');
    const overlay = document.getElementById('overlay-menu');
    
    if (menu && overlay) {
        menu.classList.toggle('hidden');
        overlay.classList.toggle('hidden');
    }
}








//redenrizaçao de produtos
async function renderizarProdutos() {
    const containers = {
    'camisetas': document.getElementById('container-camisetas'),
    'tenis': document.getElementById('container-tenis'),
    'calcas': document.getElementById('container-calcas'),
    'acessorios': document.getElementById('container-acessorios'),
    'moletons': document.getElementById('container-moletons'),
    'bone': document.getElementById('container-bone'),
    'polo': document.getElementById('container-polo'),
    'regatas': document.getElementById('container-regatas'),
    'longa': document.getElementById('container-longa'),
    'chinelos': document.getElementById('container-chinelos'),
    'bermuda': document.getElementById('container-bermuda'),
    'shorts': document.getElementById('container-shorts')
};

    const [produtosResult, tamanhosResult] = await Promise.all([
        db.from('produtos').select('*'),
        db.from('tamanhos_padrao').select('categoria, tamanho')
    ]);

    const { data: produtos, error } = produtosResult;
    const { data: tamanhosPadrao, error: tamanhosError } = tamanhosResult;

    if (error || tamanhosError) {
        console.error(
            'Erro ao carregar dados:',
            error?.message || tamanhosError?.message
        );
        return;
    }

    Object.values(containers).forEach(container => {
        if (container) {
            container.innerHTML = '';
        }
    });

    const normalizarCategoria = categoria => categoria
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const categoriaProdutoParaTabela = {
        camisetas: 'camisas',
        calcas: 'calca',
        moleton: 'moletons',
        moletons: 'moletons',
        tenis: 'sapatos',
        acessorios: 'acessorio',
        bone: 'acessorio',
        chinelos: 'sapatos',
        polo: 'camisas',
        longa: 'camisas',
        bermuda:'Bermuda',
        shorts:'shorts'

       
    };

    const tamanhosPorCategoria = tamanhosPadrao.reduce((grupos, item) => {
        const categoria = normalizarCategoria(item.categoria);
        if (!grupos[categoria]) {
            grupos[categoria] = [];
        }
        grupos[categoria].push(item.tamanho);
        return grupos;
    }, {});

    // 2. Faz o loop nos produtos
    produtos.forEach(produto => {
        // Cria o HTML do card exatamente como o seu estilo original
         // Se o produto estiver inativo, ele está esgotado.
        const isEsgotado = !produto.ativo;
        const categoriaNormalizada = normalizarCategoria(produto.categoria);
        const categoriaTabela = categoriaProdutoParaTabela[categoriaNormalizada]
            || categoriaNormalizada;
        const tamanhos = tamanhosPorCategoria[categoriaTabela] || [];
        const opcoesTamanho = tamanhos.map((tamanho, index) => `
            <input
                type="radio"
                name="size-${produto.id}"
                id="size-${produto.id}-${index}"
                value="${tamanho}"
                ${isEsgotado ? 'disabled' : ''}
            >
            <label for="size-${produto.id}-${index}">${tamanho}</label>
        `).join('');
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
                                <div class="opcao-conteudo">
                                    ${opcoesTamanho}
                                </div>
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

        // Normaliza as categorias salvas no banco para os IDs dos containers.
        const categoria = categoriaNormalizada === 'moleton'
            ? 'moletons'
            : categoriaNormalizada;

        if (containers[categoria]) {
            containers[categoria].innerHTML += cardHTML;
        }
    });
    const primeiraCategoriaComProdutos = Object.entries(containers)
        .find(([, container]) => container?.children.length > 0);
    mostrarsecao(primeiraCategoriaComProdutos?.[1]?.id || 'container-camisetas');
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




let carrinho = JSON.parse(localStorage.getItem('carrinho_krstore')) || [];

function adicionarAoCarrinho(id, nome, preco, imagem,elementoCard) {
    let tamanho = elementoCard.querySelector('.opcao input:checked')?.value;
    const tamanhoDisponivel = elementoCard.querySelector('.opcao input')?.value;
   
    // Verifica se o produto já está no carrinho
   // Criamos uma chave única para o item (mesmo ID com tamanhos diferentes são itens separados)
   // 2. Se não marcou tamanho, mas o tamanho disponível for "UNC", assume esse valor automaticamente
    if (!tamanho && tamanhoDisponivel === 'UNC') {
        tamanho = tamanhoDisponivel;
    }
    

    if (!tamanho) {
         Swal.fire({
            icon: 'warning',
            title: 'Escolha as opções',
            text: 'Selecione um tamanho antes de adicionar!',
            confirmButtonColor: '#fb1601'
        });
        return tamanho=tamanhoDisponivel;
    }
    const itemChave = `${id}-${tamanho}`;
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
    localStorage.setItem('carrinho_krstore', JSON.stringify(carrinho));
}


function atualizarInterfaceCarrinho() {
    const containerItens = document.getElementById('carrinho-itens');
    const contador = document.querySelector('.contador');
    const totalElemento = document.getElementById('cart-total');
    
    containerItens.innerHTML = '';
    let totalGeral = 0;
    let totalItens = 0;

    carrinho.forEach(item => {
        totalGeral += item.preco * item.quantidade;
        totalItens += item.quantidade;
       
      

        containerItens.innerHTML += `
    <div class="item-carrinho" style="display: flex; gap: 10px; margin-bottom: 15px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
        <img src="${item.imagem}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
        <div style="flex: 1;">
            <p style="font-size: 12px; font-weight: bold; margin: 0;">${item.nome}</p>
            <p style="font-size: 11px; color: #666; margin: 2px 0;">Tam: ${item.tamanho}</p>
            <p style="font-size: 12px; margin: 0;">${item.quantidade}x R$ ${item.preco.toFixed(2)}</p>
        </div>
        <button onclick="removerDoCarrinho('${item.chave}')" style="background: none; border: none; color: #fb1601; cursor: pointer;">
            <span class="material-symbols-outlined">delete</span>
        </button>
    </div>
`;
    });


  

    // ... (resto do código de atualização do totalElemento e contador)
    contador.innerHTML = totalItens;
    totalElemento.innerText = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`;
    valorcarrinho=totalGeral
    console.log(valorcarrinho)
}

function removerDoCarrinho(index) {
    carrinho = carrinho.filter(item => item.chave !== index);
    salvarCarrinho();
    atualizarInterfaceCarrinho();
}

// Chame ao carregar a página para o carrinho não iniciar vazio se houver dados salvos
document.addEventListener('DOMContentLoaded', atualizarInterfaceCarrinho);

//funçao lançar toast promoçao

function finalizarCarrinho() {
    if (carrinho.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Carrinho vazio',
            text: 'Adicione pelo menos um produto antes de finalizar o pedido.',
            confirmButtonColor: '#000000'
        });
        return;
    }

    const total = carrinho.reduce(
        (soma, item) => soma + item.preco * item.quantidade,
        0
    );
    const itens = carrinho.map(item => {
        const subtotal = item.preco * item.quantidade;
        return `${item.quantidade}x ${item.nome} - Tamanho: ${item.tamanho} - R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    }).join('\n');

    const mensagem = [
        'Olá! Gostaria de fazer este pedido:',
        '',
        itens,
        '',
        `Total: R$ ${total.toFixed(2).replace('.', ',')}`
    ].join('\n');

    const urlWhatsApp = `https://wa.me/5515997649896?text=${encodeURIComponent(mensagem)}`;
    window.open(urlWhatsApp, '_blank');
}