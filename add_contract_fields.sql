-- Script para adicionar campos faltantes na tabela Contratos
-- Abordagem híbrida - campos específicos do contrato

USE locacao;
GO

-- Adicionar campos que são específicos do contrato (não devem estar em tabelas relacionadas)
ALTER TABLE Contratos ADD 
    data_entrega_chaves DATE NULL,
    proximo_reajuste_automatico BIT NULL,
    periodo_contrato INT NULL,
    tempo_renovacao INT NULL,
    tempo_reajuste INT NULL,
    data_inicio_iptu DATE NULL,
    data_fim_iptu DATE NULL,
    parcelas_iptu INT NULL;

GO

-- Comentários sobre os campos adicionados:
-- data_entrega_chaves: Data específica da entrega das chaves
-- proximo_reajuste_automatico: Flag para reajuste automático 
-- periodo_contrato: Duração do contrato em meses
-- tempo_renovacao: Período de renovação em meses
-- tempo_reajuste: Período entre reajustes em meses  
-- data_inicio_iptu: Data de início do IPTU
-- data_fim_iptu: Data de fim do IPTU
-- parcelas_iptu: Número de parcelas do IPTU

-- Verificar se as colunas foram adicionadas
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
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
    'parcelas_iptu'
)
ORDER BY COLUMN_NAME;