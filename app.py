import pandas as pd
import pyodbc
from tkinter import Tk
from tkinter.filedialog import askopenfilename

def parse_float(valor):
    try:
        if pd.isna(valor) or str(valor).strip() == "":
            return None
        return float(str(valor).replace(",", ".").strip())
    except Exception as e:
        print(f"[ERRO FLOAT] Valor inválido: {valor} -> {e}")
        return None

def parse_int(valor):
    try:
        if pd.isna(valor) or str(valor).strip() == "":
            return None
        return int(float(str(valor).strip()))
    except Exception as e:
        print(f"[ERRO INT] Valor inválido: {valor} -> {e}")
        return None

# Seleção do arquivo
Tk().withdraw()
arquivo = askopenfilename(title="Selecione a planilha com os dados", filetypes=[("Excel files", "*.xlsx")])
if not arquivo:
    print("Nenhuma planilha foi selecionada.")
    exit()

# Conexão SQL Server
conexao = pyodbc.connect(
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=SRVTESTES\\SQLTESTES;"
    "DATABASE=Cobimob;"
    "UID=srvcondo1;"
    "PWD=2022@Condo"
)
cursor = conexao.cursor()

# Lê as abas do Excel
clientes = pd.read_excel(arquivo, sheet_name="Clientes")
imoveis = pd.read_excel(arquivo, sheet_name="Imoveis")
inquilinos = pd.read_excel(arquivo, sheet_name="Inquilinos")
contratos = pd.read_excel(arquivo, sheet_name="Contratos")

mapa_clientes, mapa_imoveis, mapa_inquilinos = [], [], []

# Inserção de Clientes
for i, row in clientes.iterrows():
    try:
        deseja_fci = 1 if str(row["deseja_fci"]).strip().lower() == "sim" else 0
        deseja_seguro = 1 if str(row["deseja_seguro_fianca"]).strip().lower() == "sim" else 0

        cursor.execute(
            "INSERT INTO Clientes (nome, cpf_cnpj, telefone, email, endereco, tipo_recebimento, conta_bancaria, deseja_fci, deseja_seguro_fianca) "
            "OUTPUT INSERTED.id "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            row["nome"], row["cpf_cnpj"], row["telefone"], row["email"], row["endereco"],
            row["tipo_recebimento"], row["conta_bancaria"], deseja_fci, deseja_seguro
        )
        id_cliente = cursor.fetchone()[0]
        mapa_clientes.append(id_cliente)
        print(f"[CLIENTE] Inserido: {row['nome']}")
    except Exception as e:
        print(f"[ERRO CLIENTE linha {i}] {e}")

# Inserção de Imóveis
for i, row in imoveis.iterrows():
    try:
        id_cliente = mapa_clientes[i] if i < len(mapa_clientes) else None
        cursor.execute(
            "INSERT INTO Imoveis (id_cliente, endereco, tipo, valor_aluguel, iptu, condominio, taxa_incendio, status) "
            "OUTPUT INSERTED.id "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            id_cliente,
            row["endereco"],
            row["tipo"],
            parse_float(row["valor_aluguel"]),
            parse_float(row["iptu"]),
            parse_float(row["condominio"]),
            parse_float(row["taxa_incendio"]),
            row["status"]
        )
        id_imovel = cursor.fetchone()[0]
        mapa_imoveis.append(id_imovel)
        print(f"[IMOVEL] Inserido: {row['endereco']}")
    except Exception as e:
        print(f"[ERRO IMOVEL linha {i}] {e}")

# Inserção de Inquilinos
for i, row in inquilinos.iterrows():
    try:
        cursor.execute(
            "INSERT INTO Inquilinos (nome, cpf_cnpj, telefone, email, tipo_garantia, responsavel_pgto_agua, responsavel_pgto_luz, responsavel_pgto_gas) "
            "OUTPUT INSERTED.id "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            row["nome"], row["cpf_cnpj"], row["telefone"], row["email"], row["tipo_garantia"],
            row["responsavel_pgto_agua"], row["responsavel_pgto_luz"], row["responsavel_pgto_gas"]
        )
        id_inquilino = cursor.fetchone()[0]
        mapa_inquilinos.append(id_inquilino)
        print(f"[INQUILINO] Inserido: {row['nome']}")
    except Exception as e:
        print(f"[ERRO INQUILINO linha {i}] {e}")

# Inserção de Contratos
for i, (_, row) in enumerate(contratos.iterrows()):
    id_imovel = mapa_imoveis[i] if i < len(mapa_imoveis) else None
    id_inquilino = mapa_inquilinos[i] if i < len(mapa_inquilinos) else None

    try:
        cursor.execute(
            "INSERT INTO Contratos (id_imovel, id_inquilino, data_inicio, data_fim, taxa_administracao, fundo_conservacao, tipo_reajuste, percentual_reajuste, vencimento_dia, renovacao_automatica, seguro_obrigatorio, clausulas_adicionais) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            id_imovel,
            id_inquilino,
            row["data_inicio"],
            row["data_fim"],
            parse_float(row["taxa_administracao"]),
            parse_float(row["fundo_conservacao"]),
            row["tipo_reajuste"],
            parse_float(row["percentual_reajuste"]),
            int(row["vencimento_dia"]) if not pd.isna(row["vencimento_dia"]) else None,
            row["renovacao_automatica"],
            row["seguro_obrigatorio"],
            row["clausulas_adicionais"] if pd.notna(row["clausulas_adicionais"]) else None
        )
        print(f"[CONTRATO] Inserido linha {i}")
    except Exception as e:
        print(f"[ERRO CONTRATO linha {i}] {e}")


# Finaliza
conexao.commit()
cursor.close()
conexao.close()
print("🔥 Tudo inserido (ou quase). Se apareceram erros, eles tão listados acima.")
