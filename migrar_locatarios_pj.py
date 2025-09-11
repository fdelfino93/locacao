#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Migração - Locatários Pessoa Jurídica
==============================================

Migra dados de locatários PJ do arquivo Excel para o banco de dados.
- Substitui os 5 locatários existentes (IDs: 1,3,4,5,6)
- Cria 2 novos locatários (IDs: 7,8)
- Converte todos para Pessoa Jurídica
- Migra dados completos: empresa, representante legal, telefones, emails, endereços, formas de cobrança

Autor: Claude Code Assistant
Data: 2025-09-11
"""

import pandas as pd
import requests
import json
from datetime import datetime
import sys

# Configurações
API_BASE_URL = "http://localhost:8000/api"
ARQUIVO_EXCEL = "pessoa_juridica.xlsx"

# Mapeamento IDs existentes -> empresas
MAPEAMENTO_IDS = {
    1: 0,  # JPE Imóveis Ltda
    3: 1,  # Kasaflex Comercial Ltda Me
    4: 2,  # Opp Sistemas de Saúde Ltda
    5: 3,  # Vidro e Decor Comercio e Distribuição Ltda
    6: 4,  # Pro7 Investimentos e Participações S/A
    # Novos serão criados: 7 e 8
}

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

def formatar_endereco_string(rua, numero, complemento, bairro, cidade, estado, cep):
    """Formata endereço como string para salvar no banco"""
    partes = []
    
    if rua: partes.append(rua)
    if numero: partes.append(numero)
    if complemento: partes.append(complemento)
    if bairro: partes.append(bairro)
    if cidade and estado: partes.append(f"{cidade} - {estado}")
    
    endereco_str = ", ".join(partes)
    
    if cep:
        endereco_str += f", CEP: {cep}"
        
    return endereco_str

def processar_formas_cobranca(row):
    """Processa formas de cobrança do Excel"""
    formas = []
    
    # Email cobrança principal
    email_cobranca = safe_str(row.get("email cobrança", ""))
    if email_cobranca:
        formas.append({
            "tipo": "email",
            "contato": email_cobranca,
            "observacoes": "Email principal de cobrança",
            "principal": True,
            "ordem": 0
        })
    
    # Email cobrança secundário
    email_cobranca2 = safe_str(row.get("email 2 cobrança", ""))
    if email_cobranca2:
        formas.append({
            "tipo": "email", 
            "contato": email_cobranca2,
            "observacoes": "Email secundário de cobrança",
            "principal": False,
            "ordem": len(formas)
        })
    
    # WhatsApp principal
    whatsapp = safe_str(row.get("whatsapp", ""))
    if whatsapp:
        formas.append({
            "tipo": "whatsapp",
            "contato": whatsapp,
            "observacoes": "WhatsApp principal",
            "principal": len(formas) == 0,  # Principal se for o primeiro
            "ordem": len(formas)
        })
    
    # WhatsApp secundário
    whatsapp2 = safe_str(row.get("whatsapp 2", ""))
    if whatsapp2:
        formas.append({
            "tipo": "whatsapp",
            "contato": whatsapp2, 
            "observacoes": "WhatsApp secundário",
            "principal": False,
            "ordem": len(formas)
        })
    
    return formas

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

def converter_linha_para_locatario(row, index):
    """Converte linha do Excel para dados do locatário"""
    
    # Dados principais
    razao_social = safe_str(row.get("razao social", ""))
    cnpj = safe_str(row.get("cnpj", ""))
    ramo = safe_str(row.get("ramo", ""))
    
    # Endereço da empresa
    endereco_empresa = {
        "rua": safe_str(row.get("rua/logradouro", "")),
        "numero": safe_float_to_int(row.get("numero", "")),
        "complemento": safe_str(row.get("complemento", "")),
        "bairro": safe_str(row.get("bairro", "")),
        "cidade": safe_str(row.get("cidade", "")),
        "estado": safe_str(row.get("estado", "")),
        "cep": safe_str(row.get("cep", ""))
    }
    
    # Representante legal
    endereco_rep_str = ""
    if safe_str(row.get("rua/logradouro representante", "")):
        endereco_rep_str = formatar_endereco_string(
            safe_str(row.get("rua/logradouro representante", "")),
            safe_float_to_int(row.get("numero representante", "")),
            safe_str(row.get("complemento representante", "")),
            safe_str(row.get("bairro representante", "")),
            safe_str(row.get("cidade representante", "")),
            safe_str(row.get("estado representante", "")),
            safe_str(row.get("cep representante", ""))
        )
    
    representante_legal = None
    if safe_str(row.get("nome do representante", "")):
        representante_legal = {
            "nome": safe_str(row.get("nome do representante", "")),
            "cpf": safe_str(row.get("cpf do representante", "")),
            "rg": safe_str(row.get("rg", "")),
            "cargo": "Representante Legal",
            "telefone": safe_str(row.get("telefone representante", "")),
            "email": safe_str(row.get("email representante", "")),
            "endereco": endereco_rep_str
        }
    
    # Montar dados completos
    dados_locatario = {
        "nome": razao_social,
        "razao_social": razao_social,
        "cpf_cnpj": cnpj,
        "tipo_pessoa": "PJ",
        "atividade_principal": ramo if ramo and ramo.lower() != "nan" else "",
        "telefone": safe_str(row.get("telefone", "")),
        "email": safe_str(row.get("email", "")),
        "nacionalidade": "Brasileira",
        "estado_civil": "",
        "profissao": "",
        "observacoes": f"Migrado do Excel - Empresa {index + 1}",
        "ativo": True,
        
        # Endereço estruturado
        "endereco": endereco_empresa,
        
        # Representante legal
        "representante_legal": representante_legal,
        
        # Múltiplos contatos
        "telefones": processar_telefones(row),
        "emails": processar_emails(row),
        
        # Formas de cobrança
        "formas_envio_cobranca": processar_formas_cobranca(row),
        
        # Campos obrigatórios vazios
        "rg": "",
        "cpf_conjuge": "",
        "nome_conjuge": "",
        "rg_conjuge": "",
        "endereco_conjuge": "",
        "telefone_conjuge": "",
        "regime_bens": "",
        "data_nascimento": None,
        "possui_conjuge": False,
        "possui_inquilino_solidario": False,
        "possui_fiador": False,
        "qtd_pets": 0,
        
        # Campos PJ específicos
        "nome_fantasia": "",
        "inscricao_estadual": "",
        "inscricao_municipal": "", 
        "data_constituicao": None,
        "capital_social": "",
        "porte_empresa": "",
        "regime_tributario": ""
    }
    
    return dados_locatario

def atualizar_locatario(locatario_id, dados):
    """Atualiza locatário existente via API"""
    try:
        url = f"{API_BASE_URL}/locatarios/{locatario_id}"
        
        log(f"Atualizando locatário ID {locatario_id}: {dados['nome']}")
        
        response = requests.put(url, json=dados, headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            log(f"Locatario ID {locatario_id} atualizado com sucesso!")
            return True
        else:
            log(f"Erro ao atualizar locatario ID {locatario_id}: {response.status_code}")
            log(f"   Resposta: {response.text}")
            return False
            
    except Exception as e:
        log(f"Erro na requisicao para locatario ID {locatario_id}: {str(e)}")
        return False

def criar_locatario(dados):
    """Cria novo locatário via API"""
    try:
        url = f"{API_BASE_URL}/locatarios"
        
        log(f"Criando novo locatário: {dados['nome']}")
        
        response = requests.post(url, json=dados, headers={'Content-Type': 'application/json'})
        
        log(f"Status code: {response.status_code}")
        log(f"Response text: {response.text[:500]}...")
        
        if response.status_code == 200:
            result = response.json()
            log(f"Response JSON: {result}")
            
            # Tentar diferentes estruturas de resposta
            if isinstance(result, dict):
                if 'data' in result and result['data'] and isinstance(result['data'], dict):
                    novo_id = result['data'].get('id')
                elif 'id' in result:
                    novo_id = result.get('id')
                else:
                    log(f"Estrutura de resposta não reconhecida: {result}")
                    return None
            else:
                log(f"Resposta não é um dicionário: {type(result)}")
                return None
                
            log(f"Novo locatario criado com ID {novo_id}!")
            return novo_id
        else:
            log(f"Erro ao criar locatario: {response.status_code}")
            log(f"   Resposta: {response.text}")
            return None
            
    except Exception as e:
        log(f"Erro na requisicao para criar locatario: {str(e)}")
        import traceback
        log(f"Traceback: {traceback.format_exc()}")
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
    log("INICIANDO MIGRACAO DE LOCATARIOS PESSOA JURIDICA")
    log("=" * 60)
    
    # Verificar API
    if not verificar_api():
        log("ERRO: API nao esta respondendo. Verifique se o backend esta rodando.")
        return False
    
    log("API esta funcionando")
    
    # Carregar dados do Excel
    try:
        log(f"Carregando dados do arquivo: {ARQUIVO_EXCEL}")
        df = pd.read_excel(ARQUIVO_EXCEL)
        log(f"Arquivo carregado: {len(df)} empresas encontradas")
    except Exception as e:
        log(f"Erro ao carregar arquivo Excel: {str(e)}")
        return False
    
    sucessos = 0
    erros = 0
    
    # Processar cada linha
    for index, row in df.iterrows():
        empresa_nome = safe_str(row.get("razao social", f"Empresa {index + 1}"))
        log(f"\n--- PROCESSANDO EMPRESA {index + 1}: {empresa_nome} ---")
        
        # Converter dados
        dados_locatario = converter_linha_para_locatario(row, index)
        
        # Verificar se é ID existente ou novo
        if index < 5:  # Primeiros 5 -> substituir IDs existentes
            ids_existentes = [1, 3, 4, 5, 6]
            locatario_id = ids_existentes[index]
            
            if atualizar_locatario(locatario_id, dados_locatario):
                sucessos += 1
            else:
                erros += 1
        else:  # Últimos 2 -> criar novos
            novo_id = criar_locatario(dados_locatario)
            if novo_id:
                sucessos += 1
            else:
                erros += 1
    
    # Relatório final
    log("\n" + "=" * 60)
    log("RELATORIO FINAL DA MIGRACAO")
    log("=" * 60)
    log(f"Sucessos: {sucessos}")
    log(f"Erros: {erros}")
    log(f"Total processado: {len(df)}")
    
    if erros == 0:
        log("MIGRACAO CONCLUIDA COM SUCESSO!")
        log("\nVERIFICACAO RECOMENDADA:")
        log("   1. Abra o sistema e verifique os locatarios")
        log("   2. Teste formas de cobranca")
        log("   3. Verifique representantes legais")
        log("   4. Confirme enderecos estruturados")
    else:
        log(f"MIGRACAO CONCLUIDA COM {erros} ERRO(S)")
        log("   Verifique os logs acima para detalhes")
    
    return erros == 0

if __name__ == "__main__":
    try:
        sucesso = main()
        sys.exit(0 if sucesso else 1)
    except KeyboardInterrupt:
        log("\nMigracao interrompida pelo usuario")
        sys.exit(1)
    except Exception as e:
        log(f"\nERRO CRITICO: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)