-- Migration: 004_create_contrato_locadores_simple.sql
-- Criação da tabela para associar locadores aos contratos com contas bancárias e porcentagens

-- Tabela de relacionamento entre contratos e locadores
CREATE TABLE ContratoLocadores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contrato_id INT NOT NULL,
    locador_id INT NOT NULL,
    conta_bancaria_id INT NOT NULL,
    porcentagem DECIMAL(5,2) NOT NULL CHECK (porcentagem > 0 AND porcentagem <= 100),
    data_criacao DATETIME2 DEFAULT GETDATE(),
    data_atualizacao DATETIME2 DEFAULT GETDATE(),
    ativo BIT DEFAULT 1,
    
    -- Garantir que um locador não aparece duplicado no mesmo contrato
    CONSTRAINT UC_ContratoLocadores_Unico UNIQUE (contrato_id, locador_id)
);

-- Índices para performance
CREATE INDEX IX_ContratoLocadores_Contrato ON ContratoLocadores(contrato_id);
CREATE INDEX IX_ContratoLocadores_Locador ON ContratoLocadores(locador_id);
CREATE INDEX IX_ContratoLocadores_ContaBancaria ON ContratoLocadores(conta_bancaria_id);