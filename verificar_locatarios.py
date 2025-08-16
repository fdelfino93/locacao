import pyodbc
import os
import json
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
    
    # Verificar estrutura da tabela Locatarios
    print('\n=== ESTRUTURA DA TABELA LOCATARIOS ===')
    cursor.execute("""
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Locatarios'
        ORDER BY ORDINAL_POSITION
    """)
    columns = cursor.fetchall()
    for col in columns:
        print(f"  - {col[0]}: {col[1]} ({col[2]})")
    
    # Verificar se há dados na tabela Locatarios
    print('\n=== DADOS NA TABELA LOCATARIOS ===')
    cursor.execute("SELECT COUNT(*) FROM Locatarios")
    count = cursor.fetchone()[0]
    print(f'Total de registros: {count}')
    
    if count > 0:
        cursor.execute("SELECT TOP 10 * FROM Locatarios")
        locatarios = cursor.fetchall()
        print('Primeiros 10 registros:')
        for row in locatarios:
            print(f'  - ID: {row[0]}, Dados: {row[1:5]}')
    
    # Verificar relacionamento entre Contratos e Locatarios
    print('\n=== RELACIONAMENTO CONTRATOS <-> LOCATARIOS ===')
    cursor.execute("""
        SELECT c.id, c.id_locatario, l.nome 
        FROM Contratos c 
        LEFT JOIN Locatarios l ON c.id_locatario = l.id 
        WHERE c.id_locatario IS NOT NULL
    """)
    relacao = cursor.fetchall()
    print(f'Contratos com locatários: {len(relacao)}')
    for row in relacao:
        print(f'  - Contrato ID: {row[0]}, Locatário ID: {row[1]}, Nome: {row[2]}')
    
    # Buscar todos os locatários
    print('\n=== TODOS OS LOCATARIOS ===')
    cursor.execute("SELECT * FROM Locatarios")
    todos_locatarios = cursor.fetchall()
    
    locatarios_reais = []
    for row in todos_locatarios:
        locatario = {
            "id": row[0],
            "nome": row[1] if len(row) > 1 and row[1] else f"Locatário #{row[0]}",
            "cpf_cnpj": row[2] if len(row) > 2 and row[2] else "",
            "telefone": row[3] if len(row) > 3 and row[3] else "",
            "email": row[4] if len(row) > 4 and row[4] else "",
            "endereco": row[5] if len(row) > 5 and row[5] else "",
            "ativo": True
        }
        locatarios_reais.append(locatario)
        print(f'  - ID: {locatario["id"]}, Nome: {locatario["nome"]}, Tel: {locatario["telefone"]}')
    
    # Se não há locatários, vamos criar alguns baseados nos contratos
    if len(todos_locatarios) == 0:
        print('\n=== CRIANDO LOCATARIOS DE EXEMPLO ===')
        
        # Criar alguns locatários de exemplo
        locatarios_exemplo = [
            ("João Silva", "12345678901", "(41) 99999-1111", "joao@email.com", "Rua A, 123"),
            ("Maria Santos", "98765432100", "(41) 99999-2222", "maria@email.com", "Rua B, 456"),
            ("Pedro Costa", "11122233344", "(41) 99999-3333", "pedro@email.com", "Rua C, 789")
        ]
        
        for nome, cpf, telefone, email, endereco in locatarios_exemplo:
            try:
                cursor.execute("""
                    INSERT INTO Locatarios (nome, cpf_cnpj, telefone, email, endereco, ativo, data_cadastro)
                    VALUES (?, ?, ?, ?, ?, 1, GETDATE())
                """, (nome, cpf, telefone, email, endereco))
                print(f'  - Criado: {nome}')
            except Exception as e:
                print(f'  - Erro ao criar {nome}: {e}')
        
        conn.commit()
        print('Locatários de exemplo criados!')
        
        # Buscar novamente
        cursor.execute("SELECT id, nome, cpf_cnpj, telefone, email, endereco FROM Locatarios")
        todos_locatarios = cursor.fetchall()
        
        locatarios_reais = []
        for row in todos_locatarios:
            locatario = {
                "id": row[0],
                "nome": row[1],
                "cpf_cnpj": row[2] or "",
                "telefone": row[3] or "",
                "email": row[4] or "",
                "endereco": row[5] or "",
                "ativo": True
            }
            locatarios_reais.append(locatario)
    
    # Salvar dados em arquivo JSON
    with open('locatarios_reais.json', 'w', encoding='utf-8') as f:
        json.dump(locatarios_reais, f, indent=2, ensure_ascii=False)
    
    print(f'\n=== RESUMO FINAL ===')
    print(f'Total de locatários: {len(locatarios_reais)}')
    print('Dados salvos em: locatarios_reais.json')
    
    conn.close()
    
except Exception as e:
    print(f'Erro: {e}')