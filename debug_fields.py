import requests

def test_with_different_fields():
    """Testar com diferentes conjuntos de campos para encontrar o problema"""
    
    contrato_id = 1
    
    # Primeiro buscar o contrato para ver todos os campos
    response = requests.get(f"http://localhost:8000/api/contratos/{contrato_id}")
    contrato = response.json().get('data', {})
    
    print(f"Contrato tem {len(contrato.keys())} campos")
    
    # Teste 1: Apenas campos basicos
    print("\n1. Testando apenas campos basicos...")
    dados_basicos = {
        "valor_aluguel": 1850.00,
        "bonificacao": 100.00
    }
    
    response = requests.put(f"http://localhost:8000/api/contratos/{contrato_id}", 
                           json=dados_basicos, headers={'Content-Type': 'application/json'})
    print(f"Status: {response.status_code} - {response.json()}")
    
    # Teste 2: Adicionar mais campos
    print("\n2. Testando com mais campos...")
    dados_mais = {
        "valor_aluguel": 1860.00,
        "bonificacao": 150.00,
        "periodo_contrato": 24,
        "data_entrega_chaves": "2024-02-01"
    }
    
    response = requests.put(f"http://localhost:8000/api/contratos/{contrato_id}", 
                           json=dados_mais, headers={'Content-Type': 'application/json'})
    print(f"Status: {response.status_code} - {response.json()}")
    
    # Teste 3: Tentar com TODOS os campos (como frontend faz)
    print("\n3. Testando com TODOS os campos...")
    response = requests.put(f"http://localhost:8000/api/contratos/{contrato_id}", 
                           json=contrato, headers={'Content-Type': 'application/json'})
    print(f"Status: {response.status_code}")
    if response.status_code != 200:
        print(f"ERRO: {response.json()}")
    else:
        print("OK: Todos os campos funcionaram")

if __name__ == "__main__":
    test_with_different_fields()