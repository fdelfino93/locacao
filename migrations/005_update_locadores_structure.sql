-- =====================================================
-- MIGRAÇÃO 005: Atualização da estrutura de locadores
-- Adiciona suporte para múltiplos contatos e representante legal
-- =====================================================

-- Adicionar campos para tipo de pessoa e nacionalidade
ALTER TABLE locadores 
ADD tipo_pessoa VARCHAR(2) DEFAULT 'PF' CHECK (tipo_pessoa IN ('PF', 'PJ')),
    nacionalidade VARCHAR(50) DEFAULT 'Brasileira',
    dados_empresa TEXT;

-- Criar tabela para telefones múltiplos
CREATE TABLE locador_telefones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    locador_id INT NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'principal', -- principal, secundario, comercial
    ativo BIT DEFAULT 1,
    data_cadastro DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (locador_id) REFERENCES locadores(id) ON DELETE CASCADE,
    INDEX IDX_locador_telefones_locador (locador_id),
    INDEX IDX_locador_telefones_ativo (ativo)
);

-- Criar tabela para emails múltiplos
CREATE TABLE locador_emails (
    id INT IDENTITY(1,1) PRIMARY KEY,
    locador_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'principal', -- principal, secundario, comercial
    ativo BIT DEFAULT 1,
    data_cadastro DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (locador_id) REFERENCES locadores(id) ON DELETE CASCADE,
    INDEX IDX_locador_emails_locador (locador_id),
    INDEX IDX_locador_emails_ativo (ativo),
    UNIQUE KEY UNQ_locador_emails_email (email)
);

-- Criar tabela para representantes legais
CREATE TABLE locador_representantes_legais (
    id INT IDENTITY(1,1) PRIMARY KEY,
    locador_id INT NOT NULL,
    
    -- Dados básicos
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) NOT NULL,
    rg VARCHAR(20),
    data_nascimento DATE,
    nacionalidade VARCHAR(50) DEFAULT 'Brasileira',
    estado_civil VARCHAR(20) CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
    profissao VARCHAR(100),
    
    -- Endereço
    endereco_rua VARCHAR(255),
    endereco_numero VARCHAR(10),
    endereco_complemento VARCHAR(100),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_estado VARCHAR(2),
    endereco_cep VARCHAR(9),
    
    -- Controle
    ativo BIT DEFAULT 1,
    principal BIT DEFAULT 1, -- Indica se é o representante principal
    data_cadastro DATETIME DEFAULT GETDATE(),
    data_ultima_atualizacao DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (locador_id) REFERENCES locadores(id) ON DELETE CASCADE,
    INDEX IDX_representantes_locador (locador_id),
    INDEX IDX_representantes_principal (principal),
    INDEX IDX_representantes_ativo (ativo),
    UNIQUE KEY UNQ_representantes_cpf (cpf)
);

-- Criar tabela para telefones do representante legal
CREATE TABLE representante_telefones (
    id INT IDENTITY(1,1) PRIMARY KEY,
    representante_id INT NOT NULL,
    telefone VARCHAR(15) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'principal',
    ativo BIT DEFAULT 1,
    data_cadastro DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (representante_id) REFERENCES locador_representantes_legais(id) ON DELETE CASCADE,
    INDEX IDX_representante_telefones_rep (representante_id)
);

-- Criar tabela para emails do representante legal
CREATE TABLE representante_emails (
    id INT IDENTITY(1,1) PRIMARY KEY,
    representante_id INT NOT NULL,
    email VARCHAR(255) NOT NULL,
    tipo VARCHAR(20) DEFAULT 'principal',
    ativo BIT DEFAULT 1,
    data_cadastro DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (representante_id) REFERENCES locador_representantes_legais(id) ON DELETE CASCADE,
    INDEX IDX_representante_emails_rep (representante_id),
    UNIQUE KEY UNQ_representante_emails_email (email)
);

-- Adicionar campos de controle de cônjuge (mantendo compatibilidade)
ALTER TABLE locadores 
ADD existe_conjuge BIT DEFAULT 0,
    nome_conjuge VARCHAR(255),
    cpf_conjuge VARCHAR(14),
    rg_conjuge VARCHAR(20),
    telefone_conjuge VARCHAR(15),
    endereco_conjuge TEXT,
    regime_bens VARCHAR(50);

-- Criar trigger para manter compatibilidade com campos legados
GO
CREATE TRIGGER trg_locadores_update_legacy_fields
ON locadores
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Atualizar data de última atualização
    UPDATE locadores
    SET data_ultima_atualizacao = GETDATE()
    FROM locadores l
    INNER JOIN inserted i ON l.id = i.id;
END;
GO

-- Comentários das tabelas
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Telefones múltiplos para locadores com suporte a diferentes tipos', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'locador_telefones';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Emails múltiplos para locadores com validação de unicidade', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'locador_emails';

EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Representantes legais para pessoas jurídicas com endereço completo', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE', @level1name = N'locador_representantes_legais';