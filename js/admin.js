// Verifica se o usuário está logado logo ao carregar a página
async function checkSession() {
    const { data: { session } } = await db.auth.getSession();
  
    
    if (!session) {
        window.location.href = "login.html";
    }
}

checkSession();

// Função de Logout para o botão "Sair"
async function handleLogout() {
    await db.auth.signOut();
    window.location.href = "login.html";
}



// Função ligada ao botão de "Cadastrar Produto" do seu novo layout
async function handleAddProduct() {
    const nome = document.querySelector('#nome-produto').value;
    const preco = document.querySelector('#preco-produto').value;
    const categoria = document.querySelector('#marca-produto').value;
    const fotoArquivo = document.getElementById('foto-produto').files[0];
  
if (!nome || !preco || !categoria || !fotoArquivo) {
    Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Por favor, preencha todos os campos e selecione uma foto!",
        footer: "<a href=\"#\">Why do I have this issue?</a>"
    });
    return;
}
try {
        // 1. Upload da Foto para o Supabase Storage
        const nomeArquivoSeguro = fotoArquivo.name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9._-]/g, '_');
        const nomeArquivo = `${Date.now()}_${nomeArquivoSeguro}`;
        const { data: uploadData, error: uploadError } = await db.storage
            .from('produtos-imagens') // Nome do seu bucket no Supabase
            .upload(nomeArquivo, fotoArquivo);

        if (uploadError) throw uploadError;

        // 2. Pegar a URL pública da imagem
        const { data: publicUrlData } = db.storage
            .from('produtos-imagens')
            .getPublicUrl(nomeArquivo);

        const fotoUrl = publicUrlData.publicUrl;

        // 3. Salvar no Banco de Dados (Tabela produtos)
        const { error: dbError } = await db
            .from('produtos')
            .insert([
                { nome, categoria, preco: parseFloat(preco), imagem_url: fotoUrl }
            ]);

        if (dbError) throw dbError;

        await Swal.fire({
            title: "Sucesso!",
            text: "Produto cadastrado com sucesso!",
            icon: "success",
            timer: 1000,
            showConfirmButton: false
        });
        location.reload(); // Recarrega para limpar os campos

    } catch (error) {
        console.error("Erro na operação:", error.message);
        alert("Erro ao cadastrar produto.");
    }
}



//selecionar os itens do menu e adicionar o evento de clique
document.querySelectorAll('.menu-item[data-target]').forEach(item => {
    item.addEventListener('click', function() {
        // 1. Remover a classe 'active' de todos os itens do menu
        document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
        
        // 2. Adicionar a classe 'active' ao item clicado
        this.classList.add('active');

        // 3. Esconder todas as seções
        document.querySelectorAll('.card-admin').forEach(section => {
            section.style.display = 'none';
        });

        // 4. Mostrar apenas a seção alvo
        const targetId = this.getAttribute('data-target');
        document.getElementById(targetId).style.display = 'block';
    });
});

//redenrizar as opitions de produtos no select do formulário de 
// cadastro

async function renderizarOptionsProdutos() {
    // 1. Busca os produtos no Supabase
    const { data: produtos, error } = await db
        .from('produtos') 
        .select('id, nome, preco, ativo, imagem_url');

    if (error) {
        console.error('Erro ao buscar produtos:', error.message);
        return;
    }

    // 2. Seleciona os elementos no HTML
    const selectPreco = document.getElementById('select-preco-produto');
    const selectEstoque = document.getElementById('select-estoque-produto');
    const selectEditar = document.getElementById('select-editar-produto');

    const templatePadrao = '<option value="">Selecione um produto...</option>';
    
    if (selectPreco) selectPreco.innerHTML = templatePadrao;
    if (selectEstoque) selectEstoque.innerHTML = templatePadrao;
    if (selectEditar) selectEditar.innerHTML = templatePadrao;

    // 3. Preenche cada select
    produtos.forEach(produto => {
        if (selectPreco) {
            const optionPreco = document.createElement('option');
            optionPreco.value = produto.id;
            optionPreco.textContent = `${produto.nome} - Atual: R$ ${parseFloat(produto.preco).toFixed(2)}`;
            selectPreco.appendChild(optionPreco);
        }

        if (selectEstoque) {
            const optionEstoque = document.createElement('option');
            optionEstoque.value = produto.id;
            optionEstoque.textContent = `${produto.nome} - status atual > ${produto.ativo}`;
            selectEstoque.appendChild(optionEstoque);
        }

        if (selectEditar) {
            const optionEditar = document.createElement('option');
            optionEditar.value = produto.id;
            optionEditar.textContent = produto.nome;
            // Armazena no dataset do option para resgatar os valores
            optionEditar.dataset.nome = produto.nome;
            optionEditar.dataset.imagem = produto.imagem_url || '';
            selectEditar.appendChild(optionEditar);
        }
    });
}

// Chame a função quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    renderizarOptionsProdutos();
});




