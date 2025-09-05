#!/usr/bin/env python3
"""
Script para criar a tabela de histórico de contratos
Armazena todas as mudanças realizadas nos contratos
"""

try:
    from repositories_adapter import get_conexao
    
    print("=== CRIANDO TABELA HISTORICO_CONTRATOS ===")
    
    conn = get_conexao()
    cursor = conn.cursor()
    
    # Verificar se a tabela já existe
    cursor.execute("""
        SELECT COUNT(*) FROM sys.tables WHERE name = 'HistoricoContratos'
    """)
    
    tabela_existe = cursor.fetchone()[0] > 0
    
    if not tabela_existe:
        # Criar a tabela HistoricoContratos
        cursor.execute("""
        CREATE TABLE HistoricoContratos (
            id INT IDENTITY(1,1) PRIMARY KEY,
            id_contrato INT NOT NULL,
            campo_alterado NVARCHAR(100) NOT NULL,
            valor_anterior NVARCHAR(MAX),
            valor_novo NVARCHAR(MAX),
            tipo_operacao NVARCHAR(50) NOT NULL, -- UPDATE, REAJUSTE, RENOVACAO, CRIACAO
            descricao_mudanca NVARCHAR(500),
            data_alteracao DATETIME DEFAULT GETDATE(),
            usuario NVARCHAR(100),
            ip_usuario NVARCHAR(45),
            observacoes NVARCHAR(500),
            
            -- Chave estrangeira
            FOREIGN KEY (id_contrato) REFERENCES Contratos(id) ON DELETE CASCADE
        )
    """)
    
    conn.commit()
    print("SUCESSO: Tabela HistoricoContratos criada com sucesso!")
    
    # Criar índices adicionais para otimização
    print("\n=== CRIANDO INDICES ADICIONAIS ===")
    
    cursor.execute("""
        CREATE INDEX IX_HistoricoContratos_IdContrato 
        ON HistoricoContratos (id_contrato)
    """)
    
    cursor.execute("""
        CREATE INDEX IX_HistoricoContratos_DataAlteracao 
        ON HistoricoContratos (data_alteracao)
    """)
    
    cursor.execute("""
        CREATE INDEX IX_HistoricoContratos_TipoOperacao 
        ON HistoricoContratos (tipo_operacao)
    """)
    
    cursor.execute("""
        CREATE INDEX IX_HistoricoContratos_CampoAlterado 
        ON HistoricoContratos (campo_alterado)
    """)
    
    cursor.execute("""
        CREATE INDEX IX_HistoricoContratos_DataContrato 
        ON HistoricoContratos (id_contrato, data_alteracao DESC)
    """)
    
    conn.commit()
    print("SUCESSO: Indices criados com sucesso!")
    
    # Inserir alguns registros de exemplo (opcional)
    print("\n=== INSERINDO DADOS DE EXEMPLO ===")
    
    cursor.execute("""
        INSERT INTO HistoricoContratos 
        (id_contrato, campo_alterado, valor_anterior, valor_novo, tipo_operacao, descricao_mudanca, usuario)
        VALUES 
        (1, 'status', NULL, 'ativo', 'CRIACAO', 'Contrato criado no sistema', 'Sistema'),
        (1, 'valor_aluguel', '1800.00', '2000.00', 'REAJUSTE', 'Reajuste anual aplicado conforme IPCA', 'Admin'),
        (1, 'data_fim', '2025-12-01', '2026-12-01', 'RENOVACAO', 'Contrato renovado por mais 12 meses', 'Admin')
    """)
    
    conn.commit()
    print("SUCESSO: Dados de exemplo inseridos!")
    
    # Verificar a estrutura criada
    print("\n=== ESTRUTURA DA TABELA CRIADA ===")
    cursor.execute("""
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'HistoricoContratos' 
        ORDER BY ORDINAL_POSITION
    """)
    
    print("Campo                     Tipo            Null     Default")
    print("-" * 65)
    for row in cursor.fetchall():
        nullable = 'YES' if row[2] == 'YES' else 'NO'
        default = str(row[3]) if row[3] else ''
        print(f"{row[0]:<25} {row[1]:<15} {nullable:<8} {default}")
    
    # Testar a consulta de histórico
    print("\n=== TESTE DE CONSULTA ===")
    cursor.execute("""
        SELECT id_contrato, campo_alterado, valor_anterior, valor_novo, 
               tipo_operacao, descricao_mudanca, data_alteracao
        FROM HistoricoContratos 
        WHERE id_contrato = 1 
        ORDER BY data_alteracao DESC
    """)
    
    print("Historico do contrato 1:")
    for row in cursor.fetchall():
        print(f"  {row[5]} - {row[1]}: {row[2]} -> {row[3]} ({row[4]})")
    
    conn.close()
    
    print("\n=== RESUMO ===")
    print("SUCESSO: Tabela HistoricoContratos criada com sucesso!")
    print("SUCESSO: Indices de performance criados")
    print("SUCESSO: Dados de exemplo inseridos")
    print("SUCESSO: Estrutura testada e funcionando")
    print("")
    print("PROXIMOS PASSOS:")
    print("1. Implementar triggers ou metodos para capturar mudancas automaticamente")
    print("2. Criar API endpoints para buscar historico")
    print("3. Implementar interface no frontend para exibir historico")
    print("4. Adicionar campos de auditoria (usuario, IP) quando disponivel")
    
except Exception as e:
    print(f"ERRO ao criar tabela: {e}")
    import traceback
    traceback.print_exc()