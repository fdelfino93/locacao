-- =====================================================
-- SCHEMA COMPLETO PARA SISTEMA DE LOCAÇÃO AVANÇADO
-- Relacionamentos complexos + Histórico/Auditoria
-- =====================================================

-- ============================
-- 1. TABELAS PRINCIPAIS
-- ============================

-- LOCADORES (expandida)
CREATE TABLE locadores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Dados pessoais
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    rg VARCHAR(20),
    telefone VARCHAR(15),
    email VARCHAR(255),
    data_nascimento DATE,
    estado_civil VARCHAR(20),
    profissao VARCHAR(100),
    
    -- Endereço
    endereco_rua VARCHAR(255),
    endereco_numero VARCHAR(10),
    endereco_complemento VARCHAR(100),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_estado VARCHAR(2),
    endereco_cep VARCHAR(9),
    
    -- Dados bancários
    banco VARCHAR(100),
    agencia VARCHAR(10),
    conta VARCHAR(20),
    tipo_conta VARCHAR(20),
    pix_chave VARCHAR(255),
    
    -- Configurações
    tipo_recebimento VARCHAR(20) DEFAULT 'PIX', -- PIX, TRANSFERENCIA, BOLETO
    taxa_administracao DECIMAL(5,2) DEFAULT 0.00,
    
    -- Controle
    ativo BIT DEFAULT 1,
    observacoes TEXT,
    data_cadastro DATETIME DEFAULT GETDATE(),
    data_ultima_atualizacao DATETIME DEFAULT GETDATE(),
    usuario_cadastro INT,
    usuario_ultima_atualizacao INT,
    
    -- Índices
    INDEX IDX_locadores_cpf_cnpj (cpf_cnpj),
    INDEX IDX_locadores_nome (nome),
    INDEX IDX_locadores_ativo (ativo)
);

-- LOCATÁRIOS (expandida)
CREATE TABLE locatarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Dados pessoais
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
    rg VARCHAR(20),
    telefone VARCHAR(15),
    telefone_alternativo VARCHAR(15),
    email VARCHAR(255),
    data_nascimento DATE,
    estado_civil VARCHAR(20),
    profissao VARCHAR(100),
    empresa VARCHAR(255),
    renda_mensal DECIMAL(10,2),
    
    -- Endereço atual
    endereco_atual_rua VARCHAR(255),
    endereco_atual_numero VARCHAR(10),
    endereco_atual_complemento VARCHAR(100),
    endereco_atual_bairro VARCHAR(100),
    endereco_atual_cidade VARCHAR(100),
    endereco_atual_estado VARCHAR(2),
    endereco_atual_cep VARCHAR(9),
    tempo_residencia_atual INT, -- em meses
    
    -- Documentos
    nacionalidade VARCHAR(50) DEFAULT 'Brasileira',
    tipo_documento VARCHAR(20) DEFAULT 'CPF',
    
    -- Referências
    referencia_comercial_nome VARCHAR(255),
    referencia_comercial_telefone VARCHAR(15),
    referencia_comercial_empresa VARCHAR(255),
    referencia_pessoal_nome VARCHAR(255),
    referencia_pessoal_telefone VARCHAR(15),
    referencia_pessoal_relacao VARCHAR(100),
    
    -- Avaliação interna
    score_interno INT DEFAULT 500, -- 0-1000
    avaliacoes_media DECIMAL(3,2) DEFAULT 0.00, -- 0-5 estrelas
    total_avaliacoes INT DEFAULT 0,
    
    -- Garantias preferidas
    tipo_garantia_preferida VARCHAR(50),
    possui_fiador BIT DEFAULT 0,
    aceita_pets BIT DEFAULT 0,
    fumante BIT DEFAULT 0,
    
    -- Controle
    status_atual VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, INATIVO, BLOQUEADO
    motivo_status VARCHAR(255),
    observacoes TEXT,
    data_cadastro DATETIME DEFAULT GETDATE(),
    data_ultima_atualizacao DATETIME DEFAULT GETDATE(),
    usuario_cadastro INT,
    usuario_ultima_atualizacao INT,
    
    -- Índices
    INDEX IDX_locatarios_cpf_cnpj (cpf_cnpj),
    INDEX IDX_locatarios_nome (nome),
    INDEX IDX_locatarios_status (status_atual),
    INDEX IDX_locatarios_score (score_interno)
);

