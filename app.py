import streamlit as st
import pandas as pd
import pyodbc

st.set_page_config(page_title="Cobimob", layout="wide")

# Conexão com o banco (ajuste os dados aí, camarada)
def conectar():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=SRVTESTES\\SQLTESTES;"
        "DATABASE=Cobimob;"
        "UID=srvcondo1;"
        "PWD=2022@Condo"
    )

# Aba de navegação
aba = st.sidebar.selectbox("Escolha a funcionalidade", ["📋 Cadastro", "📊 Prestação de Contas"])

if aba == "📋 Cadastro":
    st.title("Cadastro de Novos Dados")

    op = st.selectbox("O que deseja cadastrar?", ["Cliente", "Imóvel", "Inquilino", "Contrato"])

    if op == "Cliente":
        nome = st.text_input("Nome")
        cpf_cnpj = st.text_input("CPF/CNPJ")
        telefone = st.text_input("Telefone")
        email = st.text_input("Email")
        endereco = st.text_input("Endereço")
        tipo_recebimento = st.selectbox("Tipo de recebimento", ["pix", "boleto", "ted", "depósito"])
        conta_bancaria = st.text_input("Conta bancária")
        deseja_fci = st.checkbox("Deseja FCI?")
        deseja_seguro = st.checkbox("Exige seguro-fiança?")

        if st.button("Cadastrar Cliente"):
            conn = conectar()
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO Clientes (nome, cpf_cnpj, telefone, email, endereco, tipo_recebimento, conta_bancaria, deseja_fci, deseja_seguro_fianca)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, nome, cpf_cnpj, telefone, email, endereco, tipo_recebimento, conta_bancaria, int(deseja_fci), int(deseja_seguro))
            conn.commit()
            cur.close()
            conn.close()
            st.success("Cliente cadastrado com sucesso!")

    # Dá pra seguir com as outras tabelas seguindo o mesmo esquema...

elif aba == "📊 Prestação de Contas":
    st.title("Prestação de Contas Mensais")
    
    mes = st.selectbox("Mês de Referência", [f"{m:02d}/2025" for m in range(1, 13)])
    contrato_id = st.text_input("ID do Contrato")
    
    entrada = st.number_input("Valor de entrada (recebido do inquilino)", min_value=0.0)
    repasse = st.number_input("Valor do repasse ao proprietário", min_value=0.0)
    taxas = st.number_input("Taxas cobradas", min_value=0.0)
    
    if st.button("Lançar Prestação"):
        conn = conectar()
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO PrestacaoContas (id_contrato, mes_referencia, entrada, repasse, taxas)
            VALUES (?, ?, ?, ?, ?)
        """, contrato_id, mes, entrada, repasse, taxas)
        conn.commit()
        cur.close()
        conn.close()
        st.success("Prestação de contas lançada com sucesso!")

