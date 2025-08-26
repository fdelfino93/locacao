-- =====================================================
-- MIGRATION 006: Sistema de Múltiplas Formas de Recebimento
-- Data: 2025-08-26
-- Descrição: Implementa sistema flexível de formas de recebimento por locador
-- =====================================================

-- 1. Tabela de Formas de Recebimento
CREATE TABLE IF NOT EXISTS formas_recebimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    locador_id INTEGER NOT NULL,
    
    -- Tipo de recebimento
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PIX', 'TRANSFERENCIA', 'BOLETO', 'DINHEIRO', 'CHEQUE')),
    descricao VARCHAR(255),
    
    -- Dados específicos para cada tipo (JSON flexível)
    dados_recebimento TEXT, -- JSON com dados específicos
    
    -- Para PIX
    pix_tipo VARCHAR(20) CHECK (pix_tipo IN ('CPF', 'CNPJ', 'EMAIL', 'TELEFONE', 'CHAVE_ALEATORIA')),
    pix_chave VARCHAR(255),
    
    -- Para Transferência Bancária
    banco_codigo VARCHAR(10),
    banco_nome VARCHAR(100),
    agencia VARCHAR(10),
    agencia_dv VARCHAR(2),
    conta VARCHAR(20),
    conta_dv VARCHAR(2),
    tipo_conta VARCHAR(20) CHECK (tipo_conta IN ('CORRENTE', 'POUPANCA', 'SALARIO')),
    
    -- Para Boleto
    beneficiario_nome VARCHAR(255),
    beneficiario_documento VARCHAR(18),
    instrucoes_boleto TEXT,
    
    -- Configurações
    ativo INTEGER NOT NULL DEFAULT 1,
    padrao INTEGER NOT NULL DEFAULT 0, -- Se é a forma padrão do locador
    ordem_preferencia INTEGER DEFAULT 1,
    
    -- Validação e limites
    valor_minimo DECIMAL(10,2) DEFAULT 0.00,
    valor_maximo DECIMAL(12,2),
    
    -- Controle temporal
    data_inicio DATE DEFAULT CURRENT_DATE,
    data_fim DATE,
    
    -- Auditoria
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_cadastro INTEGER,
    usuario_ultima_atualizacao INTEGER,
    
    -- Observações internas
    observacoes TEXT,
    
    -- Constraints
    FOREIGN KEY (locador_id) REFERENCES locadores(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_cadastro) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_ultima_atualizacao) REFERENCES usuarios(id),
    
    -- Garantir que só existe uma forma padrão por locador
    UNIQUE(locador_id, padrao) WHERE padrao = 1
);

-- 2. Adicionar referência em contratos
ALTER TABLE contratos ADD COLUMN id_forma_recebimento INTEGER;
ALTER TABLE contratos ADD CONSTRAINT fk_contratos_forma_recebimento 
    FOREIGN KEY (id_forma_recebimento) REFERENCES formas_recebimento(id);

