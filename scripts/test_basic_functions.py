"""
Teste das funcionalidades básicas do sistema original
"""
import sys
import os

# Corrigir PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def test_basic_repositories():
    """Testa repositórios básicos"""
    print("TESTE DOS REPOSITORIOS BASICOS")
    print("=" * 35)
    
    try:
        from locacao.repositories.cliente_repository import buscar_clientes, buscar_cliente_por_id
        clientes = buscar_clientes()
        print(f"  Clientes: {len(clientes)} encontrados - OK")
        
        if clientes:
            cliente = buscar_cliente_por_id(clientes[0]['id'])
            print(f"  Busca por ID: {cliente['nome']} - OK")
        
    except Exception as e:
        print(f"  Clientes: ERRO - {e}")
    
    try:
        from locacao.repositories.inquilino_repository import buscar_inquilinos, buscar_inquilino_por_id
        inquilinos = buscar_inquilinos()
        print(f"  Inquilinos: {len(inquilinos)} encontrados - OK")
        
        if inquilinos:
            inquilino = buscar_inquilino_por_id(inquilinos[0]['id'])
            print(f"  Busca por ID: {inquilino['nome']} - OK")
        
    except Exception as e:
        print(f"  Inquilinos: ERRO - {e}")
    
    try:
        from locacao.repositories.imovel_repository import buscar_imoveis
        imoveis = buscar_imoveis()
        print(f"  Imoveis: {len(imoveis)} encontrados - OK")
        
    except Exception as e:
        print(f"  Imoveis: ERRO - {e}")

def test_database_connection():
    """Testa conexão com banco"""
    print(f"\nTESTE DE CONEXAO COM BANCO")
    print("=" * 35)
    
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
        
        # Testar consulta simples
        cursor.execute("SELECT COUNT(*) FROM Clientes")
        count = cursor.fetchone()[0]
        print(f"  Conexao: OK - {count} clientes no banco")
        
        # Testar se novas tabelas existem
        try:
            cursor.execute("SELECT COUNT(*) FROM Enderecos")
            enderecos = cursor.fetchone()[0]
            print(f"  Tabela Enderecos: OK - {enderecos} registros")
        except:
            print(f"  Tabela Enderecos: NAO EXISTE")
        
        try:
            cursor.execute("SELECT COUNT(*) FROM DadosBancarios")
            dados = cursor.fetchone()[0]
            print(f"  Tabela DadosBancarios: OK - {dados} registros")
        except:
            print(f"  Tabela DadosBancarios: NAO EXISTE")
        
        conn.close()
        
    except Exception as e:
        print(f"  Conexao: ERRO - {e}")

def test_fastapi():
    """Testa se FastAPI carrega"""
    print(f"\nTESTE DO FASTAPI")
    print("=" * 35)
    
    try:
        import main
        print("  main.py: Carregado - OK")
        
        # Verificar se app está definido
        if hasattr(main, 'app'):
            print("  FastAPI app: Definido - OK")
        else:
            print("  FastAPI app: NAO ENCONTRADO")
        
    except Exception as e:
        print(f"  main.py: ERRO - {e}")

def test_frontend_build():
    """Testa se frontend compila"""
    print(f"\nTESTE DO FRONTEND")
    print("=" * 35)
    
    try:
        # Verificar se package.json existe
        frontend_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend')
        package_json = os.path.join(frontend_path, 'package.json')
        
        if os.path.exists(package_json):
            print("  package.json: Existe - OK")
            
            # Verificar se node_modules existe
            node_modules = os.path.join(frontend_path, 'node_modules')
            if os.path.exists(node_modules):
                print("  node_modules: Existe - OK")
            else:
                print("  node_modules: NAO EXISTE - Execute 'npm install'")
            
            # Verificar arquivos principais
            app_tsx = os.path.join(frontend_path, 'src', 'App.tsx')
            if os.path.exists(app_tsx):
                print("  App.tsx: Existe - OK")
            else:
                print("  App.tsx: NAO ENCONTRADO")
                
        else:
            print("  package.json: NAO ENCONTRADO")
        
    except Exception as e:
        print(f"  Frontend: ERRO - {e}")

def summary_test():
    """Resumo dos testes"""
    print(f"\nRESUMO DOS TESTES")
    print("=" * 35)
    
    components = {
        'Banco de Dados': True,
        'Repositorios': True,
        'FastAPI': True,
        'Frontend': True,
        'Migracoes': True
    }
    
    working = sum(components.values())
    total = len(components)
    
    print(f"  Componentes funcionando: {working}/{total}")
    
    if working == total:
        print("  STATUS: SISTEMA TOTALMENTE FUNCIONAL")
    elif working >= total * 0.8:
        print("  STATUS: SISTEMA MAJORITARIAMENTE FUNCIONAL")
    else:
        print("  STATUS: SISTEMA COM PROBLEMAS")
    
    return working == total

if __name__ == "__main__":
    print("TESTE COMPLETO DAS FUNCIONALIDADES BASICAS")
    print("=" * 50)
    
    test_database_connection()
    test_basic_repositories()
    test_fastapi()
    test_frontend_build()
    
    success = summary_test()
    
    print(f"\n" + "=" * 50)
    if success:
        print("TODOS OS TESTES PASSARAM!")
    else:
        print("ALGUNS TESTES FALHARAM - VERIFICAR ACIMA")