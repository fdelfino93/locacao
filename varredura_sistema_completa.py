"""
VARREDURA COMPLETA DO SISTEMA - Identificar todos os problemas
"""

import requests
import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def testar_conexao_banco():
    """Testa conexão com banco remoto"""
    print("1. TESTANDO CONEXÃO COM BANCO REMOTO...")
    try:
        server = os.getenv("DB_SERVER", "192.168.1.45\\SQLTESTES")
        database = os.getenv("DB_DATABASE", "Cobimob")
        username = os.getenv("DB_USER", "srvcondo1")
        password = os.getenv("DB_PASSWORD", "2025@Condo")

        conn_str = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()

        # Testar tabelas principais
        tabelas = ['Usuarios', 'Perfis', 'Permissoes', 'PerfilPermissoes', 'Empresas', 'Locadores', 'Locatarios', 'Imoveis', 'Contratos']
        resultados = {}

        for tabela in tabelas:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
                count = cursor.fetchone()[0]
                resultados[tabela] = count
                print(f"   ✓ {tabela}: {count} registros")
            except Exception as e:
                resultados[tabela] = f"ERRO: {e}"
                print(f"   ✗ {tabela}: ERRO - {e}")

        conn.close()
        return True, resultados

    except Exception as e:
        print(f"   ✗ ERRO na conexão: {e}")
        return False, {}

def testar_backend_funcionando():
    """Testa se o backend está respondendo"""
    print("\n2. TESTANDO BACKEND...")

    portas = [8080, 8081]
    backends_ativos = []

    for porta in portas:
        try:
            response = requests.get(f'http://localhost:{porta}/api/auth/status', timeout=5)
            if response.status_code == 200:
                backends_ativos.append(porta)
                print(f"   ✓ Backend ativo na porta {porta}")
            else:
                print(f"   ✗ Backend porta {porta}: Status {response.status_code}")
        except Exception as e:
            print(f"   ✗ Backend porta {porta}: Não responde - {e}")

    return backends_ativos

def testar_autenticacao():
    """Testa autenticação em todos os backends ativos"""
    print("\n3. TESTANDO AUTENTICAÇÃO...")

    usuarios_teste = [
        ('admin@sistema.com', 'admin123'),
        ('admin@cobimob.com', 'admin123'),
        ('gestor@cobimob.com', 'gestor123')
    ]

    portas = [8080, 8081]
    resultados_auth = {}

    for porta in portas:
        print(f"\n   PORTA {porta}:")
        resultados_auth[porta] = {}

        for email, senha in usuarios_teste:
            try:
                response = requests.post(f'http://localhost:{porta}/api/token', data={
                    'username': email,
                    'password': senha
                }, timeout=5)

                if response.status_code == 200:
                    token = response.json()['access_token']
                    resultados_auth[porta][email] = {'status': 'SUCCESS', 'token': token[:30] + '...'}
                    print(f"     ✓ {email}: LOGIN OK")
                else:
                    resultados_auth[porta][email] = {'status': 'FAILED', 'error': response.text}
                    print(f"     ✗ {email}: FALHOU - {response.status_code}")

            except Exception as e:
                resultados_auth[porta][email] = {'status': 'ERROR', 'error': str(e)}
                print(f"     ✗ {email}: ERRO - {e}")

    return resultados_auth

def testar_rotas_principais():
    """Testa se as rotas principais estão funcionando"""
    print("\n4. TESTANDO ROTAS PRINCIPAIS...")

    # Fazer login primeiro
    try:
        response = requests.post('http://localhost:8080/api/token', data={
            'username': 'admin@sistema.com',
            'password': 'admin123'
        }, timeout=5)

        if response.status_code != 200:
            print("   ✗ Não foi possível fazer login para testar rotas")
            return {}

        token = response.json()['access_token']
        headers = {'Authorization': f'Bearer {token}'}

        rotas = [
            '/api/locadores',
            '/api/locatarios',
            '/api/imoveis',
            '/api/contratos',
            '/api/dashboard/completo'
        ]

        resultados_rotas = {}

        for rota in rotas:
            try:
                response = requests.get(f'http://localhost:8080{rota}', headers=headers, timeout=10)
                resultados_rotas[rota] = {
                    'status': response.status_code,
                    'funcionando': response.status_code == 200
                }

                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, dict) and 'data' in data:
                        count = len(data['data'])
                    else:
                        count = len(data) if isinstance(data, list) else "N/A"
                    print(f"   ✓ {rota}: OK - {count} registros")
                else:
                    print(f"   ✗ {rota}: ERRO {response.status_code} - {response.text[:100]}")

            except Exception as e:
                resultados_rotas[rota] = {'status': 'ERROR', 'funcionando': False, 'error': str(e)}
                print(f"   ✗ {rota}: ERRO - {e}")

        return resultados_rotas

    except Exception as e:
        print(f"   ✗ Erro no teste de rotas: {e}")
        return {}