-- 3. Tabela de histórico de formas de recebimento (para auditoria)
CREATE TABLE IF NOT EXISTS historico_formas_recebimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    forma_recebimento_id INTEGER NOT NULL,
    locador_id INTEGER NOT NULL,
    
    -- Dados da alteração
    operacao VARCHAR(10) NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE', 'ATIVAR', 'DESATIVAR')),
    dados_anterior TEXT, -- JSON com estado anterior
    dados_novo TEXT,     -- JSON com novo estado
    
    -- Motivo da alteração
    motivo VARCHAR(500),
    
    -- Controle
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_id INTEGER,
    ip_origem VARCHAR(45),
    
    FOREIGN KEY (forma_recebimento_id) REFERENCES formas_recebimento(id),
    FOREIGN KEY (locador_id) REFERENCES locadores(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 4. Índices para performance
CREATE INDEX idx_formas_recebimento_locador ON formas_recebimento(locador_id);
CREATE INDEX idx_formas_recebimento_tipo ON formas_recebimento(tipo);
CREATE INDEX idx_formas_recebimento_ativo ON formas_recebimento(ativo);
CREATE INDEX idx_formas_recebimento_padrao ON formas_recebimento(locador_id, padrao);
CREATE INDEX idx_contratos_forma_recebimento ON contratos(id_forma_recebimento);
CREATE INDEX idx_historico_formas_data ON historico_formas_recebimento(data_alteracao);

-- 5. Trigger para manter consistência de forma padrão
CREATE TRIGGER IF NOT EXISTS trg_formas_recebimento_padrao_unico
AFTER UPDATE OF padrao ON formas_recebimento
WHEN NEW.padrao = 1
BEGIN
    -- Remove o padrão de outras formas do mesmo locador
    UPDATE formas_recebimento 
    SET padrao = 0 
    WHERE locador_id = NEW.locador_id 
      AND id != NEW.id 
      AND padrao = 1;
END;

-- 6. Trigger para auditoria automática
CREATE TRIGGER IF NOT EXISTS trg_formas_recebimento_auditoria_insert
AFTER INSERT ON formas_recebimento
BEGIN
    INSERT INTO historico_formas_recebimento (
        forma_recebimento_id, locador_id, operacao, dados_novo, usuario_id
    ) VALUES (
        NEW.id, NEW.locador_id, 'INSERT', 
        json_object(
            'tipo', NEW.tipo,
            'descricao', NEW.descricao,
            'ativo', NEW.ativo,
            'padrao', NEW.padrao
        ),
        NEW.usuario_cadastro
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_formas_recebimento_auditoria_update
AFTER UPDATE ON formas_recebimento
BEGIN
    INSERT INTO historico_formas_recebimento (
        forma_recebimento_id, locador_id, operacao, dados_anterior, dados_novo, usuario_id
    ) VALUES (
        NEW.id, NEW.locador_id, 'UPDATE',
        json_object(
            'tipo', OLD.tipo,
            'descricao', OLD.descricao,
            'ativo', OLD.ativo,
            'padrao', OLD.padrao
        ),
        json_object(
            'tipo', NEW.tipo,
            'descricao', NEW.descricao,
            'ativo', NEW.ativo,
            'padrao', NEW.padrao
        ),
        NEW.usuario_ultima_atualizacao
    );
END;

-- 7. Migrar dados existentes
-- Criar forma de recebimento padrão para locadores que já existem
INSERT INTO formas_recebimento (
    locador_id, tipo, descricao, pix_chave, padrao, ativo, data_cadastro
)
SELECT 
    id as locador_id,
    COALESCE(tipo_recebimento, 'PIX') as tipo,
    'Forma de recebimento migrada automaticamente' as descricao,
    pix_chave,
    1 as padrao, -- Definir como padrão
    1 as ativo,
    CURRENT_TIMESTAMP as data_cadastro
FROM locadores 
WHERE id NOT IN (SELECT DISTINCT locador_id FROM formas_recebimento WHERE padrao = 1);

-- 8. Atualizar contratos existentes com a forma padrão do locador
UPDATE contratos 
SET id_forma_recebimento = (
    SELECT fr.id 
    FROM formas_recebimento fr 
    JOIN imoveis i ON fr.locador_id = i.locador_id
    WHERE i.id = contratos.imovel_id 
      AND fr.padrao = 1 
      AND fr.ativo = 1
    LIMIT 1
)
WHERE id_forma_recebimento IS NULL;

-- 9. View para facilitar consultas
CREATE VIEW IF NOT EXISTS vw_formas_recebimento_completas AS
SELECT 
    fr.*,
    l.nome as locador_nome,
    l.cpf_cnpj as locador_documento,
    
    -- Dados formatados para exibição
    CASE fr.tipo
        WHEN 'PIX' THEN 'PIX (' || COALESCE(fr.pix_tipo, 'Chave') || '): ' || COALESCE(fr.pix_chave, 'Não informado')
        WHEN 'TRANSFERENCIA' THEN COALESCE(fr.banco_nome, 'Banco') || ' - Ag: ' || COALESCE(fr.agencia, '?') || ' - Conta: ' || COALESCE(fr.conta, '?')
        WHEN 'BOLETO' THEN 'Boleto bancário - ' || COALESCE(fr.beneficiario_nome, fr.descricao)
        ELSE fr.tipo || ' - ' || COALESCE(fr.descricao, 'Sem descrição')
    END as forma_completa,
    
    -- Status calculado
    CASE 
        WHEN fr.ativo = 0 THEN 'INATIVO'
        WHEN fr.data_fim < DATE('now') THEN 'EXPIRADO'
        WHEN fr.data_inicio > DATE('now') THEN 'AGENDADO'
        ELSE 'ATIVO'
    END as status_calculado,
    
    -- Contagem de uso
    (SELECT COUNT(*) FROM contratos WHERE id_forma_recebimento = fr.id) as total_contratos
    
FROM formas_recebimento fr
LEFT JOIN locadores l ON fr.locador_id = l.id
ORDER BY fr.locador_id, fr.ordem_preferencia, fr.id;

-- 10. Validação final
SELECT 'Migration 006 - Formas de Recebimento' as titulo;

SELECT 'Formas de recebimento criadas' as verificacao, COUNT(*) as total
FROM formas_recebimento

UNION ALL

SELECT 'Locadores com forma padrão' as verificacao, 
       COUNT(DISTINCT locador_id) as total
FROM formas_recebimento 
WHERE padrao = 1 AND ativo = 1

UNION ALL

SELECT 'Contratos com forma definida' as verificacao, 
       COUNT(*) as total
FROM contratos 
WHERE id_forma_recebimento IS NOT NULL;

-- Verificar integridade
PRAGMA integrity_check;