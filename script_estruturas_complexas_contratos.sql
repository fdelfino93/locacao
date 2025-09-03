-- ==========================================
-- SCRIPT COMPLETO - ESTRUTURAS COMPLEXAS PARA CONTRATOS
-- ==========================================
-- Implementar: Múltiplos locadores/locatários, pets, garantias individuais
-- Data: 02/09/2025
-- Versão: 1.0

USE locacao;
GO

PRINT '===========================================';
PRINT 'IMPLEMENTANDO ESTRUTURAS COMPLEXAS PARA CONTRATOS';
PRINT 'Múltiplos locadores, locatários, pets e garantias individuais';
PRINT '===========================================';

-- ==========================================
-- 1. MÚLTIPLOS LOCATÁRIOS POR CONTRATO
-- ==========================================

PRINT 'Criando estrutura para múltiplos locatários...';

-- Verificar se tabela já existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ContratoLocatarios')
BEGIN
    CREATE TABLE ContratoLocatarios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        contrato_id INT NOT NULL,
        locatario_id INT NOT NULL,
        responsabilidade_principal BIT DEFAULT 0,
        percentual_responsabilidade DECIMAL(5,2) DEFAULT 100.00,
        data_entrada DATE NULL,
        data_saida DATE NULL,
        observacoes TEXT NULL,
        ativo BIT DEFAULT 1,
        data_criacao DATETIME2 DEFAULT GETDATE(),
        data_atualizacao DATETIME2 DEFAULT GETDATE(),
        
        CONSTRAINT FK_ContratoLocatarios_Contrato 
            FOREIGN KEY (contrato_id) REFERENCES Contratos(id) ON DELETE CASCADE,
        CONSTRAINT FK_ContratoLocatarios_Locatario 
            FOREIGN KEY (locatario_id) REFERENCES Locatarios(id),
        CONSTRAINT UC_ContratoLocatarios_Unico 
            UNIQUE (contrato_id, locatario_id),
        CONSTRAINT CK_ContratoLocatarios_Percentual 
            CHECK (percentual_responsabilidade > 0 AND percentual_responsabilidade <= 100)
    );
    
    PRINT '✓ Tabela ContratoLocatarios criada';
    
    -- Migrar dados existentes
    INSERT INTO ContratoLocatarios (contrato_id, locatario_id, responsabilidade_principal, percentual_responsabilidade)
    SELECT id, id_locatario, 1, 100.00 
    FROM Contratos 
    WHERE id_locatario IS NOT NULL;
    
    PRINT '✓ Dados migrados para ContratoLocatarios';
END
ELSE
BEGIN
    PRINT '• Tabela ContratoLocatarios já existe';
END

-- ==========================================
-- 2. SISTEMA DE PETS POR CONTRATO
-- ==========================================

PRINT 'Criando estrutura para pets por contrato...';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ContratoPets')
BEGIN
    CREATE TABLE ContratoPets (
        id INT IDENTITY(1,1) PRIMARY KEY,
        contrato_id INT NOT NULL,
        nome NVARCHAR(100) NOT NULL,
        especie NVARCHAR(50) NOT NULL DEFAULT 'Cão',
        raca NVARCHAR(100) NULL,
        tamanho NVARCHAR(20) NULL CHECK (tamanho IN ('Pequeno', 'Médio', 'Grande', 'Gigante')),
        idade INT NULL,
        peso_kg DECIMAL(5,2) NULL,
        cor NVARCHAR(50) NULL,
        sexo NVARCHAR(10) NULL CHECK (sexo IN ('Macho', 'Fêmea')),
        castrado BIT DEFAULT 0,
        vacinado BIT DEFAULT 0,
        observacoes TEXT NULL,
        ativo BIT DEFAULT 1,
        data_cadastro DATETIME2 DEFAULT GETDATE(),
        data_atualizacao DATETIME2 DEFAULT GETDATE(),
        
        CONSTRAINT FK_ContratoPets_Contrato 
            FOREIGN KEY (contrato_id) REFERENCES Contratos(id) ON DELETE CASCADE
    );
    
    PRINT '✓ Tabela ContratoPets criada';
    
    -- Criar índices para performance
    CREATE NONCLUSTERED INDEX IX_ContratoPets_Contrato ON ContratoPets(contrato_id);
    CREATE NONCLUSTERED INDEX IX_ContratoPets_Ativo ON ContratoPets(ativo, contrato_id);
    
    PRINT '✓ Índices criados para ContratoPets';
END
ELSE
BEGIN
    PRINT '• Tabela ContratoPets já existe';
END

-- ==========================================
-- 3. GARANTIAS INDIVIDUAIS POR PESSOA
-- ==========================================

PRINT 'Criando estrutura para garantias individuais...';

IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'GarantiasIndividuais')
BEGIN
    CREATE TABLE GarantiasIndividuais (
        id INT IDENTITY(1,1) PRIMARY KEY,
        contrato_id INT NOT NULL,
        pessoa_id INT NOT NULL,
        pessoa_tipo NVARCHAR(20) NOT NULL CHECK (pessoa_tipo IN ('LOCADOR', 'LOCATARIO')),
        tipo_garantia NVARCHAR(50) NOT NULL,
        valor_garantia DECIMAL(12,2) NULL,
        
        -- Campos específicos para cada tipo de garantia
        fiador_nome NVARCHAR(200) NULL,
        fiador_cpf NVARCHAR(14) NULL,
        fiador_telefone NVARCHAR(20) NULL,
        fiador_endereco TEXT NULL,
        
        caucao_tipo NVARCHAR(50) NULL, -- 'Dinheiro', 'Imóvel', 'Título'
        caucao_descricao TEXT NULL,
        caucao_data_devolucao DATE NULL,
        
        titulo_seguradora NVARCHAR(200) NULL,
        titulo_numero NVARCHAR(100) NULL,
        titulo_valor DECIMAL(12,2) NULL,
        titulo_vencimento DATE NULL,
        
        apolice_seguradora NVARCHAR(200) NULL,
        apolice_numero NVARCHAR(100) NULL,
        apolice_valor_cobertura DECIMAL(12,2) NULL,
        apolice_vigencia_inicio DATE NULL,
        apolice_vigencia_fim DATE NULL,
        
        observacoes TEXT NULL,
        documentos_path NVARCHAR(500) NULL,
        ativo BIT DEFAULT 1,
        data_criacao DATETIME2 DEFAULT GETDATE(),
        data_atualizacao DATETIME2 DEFAULT GETDATE(),
        
        CONSTRAINT FK_GarantiasIndividuais_Contrato 
            FOREIGN KEY (contrato_id) REFERENCES Contratos(id) ON DELETE CASCADE
    );
    
    PRINT '✓ Tabela GarantiasIndividuais criada';
    
    -- Criar índices
    CREATE NONCLUSTERED INDEX IX_GarantiasIndividuais_Contrato ON GarantiasIndividuais(contrato_id);
    CREATE NONCLUSTERED INDEX IX_GarantiasIndividuais_Pessoa ON GarantiasIndividuais(pessoa_id, pessoa_tipo);
    CREATE NONCLUSTERED INDEX IX_GarantiasIndividuais_Tipo ON GarantiasIndividuais(tipo_garantia, ativo);
    
    PRINT '✓ Índices criados para GarantiasIndividuais';
END
ELSE
BEGIN
    PRINT '• Tabela GarantiasIndividuais já existe';
END

-- ==========================================
-- 4. MELHORIAS NA TABELA CONTRATOLOCADORES
-- ==========================================

PRINT 'Verificando e melhorando tabela ContratoLocadores...';

-- Verificar se precisa de melhorias
IF EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ContratoLocadores')
BEGIN
    -- Adicionar campos que podem estar faltando
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ContratoLocadores' AND COLUMN_NAME = 'responsabilidade_principal')
    BEGIN
        ALTER TABLE ContratoLocadores ADD responsabilidade_principal BIT DEFAULT 0;
        PRINT '✓ Campo responsabilidade_principal adicionado';
    END
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ContratoLocadores' AND COLUMN_NAME = 'observacoes')
    BEGIN
        ALTER TABLE ContratoLocadores ADD observacoes TEXT NULL;
        PRINT '✓ Campo observacoes adicionado';
    END
    
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ContratoLocadores' AND COLUMN_NAME = 'data_criacao')
    BEGIN
        ALTER TABLE ContratoLocadores ADD data_criacao DATETIME2 DEFAULT GETDATE();
        PRINT '✓ Campo data_criacao adicionado';
    END
    
    PRINT '• Tabela ContratoLocadores atualizada';
END

-- ==========================================
-- 5. VIEWS PARA FACILITAR CONSULTAS
-- ==========================================

PRINT 'Criando views para facilitar consultas...';

-- View para contratos com múltiplos locadores
IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_ContratosComLocadores')
    DROP VIEW vw_ContratosComLocadores;
GO

CREATE VIEW vw_ContratosComLocadores AS
SELECT 
    c.id as contrato_id,
    c.data_inicio,
    c.data_fim,
    c.valor_aluguel,
    c.status,
    cl.locador_id,
    l.nome as locador_nome,
    l.cpf_cnpj as locador_documento,
    cl.porcentagem,
    cl.responsabilidade_principal,
    cl.conta_bancaria_id
FROM Contratos c
INNER JOIN ContratoLocadores cl ON c.id = cl.contrato_id
INNER JOIN Locadores l ON cl.locador_id = l.id
WHERE cl.ativo = 1;
GO

PRINT '✓ View vw_ContratosComLocadores criada';

-- View para contratos com múltiplos locatários
CREATE VIEW vw_ContratosComLocatarios AS
SELECT 
    c.id as contrato_id,
    c.data_inicio,
    c.data_fim,
    c.valor_aluguel,
    cl.locatario_id,
    l.nome as locatario_nome,
    l.cpf_cnpj as locatario_documento,
    cl.responsabilidade_principal,
    cl.percentual_responsabilidade,
    cl.data_entrada,
    cl.data_saida
