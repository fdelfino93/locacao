-- =====================================================
-- MIGRATION 003: Remover/Renomear Campos Obsoletos e Migrar Dados
-- Data: 2025-08-26
-- Descrição: Migra dados de campos antigos para novos e remove campos obsoletos
-- =====================================================

-- Criar tabela temporária para backup de dados antes da migração
CREATE TABLE IF NOT EXISTS backup_endereco_migration (
    tabela VARCHAR(50),
    id INTEGER,
    endereco_original TEXT,
    data_backup DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MIGRAÇÃO DE ENDEREÇOS - LOCADORES
-- =====================================================

-- Backup dos endereços atuais
INSERT INTO backup_endereco_migration (tabela, id, endereco_original)
SELECT 'locadores', id, endereco 
FROM locadores 
WHERE endereco IS NOT NULL;

-- Migrar dados de endereço texto para campos estruturados
-- Assumindo formato: "Rua Nome, Número, Complemento, Bairro, Cidade-UF CEP"
UPDATE locadores 
SET 
    endereco_rua = CASE 
        WHEN INSTR(endereco, ',') > 0 
        THEN TRIM(SUBSTR(endereco, 1, INSTR(endereco, ',') - 1))
        ELSE endereco
    END
WHERE endereco IS NOT NULL AND endereco != '';

-- =====================================================
-- MIGRAÇÃO DE ENDEREÇOS - LOCATÁRIOS
-- =====================================================

-- Backup dos endereços atuais de locatários
INSERT INTO backup_endereco_migration (tabela, id, endereco_original)
SELECT 'locatarios', id, Endereco_inq 
FROM locatarios 
WHERE Endereco_inq IS NOT NULL;

-- Migrar endereço de locatários
UPDATE locatarios
SET 
    endereco_atual_rua = CASE 
        WHEN INSTR(Endereco_inq, ',') > 0 
        THEN TRIM(SUBSTR(Endereco_inq, 1, INSTR(Endereco_inq, ',') - 1))
        ELSE Endereco_inq
    END
WHERE Endereco_inq IS NOT NULL AND Endereco_inq != '';

-- =====================================================
-- MIGRAÇÃO DE ENDEREÇOS - IMÓVEIS
-- =====================================================

-- Backup dos endereços atuais de imóveis
INSERT INTO backup_endereco_migration (tabela, id, endereco_original)
SELECT 'imoveis', id, endereco 
FROM imoveis 
WHERE endereco IS NOT NULL;

-- Migrar campo 'endereco' para estruturado
UPDATE imoveis
SET 
    endereco_rua = CASE 
        WHEN INSTR(endereco, ',') > 0 
        THEN TRIM(SUBSTR(endereco, 1, INSTR(endereco, ',') - 1))
        ELSE endereco
    END
WHERE endereco IS NOT NULL AND endereco != '';

-- =====================================================
-- MIGRAÇÃO DE CAMPOS RELACIONADOS
-- =====================================================

-- Migrar campo 'id_locador' de imóveis para 'locador_id' em contratos
UPDATE contratos 
SET locador_id = (
    SELECT i.id_locador 
    FROM imoveis i 
    WHERE i.id = contratos.id_imovel
)
WHERE locador_id IS NULL;

-- =====================================================
-- NORMALIZAÇÃO DE CAMPOS BOOLEANOS
-- =====================================================

-- Normalizar campos que usam diferentes representações de boolean
UPDATE locadores 
SET 
    existe_conjuge = CASE 
        WHEN existe_conjuge IN (1, '1', 'true', 'True', 'TRUE') THEN 1
        WHEN existe_conjuge IN (0, '0', 'false', 'False', 'FALSE') THEN 0
        ELSE existe_conjuge
    END;

UPDATE locatarios 
SET 
    responsavel_inq = CASE 
        WHEN responsavel_inq IN (1, '1', 'true', 'True', 'TRUE') THEN 1
        WHEN responsavel_inq IN (0, '0', 'false', 'False', 'FALSE') THEN 0
        ELSE responsavel_inq
    END,
    dependentes_inq = CASE 
        WHEN dependentes_inq IN (1, '1', 'true', 'True', 'TRUE') THEN 1
        WHEN dependentes_inq IN (0, '0', 'false', 'False', 'FALSE') THEN 0
        ELSE dependentes_inq
    END,
    pet_inquilino = CASE 
        WHEN pet_inquilino IN (1, '1', 'true', 'True', 'TRUE') THEN 1
        WHEN pet_inquilino IN (0, '0', 'false', 'False', 'FALSE') THEN 0
        ELSE pet_inquilino
    END;

-- =====================================================
-- LIMPEZA DE CAMPOS VAZIOS OU NULOS
-- =====================================================

-- Limpar strings vazias e substituir por NULL onde apropriado
UPDATE locadores 
SET 
    telefone = NULLIF(TRIM(telefone), ''),
    email = NULLIF(TRIM(email), ''),
    rg = NULLIF(TRIM(rg), ''),
    dados_empresa = NULLIF(TRIM(dados_empresa), ''),
    representante = NULLIF(TRIM(representante), '');

UPDATE locatarios 
SET 
    telefone = NULLIF(TRIM(telefone), ''),
    email = NULLIF(TRIM(email), ''),
    rg = NULLIF(TRIM(rg), ''),
    dados_empresa = NULLIF(TRIM(dados_empresa), ''),
    representante = NULLIF(TRIM(representante), '');

-- =====================================================
-- ATUALIZAÇÃO DE VALORES PADRÃO
-- =====================================================

-- Definir valores padrão para campos novos baseados em lógica de negócio
UPDATE locadores 
SET 
    ativo = 1 
WHERE ativo IS NULL;

UPDATE locatarios 
SET 
    status_atual = 'ATIVO',
    score_interno = 500 
WHERE status_atual IS NULL;

UPDATE imoveis 
SET 
    ativo = 1,
    finalidade = 'RESIDENCIAL' 
WHERE ativo IS NULL;

UPDATE contratos 
SET 
    status = CASE 
        WHEN data_fim < date('now') THEN 'ENCERRADO'
        WHEN data_inicio > date('now') THEN 'FUTURO'
        ELSE 'ATIVO'
    END
WHERE status IS NULL;

-- =====================================================
-- NOTA SOBRE REMOÇÃO DE COLUNAS
-- =====================================================
-- SQLite não suporta DROP COLUMN diretamente.
-- Para remover colunas antigas após confirmação de migração bem-sucedida:
-- 1. Criar nova tabela com estrutura desejada
-- 2. Copiar dados da tabela antiga
-- 3. Dropar tabela antiga
-- 4. Renomear nova tabela

-- Exemplo para locadores (executar manualmente após validação):
/*
CREATE TABLE locadores_new AS 
SELECT 
    id, nome, cpf_cnpj, telefone, email,
    -- campos novos estruturados
    endereco_rua, endereco_numero, endereco_complemento, 
    endereco_bairro, endereco_cidade, endereco_estado, endereco_cep,
    -- outros campos mantidos
    tipo_recebimento, conta_bancaria, deseja_fci, 
    deseja_seguro_fianca, deseja_seguro_incendio,
    rg, dados_empresa, representante, nacionalidade, 
    estado_civil, profissao, existe_conjuge,
    nome_conjuge, cpf_conjuge, rg_conjuge, 
    endereco_conjuge, telefone_conjuge, tipo_cliente,
    data_nascimento, banco, agencia, conta, tipo_conta, 
    pix_chave, taxa_administracao, ativo, observacoes,
    data_cadastro, data_ultima_atualizacao, 
    usuario_cadastro, usuario_ultima_atualizacao
FROM locadores;

DROP TABLE locadores;
ALTER TABLE locadores_new RENAME TO locadores;
*/

-- =====================================================
-- VALIDAÇÃO DA MIGRAÇÃO
-- =====================================================

-- Query para verificar se a migração foi bem sucedida
SELECT 
    'Endereços migrados - Locadores' as verificacao,
    COUNT(*) as total,
    SUM(CASE WHEN endereco_rua IS NOT NULL THEN 1 ELSE 0 END) as migrados
FROM locadores
WHERE id IN (SELECT id FROM backup_endereco_migration WHERE tabela = 'locadores')

UNION ALL

SELECT 
    'Endereços migrados - Locatários' as verificacao,
    COUNT(*) as total,
    SUM(CASE WHEN endereco_atual_rua IS NOT NULL THEN 1 ELSE 0 END) as migrados
FROM locatarios
WHERE id IN (SELECT id FROM backup_endereco_migration WHERE tabela = 'locatarios')

UNION ALL

SELECT 
    'Endereços migrados - Imóveis' as verificacao,
    COUNT(*) as total,
    SUM(CASE WHEN endereco_rua IS NOT NULL THEN 1 ELSE 0 END) as migrados
FROM imoveis
WHERE id IN (SELECT id FROM backup_endereco_migration WHERE tabela = 'imoveis');