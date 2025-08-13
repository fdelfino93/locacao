#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar a conectividade com o banco de dados
"""
import pyodbc
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def testar_conexao():
    print("TESTE DE CONECTIVIDADE COM BANCO DE DADOS")
    print("=" * 50)
    
    # Verificar variáveis de ambiente
    print("\nVerificando variaveis de ambiente:")
    db_driver = os.getenv('DB_DRIVER')
    db_server = os.getenv('DB_SERVER') 
    db_database = os.getenv('DB_DATABASE')
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    
    print(f"DB_DRIVER: {db_driver}")
    print(f"DB_SERVER: {db_server}")
    print(f"DB_DATABASE: {db_database}")
    print(f"DB_USER: {db_user}")
    print(f"DB_PASSWORD: {'*' * len(db_password) if db_password else 'Nao definida'}")
    
    # Verificar se todas as variáveis estão definidas
    if not all([db_driver, db_server, db_database, db_user, db_password]):
        print("\nERRO: Algumas variaveis de ambiente nao estao definidas!")
        return False
    
    # Tentar conexão
    print("\nTentando conectar ao banco de dados...")
    try:
        connection_string = (
            f"DRIVER={{{db_driver}}};"
            f"SERVER={db_server};"
            f"DATABASE={db_database};"
            f"UID={db_user};"
            f"PWD={db_password}"
        )
        
        print(f"String de conexao: {connection_string.replace(db_password, '*' * len(db_password))}")
        
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        
        # Teste básico
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()[0]
        print(f"\nCONEXAO ESTABELECIDA COM SUCESSO!")
        print(f"Versao do SQL Server: {version}")
        
        # Testar tabelas principais
        print("\nVerificando tabelas principais:")
        tabelas = ['Clientes', 'Inquilinos', 'Imoveis', 'Contratos']
        
        for tabela in tabelas:
            try:
                cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
                count = cursor.fetchone()[0]
                print(f"  OK {tabela}: {count} registros")
            except Exception as e:
                print(f"  ERRO {tabela}: {str(e)}")
        
        conn.close()
        return True
        
    except pyodbc.Error as e:
        print(f"\nERRO DE CONEXAO:")
        print(f"Codigo do erro: {e.args[0] if e.args else 'N/A'}")
        print(f"Mensagem: {e.args[1] if len(e.args) > 1 else str(e)}")
        return False
    except Exception as e:
        print(f"\nERRO INESPERADO: {str(e)}")
        return False

def verificar_drivers():
    print("\nVerificando drivers ODBC disponiveis:")
    try:
        drivers = pyodbc.drivers()
        for driver in drivers:
            if "SQL Server" in driver:
                print(f"  OK {driver}")
        return drivers
    except Exception as e:
        print(f"  ERRO ao listar drivers: {str(e)}")
        return []

if __name__ == "__main__":
    # Verificar drivers disponíveis
    drivers = verificar_drivers()
    
    # Testar conexão
    sucesso = testar_conexao()
    
    print("\n" + "=" * 50)
    if sucesso:
        print("DIAGNOSTICO: Banco de dados conectado com sucesso!")
    else:
        print("DIAGNOSTICO: Problemas de conectividade detectados!")
        print("\nPOSSIVEIS SOLUCOES:")
        print("1. Verificar se o SQL Server esta rodando")
        print("2. Verificar credenciais no arquivo .env")
        print("3. Verificar conectividade de rede")
        print("4. Verificar se o driver ODBC esta instalado")