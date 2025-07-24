import streamlit as st
import pandas as pd
from locacao.repositories.contrato_repository import inserir_contrato
from locacao.repositories.inquilino_repository import buscar_inquilinos
from locacao.repositories.imovel_repository import buscar_imoveis

def render():
    st.title("📑 Cadastro de Contrato")

    df_inquilinos = pd.DataFrame(buscar_inquilinos())
    df_imoveis = pd.DataFrame(buscar_imoveis())

    if df_inquilinos.empty or df_imoveis.empty:
        st.error("Você precisa cadastrar inquilinos e imóveis antes de criar contratos.")
        return


    nome_inquilino = st.selectbox("Selecione o Inquilino", df_inquilinos["nome"])
    endereco_imovel = st.selectbox("Selecione o Imóvel", df_imoveis["endereco"])

    id_inquilino = df_inquilinos[df_inquilinos["nome"] == nome_inquilino]["id"].values[0]
    id_imovel = df_imoveis[df_imoveis["endereco"] == endereco_imovel]["id"].values[0]

    # Dados obrigatórios do contrato
    data_inicio = st.date_input("Data de Início do Contrato")
    data_fim = st.date_input("Data de Fim do Contrato")
    taxa_adm = st.number_input("Taxa de Administração (%)", step=0.1)
    fundo_cons = st.number_input("Fundo de Conservação (R$)", step=0.1)
    tipo_reajuste = st.selectbox("Tipo de Reajuste", ["IGPM", "IPCA", "Outro"])
    percentual_reajuste = st.number_input("Percentual de Reajuste (%)", step=0.1)
    vencimento_dia = st.number_input("Dia do Vencimento", min_value=1, max_value=31)
    renovacao_auto = st.checkbox("Renovação Automática")
    seguro_obrig = st.checkbox("Seguro Obrigatório")
    clausulas = st.text_area("Cláusulas Adicionais")

    # Campos adicionais
    st.markdown("### 🔧 Informações Complementares")
    tipo_plano_locacao = st.selectbox("Plano de Locação", ["Básico", "Completo"])
    valores_contrato = st.text_area("Valores do Contrato (Ex: aluguel, IPTU, condomínio)")
    data_vig_segfianca = st.date_input("Data Vigência Seguro Fiança")
    data_vig_segincendio = st.date_input("Data Vigência Seguro Incêndio")
    data_assinatura = st.date_input("Data de Assinatura")
    ultimo_reajuste = st.date_input("Último Reajuste")
    proximo_reajuste = st.date_input("Próximo Reajuste")
    antecipacao_encargos = st.checkbox("Antecipação de Encargos?")
    aluguel_garantido = st.checkbox("Aluguel Garantido?")
    mes_referencia = st.selectbox("Mês de Referência", ["Mesmo mês", "Mês anterior"])
    tipo_garantia = st.selectbox("Tipo de Garantia", ["Fiador", "Caução", "Seguro-fiança", "Título de Capitalização", "Sem garantia"])
    bonificacao = st.number_input("Bonificação (%)", step=0.1)
    retidos = st.text_area("Retidos (Ex: FCI, IPTU, Seguro)")
    info_garantias = st.text_area("Informações da Garantia (Fiador, contato, docs...)")

    if st.button("Salvar Contrato"):
        try:
            inserir_contrato(
                id_imovel=id_imovel,
                id_inquilino=id_inquilino,
                data_inicio=data_inicio,
                data_fim=data_fim,
                taxa_administracao=taxa_adm,
                fundo_conservacao=fundo_cons,
                tipo_reajuste=tipo_reajuste,
                percentual_reajuste=percentual_reajuste,
                vencimento_dia=vencimento_dia,
                renovacao_automatica=renovacao_auto,
                seguro_obrigatorio=seguro_obrig,
                clausulas_adicionais=clausulas,
                tipo_plano_locacao=tipo_plano_locacao,
                valores_contrato=valores_contrato,
                data_vigencia_segfianca=data_vig_segfianca,
                data_vigencia_segincendio=data_vig_segincendio,
                data_assinatura=data_assinatura,
                ultimo_reajuste=ultimo_reajuste,
                proximo_reajuste=proximo_reajuste,
                antecipacao_encargos=antecipacao_encargos,
                aluguel_garantido=aluguel_garantido,
                mes_de_referencia=mes_referencia,
                tipo_garantia=tipo_garantia,
                bonificacao=bonificacao,
                retidos=retidos,
                info_garantias=info_garantias
            )
            st.success("Contrato salvo com sucesso!")
        except Exception as e:
            st.error(f"Erro ao salvar contrato: {e}")
