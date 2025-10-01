"""
DIAGNÓSTICO COMPLETO DO SISTEMA DE PERMISSÕES
Baseado na estrutura do script.sql - Analisa todos os perfis e suas permissões
"""

import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    """Conecta ao banco de dados remoto"""
    server = os.getenv("DB_SERVER", "192.168.1.45\\SQLTESTES")
    database = os.getenv("DB_DATABASE", "Cobimob")
    username = os.getenv("DB_USER", "srvcondo1")
    password = os.getenv("DB_PASSWORD", "2025@Condo")

    conn_str = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={server};DATABASE={database};UID={username};PWD={password}'
    return pyodbc.connect(conn_str)

def diagnostico_completo():
    """Executa diagnóstico completo do sistema de permissões"""

    print("=" * 80)
    print("DIAGNÓSTICO COMPLETO DO SISTEMA DE PERMISSÕES")
    print("=" * 80)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # 1. ESTRUTURA DAS TABELAS
        print("\n1. ESTRUTURA DAS TABELAS:")
        print("-" * 40)

        tables = ['Usuarios', 'Perfis', 'Permissoes', 'PerfilPermissoes', 'Empresas']
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {table}")
                count = cursor.fetchone()[0]
                print(f"   {table}: {count} registros")
            except Exception as e:
                print(f"   {table}: ERRO - {e}")

        # 2. TODAS AS PERMISSÕES DISPONÍVEIS
        print("\n2. PERMISSÕES DISPONÍVEIS:")
        print("-" * 40)
        cursor.execute("SELECT id, nome, descricao FROM Permissoes ORDER BY id")
        permissoes = cursor.fetchall()

        for perm in permissoes:
            print(f"   ID {perm.id:2d}: {perm.nome:<25} | {perm.descricao or 'Sem descrição'}")

        # 3. ANÁLISE DETALHADA DE CADA PERFIL
        print("\n3. ANÁLISE DETALHADA POR PERFIL:")
        print("-" * 40)

        cursor.execute("""
            SELECT p.id, p.nome, p.empresa_id, e.nome as empresa_nome, p.ativo
            FROM Perfis p
            LEFT JOIN Empresas e ON p.empresa_id = e.id
            ORDER BY p.empresa_id, p.id
        """)
        perfis = cursor.fetchall()

        problemas = []

        for perfil in perfis:
            print(f"\n   PERFIL ID {perfil.id}: {perfil.nome}")
            print(f"   └── Empresa: {perfil.empresa_nome} (ID: {perfil.empresa_id})")
            print(f"   └── Status: {'ATIVO' if perfil.ativo else 'INATIVO'}")

            # Buscar permissões do perfil
            cursor.execute("""
                SELECT perm.id, perm.nome, perm.descricao
                FROM PerfilPermissoes pp
                JOIN Permissoes perm ON pp.permissao_id = perm.id
                WHERE pp.perfil_id = ?
                ORDER BY perm.id
            """, (perfil.id,))

            perm_perfil = cursor.fetchall()

            if not perm_perfil:
                problemas.append(f"PERFIL {perfil.id} ({perfil.nome}) SEM PERMISSÕES")
                print("   └── ❌ SEM PERMISSÕES ASSOCIADAS!")
            else:
                print(f"   └── ✅ {len(perm_perfil)} permissões configuradas:")
                for perm in perm_perfil:
                    print(f"       • {perm.nome}")

        # 4. USUÁRIOS E SEUS PERFIS
        print("\n4. USUÁRIOS E PERFIS:")
        print("-" * 40)

        cursor.execute("""
            SELECT u.id, u.nome, u.email, u.empresa_id, u.perfil_id, u.ativo,
                   e.nome as empresa_nome, p.nome as perfil_nome
            FROM Usuarios u
            LEFT JOIN Empresas e ON u.empresa_id = e.id
            LEFT JOIN Perfis p ON u.perfil_id = p.id
            ORDER BY u.empresa_id, u.perfil_id, u.nome
        """)
        usuarios = cursor.fetchall()

        for user in usuarios:
            status = "ATIVO" if user.ativo else "INATIVO"
            if not user.perfil_nome:
                problemas.append(f"USUÁRIO {user.id} ({user.email}) SEM PERFIL VÁLIDO")
                print(f"   ❌ {user.nome} ({user.email}) | Perfil ID: {user.perfil_id} (INVÁLIDO) | {status}")
            else:
                print(f"   ✅ {user.nome} ({user.email}) | {user.perfil_nome} | {user.empresa_nome} | {status}")

        # 5. VERIFICAÇÃO DE INTEGRIDADE
        print("\n5. VERIFICAÇÃO DE INTEGRIDADE:")
        print("-" * 40)

        # Perfis sem empresa
        cursor.execute("""
            SELECT p.id, p.nome FROM Perfis p
            LEFT JOIN Empresas e ON p.empresa_id = e.id
            WHERE e.id IS NULL
        """)
        perfis_sem_empresa = cursor.fetchall()

        if perfis_sem_empresa:
            for perfil in perfis_sem_empresa:
                problemas.append(f"PERFIL {perfil.id} ({perfil.nome}) COM EMPRESA INEXISTENTE")

        # Usuários sem perfil válido
        cursor.execute("""
            SELECT u.id, u.nome, u.email FROM Usuarios u
            LEFT JOIN Perfis p ON u.perfil_id = p.id
            WHERE u.ativo = 1 AND p.id IS NULL
        """)
        usuarios_sem_perfil = cursor.fetchall()

        if usuarios_sem_perfil:
            for user in usuarios_sem_perfil:
                problemas.append(f"USUÁRIO {user.id} ({user.email}) SEM PERFIL VÁLIDO")

        # 6. ANÁLISE DE PERMISSÕES POR TIPO
        print("\n6. ANÁLISE POR TIPO DE PERFIL:")
        print("-" * 40)

        tipos_perfil = {
            'Admin': ['admin'],
            'Gestor': ['gestor'],
            'Operador': ['operador', 'operacional'],
            'Consulta': ['consulta']
        }

        for tipo, palavras_chave in tipos_perfil.items():
            print(f"\n   {tipo.upper()}:")

            for palavra in palavras_chave:
                cursor.execute("""
                    SELECT p.id, p.nome, COUNT(pp.permissao_id) as total_permissoes
                    FROM Perfis p
                    LEFT JOIN PerfilPermissoes pp ON p.id = pp.perfil_id
                    WHERE LOWER(p.nome) LIKE ?
                    GROUP BY p.id, p.nome
                    ORDER BY p.id
                """, (f'%{palavra}%',))

                perfis_tipo = cursor.fetchall()
                for perfil in perfis_tipo:
                    status = "✅" if perfil.total_permissoes > 0 else "❌"
                    print(f"     {status} ID {perfil.id}: {perfil.nome} ({perfil.total_permissoes} permissões)")

        # 7. RESUMO DE PROBLEMAS
        print("\n7. RESUMO DE PROBLEMAS ENCONTRADOS:")
        print("-" * 40)

        if not problemas:
            print("   ✅ NENHUM PROBLEMA ENCONTRADO!")
        else:
            for i, problema in enumerate(problemas, 1):
                print(f"   {i:2d}. ❌ {problema}")

        # 8. RECOMENDAÇÕES
        print("\n8. RECOMENDAÇÕES PARA CORREÇÃO:")
        print("-" * 40)

        if problemas:
            print("   Execute o script de correção automática:")
            print("   python corrigir_permissoes_automatico.py")
        else:
            print("   ✅ Sistema de permissões está funcionando corretamente!")

        print("\n" + "=" * 80)
        print("DIAGNÓSTICO CONCLUÍDO")
        print("=" * 80)

        return len(problemas) == 0

    except Exception as e:
        print(f"❌ ERRO no diagnóstico: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    sucesso = diagnostico_completo()
    if sucesso:
        print("\n🎉 Sistema de permissões está funcionando corretamente!")
    else:
        print("\n⚠️  Problemas encontrados no sistema de permissões.")
        print("Execute o script de correção automática.")