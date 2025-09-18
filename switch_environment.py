#!/usr/bin/env python3
"""
Script para alternar entre ambiente local e VM de produção
"""

import os
import sys

def switch_to_local():
    """Configura arquivos .env para desenvolvimento local"""
    print("Configurando ambiente LOCAL...")

    # Backend .env
    backend_env = """# Configuração para DESENVOLVIMENTO LOCAL
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_SERVER=localhost,1433
DB_DATABASE=LocacaoLocal
DB_USER=sa
DB_PASSWORD=MinhaSehaLocal123
DB_ENCRYPT=no
DB_TRUST_CERT=yes

# Para usar a VM de produção, descomente as linhas abaixo:
# DB_SERVER=192.168.1.45\\SQLTESTES
# DB_DATABASE=Cobimob
# DB_USER=srvcondo1
# DB_PASSWORD=2025@Condo"""

    # Frontend .env
    frontend_env = """# Configuração para DESENVOLVIMENTO LOCAL
VITE_API_BASE_URL=http://localhost:8080

# Para usar a VM de produção, descomente a linha abaixo:
# VITE_API_BASE_URL=http://192.168.1.159:8080"""

    with open('.env', 'w') as f:
        f.write(backend_env)

    with open('frontend/.env', 'w') as f:
        f.write(frontend_env)

    print("✓ Configurado para DESENVOLVIMENTO LOCAL")
    print("  - Backend: localhost:8080")
    print("  - Database: localhost,1433")

def switch_to_vm():
    """Configura arquivos .env para VM de produção"""
    print("Configurando ambiente VM...")

    # Backend .env
    backend_env = """# Configuração para VM/PRODUÇÃO
DB_DRIVER=ODBC Driver 17 for SQL Server
DB_SERVER=192.168.1.45\\SQLTESTES
DB_DATABASE=Cobimob
DB_USER=srvcondo1
DB_PASSWORD=2025@Condo
DB_ENCRYPT=no
DB_TRUST_CERT=yes

# Para usar desenvolvimento local, descomente as linhas abaixo:
# DB_SERVER=localhost,1433
# DB_DATABASE=LocacaoLocal
# DB_USER=sa
# DB_PASSWORD=MinhaSehaLocal123"""

    # Frontend .env
    frontend_env = """# Configuração para VM/PRODUÇÃO
VITE_API_BASE_URL=http://192.168.1.159:8080

# Para usar desenvolvimento local, descomente a linha abaixo:
# VITE_API_BASE_URL=http://localhost:8080"""

    with open('.env', 'w') as f:
        f.write(backend_env)

    with open('frontend/.env', 'w') as f:
        f.write(frontend_env)

    print("✓ Configurado para VM/PRODUÇÃO")
    print("  - Backend: 192.168.1.159:8080")
    print("  - Database: 192.168.1.45\\SQLTESTES")

def show_current():
    """Mostra configuração atual"""
    print("CONFIGURAÇÃO ATUAL:")
    print("=" * 40)

    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            content = f.read()
            if 'localhost' in content:
                print("Backend: DESENVOLVIMENTO LOCAL")
            elif '192.168.1.45' in content:
                print("Backend: VM/PRODUÇÃO")
            else:
                print("Backend: CONFIGURAÇÃO PERSONALIZADA")

    if os.path.exists('frontend/.env'):
        with open('frontend/.env', 'r') as f:
            content = f.read()
            if 'localhost:8080' in content:
                print("Frontend: DESENVOLVIMENTO LOCAL")
            elif '192.168.1.159:8080' in content:
                print("Frontend: VM/PRODUÇÃO")
            else:
                print("Frontend: CONFIGURAÇÃO PERSONALIZADA")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("USO: python switch_environment.py [local|vm|status]")
        print()
        print("Comandos:")
        print("  local  - Configura para desenvolvimento local")
        print("  vm     - Configura para VM de produção")
        print("  status - Mostra configuração atual")
        sys.exit(1)

    command = sys.argv[1].lower()

    if command == "local":
        switch_to_local()
    elif command == "vm":
        switch_to_vm()
    elif command == "status":
        show_current()
    else:
        print(f"Comando inválido: {command}")
        print("Use: local, vm ou status")
        sys.exit(1)