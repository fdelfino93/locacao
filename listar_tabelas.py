#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Listar todas as tabelas para encontrar ContratosLocatarios
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))
from repositories_adapter import get_conexao

def listar_tabelas():
    """Lista todas as tabelas do banco"""
    conn = get_conexao()
    if not conn:
        return

    cursor = conn.cursor()

    try:
        print("=== TODAS AS TABELAS DO BANCO ===")

        cursor.execute("""
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
            ORDER BY TABLE_NAME
        """)

        tabelas = cursor.fetchall()
        print("Tabelas encontradas:")

        for tabela in tabelas:
            nome_tabela = tabela[0]
            print(f"   {nome_tabela}")

            # Procurar especificamente por tabelas relacionadas a contratos e locatários
            if 'contrato' in nome_tabela.lower() or 'locatario' in nome_tabela.lower():
                print(f"   *** {nome_tabela} *** (relacionada a contratos/locatários)")

        print()
        print("=== BUSCANDO VARIAÇÕES DO NOME ===")

        # Tentar variações do nome
        variacoes = [
            'ContratosLocatarios',
            'ContratoLocatario',
            'contratos_locatarios',
            'contrato_locatario',
            'Contrato_Locatario',
            'ContratoLocatarios'
        ]

        for variacao in variacoes:
            try:
                cursor.execute(f"SELECT TOP 1 * FROM {variacao}")
                print(f"   ✓ ENCONTRADA: {variacao}")

                # Se encontrar, mostrar estrutura
                cursor.execute(f"""
                    SELECT COLUMN_NAME, DATA_TYPE
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = '{variacao}'
                """)

                colunas = cursor.fetchall()
                print(f"     Colunas de {variacao}:")
                for col in colunas:
                    print(f"       - {col[0]} ({col[1]})")
                break

            except:
                continue

    except Exception as e:
        print(f"Erro: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    listar_tabelas()