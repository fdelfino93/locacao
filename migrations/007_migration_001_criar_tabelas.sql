-- =====================================================
-- MIGRATION 001: Criar Tabelas Core Faltantes
-- Data: 2025-08-26
-- Descrição: Cria tabelas essenciais que estão faltando no sistema
-- =====================================================

-- 1. Tabela de Pagamentos (CRÍTICA)
CREATE TABLE IF NOT EXISTS pagamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contrato_id INTEGER NOT NULL,
    competencia DATE NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_previsto DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2),
    valor_juros DECIMAL(10,2) DEFAULT 0,
    valor_multa DECIMAL(10,2) DEFAULT 0,
    valor_desconto DECIMAL(10,2) DEFAULT 0,
    tipo_pagamento VARCHAR(50),
    forma_pagamento VARCHAR(50),
    status VARCHAR(20) DEFAULT 'PENDENTE',
    dias_atraso INTEGER DEFAULT 0,
    observacoes TEXT,
    comprovante_path VARCHAR(500),
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_cadastro INTEGER,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);

-- 2. Tabela de Fiadores
CREATE TABLE IF NOT EXISTS fiadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    locatario_id INTEGER,
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18) NOT NULL,
    rg VARCHAR(20),
    telefone VARCHAR(15),
    email VARCHAR(255),
    data_nascimento DATE,
    profissao VARCHAR(100),
    renda_mensal DECIMAL(10,2),
    endereco_completo VARCHAR(500),
    tipo_relacao VARCHAR(50),
    parentesco VARCHAR(50),
    ativo INTEGER DEFAULT 1,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (locatario_id) REFERENCES locatarios(id)
);

-- 3. Tabela de Manutenções
CREATE TABLE IF NOT EXISTS manutencoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imovel_id INTEGER,
    contrato_id INTEGER,
    tipo VARCHAR(100) NOT NULL,
    categoria VARCHAR(50),
    descricao TEXT NOT NULL,
    valor_orcado DECIMAL(10,2),
    valor_realizado DECIMAL(10,2),
    data_solicitacao DATE NOT NULL,
    data_agendamento DATE,
    data_execucao DATE,
    prazo_conclusao DATE,
    responsavel_pagamento VARCHAR(20),
    empresa_prestadora VARCHAR(255),
    contato_prestadora VARCHAR(100),
    status VARCHAR(20) DEFAULT 'SOLICITADA',
    prioridade VARCHAR(10) DEFAULT 'MEDIA',
    fotos_antes TEXT,
    fotos_depois TEXT,
    nota_fiscal_path VARCHAR(500),
    observacoes TEXT,
    avaliacao_servico INTEGER,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_cadastro INTEGER,
    FOREIGN KEY (imovel_id) REFERENCES imoveis(id),
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);

-- 4. Tabela de Usuários (Sistema de Autenticação)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nivel_acesso VARCHAR(20) DEFAULT 'USUARIO',
    ativo INTEGER DEFAULT 1,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_acesso DATETIME
);

-- 5. Tabela de Configurações
CREATE TABLE IF NOT EXISTS configuracoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao VARCHAR(500),
    tipo VARCHAR(20) DEFAULT 'STRING',
    categoria VARCHAR(50),
    data_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabela de Histórico de Alterações (Auditoria)
CREATE TABLE IF NOT EXISTS historico_alteracoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entidade_tipo VARCHAR(50) NOT NULL,
    entidade_id INTEGER NOT NULL,
    operacao VARCHAR(10) NOT NULL,
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    usuario_id INTEGER,
    usuario_nome VARCHAR(255),
    ip_origem VARCHAR(45),
    user_agent TEXT,
    motivo VARCHAR(500),
    data_alteracao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Fotos dos Imóveis
CREATE TABLE IF NOT EXISTS imoveis_fotos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    imovel_id INTEGER NOT NULL,
    arquivo_nome VARCHAR(255) NOT NULL,
    arquivo_path VARCHAR(500) NOT NULL,
    arquivo_url VARCHAR(500),
    descricao VARCHAR(255),
    ordem INTEGER DEFAULT 0,
    foto_principal INTEGER DEFAULT 0,
    data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
);

-- 8. Tabela de Avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contrato_id INTEGER,
    avaliador_tipo VARCHAR(20),
    avaliado_tipo VARCHAR(20),
    avaliado_id INTEGER,
    nota_geral DECIMAL(3,2),
    nota_comunicacao DECIMAL(3,2),
    nota_pontualidade DECIMAL(3,2),
    nota_conservacao DECIMAL(3,2),
    nota_limpeza DECIMAL(3,2),
    pontos_positivos TEXT,
    pontos_negativos TEXT,
    comentario_geral TEXT,
    recomenda INTEGER DEFAULT 1,
    data_avaliacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contrato_id) REFERENCES contratos(id)
);

-- 9. Tabela de Log de Acessos
CREATE TABLE IF NOT EXISTS log_acessos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    usuario_nome VARCHAR(255),
    acao VARCHAR(100),
    entidade_tipo VARCHAR(50),
    entidade_id INTEGER,
    detalhes TEXT,
    ip_origem VARCHAR(45),
    user_agent TEXT,
    data_acesso DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_pagamentos_contrato ON pagamentos(contrato_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX idx_fiadores_locatario ON fiadores(locatario_id);
CREATE INDEX idx_manutencoes_imovel ON manutencoes(imovel_id);
CREATE INDEX idx_manutencoes_status ON manutencoes(status);
CREATE INDEX idx_historico_entidade ON historico_alteracoes(entidade_tipo, entidade_id);
CREATE INDEX idx_historico_data ON historico_alteracoes(data_alteracao);
CREATE INDEX idx_avaliacoes_contrato ON avaliacoes(contrato_id);
CREATE INDEX idx_log_usuario ON log_acessos(usuario_id);
CREATE INDEX idx_log_data ON log_acessos(data_acesso);