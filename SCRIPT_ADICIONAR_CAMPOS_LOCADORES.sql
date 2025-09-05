-- SCRIPT PARA ADICIONAR CAMPOS FALTANTES NO MÓDULO LOCADORES
-- Execução cuidadosa com verificação de existência dos campos

USE [Cobimob]
GO

PRINT 'Iniciando script de adição de campos faltantes para Locadores...'

-- ===================================================
-- 1. ADICIONAR CAMPOS FALTANTES NA TABELA LOCADORES
-- ===================================================

PRINT '1. Verificando campos faltantes na tabela Locadores...'

-- 1.1. regime_bens (para casados)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locadores]') AND name = N'regime_bens')
BEGIN
    ALTER TABLE [dbo].[Locadores] ADD [regime_bens] nvarchar(100) NULL
    PRINT '✅ Campo regime_bens adicionado com sucesso'
END
ELSE
    PRINT '⚪ Campo regime_bens já existe'

-- 1.2. data_constituicao (para PJ)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locadores]') AND name = N'data_constituicao')
BEGIN
    ALTER TABLE [dbo].[Locadores] ADD [data_constituicao] date NULL
    PRINT '✅ Campo data_constituicao adicionado com sucesso'
END
ELSE
    PRINT '⚪ Campo data_constituicao já existe'

-- 1.3. capital_social (para PJ)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locadores]') AND name = N'capital_social')
BEGIN
    ALTER TABLE [dbo].[Locadores] ADD [capital_social] decimal(18,2) NULL
    PRINT '✅ Campo capital_social adicionado com sucesso'
END
ELSE
    PRINT '⚪ Campo capital_social já existe'

-- 1.4. porte_empresa (para PJ)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locadores]') AND name = N'porte_empresa')
BEGIN
    ALTER TABLE [dbo].[Locadores] ADD [porte_empresa] nvarchar(50) NULL
    PRINT '✅ Campo porte_empresa adicionado com sucesso'
END
ELSE
    PRINT '⚪ Campo porte_empresa já existe'

-- 1.5. regime_tributario (para PJ)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locadores]') AND name = N'regime_tributario')
BEGIN
    ALTER TABLE [dbo].[Locadores] ADD [regime_tributario] nvarchar(50) NULL
    PRINT '✅ Campo regime_tributario adicionado com sucesso'
END
ELSE
    PRINT '⚪ Campo regime_tributario já existe'

-- 1.6. email_recebimento (para prestação de contas)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locadores]') AND name = N'email_recebimento')
BEGIN
    ALTER TABLE [dbo].[Locadores] ADD [email_recebimento] nvarchar(100) NULL
    PRINT '✅ Campo email_recebimento adicionado com sucesso'
END
ELSE
    PRINT '⚪ Campo email_recebimento já existe'

-- 1.7. observacoes_especiais (para prestação de contas)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locadores]') AND name = N'observacoes_especiais')
BEGIN
    ALTER TABLE [dbo].[Locadores] ADD [observacoes_especiais] nvarchar(1000) NULL
    PRINT '✅ Campo observacoes_especiais adicionado com sucesso'
END
ELSE
    PRINT '⚪ Campo observacoes_especiais já existe'

-- 1.8. usa_multiplos_metodos (flag para múltiplos telefones/emails)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locadores]') AND name = N'usa_multiplos_metodos')
BEGIN
    ALTER TABLE [dbo].[Locadores] ADD [usa_multiplos_metodos] bit NULL
    PRINT '✅ Campo usa_multiplos_metodos adicionado com sucesso'
END
ELSE
    PRINT '⚪ Campo usa_multiplos_metodos já existe'

-- 1.9. usa_multiplas_contas (flag para múltiplas contas bancárias)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locadores]') AND name = N'usa_multiplas_contas')
BEGIN
    ALTER TABLE [dbo].[Locadores] ADD [usa_multiplas_contas] bit NULL
    PRINT '✅ Campo usa_multiplas_contas adicionado com sucesso'
END
ELSE
    PRINT '⚪ Campo usa_multiplas_contas já existe'

-- ===================================================
-- 2. ADICIONAR CAMPOS FALTANTES NA TABELA RepresentanteLegalLocador
-- ===================================================

PRINT '2. Verificando campos faltantes na tabela RepresentanteLegalLocador...'

-- 2.1. data_nascimento
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[RepresentanteLegalLocador]') AND name = N'data_nascimento')
BEGIN
    ALTER TABLE [dbo].[RepresentanteLegalLocador] ADD [data_nascimento] date NULL
    PRINT '✅ Campo data_nascimento adicionado em RepresentanteLegalLocador'
END
ELSE
    PRINT '⚪ Campo data_nascimento já existe em RepresentanteLegalLocador'

-- 2.2. nacionalidade
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[RepresentanteLegalLocador]') AND name = N'nacionalidade')
BEGIN
    ALTER TABLE [dbo].[RepresentanteLegalLocador] ADD [nacionalidade] nvarchar(50) NULL
    PRINT '✅ Campo nacionalidade adicionado em RepresentanteLegalLocador'
