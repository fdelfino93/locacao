# Análise do Módulo de Locadores - Mudanças Necessárias

## 1. ESTRUTURA ATUAL DO BANCO DE DADOS

### Tabela: `Locadores`
Campos existentes no banco:
- `id` (int, PK)
- `nome` (nvarchar(100))
- `cpf_cnpj` (nvarchar(20))
- `telefone` (nvarchar(20))
- `email` (nvarchar(100))
- `endereco` (nvarchar(255))
- `tipo_recebimento` (nvarchar(20))
- `conta_bancaria` (nvarchar(100))
- `deseja_fci` (nvarchar(10))
- `deseja_seguro_fianca` (nvarchar(10))
- `rg` (nvarchar(255))
- `dados_empresa` (nvarchar(255))
- `representante` (nvarchar(255))
- `nacionalidade` (nvarchar(255))
- `estado_civil` (nvarchar(255))
- `profissao` (nvarchar(255))
- `deseja_seguro_incendio` (int)
- `existe_conjuge` (int)
- `nome_conjuge` (nvarchar(255))
- `cpf_conjuge` (nvarchar(255))
- `rg_conjuge` (nvarchar(255))
- `endereco_conjuge` (nvarchar(255))
- `telefone_conjuge` (nvarchar(255))
- `tipo_cliente` (nvarchar(50))
- `data_nascimento` (date)
- `endereco_id` (int)
- `dados_bancarios_id` (int)
- `tipo_pessoa` (nvarchar(2))
- `observacoes` (nvarchar(1000))
- `razao_social` (nvarchar(200))
- `nome_fantasia` (nvarchar(200))
- `inscricao_estadual` (nvarchar(50))
- `inscricao_municipal` (nvarchar(50))
- `atividade_principal` (nvarchar(200))
- `ativo` (bit)
- `data_cadastro` (datetime)
- `data_atualizacao` (datetime)

### Tabelas Relacionadas:
- `ContasBancariasLocador` - **EXISTE** para múltiplas contas bancárias do locador (suporta múltiplas contas com campo `principal`)
- `RepresentanteLegalLocador` - **EXISTE** para representante legal de PJ
- `EnderecoLocador` - **EXISTE** para endereços estruturados do locador
- `FormasRecebimentoLocador` - **PRECISA CRIAR** para múltiplas formas de recebimento

## 2. CAMPOS DO FORMULÁRIO (ModernLocadorFormV2.tsx)

### Pessoa Física:
- nome ✅
- cpf_cnpj ✅
- telefone ✅
- email ✅
- rg ✅
- data_nascimento ✅
- nacionalidade ✅
- estado_civil ✅
- profissao ✅
- existe_conjuge ✅
- nome_conjuge ✅
- cpf_conjuge ✅
- rg_conjuge ✅
- endereco_conjuge ✅
- telefone_conjuge ✅
- regime_bens ❌ **FALTA NO BANCO**

### Pessoa Jurídica:
- nome (razão social) ✅
- cpf_cnpj ✅
- nome_fantasia ✅
- inscricao_estadual ✅
- inscricao_municipal ✅
- atividade_principal ✅
- data_constituicao ❌ **FALTA NO BANCO**
- capital_social ❌ **FALTA NO BANCO**
- porte_empresa ❌ **FALTA NO BANCO**
- regime_tributario ❌ **FALTA NO BANCO**
- telefone ✅
- email ✅

### Representante Legal (PJ) - Tabela `RepresentanteLegalLocador`:
- nome ✅
- cpf ✅
- rg ✅
- telefone ✅
- email ✅
- endereco ✅
- cargo ✅
- data_nascimento ❌ **FALTA NO BANCO**
- nacionalidade ❌ **FALTA NO BANCO**
- estado_civil ❌ **FALTA NO BANCO**
- profissao ❌ **FALTA NO BANCO**

### Dados Bancários - Tabela `ContasBancariasLocador`:
- locador_id ✅
- tipo_recebimento ✅
- principal ✅ (indica conta principal)
- chave_pix ✅
- banco ✅
- agencia ✅
- conta ✅
- tipo_conta ✅
- titular ✅
- cpf_titular ✅
- data_cadastro ✅
- data_atualizacao ✅
- ativo ✅

### Endereço - Tabela `EnderecoLocador`:
- rua ✅
- numero ✅
- complemento ✅
- bairro ✅
- cidade ✅
- uf ✅ (estado)
- cep ✅
- created_at ✅

### Outros campos no formulário:
- tipo_cliente ✅ (Proprietário, Administrador, Procurador, Outro)
- ~~tipo_garantia~~ ❌ **REMOVIDO** - Movido para módulo contratos
- forma_recebimento (array) ❌ **FALTA NO BANCO** - Para prestação de contas
- email_recebimento ❌ **FALTA NO BANCO** - Email específico para relatórios financeiros
- observacoes_especiais ❌ **FALTA NO BANCO** - Instruções sobre prestação de contas
- usa_multiplos_metodos ❌ **FALTA NO BANCO** - Flag para permitir múltiplos telefones/emails
- usa_multiplas_contas ❌ **FALTA NO BANCO** - Flag para permitir múltiplas contas bancárias

