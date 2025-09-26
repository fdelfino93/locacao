"""
Job Automático para Cálculo Diário de Acréscimos
================================================================

Este script calcula automaticamente os acréscimos por atraso para prestações
em status 'pendente' ou 'em_atraso', parando quando o status for:
- 'paga'
- 'lancada'
- 'cancelada'

Execução recomendada: Diariamente via cron/task scheduler
"""

import os
import sys
import logging
from datetime import date, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from dotenv import load_dotenv
import pyodbc
from typing import List, Dict, Any, Optional

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('job_acrescimos.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Carregar variáveis de ambiente
load_dotenv()

def get_conexao():
    """Conecta ao banco de dados usando as configurações do .env"""
    try:
        connection_string = (
            f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
            f"SERVER={os.getenv('DB_SERVER')};"
            f"DATABASE={os.getenv('DB_DATABASE')};"
            f"UID={os.getenv('DB_USER')};"
            f"PWD={os.getenv('DB_PASSWORD')}"
        )
        return pyodbc.connect(connection_string)
    except Exception as e:
        logger.error(f"Erro ao conectar ao banco: {e}")
        raise

def calcular_acrescimos_prestacao(valor_original: float, dias_atraso: int, percentual_multa: float = 2.0) -> dict:
    """
    Calcula acréscimos por atraso para prestação de contas:
    - Juros de mora: 1% ao mês (proporcional por dia) = 0.033% ao dia
    - Multa: percentual sobre o valor em atraso (padrão 2%)

    Args:
        valor_original: Valor base da prestação
        dias_atraso: Número de dias em atraso
        percentual_multa: Percentual de multa (padrão 2%)

    Returns:
        Dict com juros, multa e total
    """
    if dias_atraso <= 0:
        return {
            'juros': 0.0,
            'multa': 0.0,
            'total_acrescimo': 0.0,
            'dias_atraso': 0
        }

    # Juros de mora: 1% ao mês (0.033% ao dia)
    juros_diario = 0.01 / 30  # 1% / 30 dias = 0.000333
    juros = valor_original * juros_diario * dias_atraso

    # Multa: percentual sobre o valor em atraso
    multa = valor_original * (percentual_multa / 100)

    total_acrescimo = juros + multa

    return {
        'juros': round(juros, 2),
        'multa': round(multa, 2),
        'total_acrescimo': round(total_acrescimo, 2),
        'dias_atraso': dias_atraso
    }

def buscar_prestacoes_para_atualizar() -> List[Dict[str, Any]]:
    """
    Busca prestações que precisam ter acréscimos recalculados.

    Critérios:
    - Status: 'pendente' ou 'em_atraso'
    - Data de vencimento no passado
    - Não têm data de pagamento

    Returns:
        Lista de prestações para atualizar
    """
    conn = get_conexao()
    cursor = conn.cursor()

    try:
        # Query para buscar prestações em atraso que ainda podem ter acréscimos
        query = """
            SELECT
                p.id,
                p.contrato_id,
                p.total_bruto,
                p.valor_boleto,
                p.mes,
                p.ano,
                p.valor_acrescimos,
                p.dias_atraso,
                p.status,
                c.vencimento_dia,
                ISNULL(c.percentual_multa_atraso, 2.0) as percentual_multa_atraso,
                -- Calcular data de vencimento baseada no contrato (com validação)
                TRY_CAST(
                    CASE
                        WHEN p.ano > 1900 AND p.ano < 2100
                             AND p.mes >= 1 AND p.mes <= 12
                             AND c.vencimento_dia >= 1 AND c.vencimento_dia <= 31
                        THEN CAST(p.ano AS VARCHAR(4)) + '-' +
                             RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                             RIGHT('0' + CAST(c.vencimento_dia AS VARCHAR(2)), 2)
                        ELSE NULL
                    END AS DATE
                ) as data_vencimento,
                -- Calcular dias de atraso baseado na data de vencimento do contrato
                CASE
                    WHEN TRY_CAST(
                        CASE
                            WHEN p.ano > 1900 AND p.ano < 2100
                                 AND p.mes >= 1 AND p.mes <= 12
                                 AND c.vencimento_dia >= 1 AND c.vencimento_dia <= 31
                            THEN CAST(p.ano AS VARCHAR(4)) + '-' +
                                 RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                 RIGHT('0' + CAST(c.vencimento_dia AS VARCHAR(2)), 2)
                            ELSE NULL
                        END AS DATE
                    ) IS NOT NULL
                    AND TRY_CAST(
                        CASE
                            WHEN p.ano > 1900 AND p.ano < 2100
                                 AND p.mes >= 1 AND p.mes <= 12
                                 AND c.vencimento_dia >= 1 AND c.vencimento_dia <= 31
                            THEN CAST(p.ano AS VARCHAR(4)) + '-' +
                                 RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                 RIGHT('0' + CAST(c.vencimento_dia AS VARCHAR(2)), 2)
                            ELSE NULL
                        END AS DATE
                    ) < CAST(GETDATE() AS DATE)
                    THEN DATEDIFF(day,
                        TRY_CAST(
                            CASE
                                WHEN p.ano > 1900 AND p.ano < 2100
                                     AND p.mes >= 1 AND p.mes <= 12
                                     AND c.vencimento_dia >= 1 AND c.vencimento_dia <= 31
                                THEN CAST(p.ano AS VARCHAR(4)) + '-' +
                                 RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                 RIGHT('0' + CAST(c.vencimento_dia AS VARCHAR(2)), 2)
                                ELSE NULL
                            END AS DATE
                        ),
                        CAST(GETDATE() AS DATE)
                    )
                    ELSE 0
                END as dias_atraso_atual
            FROM PrestacaoContas p
            INNER JOIN Contratos c ON p.contrato_id = c.id
            WHERE
                -- Apenas prestações que podem ter acréscimos calculados
                p.status IN ('pendente', 'em_atraso')
                AND p.data_pagamento IS NULL
                AND c.vencimento_dia IS NOT NULL
                AND p.ano IS NOT NULL
                AND p.mes IS NOT NULL
                AND p.ano > 1900 AND p.ano < 2100
                AND p.mes >= 1 AND p.mes <= 12
                AND c.vencimento_dia >= 1 AND c.vencimento_dia <= 31
                AND p.ativo = 1
                -- Só prestações que realmente estão vencidas
                AND TRY_CAST(
                    CASE
                        WHEN p.ano > 1900 AND p.ano < 2100
                             AND p.mes >= 1 AND p.mes <= 12
                             AND c.vencimento_dia >= 1 AND c.vencimento_dia <= 31
                        THEN CAST(p.ano AS VARCHAR(4)) + '-' +
                             RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                             RIGHT('0' + CAST(c.vencimento_dia AS VARCHAR(2)), 2)
                        ELSE NULL
                    END AS DATE
                ) IS NOT NULL
                AND TRY_CAST(
                    CASE
                        WHEN p.ano > 1900 AND p.ano < 2100
                             AND p.mes >= 1 AND p.mes <= 12
                             AND c.vencimento_dia >= 1 AND c.vencimento_dia <= 31
                        THEN CAST(p.ano AS VARCHAR(4)) + '-' +
                             RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                             RIGHT('0' + CAST(c.vencimento_dia AS VARCHAR(2)), 2)
                        ELSE NULL
                    END AS DATE
                ) < CAST(GETDATE() AS DATE)
            ORDER BY
                TRY_CAST(
                    CASE
                        WHEN p.ano > 1900 AND p.ano < 2100
                             AND p.mes >= 1 AND p.mes <= 12
                             AND c.vencimento_dia >= 1 AND c.vencimento_dia <= 31
                        THEN CAST(p.ano AS VARCHAR(4)) + '-' +
                             RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                             RIGHT('0' + CAST(c.vencimento_dia AS VARCHAR(2)), 2)
                        ELSE NULL
                    END AS DATE
                ) ASC
        """

        cursor.execute(query)

        prestacoes = []
        for row in cursor.fetchall():
            prestacoes.append({
                'id': row[0],  # id
                'contrato_id': row[1],  # contrato_id
                'valor_total': float(row[2]) if row[2] else 0.0,  # total_bruto
                'valor_boleto': float(row[3]) if row[3] else 0.0,  # valor_boleto
                'mes': row[4],  # mes
                'ano': row[5],  # ano
                'valor_acrescimos_atual': float(row[6]) if row[6] else 0.0,  # valor_acrescimos
                'dias_atraso_salvo': row[7] or 0,  # dias_atraso
                'status': row[8],  # status
                'vencimento_dia': row[9],  # vencimento_dia
                'percentual_multa': float(row[10]) if row[10] else 2.0,  # percentual_multa_atraso
                'data_vencimento': row[11],  # data_vencimento calculada
                'dias_atraso_atual': row[12]  # dias_atraso_atual
            })

        logger.info(f"Encontradas {len(prestacoes)} prestações para verificar acréscimos")
        return prestacoes

    finally:
        conn.close()

def atualizar_acrescimos_prestacao(prestacao: Dict[str, Any]) -> bool:
    """
    Atualiza os acréscimos de uma prestação específica

    Args:
        prestacao: Dados da prestação

    Returns:
        True se atualizou, False se não precisou atualizar
    """
    dias_atraso_atual = prestacao['dias_atraso_atual']

    # Se não está em atraso, não faz nada
    if dias_atraso_atual <= 0:
        return False

    # Sempre recalcular para garantir consistência (fórmula pode ter mudado)
    # Comparar valores calculados vs salvos para decidir se precisa atualizar
    valor_base = prestacao['valor_boleto'] or prestacao['valor_total']
    acrescimos_atuais = calcular_acrescimos_prestacao(
        valor_base,
        dias_atraso_atual,
        prestacao['percentual_multa']
    )

    # FORÇAR ATUALIZAÇÃO para garantir consistência entre endpoints
    # (remover verificação para que sempre recalcule)
    logger.info(f"Prestação {prestacao['id']}: recalculando R$ {acrescimos_atuais['total_acrescimo']:.2f}, {dias_atraso_atual} dias")

    # Usar os acréscimos já calculados
    acrescimos = acrescimos_atuais

    # Atualizar no banco
    conn = get_conexao()
    cursor = conn.cursor()

    try:
        novo_valor_total = valor_base + acrescimos['total_acrescimo']

        # PASSO 1: Atualizar valores básicos
        cursor.execute("""
            UPDATE PrestacaoContas
            SET
                valor_acrescimos = ?,
                dias_atraso = ?,
                valor_total_com_acrescimos = ?,
                data_calculo_acrescimos = GETDATE(),
                data_atualizacao = GETDATE()
            WHERE id = ?
        """, (
            acrescimos['total_acrescimo'],
            dias_atraso_atual,
            novo_valor_total,
            prestacao['id']
        ))

        # PASSO 2: Recalcular valor_repasse (total_liquido + 100% dos acrescimos)
        cursor.execute("SELECT total_liquido FROM PrestacaoContas WHERE id = ?", (prestacao['id'],))
        dados_repasse = cursor.fetchone()
        total_liquido = float(dados_repasse[0]) if dados_repasse[0] else 0

        # CORREÇÃO: 100% dos acréscimos vão para o repasse
        # Repasse = Total Líquido + Acréscimos (integral)
        # Isso porque o locatário paga o valor total com acréscimos
        # e após deduzir o que fica retido, o resto vai para os locadores
        novo_valor_repasse = total_liquido + acrescimos['total_acrescimo']

        cursor.execute("""
            UPDATE PrestacaoContas
            SET valor_repasse = ?
            WHERE id = ?
        """, (novo_valor_repasse, prestacao['id']))

        # PASSO 3: Atualizar/criar distribuição quando há acréscimos
        try:
            # Buscar locadores do contrato
            cursor.execute("""
                SELECT cl.locador_id, l.nome, cl.responsabilidade_principal
                FROM ContratoLocadores cl
                JOIN Locadores l ON cl.locador_id = l.id
                WHERE cl.contrato_id = (SELECT contrato_id FROM PrestacaoContas WHERE id = ?)
                AND cl.ativo = 1
                ORDER BY cl.responsabilidade_principal DESC, cl.locador_id
            """, (prestacao['id'],))

            locadores = cursor.fetchall()

            if locadores and len(locadores) > 0:
                # Calcular distribuição igual (dividir por 3)
                valor_base = novo_valor_repasse / len(locadores)
                valor_base_arredondado = round(valor_base - 0.005, 2)  # Arredondar para baixo
                diferenca = novo_valor_repasse - (valor_base_arredondado * len(locadores))

                # Atualizar/criar distribuição na tabela
                for i, (locador_id, nome, eh_principal) in enumerate(locadores):
                    # Responsável principal recebe os centavos extras
                    valor_final = valor_base_arredondado + (diferenca if eh_principal else 0)

                    # Verificar se já existe distribuição para esta prestação e locador
                    cursor.execute("""
                        SELECT id FROM DistribuicaoRepasseLocadores
                        WHERE prestacao_id = ? AND locador_id = ?
                    """, (prestacao['id'], locador_id))

                    existe = cursor.fetchone()

                    if existe:
                        # Atualizar existente
                        cursor.execute("""
                            UPDATE DistribuicaoRepasseLocadores
                            SET valor_repasse = ?,
                                percentual_participacao = ?,
                                data_atualizacao = GETDATE()
                            WHERE prestacao_id = ? AND locador_id = ?
                        """, (valor_final, round(100.0 / len(locadores), 2), prestacao['id'], locador_id))
                        logger.debug(f"  Atualizado {nome}: R$ {valor_final:.2f}")
                    else:
                        # Criar novo registro
                        cursor.execute("""
                            INSERT INTO DistribuicaoRepasseLocadores
                            (prestacao_id, locador_id, locador_nome, percentual_participacao,
                             valor_repasse, responsabilidade_principal, data_criacao, ativo)
                            VALUES (?, ?, ?, ?, ?, ?, GETDATE(), 1)
                        """, (prestacao['id'], locador_id, nome, round(100.0 / len(locadores), 2),
                              valor_final, eh_principal))
                        logger.debug(f"  Criado {nome}: R$ {valor_final:.2f}")

        except Exception as e:
            logger.warning(f"Erro ao atualizar distribuição para prestação {prestacao['id']}: {e}")

        # Registrar log de alteração
        cursor.execute("""
            INSERT INTO LogAtualizacaoAcrescimos
            (prestacao_id, valor_anterior, valor_novo, dias_atraso, data_atualizacao, origem)
            VALUES (?, ?, ?, ?, GETDATE(), 'JOB_AUTOMATICO')
        """, (
            prestacao['id'],
            prestacao['valor_acrescimos_atual'],
            acrescimos['total_acrescimo'],
            dias_atraso_atual
        ))

        conn.commit()

        logger.info(
            f"Prestacao {prestacao['id']}: "
            f"Acrescimos: R$ {prestacao['valor_acrescimos_atual']:.2f} para R$ {acrescimos['total_acrescimo']:.2f} "
            f"| Repasse: R$ {total_liquido:.2f} para R$ {novo_valor_repasse:.2f} "
            f"({dias_atraso_atual} dias de atraso)"
        )

        return True

    except Exception as e:
        conn.rollback()
        logger.error(f"Erro ao atualizar prestação {prestacao['id']}: {e}")
        return False
    finally:
        conn.close()

def criar_tabela_log_se_necessario():
    """Cria a tabela de log de atualizações se não existir"""
    conn = get_conexao()
    cursor = conn.cursor()

    try:
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='LogAtualizacaoAcrescimos' AND xtype='U')
            BEGIN
                CREATE TABLE LogAtualizacaoAcrescimos (
                    id int IDENTITY(1,1) PRIMARY KEY,
                    prestacao_id int NOT NULL,
                    valor_anterior decimal(10,2),
                    valor_novo decimal(10,2),
                    dias_atraso int,
                    data_atualizacao datetime DEFAULT GETDATE(),
                    origem varchar(50) DEFAULT 'JOB_AUTOMATICO'
                )
            END
        """)
        conn.commit()
    except Exception as e:
        logger.warning(f"Aviso ao criar tabela de log: {e}")
    finally:
        conn.close()

def executar_job_acrescimos():
    """Função principal que executa o job de atualização de acréscimos"""
    inicio = datetime.now()
    logger.info("Iniciando job de cálculo automático de acréscimos")

    try:
        # Garantir que a tabela de log existe
        criar_tabela_log_se_necessario()

        # Buscar prestações para atualizar
        prestacoes = buscar_prestacoes_para_atualizar()

        if not prestacoes:
            logger.info("Nenhuma prestação necessita atualização de acréscimos")
            return

        # Contador de atualizações
        atualizadas = 0

        # Processar cada prestação
        for prestacao in prestacoes:
            try:
                if atualizar_acrescimos_prestacao(prestacao):
                    atualizadas += 1
            except Exception as e:
                logger.error(f"Erro ao processar prestação {prestacao['id']}: {e}")
                continue

        # Relatório final
        duracao = datetime.now() - inicio
        logger.info(
            f"Job concluído! "
            f"Processadas: {len(prestacoes)}, "
            f"Atualizadas: {atualizadas}, "
            f"Duração: {duracao.total_seconds():.2f}s"
        )

    except Exception as e:
        logger.error(f"Erro crítico no job de acréscimos: {e}")
        sys.exit(1)

if __name__ == "__main__":
    executar_job_acrescimos()