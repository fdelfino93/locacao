import requests
import json

# Testar especificamente o botao "Salvar Alteracoes"
def test_save_button():
    contrato_id = 1
    
    print("=== TESTANDO BOTAO SALVAR ALTERACOES ===")
    print(f"Contrato ID: {contrato_id}")
    
    # 1. Primeiro buscar o contrato atual
    print("\n1. Buscando contrato atual...")
    response = requests.get(f"http://localhost:8000/api/contratos/{contrato_id}")
    
    if response.status_code != 200:
        print(f"ERRO ao buscar contrato: {response.status_code}")
        return
    
    contrato_atual = response.json().get('data', {})
    print(f"OK - Contrato encontrado: {contrato_atual.get('id')}")
    
    # 2. Simular uma edicao (alterar um campo)
    print("\n2. Simulando edicao...")
    contrato_editado = contrato_atual.copy()
    
    # Verificar e ajustar valores nulos
    valor_atual = contrato_editado.get('valor_aluguel')
    if valor_atual is None:
        contrato_editado['valor_aluguel'] = 1500.00
    else:
        contrato_editado['valor_aluguel'] = float(valor_atual) + 100
    
    contrato_editado['bonificacao'] = 150.00
    contrato_editado['data_entrega_chaves'] = '2024-01-20'
    contrato_editado['periodo_contrato'] = 18
    
    print(f"Valores alterados:")
    print(f"- valor_aluguel: {contrato_atual.get('valor_aluguel')} -> {contrato_editado['valor_aluguel']}")
    print(f"- bonificacao: {contrato_atual.get('bonificacao')} -> {contrato_editado['bonificacao']}")
    print(f"- data_entrega_chaves: -> {contrato_editado['data_entrega_chaves']}")
    print(f"- periodo_contrato: -> {contrato_editado['periodo_contrato']}")
    
    # 3. Enviar como o frontend faria (botao Salvar Alteracoes)
    print("\n3. Enviando alteracoes via PUT...")
    response = requests.put(
        f"http://localhost:8000/api/contratos/{contrato_id}",
        json=contrato_editado,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status: {response.status_code}")
    try:
        result = response.json()
        print(f"Resposta: {result}")
        
        if response.status_code == 200:
            print("\nSUCESSO! Alteracoes salvas!")
        else:
            print(f"\nERRO: {result.get('detail', 'Erro desconhecido')}")
    except:
        print(f"Erro ao decodificar resposta: {response.text}")

if __name__ == "__main__":
    test_save_button()