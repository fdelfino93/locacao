-- =====================================================================
-- SCRIPTS ALTER TABLE PARA PRESTAÇÃO DE CONTAS - SISTEMA COBIMOB
-- =====================================================================

-- 1. CRIAR TABELA DE PRESTAÇÃO DE CONTAS (PRINCIPAL)
-- Tabela que unifica os dados de prestação de contas por cliente/período
CREATE TABLE [dbo].[PrestacaoContas](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [cliente_id] [int] NOT NULL,
    [mes] [varchar](2) NOT NULL,
    [ano] [varchar](4) NOT NULL,
    [referencia] [varchar](10) NOT NULL, -- formato: MM/YYYY
    
    -- Valores financeiros principais
    [valor_pago] [decimal](10, 2) NULL DEFAULT 0.00,
    [valor_vencido] [decimal](10, 2) NULL DEFAULT 0.00,
    [encargos] [decimal](10, 2) NULL DEFAULT 0.00,
    [deducoes] [decimal](10, 2) NULL DEFAULT 0.00,
    [total_bruto] [decimal](10, 2) NULL DEFAULT 0.00,
    [total_liquido] [decimal](10, 2) NULL DEFAULT 0.00,
    
    -- Status e controle
    [status] [varchar](20) NULL DEFAULT 'pendente', -- pago, pendente, atrasado, vencido
    [pagamento_atrasado] [bit] NULL DEFAULT 0,
    
    -- Observações
    [observacoes_manuais] [text] NULL,
    [observacoes] [text] NULL,
    
    -- Auditoria
    [data_criacao] [datetime] NULL DEFAULT GETDATE(),
    [data_atualizacao] [datetime] NULL DEFAULT GETDATE(),
    [ativo] [bit] NULL DEFAULT 1,
    
    -- Chaves
    PRIMARY KEY CLUSTERED ([id] ASC),
    FOREIGN KEY ([cliente_id]) REFERENCES [dbo].[Clientes]([id]),
    
    -- Índices únicos para evitar duplicatas
    CONSTRAINT [UK_PrestacaoContas_Cliente_Periodo] UNIQUE ([cliente_id], [mes], [ano])
);

-- 2. CRIAR TABELA DE LANÇAMENTOS DA PRESTAÇÃO DE CONTAS
-- Tabela para armazenar os lançamentos detalhados de cada prestação
CREATE TABLE [dbo].[LancamentosPrestacaoContas](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [prestacao_id] [int] NOT NULL,
    
    -- Dados do lançamento
    [tipo] [varchar](50) NOT NULL, -- receita, despesa, taxa, desconto
    [descricao] [varchar](500) NOT NULL,
    [valor] [decimal](10, 2) NOT NULL,
    [data_lancamento] [date] NULL DEFAULT GETDATE(),
    
    -- Auditoria
    [data_criacao] [datetime] NULL DEFAULT GETDATE(),
    [ativo] [bit] NULL DEFAULT 1,
    
    -- Chaves
    PRIMARY KEY CLUSTERED ([id] ASC),
    FOREIGN KEY ([prestacao_id]) REFERENCES [dbo].[PrestacaoContas]([id]) ON DELETE CASCADE
);

-- 3. ALTERAR TABELA PAGAMENTOS (se necessário campos adicionais)
-- Adicionar campos que podem estar faltando na tabela Pagamentos
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Pagamentos]') AND name = 'encargos')
BEGIN
    ALTER TABLE [dbo].[Pagamentos] 
    ADD [encargos] [decimal](10, 2) NULL DEFAULT 0.00;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Pagamentos]') AND name = 'deducoes')
BEGIN
    ALTER TABLE [dbo].[Pagamentos] 
    ADD [deducoes] [decimal](10, 2) NULL DEFAULT 0.00;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Pagamentos]') AND name = 'observacoes_manuais')
BEGIN
    ALTER TABLE [dbo].[Pagamentos] 
    ADD [observacoes_manuais] [text] NULL;
END

-- 4. ALTERAR TABELA PAGAMENTOS_DETALHES (se necessário campos adicionais)
-- Garantir que tem todos os campos necessários para prestação de contas
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PagamentosDetalhes]') AND name = 'encargos')
BEGIN
    ALTER TABLE [dbo].[PagamentosDetalhes] 
    ADD [encargos] [decimal](10, 2) NULL DEFAULT 0.00;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PagamentosDetalhes]') AND name = 'deducoes')
