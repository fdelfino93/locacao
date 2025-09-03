from repositories_adapter import get_conexao

try:
    print("=== TESTANDO CONEXAO COM BANCO ===")
    conn = get_conexao()
    cursor = conn.cursor()
    
    # Verificar contratos
    print("\n1. Verificando contratos existentes:")
    cursor.execute("SELECT TOP 5 id, id_locatario, id_imovel, valor_aluguel FROM Contratos ORDER BY id")
    contratos = cursor.fetchall()
    
    for contrato in contratos:
        print(f"   Contrato ID: {contrato[0]}")
    
    # Verificar se os 11 campos novos existem
    print("\n2. Verificando campos novos na tabela Contratos:")
    campos_novos = [
        'data_entrega_chaves', 'proximo_reajuste_automatico', 'periodo_contrato',
        'tempo_renovacao', 'tempo_reajuste', 'data_inicio_iptu', 'data_fim_iptu',
        'parcelas_iptu', 'parcelas_seguro_fianca', 'parcelas_seguro_incendio', 'valor_fci'
    ]
    
    for campo in campos_novos:
        cursor.execute(f"""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Contratos' AND COLUMN_NAME = '{campo}'
        """)
        result = cursor.fetchone()
        if result:
            print(f"   OK - {campo}")
        else:
            print(f"   FALTANDO - {campo}")
    
    # Testar update simples
    print("\n3. Testando UPDATE no contrato 1:")
    if contratos:
        contrato_id = contratos[0][0]
        cursor.execute("UPDATE Contratos SET valor_aluguel = valor_aluguel WHERE id = ?", (contrato_id,))
        print(f"   UPDATE executado para contrato {contrato_id}")
        print(f"   Linhas afetadas: {cursor.rowcount}")
        
        if cursor.rowcount > 0:
            print("   SUCESSO: Update funcionou!")
        else:
            print("   ERRO: Nenhuma linha foi afetada")
    
    conn.close()
    print("\n=== TESTE CONCLUIDO ===")
    
except Exception as e:
    print(f"\nERRO: {e}")
    import traceback
    traceback.print_exc()