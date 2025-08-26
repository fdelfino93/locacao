-- =====================================================
-- MIGRATION 005: Popular Dados Iniciais e Configurações
-- Data: 2025-08-26
-- Descrição: Insere dados iniciais necessários para o funcionamento do sistema
-- =====================================================

-- =====================================================
-- CONFIGURAÇÕES DO SISTEMA
-- =====================================================

-- Configurações gerais
INSERT OR IGNORE INTO configuracoes (chave, valor, descricao, categoria, tipo) VALUES
('sistema.nome', 'Cobimob', 'Nome do sistema de locação', 'geral', 'STRING'),
('sistema.versao', '2.0.0', 'Versão atual do sistema', 'geral', 'STRING'),
('sistema.ambiente', 'desenvolvimento', 'Ambiente atual (desenvolvimento/homologacao/producao)', 'geral', 'STRING'),
('sistema.modo_manutencao', '0', 'Sistema em modo de manutenção (0=não, 1=sim)', 'geral', 'BOOLEAN');

-- Configurações financeiras
INSERT OR IGNORE INTO configuracoes (chave, valor, descricao, categoria, tipo) VALUES
('financeiro.dia_vencimento_padrao', '10', 'Dia padrão de vencimento dos aluguéis', 'financeiro', 'NUMBER'),
('financeiro.percentual_multa', '2.0', 'Percentual de multa por atraso no pagamento', 'financeiro', 'NUMBER'),
('financeiro.juros_diario', '0.033', 'Percentual de juros diário por atraso', 'financeiro', 'NUMBER'),
('financeiro.prazo_tolerancia', '5', 'Dias de tolerância antes de aplicar multa', 'financeiro', 'NUMBER'),
('financeiro.taxa_administracao_padrao', '10.0', 'Taxa de administração padrão em percentual', 'financeiro', 'NUMBER'),
('financeiro.valor_minimo_aluguel', '500.00', 'Valor mínimo permitido para aluguel', 'financeiro', 'NUMBER');

-- Configurações de notificações
INSERT OR IGNORE INTO configuracoes (chave, valor, descricao, categoria, tipo) VALUES
('notificacao.dias_antes_vencimento', '5', 'Dias antes do vencimento para enviar lembrete', 'notificacao', 'NUMBER'),
('notificacao.dias_apos_vencimento', '3', 'Dias após vencimento para enviar cobrança', 'notificacao', 'NUMBER'),
('notificacao.email_remetente', 'noreply@cobimob.com', 'Email remetente das notificações', 'notificacao', 'STRING'),
('notificacao.sms_habilitado', '0', 'Envio de SMS habilitado (0=não, 1=sim)', 'notificacao', 'BOOLEAN');

-- Configurações de contratos
INSERT OR IGNORE INTO configuracoes (chave, valor, descricao, categoria, tipo) VALUES
('contrato.prazo_padrao_meses', '12', 'Prazo padrão de contrato em meses', 'contrato', 'NUMBER'),
('contrato.prazo_aviso_renovacao', '60', 'Dias de antecedência para aviso de renovação', 'contrato', 'NUMBER'),
('contrato.indice_reajuste_padrao', 'IGPM', 'Índice padrão para reajuste anual', 'contrato', 'STRING'),
('contrato.permite_renovacao_automatica', '1', 'Permitir renovação automática de contratos', 'contrato', 'BOOLEAN');

-- Configurações de interface
INSERT OR IGNORE INTO configuracoes (chave, valor, descricao, categoria, tipo) VALUES
('interface.resultados_por_pagina', '20', 'Quantidade de resultados por página nas listagens', 'interface', 'NUMBER'),
('interface.tema_padrao', 'light', 'Tema padrão da interface (light/dark)', 'interface', 'STRING'),
('interface.idioma_padrao', 'pt-BR', 'Idioma padrão do sistema', 'interface', 'STRING'),
('interface.formato_data', 'DD/MM/YYYY', 'Formato padrão de exibição de datas', 'interface', 'STRING'),
('interface.formato_moeda', 'BRL', 'Formato de moeda padrão', 'interface', 'STRING');

-- Configurações de backup e segurança
INSERT OR IGNORE INTO configuracoes (chave, valor, descricao, categoria, tipo) VALUES
('backup.frequencia_dias', '7', 'Frequência de backup automático em dias', 'sistema', 'NUMBER'),
('backup.horario_execucao', '03:00', 'Horário de execução do backup automático', 'sistema', 'STRING'),
('backup.quantidade_manter', '30', 'Quantidade de backups a manter', 'sistema', 'NUMBER'),
('seguranca.sessao_timeout_minutos', '30', 'Timeout de sessão em minutos', 'seguranca', 'NUMBER'),
('seguranca.tentativas_login_max', '5', 'Máximo de tentativas de login antes de bloquear', 'seguranca', 'NUMBER'),
('seguranca.senha_min_caracteres', '8', 'Mínimo de caracteres para senha', 'seguranca', 'NUMBER');

