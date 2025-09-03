from repositories_adapter import get_conexao

print("=== VERIFICACAO DETALHADA DOS DADOS ===")

conn = get_conexao()
cursor = conn.cursor()

# Buscar contrato 1 completo
cursor.execute("SELECT * FROM Contratos WHERE id = 1")
columns = [col[0] for col in cursor.description]
row = cursor.fetchone()

if row:
    print(f"CONTRATO ID 1 - DADOS DO BANCO:")
    
    # Mostrar apenas campos que foram atualizados recentemente
    campos_relevantes = [
        'id', 'valor_aluguel', 'data_entrega_chaves', 'periodo_contrato', 
        'tempo_renovacao', 'tempo_reajuste', 'valor_fci', 'bonificacao',
        'taxa_administracao', 'parcelas_iptu'
    ]
    
    for i, campo in enumerate(columns):
        if campo in campos_relevantes:
            valor = row[i]
            print(f"  {campo}: {valor}")
    
    print(f"\nTOTAL DE CAMPOS NA TABELA: {len(columns)}")
    
    # Verificar especificamente os 11 campos novos
    print(f"\nVERIFICACAO DOS 11 CAMPOS NOVOS:")
    novos_campos = [
        'data_entrega_chaves', 'proximo_reajuste_automatico', 'periodo_contrato',
        'tempo_renovacao', 'tempo_reajuste', 'data_inicio_iptu', 'data_fim_iptu',
        'parcelas_iptu', 'parcelas_seguro_fianca', 'parcelas_seguro_incendio', 'valor_fci'
    ]
    
    for campo in novos_campos:
        try:
            idx = columns.index(campo)
            valor = row[idx]
            print(f"  {campo}: {valor} (coluna {idx})")
        except ValueError:
            print(f"  {campo}: NAO ENCONTRADO")
    
    # Verificar timestamp de ultima modificacao se existir
    if 'data_modificacao' in columns:
        idx = columns.index('data_modificacao')
        print(f"\nUltima modificacao: {row[idx]}")
        
conn.close()
print(f"\n=== VERIFICACAO CONCLUIDA ===")