-- FIADORES/AVALISTAS
CREATE TABLE fiadores (
    id INT IDENTITY(1,1) PRIMARY KEY,
    locatario_id INT FOREIGN KEY REFERENCES locatarios(id),
    
    -- Dados pessoais
    nome VARCHAR(255) NOT NULL,
    cpf_cnpj VARCHAR(18) NOT NULL,
    rg VARCHAR(20),
    telefone VARCHAR(15),
    email VARCHAR(255),
    data_nascimento DATE,
    profissao VARCHAR(100),
    renda_mensal DECIMAL(10,2),
    
    -- Endereço
    endereco_completo VARCHAR(500),
    
    -- Relacionamento
    tipo_relacao VARCHAR(50), -- FIADOR, AVALISTA
    parentesco VARCHAR(50),
    
    -- Controle
    ativo BIT DEFAULT 1,
    data_cadastro DATETIME DEFAULT GETDATE()
);

-- IMÓVEIS (expandida)
CREATE TABLE imoveis (
    id INT IDENTITY(1,1) PRIMARY KEY,
    locador_id INT FOREIGN KEY REFERENCES locadores(id),
    
    -- Localização
    endereco_rua VARCHAR(255) NOT NULL,
    endereco_numero VARCHAR(10),
    endereco_complemento VARCHAR(100),
    endereco_bairro VARCHAR(100),
    endereco_cidade VARCHAR(100),
    endereco_estado VARCHAR(2),
    endereco_cep VARCHAR(9),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Características básicas
    tipo VARCHAR(50) NOT NULL, -- CASA, APARTAMENTO, KITNET, LOJA, SALA_COMERCIAL, GALPAO
    finalidade VARCHAR(20) DEFAULT 'RESIDENCIAL', -- RESIDENCIAL, COMERCIAL, MISTO
    area_total DECIMAL(8,2),
    area_construida DECIMAL(8,2),
    quartos INT DEFAULT 0,
    suites INT DEFAULT 0,
    banheiros INT DEFAULT 0,
    vagas_garagem INT DEFAULT 0,
    
    -- Valores
    valor_aluguel DECIMAL(10,2) NOT NULL,
    valor_condominio DECIMAL(10,2) DEFAULT 0,
    valor_iptu DECIMAL(10,2) DEFAULT 0,
    valor_venda DECIMAL(12,2), -- se estiver à venda também
    valor_deposito DECIMAL(10,2),
    
    -- Comodidades
    mobiliado BIT DEFAULT 0,
    ar_condicionado BIT DEFAULT 0,
    aquecimento BIT DEFAULT 0,
    churrasqueira BIT DEFAULT 0,
    piscina BIT DEFAULT 0,
    quintal BIT DEFAULT 0,
    varanda BIT DEFAULT 0,
    elevador BIT DEFAULT 0,
    portaria BIT DEFAULT 0,
    academia BIT DEFAULT 0,
    salao_festas BIT DEFAULT 0,
    playground BIT DEFAULT 0,
    pet_friendly BIT DEFAULT 0,
    internet_inclusa BIT DEFAULT 0,
    
    -- Documentos
    matricula_registro VARCHAR(50),
    inscricao_iptu VARCHAR(50),
    habite_se VARCHAR(50),
    
    -- Descrição
    titulo VARCHAR(255),
    descricao TEXT,
    observacoes_internas TEXT,
    
    -- Disponibilidade
    status VARCHAR(20) DEFAULT 'DISPONIVEL', -- DISPONIVEL, OCUPADO, MANUTENCAO, INDISPONIVEL
    data_disponibilidade DATE,
    motivo_indisponibilidade VARCHAR(255),
    
    -- Controle
    ativo BIT DEFAULT 1,
    destaque BIT DEFAULT 0,
    data_cadastro DATETIME DEFAULT GETDATE(),
    data_ultima_atualizacao DATETIME DEFAULT GETDATE(),
    usuario_cadastro INT,
    usuario_ultima_atualizacao INT,
    
    -- Índices
    INDEX IDX_imoveis_locador (locador_id),
    INDEX IDX_imoveis_tipo (tipo),
    INDEX IDX_imoveis_status (status),
    INDEX IDX_imoveis_valor (valor_aluguel),
    INDEX IDX_imoveis_endereco (endereco_cidade, endereco_bairro),
    INDEX IDX_imoveis_caracteristicas (quartos, banheiros)
);

