# Fix para taxa de transferência - Priorizar tabelas N:N
# Este arquivo corrige o cálculo de proprietários para evitar duplicação

def obter_locadores_contrato(cursor, contrato_id):
    """
    Busca locadores de um contrato priorizando tabela N:N
    Fallback para estrutura antiga se N:N estiver vazia
    """
    
    # 1. TENTAR buscar da tabela N:N primeiro
    cursor.execute("""
        SELECT 
            cl.locador_id,
            l.nome as locador_nome,
            cl.porcentagem,
            cl.responsabilidade_principal,
            COUNT(*) as total_locadores
        FROM ContratoLocadores cl
        INNER JOIN Locadores l ON cl.locador_id = l.id
        WHERE cl.contrato_id = ? AND cl.ativo = 1
        GROUP BY cl.locador_id, l.nome, cl.porcentagem, cl.responsabilidade_principal
    """, (contrato_id,))
    
    locadores_nn = cursor.fetchall()
    
    if locadores_nn:
        print(f"✅ Encontrados {len(locadores_nn)} locadores via tabela N:N")
        return locadores_nn
    
    # 2. FALLBACK para estrutura antiga (via Imoveis)
    print("⚠️ Tabela N:N vazia, usando fallback via Imoveis.id_locador")
    cursor.execute("""
        SELECT 
            l.id as locador_id,
            l.nome as locador_nome,
            100.00 as porcentagem,  -- Assume 100% se só há 1
            1 as responsabilidade_principal,
            1 as total_locadores
        FROM Contratos c
        INNER JOIN Imoveis i ON c.id_imovel = i.id
        INNER JOIN Locadores l ON i.id_locador = l.id
        WHERE c.id = ?
    """, (contrato_id,))
    
    locadores_antigas = cursor.fetchall()
    return locadores_antigas if locadores_antigas else []

def obter_locatarios_contrato(cursor, contrato_id):
    """
    Busca locatários de um contrato priorizando tabela N:N
    Fallback para FK antiga se N:N estiver vazia
    """
    
    # 1. TENTAR buscar da tabela N:N primeiro
    cursor.execute("""
        SELECT 
            cl.locatario_id,
            l.nome as locatario_nome,
            cl.percentual_responsabilidade,
            cl.responsabilidade_principal,
            COUNT(*) as total_locatarios
        FROM ContratoLocatarios cl
        INNER JOIN Locatarios l ON cl.locatario_id = l.id
        WHERE cl.contrato_id = ? AND cl.ativo = 1
        GROUP BY cl.locatario_id, l.nome, cl.percentual_responsabilidade, cl.responsabilidade_principal
    """, (contrato_id,))
    
    locatarios_nn = cursor.fetchall()
    
    if locatarios_nn:
        print(f"✅ Encontrados {len(locatarios_nn)} locatários via tabela N:N")
        return locatarios_nn
    
    # 2. FALLBACK para FK antiga
    print("⚠️ Tabela N:N vazia, usando fallback via Contratos.id_locatario")
    cursor.execute("""
        SELECT 
            l.id as locatario_id,
            l.nome as locatario_nome,
            100.00 as percentual_responsabilidade,
            1 as responsabilidade_principal,
            1 as total_locatarios
        FROM Contratos c
        INNER JOIN Locatarios l ON c.id_locatario = l.id
        WHERE c.id = ?
    """, (contrato_id,))
    
    locatarios_antigos = cursor.fetchall()
    return locatarios_antigos if locatarios_antigos else []

def calcular_taxa_transferencia_correta(cursor, contrato_id, configuracao_retencoes):
    """
    Calcula taxa de transferência usando contagem CORRETA de proprietários
    """
    
    # Usar função unificada para contar locadores
    locadores = obter_locadores_contrato(cursor, contrato_id)
    num_locadores = len(locadores)
    
    print(f"🧮 Contrato {contrato_id}: {num_locadores} locadores encontrados")
    
    # Taxa de transferência só para locadores ADICIONAIS (além do primeiro)
    if num_locadores > 1:
        taxa_por_locador = configuracao_retencoes.taxa_transferencia
        taxa_total = taxa_por_locador * (num_locadores - 1)
        print(f"💰 Taxa transferência: {num_locadores-1} × R$ {taxa_por_locador} = R$ {taxa_total}")
        return taxa_total
    else:
        print("💰 Taxa transferência: R$ 0,00 (apenas 1 locador)")
        return 0.0

# Exemplo de uso:
if __name__ == "__main__":
    import pyodbc
    from repositories_adapter import get_conexao
    
    # Testar com contrato específico
    with get_conexao() as conn:
        cursor = conn.cursor()
        
        # Testar contrato (substitua pelo ID real)
        contrato_teste = 1  # Coloque um ID de contrato real
        
        print(f"\n🔍 Testando contrato {contrato_teste}:")
        locadores = obter_locadores_contrato(cursor, contrato_teste)
        locatarios = obter_locatarios_contrato(cursor, contrato_teste)
        
        print(f"Locadores: {len(locadores)}")
        for loc in locadores:
            print(f"  - {loc[1]} ({loc[2]}%)")
            
        print(f"Locatários: {len(locatarios)}")
        for loc in locatarios:
            print(f"  - {loc[1]} ({loc[2]}%)")