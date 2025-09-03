import requests
import json
from repositories_adapter import get_conexao

def test_contract_creation():
    """Testar criação de contrato como o frontend faz"""
    print("=== TESTE: CRIACAO DE CONTRATO (Frontend Real) ===\n")
    
    # Dados que o frontend enviaria
    contrato_data = {
        "id_imovel": 3,  # Usar um imóvel que existe
        "id_inquilino": 3,  # Usar um locatário que existe
        "data_inicio": "2024-02-01",
        "data_fim": "2025-02-01", 
        "data_entrega_chaves": "2024-01-25",
        "periodo_contrato": 12,
        "taxa_administracao": 8.5,
        "fundo_conservacao": 0,
        "valor_aluguel": 2000.00,
        "valor_condominio": 300.00,
        "valor_fci": 100.00,
        "vencimento_dia": 10,
        "renovacao_automatica": True,
        "tipo_garantia": "Fiança",
        "locadores": [{"locador_id": 1, "porcentagem": 100}],
        "locatarios": [{"locatario_id": 3, "responsabilidade_principal": True}]
    }
    
    print(f"Dados do contrato a criar:")
    print(f"- Imóvel ID: {contrato_data['id_imovel']}")
    print(f"- Locatário ID: {contrato_data['id_inquilino']}")
    print(f"- Valor: R$ {contrato_data['valor_aluguel']}")
    
    try:
        # POST como o frontend faz
        response = requests.post(
            "http://localhost:8000/api/contratos",
            json=contrato_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"\nStatus: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"SUCESSO: {result}")
            
            # Verificar se foi criado no banco
            if result.get('success') and result.get('data', {}).get('id'):
                contrato_id = result['data']['id']
                print(f"\nContrato criado com ID: {contrato_id}")
                return contrato_id
        else:
            result = response.json()
            print(f"ERRO: {result.get('detail', 'Erro desconhecido')}")
            
    except requests.exceptions.Timeout:
        print("❌ TIMEOUT: Servidor demorou para responder")
    except Exception as e:
        print(f"❌ ERRO na requisição: {e}")
    
    return None

def test_contract_edit(contrato_id):
    """Testar edição como o frontend faz"""
    print(f"\n=== TESTE: EDICAO DE CONTRATO {contrato_id} ===\n")
    
    # 1. Buscar contrato atual (como frontend faz)
    print("1. Buscando contrato atual...")
    response = requests.get(f"http://localhost:8000/api/contratos/{contrato_id}")
    
    if response.status_code != 200:
        print(f"❌ Erro ao buscar: {response.status_code}")
        return
    
    contrato_atual = response.json().get('data', {})
    print(f"✅ Contrato carregado: {len(contrato_atual.keys())} campos")
    
    # 2. Simular edição
    print("\n2. Simulando edição...")
    contrato_editado = contrato_atual.copy()
    
    # Fazer mudanças como um usuário faria
    valor_antigo = contrato_editado.get('valor_aluguel', 0)
    contrato_editado['valor_aluguel'] = float(valor_antigo) + 150.50 if valor_antigo else 1850.50
    contrato_editado['bonificacao'] = 250.00
    contrato_editado['data_entrega_chaves'] = '2024-01-28'
    contrato_editado['periodo_contrato'] = 24
    
    print(f"Mudanças:")
    print(f"- valor_aluguel: {valor_antigo} → {contrato_editado['valor_aluguel']}")
    print(f"- bonificacao: → {contrato_editado['bonificacao']}")
    print(f"- periodo_contrato: → {contrato_editado['periodo_contrato']}")
    
    # 3. Salvar como frontend faz
    print("\n3. Salvando alterações...")
    
    try:
        response = requests.put(
            f"http://localhost:8000/api/contratos/{contrato_id}",
            json=contrato_editado,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ SUCESSO: {result}")
            
            # 4. Verificar no banco
            print("\n4. Verificando no banco...")
            conn = get_conexao()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT valor_aluguel, bonificacao, periodo_contrato 
                FROM Contratos 
                WHERE id = ?
            """, (contrato_id,))
            
            row = cursor.fetchone()
            conn.close()
            
            if row:
                banco_aluguel = float(row[0]) if row[0] else None
                banco_bonificacao = float(row[1]) if row[1] else None
                banco_periodo = int(row[2]) if row[2] else None
                
                print(f"Dados no banco:")
                print(f"- valor_aluguel: {banco_aluguel}")
                print(f"- bonificacao: {banco_bonificacao}")
                print(f"- periodo_contrato: {banco_periodo}")
                
                if banco_aluguel == contrato_editado['valor_aluguel']:
                    print("✅ valor_aluguel salvo corretamente!")
                else:
                    print("❌ valor_aluguel NÃO foi salvo!")
                    
        else:
            result = response.json()
            print(f"❌ ERRO: {result.get('detail', 'Erro desconhecido')}")
            
    except Exception as e:
        print(f"❌ ERRO: {e}")

def main():
    print("TESTE COMPLETO DO FLUXO FRONTEND -> BACKEND -> BANCO\n")
    
    # Testar criação
    # contrato_id = test_contract_creation()
    
    # Testar edição no contrato existente
    contrato_id = 1  # Usar contrato que já existe
    test_contract_edit(contrato_id)
    
    print("\n" + "="*60)
    print("TESTE FINALIZADO")

if __name__ == "__main__":
    main()