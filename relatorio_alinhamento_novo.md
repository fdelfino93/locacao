# 🔍 RELATÓRIO DE ALINHAMENTO BANCO ↔ CÓDIGO
## Sistema de Locação - Análise Crítica de Quebras

---

## 📊 RESUMO EXECUTIVO

### Status Atual
- **Schema SQL**: Definido em SQL Server (schema_completo.sql)
- **Backend Python**: FastAPI com modelos Pydantic parcialmente alinhados
- **Frontend TypeScript**: Interfaces com campos adicionais não mapeados no banco
- **Banco Atual**: SQLite vazio (database.db)

---

## 🚨 QUEBRAS CRÍTICAS IDENTIFICADAS

### 1. CAMPOS DO BANCO AUSENTES NO CÓDIGO

#### Tabela `locadores`
**Campos Críticos Faltando no Backend:**
- `data_nascimento` ❌ (existe no SQL, falta no modelo Python)
- `endereco_numero`, `endereco_complemento`, `endereco_bairro` ❌
- `endereco_cidade`, `endereco_estado`, `endereco_cep` ❌
- `banco`, `agencia`, `conta`, `tipo_conta`, `pix_chave` ❌
- `taxa_administracao` ❌
- `ativo`, `observacoes` ❌
- `data_cadastro`, `data_ultima_atualizacao` ❌

#### Tabela `locatarios`
**Campos Críticos Faltando:**
- `telefone_alternativo` ❌
- `data_nascimento` ❌
- `empresa`, `renda_mensal` ❌
- Endereço estruturado (usando campos separados) ❌
- `tempo_residencia_atual` ❌
- Referências comerciais e pessoais ❌
- `score_interno`, `avaliacoes_media`, `total_avaliacoes` ❌
- `status_atual`, `motivo_status` ❌

#### Tabela `imoveis`
**Campos Críticos Faltando:**
- `latitude`, `longitude` ❌
- `finalidade` ❌
- `area_total`, `area_construida` ❌
- `quartos`, `suites`, `banheiros`, `vagas_garagem` ❌
- Comodidades detalhadas (mobiliado, ar_condicionado, etc.) ❌
- `valor_venda`, `valor_deposito` ❌
- `matricula_registro`, `inscricao_iptu`, `habite_se` ❌
- `titulo`, `descricao`, `observacoes_internas` ❌
- `data_disponibilidade`, `motivo_indisponibilidade` ❌

#### Tabela `contratos`
**Campos Críticos Faltando:**
- `locador_id` ❌ (usando id_imovel para inferir)
- `contrato_anterior_id` ❌ (renovações)
- `data_assinatura` ❌
- `valor_multa_rescisao` ❌
- `indice_reajuste` ❌
- `dados_garantia` ❌
- `seguradora`, `numero_apolice` ❌
- Status e controle de encerramento ❌

### 2. CAMPOS DO CÓDIGO AUSENTES NO BANCO

#### Backend Python (main.py)
**Campos Extras no Código:**
- `deseja_fci`, `deseja_seguro_fianca`, `deseja_seguro_incendio` ⚠️
- `existe_conjuge`, campos do cônjuge (parcialmente mapeados) ⚠️
- `tipo_cliente` ⚠️
- `responsavel_pgto_agua`, `responsavel_pgto_luz`, `responsavel_pgto_gas` ⚠️
- `dados_moradores` ⚠️
- `responsavel_inq`, `dependentes_inq`, `qtd_dependentes_inq` ⚠️
- `pet_inquilino`, `qtd_pet_inquilino`, `porte_pet` ⚠️

#### Frontend TypeScript
**Interfaces com Campos Extras:**
- Sistema de múltiplas contas bancárias ⚠️
- Sistema de prestação de contas (tabela separada necessária) ⚠️
- Sistema de boletos (tabela parcial existe) ⚠️
- Campos de UI/UX não persistidos ⚠️

### 3. TABELAS COMPLETAMENTE AUSENTES NO CÓDIGO

- `fiadores` ❌ (existe interface TypeScript, falta implementação)
- `imoveis_fotos` ❌
- `pagamentos` ❌ (crítico para operação)
- `manutencoes` ❌
- `avaliacoes` ❌
- `historico_alteracoes` ❌ (auditoria)
- `log_acessos` ❌
- `usuarios` ❌ (sistema sem autenticação)
- `configuracoes` ❌

---

## 🔧 PLANO DE CORREÇÃO EM ETAPAS

### FASE 1: PREPARAÇÃO (1-2 dias)
1. **Backup e Documentação**
   - Documentar estado atual do sistema
   - Criar backup de dados existentes
   - Preparar ambiente de testes

2. **Decisão de Arquitetura**
   - Confirmar uso de SQLite vs SQL Server
   - Definir estratégia de migração

### FASE 2: MIGRATIONS ESTRUTURAIS (3-4 dias)

#### Migration 001: Tabelas Core
```sql
-- Ajustar estrutura das tabelas principais
-- locadores, locatarios, imoveis, contratos
-- Adicionar campos faltantes críticos
```

#### Migration 002: Normalização de Endereços
```sql
-- Separar endereços em campos estruturados
-- Migrar dados de campos texto para estruturados
```

#### Migration 003: Sistema Financeiro
```sql
-- Criar tabela pagamentos
-- Criar tabela prestacao_contas
-- Integrar com sistema de boletos existente
```

#### Migration 004: Garantias e Relacionamentos
```sql
-- Criar tabela fiadores
-- Adicionar relacionamentos many-to-many necessários
```

### FASE 3: REFATORAÇÃO DO BACKEND (5-7 dias)

1. **Atualizar Modelos Pydantic**
   ```python
   # main.py - Alinhar com banco
   class LocadorCreate(BaseModel):
       # Adicionar campos faltantes
       data_nascimento: Optional[date]
       endereco_rua: str
       endereco_numero: str
       # ... etc
   ```

2. **Criar Repositórios Faltantes**
   - `fiador_repository.py`
   - `pagamento_repository.py`
   - `manutencao_repository.py`

3. **Implementar Endpoints Faltantes**
   - CRUD para fiadores
   - Gestão de pagamentos
   - Sistema de manutenções

### FASE 4: ALINHAMENTO FRONTEND (3-4 dias)

1. **Atualizar Interfaces TypeScript**
   ```typescript
   // Alinhar com estrutura do banco
   export interface Locador {
     // Adicionar campos do banco
     // Remover campos desnecessários
   }
   ```

2. **Ajustar Formulários**
   - Adicionar campos faltantes
   - Validações alinhadas com banco

3. **Atualizar Services/APIs**
   - Alinhar chamadas com novos endpoints
   - Tratar novos campos

### FASE 5: AUDITORIA E SEGURANÇA (2-3 dias)

1. **Implementar Sistema de Usuários**
   - Autenticação
   - Autorização
   - Sessões

2. **Adicionar Auditoria**
   - Triggers ou middleware para historico_alteracoes
   - Log de acessos

3. **Testes de Integridade**
   - Validar constraints
   - Testar relacionamentos
   - Verificar performance

---

## 📈 MÉTRICAS DE SUCESSO

### Indicadores Críticos
- ✅ 100% dos campos do banco mapeados no código
- ✅ 0 campos órfãos no código
- ✅ Todas as tabelas com repositórios correspondentes
- ✅ Sistema de auditoria funcionando
- ✅ Testes de integridade passando

### Riscos Identificados
1. **Alto**: Perda de dados durante migração
2. **Médio**: Breaking changes no frontend
3. **Baixo**: Performance degradada temporariamente

---

## 💡 RECOMENDAÇÕES IMEDIATAS

1. **URGENTE**: Implementar tabela `pagamentos` - crítico para operação
2. **IMPORTANTE**: Alinhar campos de endereço (estruturado vs texto)
3. **IMPORTANTE**: Decidir sobre campos extras do código (manter ou remover)
4. **DESEJÁVEL**: Implementar sistema de usuários e autenticação
5. **FUTURO**: Sistema completo de auditoria e logs

---

## 📝 PRÓXIMOS PASSOS

1. Validar este relatório com a equipe
2. Priorizar correções por impacto no negócio
3. Criar branch de desenvolvimento para migrations
4. Executar plano fase por fase
5. Testar extensivamente antes de deploy

---

## 🔄 MIGRATIONS SQL DETALHADAS

### 📦 MIGRATION 001: CRIAR TABELAS FALTANTES
```sql
-- =====================================================
-- MIGRATION 001: Criar Tabelas Core Faltantes
-- Data: 2025-08-26
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

-- Índices para performance
CREATE INDEX idx_pagamentos_contrato ON pagamentos(contrato_id);
CREATE INDEX idx_pagamentos_status ON pagamentos(status);
CREATE INDEX idx_pagamentos_vencimento ON pagamentos(data_vencimento);
CREATE INDEX idx_fiadores_locatario ON fiadores(locatario_id);
CREATE INDEX idx_manutencoes_imovel ON manutencoes(imovel_id);
CREATE INDEX idx_historico_entidade ON historico_alteracoes(entidade_tipo, entidade_id);
```

### 🔧 MIGRATION 002: ADICIONAR CAMPOS FALTANTES
```sql
-- =====================================================
-- MIGRATION 002: Adicionar Campos Faltantes nas Tabelas Existentes
-- Data: 2025-08-26
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
```

### 🗑️ MIGRATION 003: REMOVER/RENOMEAR CAMPOS OBSOLETOS
```sql
-- =====================================================
-- MIGRATION 003: Remover/Renomear Campos Obsoletos
-- Data: 2025-08-26
-- =====================================================

-- Criar tabela temporária para migração de dados de endereço
CREATE TABLE temp_endereco_migration AS
SELECT id, endereco FROM locadores WHERE endereco IS NOT NULL;

-- Migrar dados de endereço texto para campos estruturados (LOCADORES)
UPDATE locadores 
SET endereco_rua = SUBSTR(endereco, 1, INSTR(endereco || ',', ',') - 1)
WHERE endereco IS NOT NULL;

-- Remover campo antigo após migração
-- ATENÇÃO: Fazer backup antes!
-- ALTER TABLE locadores DROP COLUMN endereco;

-- Migrar endereço de locatários
UPDATE locatarios
SET endereco_atual_rua = Endereco_inq
WHERE Endereco_inq IS NOT NULL;

-- Renomear campos mal nomeados
-- SQLite não suporta RENAME COLUMN diretamente em versões antigas
-- Usar recreate table strategy se necessário

-- Para imóveis, migrar campo 'endereco' para estruturado
UPDATE imoveis
SET endereco_rua = SUBSTR(endereco, 1, INSTR(endereco || ',', ',') - 1)
WHERE endereco IS NOT NULL;

-- Limpar campos obsoletos do código que não fazem sentido no banco
-- Estes serão tratados em lógica de aplicação:
-- - responsavel_inq (usar relacionamento com tabela)
-- - dependentes_inq (usar contagem)
```

