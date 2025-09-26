#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_conexao():
    conn_str = f'DRIVER={{{os.getenv("DB_DRIVER")}}};SERVER={os.getenv("DB_SERVER")};DATABASE={os.getenv("DB_DATABASE")};UID={os.getenv("DB_USER")};PWD={os.getenv("DB_PASSWORD")};Encrypt={os.getenv("DB_ENCRYPT", "yes")};TrustServerCertificate={os.getenv("DB_TRUST_CERT", "yes")}'
    return pyodbc.connect(conn_str)

def limpar_duplicatas():
    conn = get_conexao()
    cursor = conn.cursor()

    print("LIMPEZA DE PRESTAÇÕES DUPLICADAS")
    print("=" * 50)

    # Identificar duplicatas
    cursor.execute("""
        SELECT contrato_id, mes, ano, COUNT(*) as qtd, STRING_AGG(CAST(id AS VARCHAR), ', ') as ids
        FROM PrestacaoContas
        WHERE ativo = 1
        GROUP BY contrato_id, mes, ano
        HAVING COUNT(*) > 1
        ORDER BY contrato_id, ano, mes
    """)

    duplicatas = cursor.fetchall()

    if not duplicatas:
        print("Nenhuma duplicata encontrada!")
        return

    print(f"AVISO: Encontradas {len(duplicatas)} situacoes com duplicatas:\n")

    for dup in duplicatas:
        contrato_id, mes, ano, qtd, ids = dup
        print(f"Contrato {contrato_id} - {mes}/{ano}: {qtd} prestacoes (IDs: {ids})")

        # Se contrato_id for None, usar IS NULL na query
        if contrato_id is None:
            cursor.execute("""
                SELECT id, data_criacao, status, valor_boleto
                FROM PrestacaoContas
                WHERE contrato_id IS NULL AND mes = ? AND ano = ? AND ativo = 1
                ORDER BY data_criacao DESC
            """, (mes, ano))
        else:
            cursor.execute("""
                SELECT id, data_criacao, status, valor_boleto
                FROM PrestacaoContas
                WHERE contrato_id = ? AND mes = ? AND ano = ? AND ativo = 1
                ORDER BY data_criacao DESC
            """, (contrato_id, mes, ano))

        prestacoes = cursor.fetchall()

        # Manter apenas a mais recente (primeira da lista pois ordenamos DESC)
        id_manter = prestacoes[0][0]
        ids_remover = [str(p[0]) for p in prestacoes[1:]]

        print(f"  -> Mantendo ID {id_manter} (mais recente)")
        print(f"  -> Removendo IDs {', '.join(ids_remover)}")

        # Marcar como inativas as duplicatas
        for id_remover in ids_remover:
            cursor.execute("""
                UPDATE PrestacaoContas
                SET ativo = 0
                WHERE id = ?
            """, (id_remover,))

            # Marcar lançamentos relacionados como inativos também
            cursor.execute("""
                UPDATE LancamentosPrestacaoContas
                SET ativo = 0
                WHERE prestacao_id = ?
            """, (id_remover,))

            # Marcar distribuições relacionadas como inativas
            cursor.execute("""
                UPDATE DistribuicaoRepasseLocadores
                SET ativo = 0
                WHERE prestacao_id = ?
            """, (id_remover,))

        print(f"  OK - Duplicatas removidas\n")

    conn.commit()
    print("=" * 50)
    print("Limpeza concluida com sucesso!")

    conn.close()

if __name__ == "__main__":
    limpar_duplicatas()