BEGIN
    ALTER TABLE [dbo].[PagamentosDetalhes] 
    ADD [deducoes] [decimal](10, 2) NULL DEFAULT 0.00;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PagamentosDetalhes]') AND name = 'valor_pago_detalhado')
BEGIN
    ALTER TABLE [dbo].[PagamentosDetalhes] 
    ADD [valor_pago_detalhado] [decimal](10, 2) NULL DEFAULT 0.00;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PagamentosDetalhes]') AND name = 'valor_vencido')
BEGIN
    ALTER TABLE [dbo].[PagamentosDetalhes] 
    ADD [valor_vencido] [decimal](10, 2) NULL DEFAULT 0.00;
END

-- 5. ALTERAR TABELA LANCAMENTOS_LIQUIDOS (adicionar campos se necessário)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[LancamentosLiquidos]') AND name = 'descricao')
BEGIN
    ALTER TABLE [dbo].[LancamentosLiquidos] 
    ADD [descricao] [varchar](500) NULL;
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[LancamentosLiquidos]') AND name = 'data_lancamento')
BEGIN
    ALTER TABLE [dbo].[LancamentosLiquidos] 
    ADD [data_lancamento] [date] NULL DEFAULT GETDATE();
END

-- 6. CRIAR ÍNDICES PARA PERFORMANCE
-- Índices para otimizar consultas de prestação de contas
CREATE NONCLUSTERED INDEX [IX_PrestacaoContas_Cliente] 
ON [dbo].[PrestacaoContas] ([cliente_id]);

CREATE NONCLUSTERED INDEX [IX_PrestacaoContas_Periodo] 
ON [dbo].[PrestacaoContas] ([ano], [mes]);

CREATE NONCLUSTERED INDEX [IX_PrestacaoContas_Status] 
ON [dbo].[PrestacaoContas] ([status]);

CREATE NONCLUSTERED INDEX [IX_LancamentosPrestacaoContas_Prestacao] 
ON [dbo].[LancamentosPrestacaoContas] ([prestacao_id]);

CREATE NONCLUSTERED INDEX [IX_LancamentosPrestacaoContas_Tipo] 
ON [dbo].[LancamentosPrestacaoContas] ([tipo]);

-- 7. CRIAR TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- Trigger para atualizar data_atualizacao automaticamente
CREATE TRIGGER [dbo].[TRG_PrestacaoContas_UpdateTimestamp] 
ON [dbo].[PrestacaoContas]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[PrestacaoContas] 
    SET [data_atualizacao] = GETDATE() 
    WHERE [id] IN (SELECT [id] FROM inserted);
END;

-- 8. INSERIR DADOS DE TESTE (OPCIONAL)
-- Comentado para execução manual se necessário
/*
-- Inserir algumas prestações de exemplo
INSERT INTO [dbo].[PrestacaoContas] 
(cliente_id, mes, ano, referencia, valor_pago, encargos, total_bruto, total_liquido, status, observacoes_manuais)
VALUES 
(1, '11', '2024', '11/2024', 1500.00, 150.00, 1650.00, 1600.00, 'pago', 'Prestação de exemplo'),
(2, '11', '2024', '11/2024', 2000.00, 200.00, 2200.00, 2150.00, 'pendente', 'Aguardando confirmação');

-- Inserir lançamentos de exemplo
INSERT INTO [dbo].[LancamentosPrestacaoContas] 
(prestacao_id, tipo, descricao, valor, data_lancamento)
VALUES 
(1, 'receita', 'Aluguel mensal', 1500.00, '2024-11-01'),
(1, 'taxa', 'Taxa de administração', 150.00, '2024-11-01'),
(1, 'desconto', 'Desconto pontualidade', -50.00, '2024-11-01');
*/

-- 9. VERIFICAÇÕES FINAIS
-- Script para verificar se as tabelas foram criadas corretamente
SELECT 
    'PrestacaoContas' as Tabela,
    COUNT(*) as Total_Registros
FROM [dbo].[PrestacaoContas]

UNION ALL

SELECT 
    'LancamentosPrestacaoContas' as Tabela,
    COUNT(*) as Total_Registros  
FROM [dbo].[LancamentosPrestacaoContas];

-- Verificar estrutura das colunas
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME IN ('PrestacaoContas', 'LancamentosPrestacaoContas')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

PRINT 'Scripts de ALTER TABLE para Prestação de Contas executados com sucesso!';