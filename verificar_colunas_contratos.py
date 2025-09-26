#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para verificar as colunas da tabela Contratos
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))
from repositories_adapter import get_conexao

def verificar_colunas():
    """Verifica as colunas da tabela Contratos"""
    conn = get_conexao()
    if not conn:
        return

    cursor = conn.cursor()

    try:
        # Verificar estrutura da tabela Contratos
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'Contratos'
            ORDER BY ORDINAL_POSITION
        """)

        colunas = cursor.fetchall()
        print("Colunas da tabela Contratos:")
        print("=" * 50)
        for coluna in colunas:
            print(f"{coluna[0]} ({coluna[1]}) - Nulo: {coluna[2]}")

        # Buscar colunas relacionadas a vencimento
        print("\n" + "=" * 50)
        print("Colunas relacionadas a 'vencimento':")
        for coluna in colunas:
            if 'vencimento' in coluna[0].lower():
                print(f"✓ {coluna[0]}")

        print("\nColunas relacionadas a 'dia':")
        for coluna in colunas:
            if 'dia' in coluna[0].lower():
                print(f"✓ {coluna[0]}")

    except Exception as e:
        print(f"Erro: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    verificar_colunas()