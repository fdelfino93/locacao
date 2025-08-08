import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_conexao():
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    return pyodbc.connect(connection_string)

def debug_inserir_locador():
    # Dados de teste similares ao JSON
    nome = "Teste Silva"
    cpf_cnpj = "123.456.789-00"
    telefone = "(11) 99999-9999"
    email = "teste@email.com"
    endereco = "Rua Teste, 123"
    tipo_recebimento = "PIX"
    conta_bancaria = "123-456-7"
    deseja_fci = "Não"
    deseja_seguro_fianca = "Não"
    deseja_seguro_incendio = "Não"
    rg = "12.345.678-9"
    dados_empresa = ""
    representante = ""
    nacionalidade = "Brasileira"
    estado_civil = "Solteiro"
    profissao = "Engenheiro"
    existe_conjuge = 0
    nome_conjuge = ""
    cpf_conjuge = ""
    rg_conjuge = ""
    endereco_conjuge = ""
    telefone_conjuge = ""
    tipo_locador = "Residencial"
    data_nascimento = "1990-01-01"

    valores = (
        nome,
        cpf_cnpj,
        telefone,
        email,
        endereco,
        tipo_recebimento,
        conta_bancaria,
        deseja_fci,
        deseja_seguro_fianca,
        rg,
        dados_empresa,
        representante,
        nacionalidade,
        estado_civil,
        profissao,
        1 if deseja_seguro_incendio == 'Sim' else 0,  # INT
        existe_conjuge if existe_conjuge is not None else 0,  # INT
        nome_conjuge,
        cpf_conjuge,
        rg_conjuge,
        endereco_conjuge,
        telefone_conjuge,
        tipo_locador,
        data_nascimento,
        'PF',  # tipo_pessoa
        1      # ativo - BIT
    )

    print("Valores que serão inseridos:")
    campos = [
        "nome", "cpf_cnpj", "telefone", "email", "endereco",
        "tipo_recebimento", "conta_bancaria", "deseja_fci", "deseja_seguro_fianca",
        "rg", "dados_empresa", "representante", "nacionalidade", "estado_civil", "profissao",
        "deseja_seguro_incendio (INT)", "existe_conjuge (INT)", "nome_conjuge", "cpf_conjuge", 
        "rg_conjuge", "endereco_conjuge", "telefone_conjuge", "tipo_cliente", "data_nascimento",
        "tipo_pessoa", "ativo (BIT)"
    ]
    
    for i, (campo, valor) in enumerate(zip(campos, valores)):
        print(f"{i+1:2d}. {campo}: {valor} (tipo: {type(valor).__name__})")

    with get_conexao() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute("""
                INSERT INTO Locadores (
                    nome,
                    cpf_cnpj,
                    telefone,
                    email,
                    endereco,
                    tipo_recebimento,
                    conta_bancaria,
                    deseja_fci,
                    deseja_seguro_fianca,
                    rg,
                    dados_empresa,
                    representante,
                    nacionalidade,
                    estado_civil,
                    profissao,
                    deseja_seguro_incendio,
                    existe_conjuge,
                    nome_conjuge,
                    cpf_conjuge,
                    rg_conjuge,
                    endereco_conjuge,
                    telefone_conjuge,
                    tipo_cliente,
                    data_nascimento,
                    tipo_pessoa,
                    ativo
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, valores)
            conn.commit()
            print("\n✓ Inserção funcionou!")
        except Exception as e:
            print(f"\n✗ Erro: {e}")

if __name__ == "__main__":
    debug_inserir_locador()