"""
Script para testar múltiplas formas de cobrança
"""

import requests
import json

def testar_adicionar_formas_cobranca():
    """Testa adição de múltiplas formas de cobrança para um locatário"""
    
    # Dados de teste com 4 formas diferentes
    dados_atualizacao = {
        "formas_envio_cobranca": [
            {
                "tipo": "email",
                "contato": "financeiro@empresa.com",
                "observacoes": "Email principal financeiro",
                "principal": True,
                "ordem": 0
            },
            {
                "tipo": "email", 
                "contato": "backup@empresa.com",
                "observacoes": "Email backup",
                "principal": False,
                "ordem": 1
            },
            {
                "tipo": "whatsapp",
                "contato": "41999887766",
                "observacoes": "WhatsApp do responsável",
                "principal": False,
                "ordem": 2
            },
            {
                "tipo": "whatsapp",
                "contato": "41988776655", 
                "observacoes": "WhatsApp alternativo",
                "principal": False,
                "ordem": 3
            },
            {
                "tipo": "imovel",
                "contato": "Rua das Palmeiras, 789 - Sala 12",
                "observacoes": "Entrega no escritório",
                "principal": False,
                "ordem": 4
            }
        ]
    }
    
    # Usar locatário ID 5 que já tem formas de cobrança
    locatario_id = 5
    url = f"http://localhost:8000/api/locatarios/{locatario_id}"
    
    print("=" * 60)
    print("TESTANDO MÚLTIPLAS FORMAS DE COBRANÇA")
    print("=" * 60)
    print(f"Locatário ID: {locatario_id}")
    print(f"Novas formas de cobrança: {len(dados_atualizacao['formas_envio_cobranca'])}")
    
    try:
        # Fazer PUT request
        response = requests.put(url, json=dados_atualizacao)
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ SUCESSO - Formas de cobrança atualizadas!")
            print(f"Mensagem: {result.get('message', 'Sem mensagem')}")
            
            # Verificar se foi salvo
            print("\n--- Verificando dados salvos ---")
            get_response = requests.get(url)
            if get_response.status_code == 200:
                data = get_response.json()
                formas = data.get('data', {}).get('formas_envio_cobranca', [])
                print(f"Formas de cobrança retornadas: {len(formas)}")
                
                for i, forma in enumerate(formas, 1):
                    print(f"{i}. {forma['tipo']} - {forma['contato']} (Principal: {forma.get('principal', False)})")
                    
            else:
                print("❌ Erro ao verificar dados salvos")
                
        else:
            print("❌ ERRO na atualização")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ ERRO na requisição: {e}")

if __name__ == "__main__":
    testar_adicionar_formas_cobranca()