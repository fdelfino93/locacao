-- ==========================================
-- Script para Adicionar Campos Faltantes na Tabela Contratos
-- ==========================================
-- Execute este script no SQL Server Management Studio
-- Campos marcados com * não existem ainda no banco

USE locacao;
GO

PRINT 'Iniciando adição de campos faltantes na tabela Contratos...';

-- Campos de Configuração Temporal
ALTER TABLE Contratos ADD data_entrega_chaves DATE NULL;  -- *
PRINT '✓ Campo data_entrega_chaves adicionado';

ALTER TABLE Contratos ADD proximo_reajuste_automatico BIT NULL;  -- *
PRINT '✓ Campo proximo_reajuste_automatico adicionado';

ALTER TABLE Contratos ADD periodo_contrato INT NULL;  -- *
PRINT '✓ Campo periodo_contrato adicionado';

ALTER TABLE Contratos ADD tempo_renovacao INT NULL;  -- *
PRINT '✓ Campo tempo_renovacao adicionado';

ALTER TABLE Contratos ADD tempo_reajuste INT NULL;  -- *
PRINT '✓ Campo tempo_reajuste adicionado';

-- Campos IPTU Específicos
ALTER TABLE Contratos ADD data_inicio_iptu DATE NULL;  -- *
PRINT '✓ Campo data_inicio_iptu adicionado';

ALTER TABLE Contratos ADD data_fim_iptu DATE NULL;  -- *
PRINT '✓ Campo data_fim_iptu adicionado';

ALTER TABLE Contratos ADD parcelas_iptu INT NULL;  -- *
PRINT '✓ Campo parcelas_iptu adicionado';

-- Campo para FCI (Fundo de Combate e Investigação)
ALTER TABLE Contratos ADD valor_fci DECIMAL(10,2) NULL;  -- *
PRINT '✓ Campo valor_fci adicionado';

PRINT '==========================================';
PRINT 'Todos os campos foram adicionados com sucesso!';
PRINT '==========================================';

-- Verificar se os campos foram criados
SELECT 
    'Verificação de Campos Adicionados' as Status,
    COUNT(*) as Total_Campos_Novos
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Contratos' 
AND COLUMN_NAME IN (
    'data_entrega_chaves',
    'proximo_reajuste_automatico',
    'periodo_contrato',
    'tempo_renovacao', 
    'tempo_reajuste',
    'data_inicio_iptu',
    'data_fim_iptu',
    'parcelas_iptu',
    'valor_fci'
);

-- Listar os campos adicionados
SELECT 
    COLUMN_NAME as Campo_Adicionado,
    DATA_TYPE as Tipo,
    IS_NULLABLE as Permite_Null
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Contratos' 
AND COLUMN_NAME IN (
    'data_entrega_chaves',
    'proximo_reajuste_automatico',
    'periodo_contrato',
    'tempo_renovacao',
    'tempo_reajuste', 
    'data_inicio_iptu',
    'data_fim_iptu',
    'parcelas_iptu',
    'valor_fci'
)
ORDER BY COLUMN_NAME;