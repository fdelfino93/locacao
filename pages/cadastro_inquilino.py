# pages/cadastro_inquilino.py - VERSÃO REFATORADA
import streamlit as st
from components.form_components import FormManager
from locacao.repositories.inquilino_repository import inserir_inquilino

def render():
    st.title("👥 Cadastro de Inquilino")
    
    # Usar o formulário reutilizável
    dados_inquilino, form_submitted = FormManager.inquilino_form(
        key_prefix="inquilino_standalone",
        in_modal=False,
        show_submit=True,
        submit_label="💾 Cadastrar Inquilino"
    )
    
    if form_submitted:
        try:
            inserir_inquilino(dados_inquilino)
            st.success(f"✅ Inquilino '{dados_inquilino['nome']}' cadastrado com sucesso!")
            
            # Mostrar resumo do que foi cadastrado
            with st.expander("📋 Resumo do Cadastro"):
                col1, col2 = st.columns(2)
                with col1:
                    st.write("**Nome:**", dados_inquilino['nome'])
                    st.write("**CPF/CNPJ:**", dados_inquilino['cpf_cnpj'])
                    st.write("**Telefone:**", dados_inquilino['telefone'])
                    st.write("**Email:**", dados_inquilino['email'])
                    
                with col2:
                    st.write("**Garantia:**", dados_inquilino['tipo_garantia'])
                    st.write("**Estado Civil:**", dados_inquilino['estado_civil'])
                    st.write("**Profissão:**", dados_inquilino['profissao'])
                    if dados_inquilino['pet_inquilino']:
                        st.write("**Pets:**", f"{dados_inquilino['qtd_pet_inquilino']} ({dados_inquilino['porte_pet']})")
                    
        except Exception as e:
            st.error(f"❌ Erro ao cadastrar inquilino: {e}")