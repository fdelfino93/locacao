import requests
import json
from repositories_adapter import get_conexao

def test_real_edit_flow():
    """Simular o fluxo exato que o frontend faz quando você edita"""
    
    print("=== TESTE DO FLUXO REAL DE EDICAO ===\n")
    
    contrato_id = 1
    
    # PASSO 1: Buscar contrato como o frontend faz
    print("1. BUSCANDO CONTRATO (como frontend)...")
    response = requests.get(f"http://localhost:8000/api/contratos/{contrato_id}")
    
    if response.status_code != 200:
        print(f"ERRO ao buscar: {response.status_code}")
        return
    
    contrato_atual = response.json().get('data', {})
    print(f"   OK - Contrato {contrato_atual.get('id')} carregado")
    print(f"   Campos carregados: {len(contrato_atual.keys())}")
    
    # PASSO 2: Simular uma edicao pequena (como usuario faria)
    print(f"\n2. SIMULANDO EDICAO PELO USUARIO...")
    contrato_editado = contrato_atual.copy()
    
    # Simular mudancas que um usuario faria
    valor_original = contrato_editado.get('valor_aluguel')
    contrato_editado['valor_aluguel'] = 1750.50  # Mudanca simples
    contrato_editado['bonificacao'] = 200.00     # Adicionar bonificacao
    
    print(f"   Alteracao: valor_aluguel {valor_original} -> {contrato_editado['valor_aluguel']}")
    print(f"   Alteracao: bonificacao -> {contrato_editado['bonificacao']}")
    
    # PASSO 3: Salvar como o botao "Salvar Alteracoes" faz
    print(f"\n3. SALVANDO ALTERACOES...")
    print(f"   Enviando {len(contrato_editado)} campos via PUT")
    
    response = requests.put(
        f"http://localhost:8000/api/contratos/{contrato_id}",
        json=contrato_editado,
        headers={'Content-Type': 'application/json'},
        timeout=30
    )
    
    print(f"   Status HTTP: {response.status_code}")
    
    try:
        result = response.json()
        print(f"   Resposta: {result}")
        
        if response.status_code == 200:
            print(f"   ✅ API confirmou sucesso!")
        else:
            print(f"   ❌ API retornou erro: {result.get('detail', 'Desconhecido')}")
            return
            
    except Exception as e:
        print(f"   ❌ Erro ao decodificar resposta: {e}")
        print(f"   Resposta bruta: {response.text[:500]}")
        return
    
    # PASSO 4: Verificar se realmente salvou no banco
    print(f"\n4. VERIFICANDO SE SALVOU NO BANCO...")
    
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT valor_aluguel, bonificacao 
            FROM Contratos 
            WHERE id = ?
        """, (contrato_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            banco_aluguel = float(row[0]) if row[0] else None
            banco_bonificacao = float(row[1]) if row[1] else None
            
            print(f"   Banco - valor_aluguel: {banco_aluguel}")
            print(f"   Banco - bonificacao: {banco_bonificacao}")
            
            # Comparar valores
            if banco_aluguel == contrato_editado['valor_aluguel']:
                print(f"   ✅ valor_aluguel foi salvo corretamente!")
            else:
                print(f"   ❌ valor_aluguel NAO foi salvo:")
                print(f"      Esperado: {contrato_editado['valor_aluguel']}")
                print(f"      No banco: {banco_aluguel}")
            
            if banco_bonificacao == contrato_editado['bonificacao']:
                print(f"   ✅ bonificacao foi salva corretamente!")
            else:
                print(f"   ❌ bonificacao NAO foi salva:")
                print(f"      Esperado: {contrato_editado['bonificacao']}")
                print(f"      No banco: {banco_bonificacao}")
                
        else:
            print(f"   ❌ Contrato {contrato_id} nao encontrado no banco!")
            
    except Exception as e:
        print(f"   ❌ Erro ao verificar banco: {e}")
    
    # PASSO 5: Verificar via API novamente
    print(f"\n5. RE-VERIFICANDO VIA API...")
    
    response_verify = requests.get(f"http://localhost:8000/api/contratos/{contrato_id}")
    if response_verify.status_code == 200:
        contrato_verificado = response_verify.json().get('data', {})
        
        api_aluguel = contrato_verificado.get('valor_aluguel')
        api_bonificacao = contrato_verificado.get('bonificacao')
        
        print(f"   API - valor_aluguel: {api_aluguel}")
        print(f"   API - bonificacao: {api_bonificacao}")
        
        if api_aluguel == contrato_editado['valor_aluguel']:
            print(f"   ✅ API mostra valor_aluguel correto!")
        else:
            print(f"   ❌ API nao mostra valor_aluguel correto")
            
    print(f"\n=== TESTE COMPLETO ===")

if __name__ == "__main__":
    test_real_edit_flow()