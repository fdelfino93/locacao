# Corrigir o crash do backend na funcao atualizar_contrato
# Substituir a funcao atual por uma versao limpa

import os
import re

# Ler o arquivo atual
with open('repositories_adapter.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Encontrar e substituir a funcao atualizar_contrato
# Primeiro, encontrar onde comeca a funcao
start_pattern = r'def atualizar_contrato\(contrato_id, \*\*kwargs\):'
end_pattern = r'\n\ndef '  # Proxima funcao

# Criar funcao limpa
clean_function = '''def atualizar_contrato(contrato_id, **kwargs):
    """Atualiza um contrato na tabela Contratos - VERSAO LIMPA"""
    try:
        print(f"=== REPOSITORIES: Atualizando contrato {contrato_id} ===")
        print(f"Campos recebidos: {list(kwargs.keys())}")
        
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Verificar se o contrato existe
        cursor.execute("SELECT id FROM Contratos WHERE id = ?", (contrato_id,))
        if not cursor.fetchone():
            print(f"ERRO: Contrato ID {contrato_id} nao encontrado no banco")
            return False
        print(f"OK: Contrato {contrato_id} encontrado no banco")
        
        # Campos atualizaveis na tabela Contratos
        campos_atualizaveis = [
            # Campos originais
            'id_locatario', 'id_imovel', 'valor_aluguel', 'data_inicio', 
            'data_fim', 'data_vencimento', 'tipo_garantia', 'observacoes',
            'status', 'valor_condominio', 'valor_iptu', 'valor_seguro',
            'percentual_reajuste', 'indice_reajuste', 'prazo_reajuste',
            'valor_multa_rescisao', 'valor_deposito_caucao', 'prazo_pagamento',
            'dia_vencimento', 'forma_pagamento', 'banco_pagamento',
            'agencia_pagamento', 'conta_pagamento',
            
            # Campos que JA EXISTEM no banco
            'data_assinatura', 'ultimo_reajuste', 'proximo_reajuste',
            'renovacao_automatica', 'vencimento_dia', 'taxa_administracao',
            'fundo_conservacao', 'bonificacao', 'valor_seguro_fianca',
            'valor_seguro_incendio', 'seguro_fianca_inicio', 'seguro_fianca_fim',
            'seguro_incendio_inicio', 'seguro_incendio_fim', 'percentual_multa_atraso',
            'retido_fci', 'retido_iptu', 'retido_condominio', 'retido_seguro_fianca',
            'retido_seguro_incendio', 'antecipa_condominio', 'antecipa_seguro_fianca',
            'antecipa_seguro_incendio',
            
            # Campos CRIADOS no banco 
            'data_entrega_chaves',
            'proximo_reajuste_automatico',
            'periodo_contrato',
            'tempo_renovacao',
            'tempo_reajuste',
            'data_inicio_iptu',
            'data_fim_iptu',
            'parcelas_iptu',
            'parcelas_seguro_fianca',
            'parcelas_seguro_incendio',
            'valor_fci'
        ]
        
        # Filtrar campos para atualizar
        campos_para_atualizar = {}
        campos_ignorados = []
        for campo, valor in kwargs.items():
            if campo in campos_atualizaveis and valor is not None:
                campos_para_atualizar[campo] = valor
            elif campo not in campos_atualizaveis:
                campos_ignorados.append(campo)
        
        if campos_ignorados:
            print(f"AVISO: Campos ignorados: {campos_ignorados}")
        
        if not campos_para_atualizar:
            print("ERRO: Nenhum campo valido para atualizar")
            return False
        
        print(f"OK: Campos que serao atualizados: {list(campos_para_atualizar.keys())}")
        
        # Construir query UPDATE
        set_clause = ", ".join([f"{campo} = ?" for campo in campos_para_atualizar.keys()])
        query = f"UPDATE Contratos SET {set_clause} WHERE id = ?"
        valores = list(campos_para_atualizar.values()) + [contrato_id]
        
        print(f"Executando UPDATE...")
        print(f"Query: {query}")
        print(f"Parametros: {len(valores) - 1} campos + 1 ID")
        
        cursor.execute(query, valores)
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"SUCESSO: Contrato ID {contrato_id} atualizado! ({cursor.rowcount} linha(s))")
            conn.close()
            return True
        else:
            print(f"AVISO: Nenhuma linha afetada no contrato {contrato_id}")
            conn.close()
            return False
            
    except Exception as e:
        print(f"ERRO ao atualizar contrato: {e}")
        print(f"Tipo do erro: {type(e).__name__}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

'''

# Encontrar a funcao atual e substituir
pattern = r'def atualizar_contrato\(contrato_id, \*\*kwargs\):.*?(?=\ndef |\Z)'
content = re.sub(pattern, clean_function.strip(), content, flags=re.DOTALL)

# Salvar o arquivo corrigido
with open('repositories_adapter.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Funcao atualizar_contrato corrigida com versao limpa!")