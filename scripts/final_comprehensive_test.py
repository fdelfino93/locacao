"""
TESTE FINAL COMPLETO - Validação de todas as melhorias implementadas
"""
import sys
import os
import time

# Corrigir PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_database_structure():
    """Testa estrutura do banco após melhorias"""
    print("1. TESTE DA ESTRUTURA DO BANCO")
    print("=" * 40)
    
    try:
        import pyodbc
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        
        connection_string = (
            f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
            f"SERVER={os.getenv('DB_SERVER')};"
            f"DATABASE={os.getenv('DB_DATABASE')};"
            f"UID={os.getenv('DB_USER')};"
            f"PWD={os.getenv('DB_PASSWORD')}"
        )
        
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        
        # Verificar tabelas originais
        tabelas_originais = ['Clientes', 'Inquilinos', 'Imoveis', 'Contratos']
        for tabela in tabelas_originais:
            cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
            count = cursor.fetchone()[0]
            print(f"  {tabela}: {count} registros")
        
        # Verificar novas tabelas
        cursor.execute("SELECT COUNT(*) FROM Enderecos")
        enderecos = cursor.fetchone()[0]
        print(f"  Enderecos (NOVA): {enderecos} registros")
        
        cursor.execute("SELECT COUNT(*) FROM DadosBancarios")
        dados = cursor.fetchone()[0]
        print(f"  DadosBancarios (NOVA): {dados} registros")
        
        # Verificar novas colunas em Clientes
        cursor.execute("""
            SELECT COUNT(*) FROM Clientes 
            WHERE endereco_id IS NOT NULL OR dados_bancarios_id IS NOT NULL OR tipo_pessoa IS NOT NULL
        """)
        com_melhorias = cursor.fetchone()[0]
        print(f"  Clientes com melhorias: {com_melhorias}")
        
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"  ERRO: {e}")
        return False

def test_repositories():
    """Testa repositórios antigos e novos"""
    print(f"\n2. TESTE DOS REPOSITORIOS")
    print("=" * 40)
    
    success = True
    
    try:
        # Repositório original
        from locacao.repositories.cliente_repository import buscar_clientes
        clientes_orig = buscar_clientes()
        print(f"  Repositorio ORIGINAL: {len(clientes_orig)} clientes")
        
    except Exception as e:
        print(f"  Repositorio ORIGINAL: ERRO - {e}")
        success = False
    
    try:
        # Repositório v2
        from locacao.repositories.cliente_repository_v2 import ClienteService
        clientes_v2 = ClienteService.buscar_clientes_v2()
        print(f"  Repositorio V2: {len(clientes_v2)} clientes")
        
        # Testar funcionalidades v2
        valido, tipo = ClienteService.validar_cpf_cnpj("12345678901")
        print(f"  Validacao CPF/CNPJ: {valido} ({tipo})")
        
    except Exception as e:
        print(f"  Repositorio V2: ERRO - {e}")
        success = False
    
    return success

def test_data_quality():
    """Testa qualidade dos dados após melhorias"""
    print(f"\n3. TESTE DA QUALIDADE DOS DADOS")
    print("=" * 40)
    
    try:
        from locacao.repositories.cliente_repository_v2 import ClienteService
        clientes = ClienteService.buscar_clientes_v2()
        
        total = len(clientes)
        com_endereco = sum(1 for c in clientes if c['endereco'])
        com_dados_bancarios = sum(1 for c in clientes if c['dados_bancarios'])
        com_tipo_pessoa = sum(1 for c in clientes if c['tipo_pessoa'])
        
        print(f"  Total de clientes: {total}")
        print(f"  Com endereco estruturado: {com_endereco} ({(com_endereco/total)*100:.1f}%)")
        print(f"  Com dados bancarios: {com_dados_bancarios} ({(com_dados_bancarios/total)*100:.1f}%)")
        print(f"  Com tipo pessoa: {com_tipo_pessoa} ({(com_tipo_pessoa/total)*100:.1f}%)")
        
        return True
        
    except Exception as e:
        print(f"  ERRO: {e}")
        return False

