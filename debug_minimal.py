import requests

# Teste MINIMAL para encontrar o problema
contrato_id = 1

# Dados mais simples possivel
dados_minimal = {
    "valor_aluguel": 1800.00
}

print(f"TESTE MINIMAL - Contrato {contrato_id}")
print(f"Dados: {dados_minimal}")

response = requests.put(
    f"http://localhost:8000/api/contratos/{contrato_id}",
    json=dados_minimal,
    headers={'Content-Type': 'application/json'}
)

print(f"Status: {response.status_code}")
print(f"Resposta: {response.text}")

# Tentar tambem com outros IDs
for test_id in [1, 2]:
    response = requests.get(f"http://localhost:8000/api/contratos/{test_id}")
    if response.status_code == 200:
        print(f"Contrato {test_id}: EXISTE")
    else:
        print(f"Contrato {test_id}: NAO EXISTE")