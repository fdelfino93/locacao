-- =====================================================
-- MIGRATION 002: Adicionar Campos Faltantes nas Tabelas Existentes
-- Data: 2025-08-26
-- Descrição: Adiciona campos que estão faltando nas tabelas existentes
-- =====================================================

-- TABELA LOCADORES: Adicionar campos faltantes
ALTER TABLE locadores ADD COLUMN data_nascimento DATE;
ALTER TABLE locadores ADD COLUMN endereco_rua VARCHAR(255);
ALTER TABLE locadores ADD COLUMN endereco_numero VARCHAR(10);
ALTER TABLE locadores ADD COLUMN endereco_complemento VARCHAR(100);
ALTER TABLE locadores ADD COLUMN endereco_bairro VARCHAR(100);
ALTER TABLE locadores ADD COLUMN endereco_cidade VARCHAR(100);
ALTER TABLE locadores ADD COLUMN endereco_estado VARCHAR(2);
ALTER TABLE locadores ADD COLUMN endereco_cep VARCHAR(9);
ALTER TABLE locadores ADD COLUMN banco VARCHAR(100);
ALTER TABLE locadores ADD COLUMN agencia VARCHAR(10);
ALTER TABLE locadores ADD COLUMN conta VARCHAR(20);
ALTER TABLE locadores ADD COLUMN tipo_conta VARCHAR(20);
ALTER TABLE locadores ADD COLUMN pix_chave VARCHAR(255);
ALTER TABLE locadores ADD COLUMN taxa_administracao DECIMAL(5,2) DEFAULT 0.00;
ALTER TABLE locadores ADD COLUMN ativo INTEGER DEFAULT 1;
ALTER TABLE locadores ADD COLUMN observacoes TEXT;
ALTER TABLE locadores ADD COLUMN data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE locadores ADD COLUMN data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE locadores ADD COLUMN usuario_cadastro INTEGER;
ALTER TABLE locadores ADD COLUMN usuario_ultima_atualizacao INTEGER;

-- Adicionar campos extras do código que fazem sentido
ALTER TABLE locadores ADD COLUMN deseja_fci INTEGER DEFAULT 0;
ALTER TABLE locadores ADD COLUMN deseja_seguro_fianca INTEGER DEFAULT 0;
ALTER TABLE locadores ADD COLUMN deseja_seguro_incendio INTEGER DEFAULT 0;

-- TABELA LOCATARIOS: Adicionar campos faltantes
ALTER TABLE locatarios ADD COLUMN telefone_alternativo VARCHAR(15);
ALTER TABLE locatarios ADD COLUMN data_nascimento DATE;
ALTER TABLE locatarios ADD COLUMN empresa VARCHAR(255);
ALTER TABLE locatarios ADD COLUMN renda_mensal DECIMAL(10,2);
ALTER TABLE locatarios ADD COLUMN endereco_atual_rua VARCHAR(255);
ALTER TABLE locatarios ADD COLUMN endereco_atual_numero VARCHAR(10);
ALTER TABLE locatarios ADD COLUMN endereco_atual_complemento VARCHAR(100);
ALTER TABLE locatarios ADD COLUMN endereco_atual_bairro VARCHAR(100);
ALTER TABLE locatarios ADD COLUMN endereco_atual_cidade VARCHAR(100);
ALTER TABLE locatarios ADD COLUMN endereco_atual_estado VARCHAR(2);
ALTER TABLE locatarios ADD COLUMN endereco_atual_cep VARCHAR(9);
ALTER TABLE locatarios ADD COLUMN tempo_residencia_atual INTEGER;
ALTER TABLE locatarios ADD COLUMN referencia_comercial_nome VARCHAR(255);
ALTER TABLE locatarios ADD COLUMN referencia_comercial_telefone VARCHAR(15);
ALTER TABLE locatarios ADD COLUMN referencia_comercial_empresa VARCHAR(255);
ALTER TABLE locatarios ADD COLUMN referencia_pessoal_nome VARCHAR(255);
ALTER TABLE locatarios ADD COLUMN referencia_pessoal_telefone VARCHAR(15);
ALTER TABLE locatarios ADD COLUMN referencia_pessoal_relacao VARCHAR(100);
ALTER TABLE locatarios ADD COLUMN score_interno INTEGER DEFAULT 500;
ALTER TABLE locatarios ADD COLUMN avaliacoes_media DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE locatarios ADD COLUMN total_avaliacoes INTEGER DEFAULT 0;
ALTER TABLE locatarios ADD COLUMN status_atual VARCHAR(20) DEFAULT 'ATIVO';
ALTER TABLE locatarios ADD COLUMN motivo_status VARCHAR(255);
ALTER TABLE locatarios ADD COLUMN aceita_pets INTEGER DEFAULT 0;
ALTER TABLE locatarios ADD COLUMN fumante INTEGER DEFAULT 0;
ALTER TABLE locatarios ADD COLUMN possui_fiador INTEGER DEFAULT 0;

-- Adicionar campos extras do código
ALTER TABLE locatarios ADD COLUMN responsavel_pgto_agua VARCHAR(50);
ALTER TABLE locatarios ADD COLUMN responsavel_pgto_luz VARCHAR(50);
ALTER TABLE locatarios ADD COLUMN responsavel_pgto_gas VARCHAR(50);
ALTER TABLE locatarios ADD COLUMN dados_moradores TEXT;
ALTER TABLE locatarios ADD COLUMN qtd_dependentes INTEGER DEFAULT 0;
ALTER TABLE locatarios ADD COLUMN qtd_pets INTEGER DEFAULT 0;
ALTER TABLE locatarios ADD COLUMN porte_pet VARCHAR(50);

