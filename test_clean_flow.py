import requests
import json
from repositories_adapter import get_conexao

def test_contract_edit(contrato_id):
    """Testar edicao como o frontend faz"""
    print(f"=== TESTE: EDICAO DE CONTRATO {contrato_id} ===")
    
    # 1. Buscar contrato atual
    print("1. Buscando contrato atual...")
    response = requests.get(f"http://localhost:8000/api/contratos/{contrato_id}")
    
    if response.status_code != 200:
        print(f"ERRO ao buscar: {response.status_code}")
        return
    
    contrato_atual = response.json().get('data', {})
    print(f"OK - Contrato carregado: {len(contrato_atual.keys())} campos")
    
    # 2. Simular edicao
    print("\n2. Simulando edicao...")
    contrato_editado = contrato_atual.copy()
    
    # Fazer mudancas
    valor_antigo = contrato_editado.get('valor_aluguel', 0)
    contrato_editado['valor_aluguel'] = float(valor_antigo) + 200.75 if valor_antigo else 1900.75
    contrato_editado['bonificacao'] = 300.00
    contrato_editado['periodo_contrato'] = 36
    
    print(f"Mudancas:")
    print(f"- valor_aluguel: {valor_antigo} -> {contrato_editado['valor_aluguel']}")
    print(f"- bonificacao: -> {contrato_editado['bonificacao']}")
    print(f"- periodo_contrato: -> {contrato_editado['periodo_contrato']}")
    
    # 3. Salvar
    print("\n3. Salvando alteracoes...")
    
    try:
        response = requests.put(
            f"http://localhost:8000/api/contratos/{contrato_id}",
            json=contrato_editado,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"Status HTTP: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"RESPOSTA: {result}")
            
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
                
                print(f"DADOS NO BANCO:")
                print(f"- valor_aluguel: {banco_aluguel}")
                print(f"- bonificacao: {banco_bonificacao}")
                print(f"- periodo_contrato: {banco_periodo}")
                
                # Verificar se salvou
                sucesso = True
                if banco_aluguel != contrato_editado['valor_aluguel']:
                    print("ERRO: valor_aluguel NAO foi salvo!")
                    sucesso = False
                if banco_bonificacao != contrato_editado['bonificacao']:
                    print("ERRO: bonificacao NAO foi salva!")
                    sucesso = False
                if banco_periodo != contrato_editado['periodo_contrato']:
                    print("ERRO: periodo_contrato NAO foi salvo!")
                    sucesso = False
                    
                if sucesso:
                    print("SUCESSO: Todas as alteracoes foram salvas!")
                    
        else:
            result = response.json()
            print(f"ERRO API: {result.get('detail', 'Erro desconhecido')}")
            
    except Exception as e:
        print(f"ERRO REQUISICAO: {e}")

def main():
    print("TESTE DO FLUXO DE EDICAO REAL\n")
    
    contrato_id = 1  # Testar no contrato 1
    test_contract_edit(contrato_id)
    
    print("\n" + "="*50)
    print("TESTE FINALIZADO")

if __name__ == "__main__":
    main()