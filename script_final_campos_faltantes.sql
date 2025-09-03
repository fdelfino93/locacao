-- ==========================================
-- SCRIPT FINAL - Adicionar Apenas Campos que NÃO EXISTEM
-- ==========================================
-- Baseado na varredura completa do banco de dados
-- Apenas 11 campos precisam ser criados (marcados com *)

USE locacao;
GO

PRINT '===========================================';
PRINT 'ADICIONANDO CAMPOS FALTANTES NA TABELA CONTRATOS';
PRINT 'Total: 11 campos que não existem no banco';
PRINT '===========================================';

-- 1. Campos de Configuração Temporal
PRINT 'Adicionando campos de configuração temporal...';

ALTER TABLE Contratos ADD data_entrega_chaves DATE NULL;
PRINT '✓ data_entrega_chaves (DATE) - Data de entrega das chaves';

ALTER TABLE Contratos ADD proximo_reajuste_automatico BIT NULL;  
PRINT '✓ proximo_reajuste_automatico (BIT) - Flag para reajuste automático';

ALTER TABLE Contratos ADD periodo_contrato INT NULL;
PRINT '✓ periodo_contrato (INT) - Duração do contrato em meses';

ALTER TABLE Contratos ADD tempo_renovacao INT NULL;
PRINT '✓ tempo_renovacao (INT) - Período de renovação em meses';

ALTER TABLE Contratos ADD tempo_reajuste INT NULL;
PRINT '✓ tempo_reajuste (INT) - Período entre reajustes em meses';

-- 2. Campos Específicos do IPTU
PRINT 'Adicionando campos específicos do IPTU...';

ALTER TABLE Contratos ADD data_inicio_iptu DATE NULL;
PRINT '✓ data_inicio_iptu (DATE) - Data de início do IPTU';

ALTER TABLE Contratos ADD data_fim_iptu DATE NULL;  
PRINT '✓ data_fim_iptu (DATE) - Data de fim do IPTU';

ALTER TABLE Contratos ADD parcelas_iptu INT NULL;
PRINT '✓ parcelas_iptu (INT) - Número de parcelas do IPTU';

-- 3. Campos de Parcelas de Seguros
PRINT 'Adicionando campos de parcelas de seguros...';

ALTER TABLE Contratos ADD parcelas_seguro_fianca INT NULL;
PRINT '✓ parcelas_seguro_fianca (INT) - Parcelas do seguro fiança';

ALTER TABLE Contratos ADD parcelas_seguro_incendio INT NULL;
PRINT '✓ parcelas_seguro_incendio (INT) - Parcelas do seguro incêndio';

-- 4. Campo FCI
PRINT 'Adicionando campo FCI...';

ALTER TABLE Contratos ADD valor_fci DECIMAL(10,2) NULL;
PRINT '✓ valor_fci (DECIMAL) - Valor do FCI';

PRINT '===========================================';
PRINT 'TODOS OS 11 CAMPOS FORAM ADICIONADOS!';
PRINT '===========================================';

-- Verificação final
PRINT 'Verificando campos adicionados...';

SELECT 
    'VERIFICAÇÃO FINAL' as Status,
    COUNT(*) as Campos_Adicionados
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
    'parcelas_seguro_fianca',
    'parcelas_seguro_incendio',
    'valor_fci'
);

-- Listar os novos campos
SELECT 
    'NOVO CAMPO: ' + COLUMN_NAME as Campo_Criado,
    DATA_TYPE as Tipo,
    CASE WHEN IS_NULLABLE = 'YES' THEN 'Permite NULL' ELSE 'NOT NULL' END as Nulidade
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
    'parcelas_seguro_fianca',
    'parcelas_seguro_incendio',
    'valor_fci'
)
ORDER BY COLUMN_NAME;

PRINT '===========================================';
PRINT 'SISTEMA PRONTO PARA EDIÇÃO DE CONTRATOS!';
PRINT 'Todos os campos do frontend agora têm correspondência no banco.';
PRINT '===========================================';

-- Resumo final
SELECT 
    'RESUMO FINAL' as Status,
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Contratos') as Total_Campos_Contratos,
    'Prontos para uso!' as Observacao;