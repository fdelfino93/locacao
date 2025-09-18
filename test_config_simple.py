#!/usr/bin/env python3
"""
Script simples de teste para verificar configuracoes de ambiente
"""

import os
import sys
from dotenv import load_dotenv

def test_environment_config():
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
        print(f"ERRO - Arquivo {env_file} NAO encontrado")
        print(f"Execute: copy {env_example} {env_file}")
        return False

    if os.path.exists(env_example):
        print(f"OK - Arquivo {env_example} encontrado")
    else:
        print(f"ERRO - Arquivo {env_example} NAO encontrado")

    print("\nVERIFICANDO VARIAVEIS DE AMBIENTE:")
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
                print(f"OK - {var}={masked_value}")
            else:
                print(f"OK - {var}={value}")
        else:
            print(f"ERRO - {var}=NAO DEFINIDA")
            all_ok = False

    print("\nTESTANDO CONEXAO COM BANCO:")
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
                    print("OK - Conexao com banco de dados FUNCIONANDO")
                    print(f"Servidor: {os.getenv('DB_SERVER')}")
                    print(f"Banco: {os.getenv('DB_DATABASE')}")
                    return True
                else:
                    print("ERRO - Falha na consulta de teste")
                    return False

        except Exception as e:
            print(f"ERRO - Falha na conexao: {str(e)}")
            print("\nPOSSIVEIS SOLUCOES:")
            print("   1. Verificar se o SQL Server esta rodando")
            print("   2. Verificar credenciais no arquivo .env")
            print("   3. Verificar se o banco de dados existe")
            print("   4. Verificar permissoes do usuario")
            return False
    else:
        print("ERRO - Configure todas as variaveis no arquivo .env primeiro")
        return False

def test_frontend_config():
    print("\nTESTE DE CONFIGURACAO DO FRONTEND")
    print("=" * 50)

    frontend_env = "frontend/.env"
    frontend_example = "frontend/.env.example"

    if os.path.exists(frontend_example):
        print(f"OK - Arquivo {frontend_example} encontrado")
    else:
        print(f"ERRO - Arquivo {frontend_example} NAO encontrado")

    if os.path.exists(frontend_env):
        print(f"OK - Arquivo {frontend_env} encontrado")

        # Ler configuração do frontend
        with open(frontend_env, 'r') as f:
            content = f.read()
            print(f"Conteudo:\n{content}")
    else:
        print(f"AVISO - Arquivo {frontend_env} nao encontrado (configuracao automatica sera usada)")

if __name__ == "__main__":
    print("INICIANDO TESTE DE CONFIGURACAO\n")

    backend_ok = test_environment_config()
    test_frontend_config()

    print("\n" + "=" * 50)
    if backend_ok:
        print("CONFIGURACAO BACKEND: OK")
        print("Sistema pronto para uso!")
        print("\nPara iniciar o sistema:")
        print("   1. Backend: python main.py")
        print("   2. Frontend: cd frontend && npm run dev")
    else:
        print("CONFIGURACAO BACKEND: ERRO")
        print("Configure o arquivo .env antes de continuar")

    sys.exit(0 if backend_ok else 1)