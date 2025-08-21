-- =====================================================
-- SISTEMA DE GERAÇÃO DE BOLETOS PARA LOCATÁRIOS
-- Migration 006 - Criação das tabelas do sistema de boletos
-- =====================================================

-- Primeira, vamos atualizar a tabela de contratos para incluir todos os campos necessários
-- Verificar campos existentes e adicionar os que faltam

-- Adicionar campos que faltam na tabela contratos (se não existirem)
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'contratos' AND COLUMN_NAME = 'valor_energia')
    ALTER TABLE contratos ADD valor_energia DECIMAL(10,2) DEFAULT 0;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'contratos' AND COLUMN_NAME = 'valor_gas')
    ALTER TABLE contratos ADD valor_gas DECIMAL(10,2) DEFAULT 0;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'contratos' AND COLUMN_NAME = 'valor_fci')
    ALTER TABLE contratos ADD valor_fci DECIMAL(10,2) DEFAULT 0;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'contratos' AND COLUMN_NAME = 'desconto_pontualidade')
    ALTER TABLE contratos ADD desconto_pontualidade DECIMAL(10,2) DEFAULT 0;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'contratos' AND COLUMN_NAME = 'desconto_benfeitoria_1')
    ALTER TABLE contratos ADD desconto_benfeitoria_1 DECIMAL(10,2) DEFAULT 0;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'contratos' AND COLUMN_NAME = 'desconto_benfeitoria_2')
    ALTER TABLE contratos ADD desconto_benfeitoria_2 DECIMAL(10,2) DEFAULT 0;

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'contratos' AND COLUMN_NAME = 'desconto_benfeitoria_3')
    ALTER TABLE contratos ADD desconto_benfeitoria_3 DECIMAL(10,2) DEFAULT 0;

-- Adicionar campo de valor do seguro incêndio se não existir
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'contratos' AND COLUMN_NAME = 'valor_seguro_incendio')
    ALTER TABLE contratos ADD valor_seguro_incendio DECIMAL(10,2) DEFAULT 0;

-- Adicionar campo de valor do seguro fiança se não existir  
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'contratos' AND COLUMN_NAME = 'valor_seguro_fianca')
    ALTER TABLE contratos ADD valor_seguro_fianca DECIMAL(10,2) DEFAULT 0;

-- ============================
-- TABELA: BOLETOS
-- ============================
CREATE TABLE boletos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contrato_id INT NOT NULL FOREIGN KEY REFERENCES contratos(id),
    
    -- Período de referência
    mes_referencia INT NOT NULL, -- 1-12
    ano_referencia INT NOT NULL,
    
    -- Datas importantes
    data_vencimento DATE NOT NULL,
    data_pagamento DATE NULL,
    data_geracao DATETIME DEFAULT GETDATE(),
    
    -- Valores calculados
    valor_total DECIMAL(10,2) NOT NULL,
    valor_acrescimos DECIMAL(10,2) DEFAULT 0,
    dias_atraso INT DEFAULT 0,
    
    -- Status do pagamento
    status_pagamento VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, PAGO, ATRASADO, CANCELADO
    
    -- Observações
    observacoes TEXT NULL,
    
    -- Controle
    ativo BIT DEFAULT 1,
    usuario_geracao INT NULL,
    data_atualizacao DATETIME DEFAULT GETDATE(),
    
    -- Índices
    INDEX IDX_boletos_contrato (contrato_id),
    INDEX IDX_boletos_referencia (mes_referencia, ano_referencia),
    INDEX IDX_boletos_vencimento (data_vencimento),
    INDEX IDX_boletos_status (status_pagamento),
    
    -- Constraint para evitar duplicação
    CONSTRAINT UK_boletos_contrato_periodo UNIQUE (contrato_id, mes_referencia, ano_referencia)
);

