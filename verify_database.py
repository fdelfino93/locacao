import pyodbc

# Conectar ao banco
conn = pyodbc.connect(
    r'Driver={SQL Server};'
    r'Server=DESKTOP-HOR9TC9\SQLEXPRESS;'
    r'Database=locacao;'
    r'Trusted_Connection=yes;'
)

cursor = conn.cursor()

print("=== VERIFICANDO CONTRATOS NO BANCO ===")
cursor.execute("SELECT TOP 5 id, id_locatario, id_imovel, valor_aluguel FROM Contratos ORDER BY id")
contratos = cursor.fetchall()

print(f"Contratos encontrados: {len(contratos)}")
for contrato in contratos:
    print(f"  ID: {contrato[0]}, Locatario: {contrato[1]}, Imovel: {contrato[2]}, Aluguel: {contrato[3]}")

# Verificar campos da tabela
print("\n=== VERIFICANDO ESTRUTURA DA TABELA ===")
cursor.execute("""
    SELECT COLUMN_NAME, DATA_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'Contratos' 
    AND COLUMN_NAME IN ('data_entrega_chaves', 'periodo_contrato', 'tempo_renovacao', 
                         'tempo_reajuste', 'parcelas_iptu', 'valor_fci',
                         'proximo_reajuste_automatico', 'data_inicio_iptu', 
                         'data_fim_iptu', 'parcelas_seguro_fianca', 'parcelas_seguro_incendio')
    ORDER BY COLUMN_NAME
""")

campos = cursor.fetchall()
print(f"Campos novos encontrados na tabela:")
for campo in campos:
    print(f"  - {campo[0]}: {campo[1]}")

if len(campos) < 11:
    print(f"\nATENCAO: Apenas {len(campos)} dos 11 campos novos foram encontrados!")
else:
    print(f"\nOK: Todos os 11 campos novos existem na tabela!")

conn.close()