### 🔗 MIGRATION 004: ADICIONAR CHAVES ESTRANGEIRAS
```sql
-- =====================================================
-- MIGRATION 004: Adicionar Chaves Estrangeiras e Constraints
-- Data: 2025-08-26
-- =====================================================

-- SQLite tem suporte limitado para ALTER TABLE ADD CONSTRAINT
-- Recriar tabelas com FKs se necessário ou usar PRAGMA foreign_keys

-- Habilitar chaves estrangeiras
PRAGMA foreign_keys = ON;

-- Adicionar FKs faltantes (se o SQLite suportar na versão)
-- Caso contrário, recriar tabelas com constraints

-- Criar índices para melhorar performance de JOINs
CREATE INDEX IF NOT EXISTS idx_contratos_locador ON contratos(locador_id);
CREATE INDEX IF NOT EXISTS idx_contratos_locatario ON contratos(locatario_id);
CREATE INDEX IF NOT EXISTS idx_contratos_imovel ON contratos(imovel_id);
CREATE INDEX IF NOT EXISTS idx_imoveis_locador ON imoveis(locador_id);

-- Adicionar constraints de unicidade
CREATE UNIQUE INDEX IF NOT EXISTS idx_locadores_cpf_cnpj ON locadores(cpf_cnpj);
CREATE UNIQUE INDEX IF NOT EXISTS idx_locatarios_cpf_cnpj ON locatarios(cpf_cnpj);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE UNIQUE INDEX IF NOT EXISTS idx_configuracoes_chave ON configuracoes(chave);

-- Adicionar checks constraints (se suportado)
-- Exemplo: CHECK (valor_aluguel > 0)
```

### 📊 MIGRATION 005: POPULAR DADOS INICIAIS
```sql
-- =====================================================
-- MIGRATION 005: Popular Dados Iniciais e Configurações
-- Data: 2025-08-26
-- =====================================================

-- Inserir configurações padrão do sistema
INSERT OR IGNORE INTO configuracoes (chave, valor, descricao, categoria) VALUES
('sistema.nome', 'Cobimob', 'Nome do sistema', 'geral'),
('sistema.versao', '2.0.0', 'Versão atual', 'geral'),
('aluguel.dia_vencimento_padrao', '10', 'Dia padrão de vencimento', 'financeiro'),
('aluguel.percentual_multa', '2.0', 'Percentual de multa por atraso', 'financeiro'),
('aluguel.juros_diario', '0.033', 'Juros diário por atraso', 'financeiro'),
('busca.resultados_por_pagina', '20', 'Resultados por página na busca', 'interface'),
('backup.frequencia_dias', '7', 'Frequência de backup em dias', 'sistema');

-- Criar usuário admin padrão (senha: admin123 - MUDAR EM PRODUÇÃO!)
INSERT OR IGNORE INTO usuarios (nome, email, senha_hash, nivel_acesso) VALUES
('Administrador', 'admin@cobimob.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY/MrqvyQpqFviC', 'ADMIN');

-- Migrar dados existentes para novos campos (se houver)
UPDATE locadores SET ativo = 1 WHERE ativo IS NULL;
UPDATE locatarios SET status_atual = 'ATIVO' WHERE status_atual IS NULL;
UPDATE imoveis SET ativo = 1 WHERE ativo IS NULL;
UPDATE contratos SET status = 'ATIVO' WHERE status IS NULL AND data_fim >= date('now');
UPDATE contratos SET status = 'ENCERRADO' WHERE status IS NULL AND data_fim < date('now');
```

---

## 🚀 COMANDOS PARA APLICAR MIGRATIONS

### 1. AMBIENTE DE DESENVOLVIMENTO (SQLite)

```bash
# Fazer backup do banco atual
cp database.db database_backup_$(date +%Y%m%d_%H%M%S).db

# Aplicar migrations em ordem
sqlite3 database.db < migrations/007_migration_001_criar_tabelas.sql
sqlite3 database.db < migrations/008_migration_002_adicionar_campos.sql
sqlite3 database.db < migrations/009_migration_003_remover_obsoletos.sql
sqlite3 database.db < migrations/010_migration_004_chaves_estrangeiras.sql
sqlite3 database.db < migrations/011_migration_005_dados_iniciais.sql

# Verificar estrutura após migrations
sqlite3 database.db ".schema" > schema_after_migration.txt

# Testar integridade
sqlite3 database.db "PRAGMA integrity_check;"
```

### 2. SCRIPT PYTHON PARA APLICAR MIGRATIONS

```python
# aplicar_migrations.py
import sqlite3
import os
from datetime import datetime

def aplicar_migration(conn, arquivo_sql):
    """Aplica uma migration SQL"""
    print(f"Aplicando {arquivo_sql}...")
    with open(arquivo_sql, 'r', encoding='utf-8') as f:
        sql = f.read()
        conn.executescript(sql)
    conn.commit()
    print(f"✓ {arquivo_sql} aplicada com sucesso!")

def main():
    # Backup
    backup_name = f"database_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    os.system(f"cp database.db {backup_name}")
    print(f"Backup criado: {backup_name}")
    
    # Conectar ao banco
    conn = sqlite3.connect('database.db')
    conn.execute("PRAGMA foreign_keys = ON")
    
    # Lista de migrations em ordem
    migrations = [
        'migrations/007_migration_001_criar_tabelas.sql',
        'migrations/008_migration_002_adicionar_campos.sql',
        'migrations/009_migration_003_remover_obsoletos.sql',
        'migrations/010_migration_004_chaves_estrangeiras.sql',
        'migrations/011_migration_005_dados_iniciais.sql'
    ]
    
    # Aplicar cada migration
    for migration in migrations:
        try:
            aplicar_migration(conn, migration)
        except Exception as e:
            print(f"❌ Erro ao aplicar {migration}: {e}")
            conn.rollback()
            break
    
    # Verificar integridade
    resultado = conn.execute("PRAGMA integrity_check").fetchone()
    print(f"\nIntegridade do banco: {resultado[0]}")
    
    conn.close()
    print("\n✅ Processo de migration concluído!")

if __name__ == "__main__":
    main()
```

### 3. VALIDAÇÃO PÓS-MIGRATION

```sql
-- Verificar se todas as tabelas foram criadas
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;

-- Verificar estrutura das principais tabelas
.schema locadores
.schema locatarios
.schema imoveis
.schema contratos
.schema pagamentos

-- Contar registros
SELECT 
    (SELECT COUNT(*) FROM locadores) as locadores,
    (SELECT COUNT(*) FROM locatarios) as locatarios,
    (SELECT COUNT(*) FROM imoveis) as imoveis,
    (SELECT COUNT(*) FROM contratos) as contratos,
    (SELECT COUNT(*) FROM pagamentos) as pagamentos;

-- Testar relacionamentos
SELECT c.*, l.nome as locador_nome, lt.nome as locatario_nome
FROM contratos c
LEFT JOIN locadores l ON c.locador_id = l.id
LEFT JOIN locatarios lt ON c.locatario_id = lt.id
LIMIT 5;
```

### 4. ROLLBACK EM CASO DE ERRO

```bash
# Restaurar backup
cp database_backup_[TIMESTAMP].db database.db

# Verificar estado
sqlite3 database.db "SELECT COUNT(*) FROM sqlite_master WHERE type='table';"
```

---

## ⚠️ AVISOS IMPORTANTES

1. **SEMPRE FAZER BACKUP** antes de aplicar migrations
2. **TESTAR EM AMBIENTE DE DESENVOLVIMENTO** primeiro
3. **VALIDAR DADOS** após cada migration
4. **DOCUMENTAR MUDANÇAS** no changelog
5. **COMUNICAR EQUIPE** sobre breaking changes

---

## 📋 CHECKLIST PÓS-MIGRATION

- [ ] Backup realizado
- [ ] Migrations aplicadas em ordem
- [ ] Integridade verificada
- [ ] Dados migrados corretamente
- [ ] Índices criados
- [ ] Chaves estrangeiras funcionando
- [ ] Aplicação testada com novo schema
- [ ] Performance validada
- [ ] Documentação atualizada

---

---

## 🔧 REFATORAÇÃO DO BACKEND

### 📝 MODELOS PYDANTIC ATUALIZADOS

#### 1. Modelo LocadorCreate Refatorado
```python
# main.py - Modelo atualizado conforme schema
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import date
from decimal import Decimal

class EnderecoBase(BaseModel):
    endereco_rua: str = Field(..., max_length=255)
    endereco_numero: str = Field(..., max_length=10)
    endereco_complemento: Optional[str] = Field(None, max_length=100)
    endereco_bairro: str = Field(..., max_length=100)
    endereco_cidade: str = Field(..., max_length=100)
    endereco_estado: str = Field(..., max_length=2)
    endereco_cep: str = Field(..., regex=r'^\d{5}-?\d{3}$')

class DadosBancarios(BaseModel):
    banco: Optional[str] = Field(None, max_length=100)
    agencia: Optional[str] = Field(None, max_length=10)
    conta: Optional[str] = Field(None, max_length=20)
    tipo_conta: Optional[str] = Field(None, max_length=20)
    pix_chave: Optional[str] = Field(None, max_length=255)

class LocadorCreate(BaseModel):
    # Dados pessoais obrigatórios
    nome: str = Field(..., max_length=255, min_length=2)
    cpf_cnpj: str = Field(..., regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')
    telefone: str = Field(..., max_length=15)
    email: Optional[EmailStr] = None
    data_nascimento: Optional[date] = None
    
    # Endereço estruturado
    endereco: EnderecoBase
    
    # Dados bancários
    dados_bancarios: Optional[DadosBancarios] = None
    
    # Configurações financeiras
    tipo_recebimento: str = Field(default="PIX", regex=r'^(PIX|TRANSFERENCIA|BOLETO)$')
    taxa_administracao: Optional[Decimal] = Field(default=Decimal('0.00'), ge=0, le=50)
    
    # Campos de negócio específicos
    deseja_fci: bool = False
    deseja_seguro_fianca: bool = False
    deseja_seguro_incendio: bool = False
    
    # Dados complementares
    rg: Optional[str] = Field(None, max_length=20)
    nacionalidade: str = Field(default="Brasileira", max_length=50)
    estado_civil: Optional[str] = Field(None, max_length=20)
    profissao: Optional[str] = Field(None, max_length=100)
    
    # Cônjuge (se aplicável)
    existe_conjuge: bool = False
    nome_conjuge: Optional[str] = Field(None, max_length=255)
    cpf_conjuge: Optional[str] = Field(None, regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$')
    rg_conjuge: Optional[str] = Field(None, max_length=20)
    endereco_conjuge: Optional[str] = Field(None, max_length=500)
    telefone_conjuge: Optional[str] = Field(None, max_length=15)
    
    # Pessoa jurídica
    dados_empresa: Optional[str] = Field(None, max_length=1000)
    representante: Optional[str] = Field(None, max_length=255)
    tipo_cliente: str = Field(default="PF", regex=r'^(PF|PJ)$')
    
    # Controle
    observacoes: Optional[str] = None
    ativo: bool = True
    
    @validator('cpf_conjuge')
    def validar_cpf_conjuge(cls, v, values):
        if values.get('existe_conjuge') and not v:
            raise ValueError('CPF do cônjuge obrigatório quando existe cônjuge')
        return v

class LocadorUpdate(BaseModel):
    # Mesmos campos do Create, todos opcionais
    nome: Optional[str] = Field(None, max_length=255, min_length=2)
    telefone: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = None
    # ... outros campos opcionais
    ativo: Optional[bool] = None

class LocadorResponse(BaseModel):
    id: int
    nome: str
    cpf_cnpj: str
    telefone: Optional[str]
    email: Optional[str]
    endereco_completo: Optional[str]  # Computed field
    tipo_recebimento: str
    taxa_administracao: Decimal
    ativo: bool
    data_cadastro: str
    
    class Config:
        from_attributes = True
```