-- ============================
-- TABELA: COMPONENTES_BOLETO
-- ============================
CREATE TABLE componentes_boleto (
    id INT IDENTITY(1,1) PRIMARY KEY,
    boleto_id INT NOT NULL FOREIGN KEY REFERENCES boletos(id) ON DELETE CASCADE,
    
    -- Tipo do componente
    tipo_componente VARCHAR(50) NOT NULL, -- ALUGUEL, IPTU, SEGURO_FIANCA, SEGURO_INCENDIO, CONDOMINIO, ENERGIA, GAS, FCI, DESCONTO_PONTUALIDADE, DESCONTO_BENFEITORIA_1, etc.
    descricao VARCHAR(255) NOT NULL,
    
    -- Valores
    valor_original DECIMAL(10,2) NOT NULL, -- Valor base do contrato
    valor_final DECIMAL(10,2) NOT NULL, -- Valor final após acréscimos
    
    -- Acréscimos por atraso
    tem_acrescimo BIT DEFAULT 0, -- Se este componente pode ter acréscimo por atraso
    percentual_acrescimo DECIMAL(5,4) DEFAULT 0, -- Percentual aplicado
    valor_acrescimo_juros DECIMAL(10,2) DEFAULT 0, -- 1% ao mês
    valor_acrescimo_multa DECIMAL(10,2) DEFAULT 0, -- 2% sobre valor
    valor_acrescimo_correcao DECIMAL(10,2) DEFAULT 0, -- IGPM/IPCA
    
    -- Controle
    data_calculo DATETIME DEFAULT GETDATE(),
    
    -- Índices
    INDEX IDX_componentes_boleto_id (boleto_id),
    INDEX IDX_componentes_tipo (tipo_componente)
);

-- ============================
-- TABELA: HISTORICO_BOLETOS
-- ============================
CREATE TABLE historico_boletos (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    boleto_id INT NOT NULL FOREIGN KEY REFERENCES boletos(id),
    
    -- Ação realizada
    acao VARCHAR(50) NOT NULL, -- GERADO, ENVIADO, PAGO, CANCELADO, RECALCULADO
    descricao TEXT NULL,
    
    -- Dados antes/depois (para auditoria)
    valor_anterior DECIMAL(10,2) NULL,
    valor_novo DECIMAL(10,2) NULL,
    
    -- Contexto
    usuario_id INT NULL,
    ip_origem VARCHAR(45) NULL,
    data_acao DATETIME DEFAULT GETDATE(),
    
    -- Índices
    INDEX IDX_historico_boleto (boleto_id),
    INDEX IDX_historico_data (data_acao)
);

-- ============================
-- TABELA: INDICES_CORRECAO
-- ============================
CREATE TABLE indices_correcao (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Tipo do índice
    nome_indice VARCHAR(10) NOT NULL, -- IGPM, IPCA, INCC, etc.
    
    -- Período
    mes INT NOT NULL, -- 1-12
    ano INT NOT NULL,
    
    -- Valor do índice
    valor_percentual DECIMAL(8,4) NOT NULL, -- Ex: 0.5234 para 0.5234%
    
    -- Controle
    data_cadastro DATETIME DEFAULT GETDATE(),
    fonte VARCHAR(255) NULL, -- IBGE, FGV, etc.
    
    -- Índices
    INDEX IDX_indices_tipo_periodo (nome_indice, ano, mes),
    
    -- Constraint única
    CONSTRAINT UK_indices_periodo UNIQUE (nome_indice, mes, ano)
);

-- ============================
-- VIEW: BOLETOS_COMPLETOS
-- ============================
CREATE VIEW vw_boletos_completos AS
SELECT 
    b.*,
    
    -- Dados do contrato
    c.valor_aluguel,
    c.valor_condominio,
    c.valor_iptu,
    c.valor_seguro_fianca,
    c.valor_seguro_incendio,
    c.valor_energia,
    c.valor_gas,
    c.valor_fci,
    c.desconto_pontualidade,
    c.desconto_benfeitoria_1,
    c.desconto_benfeitoria_2,
    c.desconto_benfeitoria_3,
    
    -- Dados do locatário
    lct.nome as locatario_nome,
    lct.cpf_cnpj as locatario_cpf,
    lct.email as locatario_email,
    lct.telefone as locatario_telefone,
    
    -- Dados do imóvel
    i.endereco_rua + ', ' + ISNULL(i.endereco_numero, '') as imovel_endereco_completo,
    i.endereco_bairro,
    i.endereco_cidade,
    i.endereco_cep,
    
    -- Cálculos
    CASE 
        WHEN b.data_pagamento IS NULL AND b.data_vencimento < GETDATE() 
        THEN DATEDIFF(day, b.data_vencimento, GETDATE())
        ELSE 0 
    END as dias_atraso_calculado,
    
    -- Total de componentes
    (SELECT COUNT(*) FROM componentes_boleto WHERE boleto_id = b.id) as total_componentes,
    (SELECT SUM(valor_final) FROM componentes_boleto WHERE boleto_id = b.id) as valor_total_calculado

