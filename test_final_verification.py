import requests
from repositories_adapter import get_conexao

def test_final_verification():
    """Teste final para verificar se tudo funciona"""
    print("=== VERIFICACAO FINAL DO SISTEMA ===\n")
    
    contrato_id = 1
    
    # 1. Testar se podemos buscar o contrato
    print("1. Testando busca de contrato...")
    response = requests.get(f"http://localhost:8000/api/contratos/{contrato_id}")
    
    if response.status_code == 200:
        contrato = response.json().get('data', {})
        print(f"OK - Contrato carregado com {len(contrato.keys())} campos")
        
        # 2. Fazer uma pequena alteração
        print("\n2. Testando alteracao pequena...")
        valor_atual = contrato.get('valor_aluguel', 0)
        novo_valor = float(valor_atual) + 50.25 if valor_atual else 1850.25
        
        contrato['valor_aluguel'] = novo_valor
        contrato['observacoes'] = f"Teste de edicao - {novo_valor}"
        
        print(f"Alterando valor_aluguel: {valor_atual} -> {novo_valor}")
        
        # 3. Salvar alteração
        print("\n3. Salvando alteracao...")
        response = requests.put(
            f"http://localhost:8000/api/contratos/{contrato_id}",
            json=contrato,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"OK - Resposta: {result}")
            
            # 4. Verificar no banco
            print("\n4. Verificando no banco...")
            conn = get_conexao()
            cursor = conn.cursor()
            cursor.execute("SELECT valor_aluguel, observacoes FROM Contratos WHERE id = ?", (contrato_id,))
            row = cursor.fetchone()
            conn.close()
            
            if row:
                banco_valor = float(row[0]) if row[0] else None
                banco_obs = row[1]
                
                print(f"Banco - valor_aluguel: {banco_valor}")
                print(f"Banco - observacoes: {banco_obs}")
                
                if banco_valor == novo_valor:
                    print("\nPERFEITO! Sistema funcionando 100%")
                    print("Edicoes estao sendo salvas no banco")
                    return True
                else:
                    print("\nPROBLEMA: Valor nao foi salvo no banco")
                    return False
            else:
                print("\nERRO: Nao foi possivel verificar no banco")
                return False
        else:
            result = response.json()
            print(f"\nERRO na API: {result}")
            return False
    else:
        print(f"ERRO ao buscar contrato: {response.status_code}")
        return False

def main():
    print("TESTE FINAL DE FUNCIONAMENTO\n")
    
    success = test_final_verification()
    
    print(f"\n{'='*50}")
    if success:
        print("SISTEMA FUNCIONANDO PERFEITAMENTE!")
        print("Voce pode usar o sistema para editar contratos")
        print("As alteracoes estao sendo salvas no banco")
    else:
        print("AINDA HA PROBLEMAS NO SISTEMA")
        print("Precisa de mais investigacao")
    
    print(f"{'='*50}")

if __name__ == "__main__":
    main()