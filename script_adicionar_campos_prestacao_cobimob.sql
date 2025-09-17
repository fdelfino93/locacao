-- =====================================================================
-- SCRIPT PARA ADICIONAR CAMPOS NA TABELA PrestacaoContas
-- BANCO: Cobimob
-- VERSÃO: 1.0
-- DATA: 17/09/2025
-- DESCRIÇÃO: Adiciona campos para solução híbrida de prestações
-- COMPATIBILIDADE: Total - não quebra funcionalidades existentes
-- =====================================================================

-- Conectar ao banco correto
USE [Cobimob]
GO

-- Verificar se a tabela existe
IF OBJECT_ID('dbo.PrestacaoContas', 'U') IS NOT NULL
BEGIN
    PRINT '✅ Tabela PrestacaoContas encontrada no banco Cobimob. Iniciando adição de campos...'

    -- Adicionar campo valor_boleto (se não existir)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_NAME = 'PrestacaoContas' AND COLUMN_NAME = 'valor_boleto')
    BEGIN
        ALTER TABLE [dbo].[PrestacaoContas] ADD [valor_boleto] DECIMAL(10,2) NULL
        PRINT '✅ Campo [valor_boleto] adicionado com sucesso'
    END
    ELSE
        PRINT '⚠️ Campo [valor_boleto] já existe'

    -- Adicionar campo total_retido (se não existir)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_NAME = 'PrestacaoContas' AND COLUMN_NAME = 'total_retido')
    BEGIN
        ALTER TABLE [dbo].[PrestacaoContas] ADD [total_retido] DECIMAL(10,2) NULL
        PRINT '✅ Campo [total_retido] adicionado com sucesso'
    END
    ELSE
        PRINT '⚠️ Campo [total_retido] já existe'

    -- Adicionar campo valor_repasse (se não existir)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_NAME = 'PrestacaoContas' AND COLUMN_NAME = 'valor_repasse')
    BEGIN
        ALTER TABLE [dbo].[PrestacaoContas] ADD [valor_repasse] DECIMAL(10,2) NULL
        PRINT '✅ Campo [valor_repasse] adicionado com sucesso'
    END
    ELSE
        PRINT '⚠️ Campo [valor_repasse] já existe'

    -- Adicionar campo tipo_calculo (se não existir)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_NAME = 'PrestacaoContas' AND COLUMN_NAME = 'tipo_calculo')
    BEGIN
        ALTER TABLE [dbo].[PrestacaoContas] ADD [tipo_calculo] VARCHAR(20) NULL
        PRINT '✅ Campo [tipo_calculo] adicionado com sucesso'
    END
    ELSE
        PRINT '⚠️ Campo [tipo_calculo] já existe'

    -- Adicionar campo multa_rescisoria (se não existir)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_NAME = 'PrestacaoContas' AND COLUMN_NAME = 'multa_rescisoria')
    BEGIN
        ALTER TABLE [dbo].[PrestacaoContas] ADD [multa_rescisoria] DECIMAL(10,2) NULL
        PRINT '✅ Campo [multa_rescisoria] adicionado com sucesso'
    END
    ELSE
        PRINT '⚠️ Campo [multa_rescisoria] já existe'

    -- Adicionar campo detalhamento_json (se não existir)
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_NAME = 'PrestacaoContas' AND COLUMN_NAME = 'detalhamento_json')
    BEGIN
        ALTER TABLE [dbo].[PrestacaoContas] ADD [detalhamento_json] TEXT NULL
        PRINT '✅ Campo [detalhamento_json] adicionado com sucesso'
    END
    ELSE
        PRINT '⚠️ Campo [detalhamento_json] já existe'

    PRINT ''
    PRINT '🎯 RESUMO DA EXECUÇÃO:'
    PRINT '================================'

    -- Verificar todos os campos adicionados
    SELECT
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'PrestacaoContas'
    AND COLUMN_NAME IN ('valor_boleto', 'total_retido', 'valor_repasse', 'tipo_calculo', 'multa_rescisoria', 'detalhamento_json')
    ORDER BY COLUMN_NAME

    PRINT ''
    PRINT '✅ SCRIPT EXECUTADO COM SUCESSO NO BANCO COBIMOB!'
    PRINT '✅ TODOS OS CAMPOS SÃO NULL = COMPATIBILIDADE TOTAL'
    PRINT '✅ FUNCIONALIDADES EXISTENTES PRESERVADAS'

END
ELSE
BEGIN
    PRINT '❌ ERRO: Tabela PrestacaoContas não encontrada no banco Cobimob!'
    PRINT '❌ Verifique se o banco de dados está correto'
END

-- =====================================================================
-- FIM DO SCRIPT
-- =====================================================================