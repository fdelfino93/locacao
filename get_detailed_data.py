import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

try:
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    conn = pyodbc.connect(connection_string)
    
    cursor = conn.cursor()
    
    # Obter dados completos de um locador específico
    print('Detalhes completos do primeiro locador:')
    cursor.execute("SELECT TOP 1 * FROM Clientes WHERE tipo_cliente = 'Locador' AND nome IS NOT NULL")
    row = cursor.fetchone()
    
    if row:
        print(f'ID: {row[0]}')
        print(f'Nome: {row[1]}')
        print(f'CPF/CNPJ: {row[2]}')
        print(f'Telefone: {row[3]}')
        print(f'Email: {row[4]}')
        print(f'Endereco: {row[5]}')
        print(f'Tipo Recebimento: {row[6]}')
        print(f'Conta Bancaria: {row[7]}')
        print(f'RG: {row[10]}')
        print(f'Profissao: {row[15]}')
        print(f'Estado Civil: {row[14]}')
        print(f'Nacionalidade: {row[13]}')
        print(f'Data Nascimento: {row[24]}')
        print(f'Ativo: {row[34]}')
        print(f'Data Cadastro: {row[35]}')
    
    # Verificar estrutura da tabela Imoveis
    print('\nEstrutura da tabela Imoveis:')
    try:
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Imoveis'
            ORDER BY ORDINAL_POSITION
        """)
        columns = cursor.fetchall()
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
    except:
        print("Tabela Imoveis nao encontrada")
    
    # Verificar dados dos imóveis
    print('\nImoveis cadastrados:')
    try:
        cursor.execute("SELECT TOP 5 * FROM Imoveis")
        imoveis = cursor.fetchall()
        for imovel in imoveis:
            print(f"  - ID: {imovel[0]}, Endereco: {imovel[1] if len(imovel) > 1 else 'N/A'}")
    except:
        print("Erro ao buscar imoveis")
    
    # Verificar estrutura da tabela Contratos
    print('\nEstrutura da tabela Contratos:')
    try:
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Contratos'
            ORDER BY ORDINAL_POSITION
        """)
        columns = cursor.fetchall()
        for col in columns:
            print(f"  - {col[0]}: {col[1]}")
    except:
        print("Tabela Contratos nao encontrada")
    
    # Verificar relacionamentos
    print('\nVerificando relacionamentos:')
    try:
        cursor.execute("""
            SELECT c.nome as locador, i.endereco as imovel, ct.id as contrato_id
            FROM Clientes c
            LEFT JOIN Imoveis i ON c.id = i.locador_id
            LEFT JOIN Contratos ct ON i.id = ct.imovel_id
            WHERE c.tipo_cliente = 'Locador'
            AND c.nome IS NOT NULL
        """)
        relationships = cursor.fetchall()
        for rel in relationships:
            print(f"  - Locador: {rel[0]}, Imovel: {rel[1]}, Contrato: {rel[2]}")
    except Exception as e:
        print(f"Erro ao verificar relacionamentos: {e}")
    
    conn.close()
    
except Exception as e:
    print(f'Erro na conexao: {e}')