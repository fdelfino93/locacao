# components/form_components.py
import streamlit as st
from typing import Dict, Optional, Tuple
import pandas as pd
from locacao.repositories.cliente_repository import inserir_cliente, buscar_clientes
from locacao.repositories.inquilino_repository import inserir_inquilino, buscar_inquilinos

class FormManager:
    """Gerenciador central para formulários reutilizáveis"""
    
    @staticmethod
    def cliente_form(
        key_prefix: str = "",
        in_modal: bool = False,
        show_submit: bool = True,
        submit_label: str = "Cadastrar Cliente"
    ) -> Tuple[Optional[Dict], bool]:
        """
        Formulário reutilizável de cliente
        
        Returns:
            tuple: (dados_cliente, form_submitted)
        """
        
        if in_modal:
            st.subheader("📋 Cadastro de Cliente")
        
        # Container para organizar campos
        with st.container():
            col1, col2 = st.columns(2)
            
            with col1:
                nome = st.text_input("Nome Completo", key=f"{key_prefix}_nome")
                cpf_cnpj = st.text_input("CPF/CNPJ", key=f"{key_prefix}_cpf")
                rg = st.text_input("RG", key=f"{key_prefix}_rg")
                nacionalidade = st.text_input("Nacionalidade", key=f"{key_prefix}_nacionalidade")
                estado_civil = st.text_input("Estado civil", key=f"{key_prefix}_estado_civil")
                profissao = st.text_input("Profissão", key=f"{key_prefix}_profissao")
                tipo_recebimento = st.selectbox(
                    "Forma de Recebimento", 
                    ["PIX", "TED", "Boleto", "Depósito"],
                    key=f"{key_prefix}_tipo_recebimento"
                )
                tipo_cliente = st.selectbox(
                    "Tipo de Cliente", 
                    ["Residencial", "Comercial", "Industrial"],
                    key=f"{key_prefix}_tipo_cliente"
                )
                data_nascimento = st.date_input("Data de Nascimento", key=f"{key_prefix}_data_nasc")
                
            with col2:
                telefone = st.text_input("Telefone", key=f"{key_prefix}_telefone")
                email = st.text_input("Email", key=f"{key_prefix}_email")
                endereco = st.text_area("Endereço", key=f"{key_prefix}_endereco")
                conta_bancaria = st.text_input("Conta Bancária", key=f"{key_prefix}_conta")
                dados_empresa = st.text_area("Dados da empresa", key=f"{key_prefix}_dados_empresa")
                representante = st.text_input("Representante legal", key=f"{key_prefix}_representante")
        
        # Checkboxes de preferências
        col1, col2, col3 = st.columns(3)
        with col1:
            deseja_fci = st.checkbox("Deseja FCI?", key=f"{key_prefix}_fci")
        with col2:
            deseja_seguro_fianca = st.checkbox("Deseja Seguro Fiança?", key=f"{key_prefix}_seg_fianca")
        with col3:
            deseja_seguro_incendio = st.checkbox("Deseja Seguro Incêndio?", key=f"{key_prefix}_seg_incendio")
        
        # Seção cônjuge
        existe_conjuge = st.selectbox(
            "Possui cônjuge?", 
            ["", "Sim", "Não"],
            key=f"{key_prefix}_existe_conjuge"
        )
        existe_conjuge_flag = 1 if existe_conjuge == "Sim" else 0 if existe_conjuge == "Não" else None
        
        nome_conjuge = cpf_conjuge = rg_conjuge = endereco_conjuge = telefone_conjuge = None
        
        if existe_conjuge_flag == 1:
            st.subheader("Informações do Cônjuge")
            col1, col2 = st.columns(2)
            with col1:
                nome_conjuge = st.text_input("Nome do cônjuge", key=f"{key_prefix}_nome_conjuge")
                cpf_conjuge = st.text_input("CPF do cônjuge", key=f"{key_prefix}_cpf_conjuge")
                rg_conjuge = st.text_input("RG do cônjuge", key=f"{key_prefix}_rg_conjuge")
            with col2:
                endereco_conjuge = st.text_input("Endereço do cônjuge", key=f"{key_prefix}_endereco_conjuge")
                telefone_conjuge = st.text_input("Telefone do cônjuge", key=f"{key_prefix}_telefone_conjuge")
        
        # Preparar dados para retorno
        dados_cliente = {
            "nome": nome,
            "cpf_cnpj": cpf_cnpj,
            "telefone": telefone,
            "email": email,
            "endereco": endereco,
            "tipo_recebimento": tipo_recebimento,
            "conta_bancaria": conta_bancaria,
            "deseja_fci": "Sim" if deseja_fci else "Não",
            "deseja_seguro_fianca": "Sim" if deseja_seguro_fianca else "Não",
            "deseja_seguro_incendio": "Sim" if deseja_seguro_incendio else "Não",
            "rg": rg,
            "dados_empresa": dados_empresa,
            "representante": representante,
            "nacionalidade": nacionalidade,
            "estado_civil": estado_civil,
            "profissao": profissao,
            "existe_conjuge": existe_conjuge_flag,
            "nome_conjuge": nome_conjuge,
            "cpf_conjuge": cpf_conjuge,
            "rg_conjuge": rg_conjuge,
            "endereco_conjuge": endereco_conjuge,
            "telefone_conjuge": telefone_conjuge,
            "tipo_cliente": tipo_cliente,
            "data_nascimento": data_nascimento
        }
        
        form_submitted = False
        if show_submit:
            if st.button(submit_label, key=f"{key_prefix}_submit_cliente"):
                form_submitted = True
                
        return dados_cliente, form_submitted
    
    @staticmethod
    def inquilino_form(
        key_prefix: str = "",
        in_modal: bool = False,
        show_submit: bool = True,
        submit_label: str = "Cadastrar Inquilino"
    ) -> Tuple[Optional[Dict], bool]:
        """
        Formulário reutilizável de inquilino
        
        Returns:
            tuple: (dados_inquilino, form_submitted)
        """
        
        if in_modal:
            st.subheader("📋 Cadastro de Inquilino")
            
        with st.container():
            col1, col2 = st.columns(2)
            
            with col1:
                nome = st.text_input("Nome do inquilino", key=f"{key_prefix}_inq_nome")
                cpf_cnpj = st.text_input("CPF/CNPJ", key=f"{key_prefix}_inq_cpf")
                telefone = st.text_input("Telefone", key=f"{key_prefix}_inq_telefone")
                email = st.text_input("Email", key=f"{key_prefix}_inq_email")
                responsavel_pgto_agua = st.text_input("Responsável pagamento água", key=f"{key_prefix}_inq_agua")
                responsavel_pgto_gas = st.text_input("Responsável pagamento gás", key=f"{key_prefix}_inq_gas")
                rg = st.text_input("RG", key=f"{key_prefix}_inq_rg")
                dados_empresa = st.text_area("Dados da empresa", key=f"{key_prefix}_inq_empresa")
                nacionalidade = st.text_input("Nacionalidade", key=f"{key_prefix}_inq_nacionalidade")
                profissao = st.text_input("Profissão", key=f"{key_prefix}_inq_profissao")
                Endereco_inq = st.text_input("Endereço responsável", key=f"{key_prefix}_inq_endereco")
                representante = st.text_input("Representante legal", key=f"{key_prefix}_inq_representante")
                
            with col2:
                tipo_garantia = st.selectbox(
                    "Tipo de Garantia", 
                    ["Fiador", "Caução", "Seguro-fiança", "Título de Capitalização", "Sem garantia"],
                    key=f"{key_prefix}_inq_garantia"
                )
                responsavel_pgto_luz = st.text_input("Responsável pagamento luz", key=f"{key_prefix}_inq_luz")
                estado_civil = st.text_input("Estado civil", key=f"{key_prefix}_inq_estado_civil")
                dados_moradores = st.text_area("Dados moradores", key=f"{key_prefix}_inq_moradores")
                
                responsavel_inq_opcao = st.selectbox(
                    "É o responsável pela locação?", 
                    ["", "Sim", "Não"],
                    key=f"{key_prefix}_inq_responsavel_opcao"
                )
                responsavel_inq = 1 if responsavel_inq_opcao == "Sim" else 0 if responsavel_inq_opcao == "Não" else None
        
        # Seção dependentes
        dependentes_inq_opcao = st.selectbox(
            "Possui dependentes?", 
            ["", "Sim", "Não"],
            key=f"{key_prefix}_inq_dependentes_opcao"
        )
        dependentes_inq = 1 if dependentes_inq_opcao == "Sim" else 0 if dependentes_inq_opcao == "Não" else None
        qtd_dependentes_inq = st.number_input(
            "Quantidade de dependentes", 
            min_value=0, 
            step=1, 
            key=f"{key_prefix}_inq_qtd_dependentes",
            disabled=(dependentes_inq != 1)
        )
        
        # Seção pets
        pet_inquilino_opcao = st.selectbox(
            "Possui pets?", 
            ["", "Sim", "Não"],
            key=f"{key_prefix}_inq_pet_opcao"
        )
        pet_inquilino = 1 if pet_inquilino_opcao == "Sim" else 0 if pet_inquilino_opcao == "Não" else None
        qtd_pet_inquilino = st.number_input(
            "Quantidade de pets", 
            min_value=0, 
            step=1, 
            key=f"{key_prefix}_inq_qtd_pets",
            disabled=(pet_inquilino != 1)
        )
        porte_pet = st.selectbox(
            "Porte do pet", 
            ["Pequeno", "Grande"],
            key=f"{key_prefix}_inq_porte_pet",
            disabled=(pet_inquilino != 1)
        )
        
        # Seção cônjuge
        existe_conjuge = st.selectbox(
            "Possui cônjuge?", 
            ["", "Sim", "Não"],
            key=f"{key_prefix}_inq_existe_conjuge"
        )
        nome_conjuge = cpf_conjuge = rg_conjuge = endereco_conjuge = telefone_conjuge = None
        
        if existe_conjuge == "Sim":
            st.subheader("Informações do Cônjuge")
            col1, col2 = st.columns(2)
            with col1:
                nome_conjuge = st.text_input("Nome do cônjuge", key=f"{key_prefix}_inq_nome_conjuge")
                cpf_conjuge = st.text_input("CPF do cônjuge", key=f"{key_prefix}_inq_cpf_conjuge")
                rg_conjuge = st.text_input("RG do cônjuge", key=f"{key_prefix}_inq_rg_conjuge")
            with col2:
                endereco_conjuge = st.text_input("Endereço do cônjuge", key=f"{key_prefix}_inq_endereco_conjuge")
                telefone_conjuge = st.text_input("Telefone do cônjuge", key=f"{key_prefix}_inq_telefone_conjuge")
        
        # Preparar dados para retorno
        dados_inquilino = {
            "nome": nome,
            "cpf_cnpj": cpf_cnpj,
            "telefone": telefone,
            "email": email,
            "tipo_garantia": tipo_garantia,
            "responsavel_pgto_agua": responsavel_pgto_agua,
            "responsavel_pgto_luz": responsavel_pgto_luz,
            "responsavel_pgto_gas": responsavel_pgto_gas,
            "rg": rg,
            "dados_empresa": dados_empresa,
            "representante": representante,
            "nacionalidade": nacionalidade,
            "estado_civil": estado_civil,
            "profissao": profissao,
            "dados_moradores": dados_moradores,
            "Endereco_inq": Endereco_inq,
            "responsavel_inq": responsavel_inq,
            "dependentes_inq": dependentes_inq,
            "qtd_dependentes_inq": qtd_dependentes_inq,
            "pet_inquilino": pet_inquilino,
            "qtd_pet_inquilino": qtd_pet_inquilino,
            "porte_pet": porte_pet,
            "nome_conjuge": nome_conjuge,
            "cpf_conjuge": cpf_conjuge,
            "rg_conjuge": rg_conjuge,
            "endereco_conjuge": endereco_conjuge,
            "telefone_conjuge": telefone_conjuge
        }
        
        form_submitted = False
        if show_submit:
            if st.button(submit_label, key=f"{key_prefix}_submit_inquilino"):
                form_submitted = True
                
        return dados_inquilino, form_submitted
    
    @staticmethod
    def cliente_selector(key_prefix: str = "") -> Tuple[Optional[int], Optional[Dict]]:
        """
        Seletor de cliente existente ou opção para cadastrar novo
        
        Returns:
            tuple: (id_cliente, dados_cliente_selecionado)
        """
        try:
            clientes_raw = buscar_clientes()
            df_clientes = pd.DataFrame(clientes_raw)
            nomes_clientes = df_clientes["nome"].tolist()
        except Exception as e:
            st.error(f"Erro ao buscar clientes: {e}")
            return None, None
        
        opcao = st.selectbox(
            "Cliente responsável pelo imóvel",
            ["", "🔍 Buscar cliente existente", "🆕 Cadastrar novo cliente"],
            key=f"{key_prefix}_opcao_cliente"
        )
        
        if opcao == "🔍 Buscar cliente existente":
            nome_cliente = st.selectbox(
                "Selecione o Cliente", 
                [""] + nomes_clientes,
                key=f"{key_prefix}_nome_cliente"
            )
            if nome_cliente:
                id_cliente = df_clientes[df_clientes["nome"] == nome_cliente]["id"].values[0]
                cliente_data = df_clientes[df_clientes["nome"] == nome_cliente].iloc[0].to_dict()
                return id_cliente, cliente_data
                
        elif opcao == "🆕 Cadastrar novo cliente":
            dados_cliente, form_submitted = FormManager.cliente_form(
                key_prefix=f"{key_prefix}_novo_cliente",
                in_modal=True,
                submit_label="Salvar Cliente"
            )
            
            if form_submitted:
                try:
                    inserir_cliente(**dados_cliente)
                    st.success("Cliente cadastrado com sucesso!")
                    st.rerun()
                except Exception as e:
                    st.error(f"Erro ao cadastrar cliente: {e}")
                    
        return None, None
    
    @staticmethod
    def inquilino_selector(key_prefix: str = "") -> Tuple[Optional[int], Optional[Dict]]:
        """
        Seletor de inquilino existente ou opção para cadastrar novo
        
        Returns:
            tuple: (id_inquilino, dados_inquilino_selecionado)
        """
        try:
            inquilinos_raw = buscar_inquilinos()
            df_inquilinos = pd.DataFrame(inquilinos_raw)
            nomes_inquilinos = df_inquilinos["nome"].tolist()
        except Exception as e:
            st.error(f"Erro ao buscar inquilinos: {e}")
            return None, None
        
        opcao_inq = st.selectbox(
            "Inquilino responsável pela locação",
            ["", "🔍 Buscar inquilino existente", "🆕 Cadastrar novo inquilino"],
            key=f"{key_prefix}_opcao_inquilino"
        )
        
        if opcao_inq == "🔍 Buscar inquilino existente":
            nome_inq = st.selectbox(
                "Selecione o Inquilino", 
                [""] + nomes_inquilinos,
                key=f"{key_prefix}_nome_inquilino"
            )
            if nome_inq:
                id_inquilino = df_inquilinos[df_inquilinos["nome"] == nome_inq]["id"].values[0]
                inquilino_data = df_inquilinos[df_inquilinos["nome"] == nome_inq].iloc[0].to_dict()
                return id_inquilino, inquilino_data
                
        elif opcao_inq == "🆕 Cadastrar novo inquilino":
            dados_inquilino, form_submitted = FormManager.inquilino_form(
                key_prefix=f"{key_prefix}_novo_inquilino",
                in_modal=True,
                submit_label="Salvar Inquilino"
            )
            
            if form_submitted:
                try:
                    inserir_inquilino(dados_inquilino)
                    st.success("Inquilino cadastrado com sucesso!")
                    st.rerun()
                except Exception as e:
                    st.error(f"Erro ao cadastrar inquilino: {e}")
                    
        return None, None