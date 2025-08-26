-- =====================================================
-- MIGRATION 007: Sistema de Telefones e Emails 1:N
-- Data: 2025-08-26
-- Descrição: Implementa sistema de múltiplos telefones e emails para locadores e locatários
-- =====================================================

-- 1. Tabela de Telefones (genérica para locadores e locatários)
CREATE TABLE IF NOT EXISTS telefones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Relacionamento polimórfico
    entidade_tipo VARCHAR(20) NOT NULL CHECK (entidade_tipo IN ('LOCADOR', 'LOCATARIO', 'FIADOR')),
    entidade_id INTEGER NOT NULL,
    
    -- Dados do telefone
    numero VARCHAR(15) NOT NULL,
    numero_limpo VARCHAR(11) NOT NULL, -- Apenas números para buscas
    
    -- Tipo e classificação
    tipo VARCHAR(20) NOT NULL DEFAULT 'CELULAR' CHECK (tipo IN ('CELULAR', 'FIXO', 'COMERCIAL', 'RECADO')),
    descricao VARCHAR(100), -- Ex: "Celular pessoal", "Trabalho", "Recado - mãe"
    
    -- Configurações
    principal INTEGER NOT NULL DEFAULT 0, -- Flag de telefone principal
    ativo INTEGER NOT NULL DEFAULT 1,
    whatsapp INTEGER NOT NULL DEFAULT 0, -- Tem WhatsApp
    ordem_preferencia INTEGER DEFAULT 1,
    
    -- Controle de uso
    melhor_horario VARCHAR(50), -- Ex: "8h às 18h", "Após 19h"
    observacoes TEXT,
    
    -- Validação e verificação
    verificado INTEGER DEFAULT 0,
    data_verificacao DATETIME,
    codigo_verificacao VARCHAR(6), -- Para SMS de verificação
    tentativas_verificacao INTEGER DEFAULT 0,
    
    -- Auditoria
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_cadastro INTEGER,
    usuario_ultima_atualizacao INTEGER,
    
    -- Constraints
    FOREIGN KEY (usuario_cadastro) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_ultima_atualizacao) REFERENCES usuarios(id),
    
    -- Garantir que só existe um telefone principal por entidade
    UNIQUE(entidade_tipo, entidade_id, principal) WHERE principal = 1
);

-- 2. Tabela de Emails (genérica para locadores e locatários)
CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Relacionamento polimórfico
    entidade_tipo VARCHAR(20) NOT NULL CHECK (entidade_tipo IN ('LOCADOR', 'LOCATARIO', 'FIADOR')),
    entidade_id INTEGER NOT NULL,
    
    -- Dados do email
    endereco VARCHAR(255) NOT NULL,
    endereco_limpo VARCHAR(255) NOT NULL, -- Normalizado para buscas
    
    -- Tipo e classificação
    tipo VARCHAR(20) NOT NULL DEFAULT 'PESSOAL' CHECK (tipo IN ('PESSOAL', 'COMERCIAL', 'TRABALHO', 'ALTERNATIVO')),
    descricao VARCHAR(100), -- Ex: "Email principal", "Trabalho", "Só para recibos"
    
    -- Configurações
    principal INTEGER NOT NULL DEFAULT 0, -- Flag de email principal
    ativo INTEGER NOT NULL DEFAULT 1,
    ordem_preferencia INTEGER DEFAULT 1,
    
    -- Preferências de comunicação
    aceita_marketing INTEGER DEFAULT 0,
    aceita_cobranca INTEGER DEFAULT 1,
    aceita_juridico INTEGER DEFAULT 1,
    
    -- Validação e verificação
    verificado INTEGER DEFAULT 0,
    data_verificacao DATETIME,
    token_verificacao VARCHAR(64), -- Para verificação por email
    tentativas_verificacao INTEGER DEFAULT 0,
    
    -- Controle de entregas
    total_enviados INTEGER DEFAULT 0,
    total_entregues INTEGER DEFAULT 0,
    total_abertos INTEGER DEFAULT 0,
    total_clicados INTEGER DEFAULT 0,
    data_ultimo_envio DATETIME,
    data_ultima_abertura DATETIME,
    
    -- Controle de bounce/spam
    bounces INTEGER DEFAULT 0,
    data_ultimo_bounce DATETIME,
    motivo_ultimo_bounce TEXT,
    
    -- Auditoria
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_cadastro INTEGER,
    usuario_ultima_atualizacao INTEGER,
    
    -- Constraints
    FOREIGN KEY (usuario_cadastro) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_ultima_atualizacao) REFERENCES usuarios(id),
    
    -- Garantir que só existe um email principal por entidade
    UNIQUE(entidade_tipo, entidade_id, principal) WHERE principal = 1,
    
    -- Email único por entidade (não pode repetir)
    UNIQUE(entidade_tipo, entidade_id, endereco_limpo)
);