-- FOTOS DOS IMÓVEIS
CREATE TABLE imoveis_fotos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    imovel_id INT FOREIGN KEY REFERENCES imoveis(id) ON DELETE CASCADE,
    arquivo_nome VARCHAR(255) NOT NULL,
    arquivo_path VARCHAR(500) NOT NULL,
    arquivo_url VARCHAR(500),
    descricao VARCHAR(255),
    ordem INT DEFAULT 0,
    foto_principal BIT DEFAULT 0,
    data_upload DATETIME DEFAULT GETDATE()
);

-- CONTRATOS (expandida)
CREATE TABLE contratos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Relacionamentos
    locador_id INT FOREIGN KEY REFERENCES locadores(id),
    locatario_id INT FOREIGN KEY REFERENCES locatarios(id),
    imovel_id INT FOREIGN KEY REFERENCES imoveis(id),
    contrato_anterior_id INT FOREIGN KEY REFERENCES contratos(id), -- para renovações
    
    -- Datas
    data_assinatura DATE,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    data_primeiro_vencimento DATE,
    vencimento_dia INT NOT NULL, -- dia do mês
    
    -- Valores
    valor_aluguel DECIMAL(10,2) NOT NULL,
    valor_condominio DECIMAL(10,2) DEFAULT 0,
    valor_iptu DECIMAL(10,2) DEFAULT 0,
    valor_deposito DECIMAL(10,2),
    valor_multa_rescisao DECIMAL(10,2),
    percentual_reajuste DECIMAL(5,2) DEFAULT 0.00,
    indice_reajuste VARCHAR(10) DEFAULT 'IGPM', -- IGPM, IPCA, etc
    data_proximo_reajuste DATE,
    
    -- Garantias
    tipo_garantia VARCHAR(50), -- FIADOR, SEGURO_FIANCA, DEPOSITO, AVALISTA
    dados_garantia TEXT, -- JSON com dados específicos da garantia
    seguradora VARCHAR(255),
    numero_apolice VARCHAR(100),
    
    -- Cláusulas especiais
    permite_pets BIT DEFAULT 0,
    permite_fumantes BIT DEFAULT 0,
    inclui_condominio BIT DEFAULT 0,
    inclui_iptu BIT DEFAULT 0,
    clausulas_especiais TEXT,
    
    -- Administração
    taxa_administracao DECIMAL(5,2) DEFAULT 0.00,
    administradora VARCHAR(255),
    
    -- Status e controle
    status VARCHAR(20) DEFAULT 'ATIVO', -- ATIVO, ENCERRADO, RESCINDIDO, RENOVADO, SUSPENSO
    motivo_encerramento VARCHAR(255),
    data_encerramento DATE,
    
    -- Renovação
    renovacao_automatica BIT DEFAULT 0,
    prazo_aviso_renovacao INT DEFAULT 60, -- dias
    
    -- Observações
    observacoes TEXT,
    termos_adicionais TEXT,
    
    -- Controle
    data_cadastro DATETIME DEFAULT GETDATE(),
    data_ultima_atualizacao DATETIME DEFAULT GETDATE(),
    usuario_cadastro INT,
    usuario_ultima_atualizacao INT,
    
    -- Índices
    INDEX IDX_contratos_locador (locador_id),
    INDEX IDX_contratos_locatario (locatario_id),
    INDEX IDX_contratos_imovel (imovel_id),
    INDEX IDX_contratos_status (status),
    INDEX IDX_contratos_periodo (data_inicio, data_fim),
    INDEX IDX_contratos_vencimento (vencimento_dia)
);

-- ============================
-- 2. TABELAS DE HISTÓRICO/PAGAMENTOS
-- ============================

-- HISTÓRICO DE PAGAMENTOS
CREATE TABLE pagamentos (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contrato_id INT FOREIGN KEY REFERENCES contratos(id),
    
    -- Dados do pagamento
    competencia DATE NOT NULL, -- mês/ano de referência
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_previsto DECIMAL(10,2) NOT NULL,
    valor_pago DECIMAL(10,2),
    valor_juros DECIMAL(10,2) DEFAULT 0,
    valor_multa DECIMAL(10,2) DEFAULT 0,
    valor_desconto DECIMAL(10,2) DEFAULT 0,
    
    -- Tipo e forma
    tipo_pagamento VARCHAR(50), -- ALUGUEL, CONDOMINIO, IPTU, DEPOSITO, MULTA
    forma_pagamento VARCHAR(50), -- PIX, TRANSFERENCIA, BOLETO, DINHEIRO, CARTAO
    
    -- Status
    status VARCHAR(20) DEFAULT 'PENDENTE', -- PENDENTE, PAGO, ATRASADO, CANCELADO
    dias_atraso INT DEFAULT 0,
    
    -- Observações
    observacoes TEXT,
    comprovante_path VARCHAR(500),
    
    -- Controle
    data_cadastro DATETIME DEFAULT GETDATE(),
    usuario_cadastro INT,
    
    INDEX IDX_pagamentos_contrato (contrato_id),
    INDEX IDX_pagamentos_competencia (competencia),
    INDEX IDX_pagamentos_status (status),
    INDEX IDX_pagamentos_vencimento (data_vencimento)
);

