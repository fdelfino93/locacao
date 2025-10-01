#!/usr/bin/env python3
"""
Script para corrigir filtros de empresa no repositories_adapter.py
"""

import re

def corrigir_filtros():
    # Ler arquivo original
    with open('repositories_adapter.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Padrão antigo problemático
    pattern_old = r'if not ver_todas_empresas and empresa_id is not None:\s*\n\s*query \+= " WHERE l\.empresa_id = \?"\s*\n\s*params\.append\(empresa_id\)'

    # Substituição segura
    replacement = '''if not ver_todas_empresas:
            # ✅ CORREÇÃO: Se não é admin, SEMPRE filtrar por empresa
            # Se empresa_id for None, usar empresa padrão (1) para compatibilidade
            empresa_filtro = empresa_id if empresa_id is not None else 1
            query += " WHERE l.empresa_id = ?"
            params.append(empresa_filtro)'''

    # Aplicar correção
    content_fixed = re.sub(pattern_old, replacement, content, flags=re.MULTILINE)

    if content_fixed != content:
        print("✅ Correção aplicada em buscar_locadores")
    else:
        print("❌ Padrão não encontrado em buscar_locadores")

    # Corrigir buscar_imoveis também
    pattern_imoveis = r'if not ver_todas_empresas and empresa_id is not None:\s*\n\s*query \+= " WHERE empresa_id = \?"\s*\n\s*params\.append\(empresa_id\)'

    replacement_imoveis = '''if not ver_todas_empresas:
            # ✅ CORREÇÃO: Se não é admin, SEMPRE filtrar por empresa
            empresa_filtro = empresa_id if empresa_id is not None else 1
            query += " WHERE empresa_id = ?"
            params.append(empresa_filtro)'''

    content_fixed = re.sub(pattern_imoveis, replacement_imoveis, content_fixed, flags=re.MULTILINE)

    # Salvar arquivo corrigido
    with open('repositories_adapter.py', 'w', encoding='utf-8') as f:
        f.write(content_fixed)

    print("✅ Arquivo corrigido salvo!")

if __name__ == "__main__":
    corrigir_filtros()