import requests
import json

def test_create_contract():
    """Testar criação de contrato para identificar erro 422"""
    print("=== TESTE DE CRIAÇÃO DE CONTRATO ===\n")
    
    # Dados mínimos para criar um contrato
    dados_contrato = {
        "valor_aluguel": 1500.00,
        "data_inicio": "2024-03-01",
        "periodo_contrato": 12,
        "vencimento_dia": 5,
        "tipo_garantia": "caucao"
    }
    
    print(f"Dados enviados: {json.dumps(dados_contrato, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/contratos",
            json=dados_contrato,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        print(f"\nStatus: {response.status_code}")
        
        if response.status_code == 422:
            print("ERRO 422 - Detalhes:")
            try:
                error_details = response.json()
                print(json.dumps(error_details, indent=2, ensure_ascii=False))
            except:
                print("Não foi possível decodificar a resposta JSON")
                print(f"Texto da resposta: {response.text}")
        elif response.status_code == 200 or response.status_code == 201:
            result = response.json()
            print(f"SUCESSO: {json.dumps(result, indent=2, ensure_ascii=False)}")
        else:
            print(f"Status inesperado: {response.status_code}")
            print(f"Resposta: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("ERRO: Não foi possível conectar ao servidor na porta 8000")
        print("Certifique-se de que o servidor está rodando")
    except Exception as e:
        print(f"ERRO: {e}")

if __name__ == "__main__":
    test_create_contract()