-- MANUTENÇÕES
CREATE TABLE manutencoes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    imovel_id INT FOREIGN KEY REFERENCES imoveis(id),
    contrato_id INT FOREIGN KEY REFERENCES contratos(id),
    
    -- Dados da manutenção
    tipo VARCHAR(100) NOT NULL, -- ELETRICA, HIDRAULICA, PINTURA, LIMPEZA, etc
    categoria VARCHAR(50), -- PREVENTIVA, CORRETIVA, EMERGENCIAL
    descricao TEXT NOT NULL,
    valor_orcado DECIMAL(10,2),
    valor_realizado DECIMAL(10,2),
    
    -- Datas
    data_solicitacao DATE NOT NULL,
    data_agendamento DATE,
    data_execucao DATE,
    prazo_conclusao DATE,
    
    -- Responsabilidades
    responsavel_pagamento VARCHAR(20), -- LOCADOR, LOCATARIO, ADMINISTRADORA
    empresa_prestadora VARCHAR(255),
    contato_prestadora VARCHAR(100),
    
    -- Status
    status VARCHAR(20) DEFAULT 'SOLICITADA', -- SOLICITADA, ORCAMENTO, APROVADA, EXECUTANDO, CONCLUIDA, CANCELADA
    prioridade VARCHAR(10) DEFAULT 'MEDIA', -- BAIXA, MEDIA, ALTA, URGENTE
    
    -- Documentos
    fotos_antes TEXT, -- JSON array com paths das fotos
    fotos_depois TEXT,
    nota_fiscal_path VARCHAR(500),
    
    -- Observações
    observacoes TEXT,
    avaliacao_servico INT, -- 1-5 estrelas
    
    -- Controle
    data_cadastro DATETIME DEFAULT GETDATE(),
    usuario_cadastro INT,
    
    INDEX IDX_manutencoes_imovel (imovel_id),
    INDEX IDX_manutencoes_status (status),
    INDEX IDX_manutencoes_tipo (tipo)
);

-- AVALIAÇÕES (inquilinos avaliam imóveis/locadores)
CREATE TABLE avaliacoes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    contrato_id INT FOREIGN KEY REFERENCES contratos(id),
    avaliador_tipo VARCHAR(20), -- LOCATARIO, LOCADOR
    avaliado_tipo VARCHAR(20), -- IMOVEL, LOCATARIO, LOCADOR
    avaliado_id INT,
    
    -- Critérios (1-5 estrelas)
    nota_geral DECIMAL(3,2),
    nota_comunicacao DECIMAL(3,2),
    nota_pontualidade DECIMAL(3,2),
    nota_conservacao DECIMAL(3,2),
    nota_limpeza DECIMAL(3,2),
    
    -- Comentários
    pontos_positivos TEXT,
    pontos_negativos TEXT,
    comentario_geral TEXT,
    recomenda BIT DEFAULT 1,
    
    -- Controle
    data_avaliacao DATETIME DEFAULT GETDATE(),
    
    INDEX IDX_avaliacoes_contrato (contrato_id),
    INDEX IDX_avaliacoes_avaliado (avaliado_tipo, avaliado_id)
);

-- ============================
-- 3. SISTEMA DE AUDITORIA/HISTÓRICO
-- ============================

-- HISTÓRICO DE ALTERAÇÕES (auditoria completa)
CREATE TABLE historico_alteracoes (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    
    -- Identificação da entidade
    entidade_tipo VARCHAR(50) NOT NULL, -- locadores, locatarios, imoveis, contratos
    entidade_id INT NOT NULL,
    
    -- Alteração
    operacao VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    campo_alterado VARCHAR(100),
    valor_anterior TEXT,
    valor_novo TEXT,
    
    -- Contexto
    usuario_id INT,
    usuario_nome VARCHAR(255),
    ip_origem VARCHAR(45),
    user_agent TEXT,
    motivo VARCHAR(500),
    
    -- Timestamp
    data_alteracao DATETIME DEFAULT GETDATE(),
    
    -- Índices para performance
    INDEX IDX_historico_entidade (entidade_tipo, entidade_id),
    INDEX IDX_historico_data (data_alteracao),
    INDEX IDX_historico_usuario (usuario_id)
);