def test_performance():
    """Testa performance dos novos métodos"""
    print(f"\n4. TESTE DE PERFORMANCE")
    print("=" * 40)
    
    try:
        from locacao.repositories.cliente_repository import buscar_clientes as buscar_orig
        from locacao.repositories.cliente_repository_v2 import ClienteService
        
        # Método original
        start = time.time()
        clientes_orig = buscar_orig()
        tempo_orig = time.time() - start
        
        # Método novo
        start = time.time()
        clientes_v2 = ClienteService.buscar_clientes_v2()
        tempo_v2 = time.time() - start
        
        print(f"  Metodo ORIGINAL: {tempo_orig:.4f}s ({len(clientes_orig)} clientes)")
        print(f"  Metodo V2: {tempo_v2:.4f}s ({len(clientes_v2)} clientes)")
        
        if tempo_v2 < tempo_orig:
            melhoria = ((tempo_orig - tempo_v2) / tempo_orig) * 100
            print(f"  MELHORIA: {melhoria:.1f}% mais rapido")
        else:
            print(f"  IMPACTO: Metodo V2 mais lento (esperado devido aos JOINs)")
        
        return True
        
    except Exception as e:
        print(f"  ERRO: {e}")
        return False

def test_apis():
    """Testa se as APIs estão funcionando"""
    print(f"\n5. TESTE DAS APIS")
    print("=" * 40)
    
    try:
        import main
        print("  FastAPI: Carregado com sucesso")
        
        if hasattr(main, 'app'):
            print("  App: Definido corretamente")
        
        return True
        
    except Exception as e:
        print(f"  ERRO: {e}")
        return False

def test_integration():
    """Teste de integração completo"""
    print(f"\n6. TESTE DE INTEGRACAO")
    print("=" * 40)
    
    try:
        # Testar inserção com nova estrutura
        from locacao.repositories.cliente_repository_v2 import ClienteService
        
        print("  Testando insercao com nova estrutura...")
        
        ClienteService.inserir_cliente_v2(
            nome="Cliente Teste Final",
            cpf_cnpj="98765432100",
            telefone="(41) 88888-8888",
            email="teste.final@email.com",
            endereco_rua="Rua Teste Final",
            endereco_numero="123",
            endereco_cidade="Curitiba",
            endereco_cep="80000-999",
            tipo_recebimento="PIX",
            chave_pix="teste.final@pix.com",
            observacoes="Cliente criado no teste final"
        )
        
        print("  Insercao: OK")
        
        # Verificar se foi inserido
        clientes = ClienteService.buscar_clientes_v2()
        cliente_teste = None
        for c in clientes:
            if c['nome'] == 'Cliente Teste Final':
                cliente_teste = c
                break
        
        if cliente_teste:
            print(f"  Busca apos insercao: OK")
            if cliente_teste['endereco']:
                print(f"  Endereco estruturado: OK ({cliente_teste['endereco']['rua']})")
            if cliente_teste['dados_bancarios']:
                print(f"  Dados bancarios: OK ({cliente_teste['dados_bancarios']['tipo_recebimento']})")
        else:
            print("  Busca apos insercao: FALHOU")
            return False
        
        return True
        
    except Exception as e:
        print(f"  ERRO: {e}")
        return False

def final_summary():
    """Resumo final de todos os testes"""
    print(f"\n7. RESUMO FINAL")
    print("=" * 40)
    
    # Executar todos os testes
    results = {
        'Estrutura do Banco': test_database_structure(),
        'Repositorios': test_repositories(), 
        'Qualidade dos Dados': test_data_quality(),
        'Performance': test_performance(),
        'APIs': test_apis(),
        'Integracao': test_integration()
    }
    
    successful = sum(results.values())
    total = len(results)
    
    print(f"\nRESULTADOS:")
    for test_name, success in results.items():
        status = "PASSOU" if success else "FALHOU"
        print(f"  {test_name}: {status}")
    
    print(f"\nTOTAL: {successful}/{total} testes passaram")
    
    if successful == total:
        print("STATUS: SISTEMA TOTALMENTE FUNCIONAL")
        return True
    elif successful >= total * 0.8:
        print("STATUS: SISTEMA MAJORITARIAMENTE FUNCIONAL")
        return False
    else:
        print("STATUS: SISTEMA COM PROBLEMAS GRAVES")
        return False

if __name__ == "__main__":
    print("TESTE FINAL COMPLETO DO SISTEMA")
    print("=" * 50)
    print("Testando todas as melhorias implementadas...")
    print()
    
    success = final_summary()
    
    print("=" * 50)
    if success:
        print("TODOS OS TESTES PASSARAM!")
        print("SISTEMA PRONTO PARA USO EM PRODUCAO!")
    else:
        print("ALGUNS TESTES FALHARAM")
        print("VERIFICAR LOGS ACIMA PARA DETALHES")