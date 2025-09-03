import requests
import json

def verificar_compatibilidade_atual():
    """Testar situação real dos campos após as correções implementadas"""
    print("=== VERIFICAÇÃO DE COMPATIBILIDADE ATUAL ===\n")
    
    # Primeiro buscar um contrato existente para ver todos os campos
    print("1. Buscando contrato existente...")
    try:
        response = requests.get("http://localhost:8000/api/contratos")
        if response.status_code == 200:
            contratos = response.json().get('data', [])
            if contratos:
                contrato = contratos[0]
                print(f"   Contrato encontrado ID: {contrato.get('id', 'N/A')}")
                print(f"   Total de campos retornados: {len(contrato.keys())}")
                
                # Listar todos os campos disponíveis
                print("\n2. Campos disponíveis no banco (via API):")
                campos_banco = sorted(contrato.keys())
                for i, campo in enumerate(campos_banco, 1):
                    valor = contrato.get(campo)
                    print(f"   {i:2d}. {campo}: {type(valor).__name__}")
                
                print(f"\n   TOTAL: {len(campos_banco)} campos disponíveis")
                
            else:
                print("   Nenhum contrato encontrado")
                return
        else:
            print(f"   Erro ao buscar contratos: {response.status_code}")
            return
    except Exception as e:
        print(f"   Erro na conexão: {e}")
        return
    
    # Verificar campos que eram "faltantes" na análise original
    print("\n3. Verificando campos que foram adicionados:")
    campos_adicionados = [
        'data_entrega_chaves',
        'proximo_reajuste_automatico',
        'periodo_contrato', 
        'tempo_renovacao',
        'tempo_reajuste',
        'data_inicio_iptu',
        'data_fim_iptu',
        'parcelas_iptu',
        'parcelas_seguro_fianca', 
        'parcelas_seguro_incendio',
        'valor_fci'
    ]
    
    campos_encontrados = []
    campos_nao_encontrados = []
    
    for campo in campos_adicionados:
        if campo in campos_banco:
            campos_encontrados.append(campo)
            print(f"   ✅ {campo}")
        else:
            campos_nao_encontrados.append(campo)
            print(f"   ❌ {campo}")
    
    # Testar atualização com os novos campos
    if contratos:
        contrato_id = contrato['id']
        print(f"\n4. Testando atualização com novos campos (ID: {contrato_id})...")
        
        dados_teste = {
            'valor_aluguel': float(contrato.get('valor_aluguel', 0)) + 0.01,  # Pequena alteração
            'observacoes': f'Teste de compatibilidade - {len(campos_encontrados)} novos campos'
        }
        
        # Adicionar alguns campos novos se existem
        if 'data_entrega_chaves' in campos_encontrados:
            dados_teste['data_entrega_chaves'] = '2024-03-01'
        if 'periodo_contrato' in campos_encontrados:
            dados_teste['periodo_contrato'] = 12
        if 'valor_fci' in campos_encontrados:
            dados_teste['valor_fci'] = 150.00
            
        try:
            response = requests.put(
                f"http://localhost:8000/api/contratos/{contrato_id}",
                json=dados_teste,
                headers={'Content-Type': 'application/json'},
                timeout=10
            )
            
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                print("   ✅ Atualização funcionou!")
                result = response.json()
                print(f"   Resposta: {result.get('message', 'OK')}")
            else:
                print(f"   ❌ Erro: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Erro na atualização: {e}")
    
    # Resumo final
    print(f"\n{'='*50}")
    print("RESUMO DA COMPATIBILIDADE ATUAL:")
    print(f"{'='*50}")
    print(f"Campos no banco: {len(campos_banco)}")
    print(f"Campos adicionados encontrados: {len(campos_encontrados)}/11")
    print(f"Campos ainda faltantes: {len(campos_nao_encontrados)}")
    
    if campos_nao_encontrados:
        print(f"\nCampos ainda não encontrados:")
        for campo in campos_nao_encontrados:
            print(f"  - {campo}")
    
    # Calcular % de compatibilidade baseado na realidade
    total_esperado = 65 + 11  # Campos originais + campos adicionados
    compatibilidade = (len(campos_banco) / total_esperado) * 100
    print(f"\nCompatibilidade calculada: {compatibilidade:.1f}%")
    
    print(f"{'='*50}")

if __name__ == "__main__":
    verificar_compatibilidade_atual()