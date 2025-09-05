-- SCRIPT PARA CRIAR TABELAS DE MÚLTIPLOS CONTATOS PARA LOCADORES
-- Execução cuidadosa com verificação de existência das tabelas

USE [Cobimob]
GO

PRINT 'Iniciando script de criação de tabelas para múltiplos contatos...'

-- ===================================================
-- 1. CRIAR TABELA PARA MÚLTIPLOS TELEFONES
-- ===================================================

PRINT '1. Verificando tabela TelefonesLocador...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TelefonesLocador]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TelefonesLocador](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [locador_id] [int] NOT NULL,
        [telefone] [nvarchar](20) NOT NULL,
        [tipo] [nvarchar](20) NULL DEFAULT('Celular'),
        [principal] [bit] NOT NULL DEFAULT(0),
        [ativo] [bit] NOT NULL DEFAULT(1),
        [data_cadastro] [datetime] NOT NULL DEFAULT(GETDATE()),
        CONSTRAINT [PK_TelefonesLocador] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_TelefonesLocador_Locador] FOREIGN KEY([locador_id]) 
            REFERENCES [dbo].[Locadores] ([id]) ON DELETE CASCADE
    )
    PRINT '✅ Tabela TelefonesLocador criada com sucesso'
END
ELSE
    PRINT '⚪ Tabela TelefonesLocador já existe'

-- ===================================================
-- 2. CRIAR TABELA PARA MÚLTIPLOS EMAILS
-- ===================================================

PRINT '2. Verificando tabela EmailsLocador...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EmailsLocador]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[EmailsLocador](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [locador_id] [int] NOT NULL,
        [email] [nvarchar](100) NOT NULL,
        [tipo] [nvarchar](20) NULL DEFAULT('Comercial'),
        [principal] [bit] NOT NULL DEFAULT(0),
        [ativo] [bit] NOT NULL DEFAULT(1),
        [data_cadastro] [datetime] NOT NULL DEFAULT(GETDATE()),
        CONSTRAINT [PK_EmailsLocador] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_EmailsLocador_Locador] FOREIGN KEY([locador_id]) 
            REFERENCES [dbo].[Locadores] ([id]) ON DELETE CASCADE
    )
    PRINT '✅ Tabela EmailsLocador criada com sucesso'
END
ELSE
    PRINT '⚪ Tabela EmailsLocador já existe'

-- ===================================================
-- 3. CRIAR ÍNDICES PARA PERFORMANCE
-- ===================================================

PRINT '3. Criando índices...'

-- Índice para telefones por locador
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[TelefonesLocador]') AND name = N'IX_TelefonesLocador_LocadorId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_TelefonesLocador_LocadorId] ON [dbo].[TelefonesLocador]
    (
        [locador_id] ASC
    )
    PRINT '✅ Índice IX_TelefonesLocador_LocadorId criado'
END

-- Índice para emails por locador
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE object_id = OBJECT_ID(N'[dbo].[EmailsLocador]') AND name = N'IX_EmailsLocador_LocadorId')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_EmailsLocador_LocadorId] ON [dbo].[EmailsLocador]
    (
        [locador_id] ASC
    )
    PRINT '✅ Índice IX_EmailsLocador_LocadorId criado'
END

-- ===================================================
-- 4. MIGRAR DADOS EXISTENTES
-- ===================================================

PRINT '4. Migrando dados existentes...'

-- Migrar telefones existentes
INSERT INTO [dbo].[TelefonesLocador] (locador_id, telefone, principal, ativo)
SELECT id, telefone, 1, 1
FROM [dbo].[Locadores] 
WHERE telefone IS NOT NULL AND telefone != ''
AND NOT EXISTS (SELECT 1 FROM [dbo].[TelefonesLocador] WHERE locador_id = [Locadores].id AND telefone = [Locadores].telefone)

PRINT '✅ Telefones migrados'

-- Migrar emails existentes
INSERT INTO [dbo].[EmailsLocador] (locador_id, email, principal, ativo)
SELECT id, email, 1, 1
FROM [dbo].[Locadores] 
WHERE email IS NOT NULL AND email != ''
AND NOT EXISTS (SELECT 1 FROM [dbo].[EmailsLocador] WHERE locador_id = [Locadores].id AND email = [Locadores].email)

PRINT '✅ Emails migrados'

-- ===================================================
-- 5. RESUMO FINAL
-- ===================================================

PRINT '5. Resumo da execução:'
PRINT '================================'

-- Contar telefones
DECLARE @telefones_count INT
SELECT @telefones_count = COUNT(*) FROM [dbo].[TelefonesLocador]
PRINT 'Total de telefones cadastrados: ' + CAST(@telefones_count AS VARCHAR(10))

-- Contar emails
DECLARE @emails_count INT
SELECT @emails_count = COUNT(*) FROM [dbo].[EmailsLocador]
PRINT 'Total de emails cadastrados: ' + CAST(@emails_count AS VARCHAR(10))

-- Contar locadores com múltiplos telefones
DECLARE @multi_telefones INT
SELECT @multi_telefones = COUNT(DISTINCT locador_id) FROM [dbo].[TelefonesLocador] 
WHERE locador_id IN (SELECT locador_id FROM [dbo].[TelefonesLocador] GROUP BY locador_id HAVING COUNT(*) > 1)
PRINT 'Locadores com múltiplos telefones: ' + CAST(@multi_telefones AS VARCHAR(10))

-- Contar locadores com múltiplos emails
DECLARE @multi_emails INT
SELECT @multi_emails = COUNT(DISTINCT locador_id) FROM [dbo].[EmailsLocador] 
WHERE locador_id IN (SELECT locador_id FROM [dbo].[EmailsLocador] GROUP BY locador_id HAVING COUNT(*) > 1)
PRINT 'Locadores com múltiplos emails: ' + CAST(@multi_emails AS VARCHAR(10))

PRINT '================================'
PRINT '✅ Script executado com sucesso!'
PRINT 'PRÓXIMOS PASSOS:'
PRINT '1. Atualizar repository Python para usar as novas tabelas'
PRINT '2. Testar inserção e busca de múltiplos contatos'
PRINT '3. Atualizar frontend para carregar dados das novas tabelas'
PRINT '================================'

GO