-- LOG DE ACESSOS
CREATE TABLE log_acessos (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT,
    usuario_nome VARCHAR(255),
    acao VARCHAR(100), -- LOGIN, LOGOUT, BUSCA, VISUALIZACAO, EDICAO
    entidade_tipo VARCHAR(50),
    entidade_id INT,
    detalhes TEXT,
    ip_origem VARCHAR(45),
    user_agent TEXT,
    data_acesso DATETIME DEFAULT GETDATE(),
    
    INDEX IDX_log_usuario (usuario_id),
    INDEX IDX_log_data (data_acesso),
    INDEX IDX_log_acao (acao)
);

-- ============================
-- 4. TABELAS DE CONFIGURAÇÃO
-- ============================

-- USUÁRIOS DO SISTEMA
CREATE TABLE usuarios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    nivel_acesso VARCHAR(20) DEFAULT 'USUARIO', -- ADMIN, GERENTE, USUARIO, READONLY
    ativo BIT DEFAULT 1,
    data_cadastro DATETIME DEFAULT GETDATE(),
    ultimo_acesso DATETIME
);

-- CONFIGURAÇÕES DO SISTEMA
CREATE TABLE configuracoes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao VARCHAR(500),
    tipo VARCHAR(20) DEFAULT 'STRING', -- STRING, NUMBER, BOOLEAN, JSON
    categoria VARCHAR(50),
    data_atualizacao DATETIME DEFAULT GETDATE()
);

-- ============================
-- 5. VIEWS PARA CONSULTAS COMPLEXAS
-- ============================

-- View para contratos com todas as informações relacionadas
CREATE VIEW vw_contratos_completos AS
SELECT 
    c.*,
    -- Locador
    loc.nome as locador_nome,
    loc.cpf_cnpj as locador_cpf,
    loc.telefone as locador_telefone,
    loc.email as locador_email,
    
    -- Locatário
    lct.nome as locatario_nome,
    lct.cpf_cnpj as locatario_cpf,
    lct.telefone as locatario_telefone,
    lct.email as locatario_email,
    lct.score_interno as locatario_score,
    
    -- Imóvel
    i.endereco_rua + ', ' + i.endereco_numero as imovel_endereco,
    i.endereco_bairro as imovel_bairro,
    i.endereco_cidade as imovel_cidade,
    i.tipo as imovel_tipo,
    i.quartos as imovel_quartos,
    i.area_total as imovel_area,
    
    -- Status calculados
    CASE 
        WHEN GETDATE() > c.data_fim THEN 'VENCIDO'
        WHEN DATEDIFF(day, GETDATE(), c.data_fim) <= 30 THEN 'VENCENDO'
        ELSE c.status 
    END as status_calculado,
    
    DATEDIFF(day, GETDATE(), c.data_fim) as dias_vencimento,
    
    -- Última avaliação
    (SELECT AVG(nota_geral) FROM avaliacoes WHERE contrato_id = c.id) as avaliacao_media

FROM contratos c
LEFT JOIN locadores loc ON c.locador_id = loc.id
LEFT JOIN locatarios lct ON c.locatario_id = lct.id
LEFT JOIN imoveis i ON c.imovel_id = i.id;

-- View para imóveis com informações agregadas
CREATE VIEW vw_imoveis_completos AS
SELECT 
    i.*,
    loc.nome as locador_nome,
    loc.telefone as locador_telefone,
    
    -- Contrato atual
    (SELECT TOP 1 c.id FROM contratos c WHERE c.imovel_id = i.id AND c.status = 'ATIVO' ORDER BY c.data_inicio DESC) as contrato_atual_id,
    (SELECT TOP 1 lct.nome FROM contratos c JOIN locatarios lct ON c.locatario_id = lct.id WHERE c.imovel_id = i.id AND c.status = 'ATIVO' ORDER BY c.data_inicio DESC) as locatario_atual,
    
    -- Estatísticas
    (SELECT COUNT(*) FROM contratos WHERE imovel_id = i.id) as total_contratos,
    (SELECT COUNT(*) FROM contratos WHERE imovel_id = i.id AND status = 'ATIVO') as contratos_ativos,
    (SELECT AVG(nota_geral) FROM avaliacoes av JOIN contratos c ON av.contrato_id = c.id WHERE c.imovel_id = i.id AND av.avaliado_tipo = 'IMOVEL') as avaliacao_media,
    (SELECT COUNT(*) FROM manutencoes WHERE imovel_id = i.id) as total_manutencoes,
    
    -- Financeiro
    (SELECT SUM(valor_realizado) FROM manutencoes WHERE imovel_id = i.id AND YEAR(data_execucao) = YEAR(GETDATE())) as gastos_manutencao_ano

