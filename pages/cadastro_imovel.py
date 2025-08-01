# pages/cadastro_imovel.py - VERSÃO REFATORADA
import streamlit as st
from components.form_components import FormManager
from locacao.repositories.imovel_repository import inserir_imovel

def render():
    st.title("🏠 Cadastro de Imóvel")

    # === SEÇÃO 1: SELEÇÃO/CADASTRO DE CLIENTE ===
    st.subheader("👤 Cliente Responsável")
    id_cliente, cliente_data = FormManager.cliente_selector("imovel")
    
    if not id_cliente:
        st.info("Selecione ou cadastre um cliente para continuar.")
        return

    # === SEÇÃO 2: SELEÇÃO/CADASTRO DE INQUILINO ===
    st.divider()
    st.subheader("👥 Inquilino Responsável")
    id_inquilino, inquilino_data = FormManager.inquilino_selector("imovel")
    
    if not id_inquilino:
        st.info("Selecione ou cadastre um inquilino para continuar.")
        return

    # === SEÇÃO 3: DADOS DO IMÓVEL ===
    st.divider()
    st.subheader("🏠 Informações do Imóvel")
    
    with st.form("form_imovel"):
        # Dados básicos
        col1, col2 = st.columns(2)
        with col1:
            tipo = st.selectbox("Tipo do Imóvel", ["Apartamento", "Casa", "Sala Comercial", "Galpão", "Outro"])
            endereco = st.text_input("Endereço")
            valor_aluguel = st.number_input("Valor do Aluguel", step=0.01)
            iptu = st.number_input("Valor do IPTU", step=0.01)
            status = st.selectbox("Status", ["Disponível", "Ocupado", "Em manutenção", "Inativo"])
            
        with col2:
            condominio = st.number_input("Valor do Condomínio", step=0.01)
            taxa_incendio = st.number_input("Taxa de Incêndio", step=0.01)
            matricula_imovel = st.text_input("Matrícula do Imóvel")
            area_imovel = st.text_input("Área do Imóvel (total/privativa)")
            permite_pets = st.checkbox("Permite Animais?")

        # Dados adicionais
        st.subheader("📦 Informações Adicionais")
        col1, col2 = st.columns(2)
        with col1:
            dados_imovel = st.text_area("Dados do Imóvel (suíte, copa, etc.)")
            info_iptu = st.text_area("Informações sobre IPTU")
            observacoes_condominio = st.text_area("Observações do Condomínio")
            copel_unidade_consumidora = st.text_input("Copel - Unidade Consumidora")
            
        with col2:
            sanepar_matricula = st.text_input("Sanepar - Matrícula")
            tem_gas = st.checkbox("Tem Gás?")
            info_gas = st.text_area("Informações sobre Gás")
            boleto_condominio = st.checkbox("Boleto do Condomínio incluso?")

        # Botão de submissão
        submitted = st.form_submit_button("💾 Salvar Imóvel", use_container_width=True)

        if submitted:
            try:
                # Preparar dados para inserção
                dados_imovel_db = (
                    id_cliente, tipo, endereco, valor_aluguel, iptu, condominio,
                    taxa_incendio, status, matricula_imovel, area_imovel, dados_imovel,
                    int(permite_pets), info_iptu, observacoes_condominio,
                    copel_unidade_consumidora, sanepar_matricula, int(tem_gas),
                    info_gas, int(boleto_condominio), id_inquilino
                )
                
                inserir_imovel(dados_imovel_db)
                st.success("✅ Imóvel salvo com sucesso!")
                
                # Mostrar resumo
                with st.expander("📋 Resumo do Cadastro"):
                    col1, col2 = st.columns(2)
                    with col1:
                        st.write("**Cliente:**", cliente_data.get('nome', 'N/A'))
                        st.write("**Tipo:**", tipo)
                        st.write("**Endereço:**", endereco)
                    with col2:
                        st.write("**Inquilino:**", inquilino_data.get('nome', 'N/A'))
                        st.write("**Aluguel:**", f"R$ {valor_aluguel:,.2f}")
                        st.write("**Status:**", status)
                        
            except Exception as e:
                st.error(f"❌ Erro ao salvar o imóvel: {e}")
                
    # === SEÇÃO 4: INFORMAÇÕES RESUMO ===
    if id_cliente and id_inquilino:
        st.divider()
        st.subheader("📊 Resumo dos Vínculos")
        col1, col2 = st.columns(2)
        
        with col1:
            st.info(f"""
            **👤 Cliente Selecionado**
            - **Nome:** {cliente_data.get('nome', 'N/A')}
            - **CPF/CNPJ:** {cliente_data.get('cpf_cnpj', 'N/A')}
            """)
            
        with col2:
            st.info(f"""
            **👥 Inquilino Selecionado**
            - **Nome:** {inquilino_data.get('nome', 'N/A')}
            - **ID:** {id_inquilino}
            """)