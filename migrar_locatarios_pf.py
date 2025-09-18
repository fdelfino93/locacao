#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Migração - Locatários Pessoa Física
==============================================

Migra dados de locatários PF do arquivo Excel para o banco de dados.
- Cadastra 28 locatários Pessoa Física
- Migra dados completos: pessoais, cônjuge, telefones, emails, endereços, formas de cobrança

Autor: Claude Code Assistant
Data: 2025-09-11
"""

import pandas as pd
import requests
import json
from datetime import datetime
import sys

# Configurações
# Configurar URL da API baseada em variáveis de ambiente
import os
from dotenv import load_dotenv

load_dotenv()

API_PORT = os.getenv('API_PORT', '8000')
API_HOST = os.getenv('API_HOST', 'localhost')
API_BASE_URL = f"http://{API_HOST}:{API_PORT}/api"
ARQUIVO_EXCEL = "pessoa_fisica.xlsx"

def log(message):
    """Log com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def safe_str(value):
    """Converte valor para string segura"""
    if pd.isna(value) or value is None:
        return ""
    return str(value).strip()

def safe_float_to_int(value):
    """Converte float para int seguro"""
    if pd.isna(value) or value is None:
        return ""
    try:
        return str(int(float(value)))
    except:
        return str(value).strip()

def formatar_cpf(cpf):
    """Formata CPF"""
    if pd.isna(cpf) or cpf is None:
        return ""
    
    # Se for number, converter para string
    cpf_str = str(int(float(cpf))) if isinstance(cpf, (int, float)) else str(cpf)
    
    # Remover caracteres não numéricos
    cpf_limpo = ''.join(filter(str.isdigit, cpf_str))
    
    # Adicionar zeros à esquerda se necessário
    cpf_limpo = cpf_limpo.zfill(11)
    
    # Formatar como CPF
    if len(cpf_limpo) == 11:
        return f"{cpf_limpo[:3]}.{cpf_limpo[3:6]}.{cpf_limpo[6:9]}-{cpf_limpo[9:]}"
    
    return cpf_limpo

def processar_telefones(row):
    """Processa telefones do Excel"""
    telefones = []
    
    telefone1 = safe_str(row.get("telefone", ""))
    if telefone1:
        telefones.append(telefone1)
    
    telefone2 = safe_str(row.get("telefone 2", ""))
    if telefone2:
        telefones.append(telefone2)
        
    return telefones

def processar_emails(row):
    """Processa emails do Excel"""
    emails = []
    
    email1 = safe_str(row.get("email", ""))
    if email1:
        emails.append(email1)
    
    email2 = safe_str(row.get("email 2", ""))
    if email2:
        emails.append(email2)
        
    return emails

def processar_formas_cobranca(row):
    """Processa formas de cobrança do Excel"""
    formas = []
    
    # Email cobrança 
    email_cobranca = safe_str(row.get("email.1", ""))
    if email_cobranca:
        formas.append({
            "tipo": "email",
            "contato": email_cobranca,
            "observacoes": "Email principal de cobrança",
            "principal": True,
            "ordem": 0
        })
    
    # WhatsApp 
    whatsapp = safe_str(row.get("whatsapp", ""))
    if whatsapp:
        formas.append({
            "tipo": "whatsapp",
            "contato": whatsapp,
            "observacoes": "WhatsApp principal",
            "principal": len(formas) == 0,  # Principal se for o primeiro
            "ordem": len(formas)
        })
    
    # Verificar "envio de boleto" para outras formas
    envio_boleto = safe_str(row.get("envio de boleto", "")).lower()
    if "imovel" in envio_boleto or "próprio" in envio_boleto:
        formas.append({
            "tipo": "imovel",
            "contato": "Entregar no próprio imóvel",
            "observacoes": "Entrega no imóvel",
            "principal": len(formas) == 0,
            "ordem": len(formas)
        })
    
    return formas

def processar_conjuge(row):
    """Processa dados do cônjuge"""
    possui_conjuge = safe_str(row.get("possui conjuge", "")).lower()
    
    if possui_conjuge == "sim":
        nome_conjuge = safe_str(row.get("nome do conjuge", ""))
        if nome_conjuge:
            return {
                "possui_conjuge": True,
                "nome_conjuge": nome_conjuge,
                "cpf_conjuge": safe_str(row.get("cpf do conjuge", "")),
                "rg_conjuge": safe_str(row.get("rg do conjuge", "")),
                "telefone_conjuge": safe_str(row.get("telefone.1", "")),
                "regime_bens": safe_str(row.get("regime de bens", ""))
            }
    
    return {
        "possui_conjuge": False,
        "nome_conjuge": "",
        "cpf_conjuge": "",
        "rg_conjuge": "",
        "telefone_conjuge": "",
        "regime_bens": ""
    }

