import requests
from repositories_adapter import get_conexao

print("=== VERIFICACAO: FRONTEND vs BANCO ===")

# 1. API
response = requests.get("http://localhost:8000/api/contratos")
contratos_api = response.json().get('data', []) if response.status_code == 200 else []
print(f"API: {len(contratos_api)} contratos")

# 2. Banco
conn = get_conexao()
cursor = conn.cursor()
cursor.execute("SELECT * FROM Contratos WHERE id = 1")
columns = [col[0] for col in cursor.description]
row = cursor.fetchone()

if row:
    contrato_banco = {}
    for i, value in enumerate(row):
        if hasattr(value, 'strftime'):
            contrato_banco[columns[i]] = value.strftime('%Y-%m-%d')
        else:
            contrato_banco[columns[i]] = value
    
    print(f"BANCO: {len(columns)} colunas na tabela")
    print(f"BANCO: Contrato ID 1 - {contrato_banco.get('id')}")
    
    # 3. Buscar contrato 1 via API específica
    response_1 = requests.get("http://localhost:8000/api/contratos/1")
    if response_1.status_code == 200:
        contrato_api_1 = response_1.json().get('data', {})
        print(f"API: Contrato 1 - {len(contrato_api_1.keys())} campos")
        
        # Comparar campos específicos
        campos_teste = ['valor_aluguel', 'data_entrega_chaves', 'periodo_contrato', 'valor_fci']
        
        print(f"\nCOMPARACAO CAMPOS:")
        for campo in campos_teste:
            api_val = contrato_api_1.get(campo)
            banco_val = contrato_banco.get(campo)
            
            if api_val == banco_val:
                print(f"OK - {campo}: {api_val}")
            else:
                print(f"DIFF - {campo}: API={api_val} vs BANCO={banco_val}")
                
        # Verificar se campos novos existem no banco
        print(f"\nCAMPOS NOVOS NO BANCO:")
        novos = ['data_entrega_chaves', 'periodo_contrato', 'tempo_renovacao', 'valor_fci']
        for campo in novos:
            if campo in columns:
                print(f"EXISTE - {campo}: {contrato_banco.get(campo)}")
            else:
                print(f"FALTA - {campo}")
    else:
        print(f"API ERRO: {response_1.status_code}")

conn.close()