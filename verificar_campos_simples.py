import requests
import json

def verificar_campos():
    print("=== VERIFICACAO DE COMPATIBILIDADE ATUAL ===\n")
    
    # Buscar contrato existente
    print("1. Buscando contrato existente...")
    try:
        response = requests.get("http://localhost:8000/api/contratos")
        if response.status_code == 200:
            contratos = response.json().get('data', [])
            if contratos:
                contrato = contratos[0]
                print(f"   Contrato ID: {contrato.get('id', 'N/A')}")
                print(f"   Total de campos: {len(contrato.keys())}")
                
                # Listar campos disponíveis
                print("\n2. Campos disponíveis no banco:")
                campos_banco = sorted(contrato.keys())
                for i, campo in enumerate(campos_banco, 1):
                    print(f"   {i:2d}. {campo}")
                
                # Verificar campos que deveriam ter sido adicionados
                print("\n3. Verificando campos adicionados:")
                campos_adicionados = [
                    'data_entrega_chaves',
                    'periodo_contrato', 
                    'tempo_renovacao',
                    'parcelas_iptu',
                    'valor_fci'
                ]
                
                encontrados = 0
                for campo in campos_adicionados:
                    if campo in campos_banco:
                        print(f"   OK: {campo}")
                        encontrados += 1
                    else:
                        print(f"   FALTA: {campo}")
                
                print(f"\n   Campos novos encontrados: {encontrados}/{len(campos_adicionados)}")
                
                # Testar busca individual
                print(f"\n4. Testando busca individual (ID: {contrato['id']})...")
                response2 = requests.get(f"http://localhost:8000/api/contratos/{contrato['id']}")
                if response2.status_code == 200:
                    contrato_detalhado = response2.json().get('data', {})
                    print(f"   Campos na busca individual: {len(contrato_detalhado.keys())}")
                    
                    # Ver se tem mais campos na busca individual
                    campos_extras = set(contrato_detalhado.keys()) - set(campos_banco)
                    if campos_extras:
                        print("   Campos extras na busca individual:")
                        for campo in sorted(campos_extras):
                            print(f"     - {campo}")
                
                # Calcular compatibilidade
                total_teorico = 76  # Baseado na análise original + campos adicionados
                compatibilidade = (len(campos_banco) / total_teorico) * 100
                print(f"\nCompatibilidade estimada: {compatibilidade:.1f}%")
                
            else:
                print("   Nenhum contrato encontrado")
        else:
            print(f"   Erro: {response.status_code}")
            
    except Exception as e:
        print(f"   Erro: {e}")

if __name__ == "__main__":
    verificar_campos()