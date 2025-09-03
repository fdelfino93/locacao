import requests
import json
from datetime import datetime, date, timedelta

def test_create_contract_v2():
    """Testar criação de contrato com campos obrigatórios mínimos"""
    print("=== TESTE DE CRIAÇÃO DE CONTRATO V2 ===\n")
    
    # Primeiro, verificar se temos imóveis e locatários disponíveis
    print("1. Verificando imóveis disponíveis...")
    try:
        imoveis_response = requests.get("http://localhost:8000/api/imoveis")
        if imoveis_response.status_code == 200:
            imoveis = imoveis_response.json().get('data', [])
            if imoveis:
                imovel_id = imoveis[0]['id']
                print(f"   Usando imóvel ID: {imovel_id}")
            else:
                print("   Nenhum imóvel encontrado")
                return
        else:
            print(f"   Erro ao buscar imóveis: {imoveis_response.status_code}")
            return
    except Exception as e:
        print(f"   Erro na conexão: {e}")
        return
    
    print("2. Verificando locatários disponíveis...")
    try:
        locatarios_response = requests.get("http://localhost:8000/api/locatarios")
        if locatarios_response.status_code == 200:
            locatarios = locatarios_response.json().get('data', [])
            if locatarios:
                locatario_id = locatarios[0]['id']
                print(f"   Usando locatário ID: {locatario_id}")
            else:
                print("   Nenhum locatário encontrado")
                return
        else:
            print(f"   Erro ao buscar locatários: {locatarios_response.status_code}")
            return
    except Exception as e:
        print(f"   Erro na conexão: {e}")
        return
    
    # Dados mínimos obrigatórios para criar um contrato
    data_inicio = date.today()
    data_fim = data_inicio + timedelta(days=365)  # 1 ano
    
    dados_contrato = {
        "id_imovel": imovel_id,
        "id_locatario": locatario_id,
        "data_inicio": data_inicio.isoformat(),
        "data_fim": data_fim.isoformat(),
        "valor_aluguel": 1500.00,
        "vencimento_dia": 5,
        "tipo_garantia": "caucao"
    }
    
    print(f"\n3. Dados enviados: {json.dumps(dados_contrato, indent=2, default=str)}")
    
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
        elif response.status_code in [200, 201]:
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
    test_create_contract_v2()