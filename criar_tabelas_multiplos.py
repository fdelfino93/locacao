#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pyodbc
import sys
import os

def get_connection():
    """Estabelece conexão com SQL Server usando configurações similares ao sistema"""
    try:
        connection_string = (
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=.;"
            "DATABASE=locacao;"
            "Trusted_Connection=yes;"
        )
        conn = pyodbc.connect(connection_string)
        return conn
    except Exception as e:
        print(f"❌ Erro ao conectar: {e}")
        return None

def executar_script_sql():
    """Lê e executa o script de estruturas complexas"""
    try:
        # Ler o arquivo SQL
        script_path = "script_estruturas_complexas_contratos.sql"
        
        if not os.path.exists(script_path):
            print(f"❌ Arquivo {script_path} não encontrado!")
            return False
            
        with open(script_path, 'r', encoding='utf-8') as file:
            sql_script = file.read()
        
        # Conectar ao banco
        conn = get_connection()
        if not conn:
            return False
            
        cursor = conn.cursor()
        
        # Dividir o script em comandos individuais
        # Remover comentários e linhas vazias
        commands = []
        current_command = ""
        
        for line in sql_script.split('\n'):
            line = line.strip()
            
            # Pular comentários e linhas vazias
            if not line or line.startswith('--') or line.startswith('/*'):
                continue
                
            # Se encontrar GO, executar comando acumulado
            if line.upper() == 'GO':
                if current_command.strip():
                    commands.append(current_command.strip())
                    current_command = ""
                continue
            
            current_command += line + " "
        
        # Adicionar último comando se existir
        if current_command.strip():
            commands.append(current_command.strip())
        
        # Executar comandos
        print("Executando comandos SQL...")
        
        for i, command in enumerate(commands):
            if not command.strip():
                continue
                
            try:
                print(f"Executando comando {i+1}/{len(commands)}...")
                cursor.execute(command)
                conn.commit()
                print(f"Comando {i+1} executado com sucesso")
                
            except Exception as e:
                print(f"Erro no comando {i+1}: {e}")
                # Continuar com próximo comando
                continue
        
        cursor.close()
        conn.close()
        
        print("\nScript executado com sucesso!")
        return True
        
    except Exception as e:
        print(f"Erro geral: {e}")
        return False

def verificar_tabelas_criadas():
    """Verifica se as tabelas foram criadas corretamente"""
    try:
        conn = get_connection()
        if not conn:
            return False
            
        cursor = conn.cursor()
        
        # Verificar tabelas criadas
        tabelas_esperadas = ['ContratoLocadores', 'ContratoLocatarios', 'ContratoPets']
        
        print("\n🔍 Verificando tabelas criadas...")
        
        for tabela in tabelas_esperadas:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = ?
            """, (tabela,))
            
            result = cursor.fetchone()
            if result and result[0] > 0:
                print(f"✅ Tabela {tabela} existe")
                
                # Contar registros
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
                    count = cursor.fetchone()[0]
                    print(f"   📊 {count} registros")
                except:
                    print(f"   📊 Tabela vazia ou sem acesso")
            else:
                print(f"❌ Tabela {tabela} NÃO existe")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Erro ao verificar tabelas: {e}")
        return False

if __name__ == "__main__":
    print("Iniciando criacao de tabelas para multiplos locadores/locatarios...")
    
    if executar_script_sql():
        print("\n" + "="*50)
        verificar_tabelas_criadas()
        print("="*50)
        print("Processo concluido!")
    else:
        print("Falha na execucao!")
        sys.exit(1)