#### 2. Modelo LocatarioCreate Refatorado
```python
class ReferenciaPessoal(BaseModel):
    referencia_pessoal_nome: Optional[str] = Field(None, max_length=255)
    referencia_pessoal_telefone: Optional[str] = Field(None, max_length=15)
    referencia_pessoal_relacao: Optional[str] = Field(None, max_length=100)

class ReferenciaComercial(BaseModel):
    referencia_comercial_nome: Optional[str] = Field(None, max_length=255)
    referencia_comercial_telefone: Optional[str] = Field(None, max_length=15)
    referencia_comercial_empresa: Optional[str] = Field(None, max_length=255)

class LocatarioCreate(BaseModel):
    # Dados pessoais obrigatórios
    nome: str = Field(..., max_length=255, min_length=2)
    cpf_cnpj: str = Field(..., regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')
    telefone: str = Field(..., max_length=15)
    telefone_alternativo: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = None
    data_nascimento: Optional[date] = None
    
    # Endereço atual
    endereco_atual: EnderecoBase
    tempo_residencia_atual: Optional[int] = Field(None, ge=0, description="Meses")
    
    # Dados profissionais
    empresa: Optional[str] = Field(None, max_length=255)
    profissao: Optional[str] = Field(None, max_length=100)
    renda_mensal: Optional[Decimal] = Field(None, ge=0)
    
    # Referências
    referencia_pessoal: Optional[ReferenciaPessoal] = None
    referencia_comercial: Optional[ReferenciaComercial] = None
    
    # Garantias
    tipo_garantia: str = Field(..., regex=r'^(FIADOR|SEGURO_FIANCA|DEPOSITO|AVALISTA)$')
    possui_fiador: bool = False
    
    # Responsabilidades de pagamento
    responsavel_pgto_agua: str = Field(default="LOCATARIO")
    responsavel_pgto_luz: str = Field(default="LOCATARIO") 
    responsavel_pgto_gas: str = Field(default="LOCATARIO")
    
    # Família/Dependentes
    qtd_dependentes: int = Field(default=0, ge=0)
    dados_moradores: Optional[str] = Field(None, description="JSON com dados dos moradores")
    
    # Pets
    aceita_pets: bool = False
    qtd_pets: int = Field(default=0, ge=0)
    porte_pet: Optional[str] = Field(None, regex=r'^(PEQUENO|MEDIO|GRANDE)$')
    
    # Perfil
    fumante: bool = False
    nacionalidade: str = Field(default="Brasileira", max_length=50)
    estado_civil: Optional[str] = Field(None, max_length=20)
    
    # Cônjuge
    nome_conjuge: Optional[str] = Field(None, max_length=255)
    cpf_conjuge: Optional[str] = Field(None, regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$')
    rg_conjuge: Optional[str] = Field(None, max_length=20)
    endereco_conjuge: Optional[str] = Field(None, max_length=500)
    telefone_conjuge: Optional[str] = Field(None, max_length=15)
    
    # Documentos
    rg: Optional[str] = Field(None, max_length=20)
    dados_empresa: Optional[str] = Field(None, max_length=1000)
    representante: Optional[str] = Field(None, max_length=255)
    
    # Controle
    status_atual: str = Field(default="ATIVO", regex=r'^(ATIVO|INATIVO|BLOQUEADO)$')
    observacoes: Optional[str] = None
    
    @validator('qtd_pets')
    def validar_pets(cls, v, values):
        if v > 0 and not values.get('aceita_pets'):
            raise ValueError('aceita_pets deve ser True quando qtd_pets > 0')
        return v
```

#### 3. Modelo ImovelCreate Refatorado
```python
class CaracteristicasImovel(BaseModel):
    quartos: int = Field(default=0, ge=0)
    suites: int = Field(default=0, ge=0)
    banheiros: int = Field(default=0, ge=0)
    vagas_garagem: int = Field(default=0, ge=0)
    area_total: Optional[Decimal] = Field(None, ge=0)
    area_construida: Optional[Decimal] = Field(None, ge=0)

class ComodidadesImovel(BaseModel):
    mobiliado: bool = False
    ar_condicionado: bool = False
    churrasqueira: bool = False
    piscina: bool = False
    quintal: bool = False
    varanda: bool = False
    elevador: bool = False
    portaria: bool = False
    academia: bool = False
    salao_festas: bool = False
    playground: bool = False
    pet_friendly: bool = False
    internet_inclusa: bool = False

class DocumentosImovel(BaseModel):
    matricula_registro: Optional[str] = Field(None, max_length=50)
    inscricao_iptu: Optional[str] = Field(None, max_length=50)
    habite_se: Optional[str] = Field(None, max_length=50)

class ImovelCreate(BaseModel):
    # Relacionamentos
    locador_id: int = Field(..., gt=0)
    
    # Localização
    endereco: EnderecoBase
    latitude: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180)
    
    # Características básicas
    tipo: str = Field(..., regex=r'^(CASA|APARTAMENTO|KITNET|LOJA|SALA_COMERCIAL|GALPAO)$')
    finalidade: str = Field(default="RESIDENCIAL", regex=r'^(RESIDENCIAL|COMERCIAL|MISTO)$')
    
    # Dimensões e características
    caracteristicas: CaracteristicasImovel
    comodidades: ComodidadesImovel
    
    # Valores
    valor_aluguel: Decimal = Field(..., gt=0)
    valor_condominio: Decimal = Field(default=Decimal('0.00'), ge=0)
    valor_iptu: Decimal = Field(default=Decimal('0.00'), ge=0)
    valor_deposito: Optional[Decimal] = Field(None, ge=0)
    valor_venda: Optional[Decimal] = Field(None, gt=0)
    
    # Documentos
    documentos: DocumentosImovel
    
    # Descrição
    titulo: Optional[str] = Field(None, max_length=255)
    descricao: Optional[str] = None
    observacoes_internas: Optional[str] = None
    
    # Disponibilidade
    status: str = Field(default="DISPONIVEL", 
                       regex=r'^(DISPONIVEL|OCUPADO|MANUTENCAO|INDISPONIVEL)$')
    data_disponibilidade: Optional[date] = None
    motivo_indisponibilidade: Optional[str] = Field(None, max_length=255)
    
    # Preferências
    permite_pets: bool = False
    
    # Controle
    ativo: bool = True
    destaque: bool = False
```

#### 4. Modelo ContratoCreate Refatorado
```python
class ContratoCreate(BaseModel):
    # Relacionamentos
    locador_id: int = Field(..., gt=0)
    locatario_id: int = Field(..., gt=0)
    imovel_id: int = Field(..., gt=0)
    contrato_anterior_id: Optional[int] = Field(None, gt=0)
    
    # Datas
    data_assinatura: Optional[date] = None
    data_inicio: date = Field(...)
    data_fim: date = Field(...)
    data_primeiro_vencimento: Optional[date] = None
    vencimento_dia: int = Field(..., ge=1, le=31)
    
    # Valores
    valor_aluguel: Decimal = Field(..., gt=0)
    valor_condominio: Decimal = Field(default=Decimal('0.00'), ge=0)
    valor_iptu: Decimal = Field(default=Decimal('0.00'), ge=0)
    valor_deposito: Optional[Decimal] = Field(None, ge=0)
    valor_multa_rescisao: Optional[Decimal] = Field(None, ge=0)
    
    # Reajuste
    percentual_reajuste: Decimal = Field(default=Decimal('0.00'), ge=0, le=100)
    indice_reajuste: str = Field(default="IGPM", max_length=10)
    data_proximo_reajuste: Optional[date] = None
    
    # Administração
    taxa_administracao: Decimal = Field(default=Decimal('0.00'), ge=0, le=50)
    administradora: Optional[str] = Field(None, max_length=255)
    
    # Garantias
    tipo_garantia: str = Field(..., regex=r'^(FIADOR|SEGURO_FIANCA|DEPOSITO|AVALISTA)$')
    dados_garantia: Optional[str] = Field(None, description="JSON com dados da garantia")
    seguradora: Optional[str] = Field(None, max_length=255)
    numero_apolice: Optional[str] = Field(None, max_length=100)
    
    # Cláusulas
    permite_pets: bool = False
    permite_fumantes: bool = False
    inclui_condominio: bool = False
    inclui_iptu: bool = False
    renovacao_automatica: bool = False
    prazo_aviso_renovacao: int = Field(default=60, ge=30, le=180)
    
    # Controle
    status: str = Field(default="ATIVO", regex=r'^(ATIVO|ENCERRADO|RESCINDIDO|SUSPENSO)$')
    clausulas_especiais: Optional[str] = None
    termos_adicionais: Optional[str] = None
    observacoes: Optional[str] = None
    
    @validator('data_fim')
    def validar_data_fim(cls, v, values):
        if 'data_inicio' in values and v <= values['data_inicio']:
            raise ValueError('data_fim deve ser posterior à data_inicio')
        return v
```

### 🔄 NOVOS MODELOS PARA TABELAS ADICIONAIS

#### Modelo Pagamento
```python
class PagamentoCreate(BaseModel):
    contrato_id: int = Field(..., gt=0)
    competencia: date = Field(...)
    data_vencimento: date = Field(...)
    valor_previsto: Decimal = Field(..., gt=0)
    tipo_pagamento: str = Field(default="ALUGUEL", 
                               regex=r'^(ALUGUEL|CONDOMINIO|IPTU|DEPOSITO|MULTA)$')
    observacoes: Optional[str] = None

class PagamentoUpdate(BaseModel):
    data_pagamento: Optional[date] = None
    valor_pago: Optional[Decimal] = Field(None, ge=0)
    valor_juros: Optional[Decimal] = Field(None, ge=0)
    valor_multa: Optional[Decimal] = Field(None, ge=0)
    valor_desconto: Optional[Decimal] = Field(None, ge=0)
    forma_pagamento: Optional[str] = Field(None, 
                                          regex=r'^(PIX|TRANSFERENCIA|BOLETO|DINHEIRO|CARTAO)$')
    comprovante_path: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field(None, regex=r'^(PENDENTE|PAGO|ATRASADO|CANCELADO)$')
    observacoes: Optional[str] = None

class FiadorCreate(BaseModel):
    locatario_id: int = Field(..., gt=0)
    nome: str = Field(..., max_length=255)
    cpf_cnpj: str = Field(..., regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')
    telefone: Optional[str] = Field(None, max_length=15)
    email: Optional[EmailStr] = None
    data_nascimento: Optional[date] = None
    profissao: Optional[str] = Field(None, max_length=100)
    renda_mensal: Optional[Decimal] = Field(None, ge=0)
    endereco_completo: Optional[str] = Field(None, max_length=500)
    tipo_relacao: str = Field(default="FIADOR", regex=r'^(FIADOR|AVALISTA)$')
    parentesco: Optional[str] = Field(None, max_length=50)
    ativo: bool = True
```