-- 3. Tabela de histórico de comunicações (opcional mas útil)
CREATE TABLE IF NOT EXISTS historico_comunicacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Referência
    telefone_id INTEGER,
    email_id INTEGER,
    entidade_tipo VARCHAR(20) NOT NULL,
    entidade_id INTEGER NOT NULL,
    
    -- Dados da comunicação
    tipo_comunicacao VARCHAR(20) NOT NULL CHECK (tipo_comunicacao IN ('SMS', 'WHATSAPP', 'EMAIL', 'LIGACAO')),
    assunto VARCHAR(255),
    conteudo TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'ENVIADO' CHECK (status IN ('ENVIADO', 'ENTREGUE', 'LIDO', 'RESPONDIDO', 'FALHA')),
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_entrega DATETIME,
    data_leitura DATETIME,
    data_resposta DATETIME,
    
    -- Detalhes técnicos
    provedor VARCHAR(50), -- WhatsApp, Gmail, etc.
    id_externo VARCHAR(100), -- ID do provedor
    erro_detalhes TEXT,
    
    -- Auditoria
    usuario_id INTEGER,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (telefone_id) REFERENCES telefones(id),
    FOREIGN KEY (email_id) REFERENCES emails(id)
);

-- 4. Índices para performance
CREATE INDEX idx_telefones_entidade ON telefones(entidade_tipo, entidade_id);
CREATE INDEX idx_telefones_numero ON telefones(numero_limpo);
CREATE INDEX idx_telefones_principal ON telefones(entidade_tipo, entidade_id, principal);
CREATE INDEX idx_telefones_tipo ON telefones(tipo);
CREATE INDEX idx_telefones_ativo ON telefones(ativo);

CREATE INDEX idx_emails_entidade ON emails(entidade_tipo, entidade_id);
CREATE INDEX idx_emails_endereco ON emails(endereco_limpo);
CREATE INDEX idx_emails_principal ON emails(entidade_tipo, entidade_id, principal);
CREATE INDEX idx_emails_tipo ON emails(tipo);
CREATE INDEX idx_emails_ativo ON emails(ativo);

CREATE INDEX idx_historico_comunicacoes_entidade ON historico_comunicacoes(entidade_tipo, entidade_id);
CREATE INDEX idx_historico_comunicacoes_data ON historico_comunicacoes(data_envio);
CREATE INDEX idx_historico_comunicacoes_tipo ON historico_comunicacoes(tipo_comunicacao);

-- 5. Triggers para manter consistência de flags principais

-- Trigger para telefones - garantir apenas um principal por entidade
CREATE TRIGGER IF NOT EXISTS trg_telefones_principal_unico
AFTER UPDATE OF principal ON telefones
WHEN NEW.principal = 1
BEGIN
    -- Remove principal de outros telefones da mesma entidade
    UPDATE telefones 
    SET principal = 0 
    WHERE entidade_tipo = NEW.entidade_tipo 
      AND entidade_id = NEW.entidade_id 
      AND id != NEW.id 
      AND principal = 1;
END;

-- Trigger para emails - garantir apenas um principal por entidade
CREATE TRIGGER IF NOT EXISTS trg_emails_principal_unico
AFTER UPDATE OF principal ON emails
WHEN NEW.principal = 1
BEGIN
    -- Remove principal de outros emails da mesma entidade
    UPDATE emails 
    SET principal = 0 
    WHERE entidade_tipo = NEW.entidade_tipo 
      AND entidade_id = NEW.entidade_id 
      AND id != NEW.id 
      AND principal = 1;
END;

-- 6. Triggers para normalização automática de dados

-- Normalizar número de telefone
CREATE TRIGGER IF NOT EXISTS trg_telefones_normalizar
BEFORE INSERT ON telefones
BEGIN
    -- Remove caracteres especiais e mantém apenas números
    UPDATE NEW SET numero_limpo = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        NEW.numero, '(', ''), ')', ''), ' ', ''), '-', ''), '+55', '');
END;

CREATE TRIGGER IF NOT EXISTS trg_telefones_normalizar_update
BEFORE UPDATE ON telefones
BEGIN
    -- Remove caracteres especiais e mantém apenas números
    UPDATE NEW SET numero_limpo = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        NEW.numero, '(', ''), ')', ''), ' ', ''), '-', ''), '+55', '');
END;