## 3. MUDANÇAS NECESSÁRIAS NO BANCO DE DADOS

### 3.1 Adicionar à tabela `Locadores`:
```sql
ALTER TABLE Locadores ADD regime_bens nvarchar(100) NULL;
ALTER TABLE Locadores ADD data_constituicao date NULL;
ALTER TABLE Locadores ADD capital_social decimal(18,2) NULL;
ALTER TABLE Locadores ADD porte_empresa nvarchar(50) NULL;
ALTER TABLE Locadores ADD regime_tributario nvarchar(50) NULL;
-- tipo_garantia removido - movido para módulo contratos
ALTER TABLE Locadores ADD email_recebimento nvarchar(100) NULL;
ALTER TABLE Locadores ADD observacoes_especiais nvarchar(1000) NULL;
ALTER TABLE Locadores ADD usa_multiplos_metodos bit NULL; -- Flag para múltiplos telefones/emails
ALTER TABLE Locadores ADD usa_multiplas_contas bit NULL; -- Flag para múltiplas contas bancárias
```

### 3.2 Atualizar tabela RepresentanteLegalLocador existente:
```sql
-- Tabela já existe, mas faltam alguns campos
ALTER TABLE RepresentanteLegalLocador ADD data_nascimento date NULL;
ALTER TABLE RepresentanteLegalLocador ADD nacionalidade nvarchar(50) NULL;
ALTER TABLE RepresentanteLegalLocador ADD estado_civil nvarchar(30) NULL;
ALTER TABLE RepresentanteLegalLocador ADD profissao nvarchar(100) NULL;
```

### 3.3 Criar tabela para Formas de Recebimento:
```sql
CREATE TABLE FormasRecebimentoLocador (
    id int IDENTITY(1,1) PRIMARY KEY,
    locador_id int NOT NULL,
    forma_recebimento nvarchar(20) NOT NULL,
    ativo bit DEFAULT 1,
    FOREIGN KEY (locador_id) REFERENCES Locadores(id)
);
```

## 4. MUDANÇAS NECESSÁRIAS NO BACKEND

### 4.1 Criar arquivo `locador_repository_v2.py`:
O arquivo está faltando e precisa ser criado com as seguintes funções:
- `buscar_locador_completo(id)` - JOIN com todas as tabelas relacionadas
- `listar_locadores()` - Lista com filtros
- `inserir_locador_v2(dados)` - Inserir em múltiplas tabelas
- `atualizar_locador(id, dados)` - Atualizar múltiplas tabelas
- `desativar_locador(id)` - Soft delete

### 4.2 Atualizar API (`perfil_locador_api.py`):
- Adicionar tratamento para representantes legais
- Adicionar tratamento para múltiplas contas bancárias
- Adicionar tratamento para formas de recebimento
- Melhorar validação de dados

## 5. MUDANÇAS NECESSÁRIAS NO FRONTEND

### 5.1 ModernLocadorFormV2.tsx:
- [ ] Corrigir carregamento de endereço estruturado
- [ ] Implementar salvamento de representante legal
- [ ] Implementar múltiplas formas de recebimento
- [ ] Adicionar validação de campos obrigatórios
- [ ] Melhorar feedback de erro/sucesso

### 5.2 Visualização (PerfilCompletoLocador.tsx):
- [ ] Adicionar exibição de representante legal
- [ ] Adicionar exibição de múltiplas contas
- [ ] Adicionar exibição de formas de recebimento
- [ ] Melhorar formatação de dados

## 6. FLUXO DE DADOS ATUAL

### Cadastro:
1. Frontend envia dados para `/api/locadores` (POST)
2. API chama `inserir_locador_v2()` ❌ **ARQUIVO FALTA**
3. Deveria inserir em múltiplas tabelas

### Edição:
1. Frontend busca dados de `/api/locadores/{id}` (GET)
2. API chama `buscar_locador_completo()` ❌ **ARQUIVO FALTA**
3. Frontend envia dados atualizados para `/api/locadores/{id}` (PUT)
4. API chama `atualizar_locador()` ❌ **ARQUIVO FALTA**

### Visualização:
1. Frontend busca de `/api/search/advanced/detalhes/locadores/{id}`
2. API chama `buscar_locador_completo()` ❌ **ARQUIVO FALTA**
3. Frontend exibe dados estruturados

## 7. PRIORIDADES DE CORREÇÃO

### URGENTE:
1. **Criar arquivo `locador_repository_v2.py`** com todas as funções
2. **Adicionar campos faltantes no banco** via script SQL
3. **Corrigir carregamento de dados** no formulário