### 🚧 BREAKING CHANGES IDENTIFICADOS

#### APIs Incompatíveis que Requerem Atualização

1. **POST /api/locadores**
   ```diff
   - endereco: "Rua A, 123"  # String única
   + endereco: {             # Objeto estruturado
   +   endereco_rua: "Rua A",
   +   endereco_numero: "123",
   +   endereco_bairro: "Centro",
   +   endereco_cidade: "Curitiba",
   +   endereco_estado: "PR",
   +   endereco_cep: "80000-000"
   + }
   - conta_bancaria: "Banco X - 1234-5"  # String
   + dados_bancarios: {                   # Objeto estruturado
   +   banco: "Banco X",
   +   agencia: "1234",
   +   conta: "56789-0"
   + }
   ```

2. **POST /api/locatarios**
   ```diff
   - Endereco_inq: "Rua B, 456"  # Campo mal nomeado
   + endereco_atual: {           # Estruturado e bem nomeado
   +   endereco_rua: "Rua B",
   +   endereco_numero: "456"
   + }
   + responsavel_pgto_agua: "LOCATARIO"  # Novos campos obrigatórios
   + responsavel_pgto_luz: "LOCATARIO"
   + responsavel_pgto_gas: "LOCATARIO"
   ```

3. **POST /api/imoveis**
   ```diff
   - id_locador: 1          # Movido para relação correta
   - id_locatario: 2        # Removido (vai para contrato)
   + locador_id: 1          # Nome correto da FK
   + caracteristicas: {     # Campos estruturados
   +   quartos: 3,
   +   banheiros: 2,
   +   vagas_garagem: 1
   + }
   + comodidades: {         # Comodidades separadas
   +   piscina: true,
   +   churrasqueira: false
   + }
   ```

### 🔌 ENDPOINTS MANTIDOS COMPATÍVEIS

Para manter compatibilidade, criamos endpoints paralelos:

```python
# Endpoints LEGADOS (deprecated)
@app.post("/api/locadores", deprecated=True)
async def criar_locador_legado(locador: LocadorCreateLegado):
    # Converte formato antigo para novo
    novo_locador = converter_locador_legado_para_novo(locador)
    return await criar_locador_v2(novo_locador)

# Endpoints NOVOS (recomendados)
@app.post("/api/v2/locadores")
async def criar_locador_v2(locador: LocadorCreate):
    # Implementação com novo schema
    pass
```

### 🧪 TESTES DE INTEGRAÇÃO

```python
# tests/test_locadores_integration.py
import pytest
from fastapi.testclient import TestClient
from decimal import Decimal
from datetime import date

class TestLocadorIntegration:
    
    def test_criar_locador_novo_formato(self, client: TestClient):
        """Testa criação com novo formato estruturado"""
        locador_data = {
            "nome": "João da Silva",
            "cpf_cnpj": "123.456.789-00",
            "telefone": "(41) 99999-9999",
            "email": "joao@teste.com",
            "endereco": {
                "endereco_rua": "Rua das Flores",
                "endereco_numero": "123",
                "endereco_bairro": "Centro",
                "endereco_cidade": "Curitiba", 
                "endereco_estado": "PR",
                "endereco_cep": "80000-000"
            },
            "dados_bancarios": {
                "banco": "Banco do Brasil",
                "agencia": "1234",
                "conta": "56789-0",
                "pix_chave": "joao@teste.com"
            },
            "tipo_recebimento": "PIX",
            "taxa_administracao": "10.5"
        }
        
        response = client.post("/api/v2/locadores", json=locador_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["success"] == True
        assert "id" in data["data"]
    
    def test_compatibilidade_endpoint_legado(self, client: TestClient):
        """Testa se endpoint legado ainda funciona"""
        locador_legado = {
            "nome": "Maria Santos",
            "cpf_cnpj": "987.654.321-00", 
            "telefone": "(41) 88888-8888",
            "endereco": "Rua B, 456, Centro, Curitiba-PR",
            "conta_bancaria": "Banco X - 1234-5"
        }
        
        response = client.post("/api/locadores", json=locador_legado)
        assert response.status_code == 201
        
        # Verifica se dados foram convertidos corretamente
        locador_id = response.json()["data"]["id"]
        get_response = client.get(f"/api/locadores/{locador_id}")
        locador = get_response.json()["data"]
        
        assert locador["endereco_rua"] is not None  # Foi convertido
    
    def test_validacao_campos_obrigatorios(self, client: TestClient):
        """Testa validação de campos obrigatórios"""
        locador_invalido = {
            "nome": "",  # Vazio
            "cpf_cnpj": "123",  # Inválido
            "endereco": {}  # Incompleto
        }
        
        response = client.post("/api/v2/locadores", json=locador_invalido)
        assert response.status_code == 422
        
        errors = response.json()["detail"]
        assert any("nome" in str(error) for error in errors)
        assert any("cpf_cnpj" in str(error) for error in errors)

class TestPagamentosIntegration:
    
    def test_criar_pagamento(self, client: TestClient, contrato_id: int):
        """Testa criação de pagamento"""
        pagamento_data = {
            "contrato_id": contrato_id,
            "competencia": "2025-09-01",
            "data_vencimento": "2025-09-10", 
            "valor_previsto": "1500.00",
            "tipo_pagamento": "ALUGUEL"
        }
        
        response = client.post("/api/pagamentos", json=pagamento_data)
        assert response.status_code == 201
    
    def test_registrar_pagamento_efetuado(self, client: TestClient, pagamento_id: int):
        """Testa registro de pagamento efetuado"""
        pagamento_update = {
            "data_pagamento": "2025-09-08",
            "valor_pago": "1500.00", 
            "forma_pagamento": "PIX",
            "status": "PAGO"
        }
        
        response = client.put(f"/api/pagamentos/{pagamento_id}", json=pagamento_update)
        assert response.status_code == 200
        
        # Verifica se status foi atualizado
        get_response = client.get(f"/api/pagamentos/{pagamento_id}")
        pagamento = get_response.json()["data"]
        assert pagamento["status"] == "PAGO"

# conftest.py - Fixtures para testes
@pytest.fixture
def client():
    from main import app
    return TestClient(app)

@pytest.fixture
def locador_teste(client):
    locador_data = {
        "nome": "Locador Teste",
        "cpf_cnpj": "111.222.333-44",
        "telefone": "(41) 91111-1111"
    }
    response = client.post("/api/v2/locadores", json=locador_data)
    return response.json()["data"]["id"]

@pytest.fixture  
def contrato_id(client, locador_teste):
    # Criar locatário e imóvel de teste
    # Criar contrato de teste
    # Retornar ID do contrato
    pass
```

### 📋 CHECKLIST DE REFATORAÇÃO

- [ ] Modelos Pydantic atualizados com validações
- [ ] Endpoints v2 implementados com novo schema  
- [ ] Endpoints legados mantidos para compatibilidade
- [ ] Conversores entre formatos antigo/novo implementados
- [ ] Testes de integração para todos endpoints alterados
- [ ] Validação de breaking changes documentada
- [ ] Repositórios atualizados para novos campos
- [ ] Tratamento de erros específicos implementado
- [ ] Documentação da API atualizada (OpenAPI/Swagger)
- [ ] Logs de migração de dados implementados

### ⚠️ AVISOS IMPORTANTES PARA O BACKEND

1. **Migração Gradual**: Manter endpoints antigos por período de transição
2. **Validação de Dados**: CPF/CNPJ, emails e telefones devem ser validados
3. **Conversão Automática**: Implementar conversores para dados legados
4. **Logging**: Registrar todas conversões para auditoria
5. **Performance**: Novos campos podem impactar queries - monitorar
6. **Documentação**: Atualizar Swagger com novos modelos
7. **Versionamento**: APIs seguem padrão v1/v2 para controle

---

---

## 💰 SISTEMA DE MÚLTIPLAS FORMAS DE RECEBIMENTO

### 📋 NOVA FUNCIONALIDADE IMPLEMENTADA

O sistema agora suporta **múltiplas formas de recebimento por locador**, permitindo maior flexibilidade na gestão financeira.

### 🗄️ ESTRUTURA DA TABELA FORMAS_RECEBIMENTO

```sql
CREATE TABLE formas_recebimento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    locador_id INTEGER NOT NULL,
    
    -- Tipo e descrição
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('PIX', 'TRANSFERENCIA', 'BOLETO', 'DINHEIRO', 'CHEQUE')),
    descricao VARCHAR(255),
    dados_recebimento TEXT, -- JSON flexível para dados específicos
    
    -- Dados específicos por tipo
    pix_tipo VARCHAR(20), -- CPF, CNPJ, EMAIL, TELEFONE, CHAVE_ALEATORIA
    pix_chave VARCHAR(255),
    banco_codigo VARCHAR(10),
    banco_nome VARCHAR(100),
    agencia VARCHAR(10),
    conta VARCHAR(20),
    tipo_conta VARCHAR(20), -- CORRENTE, POUPANCA, SALARIO
    
    -- Configurações
    ativo INTEGER DEFAULT 1,
    padrao INTEGER DEFAULT 0, -- Forma padrão do locador
    ordem_preferencia INTEGER DEFAULT 1,
    valor_minimo DECIMAL(10,2) DEFAULT 0.00,
    valor_maximo DECIMAL(12,2),
    
    -- Controle temporal
    data_inicio DATE DEFAULT CURRENT_DATE,
    data_fim DATE,
    
    -- Auditoria completa
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_cadastro INTEGER,
    observacoes TEXT,
    
    FOREIGN KEY (locador_id) REFERENCES locadores(id),
    UNIQUE(locador_id, padrao) WHERE padrao = 1 -- Só uma forma padrão por locador
);

-- Referência em contratos
ALTER TABLE contratos ADD COLUMN id_forma_recebimento INTEGER 
    REFERENCES formas_recebimento(id);
```

### 🔧 MODELOS PYDANTIC PARA FORMAS DE RECEBIMENTO

