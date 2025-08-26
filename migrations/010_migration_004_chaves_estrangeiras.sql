-- =====================================================
-- MIGRATION 004: Adicionar Chaves Estrangeiras e Constraints
-- Data: 2025-08-26
-- Descrição: Define relacionamentos, índices e constraints de integridade
-- =====================================================

-- Habilitar chaves estrangeiras no SQLite
PRAGMA foreign_keys = ON;

-- =====================================================
-- ÍNDICES PARA CHAVES ESTRANGEIRAS
-- =====================================================

-- Índices para relacionamentos em CONTRATOS
CREATE INDEX IF NOT EXISTS idx_contratos_locador ON contratos(locador_id);
CREATE INDEX IF NOT EXISTS idx_contratos_locatario ON contratos(locatario_id);
CREATE INDEX IF NOT EXISTS idx_contratos_imovel ON contratos(imovel_id);
CREATE INDEX IF NOT EXISTS idx_contratos_anterior ON contratos(contrato_anterior_id);

-- Índices para relacionamentos em IMÓVEIS
CREATE INDEX IF NOT EXISTS idx_imoveis_locador ON imoveis(locador_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_locatario ON imoveis(id_locatario);

-- Índices para relacionamentos em PAGAMENTOS
CREATE INDEX IF NOT EXISTS idx_pagamentos_contrato ON pagamentos(contrato_id);

-- Índices para relacionamentos em FIADORES
CREATE INDEX IF NOT EXISTS idx_fiadores_locatario ON fiadores(locatario_id);

-- Índices para relacionamentos em MANUTENÇÕES
CREATE INDEX IF NOT EXISTS idx_manutencoes_imovel ON manutencoes(imovel_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_contrato ON manutencoes(contrato_id);

-- Índices para relacionamentos em AVALIAÇÕES
CREATE INDEX IF NOT EXISTS idx_avaliacoes_contrato ON avaliacoes(contrato_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_avaliado ON avaliacoes(avaliado_tipo, avaliado_id);

-- Índices para FOTOS DE IMÓVEIS
CREATE INDEX IF NOT EXISTS idx_imoveis_fotos_imovel ON imoveis_fotos(imovel_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_fotos_ordem ON imoveis_fotos(imovel_id, ordem);

-- =====================================================
-- CONSTRAINTS DE UNICIDADE
-- =====================================================

-- CPF/CNPJ únicos
CREATE UNIQUE INDEX IF NOT EXISTS idx_locadores_cpf_cnpj ON locadores(cpf_cnpj);
CREATE UNIQUE INDEX IF NOT EXISTS idx_locatarios_cpf_cnpj ON locatarios(cpf_cnpj);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fiadores_cpf_cnpj ON fiadores(cpf_cnpj);

-- Email único para usuários
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Chave única para configurações
CREATE UNIQUE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes(chave);

-- Matrícula única para imóveis
CREATE UNIQUE INDEX IF NOT EXISTS idx_imoveis_matricula ON imoveis(matricula_imovel);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE DE BUSCA
-- =====================================================

-- Busca por nome
CREATE INDEX IF NOT EXISTS idx_locadores_nome ON locadores(nome);
CREATE INDEX IF NOT EXISTS idx_locatarios_nome ON locatarios(nome);
CREATE INDEX IF NOT EXISTS idx_fiadores_nome ON fiadores(nome);

-- Busca por status
CREATE INDEX IF NOT EXISTS idx_locadores_ativo ON locadores(ativo);
CREATE INDEX IF NOT EXISTS idx_locatarios_status ON locatarios(status_atual);
CREATE INDEX IF NOT EXISTS idx_imoveis_status ON imoveis(status);
CREATE INDEX IF NOT EXISTS idx_contratos_status ON contratos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_manutencoes_status ON manutencoes(status);

-- Busca por datas
CREATE INDEX IF NOT EXISTS idx_contratos_periodo ON contratos(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_contratos_vencimento ON contratos(vencimento_dia);
CREATE INDEX IF NOT EXISTS idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_competencia ON pagamentos(competencia);
CREATE INDEX IF NOT EXISTS idx_manutencoes_data ON manutencoes(data_solicitacao);

-- Busca por localização
CREATE INDEX IF NOT EXISTS idx_imoveis_cidade ON imoveis(endereco_cidade);
CREATE INDEX IF NOT EXISTS idx_imoveis_bairro ON imoveis(endereco_bairro);
CREATE INDEX IF NOT EXISTS idx_imoveis_localizacao ON imoveis(endereco_cidade, endereco_bairro);

-- Busca por valores
CREATE INDEX IF NOT EXISTS idx_imoveis_valor ON imoveis(valor_aluguel);
CREATE INDEX IF NOT EXISTS idx_contratos_valor ON contratos(valor_aluguel);

-- Busca por características de imóveis
CREATE INDEX IF NOT EXISTS idx_imoveis_tipo ON imoveis(tipo);
CREATE INDEX IF NOT EXISTS idx_imoveis_quartos ON imoveis(quartos);
CREATE INDEX IF NOT EXISTS idx_imoveis_caracteristicas ON imoveis(tipo, quartos, banheiros);

-- =====================================================
-- ÍNDICES PARA AUDITORIA
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_historico_entidade ON historico_alteracoes(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_historico_data ON historico_alteracoes(data_alteracao);
CREATE INDEX IF NOT EXISTS idx_historico_usuario ON historico_alteracoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historico_operacao ON historico_alteracoes(operacao);

CREATE INDEX IF NOT EXISTS idx_log_usuario ON log_acessos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_log_data ON log_acessos(data_acesso);
CREATE INDEX IF NOT EXISTS idx_log_acao ON log_acessos(acao);

-- =====================================================
-- VALIDAÇÃO DE INTEGRIDADE REFERENCIAL
-- =====================================================

-- Verificar contratos órfãos (sem locador, locatário ou imóvel válido)
SELECT 'Contratos com referências inválidas' as verificacao,
       COUNT(*) as total
FROM contratos c
WHERE NOT EXISTS (SELECT 1 FROM locadores WHERE id = c.locador_id)
   OR NOT EXISTS (SELECT 1 FROM locatarios WHERE id = c.locatario_id)
   OR NOT EXISTS (SELECT 1 FROM imoveis WHERE id = c.imovel_id);

-- Verificar pagamentos órfãos
SELECT 'Pagamentos com contratos inválidos' as verificacao,
       COUNT(*) as total
FROM pagamentos p
WHERE NOT EXISTS (SELECT 1 FROM contratos WHERE id = p.contrato_id);

-- Verificar fiadores órfãos
SELECT 'Fiadores com locatários inválidos' as verificacao,
       COUNT(*) as total
FROM fiadores f
WHERE f.locatario_id IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM locatarios WHERE id = f.locatario_id);

-- =====================================================
-- CRIAÇÃO DE VIEWS PARA CONSULTAS COMUNS
-- =====================================================

-- View de contratos ativos com informações completas
CREATE VIEW IF NOT EXISTS vw_contratos_ativos AS
SELECT 
    c.*,
    loc.nome as locador_nome,
    loc.cpf_cnpj as locador_cpf,
    loc.telefone as locador_telefone,
    lct.nome as locatario_nome,
    lct.cpf_cnpj as locatario_cpf,
    lct.telefone as locatario_telefone,
    i.endereco_rua || ', ' || i.endereco_numero as imovel_endereco,
    i.endereco_bairro as imovel_bairro,
    i.endereco_cidade as imovel_cidade,
    i.tipo as imovel_tipo
FROM contratos c
LEFT JOIN locadores loc ON c.locador_id = loc.id
LEFT JOIN locatarios lct ON c.locatario_id = lct.id
LEFT JOIN imoveis i ON c.imovel_id = i.id
WHERE c.status = 'ATIVO';

-- View de pagamentos pendentes
CREATE VIEW IF NOT EXISTS vw_pagamentos_pendentes AS
SELECT 
    p.*,
    c.vencimento_dia,
    loc.nome as locador_nome,
    lct.nome as locatario_nome,
    i.endereco_rua || ', ' || i.endereco_numero as imovel_endereco
FROM pagamentos p
JOIN contratos c ON p.contrato_id = c.id
JOIN locadores loc ON c.locador_id = loc.id
JOIN locatarios lct ON c.locatario_id = lct.id
JOIN imoveis i ON c.imovel_id = i.id
WHERE p.status = 'PENDENTE'
ORDER BY p.data_vencimento;

-- View de imóveis disponíveis
CREATE VIEW IF NOT EXISTS vw_imoveis_disponiveis AS
SELECT 
    i.*,
    loc.nome as locador_nome,
    loc.telefone as locador_telefone,
    (SELECT COUNT(*) FROM imoveis_fotos WHERE imovel_id = i.id) as total_fotos
FROM imoveis i
LEFT JOIN locadores loc ON i.locador_id = loc.id
WHERE i.status = 'DISPONIVEL' 
  AND i.ativo = 1;

-- =====================================================
-- TRIGGERS PARA MANTER CONSISTÊNCIA
-- =====================================================

-- Trigger para atualizar data_ultima_atualizacao
CREATE TRIGGER IF NOT EXISTS trg_locadores_update_timestamp 
AFTER UPDATE ON locadores
BEGIN
    UPDATE locadores 
    SET data_ultima_atualizacao = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_locatarios_update_timestamp 
AFTER UPDATE ON locatarios
BEGIN
    UPDATE locatarios 
    SET data_ultima_atualizacao = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_imoveis_update_timestamp 
AFTER UPDATE ON imoveis
BEGIN
    UPDATE imoveis 
    SET data_ultima_atualizacao = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_contratos_update_timestamp 
AFTER UPDATE ON contratos
BEGIN
    UPDATE contratos 
    SET data_ultima_atualizacao = CURRENT_TIMESTAMP 
    WHERE id = NEW.id;
END;

-- =====================================================
-- ESTATÍSTICAS DOS ÍNDICES
-- =====================================================

-- Analisar banco para atualizar estatísticas
ANALYZE;

-- Verificar índices criados
SELECT 'Índices criados com sucesso' as status, 
       COUNT(*) as total_indices
FROM sqlite_master 
WHERE type = 'index' 
  AND name LIKE 'idx_%';