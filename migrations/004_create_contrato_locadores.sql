-- Migration: 004_create_contrato_locadores.sql
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
    
    -- Constraints
    CONSTRAINT FK_ContratoLocadores_Contrato FOREIGN KEY (contrato_id) REFERENCES Contratos(id) ON DELETE CASCADE,
    CONSTRAINT FK_ContratoLocadores_Locador FOREIGN KEY (locador_id) REFERENCES Clientes(id),
    CONSTRAINT FK_ContratoLocadores_ContaBancaria FOREIGN KEY (conta_bancaria_id) REFERENCES ContasBancariasLocador(id),
    
    -- Garantir que um locador não aparece duplicado no mesmo contrato
    CONSTRAINT UC_ContratoLocadores_Unico UNIQUE (contrato_id, locador_id)
);

-- Índices para performance
CREATE INDEX IX_ContratoLocadores_Contrato ON ContratoLocadores(contrato_id);
CREATE INDEX IX_ContratoLocadores_Locador ON ContratoLocadores(locador_id);
CREATE INDEX IX_ContratoLocadores_ContaBancaria ON ContratoLocadores(conta_bancaria_id);

-- Trigger para garantir que a soma das porcentagens seja exatamente 100%
CREATE TRIGGER TR_ContratoLocadores_ValidarPorcentagem
ON ContratoLocadores
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @contrato_id INT;
    DECLARE @soma_porcentagem DECIMAL(5,2);
    
    -- Para cada contrato afetado
    DECLARE contrato_cursor CURSOR FOR
    SELECT DISTINCT contrato_id FROM inserted;
    
    OPEN contrato_cursor;
    FETCH NEXT FROM contrato_cursor INTO @contrato_id;
    
    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Calcular soma das porcentagens para este contrato
        SELECT @soma_porcentagem = SUM(porcentagem)
        FROM ContratoLocadores
        WHERE contrato_id = @contrato_id AND ativo = 1;
        
        -- Se a soma for diferente de 100%, reverter a transação
        IF @soma_porcentagem != 100.00
        BEGIN
            DECLARE @msg NVARCHAR(255) = 'A soma das porcentagens dos locadores deve ser exatamente 100%. Soma atual: ' + CAST(@soma_porcentagem AS NVARCHAR(10)) + '%';
            RAISERROR(@msg, 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END;
        
        FETCH NEXT FROM contrato_cursor INTO @contrato_id;
    END;
    
    CLOSE contrato_cursor;
    DEALLOCATE contrato_cursor;
END;

-- Trigger para validar que a conta bancária pertence ao locador
CREATE TRIGGER TR_ContratoLocadores_ValidarContaBancaria
ON ContratoLocadores
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Verificar se a conta bancária pertence ao locador
    IF EXISTS (
        SELECT 1 
        FROM inserted i
        LEFT JOIN ContasBancariasLocador cb ON i.conta_bancaria_id = cb.id
        WHERE cb.locador_id != i.locador_id OR cb.id IS NULL
    )
    BEGIN
        RAISERROR('A conta bancária selecionada não pertence ao locador informado.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;

-- Função para obter locadores de um contrato com suas contas e porcentagens
CREATE VIEW VW_ContratoLocadoresDetalhes AS
SELECT 
    cl.id,
    cl.contrato_id,
    cl.locador_id,
    c.nome as locador_nome,
    c.cpf_cnpj as locador_documento,
    cl.conta_bancaria_id,
    cb.tipo_recebimento,
    cb.chave_pix,
    cb.banco,
    cb.agencia,
    cb.conta,
    cb.tipo_conta,
    cb.titular,
    cb.cpf_titular,
    cb.principal as conta_principal,
    cl.porcentagem,
    cl.data_criacao,
    cl.ativo
FROM ContratoLocadores cl
INNER JOIN Clientes c ON cl.locador_id = c.id
INNER JOIN ContasBancariasLocador cb ON cl.conta_bancaria_id = cb.id
WHERE cl.ativo = 1 AND c.tipo_cliente = 'Locador';

-- Comentários para documentação
EXEC sp_addextendedproperty 
    'MS_Description', 'Tabela de relacionamento entre contratos e locadores com suas respectivas contas bancárias e porcentagens de participação',
    'SCHEMA', 'dbo', 'TABLE', 'ContratoLocadores';

EXEC sp_addextendedproperty 
    'MS_Description', 'ID do contrato (FK para Contratos)',
    'SCHEMA', 'dbo', 'TABLE', 'ContratoLocadores', 'COLUMN', 'contrato_id';

EXEC sp_addextendedproperty 
    'MS_Description', 'ID do locador (FK para Clientes)',
    'SCHEMA', 'dbo', 'TABLE', 'ContratoLocadores', 'COLUMN', 'locador_id';

EXEC sp_addextendedproperty 
    'MS_Description', 'ID da conta bancária do locador (FK para ContasBancariasLocador)',
    'SCHEMA', 'dbo', 'TABLE', 'ContratoLocadores', 'COLUMN', 'conta_bancaria_id';

EXEC sp_addextendedproperty 
    'MS_Description', 'Porcentagem de participação do locador no imóvel (0.01 a 100.00)',
    'SCHEMA', 'dbo', 'TABLE', 'ContratoLocadores', 'COLUMN', 'porcentagem';

PRINT 'Migration 004_create_contrato_locadores.sql executada com sucesso!';