-- Migration: 002_create_payment_methods.sql
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
    tipo_chave VARCHAR(20) NULL CHECK (tipo_chave IN ('CPF', 'Email', 'Telefone', 'Aleatoria') OR tipo_chave IS NULL),
    
    -- Dados TED/DOC
    banco VARCHAR(10) NULL,
    agencia VARCHAR(20) NULL,
    conta VARCHAR(30) NULL,
    tipo_conta VARCHAR(20) NULL CHECK (tipo_conta IN ('Conta Corrente', 'Conta Poupança') OR tipo_conta IS NULL),
    titular VARCHAR(200) NULL,
    cpf_titular VARCHAR(20) NULL,
    
    -- Dados Boleto
    convenio VARCHAR(20) NULL,
    carteira VARCHAR(10) NULL,
    
    -- Observações
    observacoes TEXT NULL,
    
    -- Índices e constraints
    CONSTRAINT FK_MetodosPagamento_Locador FOREIGN KEY (locador_id) REFERENCES Clientes(id) ON DELETE CASCADE,
    CONSTRAINT UC_MetodosPagamento_Principal UNIQUE (locador_id, principal, ativo)
);

-- Índices para performance
CREATE INDEX IX_MetodosPagamento_Locador ON MetodosPagamentoLocador(locador_id);
CREATE INDEX IX_MetodosPagamento_Tipo ON MetodosPagamentoLocador(tipo);
CREATE INDEX IX_MetodosPagamento_Principal ON MetodosPagamentoLocador(principal, ativo);

-- Trigger para garantir que apenas um método seja principal por locador ativo
CREATE TRIGGER TR_MetodosPagamento_Principal
ON MetodosPagamentoLocador
AFTER INSERT, UPDATE
AS
BEGIN
    -- Se um método está sendo marcado como principal e ativo
    IF EXISTS (
        SELECT 1 FROM inserted 
        WHERE principal = 1 AND ativo = 1
    )
    BEGIN
        -- Desmarcar outros métodos como principal para o mesmo locador
        UPDATE m
        SET principal = 0, data_atualizacao = GETDATE()
        FROM MetodosPagamentoLocador m
        INNER JOIN inserted i ON m.locador_id = i.locador_id
        WHERE m.id != i.id 
        AND m.principal = 1 
        AND m.ativo = 1
        AND i.principal = 1 
        AND i.ativo = 1;
    END
END;

-- Adicionar coluna na tabela Clientes para controlar se usa métodos múltiplos
ALTER TABLE Clientes ADD usa_multiplos_metodos BIT DEFAULT 0;

-- Comentários para documentação
EXEC sp_addextendedproperty 
    'MS_Description', 'Tabela para armazenar múltiplos métodos de pagamento por locador',
    'SCHEMA', 'dbo', 'TABLE', 'MetodosPagamentoLocador';

EXEC sp_addextendedproperty 
    'MS_Description', 'ID único do método de pagamento',
    'SCHEMA', 'dbo', 'TABLE', 'MetodosPagamentoLocador', 'COLUMN', 'id';

EXEC sp_addextendedproperty 
    'MS_Description', 'ID do locador (FK para Clientes)',
    'SCHEMA', 'dbo', 'TABLE', 'MetodosPagamentoLocador', 'COLUMN', 'locador_id';

EXEC sp_addextendedproperty 
    'MS_Description', 'Tipo do método: PIX, TED, Boleto, Transferencia',
    'SCHEMA', 'dbo', 'TABLE', 'MetodosPagamentoLocador', 'COLUMN', 'tipo';

EXEC sp_addextendedproperty 
    'MS_Description', 'Define se este é o método principal de recebimento',
    'SCHEMA', 'dbo', 'TABLE', 'MetodosPagamentoLocador', 'COLUMN', 'principal';

EXEC sp_addextendedproperty 
    'MS_Description', 'Define se o método está ativo',
    'SCHEMA', 'dbo', 'TABLE', 'MetodosPagamentoLocador', 'COLUMN', 'ativo';

PRINT 'Migration 002_create_payment_methods.sql executada com sucesso!';