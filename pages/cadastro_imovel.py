import streamlit as st
import pandas as pd
from locacao.repositories.imovel_repository import buscar_clientes, inserir_imovel
from locacao.repositories.cliente_repository import inserir_cliente
from locacao.repositories.inquilino_repository import buscar_inquilinos, inserir_inquilino

def render():
    st.title("🏠 Cadastro de Imóvel")

    try:
        clientes_raw = buscar_clientes()
        df_clientes = pd.DataFrame(clientes_raw)
        nomes_clientes = df_clientes["nome"].tolist()
    except Exception as e:
        st.error(f"Erro ao buscar clientes: {e}")
        return

    st.subheader("Cliente responsável pelo imóvel")

    opcao = st.selectbox(
        "Você quer usar um cliente existente ou cadastrar um novo?",
        ["", "🔍 Buscar cliente existente", "🆕 Cadastrar novo cliente"]
    )

    id_cliente = None

    if opcao == "🔍 Buscar cliente existente":
        nome_cliente = st.selectbox("Selecione o Cliente", [""] + nomes_clientes)
        if nome_cliente:
            id_cliente = df_clientes[df_clientes["nome"] == nome_cliente]["id"].values[0]

    elif opcao == "🆕 Cadastrar novo cliente":
        st.subheader("📋 Cadastro de Novo Cliente")

        col1, col2 = st.columns(2)
        with col1:
            nome = st.text_input("Nome Completo")
            cpf_cnpj = st.text_input("CPF/CNPJ")
            rg = st.text_input("RG")
            nacionalidade = st.text_input("Nacionalidade")
            estado_civil = st.text_input("Estado civil")
            profissao = st.text_input("Profissão")
            tipo_recebimento = st.selectbox("Forma de Recebimento", ["PIX", "TED", "Boleto", "Depósito"])
            tipo_cliente = st.selectbox("Tipo de Cliente", ["Residencial", "Comercial", "Industrial"])
            data_nascimento = st.date_input("Data de Nascimento")
        with col2:
            telefone = st.text_input("Telefone")
            email = st.text_input("Email")
            endereco = st.text_area("Endereço")
            conta_bancaria = st.text_input("Conta Bancária")
            dados_empresa = st.text_area("Dados da empresa (CNPJ, endereço etc)")
            representante = st.text_input("Representante legal (se houver)")

        deseja_fci = st.checkbox("Deseja FCI?")
        deseja_seguro_fianca = st.checkbox("Deseja Seguro Fiança?")
        deseja_seguro_incendio = st.checkbox("Deseja Seguro Incêndio?")

        existe_conjuge = st.selectbox("Possui cônjuge?", ["", "Sim", "Não"])
        existe_conjuge_flag = 1 if existe_conjuge == "Sim" else 0 if existe_conjuge == "Não" else None

        if existe_conjuge_flag == 1:
            st.subheader("Informações do Cônjuge (se aplicável)")
            col1, col2 = st.columns(2)
            with col1:
                nome_conjuge = st.text_input("Nome do cônjuge")
                cpf_conjuge = st.text_input("CPF do cônjuge")
                rg_conjuge = st.text_input("RG do cônjuge")
            with col2:
                endereco_conjuge = st.text_input("Endereço do cônjuge")
                telefone_conjuge = st.text_input("Telefone do cônjuge")
        else:
            nome_conjuge = cpf_conjuge = rg_conjuge = endereco_conjuge = telefone_conjuge = None

        if st.button("Salvar Cliente"):
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
                    rg=rg,
                    dados_empresa=dados_empresa,
                    representante=representante,
                    nacionalidade=nacionalidade,
                    estado_civil=estado_civil,
                    profissao=profissao,
                    deseja_seguro_incendio="Sim" if deseja_seguro_incendio else "Não",
                    existe_conjuge=existe_conjuge_flag,
                    nome_conjuge=nome_conjuge,
                    cpf_conjuge=cpf_conjuge,
                    rg_conjuge=rg_conjuge,
                    endereco_conjuge=endereco_conjuge,
                    telefone_conjuge=telefone_conjuge,
                    tipo_cliente=tipo_cliente,
                    data_nascimento=data_nascimento
                )
                st.success("Cliente cadastrado com sucesso!")
                st.experimental_rerun()
            except Exception as e:
                st.error(f"Erro ao cadastrar cliente: {e}")
            return
        
    if id_cliente:
        st.divider()
        st.subheader("👥 Inquilino responsável pela locação")

        inquilinos_raw = buscar_inquilinos()
        df_inquilinos = pd.DataFrame(inquilinos_raw, columns=["id", "nome"])
        nomes_inquilinos = df_inquilinos["nome"].tolist()

        opcao_inq = st.selectbox(
            "Você quer usar um inquilino existente ou cadastrar um novo?",
            ["", "🔍 Buscar inquilino existente", "🆕 Cadastrar novo inquilino"]
        )

        id_inquilino = None

        if opcao_inq == "🔍 Buscar inquilino existente":
            nome_inq = st.selectbox("Selecione o Inquilino", [""] + nomes_inquilinos)
            if nome_inq:
                id_inquilino = df_inquilinos[df_inquilinos["nome"] == nome_inq]["id"].values[0]

        elif opcao_inq == "🆕 Cadastrar novo inquilino":
            st.subheader("📋 Cadastro de Novo Inquilino")

            col1, col2 = st.columns(2)
            with col1:
                nome = st.text_input("Nome do inquilino")
                cpf_cnpj = st.text_input("CPF/CNPJ")
                telefone = st.text_input("Telefone")
                email = st.text_input("Email")
                responsavel_pgto_agua = st.text_input("Responsável pelo pagamento da água")
                responsavel_pgto_gas = st.text_input("Responsável pelo pagamento do gás")
                rg = st.text_input("RG")
                dados_empresa = st.text_area("Dados da empresa (se aplicável)")
                nacionalidade = st.text_input("Nacionalidade")
                profissao = st.text_input("Profissão")
                Endereco_inq = st.text_input("Endereço do responsável pela locação")
                representante = st.text_input("Representante legal (se aplicável)")

            with col2:
                tipo_garantia = st.selectbox("Tipo de Garantia", [
                    "Fiador", "Caução", "Seguro-fiança", "Título de Capitalização", "Sem garantia"
                ])
                responsavel_pgto_luz = st.text_input("Responsável pelo pagamento da luz")
                estado_civil = st.text_input("Estado civil")
                dados_moradores = st.text_area("Dados de moradores (dependentes, animais, etc.)")

                responsavel_inq_opcao = st.selectbox("É o próprio responsável que locará o imóvel?", ["", "Sim", "Não"])
                responsavel_inq = 1 if responsavel_inq_opcao == "Sim" else 0 if responsavel_inq_opcao == "Não" else None

                existe_conjuge = st.selectbox("Possui cônjuge?", ["", "Sim", "Não"])
                if existe_conjuge == "Sim":
                    st.subheader("Informações do Cônjuge")
                    nome_conjuge = st.text_input("Nome do cônjuge")
                    cpf_conjuge = st.text_input("CPF do cônjuge")
                    rg_conjuge = st.text_input("RG do cônjuge")
                    endereco_conjuge = st.text_input("Endereço do cônjuge")
                    telefone_conjuge = st.text_input("Telefone do cônjuge")
                else:
                    nome_conjuge = cpf_conjuge = rg_conjuge = endereco_conjuge = telefone_conjuge = None

                dependentes_inq_opcao = st.selectbox("Possui dependentes?", ["", "Sim", "Não"])
                dependentes_inq = 1 if dependentes_inq_opcao == "Sim" else 0 if dependentes_inq_opcao == "Não" else None
                qtd_dependentes_inq = st.number_input("Quantidade de dependentes", min_value=0, step=1, key="dependentes", disabled=(dependentes_inq != 1))

                pet_inquilino_opcao = st.selectbox("Possui pets?", ["", "Sim", "Não"])
                pet_inquilino = 1 if pet_inquilino_opcao == "Sim" else 0 if pet_inquilino_opcao == "Não" else None
                qtd_pet_inquilino = st.number_input("Quantidade de pets", min_value=0, step=1, key="pets", disabled=(pet_inquilino != 1))
                porte_pet = st.selectbox("Porte do pet", ["Pequeno", "Grande"], disabled=(pet_inquilino != 1))

            if st.button("Salvar Inquilino"):
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
                    st.experimental_rerun()
                except Exception as e:
                    st.error(f"Erro ao cadastrar inquilino: {e}")
            return

        st.divider()
        st.subheader("📝 Informações do imóvel")

        tipo = st.selectbox("Tipo do Imóvel", ["Apartamento", "Casa", "Sala Comercial", "Galpão", "Outro"])
        endereco = st.text_input("Endereço")
        valor_aluguel = st.number_input("Valor do Aluguel", step=0.01)
        iptu = st.number_input("Valor do IPTU", step=0.01)
        condominio = st.number_input("Valor do Condomínio", step=0.01)
        taxa_incendio = st.number_input("Taxa de Incêndio", step=0.01)
        status = st.selectbox("Status", ["Disponível", "Ocupado", "Em manutenção", "Inativo"])

        st.subheader("📦 Campos adicionais")

        matricula_imovel = st.text_input("Matrícula do Imóvel")
        area_imovel = st.text_input("Área do Imóvel (total/privativa)")
        dados_imovel = st.text_area("Dados do Imóvel (suíte, copa, etc.)")
        permite_pets = st.checkbox("Permite Animais?")
        info_iptu = st.text_area("Informações sobre IPTU")
        observacoes_condominio = st.text_area("Observações do Condomínio")
        copel_unidade_consumidora = st.text_input("Copel - Unidade Consumidora")
        sanepar_matricula = st.text_input("Sanepar - Matrícula")
        tem_gas = st.checkbox("Tem Gás?")
        info_gas = st.text_area("Informações sobre Gás")
        boleto_condominio = st.checkbox("Boleto do Condomínio incluso?")

        if st.button("Salvar Imóvel"):
            try:
                dados = (
                    id_cliente, tipo, endereco, valor_aluguel, iptu, condominio,
                    taxa_incendio, status, matricula_imovel, area_imovel, dados_imovel,
                    int(permite_pets), info_iptu, observacoes_condominio,
                    copel_unidade_consumidora, sanepar_matricula, int(tem_gas),
                    info_gas, int(boleto_condominio), id_inquilino
                )
                inserir_imovel(dados)
                st.success("Imóvel salvo com sucesso!")
            except Exception as e:
                st.error(f"Erro ao salvar o imóvel: {e}")
