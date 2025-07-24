import streamlit as st
from dotenv import load_dotenv
import os
from locacao.repositories.cliente_repository import inserir_cliente

load_dotenv()

def render():
    st.title("📋 Cadastro de Cliente")

    with st.form("form_cliente"):
        nome = st.text_input("Nome")
        cpf_cnpj = st.text_input("CPF/CNPJ")
        rg = st.text_input("RG")
        dados_empresa = st.text_area("Dados da empresa (CNPJ, endereço etc)")
        representante = st.text_input("Representante legal (se houver)")
        nacionalidade = st.text_input("Nacionalidade")
        estado_civil = st.text_input("Estado civil")
        profissao = st.text_input("Profissão")
        data_nascimento = st.date_input("Data de Nascimento")

        telefone = st.text_input("Telefone")
        email = st.text_input("Email")
        endereco = st.text_area("Endereço")

        tipo_recebimento = st.selectbox("Forma de Recebimento", ["PIX", "TED", "Boleto", "Depósito"])
        conta_bancaria = st.text_input("Conta Bancária")

        deseja_fci = st.checkbox("Deseja FCI?")
        deseja_seguro_fianca = st.checkbox("Deseja Seguro Fiança?")
        deseja_seguro_incendio = st.checkbox("Deseja Seguro Incêndio?")

        tipo_cliente = st.selectbox("Tipo de Cliente", ["Residencial", "Comercial", "Industrial"])

        st.subheader("Informações do Cônjuge (se aplicável)")
        nome_conjuge = st.text_input("Nome do cônjuge")
        cpf_conjuge = st.text_input("CPF do cônjuge")
        rg_conjuge = st.text_input("RG do cônjuge")
        endereco_conjuge = st.text_input("Endereço do cônjuge")
        telefone_conjuge = st.text_input("Telefone do cônjuge")

        submitted = st.form_submit_button("Cadastrar")
        if submitted:
            try:
                inserir_cliente(
                    nome=nome,
                    cpf_cnpj=cpf_cnpj,
                    telefone=telefone,
                    email=email,
                    endereco=endereco,
                    tipo_recebimento=tipo_recebimento,
                    conta_bancaria=conta_bancaria,
                    deseja_fci="Sim" if deseja_fci else "Não",
                    deseja_seguro_fianca="Sim" if deseja_seguro_fianca else "Não",
                    deseja_seguro_incendio="Sim" if deseja_seguro_incendio else "Não",
                    rg=rg,
                    dados_empresa=dados_empresa,
                    representante=representante,
                    nacionalidade=nacionalidade,
                    estado_civil=estado_civil,
                    profissao=profissao,
                    existe_conjuge=1 if nome_conjuge else 0,
                    nome_conjuge=nome_conjuge,
                    cpf_conjuge=cpf_conjuge,
                    rg_conjuge=rg_conjuge,
                    endereco_conjuge=endereco_conjuge,
                    telefone_conjuge=telefone_conjuge,
                    tipo_cliente=tipo_cliente,
                    data_nascimento=data_nascimento
                )
                st.success(f"Cliente '{nome}' cadastrado com sucesso!")
            except Exception as e:
                st.error(f"Erro ao cadastrar cliente: {e}")
