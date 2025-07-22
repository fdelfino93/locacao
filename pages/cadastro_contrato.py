import streamlit as st
import pyodbc
import pandas as pd

def get_conexao():
    return pyodbc.connect(
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=SRVTESTES\\SQLTESTES;"
        "DATABASE=Cobimob;"
        "UID=srvcondo1;"
        "PWD=2022@Condo"
    )

def buscar_inquilinos():
    with get_conexao() as conn:
        df = pd.read_sql("SELECT id, nome FROM Inquilinos", conn)
    return df

def buscar_imoveis():
    with get_conexao() as conn:
        df = pd.read_sql("SELECT id, endereco FROM Imoveis", conn)
    return df

def render():
    st.title("📑 Cadastro de Contrato")

    df_inquilinos = buscar_inquilinos()
    df_imoveis = buscar_imoveis()

    nome_inquilino = st.selectbox("Selecione o Inquilino", df_inquilinos["nome"])
    endereco_imovel = st.selectbox("Selecione o Imóvel", df_imoveis["endereco"])

    data_inicio = st.date_input("Data de Início")
    data_fim = st.date_input("Data de Fim")
    taxa_adm = st.number_input("Taxa de Administração (%)", step=0.1)
    fundo_cons = st.number_input("Fundo de Conservação (R$)", step=0.1)
    tipo_reajuste = st.selectbox("Tipo de Reajuste", ["IGPM", "IPCA", "Outro"])
    percentual_reajuste = st.number_input("Percentual de Reajuste", step=0.1)
    vencimento_dia = st.number_input("Dia de Vencimento", min_value=1, max_value=31)
    renovacao_auto = st.checkbox("Renovação Automática")
    seguro_obrig = st.checkbox("Seguro Obrigatório")
    clausulas = st.text_area("Cláusulas Adicionais")

    if st.button("Salvar Contrato"):
        try:
            id_inquilino = df_inquilinos[df_inquilinos["nome"] == nome_inquilino]["id"].values[0]
            id_imovel = df_imoveis[df_imoveis["endereco"] == endereco_imovel]["id"].values[0]

            with get_conexao() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO Contratos (
                        id_imovel, id_inquilino, data_inicio, data_fim,
                        taxa_administracao, fundo_conservacao, tipo_reajuste,
                        percentual_reajuste, vencimento_dia, renovacao_automatica,
                        seguro_obrigatorio, clausulas_adicionais
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    id_imovel, id_inquilino, data_inicio, data_fim,
                    taxa_adm, fundo_cons, tipo_reajuste, percentual_reajuste,
                    vencimento_dia, renovacao_auto, seguro_obrig, clausulas
                ))
                conn.commit()

            st.success("Contrato salvo com sucesso!")
        except Exception as e:
            st.error(f"Erro ao salvar contrato: {e}")