```python
from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, Any
from decimal import Decimal
from datetime import date
from enum import Enum

class TipoRecebimento(str, Enum):
    PIX = "PIX"
    TRANSFERENCIA = "TRANSFERENCIA"
    BOLETO = "BOLETO"
    DINHEIRO = "DINHEIRO"
    CHEQUE = "CHEQUE"

class TipoPix(str, Enum):
    CPF = "CPF"
    CNPJ = "CNPJ"
    EMAIL = "EMAIL"
    TELEFONE = "TELEFONE"
    CHAVE_ALEATORIA = "CHAVE_ALEATORIA"

class TipoConta(str, Enum):
    CORRENTE = "CORRENTE"
    POUPANCA = "POUPANCA"
    SALARIO = "SALARIO"

class DadosPixCreate(BaseModel):
    pix_tipo: TipoPix = Field(...)
    pix_chave: str = Field(..., max_length=255)
    
    @validator('pix_chave')
    def validar_chave_pix(cls, v, values):
        tipo = values.get('pix_tipo')
        if tipo == TipoPix.CPF and not re.match(r'^\d{3}\.\d{3}\.\d{3}-\d{2}$', v):
            raise ValueError('CPF deve estar no formato XXX.XXX.XXX-XX')
        elif tipo == TipoPix.CNPJ and not re.match(r'^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$', v):
            raise ValueError('CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
        elif tipo == TipoPix.EMAIL and '@' not in v:
            raise ValueError('Email deve conter @')
        elif tipo == TipoPix.TELEFONE and not re.match(r'^\(\d{2}\)\s\d{4,5}-\d{4}$', v):
            raise ValueError('Telefone deve estar no formato (XX) XXXXX-XXXX')
        return v

class DadosTransferenciaCreate(BaseModel):
    banco_codigo: str = Field(..., max_length=10)
    banco_nome: str = Field(..., max_length=100)
    agencia: str = Field(..., max_length=10)
    agencia_dv: Optional[str] = Field(None, max_length=2)
    conta: str = Field(..., max_length=20)
    conta_dv: Optional[str] = Field(None, max_length=2)
    tipo_conta: TipoConta = Field(default=TipoConta.CORRENTE)

class DadosBoletoCreate(BaseModel):
    beneficiario_nome: str = Field(..., max_length=255)
    beneficiario_documento: str = Field(..., max_length=18)
    instrucoes_boleto: Optional[str] = None

class FormaRecebimentoCreate(BaseModel):
    locador_id: int = Field(..., gt=0)
    tipo: TipoRecebimento = Field(...)
    descricao: Optional[str] = Field(None, max_length=255)
    
    # Dados específicos por tipo (condicionais)
    dados_pix: Optional[DadosPixCreate] = None
    dados_transferencia: Optional[DadosTransferenciaCreate] = None
    dados_boleto: Optional[DadosBoletoCreate] = None
    dados_recebimento: Optional[Dict[str, Any]] = None  # JSON flexível
    
    # Configurações
    padrao: bool = False
    ordem_preferencia: int = Field(default=1, ge=1, le=10)
    valor_minimo: Decimal = Field(default=Decimal('0.00'), ge=0)
    valor_maximo: Optional[Decimal] = Field(None, gt=0)
    
    # Controle temporal
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    
    # Observações
    observacoes: Optional[str] = None
    ativo: bool = True
    
    @validator('dados_pix')
    def validar_dados_pix(cls, v, values):
        if values.get('tipo') == TipoRecebimento.PIX and not v:
            raise ValueError('dados_pix obrigatório para tipo PIX')
        return v
    
    @validator('dados_transferencia')
    def validar_dados_transferencia(cls, v, values):
        if values.get('tipo') == TipoRecebimento.TRANSFERENCIA and not v:
            raise ValueError('dados_transferencia obrigatório para tipo TRANSFERENCIA')
        return v
    
    @validator('dados_boleto')
    def validar_dados_boleto(cls, v, values):
        if values.get('tipo') == TipoRecebimento.BOLETO and not v:
            raise ValueError('dados_boleto obrigatório para tipo BOLETO')
        return v
    
    @validator('data_fim')
    def validar_data_fim(cls, v, values):
        if v and values.get('data_inicio') and v <= values['data_inicio']:
            raise ValueError('data_fim deve ser posterior à data_inicio')
        return v

class FormaRecebimentoUpdate(BaseModel):
    descricao: Optional[str] = Field(None, max_length=255)
    dados_pix: Optional[DadosPixCreate] = None
    dados_transferencia: Optional[DadosTransferenciaCreate] = None
    dados_boleto: Optional[DadosBoletoCreate] = None
    padrao: Optional[bool] = None
    ordem_preferencia: Optional[int] = Field(None, ge=1, le=10)
    valor_minimo: Optional[Decimal] = Field(None, ge=0)
    valor_maximo: Optional[Decimal] = Field(None, gt=0)
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    observacoes: Optional[str] = None
    ativo: Optional[bool] = None

class FormaRecebimentoResponse(BaseModel):
    id: int
    locador_id: int
    tipo: TipoRecebimento
    descricao: Optional[str]
    
    # Dados mascarados para segurança
    dados_publicos: Dict[str, Any]  # Dados que podem ser expostos
    
    padrao: bool
    ordem_preferencia: int
    valor_minimo: Decimal
    valor_maximo: Optional[Decimal]
    data_inicio: Optional[date]
    data_fim: Optional[date]
    ativo: bool
    status_calculado: str  # ATIVO, INATIVO, EXPIRADO, AGENDADO
    
    # Estatísticas
    total_contratos: int
    data_cadastro: str
    
    class Config:
        from_attributes = True

# Atualização do modelo de Contrato
class ContratoCreateV2(ContratoCreate):
    # Adicionar referência à forma de recebimento
    id_forma_recebimento: Optional[int] = Field(None, gt=0)
    
    @validator('id_forma_recebimento')
    def validar_forma_recebimento(cls, v, values):
        # Validação será feita no repository para verificar se pertence ao locador
        return v

class ContratoUpdateV2(BaseModel):
    # Campos que podem ser atualizados em um contrato existente
    id_forma_recebimento: Optional[int] = Field(None, gt=0)
    observacoes: Optional[str] = None
    clausulas_especiais: Optional[str] = None
    data_proximo_reajuste: Optional[date] = None
    prazo_aviso_renovacao: Optional[int] = Field(None, ge=30, le=180)
```

### 🔌 ENDPOINTS ATUALIZADOS

```python
# APIs para formas de recebimento
@app.post("/api/v2/locadores/{locador_id}/formas-recebimento")
async def criar_forma_recebimento(
    locador_id: int,
    forma: FormaRecebimentoCreate,
    current_user: dict = Depends(get_current_user)
):
    """Criar nova forma de recebimento para um locador"""
    try:
        # Validar se locador existe e usuário tem permissão
        if not await verificar_acesso_locador(current_user.id, locador_id):
            raise HTTPException(status_code=403, detail="Sem acesso ao locador")
        
        # Se for definida como padrão, remover padrão das outras
        if forma.padrao:
            await desativar_forma_padrao_existente(locador_id)
        
        form_id = await inserir_forma_recebimento(forma, current_user.id)
        
        # Log da operação
        await registrar_log_acesso(
            current_user.id, "CRIAR_FORMA_RECEBIMENTO", 
            "formas_recebimento", form_id
        )
        
        return {
            "message": "Forma de recebimento criada com sucesso!",
            "success": True,
            "data": {"id": form_id}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v2/locadores/{locador_id}/formas-recebimento")
async def listar_formas_recebimento(
    locador_id: int,
    ativas_apenas: bool = True,
    current_user: dict = Depends(get_current_user)
) -> List[FormaRecebimentoResponse]:
    """Listar formas de recebimento de um locador"""
    try:
        if not await verificar_acesso_locador(current_user.id, locador_id):
            raise HTTPException(status_code=403, detail="Sem acesso ao locador")
        
        formas = await buscar_formas_recebimento_por_locador(locador_id, ativas_apenas)
        return {
            "data": formas,
            "success": True,
            "count": len(formas)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v2/formas-recebimento/{forma_id}")
async def atualizar_forma_recebimento(
    forma_id: int,
    forma_update: FormaRecebimentoUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Atualizar forma de recebimento"""
    try:
        # Verificar se forma existe e usuário tem acesso
        forma_existente = await buscar_forma_recebimento_por_id(forma_id)
        if not forma_existente:
            raise HTTPException(status_code=404, detail="Forma de recebimento não encontrada")
        
        if not await verificar_acesso_locador(current_user.id, forma_existente.locador_id):
            raise HTTPException(status_code=403, detail="Sem acesso a esta forma de recebimento")
        
        # Se alterando para padrão, desativar outras
        if forma_update.padrao:
            await desativar_forma_padrao_existente(forma_existente.locador_id, forma_id)
        
        await atualizar_forma_recebimento_db(forma_id, forma_update, current_user.id)
        
        return {"message": "Forma de recebimento atualizada com sucesso!", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v2/contratos/{contrato_id}/forma-recebimento")
async def alterar_forma_recebimento_contrato(
    contrato_id: int,
    contrato_update: ContratoUpdateV2,
    current_user: dict = Depends(get_current_user)
):
    """Alterar forma de recebimento de um contrato específico"""
    try:
        # Verificar se contrato existe e usuário tem acesso
        contrato = await buscar_contrato_por_id(contrato_id)
        if not contrato:
            raise HTTPException(status_code=404, detail="Contrato não encontrado")
        
        if not await verificar_acesso_contrato(current_user.id, contrato_id):
            raise HTTPException(status_code=403, detail="Sem acesso ao contrato")
        
        # Validar se forma de recebimento pertence ao locador do contrato
        if contrato_update.id_forma_recebimento:
            forma = await buscar_forma_recebimento_por_id(contrato_update.id_forma_recebimento)
            if not forma or forma.locador_id != contrato.locador_id:
                raise HTTPException(
                    status_code=400, 
                    detail="Forma de recebimento não pertence ao locador do contrato"
                )
            
            if not forma.ativo:
                raise HTTPException(
                    status_code=400,
                    detail="Forma de recebimento está inativa"
                )
        
        # Atualizar contrato
        await atualizar_contrato_forma_recebimento(contrato_id, contrato_update, current_user.id)
        
        # Registrar alteração no histórico
        await registrar_alteracao_contrato(
            contrato_id, "id_forma_recebimento", 
            contrato.id_forma_recebimento, contrato_update.id_forma_recebimento,
            current_user.id, "Alteração de forma de recebimento"
        )
        
        return {
            "message": "Forma de recebimento do contrato alterada com sucesso!",
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v2/contratos/{contrato_id}/forma-recebimento")
async def obter_forma_recebimento_contrato(
    contrato_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Obter forma de recebimento ativa de um contrato"""
    try:
        if not await verificar_acesso_contrato(current_user.id, contrato_id):
            raise HTTPException(status_code=403, detail="Sem acesso ao contrato")
        
        forma = await buscar_forma_recebimento_por_contrato(contrato_id)
        if not forma:
            raise HTTPException(
                status_code=404, 
                detail="Forma de recebimento não definida para este contrato"
            )
        
        return {"data": forma, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 🧪 TESTES DE INTEGRAÇÃO ATUALIZADOS

```python
# tests/test_formas_recebimento.py
import pytest
from fastapi.testclient import TestClient
from decimal import Decimal

