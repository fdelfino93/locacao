import streamlit as st
from pages import cadastro_cliente, cadastro_imovel, cadastro_inquilino, cadastro_contrato, prestacao_contas

st.markdown("""
    <style>
        /* Some a sidebar lateral */
        [data-testid="stSidebarNav"] {
            display: none !important;
        }

        /* Some o botão Deploy e os 3 pontinhos */
        header [data-testid="baseButton-headerNoPadding"] {
            display: none !important;
        }

        /* Também dá um jeito no cabeçalho por completo se quiser sumir com tudo */
        header {
            visibility: hidden;
        }
    </style>
""", unsafe_allow_html=True)



st.set_page_config(page_title="Cobimob", layout="wide")

st.title("🏡 Cobimob")
st.write("Bem-vindo ao sistema de locações!")

aba = st.sidebar.selectbox("Escolha a funcionalidade", [
    "📋 Cadastro - Cliente",
    "📋 Cadastro - Imóvel",
    "📋 Cadastro - Inquilino",
    "📋 Cadastro - Contrato",
    "📊 Prestação de Contas"
])

if aba == "📋 Cadastro - Cliente":
    cadastro_cliente.render()
elif aba == "📋 Cadastro - Imóvel":
    cadastro_imovel.render()
elif aba == "📋 Cadastro - Inquilino":
    cadastro_inquilino.render()
elif aba == "📋 Cadastro - Contrato":
    cadastro_contrato.render()
elif aba == "📊 Prestação de Contas":
    prestacao_contas.render()
