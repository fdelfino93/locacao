
import streamlit as st

def render():
    st.title("Cadastro de Cliente")
    with st.form("form_cliente"):
        nome = st.text_input("Nome")
        cpf_cnpj = st.text_input("CPF/CNPJ")
        telefone = st.text_input("Telefone")
        email = st.text_input("Email")
        endereco = st.text_area("Endereço")
        tipo_recebimento = st.selectbox("Forma de Recebimento", ["PIX", "TED", "Boleto", "Depósito"])
        conta_bancaria = st.text_input("Conta Bancária")
        deseja_fci = st.checkbox("Deseja FCI?")
        deseja_seguro_fianca = st.checkbox("Deseja Seguro Fiança?")
        submitted = st.form_submit_button("Cadastrar")
        if submitted:
            st.success(f"Cliente {nome} cadastrado com sucesso!")
