#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Verificação Prévia - Limpeza Locatários
================================================

Verifica exatamente o que será alterado antes de executar a limpeza.
NÃO faz alterações - apenas mostra o que seria feito.

Autor: Claude Code Assistant
Data: 2025-09-11
"""

import pyodbc
import os
from datetime import datetime
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

def verificar_locatarios_inativos(cursor):
    """Verifica quais locatários inativos serão removidos"""
    log("=== LOCATÁRIOS INATIVOS QUE SERÃO REMOVIDOS ===")
    
    locatarios_inativos = [12, 13, 14, 15, 16]
    encontrados = []
    
    for loc_id in locatarios_inativos:
        cursor.execute("""
            SELECT id, nome, cpf_cnpj, ativo, created_at
            FROM Locatarios 
            WHERE id = ?
        """, (loc_id,))
        
        locatario = cursor.fetchone()
        if locatario:
            id_loc, nome, cpf_cnpj, ativo, created_at = locatario
            status = "INATIVO" if not ativo else "ATIVO (AVISO)"
            encontrados.append((id_loc, nome, cpf_cnpj, ativo))
            
            log(f"   ID {id_loc}: {nome}")
            log(f"      CPF/CNPJ: {cpf_cnpj}")
            log(f"      Status: {status}")
            log(f"      Criado em: {created_at}")
            
            # Verificar dados relacionados
            cursor.execute("SELECT COUNT(*) FROM TelefonesLocatario WHERE locatario_id = ?", (loc_id,))
            qtd_telefones = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM EmailsLocatario WHERE locatario_id = ?", (loc_id,))
            qtd_emails = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM FormasEnvioCobranca WHERE locatario_id = ?", (loc_id,))
            qtd_formas = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM RepresentanteLegalLocatario WHERE id_locatario = ?", (loc_id,))
            qtd_repr = cursor.fetchone()[0]
            
            log(f"      Dados relacionados: {qtd_telefones} telefones, {qtd_emails} emails, {qtd_formas} formas cobrança, {qtd_repr} representantes")
            log("")
        else:
            log(f"   ID {loc_id}: NÃO ENCONTRADO")
    
    return encontrados

def verificar_locatarios_pj_com_dados_pf(cursor):
    """Verifica locatários PJ que têm dados de PF para limpar"""
    log("=== LOCATÁRIOS PJ COM DADOS DE PF PARA LIMPAR ===")
    
    locatarios_pj = [1, 3, 4, 5, 6]
    encontrados = []
    
    for loc_id in locatarios_pj:
        cursor.execute("""
            SELECT id, nome, tipo_pessoa, rg, data_nascimento, estado_civil, 
                   profissao, possui_conjuge, conjuge_nome, cpf_conjuge
            FROM Locatarios 
            WHERE id = ?
        """, (loc_id,))
        
        locatario = cursor.fetchone()
        if locatario:
            (id_loc, nome, tipo_pessoa, rg, data_nasc, estado_civil, 
             profissao, possui_conjuge, conjuge_nome, cpf_conjuge) = locatario
            
            # Verificar se tem dados de PF para limpar
            dados_pf = []
            if rg and rg.strip(): dados_pf.append(f"RG: {rg}")
            if data_nasc: dados_pf.append(f"Data Nascimento: {data_nasc}")
            if estado_civil and estado_civil.strip(): dados_pf.append(f"Estado Civil: {estado_civil}")
            if profissao and profissao.strip(): dados_pf.append(f"Profissão: {profissao}")
            if possui_conjuge: dados_pf.append("Possui Cônjuge: Sim")
            if conjuge_nome and conjuge_nome.strip(): dados_pf.append(f"Nome Cônjuge: {conjuge_nome}")
            if cpf_conjuge and cpf_conjuge.strip(): dados_pf.append(f"CPF Cônjuge: {cpf_conjuge}")
            
            encontrados.append((id_loc, nome, tipo_pessoa, len(dados_pf)))
            
            log(f"   ID {id_loc}: {nome}")
            log(f"      Tipo: {tipo_pessoa}")
            
            if dados_pf:
                log(f"      Dados PF a serem limpos ({len(dados_pf)}):")
                for dado in dados_pf:
                    log(f"         - {dado}")
            else:
                log(f"      OK: Ja esta limpo (sem dados PF)")
            log("")
        else:
            log(f"   ID {loc_id}: NÃO ENCONTRADO")
    
    return encontrados

def verificar_estado_geral(cursor):
    """Verifica estado geral do banco"""
    log("=== ESTADO GERAL DO BANCO ===")
    
    # Total de locatários
    cursor.execute("SELECT COUNT(*) FROM Locatarios")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM Locatarios WHERE ativo = 1")
    ativos = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM Locatarios WHERE ativo = 0")
    inativos = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM Locatarios WHERE tipo_pessoa = 'PF'")
    pf = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM Locatarios WHERE tipo_pessoa = 'PJ'")
    pj = cursor.fetchone()[0]
    
    log(f"   Total de locatários: {total}")
    log(f"   Ativos: {ativos}")
    log(f"   Inativos: {inativos}")
    log(f"   Pessoa Física: {pf}")
    log(f"   Pessoa Jurídica: {pj}")
    
    # Verificar dados relacionados
    cursor.execute("SELECT COUNT(*) FROM TelefonesLocatario")
    total_tel = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM EmailsLocatario")
    total_email = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM FormasEnvioCobranca")
    total_formas = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM RepresentanteLegalLocatario")
    total_repr = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM EnderecoLocatario")
    total_end = cursor.fetchone()[0]
    
    log(f"   Total telefones: {total_tel}")
    log(f"   Total emails: {total_email}")
    log(f"   Total formas cobrança: {total_formas}")
    log(f"   Total representantes: {total_repr}")
    log(f"   Total endereços estruturados: {total_end}")

def main():
    """Função principal"""
    log("VERIFICACAO PREVIA - LIMPEZA LOCATARIOS")
    log("=" * 60)
    log("AVISO: ESTE SCRIPT APENAS VERIFICA - NAO FAZ ALTERACOES!")
    log("=" * 60)
    
    # Conectar ao banco
    conn = conectar_banco()
    if not conn:
        return False
    
    try:
        cursor = conn.cursor()
        
        # Verificar estado geral
        verificar_estado_geral(cursor)
        print()
        
        # Verificar locatários inativos
        inativos = verificar_locatarios_inativos(cursor)
        print()
        
        # Verificar locatários PJ com dados PF
        pj_com_pf = verificar_locatarios_pj_com_dados_pf(cursor)
        print()
        
        # Resumo final
        log("=== RESUMO DA VERIFICACAO ===")
        log(f"Locatarios inativos encontrados: {len(inativos)}")
        
        inativos_reais = [x for x in inativos if not x[3]]  # ativo = False
        inativos_ativos = [x for x in inativos if x[3]]     # ativo = True
        
        if inativos_reais:
            log(f"   Serao removidos: {len(inativos_reais)} locatarios")
            for loc in inativos_reais:
                log(f"      - ID {loc[0]}: {loc[1]}")
        
        if inativos_ativos:
            log(f"   NAO serao removidos (estao ativos): {len(inativos_ativos)}")
            for loc in inativos_ativos:
                log(f"      - ID {loc[0]}: {loc[1]}")
        
        pj_com_dados = [x for x in pj_com_pf if x[3] > 0]  # tem dados PF
        log(f"Locatarios PJ com dados PF: {len(pj_com_dados)}")
        
        if pj_com_dados:
            log(f"   Serao limpos: {len(pj_com_dados)} locatarios")
            for loc in pj_com_dados:
                log(f"      - ID {loc[0]}: {loc[1]} ({loc[3]} campos)")
        
        print("\n" + "=" * 60)
        print("VERIFICACAO CONCLUIDA")
        print("Para executar a limpeza, execute: python limpar_locatarios_db.py")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        log(f"❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nVerificacao interrompida pelo usuario")
    except Exception as e:
        print(f"\nERRO CRITICO: {e}")
        import traceback
        traceback.print_exc()