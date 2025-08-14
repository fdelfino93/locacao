-- Migration: Create Timeline Events Table
-- Description: Add contract events tracking for timeline functionality

USE [Cobimob]
GO

-- Create ContratosEventos table for timeline functionality
CREATE TABLE [dbo].[ContratosEventos] (
    [id] [int] IDENTITY(1,1) NOT NULL,
    [contrato_id] [int] NOT NULL,
    [tipo_evento] [nvarchar](50) NOT NULL,
    [data_evento] [datetime] NOT NULL,
    [titulo] [nvarchar](200) NOT NULL,
    [descricao] [nvarchar](1000) NULL,
    [valor] [decimal](10, 2) NULL,
    [usuario_id] [int] NULL,
    [metadados] [nvarchar](max) NULL, -- JSON para dados específicos
    [status] [nvarchar](20) DEFAULT 'ativo' NOT NULL,
    [created_at] [datetime] DEFAULT GETDATE() NOT NULL,
    [updated_at] [datetime] DEFAULT GETDATE() NOT NULL,
    
    CONSTRAINT [PK_ContratosEventos] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_ContratosEventos_Contratos] 
        FOREIGN KEY([contrato_id]) REFERENCES [dbo].[Contratos]([id])
        ON DELETE CASCADE
)
GO

-- Create indexes for performance
CREATE NONCLUSTERED INDEX [IX_ContratosEventos_ContratId_DataEvento] 
ON [dbo].[ContratosEventos] ([contrato_id], [data_evento] DESC)
GO

CREATE NONCLUSTERED INDEX [IX_ContratosEventos_TipoEvento] 
ON [dbo].[ContratosEventos] ([tipo_evento])
GO

CREATE NONCLUSTERED INDEX [IX_ContratosEventos_DataEvento] 
ON [dbo].[ContratosEventos] ([data_evento] DESC)
GO

-- Create full-text catalog and index for search functionality
IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'CobimobFullTextCatalog')
BEGIN
    CREATE FULLTEXT CATALOG CobimobFullTextCatalog AS DEFAULT;
END
GO

-- Full-text index on ContratosEventos for search
CREATE FULLTEXT INDEX ON [dbo].[ContratosEventos]
(
    [titulo] LANGUAGE 1046,  -- Portuguese
    [descricao] LANGUAGE 1046
)
KEY INDEX [PK_ContratosEventos]
ON CobimobFullTextCatalog
WITH CHANGE_TRACKING AUTO;
GO

-- Add search indexes to main tables for global search
-- Clientes full-text index
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('dbo.Clientes'))
BEGIN
    CREATE FULLTEXT INDEX ON [dbo].[Clientes]
    (
        [nome] LANGUAGE 1046,
        [cpf_cnpj] LANGUAGE 1046,
        [email] LANGUAGE 1046,
        [endereco] LANGUAGE 1046,
        [telefone] LANGUAGE 1046
    )
    KEY INDEX [PK__Clientes__3213E83F4F7CD00D] -- Adjust PK name if different
    ON CobimobFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
END
GO

-- Imoveis full-text index
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('dbo.Imoveis'))
BEGIN
    CREATE FULLTEXT INDEX ON [dbo].[Imoveis]
    (
        [endereco] LANGUAGE 1046,
        [tipo] LANGUAGE 1046,
        [dados_imovel] LANGUAGE 1046,
        [matricula_imovel] LANGUAGE 1046
    )
    KEY INDEX [PK__Imoveis__3213E83F4F7CD00D] -- Adjust PK name if different
    ON CobimobFullTextCatalog
    WITH CHANGE_TRACKING AUTO;
END
GO

-- Insert initial timeline events for existing contracts
INSERT INTO [dbo].[ContratosEventos] 
    ([contrato_id], [tipo_evento], [data_evento], [titulo], [descricao])
SELECT 
    [id] as contrato_id,
    'contrato_assinado' as tipo_evento,
    ISNULL([data_assinatura], [data_inicio]) as data_evento,
    'Contrato Assinado' as titulo,
    'Contrato de locação foi assinado e iniciado' as descricao
FROM [dbo].[Contratos]
WHERE [data_inicio] IS NOT NULL;
GO

-- Add reajuste events for contracts with ultimo_reajuste
INSERT INTO [dbo].[ContratosEventos] 
    ([contrato_id], [tipo_evento], [data_evento], [titulo], [descricao], [valor])
SELECT 
    [id] as contrato_id,
    'reajuste_aplicado' as tipo_evento,
    [ultimo_reajuste] as data_evento,
    'Reajuste Aplicado' as titulo,
    CONCAT('Reajuste de ', [percentual_reajuste], '% aplicado no contrato') as descricao,
    [percentual_reajuste] as valor
FROM [dbo].[Contratos]
WHERE [ultimo_reajuste] IS NOT NULL;
GO

-- Add future reajuste events
INSERT INTO [dbo].[ContratosEventos] 
    ([contrato_id], [tipo_evento], [data_evento], [titulo], [descricao], [status])
SELECT 
    [id] as contrato_id,
    'reajuste_programado' as tipo_evento,
    [proximo_reajuste] as data_evento,
    'Próximo Reajuste Programado' as titulo,
    CONCAT('Próximo reajuste programado para ', FORMAT([proximo_reajuste], 'dd/MM/yyyy')) as descricao,
    'pendente' as status
FROM [dbo].[Contratos]
WHERE [proximo_reajuste] IS NOT NULL AND [proximo_reajuste] > GETDATE();
GO

PRINT 'Timeline events table and indexes created successfully!'
PRINT 'Initial events populated from existing contracts.'