-- Normalizar email
CREATE TRIGGER IF NOT EXISTS trg_emails_normalizar
BEFORE INSERT ON emails
BEGIN
    -- Converte para minúsculas para comparações
    UPDATE NEW SET endereco_limpo = LOWER(TRIM(NEW.endereco));
END;

CREATE TRIGGER IF NOT EXISTS trg_emails_normalizar_update
BEFORE UPDATE ON emails
BEGIN
    -- Converte para minúsculas para comparações
    UPDATE NEW SET endereco_limpo = LOWER(TRIM(NEW.endereco));
END;

-- 7. Triggers para timestamp automático
CREATE TRIGGER IF NOT EXISTS trg_telefones_update_timestamp
AFTER UPDATE ON telefones
BEGIN
    UPDATE telefones 
    SET data_ultima_atualizacao = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_emails_update_timestamp
AFTER UPDATE ON emails
BEGIN
    UPDATE emails 
    SET data_ultima_atualizacao = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- 8. Migração de dados existentes

-- Migrar telefones dos locadores
INSERT INTO telefones (entidade_tipo, entidade_id, numero, tipo, principal, ativo, data_cadastro)
SELECT 
    'LOCADOR' as entidade_tipo,
    id as entidade_id,
    telefone as numero,
    'CELULAR' as tipo,
    1 as principal, -- Definir como principal
    1 as ativo,
    COALESCE(data_cadastro, CURRENT_TIMESTAMP) as data_cadastro
FROM locadores 
WHERE telefone IS NOT NULL 
  AND TRIM(telefone) != ''
  AND LENGTH(TRIM(telefone)) >= 8; -- Telefones válidos

-- Migrar telefones alternativos dos locadores (se existir campo)
INSERT INTO telefones (entidade_tipo, entidade_id, numero, tipo, principal, ativo, data_cadastro)
SELECT 
    'LOCADOR' as entidade_tipo,
    id as entidade_id,
    telefone_conjuge as numero,
    'RECADO' as tipo,
    0 as principal, -- Não é principal
    1 as ativo,
    COALESCE(data_cadastro, CURRENT_TIMESTAMP) as data_cadastro
FROM locadores 
WHERE telefone_conjuge IS NOT NULL 
  AND TRIM(telefone_conjuge) != ''
  AND LENGTH(TRIM(telefone_conjuge)) >= 8;

-- Migrar emails dos locadores
INSERT INTO emails (entidade_tipo, entidade_id, endereco, tipo, principal, ativo, data_cadastro)
SELECT 
    'LOCADOR' as entidade_tipo,
    id as entidade_id,
    email as endereco,
    'PESSOAL' as tipo,
    1 as principal, -- Definir como principal
    1 as ativo,
    COALESCE(data_cadastro, CURRENT_TIMESTAMP) as data_cadastro
FROM locadores 
WHERE email IS NOT NULL 
  AND TRIM(email) != ''
  AND email LIKE '%@%'; -- Emails válidos

-- Migrar telefones dos locatários
INSERT INTO telefones (entidade_tipo, entidade_id, numero, tipo, principal, ativo, data_cadastro)
SELECT 
    'LOCATARIO' as entidade_tipo,
    id as entidade_id,
    telefone as numero,
    'CELULAR' as tipo,
    1 as principal,
    1 as ativo,
    CURRENT_TIMESTAMP as data_cadastro
FROM locatarios 
WHERE telefone IS NOT NULL 
  AND TRIM(telefone) != ''
  AND LENGTH(TRIM(telefone)) >= 8;

-- Migrar telefones alternativos dos locatários
INSERT INTO telefones (entidade_tipo, entidade_id, numero, tipo, principal, ativo, data_cadastro)
SELECT 
    'LOCATARIO' as entidade_tipo,
    id as entidade_id,
    telefone_alternativo as numero,
    'ALTERNATIVO' as tipo,
    0 as principal,
    1 as ativo,
    CURRENT_TIMESTAMP as data_cadastro
FROM locatarios 
WHERE telefone_alternativo IS NOT NULL 
  AND TRIM(telefone_alternativo) != ''
  AND LENGTH(TRIM(telefone_alternativo)) >= 8;

-- Migrar emails dos locatários
INSERT INTO emails (entidade_tipo, entidade_id, endereco, tipo, principal, ativo, data_cadastro)
SELECT 
    'LOCATARIO' as entidade_tipo,
    id as entidade_id,
    email as endereco,
    'PESSOAL' as tipo,
    1 as principal,
    1 as ativo,
    CURRENT_TIMESTAMP as data_cadastro
