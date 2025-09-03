import requests
import json

# Teste de atualização de contrato
def test_update_contract():
    # ID do contrato para testar (ajuste conforme necessário)
    contrato_id = 1
    
    # Dados para atualizar
    dados_teste = {
        "valor_aluguel": 2500.00,
        "taxa_administracao": 10.5,
        "bonificacao": 100.00,
        "data_entrega_chaves": "2024-01-15",
        "periodo_contrato": 24,
        "tempo_renovacao": 12,
        "tempo_reajuste": 12,
        "parcelas_iptu": 12,
        "valor_fci": 50.00
    }
    
    print(f"=== TESTE DE ATUALIZAÇÃO DO CONTRATO {contrato_id} ===")
    print(f"Enviando {len(dados_teste)} campos para atualização...")
    print("Campos:", list(dados_teste.keys()))
    
    try:
        # Fazer requisição PUT
        response = requests.put(
            f"http://localhost:8000/api/contratos/{contrato_id}",
            json=dados_teste,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"\nStatus da resposta: {response.status_code}")
        print(f"Resposta do servidor: {response.json()}")
        
        if response.status_code == 200:
            print("\nSUCESSO: Contrato atualizado!")
        else:
            print(f"\nERRO: {response.json().get('detail', 'Erro desconhecido')}")
            
    except Exception as e:
        print(f"\nERRO na requisicao: {e}")

if __name__ == "__main__":
    test_update_contract()