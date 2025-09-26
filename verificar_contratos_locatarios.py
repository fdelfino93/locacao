#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verificar tabela ContratosLocatarios vs campo id_locatario
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))
from repositories_adapter import get_conexao

def verificar_contratos_locatarios():
    """Compara dados entre ContratosLocatarios e Contratos.id_locatario"""
    conn = get_conexao()
    if not conn:
        return

    cursor = conn.cursor()

    try:
        print("=== COMPARAÇÃO CRÍTICA ===")
        print("ContratosLocatarios vs Contratos.id_locatario")
        print()

        # 1. Verificar ContratosLocatarios
        print("1. TABELA ContratosLocatarios (dados atualizados):")
        cursor.execute("""
            SELECT cl.contrato_id, cl.locatario_id, cl.responsabilidade_principal,
                   l.nome as locatario_nome,
                   c.id as contrato_id_real
            FROM ContratoLocatarios cl
            JOIN Locatarios l ON cl.locatario_id = l.id
            JOIN Contratos c ON cl.contrato_id = c.id
            WHERE cl.responsabilidade_principal = 1
            ORDER BY cl.contrato_id
        """)

        contratos_locatarios = cursor.fetchall()
        for row in contratos_locatarios:
            print(f"   Contrato {row[0]}: Locatário {row[1]} ({row[3]}) - Principal: {row[2]}")

        print()

        # 2. Verificar Contratos.id_locatario (campo legado)
        print("2. CAMPO LEGADO Contratos.id_locatario (pode estar desatualizado):")
        cursor.execute("""
            SELECT c.id, c.id_locatario, l.nome as locatario_nome
            FROM Contratos c
            LEFT JOIN Locatarios l ON c.id_locatario = l.id
            WHERE c.status = 'ativo'
            ORDER BY c.id
        """)

        contratos_legado = cursor.fetchall()
        for row in contratos_legado:
            locatario_nome = row[2] if row[2] else "SEM LOCATÁRIO"
            print(f"   Contrato {row[0]}: Locatário {row[1]} ({locatario_nome})")

        print()

        # 3. Comparar especificamente o Contrato 9 (PC-052)
        print("3. CONTRATO 9 (PC-052) - COMPARAÇÃO DIRETA:")

        # ContratosLocatarios
        cursor.execute("""
            SELECT cl.locatario_id, l.nome, l.documento
            FROM ContratoLocatarios cl
            JOIN Locatarios l ON cl.locatario_id = l.id
            WHERE cl.contrato_id = 9 AND cl.responsabilidade_principal = 1
        """)

        resultado_novo = cursor.fetchone()
        if resultado_novo:
            print(f"   ContratosLocatarios: Locatário {resultado_novo[0]} - {resultado_novo[1]} - Doc: {resultado_novo[2]}")
        else:
            print("   ContratosLocatarios: NENHUM LOCATÁRIO ENCONTRADO!")

        # Contratos.id_locatario
        cursor.execute("""
            SELECT c.id_locatario, l.nome, l.documento
            FROM Contratos c
            LEFT JOIN Locatarios l ON c.id_locatario = l.id
            WHERE c.id = 9
        """)

        resultado_legado = cursor.fetchone()
        if resultado_legado and resultado_legado[0]:
            print(f"   Contratos.id_locatario: Locatário {resultado_legado[0]} - {resultado_legado[1]} - Doc: {resultado_legado[2]}")
        else:
            print("   Contratos.id_locatario: NULO ou INVÁLIDO")

        print()

        # 4. Verificar qual método o sistema está usando nas consultas
        print("4. VERIFICAR CONSULTAS DO SISTEMA:")
        print("   Precisamos identificar quais consultas ainda usam o campo legado")

    except Exception as e:
        print(f"ERRO: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    verificar_contratos_locatarios()