FROM Contratos c
INNER JOIN ContratoLocatarios cl ON c.id = cl.contrato_id
INNER JOIN Locatarios l ON cl.locatario_id = l.id
WHERE cl.ativo = 1;
GO

PRINT '✓ View vw_ContratosComLocatarios criada';

-- View para contratos com pets
CREATE VIEW vw_ContratosComPets AS
SELECT 
    c.id as contrato_id,
    c.data_inicio,
    c.data_fim,
    cp.id as pet_id,
    cp.nome as pet_nome,
    cp.especie,
    cp.raca,
    cp.tamanho,
    cp.idade,
    COUNT(*) OVER (PARTITION BY c.id) as total_pets
FROM Contratos c
INNER JOIN ContratoPets cp ON c.id = cp.contrato_id
WHERE cp.ativo = 1;
GO

PRINT '✓ View vw_ContratosComPets criada';

-- ==========================================
-- 6. TRIGGERS PARA VALIDAÇÃO
-- ==========================================

PRINT 'Criando triggers de validação...';

-- Trigger para garantir que pelo menos um locatário seja principal
IF EXISTS (SELECT * FROM sys.triggers WHERE name = 'tr_ContratoLocatarios_ValidarPrincipal')
    DROP TRIGGER tr_ContratoLocatarios_ValidarPrincipal;
GO

CREATE TRIGGER tr_ContratoLocatarios_ValidarPrincipal
ON ContratoLocatarios
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Verificar se existe pelo menos um locatário principal por contrato
    IF EXISTS (
        SELECT contrato_id 
        FROM ContratoLocatarios 
        WHERE ativo = 1
        GROUP BY contrato_id
        HAVING SUM(CASE WHEN responsabilidade_principal = 1 THEN 1 ELSE 0 END) = 0
    )
    BEGIN
        RAISERROR('Cada contrato deve ter pelo menos um locatário com responsabilidade principal.', 16, 1);
        ROLLBACK TRANSACTION;
    END
END
GO

PRINT '✓ Trigger de validação para locatários principais criado';

-- ==========================================
-- 7. PROCEDURES PARA OPERAÇÕES COMPLEXAS
-- ==========================================

PRINT 'Criando stored procedures...';

-- Procedure para adicionar pet a um contrato
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AdicionarPetContrato')
    DROP PROCEDURE sp_AdicionarPetContrato;
GO

CREATE PROCEDURE sp_AdicionarPetContrato
    @contrato_id INT,
    @nome NVARCHAR(100),
    @especie NVARCHAR(50) = 'Cão',
    @raca NVARCHAR(100) = NULL,
    @tamanho NVARCHAR(20) = NULL,
    @idade INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO ContratoPets (contrato_id, nome, especie, raca, tamanho, idade)
    VALUES (@contrato_id, @nome, @especie, @raca, @tamanho, @idade);
    
    SELECT SCOPE_IDENTITY() as pet_id;
END
GO

PRINT '✓ Procedure sp_AdicionarPetContrato criada';

-- Procedure para adicionar locatário a contrato
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_AdicionarLocatarioContrato')
    DROP PROCEDURE sp_AdicionarLocatarioContrato;
GO

CREATE PROCEDURE sp_AdicionarLocatarioContrato
    @contrato_id INT,
    @locatario_id INT,
    @principal BIT = 0,
    @percentual DECIMAL(5,2) = 100.00
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO ContratoLocatarios (contrato_id, locatario_id, responsabilidade_principal, percentual_responsabilidade)
    VALUES (@contrato_id, @locatario_id, @principal, @percentual);
    
    SELECT SCOPE_IDENTITY() as relacionamento_id;
END
GO

PRINT '✓ Procedure sp_AdicionarLocatarioContrato criada';

-- ==========================================
-- 8. VERIFICAÇÃO FINAL
-- ==========================================

PRINT 'Executando verificação final...';

-- Verificar tabelas criadas
SELECT 
    'TABELAS CRIADAS' as Status,
    COUNT(*) as Total
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN (
    'ContratoLocatarios', 
    'ContratoPets', 
    'GarantiasIndividuais'
);

-- Verificar views criadas
SELECT 
    'VIEWS CRIADAS' as Status,
    COUNT(*) as Total
FROM sys.views 
WHERE name LIKE 'vw_Contratos%';

-- Verificar procedures criadas
SELECT 
    'PROCEDURES CRIADAS' as Status,
    COUNT(*) as Total
FROM sys.procedures 
WHERE name LIKE 'sp_%Contrato%';

-- Verificar triggers
SELECT 
    'TRIGGERS CRIADOS' as Status,
    COUNT(*) as Total
FROM sys.triggers 
WHERE name LIKE 'tr_Contrato%';

PRINT '===========================================';
PRINT 'ESTRUTURAS COMPLEXAS IMPLEMENTADAS COM SUCESSO!';
PRINT '===========================================';

PRINT 'Próximos passos:';
PRINT '1. Atualizar APIs no backend para suportar as novas estruturas';
PRINT '2. Testar inserção de dados via frontend';
PRINT '3. Migrar dados existentes se necessário';
PRINT '4. Implementar validações de negócio';

PRINT '===========================================';