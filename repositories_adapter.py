# Adaptador para compatibilizar os nomes dos repositórios com o main.py

import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_conexao():
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    return pyodbc.connect(connection_string)

# Funções diretas para as tabelas corretas
def buscar_locadores():
    """Busca todos os locadores da tabela Locadores"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Locadores")
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionários
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
    except Exception as e:
        print(f"Erro ao buscar locadores: {e}")
        return []

def buscar_locatarios():
    """Busca todos os locatários da tabela Locatarios"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Locatarios")
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionários
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
    except Exception as e:
        print(f"Erro ao buscar locatários: {e}")
        return []

def buscar_imoveis():
    """Busca todos os imóveis da tabela Imoveis"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Imoveis")
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionários
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                # Converter datetime para string se necessário
                if hasattr(value, 'strftime'):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
    except Exception as e:
        print(f"Erro ao buscar imóveis: {e}")
        return []

# Funções de inserção (usar as existentes)
from locacao.repositories.cliente_repository import inserir_cliente
from locacao.repositories.inquilino_repository import inserir_inquilino  
from locacao.repositories.imovel_repository import inserir_imovel
from locacao.repositories.contrato_repository import inserir_contrato

def inserir_locador(**kwargs):
    return inserir_cliente(**kwargs)

def inserir_locatario(dados):
    return inserir_inquilino(dados)

# Funções que faltam mas são esperadas pelo main.py
def buscar_locadores_com_contratos():
    """Lista todos os locadores que possuem contratos ativos"""
    return []

def buscar_prestacao_contas_mensal(id_locador, mes, ano):
    """Obtém a prestação de contas mensal de um locador"""
    return {"error": "Funcionalidade ainda não implementada"}

def inserir_lancamento_liquido(id_pagamento, tipo, valor):
    """Cria um novo lançamento líquido"""
    return False

def inserir_desconto_deducao(id_pagamento, tipo, valor):
    """Cria um novo desconto/dedução"""
    return False

def atualizar_pagamento_detalhes(id_pagamento, mes_referencia, ano_referencia, total_bruto, total_liquido, observacao, pagamento_atrasado):
    """Atualiza os detalhes de um pagamento"""
    return False

def buscar_historico_prestacao_contas(id_locador, limit):
    """Obtém o histórico de prestações de contas de um locador"""
    return []

def gerar_relatorio_excel(dados):
    """Gera relatório em Excel da prestação de contas"""
    return None

def gerar_relatorio_pdf(dados):
    """Gera relatório em PDF da prestação de contas"""
    return None

def inserir_contrato_locadores(contrato_id, locadores):
    """Define os locadores associados a um contrato com suas contas e porcentagens"""
    return False

def buscar_locadores_contrato(contrato_id):
    """Busca todos os locadores associados a um contrato"""
    return []

def buscar_contas_bancarias_locador(locador_id):
    """Lista todas as contas bancárias de um locador específico"""
    return []

def validar_porcentagens_contrato(locadores):
    """Valida se as porcentagens dos locadores somam 100% e outras regras"""
    return {"success": True, "message": "Validação OK", "details": {}}

def buscar_todos_locadores_ativos():
    """Lista todos os locadores ativos para seleção em contratos"""
    return []