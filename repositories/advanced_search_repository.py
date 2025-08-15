"""
Repository avançado para busca com relacionamentos complexos e histórico
Implementa queries otimizadas para o sistema de locação
"""

import pyodbc
import json
from typing import List, Dict, Any, Optional, Union, Tuple
from datetime import date, datetime, timedelta
from dataclasses import dataclass
from enum import Enum
import os
from dotenv import load_dotenv

load_dotenv()

# ============================
# CONFIGURAÇÕES E CONEXÃO
# ============================

def get_conexao():
    """Conexão otimizada com SQL Server"""
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')};"
        "TrustServerCertificate=yes;"
        "Connection Timeout=30;"
        "Command Timeout=60;"
    )
    return pyodbc.connect(connection_string)

# ============================
# ENUMS E DATACLASSES
# ============================

class TipoEntidade(Enum):
    LOCADORES = "locadores"
    LOCATARIOS = "locatarios"
    IMOVEIS = "imoveis"
    CONTRATOS = "contratos"

class StatusContrato(Enum):
    ATIVO = "ATIVO"
    VENCIDO = "VENCIDO"
    VENCENDO = "VENCENDO"
    RESCINDIDO = "RESCINDIDO"

@dataclass
class FiltroAvancado:
    """Classe para filtros avançados de busca"""
    termo_busca: Optional[str] = None
    entidades: List[TipoEntidade] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    valor_min: Optional[float] = None
    valor_max: Optional[float] = None
    status: Optional[List[str]] = None
    cidade: Optional[str] = None
    bairro: Optional[str] = None
    tipo_imovel: Optional[str] = None
    quartos_min: Optional[int] = None
    quartos_max: Optional[int] = None
    incluir_inativos: bool = False
    incluir_historico: bool = False
    ordenacao: str = "relevancia"
    limite: int = 20
    offset: int = 0

# ============================
# REPOSITORY PRINCIPAL
# ============================

