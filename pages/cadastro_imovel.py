import streamlit as st
import pandas as pd
from locacao.repositories.imovel_repository import buscar_clientes, inserir_imovel, buscar_imoveis
from locacao.repositories.cliente_repository import inserir_cliente  # 👈 necessário importar

def render():
    st.title("🏠 Cadastro de Imóvel")

    # Busca clientes com segurança
    try:
        clientes_raw = buscar_clientes()
        df_clientes = pd.DataFrame(clientes_raw, columns=["id", "nome"])
        nomes_clientes = df_clientes["nome"].tolist()
    except Exception as e:
        st.error(f"Erro ao buscar clientes: {e}")
        return

    st.subheader("Cliente responsável pelo imóvel")

    opcao = st.selectbox(
        "Você quer usar um cliente existente ou cadastrar um novo?",
        ["", "🔍 Buscar cliente existente", "🆕 Cadastrar novo cliente"]
    )

    id_cliente = None

    if opcao == "🔍 Buscar cliente existente":
        nome_cliente = st.selectbox("Selecione o Cliente", [""] + nomes_clientes)
        if nome_cliente:
            id_cliente = df_clientes[df_clientes["nome"] == nome_cliente]["id"].values[0]

    elif opcao == "🆕 Cadastrar novo cliente":
        st.subheader("📋 Cadastro de Novo Cliente")
        nome = st.text_input("Nome Completo")
        cpf_cnpj = st.text_input("CPF/CNPJ")
        telefone = st.text_input("Telefone")
        email = st.text_input("Email")
        endereco = st.text_input("Endereço")
        tipo_recebimento = st.selectbox("Tipo de Recebimento", ["Pix", "Conta Corrente", "Conta Poupança"])
        conta_bancaria = st.text_input("Conta Bancária")
        deseja_fci = st.checkbox("Deseja FCI?")
        deseja_seguro_fianca = st.checkbox("Deseja Seguro Fiança?")
        tipo_cliente = st.selectbox("Tipo de Cliente", ["Proprietário", "Inquilino"])
        data_nascimento = st.date_input("Data de Nascimento")

        if st.button("Salvar Cliente"):
            try:
                inserir_cliente(nome, cpf_cnpj, telefone, email, endereco, tipo_recebimento,
                                conta_bancaria, int(deseja_fci), int(deseja_seguro_fianca),
                                tipo_cliente, data_nascimento)
                st.success("Cliente cadastrado com sucesso!")
                st.experimental_rerun()  # 👈 recarrega para aparecer no selectbox
            except Exception as e:
                st.error(f"Erro ao cadastrar cliente: {e}")
        return  # evita ir pra parte do imóvel antes de ter cliente

    if id_cliente:
        st.divider()
        st.subheader("📝 Informações do imóvel")

        tipo = st.selectbox("Tipo do Imóvel", ["Apartamento", "Casa", "Sala Comercial", "Galpão", "Outro"])
        endereco = st.text_input("Endereço")
        valor_aluguel = st.number_input("Valor do Aluguel", step=0.01)
        iptu = st.number_input("Valor do IPTU", step=0.01)
        condominio = st.number_input("Valor do Condomínio", step=0.01)
        taxa_incendio = st.number_input("Taxa de Incêndio", step=0.01)
        status = st.selectbox("Status", ["Disponível", "Ocupado", "Em manutenção", "Inativo"])

        st.subheader("📦 Campos adicionais")

        matricula_imovel = st.text_input("Matrícula do Imóvel")
        area_imovel = st.text_input("Área do Imóvel (total/privativa)")
        dados_imovel = st.text_area("Dados do Imóvel (suíte, copa, etc.)")
        permite_pets = st.checkbox("Permite Animais?")
        info_iptu = st.text_area("Informações sobre IPTU")
        observacoes_condominio = st.text_area("Observações do Condomínio")
        copel_unidade_consumidora = st.text_input("Copel - Unidade Consumidora")
        sanepar_matricula = st.text_input("Sanepar - Matrícula")
        tem_gas = st.checkbox("Tem Gás?")
        info_gas = st.text_area("Informações sobre Gás")
        boleto_condominio = st.checkbox("Boleto do Condomínio incluso?")

        if st.button("Salvar Imóvel"):
            try:
                dados = (
                    id_cliente, tipo, endereco, valor_aluguel, iptu, condominio,
                    taxa_incendio, status, matricula_imovel, area_imovel, dados_imovel,
                    int(permite_pets), info_iptu, observacoes_condominio,
                    copel_unidade_consumidora, sanepar_matricula, int(tem_gas),
                    info_gas, int(boleto_condominio)
                )
                inserir_imovel(dados)
                st.success("Imóvel salvo com sucesso!")
            except Exception as e:
                st.error(f"Erro ao salvar o imóvel: {e}")
