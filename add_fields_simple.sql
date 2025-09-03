-- Execute este script no SQL Server Management Studio ou seu cliente SQL preferido

USE locacao;

-- Adicionar campos faltantes na tabela Contratos
ALTER TABLE Contratos ADD data_entrega_chaves DATE NULL;
ALTER TABLE Contratos ADD proximo_reajuste_automatico BIT NULL;
ALTER TABLE Contratos ADD periodo_contrato INT NULL;
ALTER TABLE Contratos ADD tempo_renovacao INT NULL;
ALTER TABLE Contratos ADD tempo_reajuste INT NULL;
ALTER TABLE Contratos ADD data_inicio_iptu DATE NULL;
ALTER TABLE Contratos ADD data_fim_iptu DATE NULL;
ALTER TABLE Contratos ADD parcelas_iptu INT NULL;

-- Verificar se foram adicionados
SELECT 'Campos adicionados com sucesso!' as Resultado;