class AdvancedSearchRepository:
    """Repository para busca avançada com relacionamentos complexos"""
    
    def __init__(self):
        self.connection = None
    
    def __enter__(self):
        self.connection = get_conexao()
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.connection:
            self.connection.close()
    
    # ============================
    # BUSCA GLOBAL INTELIGENTE
    # ============================
    
    def busca_global_inteligente(self, filtros: FiltroAvancado) -> Dict[str, Any]:
        """
        Busca global inteligente com análise de contexto e relacionamentos
        """
        try:
            cursor = self.connection.cursor()
            
            # Analisar termo de busca para determinar tipo
            tipo_busca = self._analisar_termo_busca(filtros.termo_busca)
            
            resultados = {
                'termo_busca': filtros.termo_busca,
                'tipo_detectado': tipo_busca,
                'total_resultados': 0,
                'tempo_execucao': 0,
                'resultados_por_tipo': {},
                'relacionamentos': {},
                'sugestoes': []
            }
            
            inicio = datetime.now()
            
            # Buscar em cada entidade
            entidades_buscar = filtros.entidades or [e.value for e in TipoEntidade]
            
            for entidade in entidades_buscar:
                if entidade == TipoEntidade.LOCADORES.value:
                    resultados['resultados_por_tipo']['locadores'] = self._buscar_locadores_avancado(filtros)
                elif entidade == TipoEntidade.LOCATARIOS.value:
                    resultados['resultados_por_tipo']['locatarios'] = self._buscar_locatarios_avancado(filtros)
                elif entidade == TipoEntidade.IMOVEIS.value:
                    resultados['resultados_por_tipo']['imoveis'] = self._buscar_imoveis_avancado(filtros)
                elif entidade == TipoEntidade.CONTRATOS.value:
                    resultados['resultados_por_tipo']['contratos'] = self._buscar_contratos_avancado(filtros)
            
            # Buscar relacionamentos entre resultados
            resultados['relacionamentos'] = self._buscar_relacionamentos(resultados['resultados_por_tipo'])
            
            # Gerar sugestões baseadas nos resultados
            resultados['sugestoes'] = self._gerar_sugestoes(filtros.termo_busca, resultados)
            
            # Calcular totais
            total = sum(len(dados.get('dados', [])) for dados in resultados['resultados_por_tipo'].values())
            resultados['total_resultados'] = total
            resultados['tempo_execucao'] = (datetime.now() - inicio).total_seconds()
            
            cursor.close()
            return resultados
            
        except Exception as e:
            print(f"Erro na busca global inteligente: {e}")
            return self._resultado_erro(str(e))
    
    def _analisar_termo_busca(self, termo: str) -> str:
        """Analisa o termo de busca para determinar o tipo mais provável"""
        if not termo:
            return "geral"
        
        termo = termo.strip().lower()
        
        # CPF/CNPJ
        if self._e_cpf_cnpj(termo):
            return "documento"
        
        # Telefone
        if self._e_telefone(termo):
            return "telefone"
        
        # Email
        if "@" in termo and "." in termo:
            return "email"
        
        # CEP
        if self._e_cep(termo):
            return "endereco"
        
        # Valor monetário
        if termo.replace(".", "").replace(",", "").replace("r$", "").replace(" ", "").isdigit():
            return "valor"
        
        return "texto"
    
    def _e_cpf_cnpj(self, termo: str) -> bool:
        """Verifica se o termo é um CPF ou CNPJ"""
        numeros = ''.join(filter(str.isdigit, termo))
        return len(numeros) in [11, 14]
    
    def _e_telefone(self, termo: str) -> bool:
        """Verifica se o termo é um telefone"""
        numeros = ''.join(filter(str.isdigit, termo))
        return len(numeros) in [10, 11] and termo.count('(') <= 1
    
    def _e_cep(self, termo: str) -> bool:
        """Verifica se o termo é um CEP"""
        numeros = ''.join(filter(str.isdigit, termo))
        return len(numeros) == 8
    
    # ============================
    # BUSCA POR ENTIDADE ESPECÍFICA
    # ============================
    
    def _buscar_locadores_avancado(self, filtros: FiltroAvancado) -> Dict[str, Any]:
        """Busca avançada de locadores com relacionamentos"""
        try:
            cursor = self.connection.cursor()
            
            query = """
            SELECT 
                l.*,
                -- Estatísticas de imóveis
                (SELECT COUNT(*) FROM imoveis i WHERE i.locador_id = l.id AND i.ativo = 1) as total_imoveis,
                (SELECT COUNT(*) FROM imoveis i WHERE i.locador_id = l.id AND i.status = 'DISPONIVEL') as imoveis_disponiveis,
                (SELECT COUNT(*) FROM imoveis i WHERE i.locador_id = l.id AND i.status = 'OCUPADO') as imoveis_ocupados,
                
                -- Estatísticas de contratos
                (SELECT COUNT(*) FROM contratos c 
                 JOIN imoveis i ON c.imovel_id = i.id 
                 WHERE i.locador_id = l.id AND c.status = 'ATIVO') as contratos_ativos,
                
                -- Dados financeiros
                (SELECT SUM(i.valor_aluguel) FROM imoveis i 
                 JOIN contratos c ON i.id = c.imovel_id 
                 WHERE i.locador_id = l.id AND c.status = 'ATIVO') as receita_mensal_bruta,
                
                (SELECT AVG(av.nota_geral) FROM avaliacoes av 
                 JOIN contratos c ON av.contrato_id = c.id 
                 JOIN imoveis i ON c.imovel_id = i.id 
                 WHERE i.locador_id = l.id AND av.avaliado_tipo = 'LOCADOR') as avaliacao_media,
                
                -- Última atividade
                (SELECT TOP 1 ha.data_alteracao FROM historico_alteracoes ha 
                 WHERE ha.entidade_tipo = 'locadores' AND ha.entidade_id = l.id 
                 ORDER BY ha.data_alteracao DESC) as ultima_atividade
                
            FROM locadores l
            WHERE 1=1
            """
            
            params = []
            conditions = []
            
            # Filtros específicos
            if filtros.termo_busca:
                tipo_busca = self._analisar_termo_busca(filtros.termo_busca)
                
                if tipo_busca == "documento":
                    conditions.append("l.cpf_cnpj LIKE ?")
                    params.append(f"%{filtros.termo_busca}%")
                elif tipo_busca == "email":
                    conditions.append("l.email LIKE ?")
                    params.append(f"%{filtros.termo_busca}%")
                elif tipo_busca == "telefone":
                    conditions.append("l.telefone LIKE ?")
                    params.append(f"%{filtros.termo_busca}%")
                else:
                    # Busca textual geral
                    termo_conditions = [
                        "l.nome LIKE ?",
                        "l.cpf_cnpj LIKE ?",
                        "l.telefone LIKE ?",
                        "l.email LIKE ?",
                        "l.endereco_rua LIKE ?",
                        "l.endereco_cidade LIKE ?",
                        "l.profissao LIKE ?"
                    ]
                    conditions.append(f"({' OR '.join(termo_conditions)})")
                    params.extend([f"%{filtros.termo_busca}%" for _ in range(7)])
            
            if not filtros.incluir_inativos:
                conditions.append("l.ativo = 1")
            
            if filtros.cidade:
                conditions.append("l.endereco_cidade LIKE ?")
                params.append(f"%{filtros.cidade}%")
            
            # Aplicar condições
            if conditions:
                query += " AND " + " AND ".join(conditions)
            
            # Ordenação
            order_clause = self._get_order_clause_locadores(filtros.ordenacao)
            query += f" ORDER BY {order_clause}"
            
            # Paginação
            query += f" OFFSET {filtros.offset} ROWS FETCH NEXT {filtros.limite} ROWS ONLY"
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            locadores = []
            for row in rows:
                locador = {
                    'id': row[0],
                    'nome': row[1],
                    'cpf_cnpj': row[2],
                    'telefone': row[4],
                    'email': row[5],
                    'endereco_completo': self._montar_endereco_completo(row),
                    'ativo': bool(row[-12]),  # Ajustar índices conforme schema
                    'data_cadastro': row[-9].isoformat() if row[-9] else None,
                    
                    # Estatísticas
                    'estatisticas': {
                        'total_imoveis': row[-8] or 0,
                        'imoveis_disponiveis': row[-7] or 0,
                        'imoveis_ocupados': row[-6] or 0,
                        'contratos_ativos': row[-5] or 0,
                        'receita_mensal_bruta': float(row[-4]) if row[-4] else 0.0,
                        'avaliacao_media': float(row[-3]) if row[-3] else 0.0
                    },
                    
                    'ultima_atividade': row[-1].isoformat() if row[-1] else None
                }
                
                # Buscar relacionamentos se solicitado
                if filtros.incluir_historico:
                    locador['relacionamentos'] = self._get_relacionamentos_locador(row[0])
                
                locadores.append(locador)
            
            # Contar total para paginação
            count_query = self._get_count_query(query, conditions, params)
            total = self._execute_count_query(cursor, count_query, params)
            
            cursor.close()
            
            return {
                'dados': locadores,
                'total': total,
                'limite': filtros.limite,
                'offset': filtros.offset,
                'pagina_atual': (filtros.offset // filtros.limite) + 1,
                'total_paginas': (total + filtros.limite - 1) // filtros.limite
            }
            
        except Exception as e:
            print(f"Erro ao buscar locadores: {e}")
            return {'dados': [], 'total': 0, 'erro': str(e)}
    
    def _buscar_locatarios_avancado(self, filtros: FiltroAvancado) -> Dict[str, Any]:
        """Busca avançada de locatários com relacionamentos e histórico"""
        try:
            cursor = self.connection.cursor()
            
            query = """
            SELECT 
                l.*,
                -- Status atual do contrato
                (SELECT TOP 1 
                    CASE 
                        WHEN c.data_fim >= GETDATE() THEN 'ATIVO'
                        WHEN c.data_fim < GETDATE() THEN 'VENCIDO'
                        ELSE 'SEM_CONTRATO'
                    END
                 FROM contratos c 
                 WHERE c.locatario_id = l.id 
                 ORDER BY c.data_inicio DESC) as status_contrato_atual,
                
                -- Imóvel atual
                (SELECT TOP 1 i.endereco_rua + ', ' + ISNULL(i.endereco_numero, '') 
                 FROM contratos c 
                 JOIN imoveis i ON c.imovel_id = i.id
                 WHERE c.locatario_id = l.id AND c.status = 'ATIVO'
                 ORDER BY c.data_inicio DESC) as imovel_atual,
                
                -- Histórico de pagamentos
                (SELECT COUNT(*) FROM pagamentos p 
                 JOIN contratos c ON p.contrato_id = c.id 
                 WHERE c.locatario_id = l.id AND p.status = 'ATRASADO') as pagamentos_atrasados,
                
                (SELECT COUNT(*) FROM pagamentos p 
                 JOIN contratos c ON p.contrato_id = c.id 
                 WHERE c.locatario_id = l.id AND p.status = 'PAGO') as pagamentos_ok,
                
                -- Avaliação média
                (SELECT AVG(av.nota_geral) FROM avaliacoes av 
                 JOIN contratos c ON av.contrato_id = c.id 
                 WHERE c.locatario_id = l.id AND av.avaliado_tipo = 'LOCATARIO') as avaliacao_media,
                
                -- Total de contratos
                (SELECT COUNT(*) FROM contratos WHERE locatario_id = l.id) as total_contratos,
                
                -- Fiadores
                (SELECT COUNT(*) FROM fiadores WHERE locatario_id = l.id AND ativo = 1) as total_fiadores
                
            FROM locatarios l
            WHERE 1=1
            """
            
            params = []
            conditions = []
            
            # Filtros específicos para locatários
            if filtros.termo_busca:
                tipo_busca = self._analisar_termo_busca(filtros.termo_busca)
                
                if tipo_busca == "documento":
                    conditions.append("l.cpf_cnpj LIKE ?")
                    params.append(f"%{filtros.termo_busca}%")
                elif tipo_busca == "email":
                    conditions.append("l.email LIKE ?")
                    params.append(f"%{filtros.termo_busca}%")
                elif tipo_busca == "telefone":
                    conditions.append("(l.telefone LIKE ? OR l.telefone_alternativo LIKE ?)")
                    params.extend([f"%{filtros.termo_busca}%", f"%{filtros.termo_busca}%"])
                else:
                    # Busca textual geral
                    termo_conditions = [
                        "l.nome LIKE ?",
                        "l.cpf_cnpj LIKE ?",
                        "l.telefone LIKE ?",
                        "l.email LIKE ?",
                        "l.profissao LIKE ?",
                        "l.empresa LIKE ?"
                    ]
                    conditions.append(f"({' OR '.join(termo_conditions)})")
                    params.extend([f"%{filtros.termo_busca}%" for _ in range(6)])
            
            if filtros.status:
                status_conditions = []
                for status in filtros.status:
                    if status == 'ativo':
                        status_conditions.append("l.status_atual = 'ATIVO'")
                    elif status == 'inativo':
                        status_conditions.append("l.status_atual IN ('INATIVO', 'BLOQUEADO')")
                
                if status_conditions:
                    conditions.append(f"({' OR '.join(status_conditions)})")
            
            # Aplicar condições
            if conditions:
                query += " AND " + " AND ".join(conditions)
            
            # Ordenação
            order_clause = self._get_order_clause_locatarios(filtros.ordenacao)
            query += f" ORDER BY {order_clause}"
            
            # Paginação
            query += f" OFFSET {filtros.offset} ROWS FETCH NEXT {filtros.limite} ROWS ONLY"
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            locatarios = []
            for row in rows:
                locatario = {
                    'id': row[0],
                    'nome': row[1],
                    'cpf_cnpj': row[2],
                    'telefone': row[4],
                    'telefone_alternativo': row[5],
                    'email': row[6],
                    'profissao': row[10],
                    'empresa': row[11],
                    'renda_mensal': float(row[12]) if row[12] else None,
                    'status_atual': row[-11],
                    'score_interno': row[-15] or 500,
                    
                    # Informações calculadas
                    'status_contrato_atual': row[-10],
                    'imovel_atual': row[-9],
                    
                    # Histórico financeiro
                    'historico_financeiro': {
                        'pagamentos_atrasados': row[-8] or 0,
                        'pagamentos_ok': row[-7] or 0,
                        'percentual_pontualidade': self._calcular_pontualidade(row[-8] or 0, row[-7] or 0)
                    },
                    
                    # Avaliações
                    'avaliacao_media': float(row[-6]) if row[-6] else 0.0,
                    'total_contratos': row[-5] or 0,
                    'total_fiadores': row[-4] or 0,
                }
                
                # Buscar relacionamentos se solicitado
                if filtros.incluir_historico:
                    locatario['relacionamentos'] = self._get_relacionamentos_locatario(row[0])
                    locatario['historico_contratos'] = self._get_historico_contratos_locatario(row[0])
                
                locatarios.append(locatario)
            
            # Contar total
            count_query = self._get_count_query(query, conditions, params)
            total = self._execute_count_query(cursor, count_query, params)
            
            cursor.close()
            
            return {
                'dados': locatarios,
                'total': total,
                'limite': filtros.limite,
                'offset': filtros.offset
            }
            
        except Exception as e:
            print(f"Erro ao buscar locatários: {e}")
            return {'dados': [], 'total': 0, 'erro': str(e)}
    
    def _buscar_imoveis_avancado(self, filtros: FiltroAvancado) -> Dict[str, Any]:
        """Busca avançada de imóveis com todas as informações relacionadas"""
        try:
            cursor = self.connection.cursor()
            
            query = """
            SELECT 
                i.*,
                l.nome as locador_nome,
                l.telefone as locador_telefone,
                
                -- Contrato atual
                (SELECT TOP 1 c.id FROM contratos c 
                 WHERE c.imovel_id = i.id AND c.status = 'ATIVO' 
                 ORDER BY c.data_inicio DESC) as contrato_atual_id,
                
                (SELECT TOP 1 lct.nome FROM contratos c 
                 JOIN locatarios lct ON c.locatario_id = lct.id
                 WHERE c.imovel_id = i.id AND c.status = 'ATIVO' 
                 ORDER BY c.data_inicio DESC) as locatario_atual,
                
                -- Estatísticas
                (SELECT COUNT(*) FROM contratos WHERE imovel_id = i.id) as total_contratos,
                (SELECT COUNT(*) FROM manutencoes WHERE imovel_id = i.id) as total_manutencoes,
                (SELECT SUM(valor_realizado) FROM manutencoes 
                 WHERE imovel_id = i.id AND YEAR(data_execucao) = YEAR(GETDATE())) as gastos_manutencao_ano,
                
                -- Avaliação média
                (SELECT AVG(nota_geral) FROM avaliacoes av 
                 JOIN contratos c ON av.contrato_id = c.id 
                 WHERE c.imovel_id = i.id AND av.avaliado_tipo = 'IMOVEL') as avaliacao_media,
                
                -- Ocupação
                (SELECT COUNT(*) FROM contratos 
                 WHERE imovel_id = i.id AND status = 'ATIVO') as ocupado,
                
                -- Próximo vencimento
                (SELECT TOP 1 data_fim FROM contratos 
                 WHERE imovel_id = i.id AND status = 'ATIVO' 
                 ORDER BY data_fim) as proximo_vencimento,
                
                -- Fotos
                (SELECT COUNT(*) FROM imoveis_fotos WHERE imovel_id = i.id) as total_fotos,
                (SELECT TOP 1 arquivo_url FROM imoveis_fotos 
                 WHERE imovel_id = i.id AND foto_principal = 1) as foto_principal_url
                
            FROM imoveis i
            LEFT JOIN locadores l ON i.locador_id = l.id
            WHERE 1=1
            """
            
            params = []
            conditions = []
            
            # Filtros específicos para imóveis
            if filtros.termo_busca:
                tipo_busca = self._analisar_termo_busca(filtros.termo_busca)
                
                if tipo_busca == "endereco":
                    conditions.append("(i.endereco_cep LIKE ? OR i.endereco_rua LIKE ? OR i.endereco_bairro LIKE ?)")
                    params.extend([f"%{filtros.termo_busca}%" for _ in range(3)])
                elif tipo_busca == "valor":
                    valor = self._extrair_valor_monetario(filtros.termo_busca)
                    if valor:
                        conditions.append("i.valor_aluguel BETWEEN ? AND ?")
                        params.extend([valor * 0.8, valor * 1.2])  # Range de 20%
                else:
                    # Busca textual geral
                    termo_conditions = [
                        "i.endereco_rua LIKE ?",
                        "i.endereco_bairro LIKE ?",
                        "i.endereco_cidade LIKE ?",
                        "i.tipo LIKE ?",
                        "i.titulo LIKE ?",
                        "i.descricao LIKE ?",
                        "l.nome LIKE ?"
                    ]
                    conditions.append(f"({' OR '.join(termo_conditions)})")
                    params.extend([f"%{filtros.termo_busca}%" for _ in range(7)])
            
            # Filtros específicos
            if filtros.cidade:
                conditions.append("i.endereco_cidade LIKE ?")
                params.append(f"%{filtros.cidade}%")
            
            if filtros.bairro:
                conditions.append("i.endereco_bairro LIKE ?")
                params.append(f"%{filtros.bairro}%")
            
            if filtros.tipo_imovel:
                conditions.append("i.tipo = ?")
                params.append(filtros.tipo_imovel)
            
            if filtros.valor_min:
                conditions.append("i.valor_aluguel >= ?")
                params.append(filtros.valor_min)
            
            if filtros.valor_max:
                conditions.append("i.valor_aluguel <= ?")
                params.append(filtros.valor_max)
            
            if filtros.quartos_min:
                conditions.append("i.quartos >= ?")
                params.append(filtros.quartos_min)
            
            if filtros.quartos_max:
                conditions.append("i.quartos <= ?")
                params.append(filtros.quartos_max)
            
            if filtros.status:
                status_conditions = []
                for status in filtros.status:
                    if status.upper() in ['DISPONIVEL', 'OCUPADO', 'MANUTENCAO', 'INDISPONIVEL']:
                        status_conditions.append("i.status = ?")
                        params.append(status.upper())
                
                if status_conditions:
                    conditions.append(f"({' OR '.join(status_conditions)})")
            
            if not filtros.incluir_inativos:
                conditions.append("i.ativo = 1")
            
            # Aplicar condições
            if conditions:
                query += " AND " + " AND ".join(conditions)
            
            # Ordenação
            order_clause = self._get_order_clause_imoveis(filtros.ordenacao)
            query += f" ORDER BY {order_clause}"
            
            # Paginação
            query += f" OFFSET {filtros.offset} ROWS FETCH NEXT {filtros.limite} ROWS ONLY"
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            imoveis = []
            for row in rows:
                imovel = {
                    'id': row[0],
                    'endereco_completo': self._montar_endereco_completo_imovel(row),
                    'tipo': row[8],
                    'finalidade': row[9],
                    'area_total': float(row[10]) if row[10] else None,
                    'area_construida': float(row[11]) if row[11] else None,
                    'quartos': row[12] or 0,
                    'suites': row[13] or 0,
                    'banheiros': row[14] or 0,
                    'vagas_garagem': row[15] or 0,
                    'valor_aluguel': float(row[16]) if row[16] else 0,
                    'valor_condominio': float(row[17]) if row[17] else 0,
                    'valor_iptu': float(row[18]) if row[18] else 0,
                    'status': row[-20],
                    
                    # Locador
                    'locador': {
                        'nome': row[-17],
                        'telefone': row[-16]
                    },
                    
                    # Situação atual
                    'situacao_atual': {
                        'contrato_id': row[-15],
                        'locatario_atual': row[-14],
                        'ocupado': bool(row[-9]),
                        'proximo_vencimento': row[-6].isoformat() if row[-6] else None
                    },
                    
                    # Estatísticas
                    'estatisticas': {
                        'total_contratos': row[-13] or 0,
                        'total_manutencoes': row[-12] or 0,
                        'gastos_manutencao_ano': float(row[-11]) if row[-11] else 0,
                        'avaliacao_media': float(row[-10]) if row[-10] else 0,
                        'total_fotos': row[-5] or 0
                    },
                    
                    # Mídia
                    'foto_principal_url': row[-4],
                    
                    # Comodidades
                    'comodidades': self._extrair_comodidades_imovel(row)
                }
                
                # Buscar relacionamentos se solicitado
                if filtros.incluir_historico:
                    imovel['relacionamentos'] = self._get_relacionamentos_imovel(row[0])
                    imovel['historico_manutencoes'] = self._get_historico_manutencoes(row[0])
                    imovel['historico_valores'] = self._get_historico_valores_imovel(row[0])
                
                imoveis.append(imovel)
            
            # Contar total
            count_query = self._get_count_query(query, conditions, params)
            total = self._execute_count_query(cursor, count_query, params)
            
            cursor.close()
            
            return {
                'dados': imoveis,
                'total': total,
                'limite': filtros.limite,
                'offset': filtros.offset
            }
            
        except Exception as e:
            print(f"Erro ao buscar imóveis: {e}")
            return {'dados': [], 'total': 0, 'erro': str(e)}
    
    # ============================
    # MÉTODOS AUXILIARES
    # ============================
    
    def _montar_endereco_completo(self, row) -> str:
        """Monta endereço completo do locador/locatário"""
        endereco_parts = []
        if row[7]:  # endereco_rua
            endereco_parts.append(row[7])
        if row[8]:  # endereco_numero
            endereco_parts.append(row[8])
        if row[10]:  # endereco_bairro
            endereco_parts.append(row[10])
        if row[11]:  # endereco_cidade
            endereco_parts.append(row[11])
        
        return ", ".join(endereco_parts) if endereco_parts else ""
    
    def _montar_endereco_completo_imovel(self, row) -> str:
        """Monta endereço completo do imóvel"""
        endereco_parts = []
        if row[2]:  # endereco_rua
            endereco_parts.append(row[2])
        if row[3]:  # endereco_numero
            endereco_parts.append(row[3])
        if row[5]:  # endereco_bairro
            endereco_parts.append(row[5])
        if row[6]:  # endereco_cidade
            endereco_parts.append(row[6])
        
        return ", ".join(endereco_parts) if endereco_parts else ""
    
    def _extrair_valor_monetario(self, termo: str) -> Optional[float]:
        """Extrai valor monetário de um termo de busca"""
        try:
            # Remove símbolos e converte
            valor_str = termo.replace("R$", "").replace("r$", "").replace(".", "").replace(",", ".").strip()
            return float(valor_str)
        except:
            return None
    
    def _calcular_pontualidade(self, atrasados: int, ok: int) -> float:
        """Calcula percentual de pontualidade"""
        total = atrasados + ok
        if total == 0:
            return 100.0
        return (ok / total) * 100
    
    def _extrair_comodidades_imovel(self, row) -> Dict[str, bool]:
        """Extrai comodidades do imóvel"""
        # Mapear índices das colunas de comodidades conforme schema
        return {
            'mobiliado': bool(row[22]) if len(row) > 22 else False,
            'ar_condicionado': bool(row[23]) if len(row) > 23 else False,
            'piscina': bool(row[26]) if len(row) > 26 else False,
            'pet_friendly': bool(row[34]) if len(row) > 34 else False,
            # Adicionar outras conforme necessário
        }
    
    def _get_order_clause_locadores(self, ordenacao: str) -> str:
        """Retorna cláusula ORDER BY para locadores"""
        order_map = {
            'nome': 'l.nome ASC',
            'data_cadastro': 'l.data_cadastro DESC',
            'receita': 'receita_mensal_bruta DESC',
            'imoveis': 'total_imoveis DESC',
            'avaliacao': 'avaliacao_media DESC',
            'relevancia': 'l.nome ASC'  # Default
        }
        return order_map.get(ordenacao, order_map['relevancia'])
    
    def _get_order_clause_locatarios(self, ordenacao: str) -> str:
        """Retorna cláusula ORDER BY para locatários"""
        order_map = {
            'nome': 'l.nome ASC',
            'score': 'l.score_interno DESC',
            'avaliacao': 'avaliacao_media DESC',
            'data_cadastro': 'l.data_cadastro DESC',
            'relevancia': 'l.nome ASC'
        }
        return order_map.get(ordenacao, order_map['relevancia'])
    
    def _get_order_clause_imoveis(self, ordenacao: str) -> str:
        """Retorna cláusula ORDER BY para imóveis"""
        order_map = {
            'endereco': 'i.endereco_cidade ASC, i.endereco_bairro ASC',
            'valor': 'i.valor_aluguel ASC',
            'valor_desc': 'i.valor_aluguel DESC',
            'area': 'i.area_total DESC',
            'quartos': 'i.quartos DESC',
            'avaliacao': 'avaliacao_media DESC',
            'relevancia': 'i.endereco_cidade ASC'
        }
        return order_map.get(ordenacao, order_map['relevancia'])
    
    def _get_count_query(self, original_query: str, conditions: List[str], params: List) -> str:
        """Gera query de contagem"""
        # Extrair FROM e WHERE da query original
        from_index = original_query.upper().find('FROM')
        order_index = original_query.upper().find('ORDER BY')
        
        if order_index == -1:
            order_index = original_query.upper().find('OFFSET')
        
        if from_index != -1:
            if order_index != -1:
                from_where_clause = original_query[from_index:order_index]
            else:
                from_where_clause = original_query[from_index:]
            
            return f"SELECT COUNT(*) {from_where_clause}"
        
        return "SELECT COUNT(*) FROM (SELECT 1) as temp"
    
    def _execute_count_query(self, cursor, count_query: str, params: List) -> int:
        """Executa query de contagem"""
        try:
            cursor.execute(count_query, params)
            result = cursor.fetchone()
            return result[0] if result else 0
        except:
            return 0
    
    def _resultado_erro(self, erro: str) -> Dict[str, Any]:
        """Retorna estrutura padrão para erro"""
        return {
            'termo_busca': '',
            'tipo_detectado': 'erro',
            'total_resultados': 0,
            'resultados_por_tipo': {},
            'relacionamentos': {},
            'sugestoes': [],
            'erro': erro
        }
    
    # ============================
    # BUSCA DE RELACIONAMENTOS
    # ============================
    
    def _buscar_relacionamentos(self, resultados_por_tipo: Dict) -> Dict[str, Any]:
        """Busca relacionamentos entre as entidades encontradas"""
        relacionamentos = {
            'locador_imoveis': {},
            'locador_contratos': {},
            'locatario_contratos': {},
            'imovel_contratos': {},
            'cross_references': []
        }
        
        try:
            cursor = self.connection.cursor()
            
            # IDs encontrados
            locadores_ids = [item['id'] for item in resultados_por_tipo.get('locadores', {}).get('dados', [])]
            locatarios_ids = [item['id'] for item in resultados_por_tipo.get('locatarios', {}).get('dados', [])]
            imoveis_ids = [item['id'] for item in resultados_por_tipo.get('imoveis', {}).get('dados', [])]
            contratos_ids = [item['id'] for item in resultados_por_tipo.get('contratos', {}).get('dados', [])]
            
            # Buscar relacionamentos cruzados
            if locadores_ids:
                # Imóveis dos locadores encontrados
                placeholders = ','.join(['?' for _ in locadores_ids])
                cursor.execute(f"""
                    SELECT locador_id, COUNT(*) as total_imoveis, 
                           COUNT(CASE WHEN status = 'OCUPADO' THEN 1 END) as imoveis_ocupados
                    FROM imoveis 
                    WHERE locador_id IN ({placeholders}) AND ativo = 1
                    GROUP BY locador_id
                """, locadores_ids)
                
                for row in cursor.fetchall():
                    relacionamentos['locador_imoveis'][row[0]] = {
                        'total_imoveis': row[1],
                        'imoveis_ocupados': row[2]
                    }
            
            cursor.close()
            
        except Exception as e:
            print(f"Erro ao buscar relacionamentos: {e}")
        
        return relacionamentos
    
    def _gerar_sugestoes(self, termo_busca: str, resultados: Dict) -> List[str]:
        """Gera sugestões baseadas nos resultados"""
        sugestoes = []
        
        if not termo_busca or len(termo_busca) < 2:
            return sugestoes
        
        try:
            cursor = self.connection.cursor()
            
            # Sugestões de nomes similares
            cursor.execute("""
                SELECT DISTINCT nome FROM (
                    SELECT nome FROM locadores WHERE nome LIKE ? AND ativo = 1
                    UNION ALL
                    SELECT nome FROM locatarios WHERE nome LIKE ? AND status_atual = 'ATIVO'
                ) as nomes
                ORDER BY nome
            """, [f"%{termo_busca}%", f"%{termo_busca}%"])
            
            nomes = [row[0] for row in cursor.fetchmany(5)]
            sugestoes.extend(nomes)
            
            # Sugestões de endereços
            cursor.execute("""
                SELECT DISTINCT endereco_cidade + ', ' + endereco_bairro as endereco
                FROM imoveis 
                WHERE (endereco_cidade LIKE ? OR endereco_bairro LIKE ?) AND ativo = 1
                ORDER BY endereco
            """, [f"%{termo_busca}%", f"%{termo_busca}%"])
            
            enderecos = [row[0] for row in cursor.fetchmany(3)]
            sugestoes.extend(enderecos)
            
            cursor.close()
            
        except Exception as e:
            print(f"Erro ao gerar sugestões: {e}")
        
        return list(set(sugestoes))[:10]  # Remove duplicatas e limita
    
    def _buscar_contratos_avancado(self, filtros: FiltroAvancado) -> Dict[str, Any]:
        """Busca avançada de contratos com todas as informações relacionadas"""
        try:
            cursor = self.connection.cursor()
            
            query = """
            SELECT 
                c.*,
                l.nome as locador_nome,
                lc.nome as locatario_nome,
                i.endereco_rua + ', ' + ISNULL(i.endereco_numero, '') as imovel_endereco,
                i.tipo as imovel_tipo,
                
                -- Status calculado
                CASE 
                    WHEN GETDATE() > c.data_fim THEN 'VENCIDO'
                    WHEN DATEDIFF(day, GETDATE(), c.data_fim) <= 30 THEN 'VENCENDO'
                    ELSE c.status 
                END as status_calculado,
                
                DATEDIFF(day, GETDATE(), c.data_fim) as dias_vencimento,
                
                -- Pagamentos
                (SELECT COUNT(*) FROM pagamentos p WHERE p.contrato_id = c.id AND p.status = 'ATRASADO') as pagamentos_atrasados,
                (SELECT COUNT(*) FROM pagamentos p WHERE p.contrato_id = c.id AND p.status = 'PAGO') as pagamentos_ok,
                
                -- Avaliação
                (SELECT AVG(nota_geral) FROM avaliacoes WHERE contrato_id = c.id) as avaliacao_media,
                
                -- Manutenções
                (SELECT COUNT(*) FROM manutencoes m WHERE m.contrato_id = c.id) as total_manutencoes
                
            FROM contratos c
            LEFT JOIN locadores l ON c.locador_id = l.id
            LEFT JOIN locatarios lc ON c.locatario_id = lc.id
            LEFT JOIN imoveis i ON c.imovel_id = i.id
            WHERE 1=1
            """
            
            params = []
            conditions = []
            
            # Filtros específicos para contratos
            if filtros.termo_busca:
                tipo_busca = self._analisar_termo_busca(filtros.termo_busca)
                
                if tipo_busca == "valor":
                    valor = self._extrair_valor_monetario(filtros.termo_busca)
                    if valor:
                        conditions.append("c.valor_aluguel BETWEEN ? AND ?")
                        params.extend([valor * 0.8, valor * 1.2])
                elif tipo_busca == "documento":
                    conditions.append("(l.cpf_cnpj LIKE ? OR lc.cpf_cnpj LIKE ?)")
                    params.extend([f"%{filtros.termo_busca}%", f"%{filtros.termo_busca}%"])
                else:
                    # Busca textual geral
                    termo_conditions = [
                        "l.nome LIKE ?",
                        "lc.nome LIKE ?",
                        "i.endereco_rua LIKE ?",
                        "i.endereco_bairro LIKE ?",
                        "c.observacoes LIKE ?"
                    ]
                    conditions.append(f"({' OR '.join(termo_conditions)})")
                    params.extend([f"%{filtros.termo_busca}%" for _ in range(5)])
            
            # Filtros de data
            if filtros.data_inicio:
                conditions.append("c.data_inicio >= ?")
                params.append(filtros.data_inicio)
            
            if filtros.data_fim:
                conditions.append("c.data_fim <= ?")
                params.append(filtros.data_fim)
            
            # Filtros de valor
            if filtros.valor_min:
                conditions.append("c.valor_aluguel >= ?")
                params.append(filtros.valor_min)
            
            if filtros.valor_max:
                conditions.append("c.valor_aluguel <= ?")
                params.append(filtros.valor_max)
            
            # Filtros de status
            if filtros.status:
                status_conditions = []
                for status in filtros.status:
                    if status.upper() in ['ATIVO', 'ENCERRADO', 'RESCINDIDO', 'RENOVADO', 'SUSPENSO']:
                        status_conditions.append("c.status = ?")
                        params.append(status.upper())
                
                if status_conditions:
                    conditions.append(f"({' OR '.join(status_conditions)})")
            
            # Aplicar condições
            if conditions:
                query += " AND " + " AND ".join(conditions)
            
            # Ordenação
            order_clause = self._get_order_clause_contratos(filtros.ordenacao)
            query += f" ORDER BY {order_clause}"
            
            # Paginação
            query += f" OFFSET {filtros.offset} ROWS FETCH NEXT {filtros.limite} ROWS ONLY"
            
            cursor.execute(query, params)
            rows = cursor.fetchall()
            
            contratos = []
            for row in rows:
                contrato = {
                    'id': row[0],
                    'data_inicio': row[6].isoformat() if row[6] else None,
                    'data_fim': row[7].isoformat() if row[7] else None,
                    'vencimento_dia': row[9],
                    'valor_aluguel': float(row[10]) if row[10] else 0,
                    'valor_condominio': float(row[11]) if row[11] else 0,
                    'valor_iptu': float(row[12]) if row[12] else 0,
                    'status': row[28],
                    'status_calculado': row[33],
                    'dias_vencimento': row[34],
                    
                    # Participantes
                    'locador': row[31],
                    'locatario': row[32],
                    'imovel': {
                        'endereco': row[33],
                        'tipo': row[34]
                    },
                    
                    # Garantias
                    'garantia': {
                        'tipo': row[16],
                        'seguradora': row[19] if row[19] else None,
                        'apolice': row[20] if row[20] else None
                    },
                    
                    # Estatísticas
                    'estatisticas': {
                        'pagamentos_atrasados': row[35] or 0,
                        'pagamentos_ok': row[36] or 0,
                        'avaliacao_media': float(row[37]) if row[37] else 0,
                        'total_manutencoes': row[38] or 0,
                        'percentual_pontualidade': self._calcular_pontualidade(row[35] or 0, row[36] or 0)
                    }
                }
                
                # Buscar relacionamentos se solicitado
                if filtros.incluir_historico:
                    contrato['relacionamentos'] = self._get_relacionamentos_contrato(row[0])
                    contrato['historico_pagamentos'] = self._get_historico_pagamentos_contrato(row[0])
                
                contratos.append(contrato)
            
            # Contar total
            count_query = self._get_count_query(query, conditions, params)
            total = self._execute_count_query(cursor, count_query, params)
            
            cursor.close()
            
            return {
                'dados': contratos,
                'total': total,
                'limite': filtros.limite,
                'offset': filtros.offset
            }
            
        except Exception as e:
            print(f"Erro ao buscar contratos: {e}")
            return {'dados': [], 'total': 0, 'erro': str(e)}
    
    def _get_order_clause_contratos(self, ordenacao: str) -> str:
        """Retorna cláusula ORDER BY para contratos"""
        order_map = {
            'data_inicio': 'c.data_inicio DESC',
            'data_fim': 'c.data_fim DESC',
            'valor': 'c.valor_aluguel DESC',
            'locatario': 'lc.nome ASC',
            'locador': 'l.nome ASC',
            'status': 'status_calculado ASC',
            'vencimento': 'dias_vencimento ASC',
            'relevancia': 'c.data_inicio DESC'
        }
        return order_map.get(ordenacao, order_map['relevancia'])

    # ============================
    # MÉTODOS DE RELACIONAMENTOS ESPECÍFICOS
    # ============================
    
    def _get_relacionamentos_locador(self, locador_id: int) -> Dict[str, Any]:
        """Busca todos os relacionamentos de um locador"""
        relacionamentos = {
            'imoveis': [],
            'contratos_ativos': [],
            'contratos_historicos': [],
            'estatisticas': {}
        }
        
        try:
            cursor = self.connection.cursor()
            
            # Imóveis do locador
            cursor.execute("""
                SELECT id, endereco_rua + ', ' + ISNULL(endereco_numero, '') as endereco,
                       tipo, valor_aluguel, status
                FROM imoveis 
                WHERE locador_id = ? AND ativo = 1
                ORDER BY endereco_cidade, endereco_bairro
            """, [locador_id])
            
            relacionamentos['imoveis'] = [
                {
                    'id': row[0],
                    'endereco': row[1],
                    'tipo': row[2],
                    'valor_aluguel': float(row[3]) if row[3] else 0,
                    'status': row[4]
                }
                for row in cursor.fetchall()
            ]
            
            # Contratos ativos
            cursor.execute("""
                SELECT c.id, c.data_inicio, c.data_fim, c.valor_aluguel,
                       lc.nome as locatario, i.endereco_rua + ', ' + ISNULL(i.endereco_numero, '') as imovel
                FROM contratos c
                JOIN locatarios lc ON c.locatario_id = lc.id
                JOIN imoveis i ON c.imovel_id = i.id
                WHERE i.locador_id = ? AND c.status = 'ATIVO'
                ORDER BY c.data_inicio DESC
            """, [locador_id])
            
            relacionamentos['contratos_ativos'] = [
                {
                    'id': row[0],
                    'data_inicio': row[1].isoformat() if row[1] else None,
                    'data_fim': row[2].isoformat() if row[2] else None,
                    'valor_aluguel': float(row[3]) if row[3] else 0,
                    'locatario': row[4],
                    'imovel': row[5]
                }
                for row in cursor.fetchall()
            ]
            
            cursor.close()
            
        except Exception as e:
            print(f"Erro ao buscar relacionamentos do locador: {e}")
        
        return relacionamentos
    
    def _get_relacionamentos_locatario(self, locatario_id: int) -> Dict[str, Any]:
        """Busca todos os relacionamentos de um locatário"""
        relacionamentos = {
            'contratos': [],
            'fiadores': [],
            'historico_pagamentos': [],
            'avaliacoes': []
        }
        
        try:
            cursor = self.connection.cursor()
            
            # Contratos do locatário
            cursor.execute("""
                SELECT c.id, c.data_inicio, c.data_fim, c.valor_aluguel, c.status,
                       i.endereco_rua + ', ' + ISNULL(i.endereco_numero, '') as imovel,
                       l.nome as locador
                FROM contratos c
                JOIN imoveis i ON c.imovel_id = i.id
                JOIN locadores l ON i.locador_id = l.id
                WHERE c.locatario_id = ?
                ORDER BY c.data_inicio DESC
            """, [locatario_id])
            
            relacionamentos['contratos'] = [
                {
                    'id': row[0],
                    'data_inicio': row[1].isoformat() if row[1] else None,
                    'data_fim': row[2].isoformat() if row[2] else None,
                    'valor_aluguel': float(row[3]) if row[3] else 0,
                    'status': row[4],
                    'imovel': row[5],
                    'locador': row[6]
                }
                for row in cursor.fetchall()
            ]
            
            # Fiadores
            cursor.execute("""
                SELECT nome, cpf_cnpj, telefone, tipo_relacao, parentesco
                FROM fiadores 
                WHERE locatario_id = ? AND ativo = 1
            """, [locatario_id])
            
            relacionamentos['fiadores'] = [
                {
                    'nome': row[0],
                    'cpf_cnpj': row[1],
                    'telefone': row[2],
                    'tipo_relacao': row[3],
                    'parentesco': row[4]
                }
                for row in cursor.fetchall()
            ]
            
            cursor.close()
            
        except Exception as e:
            print(f"Erro ao buscar relacionamentos do locatário: {e}")
        
        return relacionamentos
    
    def _get_relacionamentos_imovel(self, imovel_id: int) -> Dict[str, Any]:
        """Busca todos os relacionamentos de um imóvel"""
        relacionamentos = {
            'locador': {},
            'contratos': [],
            'manutencoes': [],
            'fotos': []
        }
        
        try:
            cursor = self.connection.cursor()
            
            # Locador do imóvel
            cursor.execute("""
                SELECT l.nome, l.telefone, l.email
                FROM locadores l
                JOIN imoveis i ON l.id = i.locador_id
                WHERE i.id = ?
            """, [imovel_id])
            
            row = cursor.fetchone()
            if row:
                relacionamentos['locador'] = {
                    'nome': row[0],
                    'telefone': row[1],
                    'email': row[2]
                }
            
            # Contratos do imóvel
            cursor.execute("""
                SELECT c.id, c.data_inicio, c.data_fim, c.status, c.valor_aluguel,
                       lc.nome as locatario
                FROM contratos c
                JOIN locatarios lc ON c.locatario_id = lc.id
                WHERE c.imovel_id = ?
                ORDER BY c.data_inicio DESC
            """, [imovel_id])
            
            relacionamentos['contratos'] = [
                {
                    'id': row[0],
                    'data_inicio': row[1].isoformat() if row[1] else None,
                    'data_fim': row[2].isoformat() if row[2] else None,
                    'status': row[3],
                    'valor_aluguel': float(row[4]) if row[4] else 0,
                    'locatario': row[5]
                }
                for row in cursor.fetchall()
            ]
            
            cursor.close()
            
        except Exception as e:
            print(f"Erro ao buscar relacionamentos do imóvel: {e}")
        
        return relacionamentos
    
    def _get_relacionamentos_contrato(self, contrato_id: int) -> Dict[str, Any]:
        """Busca todos os relacionamentos de um contrato"""
        relacionamentos = {
            'participantes': {},
            'pagamentos': [],
            'manutencoes': [],
            'avaliacoes': []
        }
        
        try:
            cursor = self.connection.cursor()
            
            # Participantes do contrato
            cursor.execute("""
                SELECT l.nome as locador, lc.nome as locatario,
                       i.endereco_rua + ', ' + ISNULL(i.endereco_numero, '') as imovel
                FROM contratos c
                JOIN locadores l ON c.locador_id = l.id
                JOIN locatarios lc ON c.locatario_id = lc.id
                JOIN imoveis i ON c.imovel_id = i.id
                WHERE c.id = ?
            """, [contrato_id])
            
            row = cursor.fetchone()
            if row:
                relacionamentos['participantes'] = {
                    'locador': row[0],
                    'locatario': row[1],
                    'imovel': row[2]
                }
            
            # Resumo de pagamentos
            cursor.execute("""
                SELECT COUNT(*) as total, 
                       COUNT(CASE WHEN status = 'PAGO' THEN 1 END) as pagos,
                       COUNT(CASE WHEN status = 'ATRASADO' THEN 1 END) as atrasados,
                       SUM(CASE WHEN status = 'PAGO' THEN valor_pago ELSE 0 END) as valor_total_pago
                FROM pagamentos 
                WHERE contrato_id = ?
            """, [contrato_id])
            
            row = cursor.fetchone()
            if row:
                relacionamentos['pagamentos'] = {
                    'total': row[0] or 0,
                    'pagos': row[1] or 0,
                    'atrasados': row[2] or 0,
                    'valor_total_pago': float(row[3]) if row[3] else 0
                }
            
            cursor.close()
            
        except Exception as e:
            print(f"Erro ao buscar relacionamentos do contrato: {e}")
        
        return relacionamentos
    
    def _get_historico_contratos_locatario(self, locatario_id: int) -> List[Dict]:
        """Busca histórico detalhado de contratos do locatário"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute("""
                SELECT TOP 10
                    c.id, c.data_inicio, c.data_fim, c.valor_aluguel, c.status,
                    i.endereco_rua + ', ' + ISNULL(i.endereco_numero, '') as endereco,
                    l.nome as locador,
                    DATEDIFF(month, c.data_inicio, ISNULL(c.data_encerramento, c.data_fim)) as duracao_meses
                FROM contratos c
                JOIN imoveis i ON c.imovel_id = i.id
                JOIN locadores l ON i.locador_id = l.id
                WHERE c.locatario_id = ?
                ORDER BY c.data_inicio DESC
            """, [locatario_id])
            
            historico = []
            for row in cursor.fetchall():
                historico.append({
                    'contrato_id': row[0],
                    'data_inicio': row[1].isoformat() if row[1] else None,
                    'data_fim': row[2].isoformat() if row[2] else None,
                    'valor_aluguel': float(row[3]) if row[3] else 0,
                    'status': row[4],
                    'endereco': row[5],
                    'locador': row[6],
                    'duracao_meses': row[7] or 0
                })
            
            cursor.close()
            return historico
            
        except Exception as e:
            print(f"Erro ao buscar histórico de contratos: {e}")
            return []
    
    def _get_historico_manutencoes(self, imovel_id: int) -> List[Dict]:
        """Busca histórico de manutenções do imóvel"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute("""
                SELECT TOP 20
                    tipo, categoria, descricao, valor_realizado, 
                    data_solicitacao, data_execucao, status
                FROM manutencoes 
                WHERE imovel_id = ?
                ORDER BY data_solicitacao DESC
            """, [imovel_id])
            
            manutencoes = []
            for row in cursor.fetchall():
                manutencoes.append({
                    'tipo': row[0],
                    'categoria': row[1],
                    'descricao': row[2],
                    'valor_realizado': float(row[3]) if row[3] else 0,
                    'data_solicitacao': row[4].isoformat() if row[4] else None,
                    'data_execucao': row[5].isoformat() if row[5] else None,
                    'status': row[6]
                })
            
            cursor.close()
            return manutencoes
            
        except Exception as e:
            print(f"Erro ao buscar histórico de manutenções: {e}")
            return []
    
    def _get_historico_valores_imovel(self, imovel_id: int) -> List[Dict]:
        """Busca histórico de valores do imóvel através dos contratos"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute("""
                SELECT 
                    data_inicio, valor_aluguel, valor_condominio, valor_iptu,
                    LEAD(data_inicio) OVER (ORDER BY data_inicio) as proxima_data
                FROM contratos 
                WHERE imovel_id = ?
                ORDER BY data_inicio DESC
            """, [imovel_id])
            
            historico_valores = []
            for row in cursor.fetchall():
                historico_valores.append({
                    'data_vigencia': row[0].isoformat() if row[0] else None,
                    'valor_aluguel': float(row[1]) if row[1] else 0,
                    'valor_condominio': float(row[2]) if row[2] else 0,
                    'valor_iptu': float(row[3]) if row[3] else 0,
                    'ate_data': row[4].isoformat() if row[4] else None
                })
            
            cursor.close()
            return historico_valores
            
        except Exception as e:
            print(f"Erro ao buscar histórico de valores: {e}")
            return []
    
    def _get_historico_pagamentos_contrato(self, contrato_id: int) -> Dict[str, Any]:
        """Busca histórico detalhado de pagamentos do contrato"""
        try:
            cursor = self.connection.cursor()
            
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_pagamentos,
                    COUNT(CASE WHEN status = 'PAGO' THEN 1 END) as pagamentos_realizados,
                    COUNT(CASE WHEN status = 'ATRASADO' THEN 1 END) as pagamentos_atrasados,
                    AVG(CASE WHEN data_pagamento IS NOT NULL AND data_vencimento IS NOT NULL 
                        THEN DATEDIFF(day, data_vencimento, data_pagamento) ELSE 0 END) as media_atraso_dias,
                    SUM(valor_pago) as total_pago,
                    SUM(valor_juros + valor_multa) as total_encargos
                FROM pagamentos 
                WHERE contrato_id = ?
            """, [contrato_id])
            
            row = cursor.fetchone()
            if row:
                historico = {
                    'resumo': {
                        'total_pagamentos': row[0] or 0,
                        'pagamentos_realizados': row[1] or 0,
                        'pagamentos_atrasados': row[2] or 0,
                        'media_atraso_dias': float(row[3]) if row[3] else 0,
                        'total_pago': float(row[4]) if row[4] else 0,
                        'total_encargos': float(row[5]) if row[5] else 0
                    }
                }
                
                # Calcular pontualidade
                if row[0] and row[0] > 0:
                    historico['resumo']['percentual_pontualidade'] = (row[1] / row[0]) * 100
                else:
                    historico['resumo']['percentual_pontualidade'] = 100.0
                
                cursor.close()
                return historico
            
            cursor.close()
            return {'resumo': {}}
            
        except Exception as e:
            print(f"Erro ao buscar histórico de pagamentos: {e}")
            return {'resumo': {}}

# ============================
# FUNÇÕES DE CONVENIÊNCIA
# ============================

def buscar_global(termo_busca: str, **kwargs) -> Dict[str, Any]:
    """Função de conveniência para busca global"""
    filtros = FiltroAvancado(
        termo_busca=termo_busca,
        **kwargs
    )
    
    with AdvancedSearchRepository() as repo:
        return repo.busca_global_inteligente(filtros)

def buscar_com_filtros(filtros_dict: Dict[str, Any]) -> Dict[str, Any]:
    """Função de conveniência para busca com filtros"""
    filtros = FiltroAvancado(**filtros_dict)
    
    with AdvancedSearchRepository() as repo:
        return repo.busca_global_inteligente(filtros)