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
    print('Conexao com banco estabelecida com sucesso!')
    
    cursor = conn.cursor()
    
    # Verificar estrutura da tabela Clientes
    print('\nEstrutura da tabela Clientes:')
    cursor.execute("""
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Clientes'
        ORDER BY ORDINAL_POSITION
    """)
    columns = cursor.fetchall()
    for col in columns:
        print(f"  - {col[0]}: {col[1]} ({col[2]})")
    
    # Buscar locadores
    print('\nLocadores cadastrados:')
    cursor.execute("SELECT TOP 10 * FROM Clientes WHERE tipo_cliente = 'Locador'")
    rows = cursor.fetchall()
    
    print(f'Encontrados {len(rows)} locadores na base:')
    for row in rows:
        print(f'  - ID: {row[0]}, Nome: {row[1]}, CPF: {row[2]}, Telefone: {row[3]}')
    
    # Verificar se há imóveis
    print('\nVerificando imoveis:')
    cursor.execute("SELECT COUNT(*) FROM Imoveis")
    imoveis_count = cursor.fetchone()[0]
    print(f'Total de imoveis: {imoveis_count}')
    
    # Verificar se há contratos
    print('\nVerificando contratos:')
    cursor.execute("SELECT COUNT(*) FROM Contratos")
    contratos_count = cursor.fetchone()[0]
    print(f'Total de contratos: {contratos_count}')
    
    conn.close()
    
except Exception as e:
    print(f'Erro na conexao: {e}')
    print('Verifique se:')
    print('  - O arquivo .env existe')
    print('  - As variaveis DB_* estao configuradas')
    print('  - O SQL Server esta rodando')
    print('  - As credenciais estao corretas')