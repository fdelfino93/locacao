import requests
from repositories_adapter import get_conexao

def verificar_dados_frontend_vs_banco():
    """Compara dados do frontend com dados reais do banco"""
    
    print("=== VERIFICACAO: FRONTEND vs BANCO DE DADOS ===\n")
    
    # 1. Buscar dados via API (como o frontend faz)
    print("1. BUSCANDO DADOS VIA API (Frontend):")
    try:
        response = requests.get("http://localhost:8000/api/contratos")
        if response.status_code == 200:
            contratos_api = response.json().get('data', [])
            print(f"   - Encontrados {len(contratos_api)} contratos via API")
            
            # Mostrar primeiro contrato da API
            if contratos_api:
                contrato_1_api = contratos_api[0]
                print(f"   - Primeiro contrato API - ID: {contrato_1_api.get('id')}")
                print(f"   - Campos na resposta API: {len(contrato_1_api.keys())}")
        else:
            print(f"   ERRO na API: {response.status_code}")
            return
    except Exception as e:
        print(f"   ERRO ao conectar API: {e}")
        return
    
    print("\n" + "="*50)
    
    # 2. Buscar dados diretamente no banco
    print("2. BUSCANDO DADOS DIRETO NO BANCO:")
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Buscar todos os contratos
        cursor.execute("SELECT * FROM Contratos ORDER BY id")
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        
        print(f"   - Encontrados {len(rows)} contratos no banco")
        print(f"   - Colunas na tabela: {len(columns)}")
        
        if rows:
            # Converter primeira linha para dict
            contrato_1_banco = {}
            for i, value in enumerate(rows[0]):
                # Converter datetime para string
                if hasattr(value, 'strftime'):
                    contrato_1_banco[columns[i]] = value.strftime('%Y-%m-%d')
                else:
                    contrato_1_banco[columns[i]] = value
            
            print(f"   - Primeiro contrato BANCO - ID: {contrato_1_banco.get('id')}")
        
        conn.close()
        
    except Exception as e:
        print(f"   ERRO ao conectar banco: {e}")
        return
    
    print("\n" + "="*50)
    
    # 3. Comparar dados específicos do primeiro contrato
    print("3. COMPARACAO DETALHADA - CONTRATO ID 1:")
    
    if contratos_api and rows:
        contrato_api = None
        contrato_banco = None
        
        # Encontrar contrato ID 1 na API
        for c in contratos_api:
            if c.get('id') == 1:
                contrato_api = c
                break
        
        # Encontrar contrato ID 1 no banco
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                if hasattr(value, 'strftime'):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d')
                else:
                    row_dict[columns[i]] = value
            
            if row_dict.get('id') == 1:
                contrato_banco = row_dict
                break
        
        if contrato_api and contrato_banco:
            print(f"   ✓ Contrato ID 1 encontrado em ambos")
            
            # Verificar campos importantes
            campos_importantes = [
                'valor_aluguel', 'data_entrega_chaves', 'periodo_contrato', 
                'tempo_renovacao', 'tempo_reajuste', 'valor_fci', 'bonificacao',
                'taxa_administracao', 'parcelas_iptu'
            ]
            
            print(f"\n   COMPARACAO DE CAMPOS IMPORTANTES:")
            diferencas = 0
            for campo in campos_importantes:
                valor_api = contrato_api.get(campo)
                valor_banco = contrato_banco.get(campo)
                
                if valor_api != valor_banco:
                    print(f"   ❌ {campo}:")
                    print(f"      API: {valor_api}")
                    print(f"      Banco: {valor_banco}")
                    diferencas += 1
                else:
                    print(f"   ✅ {campo}: {valor_api}")
            
            if diferencas == 0:
                print(f"\n   🎉 PERFEITO! Todos os campos coincidem!")
            else:
                print(f"\n   ⚠️ Encontradas {diferencas} diferenças")
                
        else:
            print(f"   ❌ Contrato ID 1 não encontrado")
            if not contrato_api:
                print(f"      - Não encontrado na API")
            if not contrato_banco:
                print(f"      - Não encontrado no banco")
    
    print("\n" + "="*50)
    
    # 4. Verificar campos novos especificamente
    print("4. VERIFICACAO DOS 11 CAMPOS NOVOS:")
    
    campos_novos = [
        'data_entrega_chaves', 'proximo_reajuste_automatico', 'periodo_contrato',
        'tempo_renovacao', 'tempo_reajuste', 'data_inicio_iptu', 'data_fim_iptu',
        'parcelas_iptu', 'parcelas_seguro_fianca', 'parcelas_seguro_incendio', 'valor_fci'
    ]
    
    if contrato_banco:
        for campo in campos_novos:
            valor = contrato_banco.get(campo)
            if campo in columns:
                print(f"   ✅ {campo}: {valor} (existe no banco)")
            else:
                print(f"   ❌ {campo}: NÃO EXISTE no banco")
    
    print(f"\n=== VERIFICACAO CONCLUIDA ===")

if __name__ == "__main__":
    verificar_dados_frontend_vs_banco()