END
ELSE
    PRINT '⚪ Campo nacionalidade já existe em RepresentanteLegalLocador'

-- 2.3. estado_civil
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[RepresentanteLegalLocador]') AND name = N'estado_civil')
BEGIN
    ALTER TABLE [dbo].[RepresentanteLegalLocador] ADD [estado_civil] nvarchar(30) NULL
    PRINT '✅ Campo estado_civil adicionado em RepresentanteLegalLocador'
END
ELSE
    PRINT '⚪ Campo estado_civil já existe em RepresentanteLegalLocador'

-- 2.4. profissao
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[RepresentanteLegalLocador]') AND name = N'profissao')
BEGIN
    ALTER TABLE [dbo].[RepresentanteLegalLocador] ADD [profissao] nvarchar(100) NULL
    PRINT '✅ Campo profissao adicionado em RepresentanteLegalLocador'
END
ELSE
    PRINT '⚪ Campo profissao já existe em RepresentanteLegalLocador'

-- ===================================================
-- 3. CRIAR TABELA DE FORMAS DE RECEBIMENTO (SE NÃO EXISTIR)
-- ===================================================

PRINT '3. Verificando tabela FormasRecebimentoLocador...'

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[FormasRecebimentoLocador]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[FormasRecebimentoLocador](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [locador_id] [int] NOT NULL,
        [forma_recebimento] [nvarchar](20) NOT NULL,
        [ativo] [bit] NOT NULL DEFAULT(1),
        [data_cadastro] [datetime] NOT NULL DEFAULT(GETDATE()),
        CONSTRAINT [PK_FormasRecebimentoLocador] PRIMARY KEY CLUSTERED ([id] ASC),
        CONSTRAINT [FK_FormasRecebimentoLocador_Locador] FOREIGN KEY([locador_id]) 
            REFERENCES [dbo].[Locadores] ([id])
    )
    PRINT '✅ Tabela FormasRecebimentoLocador criada com sucesso'
END
ELSE
    PRINT '⚪ Tabela FormasRecebimentoLocador já existe'

-- ===================================================
-- 4. VERIFICAR INTEGRIDADE DAS TABELAS EXISTENTES
-- ===================================================

PRINT '4. Verificando integridade das tabelas...'

-- Verificar se as tabelas relacionadas existem
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[EnderecoLocador]') AND type in (N'U'))
    PRINT '✅ Tabela EnderecoLocador existe'
ELSE
    PRINT '❌ ATENÇÃO: Tabela EnderecoLocador NÃO existe!'

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ContasBancariasLocador]') AND type in (N'U'))
    PRINT '✅ Tabela ContasBancariasLocador existe'
ELSE
    PRINT '❌ ATENÇÃO: Tabela ContasBancariasLocador NÃO existe!'

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RepresentanteLegalLocador]') AND type in (N'U'))
    PRINT '✅ Tabela RepresentanteLegalLocador existe'
ELSE
    PRINT '❌ ATENÇÃO: Tabela RepresentanteLegalLocador NÃO existe!'

-- ===================================================
-- 5. DEFINIR VALORES PADRÃO PARA CAMPOS EXISTENTES
-- ===================================================

PRINT '5. Configurando valores padrão...'

-- Garantir que locadores ativos tenham flag ativo = 1
UPDATE [dbo].[Locadores] 
SET [ativo] = 1 
WHERE [ativo] IS NULL

-- Definir valores padrão para novos campos booleanos
UPDATE [dbo].[Locadores] 
SET 
    [usa_multiplos_metodos] = 0,
    [usa_multiplas_contas] = 0
WHERE [usa_multiplos_metodos] IS NULL OR [usa_multiplas_contas] IS NULL

PRINT '✅ Valores padrão configurados'

-- ===================================================
-- 6. RESUMO FINAL
-- ===================================================

PRINT '6. Resumo da execução:'
PRINT '================================'

-- Contar campos na tabela Locadores
DECLARE @campos_locadores INT
SELECT @campos_locadores = COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Locadores]')
PRINT 'Total de campos na tabela Locadores: ' + CAST(@campos_locadores AS VARCHAR(10))

-- Contar campos na tabela RepresentanteLegalLocador
DECLARE @campos_representante INT
SELECT @campos_representante = COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[RepresentanteLegalLocador]')
PRINT 'Total de campos na tabela RepresentanteLegalLocador: ' + CAST(@campos_representante AS VARCHAR(10))

-- Contar locadores ativos
DECLARE @locadores_ativos INT
SELECT @locadores_ativos = COUNT(*) FROM [dbo].[Locadores] WHERE [ativo] = 1
PRINT 'Total de locadores ativos: ' + CAST(@locadores_ativos AS VARCHAR(10))

PRINT '================================'
PRINT '✅ Script executado com sucesso!'
PRINT 'PRÓXIMOS PASSOS:'
PRINT '1. Testar as APIs de locadores'
PRINT '2. Testar o frontend'
PRINT '3. Verificar integridade dos dados'
PRINT '================================'

GO