FROM boletos b
LEFT JOIN contratos c ON b.contrato_id = c.id
LEFT JOIN locatarios lct ON c.locatario_id = lct.id
LEFT JOIN imoveis i ON c.imovel_id = i.id;

-- ============================
-- STORED PROCEDURES
-- ============================

-- Procedure para gerar boleto com todos os componentes
CREATE PROCEDURE sp_gerar_boleto
    @contrato_id INT,
    @mes_referencia INT,
    @ano_referencia INT,
    @data_vencimento DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @boleto_id INT;
    DECLARE @valor_total DECIMAL(10,2) = 0;
    
    -- Verificar se já existe boleto para este período
    IF EXISTS (SELECT 1 FROM boletos WHERE contrato_id = @contrato_id AND mes_referencia = @mes_referencia AND ano_referencia = @ano_referencia)
    BEGIN
        RAISERROR('Já existe boleto para este contrato no período informado', 16, 1);
        RETURN;
    END
    
    -- Verificar se contrato existe e está ativo
    IF NOT EXISTS (SELECT 1 FROM contratos WHERE id = @contrato_id AND status = 'ATIVO')
    BEGIN
        RAISERROR('Contrato não encontrado ou inativo', 16, 1);
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    TRY
        -- Criar o boleto
        INSERT INTO boletos (contrato_id, mes_referencia, ano_referencia, data_vencimento, valor_total)
        VALUES (@contrato_id, @mes_referencia, @ano_referencia, @data_vencimento, 0);
        
        SET @boleto_id = SCOPE_IDENTITY();
        
        -- Inserir componentes do boleto baseados no contrato
        DECLARE @valor_aluguel DECIMAL(10,2);
        DECLARE @valor_iptu DECIMAL(10,2);
        DECLARE @valor_seguro_fianca DECIMAL(10,2);
        DECLARE @valor_seguro_incendio DECIMAL(10,2);
        DECLARE @valor_condominio DECIMAL(10,2);
        DECLARE @valor_energia DECIMAL(10,2);
        DECLARE @valor_gas DECIMAL(10,2);
        DECLARE @valor_fci DECIMAL(10,2);
        DECLARE @desconto_pontualidade DECIMAL(10,2);
        DECLARE @desconto_benfeitoria_1 DECIMAL(10,2);
        DECLARE @desconto_benfeitoria_2 DECIMAL(10,2);
        DECLARE @desconto_benfeitoria_3 DECIMAL(10,2);
        
        -- Buscar valores do contrato
        SELECT 
            @valor_aluguel = ISNULL(valor_aluguel, 0),
            @valor_iptu = ISNULL(valor_iptu, 0),
            @valor_seguro_fianca = ISNULL(valor_seguro_fianca, 0),
            @valor_seguro_incendio = ISNULL(valor_seguro_incendio, 0),
            @valor_condominio = ISNULL(valor_condominio, 0),
            @valor_energia = ISNULL(valor_energia, 0),
            @valor_gas = ISNULL(valor_gas, 0),
            @valor_fci = ISNULL(valor_fci, 0),
            @desconto_pontualidade = ISNULL(desconto_pontualidade, 0),
            @desconto_benfeitoria_1 = ISNULL(desconto_benfeitoria_1, 0),
            @desconto_benfeitoria_2 = ISNULL(desconto_benfeitoria_2, 0),
            @desconto_benfeitoria_3 = ISNULL(desconto_benfeitoria_3, 0)
        FROM contratos 
        WHERE id = @contrato_id;
        
        -- Inserir componentes base (sempre incluídos)
        
        -- Aluguel
        IF @valor_aluguel > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'ALUGUEL', 'Aluguel mensal', @valor_aluguel, @valor_aluguel, 1);
            SET @valor_total = @valor_total + @valor_aluguel;
        END
        
        -- IPTU
        IF @valor_iptu > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'IPTU', 'IPTU mensal', @valor_iptu, @valor_iptu, 0);
            SET @valor_total = @valor_total + @valor_iptu;
        END
        
        -- Seguro Fiança
        IF @valor_seguro_fianca > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'SEGURO_FIANCA', 'Seguro Fiança', @valor_seguro_fianca, @valor_seguro_fianca, 1);
            SET @valor_total = @valor_total + @valor_seguro_fianca;
        END
        
        -- Seguro Incêndio
        IF @valor_seguro_incendio > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'SEGURO_INCENDIO', 'Seguro Incêndio', @valor_seguro_incendio, @valor_seguro_incendio, 1);
            SET @valor_total = @valor_total + @valor_seguro_incendio;
        END
        
        -- Condomínio
        IF @valor_condominio > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'CONDOMINIO', 'Condomínio', @valor_condominio, @valor_condominio, 1);
            SET @valor_total = @valor_total + @valor_condominio;
        END
        
        -- Energia Elétrica
        IF @valor_energia > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'ENERGIA', 'Energia Elétrica', @valor_energia, @valor_energia, 0);
            SET @valor_total = @valor_total + @valor_energia;
        END
        
        -- Gás
        IF @valor_gas > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'GAS', 'Gás', @valor_gas, @valor_gas, 0);
            SET @valor_total = @valor_total + @valor_gas;
        END
        
        -- FCI
        IF @valor_fci > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'FCI', 'FCI', @valor_fci, @valor_fci, 1);
            SET @valor_total = @valor_total + @valor_fci;
        END
        
        -- Descontos (valores negativos)
        IF @desconto_pontualidade > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'DESCONTO_PONTUALIDADE', 'Desconto Pontualidade', -@desconto_pontualidade, -@desconto_pontualidade, 0);
            SET @valor_total = @valor_total - @desconto_pontualidade;
        END
        
        IF @desconto_benfeitoria_1 > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'DESCONTO_BENFEITORIA_1', 'Desconto Benfeitoria 1', -@desconto_benfeitoria_1, -@desconto_benfeitoria_1, 0);
            SET @valor_total = @valor_total - @desconto_benfeitoria_1;
        END
        
        IF @desconto_benfeitoria_2 > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'DESCONTO_BENFEITORIA_2', 'Desconto Benfeitoria 2', -@desconto_benfeitoria_2, -@desconto_benfeitoria_2, 0);
            SET @valor_total = @valor_total - @desconto_benfeitoria_2;
        END
        
        IF @desconto_benfeitoria_3 > 0
        BEGIN
            INSERT INTO componentes_boleto (boleto_id, tipo_componente, descricao, valor_original, valor_final, tem_acrescimo)
            VALUES (@boleto_id, 'DESCONTO_BENFEITORIA_3', 'Desconto Benfeitoria 3', -@desconto_benfeitoria_3, -@desconto_benfeitoria_3, 0);
            SET @valor_total = @valor_total - @desconto_benfeitoria_3;
        END
        
        -- Atualizar valor total do boleto
        UPDATE boletos SET valor_total = @valor_total WHERE id = @boleto_id;
        
        -- Registrar histórico
        INSERT INTO historico_boletos (boleto_id, acao, descricao, valor_novo)
        VALUES (@boleto_id, 'GERADO', 'Boleto gerado automaticamente', @valor_total);
        
        COMMIT TRANSACTION;
        
        -- Retornar ID do boleto criado
        SELECT @boleto_id as boleto_id, @valor_total as valor_total;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;

-- ============================
-- DADOS INICIAIS
-- ============================

-- Inserir alguns índices de correção de exemplo (dados fictícios para teste)
INSERT INTO indices_correcao (nome_indice, mes, ano, valor_percentual, fonte) VALUES
('IGPM', 1, 2024, 0.62, 'FGV'),
('IGPM', 2, 2024, 0.45, 'FGV'),
('IGPM', 3, 2024, 0.21, 'FGV'),
('IPCA', 1, 2024, 0.42, 'IBGE'),
('IPCA', 2, 2024, 0.83, 'IBGE'),
('IPCA', 3, 2024, 0.16, 'IBGE');

PRINT 'Migration 006 - Sistema de Boletos criado com sucesso!';