### IMPORTANTE:
4. Conectar tabela RepresentanteLegalLocador existente ao formulário
5. Conectar tabela ContasBancariasLocador existente (já suporta múltiplas contas)
6. Implementar múltiplas formas de recebimento

### MELHORIAS:
7. Adicionar validações no frontend
8. Melhorar tratamento de erros
9. Adicionar logs para debug
10. Implementar testes

## 8. SCRIPT SQL PARA EXECUTAR

```sql
-- Adicionar campos faltantes na tabela Locadores
ALTER TABLE Locadores ADD regime_bens nvarchar(100) NULL;
ALTER TABLE Locadores ADD data_constituicao date NULL;
ALTER TABLE Locadores ADD capital_social decimal(18,2) NULL;
ALTER TABLE Locadores ADD porte_empresa nvarchar(50) NULL;
ALTER TABLE Locadores ADD regime_tributario nvarchar(50) NULL;
ALTER TABLE Locadores ADD tipo_garantia nvarchar(50) NULL;
ALTER TABLE Locadores ADD email_recebimento nvarchar(100) NULL;
ALTER TABLE Locadores ADD observacoes_especiais nvarchar(1000) NULL;
ALTER TABLE Locadores ADD usa_multiplos_metodos bit NULL;
ALTER TABLE Locadores ADD usa_multiplas_contas bit NULL;

-- Atualizar tabela RepresentanteLegalLocador (já existe)
ALTER TABLE RepresentanteLegalLocador ADD data_nascimento date NULL;
ALTER TABLE RepresentanteLegalLocador ADD nacionalidade nvarchar(50) NULL;
ALTER TABLE RepresentanteLegalLocador ADD estado_civil nvarchar(30) NULL;
ALTER TABLE RepresentanteLegalLocador ADD profissao nvarchar(100) NULL;

-- Criar tabela de Formas de Recebimento
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='FormasRecebimentoLocador' AND xtype='U')
CREATE TABLE FormasRecebimentoLocador (
    id int IDENTITY(1,1) PRIMARY KEY,
    locador_id int NOT NULL,
    forma_recebimento nvarchar(20) NOT NULL,
    ativo bit DEFAULT 1,
    FOREIGN KEY (locador_id) REFERENCES Locadores(id)
);
```

## 9. OBSERVAÇÕES IMPORTANTES

1. **Repository faltando**: O arquivo `locador_repository_v2.py` referenciado na API não existe
2. **RepresentanteLegalLocador**: Tabela existe mas faltam alguns campos (data_nascimento, nacionalidade, estado_civil, profissao)
3. **EnderecoLocador**: Tabela existe com estrutura completa para endereços
4. **ContasBancariasLocador**: Tabela correta já existe e suporta múltiplas contas com campo `principal`
5. **Múltiplas contas**: Estrutura do banco está correta, precisa conectar ao backend/frontend
6. **Validações**: Faltam validações tanto no frontend quanto no backend

## 10. RESUMO ATUALIZADO DA SITUAÇÃO

### ✅ ESTRUTURAS JÁ EXISTEM NO BANCO:
- **`Locadores`** - Tabela principal com a maioria dos campos
- **`RepresentanteLegalLocador`** - Para representante legal de PJ (faltam apenas 4 campos)
- **`ContasBancariasLocador`** - Para múltiplas contas bancárias (estrutura completa)
- **`EnderecoLocador`** - Para endereços estruturados (estrutura completa)
- **Ligações** - `endereco_id` na tabela `Locadores` já existe

### ❌ PROBLEMAS PRINCIPAIS:
1. **`locador_repository_v2.py`** - Arquivo não existe mas é chamado pela API
2. **Frontend desconectado** - Não utiliza as tabelas relacionadas existentes
3. **Poucos campos faltantes** no banco de dados

### 🔧 SOLUÇÕES NECESSÁRIAS:
1. **Criar `locador_repository_v2.py`** com JOINs para todas as tabelas relacionadas
2. **Atualizar frontend** para usar as tabelas `RepresentanteLegalLocador`, `ContasBancariasLocador` e `EnderecoLocador`
3. **Adicionar poucos campos faltantes** no banco
4. **Conectar tudo** - o banco está preparado, só falta a lógica de conexão

## 11. PRÓXIMOS PASSOS PRIORITÁRIOS

1. **URGENTE**: Criar o arquivo `locador_repository_v2.py`
2. **IMPORTANTE**: Executar script SQL para poucos campos faltantes
3. **FUNDAMENTAL**: Conectar frontend às tabelas relacionadas existentes
4. Testar fluxo completo de CRUD
5. Validar dados em produção

**CONCLUSÃO**: A estrutura do banco está muito mais preparada do que inicialmente pensado. O principal gargalo é a ausência do repository e a falta de conexão entre frontend/backend com as tabelas já existentes.