-- =====================================================
-- USUÁRIO ADMINISTRADOR PADRÃO
-- =====================================================

-- Criar usuário admin (senha: admin123 - hash bcrypt)
-- IMPORTANTE: Alterar a senha após o primeiro login!
INSERT OR IGNORE INTO usuarios (nome, email, senha_hash, nivel_acesso, ativo) VALUES
('Administrador', 'admin@cobimob.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY/MrqvyQpqFviC', 'ADMIN', 1),
('Gerente', 'gerente@cobimob.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY/MrqvyQpqFviC', 'GERENTE', 1),
('Usuário Teste', 'usuario@cobimob.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY/MrqvyQpqFviC', 'USUARIO', 1);

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL - AMBIENTE DE DESENVOLVIMENTO)
-- =====================================================

-- Inserir locador de exemplo apenas se não existir nenhum
INSERT INTO locadores (nome, cpf_cnpj, telefone, email, tipo_recebimento, nacionalidade, estado_civil, profissao, ativo)
SELECT 'João da Silva', '123.456.789-00', '(41) 99999-9999', 'joao@exemplo.com', 'PIX', 'Brasileira', 'Casado', 'Empresário', 1
WHERE NOT EXISTS (SELECT 1 FROM locadores LIMIT 1);

-- Inserir locatário de exemplo apenas se não existir nenhum
INSERT INTO locatarios (nome, cpf_cnpj, telefone, email, nacionalidade, estado_civil, profissao, tipo_garantia, status_atual)
SELECT 'Maria Santos', '987.654.321-00', '(41) 88888-8888', 'maria@exemplo.com', 'Brasileira', 'Solteira', 'Advogada', 'FIADOR', 'ATIVO'
WHERE NOT EXISTS (SELECT 1 FROM locatarios LIMIT 1);

-- =====================================================
-- ATUALIZAÇÃO DE CAMPOS EXISTENTES
-- =====================================================

-- Garantir que todos os locadores tenham status ativo definido
UPDATE locadores 
SET ativo = 1 
WHERE ativo IS NULL;

-- Garantir que todos os locatários tenham status definido
UPDATE locatarios 
SET status_atual = 'ATIVO' 
WHERE status_atual IS NULL OR status_atual = '';

-- Garantir que todos os imóveis tenham status definido
UPDATE imoveis 
SET status = 'DISPONIVEL' 
WHERE status IS NULL OR status = '';

-- Atualizar status de contratos baseado nas datas
UPDATE contratos 
SET status = CASE 
    WHEN data_fim < date('now') AND status IS NULL THEN 'ENCERRADO'
    WHEN data_inicio > date('now') AND status IS NULL THEN 'FUTURO'
    WHEN status IS NULL THEN 'ATIVO'
    ELSE status
END;

-- =====================================================
-- REGISTRO DE AUDITORIA DA MIGRAÇÃO
-- =====================================================

INSERT INTO historico_alteracoes (
    entidade_tipo, 
    entidade_id, 
    operacao, 
    campo_alterado, 
    valor_anterior, 
    valor_novo, 
    usuario_nome, 
    motivo
) VALUES (
    'sistema', 
    0, 
    'MIGRATION', 
    'database_schema', 
    '1.0.0', 
    '2.0.0', 
    'Sistema de Migração', 
    'Aplicação da migration 005 - Dados iniciais e configurações'
);

-- =====================================================
-- ESTATÍSTICAS PÓS-MIGRAÇÃO
-- =====================================================

SELECT 'Resumo da Migration 005' as titulo;

SELECT 'Configurações inseridas' as tipo, COUNT(*) as total 
FROM configuracoes

UNION ALL

SELECT 'Usuários criados' as tipo, COUNT(*) as total 
FROM usuarios

UNION ALL

SELECT 'Locadores ativos' as tipo, COUNT(*) as total 
FROM locadores WHERE ativo = 1

UNION ALL

SELECT 'Locatários ativos' as tipo, COUNT(*) as total 
FROM locatarios WHERE status_atual = 'ATIVO'

UNION ALL

SELECT 'Contratos ativos' as tipo, COUNT(*) as total 
FROM contratos WHERE status = 'ATIVO';

-- =====================================================
-- VALIDAÇÃO FINAL
-- =====================================================

-- Verificar integridade do banco
PRAGMA integrity_check;

-- Analisar banco para otimizar queries
ANALYZE;

-- Mensagem de conclusão
SELECT 'Migration 005 aplicada com sucesso!' as mensagem,
       datetime('now', 'localtime') as data_execucao;