FROM locatarios 
WHERE email IS NOT NULL 
  AND TRIM(email) != ''
  AND email LIKE '%@%';

-- 9. Views para facilitar consultas

-- View de telefones ativos
CREATE VIEW IF NOT EXISTS vw_telefones_ativos AS
SELECT 
    t.*,
    CASE t.entidade_tipo
        WHEN 'LOCADOR' THEN l.nome
        WHEN 'LOCATARIO' THEN lc.nome
        WHEN 'FIADOR' THEN f.nome
    END as entidade_nome,
    
    -- Status formatado
    CASE 
        WHEN t.ativo = 0 THEN 'INATIVO'
        WHEN t.verificado = 1 THEN 'VERIFICADO'
        ELSE 'ATIVO'
    END as status_formatado,
    
    -- Número formatado para exibição
    CASE 
        WHEN LENGTH(t.numero_limpo) = 11 THEN 
            '(' || SUBSTR(t.numero_limpo, 1, 2) || ') ' || 
            SUBSTR(t.numero_limpo, 3, 5) || '-' || 
            SUBSTR(t.numero_limpo, 8, 4)
        WHEN LENGTH(t.numero_limpo) = 10 THEN 
            '(' || SUBSTR(t.numero_limpo, 1, 2) || ') ' || 
            SUBSTR(t.numero_limpo, 3, 4) || '-' || 
            SUBSTR(t.numero_limpo, 7, 4)
        ELSE t.numero
    END as numero_formatado

FROM telefones t
LEFT JOIN locadores l ON t.entidade_tipo = 'LOCADOR' AND t.entidade_id = l.id
LEFT JOIN locatarios lc ON t.entidade_tipo = 'LOCATARIO' AND t.entidade_id = lc.id
LEFT JOIN fiadores f ON t.entidade_tipo = 'FIADOR' AND t.entidade_id = f.id
WHERE t.ativo = 1
ORDER BY t.entidade_tipo, t.entidade_id, t.principal DESC, t.ordem_preferencia;

-- View de emails ativos
CREATE VIEW IF NOT EXISTS vw_emails_ativos AS
SELECT 
    e.*,
    CASE e.entidade_tipo
        WHEN 'LOCADOR' THEN l.nome
        WHEN 'LOCATARIO' THEN lc.nome
        WHEN 'FIADOR' THEN f.nome
    END as entidade_nome,
    
    -- Status formatado
    CASE 
        WHEN e.ativo = 0 THEN 'INATIVO'
        WHEN e.bounces >= 3 THEN 'BLOQUEADO'
        WHEN e.verificado = 1 THEN 'VERIFICADO'
        ELSE 'ATIVO'
    END as status_formatado,
    
    -- Taxa de entrega (se houver histórico)
    CASE 
        WHEN e.total_enviados > 0 THEN 
            ROUND((e.total_entregues * 100.0) / e.total_enviados, 1)
        ELSE 0
    END as taxa_entrega_pct

FROM emails e
LEFT JOIN locadores l ON e.entidade_tipo = 'LOCADOR' AND e.entidade_id = l.id
LEFT JOIN locatarios lc ON e.entidade_tipo = 'LOCATARIO' AND e.entidade_id = lc.id
LEFT JOIN fiadores f ON e.entidade_tipo = 'FIADOR' AND e.entidade_id = f.id
WHERE e.ativo = 1
ORDER BY e.entidade_tipo, e.entidade_id, e.principal DESC, e.ordem_preferencia;

-- 10. Funções utilitárias (implementar como stored procedures se SQLite suportar)

-- Validação final
SELECT 'Migration 007 - Telefones e Emails 1:N' as titulo;

SELECT 'Telefones migrados' as verificacao, COUNT(*) as total
FROM telefones

UNION ALL

SELECT 'Emails migrados' as verificacao, COUNT(*) as total
FROM emails

UNION ALL

SELECT 'Locadores com telefone principal' as verificacao, 
       COUNT(DISTINCT entidade_id) as total
FROM telefones 
WHERE entidade_tipo = 'LOCADOR' AND principal = 1 AND ativo = 1

UNION ALL

SELECT 'Locatários com telefone principal' as verificacao, 
       COUNT(DISTINCT entidade_id) as total
FROM telefones 
WHERE entidade_tipo = 'LOCATARIO' AND principal = 1 AND ativo = 1

UNION ALL

SELECT 'Locadores com email principal' as verificacao, 
       COUNT(DISTINCT entidade_id) as total
FROM emails 
WHERE entidade_tipo = 'LOCADOR' AND principal = 1 AND ativo = 1;

-- Verificar integridade
PRAGMA integrity_check;