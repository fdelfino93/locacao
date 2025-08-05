"""
Diagnóstico completo do sistema após implementação das melhorias
"""
import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_conexao():
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    return pyodbc.connect(connection_string)

def verificar_tabelas_base():
    """Verifica se as tabelas originais estão funcionando"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    print("1. VERIFICANDO TABELAS ORIGINAIS")
    print("=" * 40)
    
    tabelas_originais = ['Clientes', 'Inquilinos', 'Imoveis', 'Contratos']
    
    for tabela in tabelas_originais:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
            count = cursor.fetchone()[0]
            print(f"  {tabela}: {count} registros - OK")
        except Exception as e:
            print(f"  {tabela}: ERRO - {e}")
    
    conn.close()

def verificar_novas_tabelas():
    """Verifica se as novas tabelas foram criadas"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    print(f"\n2. VERIFICANDO NOVAS TABELAS")
    print("=" * 40)
    
    novas_tabelas = ['Enderecos', 'DadosBancarios']
    
    for tabela in novas_tabelas:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
            count = cursor.fetchone()[0]
            print(f"  {tabela}: {count} registros - OK")
            
            # Mostrar estrutura
            cursor.execute(f"""
                SELECT TOP 1 * FROM {tabela}
            """)
            sample = cursor.fetchone()
            if sample:
                print(f"    Exemplo: {dict(zip([col[0] for col in cursor.description], sample))}")
            
        except Exception as e:
            print(f"  {tabela}: ERRO - {e}")
    
    conn.close()

def verificar_relacionamentos():
    """Verifica se os relacionamentos estão funcionando"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    print(f"\n3. VERIFICANDO RELACIONAMENTOS")
    print("=" * 40)
    
    try:
        # Testar JOIN entre Clientes e Enderecos
        cursor.execute("""
            SELECT c.nome, e.rua, e.numero, e.cidade
            FROM Clientes c
            INNER JOIN Enderecos e ON c.endereco_id = e.id
        """)
        
        resultados = cursor.fetchall()
        print(f"  Clientes com enderecos estruturados: {len(resultados)}")
        for resultado in resultados:
            print(f"    {resultado[0]} - {resultado[1]}, {resultado[2]} - {resultado[3]}")
        
    except Exception as e:
        print(f"  ERRO nos relacionamentos: {e}")
    
    try:
        # Testar JOIN entre Clientes e DadosBancarios
        cursor.execute("""
            SELECT c.nome, db.tipo_recebimento, db.chave_pix
            FROM Clientes c
            INNER JOIN DadosBancarios db ON c.dados_bancarios_id = db.id
        """)
        
        resultados = cursor.fetchall()
        print(f"  Clientes com dados bancarios: {len(resultados)}")
        for resultado in resultados:
            print(f"    {resultado[0]} - {resultado[1]} - {resultado[2]}")
        
    except Exception as e:
        print(f"  ERRO nos dados bancarios: {e}")
    
    conn.close()

def verificar_repositorios():
    """Verifica se os repositórios estão funcionando"""
    print(f"\n4. VERIFICANDO REPOSITORIOS")
    print("=" * 40)
    
    try:
        # Repositório original
        from locacao.repositories.cliente_repository import buscar_clientes
        clientes_original = buscar_clientes()
        print(f"  Repositorio ORIGINAL: {len(clientes_original)} clientes - OK")
        
    except Exception as e:
        print(f"  Repositorio ORIGINAL: ERRO - {e}")
    
    try:
        # Repositório v2
        from locacao.repositories.cliente_repository_v2 import ClienteService
        clientes_v2 = ClienteService.buscar_clientes_v2()
        print(f"  Repositorio V2: {len(clientes_v2)} clientes - OK")
        
    except Exception as e:
        print(f"  Repositorio V2: ERRO - {e}")

def verificar_apis():
    """Verifica se as APIs estão carregando"""
    print(f"\n5. VERIFICANDO APIS")
    print("=" * 40)
    
    try:
        import main
        print("  main.py: Carregado com sucesso - OK")
        
        # Verificar se as rotas estão definidas
        from main import app
        routes = []
        for rule in app.routes if hasattr(app, 'routes') else []:
            routes.append(str(rule))
        
        if routes:
            print(f"  Rotas encontradas: {len(routes)}")
        else:
            print("  Usando FastAPI - estrutura diferente")
        
    except Exception as e:
        print(f"  main.py: ERRO - {e}")

def diagnostico_final():
    """Diagnóstico final resumido"""
    print(f"\n6. DIAGNOSTICO FINAL")
    print("=" * 40)
    
    problemas = []
    sucessos = []
    
    # Teste rápido de cada componente
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Clientes")
        conn.close()
        sucessos.append("Conexao com banco")
    except:
        problemas.append("Conexao com banco")
    
    try:
        from locacao.repositories.cliente_repository import buscar_clientes
        buscar_clientes()
        sucessos.append("Repositorio original")
    except:
        problemas.append("Repositorio original")
    
    try:
        import main
        sucessos.append("API FastAPI")
    except:
        problemas.append("API FastAPI")
    
    print(f"  SUCESSOS ({len(sucessos)}):")
    for sucesso in sucessos:
        print(f"    ✓ {sucesso}")
    
    if problemas:
        print(f"  PROBLEMAS ({len(problemas)}):")
        for problema in problemas:
            print(f"    ✗ {problema}")
    else:
        print(f"  ✓ NENHUM PROBLEMA ENCONTRADO!")
    
    return len(problemas) == 0

if __name__ == "__main__":
    print("DIAGNOSTICO COMPLETO DO SISTEMA")
    print("=" * 50)
    
    verificar_tabelas_base()
    verificar_novas_tabelas()
    verificar_relacionamentos()
    verificar_repositorios()
    verificar_apis()
    
    sucesso = diagnostico_final()
    
    print(f"\n" + "=" * 50)
    if sucesso:
        print("SISTEMA FUNCIONANDO CORRETAMENTE!")
    else:
        print("PROBLEMAS ENCONTRADOS - VERIFICAR LOGS ACIMA")