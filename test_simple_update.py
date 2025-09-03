import requests

# Teste mais simples - apenas com campos que sabemos que existem
contrato_id = 1

dados_simples = {
    "valor_aluguel": 1500.00,
    "data_entrega_chaves": "2024-01-20",
    "periodo_contrato": 18
}

print(f"Testando UPDATE simples no contrato {contrato_id}")
print(f"Dados: {dados_simples}")

response = requests.put(
    f"http://localhost:8000/api/contratos/{contrato_id}",
    json=dados_simples,
    headers={"Content-Type": "application/json"}
)

print(f"\nStatus: {response.status_code}")
try:
    result = response.json()
    print(f"Resposta: {result}")
except:
    print(f"Texto da resposta: {response.text}")