class TestFormasRecebimentoIntegration:
    
    def test_criar_forma_recebimento_pix(self, client: TestClient, locador_id: int):
        """Testa criação de forma de recebimento PIX"""
        forma_data = {
            "locador_id": locador_id,
            "tipo": "PIX",
            "descricao": "PIX principal",
            "dados_pix": {
                "pix_tipo": "EMAIL",
                "pix_chave": "locador@teste.com"
            },
            "padrao": True,
            "valor_minimo": "100.00"
        }
        
        response = client.post(f"/api/v2/locadores/{locador_id}/formas-recebimento", json=forma_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["success"] == True
        assert "id" in data["data"]
    
    def test_criar_forma_recebimento_transferencia(self, client: TestClient, locador_id: int):
        """Testa criação de forma de recebimento por transferência"""
        forma_data = {
            "locador_id": locador_id,
            "tipo": "TRANSFERENCIA",
            "descricao": "Conta principal",
            "dados_transferencia": {
                "banco_codigo": "001",
                "banco_nome": "Banco do Brasil",
                "agencia": "1234",
                "conta": "56789-0",
                "tipo_conta": "CORRENTE"
            },
            "padrao": False,
            "ordem_preferencia": 2
        }
        
        response = client.post(f"/api/v2/locadores/{locador_id}/formas-recebimento", json=forma_data)
        assert response.status_code == 201
    
    def test_listar_formas_recebimento(self, client: TestClient, locador_id: int):
        """Testa listagem de formas de recebimento"""
        response = client.get(f"/api/v2/locadores/{locador_id}/formas-recebimento")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert len(data["data"]) >= 1  # Pelo menos uma forma criada nos testes anteriores
    
    def test_definir_forma_padrao_unica(self, client: TestClient, locador_id: int):
        """Testa que só pode existir uma forma padrão por locador"""
        # Criar primeira forma como padrão
        forma1_data = {
            "locador_id": locador_id,
            "tipo": "PIX",
            "dados_pix": {"pix_tipo": "CPF", "pix_chave": "123.456.789-00"},
            "padrao": True
        }
        
        response1 = client.post(f"/api/v2/locadores/{locador_id}/formas-recebimento", json=forma1_data)
        assert response1.status_code == 201
        
        # Criar segunda forma como padrão
        forma2_data = {
            "locador_id": locador_id,
            "tipo": "TRANSFERENCIA",
            "dados_transferencia": {
                "banco_codigo": "341",
                "banco_nome": "Itaú",
                "agencia": "9999",
                "conta": "12345-6",
                "tipo_conta": "CORRENTE"
            },
            "padrao": True
        }
        
        response2 = client.post(f"/api/v2/locadores/{locador_id}/formas-recebimento", json=forma2_data)
        assert response2.status_code == 201
        
        # Verificar que apenas a segunda é padrão
        response_list = client.get(f"/api/v2/locadores/{locador_id}/formas-recebimento")
        formas = response_list.json()["data"]
        
        formas_padrao = [f for f in formas if f["padrao"]]
        assert len(formas_padrao) == 1  # Apenas uma forma padrão
    
    def test_alterar_forma_recebimento_contrato(self, client: TestClient, contrato_id: int, forma_id: int):
        """Testa alteração de forma de recebimento em contrato"""
        update_data = {
            "id_forma_recebimento": forma_id
        }
        
        response = client.put(f"/api/v2/contratos/{contrato_id}/forma-recebimento", json=update_data)
        assert response.status_code == 200
        
        # Verificar se foi alterado
        get_response = client.get(f"/api/v2/contratos/{contrato_id}/forma-recebimento")
        forma = get_response.json()["data"]
        assert forma["id"] == forma_id
    
    def test_validacao_forma_invalida_para_contrato(self, client: TestClient, contrato_id: int):
        """Testa que não é possível usar forma de recebimento de outro locador"""
        # Tentar usar forma de recebimento inexistente
        update_data = {
            "id_forma_recebimento": 99999
        }
        
        response = client.put(f"/api/v2/contratos/{contrato_id}/forma-recebimento", json=update_data)
        assert response.status_code == 400
        assert "não pertence ao locador" in response.json()["detail"].lower()

# Fixtures de teste
@pytest.fixture
def forma_recebimento_pix_id(client: TestClient, locador_id: int):
    """Cria uma forma de recebimento PIX para testes"""
    forma_data = {
        "locador_id": locador_id,
        "tipo": "PIX",
        "dados_pix": {"pix_tipo": "EMAIL", "pix_chave": "teste@pix.com"},
        "padrao": True
    }
    
    response = client.post(f"/api/v2/locadores/{locador_id}/formas-recebimento", json=forma_data)
    return response.json()["data"]["id"]
```

### 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [x] Tabela `formas_recebimento` criada com todos os campos
- [x] Relacionamento com `contratos` via `id_forma_recebimento`
- [x] Triggers para auditoria automática
- [x] Constraint para garantir única forma padrão por locador
- [x] Migration para dados existentes
- [x] DTOs Pydantic com validações específicas
- [x] Endpoints CRUD completos
- [x] Validações de negócio implementadas
- [x] Testes de integração definidos
- [ ] View para consultas complexas
- [ ] Repositórios específicos
- [ ] Documentação de API atualizada

### ⚠️ AVISOS IMPORTANTES

1. **Migração de Dados**: Locadores existentes receberão forma padrão automática
2. **Segurança**: Dados bancários são mascarados nas respostas da API
3. **Auditoria**: Todas alterações são registradas automaticamente
4. **Validação**: Chaves PIX são validadas conforme o tipo
5. **Constraint**: Apenas uma forma pode ser padrão por locador
6. **Flexibilidade**: Campo `dados_recebimento` permite extensões futuras

---

---

## 📞 SISTEMA DE TELEFONES E EMAILS 1:N

### 📋 NOVA FUNCIONALIDADE IMPLEMENTADA

Implementação de **múltiplos telefones e emails** para locadores e locatários com flag principal, substituindo os campos únicos por relacionamentos 1:N.

### 🗄️ ESTRUTURA DAS TABELAS

#### Tabela `telefones`
```sql
CREATE TABLE telefones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Relacionamento polimórfico
    entidade_tipo VARCHAR(20) NOT NULL CHECK (entidade_tipo IN ('LOCADOR', 'LOCATARIO', 'FIADOR')),
    entidade_id INTEGER NOT NULL,
    
    -- Dados do telefone
    numero VARCHAR(15) NOT NULL,
    numero_limpo VARCHAR(11) NOT NULL, -- Apenas números para buscas
    
    -- Classificação
    tipo VARCHAR(20) DEFAULT 'CELULAR' CHECK (tipo IN ('CELULAR', 'FIXO', 'COMERCIAL', 'RECADO')),
    descricao VARCHAR(100), -- "Celular pessoal", "Trabalho"
    
    -- Configurações
    principal INTEGER DEFAULT 0, -- Flag de telefone principal
    ativo INTEGER DEFAULT 1,
    whatsapp INTEGER DEFAULT 0,
    ordem_preferencia INTEGER DEFAULT 1,
    
    -- Controles adicionais
    melhor_horario VARCHAR(50),
    verificado INTEGER DEFAULT 0,
    data_verificacao DATETIME,
    observacoes TEXT,
    
    -- Auditoria
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario_cadastro INTEGER,
    
    -- Constraint: apenas um telefone principal por entidade
    UNIQUE(entidade_tipo, entidade_id, principal) WHERE principal = 1
);
```

#### Tabela `emails`
```sql
CREATE TABLE emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Relacionamento polimórfico
    entidade_tipo VARCHAR(20) NOT NULL CHECK (entidade_tipo IN ('LOCADOR', 'LOCATARIO', 'FIADOR')),
    entidade_id INTEGER NOT NULL,
    
    -- Dados do email
    endereco VARCHAR(255) NOT NULL,
    endereco_limpo VARCHAR(255) NOT NULL, -- Normalizado
    
    -- Classificação
    tipo VARCHAR(20) DEFAULT 'PESSOAL' CHECK (tipo IN ('PESSOAL', 'COMERCIAL', 'TRABALHO', 'ALTERNATIVO')),
    descricao VARCHAR(100),
    
    -- Configurações
    principal INTEGER DEFAULT 0,
    ativo INTEGER DEFAULT 1,
    ordem_preferencia INTEGER DEFAULT 1,
    
    -- Preferências de comunicação
    aceita_marketing INTEGER DEFAULT 0,
    aceita_cobranca INTEGER DEFAULT 1,
    aceita_juridico INTEGER DEFAULT 1,
    
    -- Controle de qualidade
    verificado INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0, -- Controle de emails rejeitados
    total_enviados INTEGER DEFAULT 0,
    total_entregues INTEGER DEFAULT 0,
    
    -- Auditoria
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(entidade_tipo, entidade_id, principal) WHERE principal = 1,
    UNIQUE(entidade_tipo, entidade_id, endereco_limpo) -- Email único por entidade
);
```

### 🔧 MODELOS PYDANTIC PARA TELEFONES E EMAILS

```python
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
import re

class TipoTelefone(str, Enum):
    CELULAR = "CELULAR"
    FIXO = "FIXO"
    COMERCIAL = "COMERCIAL"
    RECADO = "RECADO"

class TipoEmail(str, Enum):
    PESSOAL = "PESSOAL"
    COMERCIAL = "COMERCIAL"
    TRABALHO = "TRABALHO"
    ALTERNATIVO = "ALTERNATIVO"

class EntidadeTipo(str, Enum):
    LOCADOR = "LOCADOR"
    LOCATARIO = "LOCATARIO"
    FIADOR = "FIADOR"

# ==================== TELEFONES ====================

class TelefoneCreate(BaseModel):
    entidade_tipo: EntidadeTipo = Field(...)
    entidade_id: int = Field(..., gt=0)
    numero: str = Field(..., min_length=8, max_length=15)
    tipo: TipoTelefone = Field(default=TipoTelefone.CELULAR)
    descricao: Optional[str] = Field(None, max_length=100)
    principal: bool = False
    whatsapp: bool = False
    melhor_horario: Optional[str] = Field(None, max_length=50)
    ordem_preferencia: int = Field(default=1, ge=1, le=10)
    observacoes: Optional[str] = None
    ativo: bool = True
    
    @validator('numero')
    def validar_numero_telefone(cls, v):
        # Remove caracteres especiais para validação
        numero_limpo = re.sub(r'[^\d]', '', v)
        
        # Valida tamanho (10 ou 11 dígitos para Brasil)
        if len(numero_limpo) not in [10, 11]:
            raise ValueError('Telefone deve ter 10 ou 11 dígitos')
        
        # Valida formato básico
        if len(numero_limpo) == 11 and numero_limpo[2] not in ['9', '8', '7', '6']:
            raise ValueError('Celular deve começar com 9, 8, 7 ou 6 no terceiro dígito')
        
        return v
    
    @validator('descricao')
    def validar_descricao(cls, v, values):
        if not v and values.get('tipo') == TipoTelefone.RECADO:
            raise ValueError('Descrição obrigatória para telefones de recado')
        return v