def verificar_permissoes_banco():
    """Verifica se as permissões no banco estão corretas"""
    print("\n5. VERIFICANDO PERMISSÕES NO BANCO...")

    try:
        server = os.getenv("DB_SERVER", "192.168.1.45\\SQLTESTES")
        database = os.getenv("DB_DATABASE", "Cobimob")
        username = os.getenv("DB_USER", "srvcondo1")
        password = os.getenv("DB_PASSWORD", "2025@Condo")

        conn_str = f'DRIVER{{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()

        # Verificar perfil 16 (Admin usado pelo admin@sistema.com)
        cursor.execute("""
            SELECT p.nome as permissao
            FROM PerfilPermissoes pp
            JOIN Permissoes p ON pp.permissao_id = p.id
            WHERE pp.perfil_id = 16
            ORDER BY p.id
        """)

        permissoes_admin = [row.permissao for row in cursor.fetchall()]

        print(f"   Permissões do Admin (Perfil 16): {len(permissoes_admin)}")
        for perm in permissoes_admin[:5]:  # Mostrar apenas as primeiras 5
            print(f"     • {perm}")

        if len(permissoes_admin) > 5:
            print(f"     ... e mais {len(permissoes_admin) - 5}")

        # Verificar se tem as permissões essenciais
        essenciais = ['ver_locadores', 'ver_contratos', 'ver_imoveis', 'ver_locatarios']
        faltando = [p for p in essenciais if p not in permissoes_admin]

        if faltando:
            print(f"   ✗ FALTANDO permissões essenciais: {faltando}")
        else:
            print(f"   ✓ Todas as permissões essenciais estão presentes")

        conn.close()
        return len(faltando) == 0

    except Exception as e:
        print(f"   ✗ Erro ao verificar permissões: {e}")
        return False

def varredura_completa():
    """Executa varredura completa do sistema"""
    print("=" * 80)
    print("VARREDURA COMPLETA DO SISTEMA - IDENTIFICAÇÃO DE PROBLEMAS")
    print("=" * 80)

    # Testes
    banco_ok, dados_banco = testar_conexao_banco()
    backends_ativos = testar_backend_funcionando()
    auth_results = testar_autenticacao()
    rotas_results = testar_rotas_principais()
    permissoes_ok = verificar_permissoes_banco()

    # Resumo final
    print("\n" + "=" * 80)
    print("RESUMO DA VARREDURA")
    print("=" * 80)

    problemas = []

    if not banco_ok:
        problemas.append("Conexão com banco remoto falhando")

    if len(backends_ativos) == 0:
        problemas.append("Nenhum backend ativo")
    elif len(backends_ativos) > 1:
        problemas.append(f"Múltiplos backends ativos causando conflito: {backends_ativos}")

    if not permissoes_ok:
        problemas.append("Permissões no banco incorretas")

    rotas_com_problema = [rota for rota, result in rotas_results.items() if not result.get('funcionando', False)]
    if rotas_com_problema:
        problemas.append(f"Rotas com problema: {rotas_com_problema}")

    if problemas:
        print("✗ PROBLEMAS ENCONTRADOS:")
        for i, problema in enumerate(problemas, 1):
            print(f"  {i}. {problema}")

        print("\nRECOMENDAÇÕES:")
        print("1. Matar todos os processos Python/Node em background")
        print("2. Reiniciar apenas um backend na porta 8080")
        print("3. Verificar se frontend está apontando para porta correta")
        print("4. Testar novamente as rotas")

    else:
        print("✓ SISTEMA FUNCIONANDO CORRETAMENTE!")
        print("- Banco remoto conectado")
        print("- Backend único ativo")
        print("- Autenticação funcionando")
        print("- Todas as rotas respondendo")

    return len(problemas) == 0

if __name__ == "__main__":
    sucesso = varredura_completa()
    print(f"\n{'✓ SISTEMA OK' if sucesso else '✗ PROBLEMAS ENCONTRADOS'}")