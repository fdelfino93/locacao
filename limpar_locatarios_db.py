#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Limpeza do Banco de Dados - Locatários
===============================================

1. Remove completamente locatários inativos (teste)
2. Limpa campos de PF dos locatários que agora são PJ

IMPORTANTE: Faz backup antes de qualquer alteração!

Autor: Claude Code Assistant
Data: 2025-09-11
"""

import pyodbc
from datetime import datetime
import json
import os
from dotenv import load_dotenv

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
            f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
            f"SERVER={os.getenv('DB_SERVER')};"
            f"DATABASE={os.getenv('DB_DATABASE')};"
            f"UID={os.getenv('DB_USER')};"
            f"PWD={os.getenv('DB_PASSWORD')}"
        )
        conn = pyodbc.connect(connection_string)
        return conn
    except Exception as e:
        log(f"ERRO: Não foi possível conectar ao banco: {e}")
        return None

def fazer_backup_locatarios(cursor, locatarios_ids):
    """Faz backup dos locatários que serão alterados"""
    log("=== FAZENDO BACKUP DOS LOCATÁRIOS ===")
    
    backup_data = {
        "timestamp": datetime.now().isoformat(),
        "locatarios": [],
        "representantes": [],
        "telefones": [],
        "emails": [],
        "formas_cobranca": [],
        "enderecos": []
    }
    
    for loc_id in locatarios_ids:
        # Backup locatário principal
        cursor.execute("SELECT * FROM Locatarios WHERE id = ?", (loc_id,))
        locatario = cursor.fetchone()
        if locatario:
            backup_data["locatarios"].append({
                "id": loc_id,
                "dados": dict(zip([column[0] for column in cursor.description], locatario))
            })
        
        # Backup representante legal
        cursor.execute("SELECT * FROM RepresentanteLegalLocatario WHERE id_locatario = ?", (loc_id,))
        representantes = cursor.fetchall()
        for repr_data in representantes:
            backup_data["representantes"].append({
                "locatario_id": loc_id,
                "dados": dict(zip([column[0] for column in cursor.description], repr_data))
            })
        
        # Backup telefones
        cursor.execute("SELECT * FROM TelefonesLocatario WHERE locatario_id = ?", (loc_id,))
        telefones = cursor.fetchall()
        for tel in telefones:
            backup_data["telefones"].append({
                "locatario_id": loc_id,
                "dados": dict(zip([column[0] for column in cursor.description], tel))
            })
        
        # Backup emails
        cursor.execute("SELECT * FROM EmailsLocatario WHERE locatario_id = ?", (loc_id,))
        emails = cursor.fetchall()
        for email in emails:
            backup_data["emails"].append({
                "locatario_id": loc_id,
                "dados": dict(zip([column[0] for column in cursor.description], email))
            })
        
        # Backup formas de cobrança
        cursor.execute("SELECT * FROM FormasEnvioCobranca WHERE locatario_id = ?", (loc_id,))
        formas = cursor.fetchall()
        for forma in formas:
            backup_data["formas_cobranca"].append({
                "locatario_id": loc_id,
                "dados": dict(zip([column[0] for column in cursor.description], forma))
            })
        
        # Backup endereços estruturados
        cursor.execute("""
            SELECT e.* FROM EnderecoLocatario e 
            INNER JOIN Locatarios l ON l.endereco_id = e.id 
            WHERE l.id = ?
        """, (loc_id,))
        endereco = cursor.fetchone()
        if endereco:
            backup_data["enderecos"].append({
                "locatario_id": loc_id,
                "dados": dict(zip([column[0] for column in cursor.description], endereco))
            })
    
    # Salvar backup
    backup_filename = f"backup_locatarios_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(backup_filename, 'w', encoding='utf-8') as f:
        json.dump(backup_data, f, indent=2, ensure_ascii=False, default=str)
    
    log(f"Backup salvo em: {backup_filename}")
    return backup_filename

def remover_locatarios_inativos(conn):
    """Remove completamente locatários inativos (teste)"""
    log("=== REMOVENDO LOCATÁRIOS INATIVOS ===")
    
    locatarios_inativos = [12, 13, 14, 15, 16]
    cursor = conn.cursor()
    
    try:
        # Fazer backup primeiro
        backup_file = fazer_backup_locatarios(cursor, locatarios_inativos)
        
        removidos = 0
        for loc_id in locatarios_inativos:
            # Verificar se existe e está inativo
            cursor.execute("SELECT nome, ativo FROM Locatarios WHERE id = ?", (loc_id,))
            locatario = cursor.fetchone()
            
            if not locatario:
                log(f"   Locatário ID {loc_id} não encontrado")
                continue
                
            nome, ativo = locatario
            if ativo:
                log(f"   AVISO: Locatário ID {loc_id} ({nome}) está ATIVO - pulando")
                continue
            
            log(f"   Removendo ID {loc_id}: {nome}")
            
            # Remover em ordem (FK constraints)
            cursor.execute("DELETE FROM FormasEnvioCobranca WHERE locatario_id = ?", (loc_id,))
            cursor.execute("DELETE FROM EmailsLocatario WHERE locatario_id = ?", (loc_id,))
            cursor.execute("DELETE FROM TelefonesLocatario WHERE locatario_id = ?", (loc_id,))
            cursor.execute("DELETE FROM RepresentanteLegalLocatario WHERE id_locatario = ?", (loc_id,))
            
            # Obter endereco_id antes de remover o locatário
            cursor.execute("SELECT endereco_id FROM Locatarios WHERE id = ?", (loc_id,))
            endereco_result = cursor.fetchone()
            endereco_id = endereco_result[0] if endereco_result and endereco_result[0] else None
            
            # Remover locatário principal primeiro
            cursor.execute("DELETE FROM Locatarios WHERE id = ?", (loc_id,))
            
            # Depois remover endereço estruturado se existir e não estiver sendo usado por outros
            if endereco_id:
                cursor.execute("SELECT COUNT(*) FROM Locatarios WHERE endereco_id = ?", (endereco_id,))
                count = cursor.fetchone()[0]
                if count == 0:  # Nenhum outro locatário usa este endereço
                    cursor.execute("DELETE FROM EnderecoLocatario WHERE id = ?", (endereco_id,))
            
            removidos += 1
            log(f"   Locatario ID {loc_id} removido completamente")
        
        conn.commit()
        log(f"{removidos} locatarios inativos removidos com sucesso!")
        return True
        
    except Exception as e:
        log(f"ERRO ao remover locatarios: {e}")
        conn.rollback()
        return False

def limpar_dados_pf_de_locatarios_pj(conn):
    """Limpa campos de PF dos locatários que agora são PJ"""
    log("=== LIMPANDO DADOS PF DE LOCATÁRIOS PJ ===")
    
    # IDs dos locatários que eram PF e agora são PJ
    locatarios_pj = [1, 3, 4, 5, 6]
    cursor = conn.cursor()
    
    try:
        # Fazer backup primeiro
        backup_file = fazer_backup_locatarios(cursor, locatarios_pj)
        
        limpados = 0
        for loc_id in locatarios_pj:
            # Verificar se existe e é PJ
            cursor.execute("SELECT nome, tipo_pessoa FROM Locatarios WHERE id = ?", (loc_id,))
            locatario = cursor.fetchone()
            
            if not locatario:
                log(f"   Locatário ID {loc_id} não encontrado")
                continue
                
            nome, tipo_pessoa = locatario
            if tipo_pessoa != 'PJ':
                log(f"   AVISO: Locatário ID {loc_id} ({nome}) não é PJ - pulando")
                continue
            
            log(f"   Limpando dados PF do ID {loc_id}: {nome}")
            
            # Campos específicos de PF que devem ser limpos
            campos_pf_limpar = {
                'rg': '',
                'data_nascimento': None,
                'estado_civil': '',
                'profissao': '',
                'nacionalidade': 'Brasileira',  # Manter padrão
                'possui_conjuge': 0,
                'conjuge_nome': '',
                'cpf_conjuge': '',
                'rg_conjuge': '',
                'endereco_conjuge': '',
                'telefone_conjuge': '',
                'regime_bens': '',
                'possui_inquilino_solidario': 0,
                'possui_fiador': 0,
                'dependentes_inq': None,
                'qtd_dependentes_inq': 0,
                'responsavel_inq': None,
                'pet_inquilino': None,
                'qtd_pet_inquilino': 0,
                'porte_pet': '',
                'dados_moradores': 0,
                'tem_fiador': None,
                'tem_moradores': None
            }
            
            # Montar query de UPDATE
            set_clauses = []
            params = []
            for campo, valor in campos_pf_limpar.items():
                set_clauses.append(f"{campo} = ?")
                params.append(valor)
            
            params.append(loc_id)  # Para o WHERE
            
            update_query = f"""
                UPDATE Locatarios 
                SET {', '.join(set_clauses)}
                WHERE id = ?
            """
            
            cursor.execute(update_query, params)
            limpados += 1
            log(f"   Dados PF limpos do locatario ID {loc_id}")
        
        conn.commit()
        log(f"{limpados} locatarios PJ tiveram dados PF limpos!")
        return True
        
    except Exception as e:
        log(f"ERRO ao limpar dados PF: {e}")
        conn.rollback()
        return False

def verificar_resultado(conn):
    """Verifica o resultado das operações"""
    log("=== VERIFICANDO RESULTADOS ===")
    
    cursor = conn.cursor()
    
    # Contar locatários ativos
    cursor.execute("SELECT COUNT(*) FROM Locatarios WHERE ativo = 1")
    ativos = cursor.fetchone()[0]
    
    # Contar locatários inativos
    cursor.execute("SELECT COUNT(*) FROM Locatarios WHERE ativo = 0")
    inativos = cursor.fetchone()[0]
    
    # Verificar locatários PJ
    cursor.execute("""
        SELECT id, nome, tipo_pessoa, 
               CASE WHEN rg = '' THEN 'LIMPO' ELSE 'COM DADOS PF' END as status_limpeza
        FROM Locatarios 
        WHERE tipo_pessoa = 'PJ' AND ativo = 1
        ORDER BY id
    """)
    
    locatarios_pj = cursor.fetchall()
    
    log(f"ESTATISTICAS FINAIS:")
    log(f"   Locatarios ativos: {ativos}")
    log(f"   Locatarios inativos: {inativos}")
    log(f"   Locatarios PJ: {len(locatarios_pj)}")
    
    log(f"\nSTATUS DOS LOCATARIOS PJ:")
    for loc in locatarios_pj:
        id_loc, nome, tipo, status = loc
        emoji = "OK" if status == "LIMPO" else "AVISO"
        log(f"   {emoji} ID {id_loc}: {nome} - {status}")

def main():
    """Função principal"""
    log("INICIANDO LIMPEZA DO BANCO DE DADOS - LOCATÁRIOS")
    log("=" * 60)
    
    # Conectar ao banco
    conn = conectar_banco()
    if not conn:
        return False
    
    try:
        # Verificar estado atual
        log("Estado atual do banco:")
        verificar_resultado(conn)
        
        # Confirmar operação
        print("\n" + "=" * 60)
        print("OPERACAO PERIGOSA - LEIA COM ATENCAO!")
        print("=" * 60)
        print("Este script ira:")
        print("1. REMOVER COMPLETAMENTE os locatarios inativos (IDs: 12,13,14,15,16)")
        print("2. LIMPAR dados de PF dos locatarios PJ (IDs: 1,3,4,5,6)")
        print("3. Fazer BACKUP antes de qualquer alteracao")
        print()
        confirmacao = input("Digite 'CONFIRMO' para prosseguir ou ENTER para cancelar: ")
        
        if confirmacao.upper() != 'CONFIRMO':
            log("Operacao cancelada pelo usuario")
            return False
        
        # Executar operações
        log("\nIniciando operacoes...")
        
        # 1. Remover locatários inativos
        if not remover_locatarios_inativos(conn):
            log("Falha na remocao de locatarios inativos")
            return False
        
        # 2. Limpar dados PF de locatários PJ
        if not limpar_dados_pf_de_locatarios_pj(conn):
            log("Falha na limpeza de dados PF")
            return False
        
        # 3. Verificar resultado final
        log("\nRESULTADO FINAL:")
        verificar_resultado(conn)
        
        log("\nLIMPEZA CONCLUIDA COM SUCESSO!")
        log("   Locatarios inativos removidos")
        log("   Dados PF limpos dos locatarios PJ")
        log("   Backup criado para seguranca")
        
        return True
        
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