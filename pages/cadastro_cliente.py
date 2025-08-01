# pages/cadastro_cliente.py - VERSÃO REFATORADA
import streamlit as st
from components.form_components import FormManager
from locacao.repositories.cliente_repository import inserir_cliente

def render():
    st.title("📋 Cadastro de Cliente")
    
    # Usar o formulário reutilizável
    dados_cliente, form_submitted = FormManager.cliente_form(
        key_prefix="cliente_standalone",
        in_modal=False,
        show_submit=True,
        submit_label="💾 Cadastrar Cliente"
    )
    
    if form_submitted:
        try:
            inserir_cliente(**dados_cliente)
            st.success(f"✅ Cliente '{dados_cliente['nome']}' cadastrado com sucesso!")
            
            # Mostrar resumo do que foi cadastrado
            with st.expander("📋 Resumo do Cadastro"):
                col1, col2 = st.columns(2)
                with col1:
                    st.write("**Nome:**", dados_cliente['nome'])
                    st.write("**CPF/CNPJ:**", dados_cliente['cpf_cnpj'])
                    st.write("**Telefone:**", dados_cliente['telefone'])
                    st.write("**Email:**", dados_cliente['email'])
                    
                with col2:
                    st.write("**Tipo:**", dados_cliente['tipo_cliente'])
                    st.write("**Recebimento:**", dados_cliente['tipo_recebimento'])
                    st.write("**FCI:**", dados_cliente['deseja_fci'])
                    st.write("**Seguro Fiança:**", dados_cliente['deseja_seguro_fianca'])
                    
        except Exception as e:
            st.error(f"❌ Erro ao cadastrar cliente: {e}")