"""
API para Sistema de Geração de Boletos para Locatários
Implementa a nova lógica de componentes do boleto com cálculos específicos de acréscimos e descontos.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pyodbc
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
import json
import logging
from typing import Dict, List, Optional, Any

# Carregar variáveis de ambiente
load_dotenv()

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

def get_db_connection():
    """Conecta ao banco de dados SQL Server"""
    try:
        connection_string = (
            f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
            f"SERVER={os.getenv('DB_SERVER')};"
            f"DATABASE={os.getenv('DB_DATABASE')};"
            f"UID={os.getenv('DB_USER')};"
            f"PWD={os.getenv('DB_PASSWORD')};"
            f"Encrypt={os.getenv('DB_ENCRYPT')};"
            f"TrustServerCertificate={os.getenv('DB_TRUST_CERT')}"
        )
        return pyodbc.connect(connection_string)
    except Exception as e:
        logger.error(f"Erro ao conectar ao banco: {e}")
        raise

def calcular_acrescimos_atraso(valor_original: Decimal, dias_atraso: int, 
                              indice_correcao: Decimal = Decimal('0')) -> Dict[str, Decimal]:
    """
    Calcula acréscimos por atraso conforme regras:
    - Juros de mora: 1% ao mês (proporcional por dia)
    - Multa: 2% sobre o valor em atraso
    - Correção monetária: IGPM ou IPCA
    """
    if dias_atraso <= 0:
        return {
            'juros': Decimal('0'),
            'multa': Decimal('0'),
            'correcao': Decimal('0'),
            'total_acrescimo': Decimal('0')
        }
    
    # Juros de mora: 1% ao mês (0.033% ao dia aproximadamente)
    juros_diario = Decimal('0.000333')  # 1% / 30 dias
    juros = valor_original * juros_diario * dias_atraso
    
    # Multa: 2% sobre o valor em atraso
    multa = valor_original * Decimal('0.02')
    
    # Correção monetária (baseada no índice fornecido)
    correcao = valor_original * (indice_correcao / 100) if indice_correcao > 0 else Decimal('0')
    
    total_acrescimo = juros + multa + correcao
    
    return {
        'juros': juros.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'multa': multa.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'correcao': correcao.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
        'total_acrescimo': total_acrescimo.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    }

def obter_indice_correcao(nome_indice: str, mes: int, ano: int) -> Decimal:
    """Obtém o índice de correção (IGPM ou IPCA) para o período"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT valor_percentual 
            FROM indices_correcao 
            WHERE nome_indice = ? AND mes = ? AND ano = ?
        """, (nome_indice, mes, ano))
        
        result = cursor.fetchone()
        conn.close()
        
        return Decimal(str(result[0])) if result else Decimal('0')
    except Exception as e:
        logger.error(f"Erro ao obter índice de correção: {e}")
        return Decimal('0')

@app.route('/api/boletos/gerar', methods=['POST'])
def gerar_boleto():
    """
    Gera um novo boleto para um contrato específico
    """
    try:
        data = request.get_json()
        contrato_id = data.get('contrato_id')
        mes_referencia = data.get('mes_referencia')
        ano_referencia = data.get('ano_referencia')
        data_vencimento = data.get('data_vencimento')
        
        if not all([contrato_id, mes_referencia, ano_referencia, data_vencimento]):
            return jsonify({
                'success': False,
                'message': 'Dados obrigatórios não fornecidos'
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Executar stored procedure para gerar boleto
        cursor.execute("""
            EXEC sp_gerar_boleto 
            @contrato_id = ?,
            @mes_referencia = ?,
            @ano_referencia = ?,
            @data_vencimento = ?
        """, (contrato_id, mes_referencia, ano_referencia, data_vencimento))
        
        result = cursor.fetchone()
        conn.commit()
        conn.close()
        
        if result:
            return jsonify({
                'success': True,
                'data': {
                    'boleto_id': result.boleto_id,
                    'valor_total': float(result.valor_total)
                }
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Erro ao gerar boleto'
            }), 500
            
    except Exception as e:
        logger.error(f"Erro ao gerar boleto: {e}")
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@app.route('/api/boletos/<int:boleto_id>', methods=['GET'])
def obter_boleto(boleto_id: int):
    """
    Obtém dados completos de um boleto específico
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscar dados do boleto
        cursor.execute("""
            SELECT * FROM vw_boletos_completos WHERE id = ?
        """, (boleto_id,))
        
        boleto = cursor.fetchone()
        if not boleto:
            return jsonify({
                'success': False,
                'message': 'Boleto não encontrado'
            }), 404
        
        # Buscar componentes do boleto
        cursor.execute("""
            SELECT 
                tipo_componente,
                descricao,
                valor_original,
                valor_final,
                tem_acrescimo,
                percentual_acrescimo,
                valor_acrescimo_juros,
                valor_acrescimo_multa,
                valor_acrescimo_correcao
            FROM componentes_boleto 
            WHERE boleto_id = ?
            ORDER BY 
                CASE tipo_componente
                    WHEN 'ALUGUEL' THEN 1
                    WHEN 'IPTU' THEN 2
                    WHEN 'SEGURO_FIANCA' THEN 3
                    WHEN 'SEGURO_INCENDIO' THEN 4
                    WHEN 'CONDOMINIO' THEN 5
                    WHEN 'ENERGIA' THEN 6
                    WHEN 'GAS' THEN 7
                    WHEN 'FCI' THEN 8
                    ELSE 9
                END
        """, (boleto_id,))
        
        componentes = []
        for row in cursor.fetchall():
            componentes.append({
                'tipo_componente': row.tipo_componente,
                'descricao': row.descricao,
                'valor_original': float(row.valor_original),
                'valor_final': float(row.valor_final),
                'tem_acrescimo': bool(row.tem_acrescimo),
                'percentual_acrescimo': float(row.percentual_acrescimo) if row.percentual_acrescimo else 0,
                'valor_acrescimo_juros': float(row.valor_acrescimo_juros) if row.valor_acrescimo_juros else 0,
                'valor_acrescimo_multa': float(row.valor_acrescimo_multa) if row.valor_acrescimo_multa else 0,
                'valor_acrescimo_correcao': float(row.valor_acrescimo_correcao) if row.valor_acrescimo_correcao else 0
            })
        
        conn.close()
        
        # Converter resultado para dict
        boleto_data = {
            'id': boleto.id,
            'contrato_id': boleto.contrato_id,
            'mes_referencia': boleto.mes_referencia,
            'ano_referencia': boleto.ano_referencia,
            'data_vencimento': boleto.data_vencimento.isoformat() if boleto.data_vencimento else None,
            'data_pagamento': boleto.data_pagamento.isoformat() if boleto.data_pagamento else None,
            'valor_total': float(boleto.valor_total),
            'valor_acrescimos': float(boleto.valor_acrescimos) if boleto.valor_acrescimos else 0,
            'dias_atraso': boleto.dias_atraso_calculado,
            'status_pagamento': boleto.status_pagamento,
            'locatario_nome': boleto.locatario_nome,
            'locatario_cpf': boleto.locatario_cpf,
            'imovel_endereco': boleto.imovel_endereco_completo,
            'componentes': componentes
        }
        
        return jsonify({
            'success': True,
            'data': boleto_data
        })
        
    except Exception as e:
        logger.error(f"Erro ao obter boleto: {e}")
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@app.route('/api/boletos/<int:boleto_id>/recalcular', methods=['POST'])
def recalcular_boleto(boleto_id: int):
    """
    Recalcula um boleto aplicando acréscimos por atraso
    """
    try:
        data = request.get_json()
        indice_correcao = data.get('indice_correcao', 'IGPM')  # IGPM ou IPCA
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Buscar dados do boleto
        cursor.execute("""
            SELECT 
                b.id,
                b.data_vencimento,
                b.valor_total,
                b.status_pagamento,
                CASE 
                    WHEN b.data_pagamento IS NULL AND b.data_vencimento < GETDATE() 
                    THEN DATEDIFF(day, b.data_vencimento, GETDATE())
                    ELSE 0 
                END as dias_atraso
            FROM boletos b
            WHERE b.id = ?
        """, (boleto_id,))
        
        boleto = cursor.fetchone()
        if not boleto:
            return jsonify({
                'success': False,
                'message': 'Boleto não encontrado'
            }), 404
        
        dias_atraso = boleto.dias_atraso
        
        if dias_atraso <= 0:
            return jsonify({
                'success': True,
                'message': 'Boleto não está em atraso, nenhum recálculo necessário',
                'data': {
                    'dias_atraso': 0,
                    'valor_acrescimos': 0,
                    'valor_total_original': float(boleto.valor_total)
                }
            })
        
        # Obter índice de correção para o período
        data_venc = boleto.data_vencimento
        indice_valor = obter_indice_correcao(indice_correcao, data_venc.month, data_venc.year)
        
        # Buscar componentes que podem ter acréscimo
        cursor.execute("""
            SELECT id, tipo_componente, valor_original, tem_acrescimo
            FROM componentes_boleto 
            WHERE boleto_id = ? AND tem_acrescimo = 1
        """, (boleto_id,))
        
        componentes_com_acrescimo = cursor.fetchall()
        valor_total_acrescimos = Decimal('0')
        
        # Calcular e atualizar acréscimos para cada componente
        for componente in componentes_com_acrescimo:
            valor_original = Decimal(str(componente.valor_original))
            acrescimos = calcular_acrescimos_atraso(valor_original, dias_atraso, indice_valor)
            
            # Atualizar componente
            cursor.execute("""
                UPDATE componentes_boleto 
                SET 
                    valor_acrescimo_juros = ?,
                    valor_acrescimo_multa = ?,
                    valor_acrescimo_correcao = ?,
                    valor_final = valor_original + ? + ? + ?,
                    percentual_acrescimo = ?
                WHERE id = ?
            """, (
                float(acrescimos['juros']),
                float(acrescimos['multa']),
                float(acrescimos['correcao']),
                float(acrescimos['juros']),
                float(acrescimos['multa']),
                float(acrescimos['correcao']),
                float(acrescimos['total_acrescimo'] / valor_original * 100),
                componente.id
            ))
            
            valor_total_acrescimos += acrescimos['total_acrescimo']
        
        # Atualizar boleto
        novo_valor_total = Decimal(str(boleto.valor_total)) + valor_total_acrescimos
        cursor.execute("""
            UPDATE boletos 
            SET 
                valor_acrescimos = ?,
                valor_total = ?,
                dias_atraso = ?,
                data_atualizacao = GETDATE()
            WHERE id = ?
        """, (
            float(valor_total_acrescimos),
            float(novo_valor_total),
            dias_atraso,
            boleto_id
        ))
        
        # Registrar histórico
        cursor.execute("""
            INSERT INTO historico_boletos (boleto_id, acao, descricao, valor_anterior, valor_novo)
            VALUES (?, 'RECALCULADO', ?, ?, ?)
        """, (
            boleto_id,
            f'Recálculo por atraso de {dias_atraso} dias usando índice {indice_correcao}',
            float(boleto.valor_total),
            float(novo_valor_total)
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'Boleto recalculado com sucesso. Atraso: {dias_atraso} dias',
            'data': {
                'dias_atraso': dias_atraso,
                'valor_acrescimos': float(valor_total_acrescimos),
                'valor_total_original': float(boleto.valor_total),
                'valor_total_novo': float(novo_valor_total),
                'indice_aplicado': indice_correcao,
                'percentual_indice': float(indice_valor)
            }
        })
        
    except Exception as e:
        logger.error(f"Erro ao recalcular boleto: {e}")
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@app.route('/api/boletos/contrato/<int:contrato_id>', methods=['GET'])
def listar_boletos_contrato(contrato_id: int):
    """
    Lista todos os boletos de um contrato
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                id,
                mes_referencia,
                ano_referencia,
                data_vencimento,
                data_pagamento,
                valor_total,
                valor_acrescimos,
                dias_atraso,
                status_pagamento,
                data_geracao
            FROM boletos 
            WHERE contrato_id = ?
            ORDER BY ano_referencia DESC, mes_referencia DESC
        """, (contrato_id,))
        
        boletos = []
        for row in cursor.fetchall():
            boletos.append({
                'id': row.id,
                'mes_referencia': row.mes_referencia,
                'ano_referencia': row.ano_referencia,
                'data_vencimento': row.data_vencimento.isoformat() if row.data_vencimento else None,
                'data_pagamento': row.data_pagamento.isoformat() if row.data_pagamento else None,
                'valor_total': float(row.valor_total),
                'valor_acrescimos': float(row.valor_acrescimos) if row.valor_acrescimos else 0,
                'dias_atraso': row.dias_atraso,
                'status_pagamento': row.status_pagamento,
                'data_geracao': row.data_geracao.isoformat() if row.data_geracao else None
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': boletos
        })
        
    except Exception as e:
        logger.error(f"Erro ao listar boletos do contrato: {e}")
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@app.route('/api/boletos/<int:boleto_id>/pagar', methods=['POST'])
def registrar_pagamento(boleto_id: int):
    """
    Registra o pagamento de um boleto
    """
    try:
        data = request.get_json()
        data_pagamento = data.get('data_pagamento', datetime.now().isoformat())
        observacoes = data.get('observacoes', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verificar se boleto existe
        cursor.execute("SELECT valor_total FROM boletos WHERE id = ?", (boleto_id,))
        boleto = cursor.fetchone()
        
        if not boleto:
            return jsonify({
                'success': False,
                'message': 'Boleto não encontrado'
            }), 404
        
        # Atualizar boleto
        cursor.execute("""
            UPDATE boletos 
            SET 
                status_pagamento = 'PAGO',
                data_pagamento = ?,
                observacoes = ?,
                data_atualizacao = GETDATE()
            WHERE id = ?
        """, (data_pagamento, observacoes, boleto_id))
        
        # Registrar histórico
        cursor.execute("""
            INSERT INTO historico_boletos (boleto_id, acao, descricao, valor_novo)
            VALUES (?, 'PAGO', ?, ?)
        """, (boleto_id, f'Pagamento registrado. {observacoes}', float(boleto.valor_total)))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Pagamento registrado com sucesso'
        })
        
    except Exception as e:
        logger.error(f"Erro ao registrar pagamento: {e}")
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@app.route('/api/indices-correcao', methods=['GET'])
def listar_indices_correcao():
    """
    Lista os índices de correção disponíveis
    """
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                nome_indice,
                mes,
                ano,
                valor_percentual,
                fonte
            FROM indices_correcao
            ORDER BY nome_indice, ano DESC, mes DESC
        """)
        
        indices = []
        for row in cursor.fetchall():
            indices.append({
                'nome_indice': row.nome_indice,
                'mes': row.mes,
                'ano': row.ano,
                'valor_percentual': float(row.valor_percentual),
                'fonte': row.fonte
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': indices
        })
        
    except Exception as e:
        logger.error(f"Erro ao listar índices de correção: {e}")
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@app.route('/api/boletos/relatorio-mensal', methods=['GET'])
def relatorio_mensal():
    """
    Gera relatório mensal de boletos
    """
    try:
        mes = request.args.get('mes', type=int)
        ano = request.args.get('ano', type=int)
        
        if not mes or not ano:
            return jsonify({
                'success': False,
                'message': 'Mês e ano são obrigatórios'
            }), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Estatísticas gerais
        cursor.execute("""
            SELECT 
                COUNT(*) as total_boletos,
                SUM(CASE WHEN status_pagamento = 'PAGO' THEN 1 ELSE 0 END) as boletos_pagos,
                SUM(CASE WHEN status_pagamento = 'PENDENTE' THEN 1 ELSE 0 END) as boletos_pendentes,
                SUM(CASE WHEN status_pagamento = 'ATRASADO' THEN 1 ELSE 0 END) as boletos_atrasados,
                SUM(valor_total) as valor_total_mes,
                SUM(CASE WHEN status_pagamento = 'PAGO' THEN valor_total ELSE 0 END) as valor_recebido,
                SUM(valor_acrescimos) as total_acrescimos
            FROM boletos
            WHERE mes_referencia = ? AND ano_referencia = ?
        """, (mes, ano))
        
        stats = cursor.fetchone()
        
        # Boletos detalhados
        cursor.execute("""
            SELECT 
                b.id,
                b.data_vencimento,
                b.valor_total,
                b.valor_acrescimos,
                b.status_pagamento,
                b.dias_atraso,
                lct.nome as locatario_nome,
                i.endereco_rua + ', ' + ISNULL(i.endereco_numero, '') as endereco
            FROM boletos b
            LEFT JOIN contratos c ON b.contrato_id = c.id
            LEFT JOIN locatarios lct ON c.locatario_id = lct.id
            LEFT JOIN imoveis i ON c.imovel_id = i.id
            WHERE b.mes_referencia = ? AND b.ano_referencia = ?
            ORDER BY b.data_vencimento
        """, (mes, ano))
        
        boletos_detalhados = []
        for row in cursor.fetchall():
            boletos_detalhados.append({
                'id': row.id,
                'data_vencimento': row.data_vencimento.isoformat() if row.data_vencimento else None,
                'valor_total': float(row.valor_total),
                'valor_acrescimos': float(row.valor_acrescimos) if row.valor_acrescimos else 0,
                'status_pagamento': row.status_pagamento,
                'dias_atraso': row.dias_atraso,
                'locatario_nome': row.locatario_nome,
                'endereco': row.endereco
            })
        
        conn.close()
        
        relatorio = {
            'periodo': {
                'mes': mes,
                'ano': ano
            },
            'estatisticas': {
                'total_boletos': stats.total_boletos,
                'boletos_pagos': stats.boletos_pagos,
                'boletos_pendentes': stats.boletos_pendentes,
                'boletos_atrasados': stats.boletos_atrasados,
                'valor_total_mes': float(stats.valor_total_mes) if stats.valor_total_mes else 0,
                'valor_recebido': float(stats.valor_recebido) if stats.valor_recebido else 0,
                'total_acrescimos': float(stats.total_acrescimos) if stats.total_acrescimos else 0,
                'taxa_inadimplencia': round((stats.boletos_atrasados / stats.total_boletos * 100) if stats.total_boletos > 0 else 0, 2)
            },
            'boletos': boletos_detalhados
        }
        
        return jsonify({
            'success': True,
            'data': relatorio
        })
        
    except Exception as e:
        logger.error(f"Erro ao gerar relatório mensal: {e}")
        return jsonify({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }), 500

@app.route('/health')
def health_check():
    """Health check da API"""
    return jsonify({'status': 'OK', 'timestamp': datetime.now().isoformat()})

if __name__ == '__main__':
    print("🚀 Iniciando API de Boletos...")
    print("📊 Endpoints disponíveis:")
    print("   POST /api/boletos/gerar - Gerar novo boleto")
    print("   GET  /api/boletos/<id> - Obter boleto específico")
    print("   POST /api/boletos/<id>/recalcular - Recalcular boleto com acréscimos")
    print("   GET  /api/boletos/contrato/<id> - Listar boletos de um contrato")
    print("   POST /api/boletos/<id>/pagar - Registrar pagamento")
    print("   GET  /api/indices-correcao - Listar índices de correção")
    print("   GET  /api/boletos/relatorio-mensal - Relatório mensal")
    print("   GET  /health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=5003)