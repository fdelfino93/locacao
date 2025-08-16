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
    
    # Verificar TODOS os clientes sem filtro
    print('\n=== TODOS OS CLIENTES ===')
    cursor.execute("SELECT id, nome, tipo_cliente, telefone, email FROM Clientes")
    todos_clientes = cursor.fetchall()
    print(f'Total de clientes: {len(todos_clientes)}')
    for row in todos_clientes:
        print(f'  - ID: {row[0]}, Nome: {row[1]}, Tipo: "{row[2]}", Tel: {row[3]}')
    
    # Buscar clientes nos contratos para identificar locatários
    print('\n=== CLIENTES NOS CONTRATOS (POTENCIAIS LOCATARIOS) ===')
    cursor.execute("""
        SELECT DISTINCT c.id_locatario, cl.nome, cl.telefone, cl.email, cl.tipo_cliente
        FROM Contratos c 
        LEFT JOIN Clientes cl ON c.id_locatario = cl.id 
        WHERE c.id_locatario IS NOT NULL
    """)
    locatarios_contratos = cursor.fetchall()
    print(f'Locatários encontrados nos contratos: {len(locatarios_contratos)}')
    for row in locatarios_contratos:
        print(f'  - ID: {row[0]}, Nome: {row[1]}, Tel: {row[2]}, Tipo Cliente: "{row[4]}"')
    
    # Verificar se existe alguma tabela específica para locatários
    print('\n=== VERIFICANDO TABELAS ===')
    cursor.execute("""
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME LIKE '%ocat%'
    """)
    tabelas_locatarios = cursor.fetchall()
    print(f'Tabelas com "locat": {len(tabelas_locatarios)}')
    for tabela in tabelas_locatarios:
        print(f'  - {tabela[0]}')
    
    # Criar dados de locatários baseados nos contratos se não existirem
    print('\n=== CRIANDO DADOS DE LOCATARIOS ===')
    
    # Primeiro, vamos ver se já existem locatários
    cursor.execute("SELECT COUNT(*) FROM Clientes WHERE tipo_cliente = 'Locatario' OR tipo_cliente = 'locatario'")
    count_locatarios = cursor.fetchone()[0]
    
    if count_locatarios == 0:
        print('Não há locatários cadastrados. Criando dados baseados nos contratos...')
        
        # Buscar IDs únicos de locatários nos contratos
        cursor.execute("SELECT DISTINCT id_locatario FROM Contratos WHERE id_locatario IS NOT NULL")
        ids_locatarios = cursor.fetchall()
        
        for row in ids_locatarios:
            id_locatario = row[0]
            
            # Verificar se o cliente já existe
            cursor.execute("SELECT nome FROM Clientes WHERE id = ?", (id_locatario,))
            cliente_existente = cursor.fetchone()
            
            if cliente_existente:
                # Atualizar tipo para locatário
                cursor.execute("UPDATE Clientes SET tipo_cliente = 'Locatario' WHERE id = ?", (id_locatario,))
                print(f'  - Atualizado cliente ID {id_locatario} ({cliente_existente[0]}) para Locatário')
            else:
                # Criar novo locatário
                cursor.execute("""
                    INSERT INTO Clientes (id, nome, tipo_cliente, telefone, email, ativo)
                    VALUES (?, ?, 'Locatario', ?, ?, 1)
                """, (id_locatario, f'Locatário #{id_locatario}', f'(41) 9999-{id_locatario:04d}', f'locatario{id_locatario}@email.com'))
                print(f'  - Criado novo locatário ID {id_locatario}')
        
        conn.commit()
        print('Dados de locatários criados/atualizados!')
    else:
        print(f'Já existem {count_locatarios} locatários cadastrados')
    
    # Verificar resultado final
    print('\n=== RESULTADO FINAL ===')
    cursor.execute("SELECT id, nome, telefone, email FROM Clientes WHERE tipo_cliente = 'Locatario' OR tipo_cliente = 'locatario'")
    locatarios_finais = cursor.fetchall()
    print(f'Total de locatários: {len(locatarios_finais)}')
    for row in locatarios_finais:
        print(f'  - ID: {row[0]}, Nome: {row[1]}, Tel: {row[2]}, Email: {row[3]}')
    
    conn.close()
    
except Exception as e:
    print(f'Erro: {e}')