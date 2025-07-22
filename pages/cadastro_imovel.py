import streamlit as st
import pyodbc
import pandas as pd

def get_conexao():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=SRVTESTES\\SQLTESTES;"
        "DATABASE=Cobimob;"
        "UID=srvcondo1;"
        "PWD=2022@Condo"
    )

def buscar_clientes():
    with get_conexao() as conn:
        return pd.read_sql("SELECT id, nome FROM Clientes", conn)

def render():
    st.title("🏠 Cadastro de Imóvel")

    df_clientes = buscar_clientes()
    nomes_clientes = df_clientes["nome"].tolist()

    st.subheader("Cliente responsável pelo imóvel")

    opcao = st.selectbox(
        "Você quer usar um cliente existente ou cadastrar um novo?",
        ["", "🔍 Buscar cliente existente", "➕ Cadastrar novo cliente"]
    )

    id_cliente = None

    if opcao == "🔍 Buscar cliente existente":
        nome_cliente = st.selectbox("Selecione o Cliente", [""] + nomes_clientes)
        if nome_cliente:
            id_cliente = df_clientes[df_clientes["nome"] == nome_cliente]["id"].values[0]

    elif opcao == "➕ Cadastrar novo cliente":
        st.info("Preencha os dados do novo cliente:")
        nome_novo = st.text_input("Nome completo")
        email_novo = st.text_input("E-mail")
        telefone_novo = st.text_input("Telefone")

        if nome_novo and st.button("Salvar novo cliente"):
            try:
                with get_conexao() as conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        INSERT INTO Clientes (nome, email, telefone)
                        OUTPUT INSERTED.id
                        VALUES (?, ?, ?)
                    """, (nome_novo, email_novo, telefone_novo))
                    id_cliente = cursor.fetchone()[0]
                    conn.commit()
                st.success(f"Cliente '{nome_novo}' cadastrado com sucesso!")
            except Exception as e:
                st.error(f"Erro ao salvar cliente: {e}")

    # Só renderiza o formulário do imóvel se o ID do cliente estiver definido
    if id_cliente:
        st.divider()
        st.subheader("📝 Informações do imóvel")

        tipo = st.selectbox("Tipo do Imóvel", ["Apartamento", "Casa", "Sala Comercial", "Galpão", "Outro"])
        endereco = st.text_input("Endereço")
        cidade = st.text_input("Cidade")
        estado = st.text_input("Estado")
        cep = st.text_input("CEP")
        metragem = st.number_input("Metragem (m²)", step=1.0)
        num_quartos = st.number_input("Número de Quartos", step=1, min_value=0)
        num_banheiros = st.number_input("Número de Banheiros", step=1, min_value=0)
        num_vagas = st.number_input("Número de Vagas", step=1, min_value=0)
        mobiliado = st.checkbox("Mobiliado")

        if st.button("Salvar Imóvel"):
            try:
                with get_conexao() as conn:
                    cursor = conn.cursor()
                    cursor.execute("""
                        INSERT INTO Imoveis (
                            id_cliente, tipo, endereco, cidade, estado,
                            cep, metragem, num_quartos, num_banheiros,
                            num_vagas, mobiliado
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        id_cliente, tipo, endereco, cidade, estado,
                        cep, metragem, num_quartos, num_banheiros,
                        num_vagas, mobiliado
                    ))
                    conn.commit()
                st.success("Imóvel cadastrado com sucesso!")
            except Exception as e:
                st.error(f"Erro ao salvar o imóvel: {e}")
