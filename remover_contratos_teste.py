#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para Remover Contratos de Teste
=====================================

Remove todos os contratos existentes e suas dependências para
permitir uma nova população com dados reais.

ATENÇÃO: Este script remove TODOS os contratos do banco!

Autor: Claude Code Assistant  
Data: 2025-09-11
"""

import pyodbc
import os
from datetime import datetime
from dotenv import load_dotenv
import json

# Carregar variáveis de ambiente
load_dotenv()

def log(message):
    """Log com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def conectar_banco():
    """Conecta ao banco de dados"""
    try:
        connection_string = (
            f"DRIVER={{{os.getenv('DB_DRIVER')}}};SERVER={os.getenv('DB_SERVER')};DATABASE={os.getenv('DB_DATABASE')};UID={os.getenv('DB_USER')};PWD={os.getenv('DB_PASSWORD')}"
        )
        conn = pyodbc.connect(connection_string)
        return conn
    except Exception as e:
        log(f"ERRO: Não foi possível conectar ao banco: {e}")
        return None

def fazer_backup_contratos(conn):
    """Faz backup dos contratos antes de remover"""
    log("=== FAZENDO BACKUP DOS CONTRATOS ===")
    
    cursor = conn.cursor()
    backup_data = {
        "timestamp": datetime.now().isoformat(),
        "contratos": [],
        "contrato_locadores": [],
        "contrato_locatarios": []
    }
    
    # Backup contratos principais
    cursor.execute("SELECT * FROM Contratos")
    contratos = cursor.fetchall()
    columns = [col[0] for col in cursor.description]
    
    for contrato in contratos:
        backup_data["contratos"].append(dict(zip(columns, contrato)))
    
    # Backup ContratoLocadores
    cursor.execute("SELECT * FROM ContratoLocadores")
    locadores = cursor.fetchall()
    if locadores:
        columns_locadores = [col[0] for col in cursor.description]
        for locador in locadores:
            backup_data["contrato_locadores"].append(dict(zip(columns_locadores, locador)))
    
    # Backup ContratoLocatarios
    cursor.execute("SELECT * FROM ContratoLocatarios")
    locatarios = cursor.fetchall()
    if locatarios:
        columns_locatarios = [col[0] for col in cursor.description]
        for locatario in locatarios:
            backup_data["contrato_locatarios"].append(dict(zip(columns_locatarios, locatario)))
    
    # Salvar backup
    backup_filename = f"backup_contratos_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(backup_filename, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False, default=str)
    
    log(f"Backup salvo em: {backup_filename}")
    return backup_filename

def remover_contratos(conn):
    """Remove todos os contratos e dependências"""
    log("=== REMOVENDO CONTRATOS E DEPENDENCIAS ===")
    
    cursor = conn.cursor()
    
    try:
        # Buscar todos os IDs de contratos
        cursor.execute("SELECT id FROM Contratos")
        contratos_ids = [row[0] for row in cursor.fetchall()]
        
        log(f"Encontrados {len(contratos_ids)} contratos para remover: {contratos_ids}")
        
        removidos = 0
        
        for contrato_id in contratos_ids:
            log(f"Removendo contrato ID {contrato_id}...")
            
            # Remover dependências primeiro (respeitando FK constraints)
            
            # 1. ContratoLocadores
            cursor.execute("DELETE FROM ContratoLocadores WHERE contrato_id = ?", (contrato_id,))
            locadores_removidos = cursor.rowcount
            
            # 2. ContratoLocatarios
            cursor.execute("DELETE FROM ContratoLocatarios WHERE contrato_id = ?", (contrato_id,))
            locatarios_removidos = cursor.rowcount
            
            # 3. Remover contrato principal
            cursor.execute("DELETE FROM Contratos WHERE id = ?", (contrato_id,))
            
            log(f"  Contrato {contrato_id}: {locadores_removidos} locadores, {locatarios_removidos} locatarios removidos")
            removidos += 1
        
        # Commit das alterações
        conn.commit()
        log(f"OK {removidos} contratos removidos com sucesso!")
        
        return True
        
    except Exception as e:
        log(f"ERRO ao remover contratos: {e}")
        conn.rollback()
        return False

def verificar_resultado(conn):
    """Verifica se a remoção foi bem-sucedida"""
    log("=== VERIFICANDO RESULTADO ===")
    
    cursor = conn.cursor()
    
    # Contar contratos restantes
    cursor.execute("SELECT COUNT(*) FROM Contratos")
    contratos_restantes = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM ContratoLocadores")
    locadores_restantes = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM ContratoLocatarios")
    locatarios_restantes = cursor.fetchone()[0]
    
    log(f"Contratos restantes: {contratos_restantes}")
    log(f"ContratoLocadores restantes: {locadores_restantes}")
    log(f"ContratoLocatarios restantes: {locatarios_restantes}")
    
    if contratos_restantes == 0 and locadores_restantes == 0 and locatarios_restantes == 0:
        log("OK Remocao concluida com sucesso - banco limpo!")
        return True
    else:
        log("AVISO Ainda ha registros no banco")
        return False

def main():
    """Função principal"""
    log("REMOVENDO CONTRATOS DE TESTE DO BANCO DE DADOS")
    log("=" * 60)
    
    # Conectar ao banco
    conn = conectar_banco()
    if not conn:
        return False
    
    try:
        # Confirmar operação
        print("\n" + "=" * 60)
        print("OPERACAO PERIGOSA - LEIA COM ATENCAO!")
        print("=" * 60)
        print("Este script ira:")
        print("1. REMOVER TODOS os contratos do banco de dados")
        print("2. REMOVER todas as relacoes N:N (ContratoLocadores/ContratoLocatarios)")
        print("3. Fazer BACKUP antes da remocao")
        print("4. Esta operacao e IRREVERSIVEL!")
        print()
        confirmacao = input("Digite 'REMOVER TUDO' para confirmar ou ENTER para cancelar: ")
        
        if confirmacao.upper() != 'REMOVER TUDO':
            log("Operacao cancelada pelo usuario")
            return False
        
        # Fazer backup
        backup_file = fazer_backup_contratos(conn)
        
        # Remover contratos
        if remover_contratos(conn):
            verificar_resultado(conn)
            log("REMOCAO CONCLUIDA COM SUCESSO!")
            log(f"Backup salvo em: {backup_file}")
            log("O banco esta pronto para nova populacao de contratos reais.")
            return True
        else:
            log("FALHA na remocao dos contratos")
            return False
            
    except Exception as e:
        log(f"ERRO CRITICO: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    try:
        sucesso = main()
        if sucesso:
            print("\nScript executado com sucesso!")
        else:
            print("\nScript falhou!")
    except KeyboardInterrupt:
        print("\nScript interrompido pelo usuario")
    except Exception as e:
        print(f"\nERRO CRITICO: {e}")
        import traceback
        traceback.print_exc()