def converter_linha_para_locatario(row, index):
    """Converte linha do Excel para dados do locatário PF"""
    
    # Dados principais
    nome_completo = safe_str(row.get("nome completo locatario", ""))
    cpf = formatar_cpf(row.get("cpf", ""))
    
    # Endereço estruturado
    endereco = {
        "rua": safe_str(row.get("rua/logradouro", "")),
        "numero": safe_float_to_int(row.get("numero", "")),
        "complemento": safe_str(row.get("complemento", "")),
        "bairro": safe_str(row.get("bairro", "")),
        "cidade": safe_str(row.get("cidade", "")),
        "estado": safe_str(row.get("estado", "")),
        "cep": safe_str(row.get("cep", ""))
    }
    
    # Dados do cônjuge
    dados_conjuge = processar_conjuge(row)
    
    # Montar dados completos
    dados_locatario = {
        "nome": nome_completo,
        "cpf_cnpj": cpf,
        "tipo_pessoa": "PF",
        "telefone": safe_str(row.get("telefone", "")),
        "email": safe_str(row.get("email", "")),
        
        # Dados PF específicos
        "rg": safe_str(row.get("rg", "")),
        "nacionalidade": safe_str(row.get("nacionalidade", "Brasileira")),
        "estado_civil": safe_str(row.get("estado civil", "")),
        "profissao": safe_str(row.get("profissao", "")),
        "data_nascimento": None,  # Não tem no Excel
        
        # Endereço estruturado
        "endereco": endereco,
        
        # Múltiplos contatos
        "telefones": processar_telefones(row),
        "emails": processar_emails(row),
        
        # Formas de cobrança
        "formas_envio_cobranca": processar_formas_cobranca(row),
        
        # Dados do cônjuge
        **dados_conjuge,
        
        # Campos obrigatórios (PJ vazios)
        "razao_social": "",
        "nome_fantasia": "",
        "inscricao_estadual": "",
        "inscricao_municipal": "",
        "atividade_principal": "",
        "data_constituicao": None,
        "capital_social": "",
        "porte_empresa": "",
        "regime_tributario": "",
        "representante_legal": None,
        
        # Outros campos
        "observacoes": f"Migrado do Excel PF - Pessoa {index + 1}",
        "ativo": True,
        "possui_inquilino_solidario": False,
        "possui_fiador": False,
        "qtd_pets": 0,
        "endereco_conjuge": ""
    }
    
    return dados_locatario

def criar_locatario(dados):
    """Cria novo locatário via API"""
    try:
        url = f"{API_BASE_URL}/locatarios"
        
        log(f"Criando locatário PF: {dados['nome']}")
        
        response = requests.post(url, json=dados, headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            result = response.json()
            
            # Tentar diferentes estruturas de resposta
            if isinstance(result, dict):
                if 'data' in result and result['data'] and isinstance(result['data'], dict):
                    novo_id = result['data'].get('id')
                elif 'id' in result:
                    novo_id = result.get('id')
                else:
                    log(f"Estrutura de resposta não reconhecida: {result}")
                    # Assumir sucesso mesmo sem ID
                    return True
            else:
                log(f"Resposta não é um dicionário: {type(result)}")
                return False
                
            log(f"Locatário PF criado com ID {novo_id}!")
            return novo_id
        else:
            log(f"Erro ao criar locatário: {response.status_code}")
            log(f"   Resposta: {response.text}")
            return None
            
    except Exception as e:
        log(f"Erro na requisição: {str(e)}")
        return None

def verificar_api():
    """Verifica se a API está funcionando"""
    try:
        response = requests.get(f"{API_BASE_URL}/locatarios")
        return response.status_code == 200
    except:
        return False

def main():
    """Função principal"""
    log("INICIANDO MIGRAÇÃO DE LOCATÁRIOS PESSOA FÍSICA")
    log("=" * 60)
    
    # Verificar API
    if not verificar_api():
        log("ERRO: API não está respondendo. Verifique se o backend está rodando.")
        return False
    
    log("API está funcionando")
    
    # Carregar dados do Excel
    try:
        log(f"Carregando dados do arquivo: {ARQUIVO_EXCEL}")
        df = pd.read_excel(ARQUIVO_EXCEL)
        log(f"Arquivo carregado: {len(df)} pessoas encontradas")
    except Exception as e:
        log(f"Erro ao carregar arquivo Excel: {str(e)}")
        return False
    
    sucessos = 0
    erros = 0
    
    # Processar cada linha
    for index, row in df.iterrows():
        nome = safe_str(row.get("nome completo locatario", f"Pessoa {index + 1}"))
        log(f"\n--- PROCESSANDO PESSOA {index + 1}: {nome} ---")
        
        # Converter dados
        dados_locatario = converter_linha_para_locatario(row, index)
        
        # Criar locatário
        resultado = criar_locatario(dados_locatario)
        if resultado:
            sucessos += 1
        else:
            erros += 1
    
    # Relatório final
    log("\n" + "=" * 60)
    log("RELATÓRIO FINAL DA MIGRAÇÃO")
    log("=" * 60)
    log(f"Sucessos: {sucessos}")
    log(f"Erros: {erros}")
    log(f"Total processado: {len(df)}")
    
    if erros == 0:
        log("MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
        log("\nVERIFICAÇÃO RECOMENDADA:")
        log("   1. Abra o sistema e verifique os locatários")
        log("   2. Teste formas de cobrança")
        log("   3. Verifique dados de cônjuge")
        log("   4. Confirme endereços estruturados")
    else:
        log(f"MIGRAÇÃO CONCLUÍDA COM {erros} ERRO(S)")
        log("   Verifique os logs acima para detalhes")
    
    return erros == 0

if __name__ == "__main__":
    try:
        sucesso = main()
        sys.exit(0 if sucesso else 1)
    except KeyboardInterrupt:
        log("\nMigração interrompida pelo usuário")
        sys.exit(1)
    except Exception as e:
        log(f"\nERRO CRÍTICO: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)