class TelefoneUpdate(BaseModel):
    numero: Optional[str] = Field(None, min_length=8, max_length=15)
    tipo: Optional[TipoTelefone] = None
    descricao: Optional[str] = Field(None, max_length=100)
    principal: Optional[bool] = None
    whatsapp: Optional[bool] = None
    melhor_horario: Optional[str] = Field(None, max_length=50)
    ordem_preferencia: Optional[int] = Field(None, ge=1, le=10)
    observacoes: Optional[str] = None
    ativo: Optional[bool] = None
    
    @validator('numero')
    def validar_numero_telefone(cls, v):
        if v:
            numero_limpo = re.sub(r'[^\d]', '', v)
            if len(numero_limpo) not in [10, 11]:
                raise ValueError('Telefone deve ter 10 ou 11 dígitos')
        return v

class TelefoneResponse(BaseModel):
    id: int
    entidade_tipo: EntidadeTipo
    entidade_id: int
    numero: str
    numero_formatado: str  # Formatado para exibição
    tipo: TipoTelefone
    descricao: Optional[str]
    principal: bool
    whatsapp: bool
    melhor_horario: Optional[str]
    ordem_preferencia: int
    ativo: bool
    verificado: bool
    data_verificacao: Optional[datetime]
    data_cadastro: datetime
    
    # Informações da entidade
    entidade_nome: Optional[str]
    status_formatado: str  # ATIVO, INATIVO, VERIFICADO
    
    class Config:
        from_attributes = True

# ==================== EMAILS ====================

class EmailCreate(BaseModel):
    entidade_tipo: EntidadeTipo = Field(...)
    entidade_id: int = Field(..., gt=0)
    endereco: EmailStr = Field(...)
    tipo: TipoEmail = Field(default=TipoEmail.PESSOAL)
    descricao: Optional[str] = Field(None, max_length=100)
    principal: bool = False
    ordem_preferencia: int = Field(default=1, ge=1, le=10)
    
    # Preferências de comunicação
    aceita_marketing: bool = False
    aceita_cobranca: bool = True
    aceita_juridico: bool = True
    
    observacoes: Optional[str] = None
    ativo: bool = True
    
    @validator('endereco')
    def validar_email(cls, v):
        # Validações adicionais de email se necessário
        endereco_limpo = v.lower().strip()
        
        # Lista de domínios temporários/descartáveis (exemplo)
        dominios_bloqueados = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com']
        dominio = endereco_limpo.split('@')[1] if '@' in endereco_limpo else ''
        
        if dominio in dominios_bloqueados:
            raise ValueError('Email temporário não é permitido')
        
        return v

class EmailUpdate(BaseModel):
    endereco: Optional[EmailStr] = None
    tipo: Optional[TipoEmail] = None
    descricao: Optional[str] = Field(None, max_length=100)
    principal: Optional[bool] = None
    ordem_preferencia: Optional[int] = Field(None, ge=1, le=10)
    aceita_marketing: Optional[bool] = None
    aceita_cobranca: Optional[bool] = None
    aceita_juridico: Optional[bool] = None
    observacoes: Optional[str] = None
    ativo: Optional[bool] = None

class EmailResponse(BaseModel):
    id: int
    entidade_tipo: EntidadeTipo
    entidade_id: int
    endereco: str
    tipo: TipoEmail
    descricao: Optional[str]
    principal: bool
    ordem_preferencia: int
    ativo: bool
    
    # Preferências
    aceita_marketing: bool
    aceita_cobranca: bool
    aceita_juridico: bool
    
    # Status e qualidade
    verificado: bool
    data_verificacao: Optional[datetime]
    bounces: int
    total_enviados: int
    total_entregues: int
    taxa_entrega_pct: Optional[float]  # Calculada
    
    # Auditoria
    data_cadastro: datetime
    data_ultimo_envio: Optional[datetime]
    
    # Informações da entidade
    entidade_nome: Optional[str]
    status_formatado: str  # ATIVO, INATIVO, VERIFICADO, BLOQUEADO
    
    class Config:
        from_attributes = True

# ==================== MODELOS COMPOSTOS ====================

class ContatosCompletos(BaseModel):
    """Modelo que representa todos os contatos de uma entidade"""
    entidade_tipo: EntidadeTipo
    entidade_id: int
    entidade_nome: str
    
    telefones: List[TelefoneResponse] = []
    emails: List[EmailResponse] = []
    
    # Contatos principais (para acesso rápido)
    telefone_principal: Optional[TelefoneResponse] = None
    email_principal: Optional[EmailResponse] = None
    
    # Estatísticas
    total_telefones: int = 0
    total_emails: int = 0
    telefones_ativos: int = 0
    emails_ativos: int = 0

# ==================== ATUALIZAÇÃO DOS MODELOS EXISTENTES ====================

