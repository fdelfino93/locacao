-- Script para verificar quais campos existem na tabela Contratos
-- Execute este script para ver quais campos já existem no banco

USE locacao;

-- Verificar estrutura atual da tabela Contratos
SELECT 
    COLUMN_NAME as Campo,
    DATA_TYPE as Tipo,
    IS_NULLABLE as PermiteNulo,
    COLUMN_DEFAULT as ValorPadrao
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Contratos'
ORDER BY ORDINAL_POSITION;

-- Verificar especificamente os campos que queremos usar
SELECT 
    CASE 
        WHEN COLUMN_NAME IS NOT NULL THEN '✓ EXISTE'
        ELSE '✗ NÃO EXISTE'
    END as Status,
    'data_assinatura' as Campo
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Contratos' AND COLUMN_NAME = 'data_assinatura'
UNION ALL
SELECT 
    CASE 
        WHEN COLUMN_NAME IS NOT NULL THEN '✓ EXISTE'
        ELSE '✗ NÃO EXISTE'
    END,
    'data_entrega_chaves'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Contratos' AND COLUMN_NAME = 'data_entrega_chaves'
UNION ALL
SELECT 
    CASE 
        WHEN COLUMN_NAME IS NOT NULL THEN '✓ EXISTE'
        ELSE '✗ NÃO EXISTE'
    END,
    'ultimo_reajuste'
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Contratos' AND COLUMN_NAME = 'ultimo_reajuste'
-- Continue para outros campos...;