
import streamlit as st

def render():
    st.title("Cadastro de Inquilino")
    with st.form("form_inquilino"):
        nome = st.text_input("Nome")
        cpf_cnpj = st.text_input("CPF/CNPJ")
        telefone = st.text_input("Telefone")
        email = st.text_input("Email")
        tipo_garantia = st.selectbox("Tipo de Garantia", ["Fiador", "Caução", "Seguro-fiança", "Título de Capitalização", "Sem garantia"])
        agua = st.checkbox("Responsável por água?")
        luz = st.checkbox("Responsável por luz?")
        gas = st.checkbox("Responsável por gás?")
        submitted = st.form_submit_button("Cadastrar")
        if submitted:
            st.success(f"Inquilino {nome} cadastrado com sucesso!")
