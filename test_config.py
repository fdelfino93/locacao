#!/usr/bin/env python3
"""
Script de teste para verificar se as configurações de ambiente estão funcionando corretamente
"""

import os
import sys
from dotenv import load_dotenv

def test_environment_config():
    """Testa se as variáveis de ambiente estão configuradas corretamente"""

    print("TESTE DE CONFIGURACAO DE AMBIENTE")
    print("=" * 50)

    # Carregar arquivo .env
    load_dotenv()

    # Verificar se o arquivo .env existe
    env_file = ".env"
    env_example = ".env.example"

    if os.path.exists(env_file):
        print(f"OK - Arquivo {env_file} encontrado")
    else:
        print(f"❌ Arquivo {env_file} NÃO encontrado")
        print(f"📝 Execute: cp {env_example} {env_file}")
        return False

    if os.path.exists(env_example):
        print(f"✅ Arquivo {env_example} encontrado")
    else:
        print(f"❌ Arquivo {env_example} NÃO encontrado")

    print("\n🔍 VERIFICANDO VARIÁVEIS DE AMBIENTE:")
    print("-" * 40)

    # Variáveis obrigatórias
    required_vars = [
        "DB_DRIVER",
        "DB_SERVER",
        "DB_DATABASE",
        "DB_USER",
        "DB_PASSWORD",
        "DB_ENCRYPT",
        "DB_TRUST_CERT"
    ]

    all_ok = True

    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mascarar senha
            if "PASSWORD" in var:
                masked_value = "*" * len(value)
                print(f"✅ {var}={masked_value}")
            else:
                print(f"✅ {var}={value}")
        else:
            print(f"❌ {var}=NÃO DEFINIDA")
            all_ok = False

    print("\n🔗 TESTANDO CONEXÃO COM BANCO:")
    print("-" * 40)

    if all_ok:
        try:
            # Tentar importar e testar conexão
            from repositories_adapter import get_conexao

            with get_conexao() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1 as teste")
                result = cursor.fetchone()

                if result and result[0] == 1:
                    print("✅ Conexão com banco de dados FUNCIONANDO")
                    print(f"🏢 Servidor: {os.getenv('DB_SERVER')}")
                    print(f"🗃️ Banco: {os.getenv('DB_DATABASE')}")
                    return True
                else:
                    print("❌ Erro na consulta de teste")
                    return False

        except Exception as e:
            print(f"❌ Erro na conexão: {str(e)}")
            print("\n💡 POSSÍVEIS SOLUÇÕES:")
            print("   1. Verificar se o SQL Server está rodando")
            print("   2. Verificar credenciais no arquivo .env")
            print("   3. Verificar se o banco de dados existe")
            print("   4. Verificar permissões do usuário")
            return False
    else:
        print("❌ Configure todas as variáveis no arquivo .env primeiro")
        return False

def test_frontend_config():
    """Testa se a configuração do frontend está correta"""

    print("\n🌐 TESTE DE CONFIGURAÇÃO DO FRONTEND")
    print("=" * 50)

    frontend_env = "frontend/.env"
    frontend_example = "frontend/.env.example"

    if os.path.exists(frontend_example):
        print(f"✅ Arquivo {frontend_example} encontrado")
    else:
        print(f"❌ Arquivo {frontend_example} NÃO encontrado")

    if os.path.exists(frontend_env):
        print(f"✅ Arquivo {frontend_env} encontrado")

        # Ler configuração do frontend
        with open(frontend_env, 'r') as f:
            content = f.read()
            print(f"📄 Conteúdo:\n{content}")
    else:
        print(f"⚠️  Arquivo {frontend_env} não encontrado (configuração automática será usada)")

if __name__ == "__main__":
    print("🚀 INICIANDO TESTE DE CONFIGURAÇÃO\n")

    backend_ok = test_environment_config()
    test_frontend_config()

    print("\n" + "=" * 50)
    if backend_ok:
        print("🎉 CONFIGURAÇÃO BACKEND: OK")
        print("✅ Sistema pronto para uso!")
        print("\n💻 Para iniciar o sistema:")
        print("   1. Backend: python main.py")
        print("   2. Frontend: cd frontend && npm run dev")
    else:
        print("❌ CONFIGURAÇÃO BACKEND: ERRO")
        print("🔧 Configure o arquivo .env antes de continuar")

    sys.exit(0 if backend_ok else 1)