-- TABELA IMOVEIS: Adicionar campos faltantes
ALTER TABLE imoveis ADD COLUMN latitude DECIMAL(10,8);
ALTER TABLE imoveis ADD COLUMN longitude DECIMAL(11,8);
ALTER TABLE imoveis ADD COLUMN finalidade VARCHAR(20) DEFAULT 'RESIDENCIAL';
ALTER TABLE imoveis ADD COLUMN area_total DECIMAL(8,2);
ALTER TABLE imoveis ADD COLUMN area_construida DECIMAL(8,2);
ALTER TABLE imoveis ADD COLUMN quartos INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN suites INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN banheiros INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN vagas_garagem INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN valor_venda DECIMAL(12,2);
ALTER TABLE imoveis ADD COLUMN valor_deposito DECIMAL(10,2);
ALTER TABLE imoveis ADD COLUMN mobiliado INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN ar_condicionado INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN aquecimento INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN churrasqueira INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN piscina INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN quintal INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN varanda INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN elevador INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN portaria INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN academia INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN salao_festas INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN playground INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN pet_friendly INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN internet_inclusa INTEGER DEFAULT 0;
ALTER TABLE imoveis ADD COLUMN matricula_registro VARCHAR(50);
ALTER TABLE imoveis ADD COLUMN inscricao_iptu VARCHAR(50);
ALTER TABLE imoveis ADD COLUMN habite_se VARCHAR(50);
ALTER TABLE imoveis ADD COLUMN titulo VARCHAR(255);
ALTER TABLE imoveis ADD COLUMN descricao TEXT;
ALTER TABLE imoveis ADD COLUMN observacoes_internas TEXT;
ALTER TABLE imoveis ADD COLUMN data_disponibilidade DATE;
ALTER TABLE imoveis ADD COLUMN motivo_indisponibilidade VARCHAR(255);
ALTER TABLE imoveis ADD COLUMN ativo INTEGER DEFAULT 1;
ALTER TABLE imoveis ADD COLUMN destaque INTEGER DEFAULT 0;

-- Normalizar endereço do imóvel
ALTER TABLE imoveis ADD COLUMN endereco_rua VARCHAR(255);
ALTER TABLE imoveis ADD COLUMN endereco_numero VARCHAR(10);
ALTER TABLE imoveis ADD COLUMN endereco_complemento VARCHAR(100);
ALTER TABLE imoveis ADD COLUMN endereco_bairro VARCHAR(100);
ALTER TABLE imoveis ADD COLUMN endereco_cidade VARCHAR(100);
ALTER TABLE imoveis ADD COLUMN endereco_estado VARCHAR(2);
ALTER TABLE imoveis ADD COLUMN endereco_cep VARCHAR(9);

-- TABELA CONTRATOS: Adicionar campos faltantes
ALTER TABLE contratos ADD COLUMN locador_id INTEGER;
ALTER TABLE contratos ADD COLUMN contrato_anterior_id INTEGER;
ALTER TABLE contratos ADD COLUMN data_assinatura DATE;
ALTER TABLE contratos ADD COLUMN valor_multa_rescisao DECIMAL(10,2);
ALTER TABLE contratos ADD COLUMN indice_reajuste VARCHAR(10) DEFAULT 'IGPM';
ALTER TABLE contratos ADD COLUMN dados_garantia TEXT;
ALTER TABLE contratos ADD COLUMN seguradora VARCHAR(255);
ALTER TABLE contratos ADD COLUMN numero_apolice VARCHAR(100);
ALTER TABLE contratos ADD COLUMN status VARCHAR(20) DEFAULT 'ATIVO';
ALTER TABLE contratos ADD COLUMN motivo_encerramento VARCHAR(255);
ALTER TABLE contratos ADD COLUMN data_encerramento DATE;
ALTER TABLE contratos ADD COLUMN permite_pets INTEGER DEFAULT 0;
ALTER TABLE contratos ADD COLUMN permite_fumantes INTEGER DEFAULT 0;
ALTER TABLE contratos ADD COLUMN inclui_condominio INTEGER DEFAULT 0;
ALTER TABLE contratos ADD COLUMN inclui_iptu INTEGER DEFAULT 0;
ALTER TABLE contratos ADD COLUMN prazo_aviso_renovacao INTEGER DEFAULT 60;
ALTER TABLE contratos ADD COLUMN administradora VARCHAR(255);
ALTER TABLE contratos ADD COLUMN termos_adicionais TEXT;
ALTER TABLE contratos ADD COLUMN data_primeiro_vencimento DATE;
ALTER TABLE contratos ADD COLUMN valor_condominio DECIMAL(10,2) DEFAULT 0;
ALTER TABLE contratos ADD COLUMN valor_iptu DECIMAL(10,2) DEFAULT 0;
ALTER TABLE contratos ADD COLUMN valor_deposito DECIMAL(10,2);
ALTER TABLE contratos ADD COLUMN data_proximo_reajuste DATE;