//fubçaod attualizar preço do produto
async function handleUpdatePrice() {

    
   const novoPreco = document.getElementById('nv-preco')
   const selectproduto = document.getElementById('select-preco-produto')
   const opcaoselecionada = selectproduto.value
   const precoatualizado = parseFloat(novoPreco.value)
  
   if(!opcaoselecionada|| isNaN(precoatualizado) || precoatualizado <=0){
       
       Swal.fire({
            icon: 'warning',
            title: 'Atenção!',
            text: 'selecione um produto e um preço valido',
            confirmButtonText: 'ok',
            confirmButtonColor: '#ac1313'

 
   })
   return;
} 
   const{ error: updateError} = await db
      .from('produtos')
      .update({preco: precoatualizado})
      .eq('id', opcaoselecionada)

      if(updateError){
        Swal.fire({
            icon:'error',
            title:'erro no banco de dados',
            text: updateError.message,
        })
      }
    else{
        Swal.fire({
            icon: 'success',
            title: 'preço atualizado',
            timer:200
        })
        
        novoPreco.value =""
        renderizarOptionsProdutos()
    }

  
}



//funçao controle de estoque 
async function statusProduto() {
    const produtoselecionado = document.getElementById('select-estoque-produto')
    const opcaoselecionada = produtoselecionado.value
    const ativarOuDesativar = document.getElementById('ativar-desativar')
    const opcaostatus = ativarOuDesativar.value
    

     const{ error: updateError} = await db
      .from('produtos')
        .update({ ativo: opcaostatus === 'true' })
      .eq('id', opcaoselecionada)

      if(updateError){
        Swal.fire({
            icon:'error',
            title:'erro no banco de dados',
            text: updateError.message,
        })
      }
    else{
        Swal.fire({
            icon: 'success',
            title: 'status atualizado',
            timer:200
        })
        
      
        renderizarOptionsProdutos()
    }

  
    
 }
 
//deletar produto// Função para Deletar o Produto Selecionado
async function handleDeleteProduct() {
    const select = document.getElementById('select-editar-produto');
    const idProduto = select.value;
    const opcaoSelecionada = select.options[select.selectedIndex];

    if (!idProduto) {
        Swal.fire({
            icon: 'warning',
            title: 'Atenção',
            text: 'Selecione um produto para excluir.'
        });
        return;
    }

    const nomeProduto = opcaoSelecionada.dataset.nome;
    const imagemUrl = opcaoSelecionada.dataset.imagem;

    // Confirmação com SweetAlert2
    const confirmacao = await Swal.fire({
        title: 'Tem certeza?',
        text: `Deseja realmente excluir o produto "${nomeProduto}"? Esta ação não poderá ser desfeita!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d32f2f',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sim, excluir!',
        cancelButtonText: 'Cancelar'
    });

    if (!confirmacao.isConfirmed) return;

    try {
        // 1. Opcional: Remover a imagem do Supabase Storage se existir
        if (imagemUrl) {
            // Extrai o nome do arquivo a partir da URL pública
            const partesUrl = imagemUrl.split('/');
            const nomeArquivo = partesUrl[partesUrl.length - 1];

            if (nomeArquivo) {
                await db.storage
                    .from('produtos-imagens')
                    .remove([nomeArquivo]);
            }
        }

        // 2. Excluir o registro no Banco de Dados
        const { error: dbError } = await db
            .from('produtos')
            .delete()
            .eq('id', idProduto);

        if (dbError) throw dbError;

        await Swal.fire({
            icon: 'success',
            title: 'Excluído!',
            text: 'O produto foi removido com sucesso.',
            timer: 1200,
            showConfirmButton: false
        });

        location.reload();

    } catch (error) {
        console.error('Erro ao excluir produto:', error.message);
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Não foi possível excluir o produto.'
        });
    }
}
// 2. Carrega a foto atual e o nome no formulário quando o usuário seleciona um produto
function carregarDadosEdicao(idProduto) {
    const select = document.getElementById('select-editar-produto');
    const opcaoSelecionada = select.options[select.selectedIndex];

    const inputNome = document.getElementById('edit-nome-produto');
    const imgAtual = document.getElementById('preview-foto-atual');
    const imgNova = document.getElementById('preview-foto-nova');
    const inputFoto = document.getElementById('edit-foto-produto');

    if (!idProduto) {
        inputNome.value = '';
        imgAtual.src = '';
        imgAtual.style.display = 'none'; // Esconde o elemento se nada for selecionado
        imgNova.src = '';
        imgNova.style.display = 'none';
        inputFoto.value = '';
        return;
    }

    // Pega as informações gravadas no dataset do option selecionado
    inputNome.value = opcaoSelecionada.dataset.nome || '';
    
    const urlFotoBanco = opcaoSelecionada.dataset.imagem;
    if (urlFotoBanco) {
        imgAtual.src = urlFotoBanco;
        imgAtual.style.display = 'block';
    } else {
        imgAtual.src = '';
        imgAtual.style.display = 'none';
    }

    // Reseta a prévia da nova foto
    imgNova.src = '';
    imgNova.style.display = 'none';
    inputFoto.value = '';
}
function previewNovaImagem(event) {
    const arquivo = event.target.files[0];
    const preview = document.getElementById('preview-foto-nova');

    if (arquivo) {
        preview.src = URL.createObjectURL(arquivo);
        preview.style.display = 'block';
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
}