FROM imoveis i
LEFT JOIN locadores loc ON i.locador_id = loc.id;

-- ============================
-- 6. ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================

-- Índices compostos para buscas complexas
CREATE INDEX IDX_contratos_periodo_status ON contratos (data_inicio, data_fim, status);
CREATE INDEX IDX_imoveis_localizacao ON imoveis (endereco_cidade, endereco_bairro, endereco_cep);
CREATE INDEX IDX_pagamentos_competencia_status ON pagamentos (competencia, status);

-- Índices para campos de texto (busca)
CREATE INDEX IDX_locadores_busca ON locadores (nome, cpf_cnpj, email);
CREATE INDEX IDX_locatarios_busca ON locatarios (nome, cpf_cnpj, email);
CREATE INDEX IDX_imoveis_busca ON imoveis (endereco_rua, endereco_bairro, endereco_cidade);

-- ============================
-- 7. TRIGGERS PARA AUDITORIA AUTOMÁTICA
-- ============================

-- Trigger para auditoria de locadores
CREATE TRIGGER trg_locadores_audit 
ON locadores 
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- INSERT
    IF EXISTS(SELECT * FROM inserted) AND NOT EXISTS(SELECT * FROM deleted)
    BEGIN
        INSERT INTO historico_alteracoes (entidade_tipo, entidade_id, operacao, valor_novo, usuario_id)
        SELECT 'locadores', i.id, 'INSERT', 
               (SELECT * FROM inserted WHERE id = i.id FOR JSON AUTO), 
               i.usuario_cadastro
        FROM inserted i;
    END
    
    -- UPDATE
    IF EXISTS(SELECT * FROM inserted) AND EXISTS(SELECT * FROM deleted)
    BEGIN
        INSERT INTO historico_alteracoes (entidade_tipo, entidade_id, operacao, valor_anterior, valor_novo, usuario_id)
        SELECT 'locadores', i.id, 'UPDATE',
               (SELECT * FROM deleted WHERE id = i.id FOR JSON AUTO),
               (SELECT * FROM inserted WHERE id = i.id FOR JSON AUTO),
               i.usuario_ultima_atualizacao
        FROM inserted i;
    END
    
    -- DELETE
    IF EXISTS(SELECT * FROM deleted) AND NOT EXISTS(SELECT * FROM inserted)
    BEGIN
        INSERT INTO historico_alteracoes (entidade_tipo, entidade_id, operacao, valor_anterior)
        SELECT 'locadores', d.id, 'DELETE',
               (SELECT * FROM deleted WHERE id = d.id FOR JSON AUTO)
        FROM deleted d;
    END
END;

-- ============================
-- 8. DADOS INICIAIS
-- ============================

-- Configurações padrão
INSERT INTO configuracoes (chave, valor, descricao, categoria) VALUES
('sistema.nome', 'Cobimob', 'Nome do sistema', 'geral'),
('sistema.versao', '2.0.0', 'Versão atual', 'geral'),
('aluguel.dia_vencimento_padrao', '10', 'Dia padrão de vencimento', 'financeiro'),
('aluguel.percentual_multa', '2.0', 'Percentual de multa por atraso', 'financeiro'),
('aluguel.juros_diario', '0.033', 'Juros diário por atraso', 'financeiro'),
('busca.resultados_por_pagina', '20', 'Resultados por página na busca', 'interface'),
('backup.frequencia_dias', '7', 'Frequência de backup em dias', 'sistema');

-- Usuário administrador padrão
INSERT INTO usuarios (nome, email, senha_hash, nivel_acesso) VALUES
('Administrador', 'admin@cobimob.com', '$2b$12$exemplo', 'ADMIN');

-- ============================
-- FIM DO SCHEMA
-- ============================