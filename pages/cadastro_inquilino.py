import streamlit as st
from locacao.repositories.inquilino_repository import inserir_inquilino

def render():
    st.title("Cadastro de Inquilino")

    with st.form("form_inquilino"):
        nome = st.text_input("Nome")
        cpf_cnpj = st.text_input("CPF/CNPJ")
        telefone = st.text_input("Telefone")
        email = st.text_input("Email")

        tipo_garantia = st.selectbox("Tipo de Garantia", [
            "Fiador", "Caução", "Seguro-fiança", "Título de Capitalização", "Sem garantia"
        ])

        responsavel_pgto_agua = st.text_input("Responsável pelo pagamento da água")
        responsavel_pgto_luz = st.text_input("Responsável pelo pagamento da luz")
        responsavel_pgto_gas = st.text_input("Responsável pelo pagamento do gás")

        rg = st.text_input("RG")
        dados_empresa = st.text_area("Dados da empresa (se aplicável)")
        representante = st.text_input("Representante legal (se aplicável)")
        nacionalidade = st.text_input("Nacionalidade")
        estado_civil = st.text_input("Estado civil")
        profissao = st.text_input("Profissão")
        dados_moradores = st.text_area("Dados de moradores (dependentes, animais, etc.)")

        Endereco_inq = st.text_input("Endereço do responsável pela locação")
        responsavel_inq_opcao = st.selectbox("É o próprio responsável?", ["", "Sim", "Não"])
        responsavel_inq = 1 if responsavel_inq_opcao == "Sim" else 0 if responsavel_inq_opcao == "Não" else None

        st.subheader("Informações do Cônjuge (se aplicável)")
        nome_conjuge = st.text_input("Nome do cônjuge")
        cpf_conjuge = st.text_input("CPF do cônjuge")
        rg_conjuge = st.text_input("RG do cônjuge")
        endereco_conjuge = st.text_input("Endereço do cônjuge")
        telefone_conjuge = st.text_input("Telefone do cônjuge")

        submitted = st.form_submit_button("Cadastrar")

    # ==== CAMPOS REATIVOS (abaixo do formulário) ====
    st.subheader("Outras informações")

    dependentes_inq_opcao = st.selectbox("Possui dependentes?", ["", "Sim", "Não"])
    qtd_dependentes_inq = st.number_input("Quantidade de dependentes", min_value=0, step=1, key="dependentes", disabled=(dependentes_inq_opcao != "Sim"))
    dependentes_inq = 1 if dependentes_inq_opcao == "Sim" else 0 if dependentes_inq_opcao == "Não" else None

    pet_inquilino_opcao = st.selectbox("Possui pets?", ["", "Sim", "Não"])
    qtd_pet_inquilino = st.number_input("Quantidade de pets", min_value=0, step=1, key="pets", disabled=(pet_inquilino_opcao != "Sim"))
    porte_pet = st.selectbox("Porte do pet", ["Pequeno", "Grande"], disabled=(pet_inquilino_opcao != "Sim"))
    pet_inquilino = 1 if pet_inquilino_opcao == "Sim" else 0 if pet_inquilino_opcao == "Não" else None

    # ========== SUBMISSÃO FINAL ==========
    if submitted:
        try:
            dados = {
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

            inserir_inquilino(dados)
            st.success(f"Inquilino '{nome}' cadastrado com sucesso!")
        except Exception as e:
            st.error(f"Erro ao cadastrar inquilino: {e}")
