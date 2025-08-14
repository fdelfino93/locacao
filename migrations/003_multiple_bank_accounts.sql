-- Migration: 003_multiple_bank_accounts.sql
-- Criação da tabela para múltiplas contas bancárias por locador

-- Tabela de contas bancárias múltiplas para locadores
CREATE TABLE ContasBancariasLocador (
    id INT IDENTITY(1,1) PRIMARY KEY,
    locador_id INT NOT NULL,
    tipo_recebimento VARCHAR(10) NOT NULL CHECK (tipo_recebimento IN ('PIX', 'TED')),
    principal BIT DEFAULT 0,
    
    -- Dados PIX
    chave_pix VARCHAR(200) NULL,
    
    -- Dados TED/Conta Bancária
    banco VARCHAR(10) NULL,
    agencia VARCHAR(20) NULL,
    conta VARCHAR(30) NULL,
    tipo_conta VARCHAR(20) NULL,
    titular VARCHAR(200) NULL,
    cpf_titular VARCHAR(20) NULL,
    
    -- Metadados
    data_cadastro DATETIME DEFAULT GETDATE(),
    data_atualizacao DATETIME DEFAULT GETDATE(),
    ativo BIT DEFAULT 1
);

-- Índices para performance
CREATE INDEX IX_ContasBancarias_Locador ON ContasBancariasLocador(locador_id);
CREATE INDEX IX_ContasBancarias_Principal ON ContasBancariasLocador(principal, ativo);

-- Adicionar coluna para controlar se o locador usa múltiplas contas
ALTER TABLE Clientes ADD usa_multiplas_contas BIT DEFAULT 0;