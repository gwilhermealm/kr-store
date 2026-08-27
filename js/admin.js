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
    const marca = document.querySelector('#marca-produto').value;
    const fotoArquivo = document.getElementById('foto-produto').files[0];
  
if (!nome || !preco || !marca || !fotoArquivo) {
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
        const nomeArquivo = `${Date.now()}_${fotoArquivo.name}`;
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
                { nome, marca, preco: parseFloat(preco), imagem_url: fotoUrl }
            ]);

        if (dbError) throw dbError;

        Swal.fire({
            title: "Sucesso!",
            text: "Produto cadastrado com sucesso!",
            icon: "success",
            timer:1000
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
    // 1. Busca os produtos no Supabase (ajuste 'produtos' para o nome da sua tabela)
    const { data: produtos, error } = await db
        .from('produtos') 
        .select('id, nome, preco, em_estoque');

    if (error) {
        console.error('Erro ao buscar produtos:', error.message);
        return;
    }

    // 2. Seleciona os elementos do HTML
    const selectPreco = document.getElementById('select-preco-produto');
    const selectEstoque = document.getElementById('select-estoque-produto');

    // 3. Limpa as opções atuais e adiciona a padrão
    const templatePadrao = '<option value="">Selecione um produto...</option>';
    selectPreco.innerHTML = templatePadrao;
    selectEstoque.innerHTML = templatePadrao;

    // 4. Preenche os selects com os dados do banco
    produtos.forEach(produto => {
        // Option para o select de Preço
        const optionPreco = document.createElement('option');
        optionPreco.value = produto.id;
        optionPreco.textContent = `${produto.nome} - Atual: R$ ${produto.preco.toFixed(2)}`;
        selectPreco.appendChild(optionPreco);

        // Option para o select de Estoque
        const optionEstoque = document.createElement('option');
        optionEstoque.value = produto.id;
        optionEstoque.textContent = `${produto.nome} - status atual > ${produto.em_estoque}`;
        selectEstoque.appendChild(optionEstoque);
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
      .update({em_estoque: opcaostatus})
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
 