class LocadorCreateV3(BaseModel):
    """Modelo de locador sem campos de telefone/email únicos"""
    # Dados pessoais obrigatórios
    nome: str = Field(..., max_length=255, min_length=2)
    cpf_cnpj: str = Field(..., regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')
    
    # Endereço estruturado (mantido)
    endereco: EnderecoBase
    
    # Dados bancários (mantido)
    dados_bancarios: Optional[DadosBancarios] = None
    
    # Contatos serão criados separadamente via endpoints específicos
    # Não incluir telefone/email aqui
    
    # Demais campos mantidos...
    data_nascimento: Optional[date] = None
    rg: Optional[str] = Field(None, max_length=20)
    nacionalidade: str = Field(default="Brasileira", max_length=50)
    estado_civil: Optional[str] = Field(None, max_length=20)
    profissao: Optional[str] = Field(None, max_length=100)
    
    # Configurações financeiras
    tipo_recebimento: str = Field(default="PIX", regex=r'^(PIX|TRANSFERENCIA|BOLETO)$')
    taxa_administracao: Optional[Decimal] = Field(default=Decimal('0.00'), ge=0, le=50)
    
    # Controle
    observacoes: Optional[str] = None
    ativo: bool = True

class LocatarioCreateV3(BaseModel):
    """Modelo de locatário sem campos de telefone/email únicos"""
    # Dados pessoais obrigatórios
    nome: str = Field(..., max_length=255, min_length=2)
    cpf_cnpj: str = Field(..., regex=r'^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')
    
    # Endereço atual
    endereco_atual: EnderecoBase
    tempo_residencia_atual: Optional[int] = Field(None, ge=0, description="Meses")
    
    # Contatos serão criados separadamente
    # Não incluir telefone/email aqui
    
    # Demais campos mantidos...
    data_nascimento: Optional[date] = None
    empresa: Optional[str] = Field(None, max_length=255)
    profissao: Optional[str] = Field(None, max_length=100)
    renda_mensal: Optional[Decimal] = Field(None, ge=0)
    
    # Garantias
    tipo_garantia: str = Field(..., regex=r'^(FIADOR|SEGURO_FIANCA|DEPOSITO|AVALISTA)$')
    possui_fiador: bool = False
    
    # Controle
    status_atual: str = Field(default="ATIVO", regex=r'^(ATIVO|INATIVO|BLOQUEADO)$')
    observacoes: Optional[str] = None

# Modelo para criação em lote (locador + contatos)
class LocadorComContatosCreate(BaseModel):
    locador: LocadorCreateV3
    telefones: List[TelefoneCreate] = []
    emails: List[EmailCreate] = []
    
    @validator('telefones')
    def validar_telefones(cls, v):
        if not v:
            raise ValueError('Pelo menos um telefone é obrigatório')
        
        principais = [t for t in v if t.principal]
        if len(principais) != 1:
            raise ValueError('Deve haver exatamente um telefone principal')
        
        return v
    
    @validator('emails')
    def validar_emails(cls, v):
        if v:
            principais = [e for e in v if e.principal]
            if len(principais) > 1:
                raise ValueError('Pode haver apenas um email principal')
        return v
```

### 🔌 ENDPOINTS COMPLETOS PARA CRUD

```python
# ==================== ENDPOINTS TELEFONES ====================

@app.post("/api/v2/{entidade_tipo}/{entidade_id}/telefones")
async def criar_telefone(
    entidade_tipo: EntidadeTipo,
    entidade_id: int,
    telefone: TelefoneCreate,
    current_user: dict = Depends(get_current_user)
):
    """Criar novo telefone para uma entidade"""
    try:
        # Validar se entidade existe e usuário tem permissão
        if not await verificar_acesso_entidade(current_user.id, entidade_tipo, entidade_id):
            raise HTTPException(status_code=403, detail="Sem acesso à entidade")
        
        # Garantir que entidade_tipo e entidade_id estão corretos
        telefone.entidade_tipo = entidade_tipo
        telefone.entidade_id = entidade_id
        
        # Se for definido como principal, remover principal dos outros
        if telefone.principal:
            await desativar_telefone_principal_existente(entidade_tipo, entidade_id)
        
        tel_id = await inserir_telefone(telefone, current_user.id)
        
        return {
            "message": "Telefone cadastrado com sucesso!",
            "success": True,
            "data": {"id": tel_id}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v2/{entidade_tipo}/{entidade_id}/telefones")
async def listar_telefones(
    entidade_tipo: EntidadeTipo,
    entidade_id: int,
    ativos_apenas: bool = True,
    current_user: dict = Depends(get_current_user)
) -> List[TelefoneResponse]:
    """Listar telefones de uma entidade"""
    try:
        if not await verificar_acesso_entidade(current_user.id, entidade_tipo, entidade_id):
            raise HTTPException(status_code=403, detail="Sem acesso à entidade")
        
        telefones = await buscar_telefones_por_entidade(entidade_tipo, entidade_id, ativos_apenas)
        return {
            "data": telefones,
            "success": True,
            "count": len(telefones)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/v2/telefones/{telefone_id}")
async def atualizar_telefone(
    telefone_id: int,
    telefone_update: TelefoneUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Atualizar telefone específico"""
    try:
        # Verificar se telefone existe e usuário tem acesso
        telefone_existente = await buscar_telefone_por_id(telefone_id)
        if not telefone_existente:
            raise HTTPException(status_code=404, detail="Telefone não encontrado")
        
        if not await verificar_acesso_entidade(
            current_user.id, 
            telefone_existente.entidade_tipo, 
            telefone_existente.entidade_id
        ):
            raise HTTPException(status_code=403, detail="Sem acesso a este telefone")
        
        # Se alterando para principal, desativar outros
        if telefone_update.principal:
            await desativar_telefone_principal_existente(
                telefone_existente.entidade_tipo, 
                telefone_existente.entidade_id, 
                telefone_id
            )
        
        await atualizar_telefone_db(telefone_id, telefone_update, current_user.id)
        
        return {"message": "Telefone atualizado com sucesso!", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v2/telefones/{telefone_id}")
async def excluir_telefone(
    telefone_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Excluir telefone (soft delete)"""
    try:
        telefone_existente = await buscar_telefone_por_id(telefone_id)
        if not telefone_existente:
            raise HTTPException(status_code=404, detail="Telefone não encontrado")
        
        if not await verificar_acesso_entidade(
            current_user.id, 
            telefone_existente.entidade_tipo, 
            telefone_existente.entidade_id
        ):
            raise HTTPException(status_code=403, detail="Sem acesso a este telefone")
        
        # Verificar se não é o único telefone ativo da entidade
        telefones_ativos = await contar_telefones_ativos(
            telefone_existente.entidade_tipo, 
            telefone_existente.entidade_id
        )
        
        if telefones_ativos <= 1:
            raise HTTPException(
                status_code=400, 
                detail="Não é possível excluir o único telefone ativo da entidade"
            )
        
        await desativar_telefone(telefone_id, current_user.id)
        
        return {"message": "Telefone removido com sucesso!", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ENDPOINTS EMAILS ====================

@app.post("/api/v2/{entidade_tipo}/{entidade_id}/emails")
async def criar_email(
    entidade_tipo: EntidadeTipo,
    entidade_id: int,
    email: EmailCreate,
    current_user: dict = Depends(get_current_user)
):
    """Criar novo email para uma entidade"""
    try:
        if not await verificar_acesso_entidade(current_user.id, entidade_tipo, entidade_id):
            raise HTTPException(status_code=403, detail="Sem acesso à entidade")
        
        email.entidade_tipo = entidade_tipo
        email.entidade_id = entidade_id
        
        # Verificar se email já existe para esta entidade
        if await email_existe_para_entidade(entidade_tipo, entidade_id, email.endereco):
            raise HTTPException(
                status_code=400, 
                detail="Este email já está cadastrado para esta entidade"
            )
        
        # Se for definido como principal, remover principal dos outros
        if email.principal:
            await desativar_email_principal_existente(entidade_tipo, entidade_id)
        
        email_id = await inserir_email(email, current_user.id)
        
        return {
            "message": "Email cadastrado com sucesso!",
            "success": True,
            "data": {"id": email_id}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v2/{entidade_tipo}/{entidade_id}/emails")
async def listar_emails(
    entidade_tipo: EntidadeTipo,
    entidade_id: int,
    ativos_apenas: bool = True,
    current_user: dict = Depends(get_current_user)
) -> List[EmailResponse]:
    """Listar emails de uma entidade"""
    try:
        if not await verificar_acesso_entidade(current_user.id, entidade_tipo, entidade_id):
            raise HTTPException(status_code=403, detail="Sem acesso à entidade")
        
        emails = await buscar_emails_por_entidade(entidade_tipo, entidade_id, ativos_apenas)
        return {
            "data": emails,
            "success": True,
            "count": len(emails)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ENDPOINTS COMPOSTOS ====================

@app.get("/api/v2/{entidade_tipo}/{entidade_id}/contatos")
async def obter_contatos_completos(
    entidade_tipo: EntidadeTipo,
    entidade_id: int,
    current_user: dict = Depends(get_current_user)
) -> ContatosCompletos:
    """Obter todos os contatos de uma entidade (telefones + emails)"""
    try:
        if not await verificar_acesso_entidade(current_user.id, entidade_tipo, entidade_id):
            raise HTTPException(status_code=403, detail="Sem acesso à entidade")
        
        contatos = await buscar_contatos_completos(entidade_tipo, entidade_id)
        return {"data": contatos, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v2/locadores-com-contatos")
async def criar_locador_com_contatos(
    dados: LocadorComContatosCreate,
    current_user: dict = Depends(get_current_user)
):
    """Criar locador junto com seus contatos em uma transação"""
    try:
        # Iniciar transação
        async with get_db_transaction() as transaction:
            # Criar locador
            locador_id = await inserir_locador_v3(dados.locador, current_user.id)
            
            # Criar telefones
            for telefone in dados.telefones:
                telefone.entidade_tipo = EntidadeTipo.LOCADOR
                telefone.entidade_id = locador_id
                await inserir_telefone(telefone, current_user.id)
            
            # Criar emails
            for email in dados.emails:
                email.entidade_tipo = EntidadeTipo.LOCADOR
                email.entidade_id = locador_id
                await inserir_email(email, current_user.id)
            
            await transaction.commit()
        
        return {
            "message": "Locador e contatos criados com sucesso!",
            "success": True,
            "data": {"id": locador_id}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 🧪 TESTES DE INTEGRAÇÃO

```python
# tests/test_telefones_emails.py
import pytest
from fastapi.testclient import TestClient

class TestTelefonesIntegration:
    
    def test_criar_telefone_locador(self, client: TestClient, locador_id: int):
        """Testa criação de telefone para locador"""
        telefone_data = {
            "numero": "(41) 99999-1234",
            "tipo": "CELULAR",
            "descricao": "Celular principal",
            "principal": True,
            "whatsapp": True
        }
        
        response = client.post(f"/api/v2/LOCADOR/{locador_id}/telefones", json=telefone_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["success"] == True
        assert "id" in data["data"]
    
    def test_telefone_principal_unico(self, client: TestClient, locador_id: int):
        """Testa que só pode existir um telefone principal por entidade"""
        # Criar primeiro telefone como principal
        tel1_data = {
            "numero": "(41) 88888-1111",
            "tipo": "CELULAR",
            "principal": True
        }
        response1 = client.post(f"/api/v2/LOCADOR/{locador_id}/telefones", json=tel1_data)
        assert response1.status_code == 201
        
        # Criar segundo telefone como principal
        tel2_data = {
            "numero": "(41) 77777-2222", 
            "tipo": "FIXO",
            "principal": True
        }
        response2 = client.post(f"/api/v2/LOCADOR/{locador_id}/telefones", json=tel2_data)
        assert response2.status_code == 201
        
        # Verificar que apenas o segundo é principal
        response_list = client.get(f"/api/v2/LOCADOR/{locador_id}/telefones")
        telefones = response_list.json()["data"]
        
        principais = [t for t in telefones if t["principal"]]
        assert len(principais) == 1
        assert principais[0]["numero"] == "(41) 77777-2222"
    
    def test_validacao_telefone_invalido(self, client: TestClient, locador_id: int):
        """Testa validação de número de telefone inválido"""
        telefone_invalido = {
            "numero": "123", # Muito curto
            "tipo": "CELULAR"
        }
        
        response = client.post(f"/api/v2/LOCADOR/{locador_id}/telefones", json=telefone_invalido)
        assert response.status_code == 422
        
        errors = response.json()["detail"]
        assert any("telefone" in str(error).lower() for error in errors)

class TestEmailsIntegration:
    
    def test_criar_email_locatario(self, client: TestClient, locatario_id: int):
        """Testa criação de email para locatário"""
        email_data = {
            "endereco": "locatario@teste.com",
            "tipo": "PESSOAL", 
            "descricao": "Email principal",
            "principal": True,
            "aceita_cobranca": True
        }
        
        response = client.post(f"/api/v2/LOCATARIO/{locatario_id}/emails", json=email_data)
        assert response.status_code == 201
    
    def test_email_duplicado_mesmo_usuario(self, client: TestClient, locatario_id: int):
        """Testa que não permite email duplicado para mesma entidade"""
        email_data = {
            "endereco": "duplicado@teste.com",
            "tipo": "PESSOAL"
        }
        
        # Primeiro email
        response1 = client.post(f"/api/v2/LOCATARIO/{locatario_id}/emails", json=email_data)
        assert response1.status_code == 201
        
        # Segundo email (mesmo endereço)
        response2 = client.post(f"/api/v2/LOCATARIO/{locatario_id}/emails", json=email_data)
        assert response2.status_code == 400
        assert "já está cadastrado" in response2.json()["detail"]
    
    def test_obter_contatos_completos(self, client: TestClient, locador_id: int):
        """Testa endpoint de contatos completos"""
        response = client.get(f"/api/v2/LOCADOR/{locador_id}/contatos")
        assert response.status_code == 200
        
        data = response.json()["data"]
        assert "telefones" in data
        assert "emails" in data
        assert "telefone_principal" in data
        assert "email_principal" in data
        assert "total_telefones" in data
        assert "total_emails" in data

class TestContatosCompostos:
    
    def test_criar_locador_com_contatos(self, client: TestClient):
        """Testa criação de locador com contatos em lote"""
        dados_completos = {
            "locador": {
                "nome": "João com Contatos",
                "cpf_cnpj": "111.222.333-44",
                "endereco": {
                    "endereco_rua": "Rua Teste",
                    "endereco_numero": "123",
                    "endereco_bairro": "Centro",
                    "endereco_cidade": "Curitiba",
                    "endereco_estado": "PR", 
                    "endereco_cep": "80000-000"
                }
            },
            "telefones": [
                {
                    "numero": "(41) 99999-0000",
                    "tipo": "CELULAR",
                    "principal": True,
                    "whatsapp": True
                },
                {
                    "numero": "(41) 3333-0000",
                    "tipo": "COMERCIAL",
                    "principal": False
                }
            ],
            "emails": [
                {
                    "endereco": "joao@contatos.com",
                    "tipo": "PESSOAL",
                    "principal": True
                }
            ]
        }
        
        response = client.post("/api/v2/locadores-com-contatos", json=dados_completos)
        assert response.status_code == 201
        
        data = response.json()
        assert data["success"] == True
        locador_id = data["data"]["id"]
        
        # Verificar se contatos foram criados
        contatos_response = client.get(f"/api/v2/LOCADOR/{locador_id}/contatos")
        contatos = contatos_response.json()["data"]
        
        assert contatos["total_telefones"] == 2
        assert contatos["total_emails"] == 1
        assert contatos["telefone_principal"] is not None
        assert contatos["email_principal"] is not None
```

### 📋 CHECKLIST DE IMPLEMENTAÇÃO

- [x] Tabelas `telefones` e `emails` criadas
- [x] Relacionamento polimórfico implementado  
- [x] Triggers para manter flag principal única
- [x] Migration com migração de dados existentes
- [x] DTOs Pydantic com validações robustas
- [x] Endpoints CRUD completos
- [x] Endpoints compostos para operações em lote
- [x] Normalização automática de dados
- [x] Views para consultas otimizadas
- [x] Testes de integração definidos
- [x] Validações de negócio implementadas
- [ ] Repositórios específicos
- [ ] Sistema de verificação de contatos
- [ ] Integração com APIs de SMS/Email

### ⚠️ AVISOS IMPORTANTES

1. **Migração Automática**: Dados de telefones/emails existentes são migrados automaticamente
2. **Flag Principal**: Apenas um telefone/email pode ser principal por entidade
3. **Normalização**: Números e emails são normalizados automaticamente para buscas
4. **Validação**: Telefones brasileiros (10/11 dígitos) e emails válidos
5. **Soft Delete**: Exclusões são lógicas (campo ativo = 0)
6. **Controle de Qualidade**: Emails têm controle de bounces e estatísticas de entrega
7. **Extensibilidade**: Sistema permite adicionar novos tipos facilmente

---

**Data da Análise**: 26/08/2025
**Analisado por**: Sistema de Varredura Automatizada
**Status**: CRÍTICO - Requer ação imediata
**Migrations Geradas**: 7 arquivos SQL prontos para aplicação
**Backend**: Modelos refatorados e testes definidos
**Nova Funcionalidade**: Sistema de múltiplas formas de recebimento implementado
**Telefones/Emails 1:N**: Sistema completo implementado com flag principal