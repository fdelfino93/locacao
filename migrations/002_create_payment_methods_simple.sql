-- Migration: 002_create_payment_methods_simple.sql
-- Criação da tabela para múltiplos métodos de pagamento

-- Tabela de métodos de pagamento para locadores
CREATE TABLE MetodosPagamentoLocador (
    id INT IDENTITY(1,1) PRIMARY KEY,
    locador_id INT NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PIX', 'TED', 'Boleto', 'Transferencia')),
    principal BIT DEFAULT 0,
    ativo BIT DEFAULT 1,
    data_cadastro DATETIME DEFAULT GETDATE(),
    data_atualizacao DATETIME DEFAULT GETDATE(),
    
    -- Dados PIX
    chave_pix VARCHAR(200) NULL,
    tipo_chave VARCHAR(20) NULL,
    
    -- Dados TED/DOC
    banco VARCHAR(10) NULL,
    agencia VARCHAR(20) NULL,
    conta VARCHAR(30) NULL,
    tipo_conta VARCHAR(20) NULL,
    titular VARCHAR(200) NULL,
    cpf_titular VARCHAR(20) NULL,
    
    -- Dados Boleto
    convenio VARCHAR(20) NULL,
    carteira VARCHAR(10) NULL,
    
    -- Observações
    observacoes TEXT NULL
);

-- Índices para performance
CREATE INDEX IX_MetodosPagamento_Locador ON MetodosPagamentoLocador(locador_id);
CREATE INDEX IX_MetodosPagamento_Tipo ON MetodosPagamentoLocador(tipo);
CREATE INDEX IX_MetodosPagamento_Principal ON MetodosPagamentoLocador(principal, ativo);

-- Adicionar coluna na tabela Clientes para controlar se usa métodos múltiplos
ALTER TABLE Clientes ADD usa_multiplos_metodos BIT DEFAULT 0;