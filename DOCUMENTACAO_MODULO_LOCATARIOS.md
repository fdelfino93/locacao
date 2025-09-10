# 👥 Documentação - Módulo Locatários

**Versão:** 2.0  
**Data:** Setembro 2025  
**Status:** ATUALIZADO

## 🎯 Visão Geral

O módulo de locatários é responsável por gerenciar todas as informações dos inquilinos do sistema, suportando tanto **Pessoa Física (PF)** quanto **Pessoa Jurídica (PJ)** com funcionalidades avançadas específicas para cada tipo.

### **Funcionalidades Principais:**
- ✅ Cadastro completo PF e PJ
- ✅ Representante legal para PJ com endereço estruturado
- ✅ Múltiplos contatos (telefones/emails) com sync automática
- ✅ Sistema avançado de cobrança (FormasEnvioCobranca)
- ✅ Dados de cônjuge completos
- ✅ Sistema de fiadores estruturado
- ✅ Endereço híbrido (inline + estruturado)
- ✅ Validações específicas por tipo com mapeamento automático
- ✅ Busca avançada integrada com filtros
- ✅ Compatibilidade com dados legados (tabela Inquilinos)
- ✅ Sistema de auditoria e soft delete

### **Diferenças do Módulo Locadores:**
- **FormasEnvioCobranca**: Sistema exclusivo para priorizar meios de cobrança
- **Dados de Moradores**: Informações estruturadas sobre todos os moradores
- **Quantidade de Pets**: Controle específico para animais de estimação
- **Sistema Híbrido**: Duplo armazenamento de endereços para compatibilidade
- **Fallback Legado**: Integração automática com tabela `Inquilinos` existente

## 🗄️ Estrutura do Banco de Dados

### **Tabela Principal: Locatarios**
```sql
CREATE TABLE [dbo].[Locatarios](
    -- Identificação Básica
    [id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [nome] [nvarchar](200) NOT NULL,
    [cpf_cnpj] [nvarchar](18) NULL,
    [tipo_pessoa] [nvarchar](2) NULL,  -- 'PF' ou 'PJ'
    
    -- Dados Pessoa Física
    [rg] [nvarchar](15) NULL,
    [data_nascimento] [date] NULL,
    [nacionalidade] [nvarchar](50) NULL,
    [estado_civil] [nvarchar](20) NULL,
    [profissao] [nvarchar](100) NULL,
    
    -- Contatos
    [telefone] [nvarchar](20) NULL,
    [email] [nvarchar](100) NULL,
    
    -- Endereço Estruturado
    [endereco_rua] [nvarchar](200) NULL,
    [endereco_numero] [nvarchar](10) NULL,
    [endereco_complemento] [nvarchar](100) NULL,
    [endereco_bairro] [nvarchar](100) NULL,
    [endereco_cidade] [nvarchar](100) NULL,
    [endereco_estado] [nvarchar](2) NULL,
    [endereco_cep] [nvarchar](10) NULL,
    
    -- Dados Pessoa Jurídica
    [razao_social] [nvarchar](200) NULL,
    [nome_fantasia] [nvarchar](200) NULL,
    [inscricao_estadual] [nvarchar](50) NULL,
    [inscricao_municipal] [nvarchar](50) NULL,
    [atividade_principal] [nvarchar](200) NULL,
    [data_constituicao] [date] NULL,
    [capital_social] [decimal](18,2) NULL,
    [porte_empresa] [nvarchar](50) NULL,
    [regime_tributario] [nvarchar](50) NULL,
    
    -- Dados do Cônjuge
    [possui_conjuge] [bit] NULL,
    [conjuge_nome] [nvarchar](200) NULL,
    [cpf_conjuge] [nvarchar](14) NULL,
    [nome_conjuge] [nvarchar](200) NULL,
    [rg_conjuge] [nvarchar](15) NULL,
    [endereco_conjuge] [nvarchar](255) NULL,
    [telefone_conjuge] [nvarchar](20) NULL,
    [regime_bens] [nvarchar](50) NULL,
    
    -- Configurações Gerais
    [possui_inquilino_solidario] [bit] NULL,
    [possui_fiador] [bit] NULL,
    [qtd_pets] [int] NULL,
    [observacoes] [nvarchar](max) NULL,
    [ativo] [bit] NULL,
    
    -- Auditoria
    [created_at] [datetime2](7) NULL,
    [updated_at] [datetime2](7) NULL
);
```

### **Tabelas Relacionadas**

#### **RepresentanteLegalLocatario**
```sql
CREATE TABLE [dbo].[RepresentanteLegalLocatario](
    [id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [id_locatario] [int] NULL,
    [nome] [nvarchar](200) NOT NULL,
    [cpf] [nvarchar](14) NOT NULL,
    [rg] [nvarchar](20) NULL,
    [endereco] [nvarchar](500) NULL,  -- String formatada
    [telefone] [nvarchar](20) NULL,
    [email] [nvarchar](200) NULL,
    [cargo] [nvarchar](100) NULL,
    [created_at] [datetime] NULL,
    
    CONSTRAINT FK_RepresentanteLegal_Locatario 
        FOREIGN KEY ([id_locatario]) REFERENCES [Locatarios]([id])
);
```

#### **TelefonesLocatario**
```sql
CREATE TABLE [dbo].[TelefonesLocatario](
    [id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [id_locatario] [int] NOT NULL,
    [telefone] [nvarchar](20) NOT NULL,
    [tipo] [nvarchar](20) NULL,  -- 'Residencial', 'Comercial', 'Celular'
    [principal] [bit] NULL,
    [ativo] [bit] NULL,
    [created_at] [datetime] NULL,
    
    CONSTRAINT FK_Telefones_Locatario 
        FOREIGN KEY ([id_locatario]) REFERENCES [Locatarios]([id])
);
```

#### **EmailsLocatario**
```sql
CREATE TABLE [dbo].[EmailsLocatario](
    [id] [int] IDENTITY(1,1) NOT NULL PRIMARY KEY,
    [id_locatario] [int] NOT NULL,
    [email] [nvarchar](200) NOT NULL,
    [tipo] [nvarchar](20) NULL,  -- 'Pessoal', 'Comercial', 'Cobrança'
    [principal] [bit] NULL,
    [ativo] [bit] NULL,
    [created_at] [datetime] NULL,
    
    CONSTRAINT FK_Emails_Locatario 
        FOREIGN KEY ([id_locatario]) REFERENCES [Locatarios]([id])
);
```

## 🔧 Backend - API e Validações

### **Modelo Pydantic (main.py)**
```python
class LocatarioCreate(BaseModel):
    # Dados Básicos
    nome: str
    cpf_cnpj: str
    tipo_pessoa: Literal['PF', 'PJ']
    telefone: Optional[str] = None
    email: Optional[str] = None
    
    # Dados PF
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    nacionalidade: Optional[str] = "Brasileira"
    estado_civil: Optional[str] = None
    profissao: Optional[str] = None
    
    # Dados PJ
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    atividade_principal: Optional[str] = None
    data_constituicao: Optional[date] = None
    capital_social: Optional[str] = None  # String para evitar problemas de conversão
    porte_empresa: Optional[str] = None
    regime_tributario: Optional[str] = None
    
    # Endereço Estruturado
    endereco_rua: Optional[str] = None
    endereco_numero: Optional[str] = None
    endereco_complemento: Optional[str] = None
    endereco_bairro: Optional[str] = None
    endereco_cidade: Optional[str] = None
    endereco_estado: Optional[str] = "PR"
    endereco_cep: Optional[str] = None
    
    # Representante Legal (apenas PJ)
    representante_legal: Optional[dict] = None
    
    # Cônjuge
    possui_conjuge: Optional[bool] = None
    conjuge_nome: Optional[str] = None
    cpf_conjuge: Optional[str] = None
    rg_conjuge: Optional[str] = None
    endereco_conjuge: Optional[str] = None
    telefone_conjuge: Optional[str] = None
    regime_bens: Optional[str] = None
    
    # Múltiplos Contatos
    telefones: Optional[List[str]] = []
    emails: Optional[List[str]] = []
    
    # Outros
    observacoes: Optional[str] = None
    
    # Validações customizadas
    @validator('cpf_cnpj')
    def validar_cpf_cnpj(cls, v, values):
        tipo = values.get('tipo_pessoa')
        if tipo == 'PF' and v:
            # Validar CPF (11 dígitos)
            cpf_numeros = ''.join(filter(str.isdigit, v))
            if len(cpf_numeros) != 11:
                raise ValueError('CPF deve ter 11 dígitos')
        elif tipo == 'PJ' and v:
            # Validar CNPJ (14 dígitos)
            cnpj_numeros = ''.join(filter(str.isdigit, v))
            if len(cnpj_numeros) != 14:
                raise ValueError('CNPJ deve ter 14 dígitos')
        return v
    
    @validator('representante_legal')
    def validar_representante_pj(cls, v, values):
        tipo = values.get('tipo_pessoa')
        if tipo == 'PJ' and not v:
            raise ValueError('Representante legal é obrigatório para PJ')
        return v
```

### **Endpoints da API**
```python
@app.post("/locatarios")
async def criar_locatario(locatario: LocatarioCreate):
    """
    Cria um novo locatário com todos os dados relacionados.
    """
    try:
        # Validações específicas
        await validar_locatario_unico(locatario.cpf_cnpj, locatario.tipo_pessoa)
        
        # Converter tipos se necessário
        dados_limpos = await processar_dados_locatario(locatario.dict())
        
        # Criar locatário principal
        locatario_id = await criar_locatario_principal(dados_limpos)
        
        # Salvar representante legal (se PJ)
        if locatario.tipo_pessoa == 'PJ' and locatario.representante_legal:
            await salvar_representante_legal(locatario_id, locatario.representante_legal)
        
        # Salvar múltiplos contatos
        if locatario.telefones:
            await salvar_telefones_locatario(locatario_id, locatario.telefones)
        if locatario.emails:
            await salvar_emails_locatario(locatario_id, locatario.emails)
        
        return {
            "message": "Locatário criado com sucesso",
            "locatario_id": locatario_id
        }
        
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@app.get("/locatarios/{locatario_id}")
async def buscar_locatario(locatario_id: int):
    """
    Busca locatário completo com todos os relacionamentos.
    """
    try:
        locatario = await buscar_locatario_completo(locatario_id)
        if not locatario:
            raise HTTPException(status_code=404, detail="Locatário não encontrado")
        
        return {"data": locatario}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/locatarios/{locatario_id}")
async def atualizar_locatario(locatario_id: int, locatario: LocatarioUpdate):
    """
    Atualiza dados do locatário e relacionamentos.
    """
    try:
        # Verificar se existe
        locatario_existente = await buscar_locatario_simples(locatario_id)
        if not locatario_existente:
            raise HTTPException(status_code=404, detail="Locatário não encontrado")
        
        # Processar dados
        dados_limpos = await processar_dados_locatario(locatario.dict(exclude_unset=True))
        
        # Atualizar dados principais
        await atualizar_locatario_principal(locatario_id, dados_limpos)
        
        # Atualizar representante legal
        if 'representante_legal' in dados_limpos:
            await atualizar_representante_legal(locatario_id, dados_limpos['representante_legal'])
        
        return {"message": "Locatário atualizado com sucesso"}
        
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

## 🔄 Repository Layer (repositories_adapter.py)

### **Função Principal de Criação**
```python
def criar_locatario(**kwargs):
    """
    Cria locatário na tabela principal.
    """
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Campos que podem ser inseridos
        campos_inserir = [
            'nome', 'cpf_cnpj', 'tipo_pessoa', 'telefone', 'email',
            'rg', 'data_nascimento', 'nacionalidade', 'estado_civil', 'profissao',
            'endereco_rua', 'endereco_numero', 'endereco_complemento', 
            'endereco_bairro', 'endereco_cidade', 'endereco_estado', 'endereco_cep',
            'razao_social', 'nome_fantasia', 'inscricao_estadual', 'inscricao_municipal',
            'atividade_principal', 'data_constituicao', 'capital_social', 
            'porte_empresa', 'regime_tributario',
            'possui_conjuge', 'conjuge_nome', 'cpf_conjuge', 'rg_conjuge',
            'endereco_conjuge', 'telefone_conjuge', 'regime_bens',
            'observacoes', 'ativo'
        ]
        
        # Filtrar apenas campos enviados
        campos_query = []
        valores = []
        placeholders = []
        
        for campo in campos_inserir:
            if campo in kwargs and kwargs[campo] is not None:
                campos_query.append(campo)
                valores.append(kwargs[campo])
                placeholders.append('?')
        
        # Adicionar campos de auditoria
        campos_query.extend(['created_at', 'updated_at'])
        valores.extend([datetime.now(), datetime.now()])
        placeholders.extend(['?', '?'])
        
        # Construir query
        query = f"""
            INSERT INTO Locatarios ({', '.join(campos_query)})
            VALUES ({', '.join(placeholders)})
        """
        
        cursor.execute(query, valores)
        locatario_id = cursor.execute("SELECT @@IDENTITY").fetchval()
        
        conn.commit()
        print(f"✅ Locatário criado com ID: {locatario_id}")
        
        return locatario_id
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao criar locatário: {e}")
        raise
    finally:
        conn.close()

def atualizar_locatario(locatario_id, **kwargs):
    """
    Atualiza dados do locatário.
    """
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Verificar se existe
        cursor.execute("SELECT id FROM Locatarios WHERE id = ?", locatario_id)
        if not cursor.fetchone():
            raise ValueError(f"Locatário ID {locatario_id} não encontrado")
        
        # Campos atualizáveis
        campos_atualizaveis = [
            'nome', 'cpf_cnpj', 'telefone', 'email', 'tipo_pessoa', 'rg', 
            'data_nascimento', 'nacionalidade', 'estado_civil', 'profissao',
            'endereco_rua', 'endereco_numero', 'endereco_complemento', 'endereco_bairro',
            'endereco_cidade', 'endereco_estado', 'endereco_cep',
            'razao_social', 'nome_fantasia', 'inscricao_estadual', 'inscricao_municipal',
            'atividade_principal', 'data_constituicao', 'capital_social', 
            'porte_empresa', 'regime_tributario',
            'possui_conjuge', 'conjuge_nome', 'cpf_conjuge', 'rg_conjuge',
            'endereco_conjuge', 'telefone_conjuge', 'regime_bens',
            'observacoes', 'ativo'
        ]
        
        # Filtrar campos para atualizar
        campos_update = []
        valores = []
        
        for campo, valor in kwargs.items():
            if campo in campos_atualizaveis and valor is not None:
                # Conversões específicas
                if campo in ['possui_conjuge', 'ativo'] and isinstance(valor, bool):
                    valor = 1 if valor else 0
                
                campos_update.append(f"{campo} = ?")
                valores.append(valor)
        
        if not campos_update:
            print("⚠️ Nenhum campo para atualizar")
            return True
        
        # Adicionar updated_at
        campos_update.append("updated_at = ?")
        valores.append(datetime.now())
        valores.append(locatario_id)  # WHERE condition
        
        query = f"""
            UPDATE Locatarios 
            SET {', '.join(campos_update)}
            WHERE id = ?
        """
        
        cursor.execute(query, valores)
        
        # Tratar representante legal se fornecido
        if 'representante_legal' in kwargs:
            processar_representante_legal(cursor, locatario_id, kwargs['representante_legal'])
        
        conn.commit()
        print(f"✅ Locatário {locatario_id} atualizado")
        
        return True
        
    except Exception as e:
        conn.rollback()
        print(f"❌ Erro ao atualizar locatário: {e}")
        raise
    finally:
        conn.close()
```

### **Representante Legal**
```python
def processar_representante_legal(cursor, locatario_id, dados_representante):
    """
    Insere ou atualiza representante legal.
    """
    if not dados_representante:
        return
    
    # Verificar se já existe
    cursor.execute("""
        SELECT id FROM RepresentanteLegalLocatario 
        WHERE id_locatario = ?
    """, locatario_id)
    
    representante_existente = cursor.fetchone()
    
    if representante_existente:
        # UPDATE
        query = """
            UPDATE RepresentanteLegalLocatario 
            SET nome = ?, cpf = ?, rg = ?, endereco = ?, 
                telefone = ?, email = ?, cargo = ?
            WHERE id_locatario = ?
        """
        valores = [
            dados_representante.get('nome'),
            dados_representante.get('cpf'),
            dados_representante.get('rg'),
            dados_representante.get('endereco'),
            dados_representante.get('telefone'),
            dados_representante.get('email'),
            dados_representante.get('cargo'),
            locatario_id
        ]
        cursor.execute(query, valores)
        print(f"✅ Representante legal atualizado para locatário {locatario_id}")
    else:
        # INSERT
        query = """
            INSERT INTO RepresentanteLegalLocatario 
            (id_locatario, nome, cpf, rg, endereco, telefone, email, cargo, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        valores = [
            locatario_id,
            dados_representante.get('nome'),
            dados_representante.get('cpf'),
            dados_representante.get('rg'),
            dados_representante.get('endereco'),
            dados_representante.get('telefone'),
            dados_representante.get('email'),
            dados_representante.get('cargo'),
            datetime.now()
        ]
        cursor.execute(query, valores)
        print(f"✅ Representante legal criado para locatário {locatario_id}")

def buscar_locatario_completo(locatario_id):
    """
    Busca locatário com todos os relacionamentos.
    """
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Buscar dados principais
        query = """
            SELECT * FROM Locatarios WHERE id = ?
        """
        cursor.execute(query, locatario_id)
        resultado = cursor.fetchone()
        
        if not resultado:
            return None
        
        # Converter para dicionário
        colunas = [desc[0] for desc in cursor.description]
        locatario = dict(zip(colunas, resultado))
        
        # Buscar representante legal
        cursor.execute("""
            SELECT id, nome, cpf, rg, endereco, telefone, email, cargo
            FROM RepresentanteLegalLocatario 
            WHERE id_locatario = ?
        """, locatario_id)
        
        representante = cursor.fetchone()
        if representante:
            locatario['representante_legal'] = {
                'id': representante[0],
                'nome': representante[1],
                'cpf': representante[2],
                'rg': representante[3],
                'endereco': representante[4],
                'telefone': representante[5],
                'email': representante[6],
                'cargo': representante[7]
            }
        else:
            locatario['representante_legal'] = None
        
        # Buscar telefones
        cursor.execute("""
            SELECT telefone, tipo, principal 
            FROM TelefonesLocatario 
            WHERE id_locatario = ? AND ativo = 1
        """, locatario_id)
        telefones = cursor.fetchall()
        locatario['telefones'] = [t[0] for t in telefones]
        
        # Buscar emails
        cursor.execute("""
            SELECT email, tipo, principal 
            FROM EmailsLocatario 
            WHERE id_locatario = ? AND ativo = 1
        """, locatario_id)
        emails = cursor.fetchall()
        locatario['emails'] = [e[0] for e in emails]
        
        return locatario
        
    except Exception as e:
        print(f"❌ Erro ao buscar locatário: {e}")
        raise
    finally:
        conn.close()
```

## 🎨 Frontend - Interface React

### **Componente Principal (ModernLocatarioFormV2.tsx)**
```typescript
interface LocatarioFormData {
    // Dados básicos
    nome: string;
    cpf_cnpj: string;
    tipo_pessoa: 'PF' | 'PJ';
    telefone: string;
    email: string;
    
    // Dados PF
    rg: string;
    data_nascimento: string;
    nacionalidade: string;
    estado_civil: string;
    profissao: string;
    
    // Dados PJ
    razao_social: string;
    nome_fantasia: string;
    inscricao_estadual: string;
    inscricao_municipal: string;
    atividade_principal: string;
    data_constituicao: string;
    capital_social: string;
    porte_empresa: string;
    regime_tributario: string;
    
    // Endereço estruturado
    endereco: {
        rua: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
    
    // Representante legal (PJ)
    nome_representante: string;
    cpf_representante: string;
    rg_representante: string;
    cargo_representante: string;
    telefone_representante: string;
    email_representante: string;
    endereco_representante: {
        rua: string;
        numero: string;
        complemento: string;
        bairro: string;
        cidade: string;
        estado: string;
        cep: string;
    };
    
    // Cônjuge
    possui_conjuge: boolean;
    nome_conjuge: string;
    cpf_conjuge: string;
    rg_conjuge: string;
    telefone_conjuge: string;
    endereco_conjuge: string;
    regime_bens: string;
    
    // Múltiplos contatos
    telefones: string[];
    emails: string[];
    
    // Outros
    observacoes: string;
}
```

### **Lógica de Validação Frontend**
```typescript
const validarFormulario = (dados: LocatarioFormData): string[] => {
    const erros: string[] = [];
    
    // Validações básicas
    if (!dados.nome.trim()) {
        erros.push('Nome é obrigatório');
    }
    
    if (!dados.cpf_cnpj.trim()) {
        erros.push('CPF/CNPJ é obrigatório');
    }
    
    // Validações específicas por tipo
    if (dados.tipo_pessoa === 'PF') {
        // Validar CPF
        const cpf = dados.cpf_cnpj.replace(/\D/g, '');
        if (cpf.length !== 11) {
            erros.push('CPF deve ter 11 dígitos');
        }
        
        if (!dados.rg.trim()) {
            erros.push('RG é obrigatório para Pessoa Física');
        }
        
    } else if (dados.tipo_pessoa === 'PJ') {
        // Validar CNPJ
        const cnpj = dados.cpf_cnpj.replace(/\D/g, '');
        if (cnpj.length !== 14) {
            erros.push('CNPJ deve ter 14 dígitos');
        }
        
        if (!dados.razao_social.trim()) {
            erros.push('Razão Social é obrigatória para Pessoa Jurídica');
        }
        
        // Representante obrigatório para PJ
        if (!dados.nome_representante.trim()) {
            erros.push('Nome do representante é obrigatório para PJ');
        }
        
        if (!dados.cpf_representante.trim()) {
            erros.push('CPF do representante é obrigatório para PJ');
        }
    }
    
    // Validar endereço básico
    if (!dados.endereco.rua.trim()) {
        erros.push('Rua é obrigatória');
    }
    
    if (!dados.endereco.cidade.trim()) {
        erros.push('Cidade é obrigatória');
    }
    
    // Validar pelo menos um contato
    const temTelefone = dados.telefone.trim() || dados.telefones.some(t => t.trim());
    const temEmail = dados.email.trim() || dados.emails.some(e => e.trim());
    
    if (!temTelefone && !temEmail) {
        erros.push('Pelo menos um telefone ou email é obrigatório');
    }
    
    return erros;
};
```

### **Envio de Dados**
```typescript
const salvarLocatario = async (dados: LocatarioFormData) => {
    try {
        setLoading(true);
        
        // Validar formulário
        const erros = validarFormulario(dados);
        if (erros.length > 0) {
            setMessage({ type: 'error', text: erros.join(', ') });
            return;
        }
        
        // Preparar dados para envio
        const dadosParaEnvio = prepararDadosEnvio(dados);
        
        // Enviar para API
        const response = await apiService.criarLocatario(dadosParaEnvio);
        
        setMessage({ type: 'success', text: 'Locatário salvo com sucesso!' });
        
        // Limpar formulário ou redirecionar
        if (onSalvar) {
            onSalvar(response.data);
        }
        
    } catch (error: any) {
        console.error('Erro ao salvar locatário:', error);
        
        let mensagemErro = 'Erro ao salvar locatário';
        if (error.response?.data?.detail) {
            mensagemErro = error.response.data.detail;
        }
        
        setMessage({ type: 'error', text: mensagemErro });
    } finally {
        setLoading(false);
    }
};

const prepararDadosEnvio = (dados: LocatarioFormData) => {
    // Limpar campos de data vazios
    const camposData = ['data_nascimento', 'data_constituicao'];
    const dadosLimpos = { ...dados };
    
    camposData.forEach(campo => {
        if (dadosLimpos[campo] === '') {
            dadosLimpos[campo] = null;
        }
    });
    
    // Converter capital_social para string
    if (typeof dadosLimpos.capital_social === 'number') {
        dadosLimpos.capital_social = String(dadosLimpos.capital_social);
    }
    
    // Preparar representante legal
    let representanteLegal = null;
    if (dados.tipo_pessoa === 'PJ' && dados.nome_representante) {
        representanteLegal = {
            nome: dados.nome_representante,
            cpf: dados.cpf_representante,
            rg: dados.rg_representante,
            cargo: dados.cargo_representante,
            telefone: dados.telefone_representante,
            email: dados.email_representante,
            endereco: formatarEnderecoString(dados.endereco_representante)
        };
    }
    
    return {
        ...dadosLimpos,
        representante_legal: representanteLegal,
        endereco_rua: dados.endereco.rua,
        endereco_numero: dados.endereco.numero,
        endereco_complemento: dados.endereco.complemento,
        endereco_bairro: dados.endereco.bairro,
        endereco_cidade: dados.endereco.cidade,
        endereco_estado: dados.endereco.estado,
        endereco_cep: dados.endereco.cep
    };
};

const formatarEnderecoString = (endereco: any): string => {
    if (!endereco) return '';
    
    const partes = [
        endereco.rua,
        endereco.numero,
        endereco.complemento,
        endereco.bairro,
        `${endereco.cidade} - ${endereco.estado}`,
        `CEP: ${endereco.cep}`
    ].filter(parte => parte && parte.trim());
    
    return partes.join(', ');
};
```

## 🔍 Integração com Sistema de Busca

### **Busca Específica de Locatários**
```python
def buscar_locatarios(termo: str, filtros: dict = None, limite: int = 50):
    """
    Busca locatários com filtros específicos.
    """
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Query base
        query = """
            SELECT 
                l.id, l.nome, l.cpf_cnpj, l.tipo_pessoa,
                l.telefone, l.email, l.ativo,
                l.endereco_cidade, l.endereco_bairro,
                r.nome as representante_nome
            FROM Locatarios l
            LEFT JOIN RepresentanteLegalLocatario r ON l.id = r.id_locatario
            WHERE 1=1
        """
        
        parametros = []
        
        # Filtro por termo
        if termo:
            query += """
                AND (
                    l.nome LIKE ? OR 
                    l.cpf_cnpj LIKE ? OR
                    l.telefone LIKE ? OR
                    l.email LIKE ? OR
                    l.endereco_cidade LIKE ? OR
                    r.nome LIKE ?
                )
            """
            termo_like = f"%{termo}%"
            parametros.extend([termo_like] * 6)
        
        # Filtros específicos
        if filtros:
            if filtros.get('tipo_pessoa'):
                query += " AND l.tipo_pessoa = ?"
                parametros.append(filtros['tipo_pessoa'])
            
            if filtros.get('ativo') is not None:
                query += " AND l.ativo = ?"
                parametros.append(1 if filtros['ativo'] else 0)
            
            if filtros.get('cidade'):
                query += " AND l.endereco_cidade LIKE ?"
                parametros.append(f"%{filtros['cidade']}%")
        
        # Ordenação e limite
        query += " ORDER BY l.nome LIMIT ?"
        parametros.append(limite)
        
        cursor.execute(query, parametros)
        resultados = cursor.fetchall()
        
        # Converter para dicionários
        colunas = [desc[0] for desc in cursor.description]
        locatarios = [dict(zip(colunas, row)) for row in resultados]
        
        return locatarios
        
    except Exception as e:
        print(f"❌ Erro na busca de locatários: {e}")
        return []
    finally:
        conn.close()
```

## 📊 Relatórios e Métricas

### **Dashboard de Locatários**
```sql
-- Total de locatários por tipo
SELECT 
    tipo_pessoa,
    COUNT(*) as total,
    COUNT(CASE WHEN ativo = 1 THEN 1 END) as ativos
FROM Locatarios 
GROUP BY tipo_pessoa;

-- Locatários por cidade
SELECT 
    endereco_cidade,
    COUNT(*) as total
FROM Locatarios 
WHERE ativo = 1 AND endereco_cidade IS NOT NULL
GROUP BY endereco_cidade
ORDER BY total DESC;

-- Representantes legais sem dados completos
SELECT 
    l.id,
    l.nome as empresa,
    r.nome as representante,
    CASE 
        WHEN r.telefone IS NULL THEN 'Sem telefone'
        WHEN r.email IS NULL THEN 'Sem email'
        WHEN r.endereco IS NULL THEN 'Sem endereço'
        ELSE 'Completo'
    END as status_dados
FROM Locatarios l
LEFT JOIN RepresentanteLegalLocatario r ON l.id = r.id_locatario
WHERE l.tipo_pessoa = 'PJ' AND l.ativo = 1;
```

## ⚠️ Pontos Importantes

### **Validações Críticas**
- ✅ CPF único para PF / CNPJ único para PJ
- ✅ Representante legal obrigatório para PJ
- ✅ Pelo menos um contato (telefone ou email)
- ✅ Endereço mínimo (rua e cidade)
- ✅ Dados de cônjuge consistentes

### **Conversões de Dados**
- ✅ Datas vazias → null
- ✅ capital_social: number → string
- ✅ Endereço estruturado ↔ string formatada
- ✅ Booleanos: true/false ↔ 1/0

### **Performance**
- ✅ Índices em CPF/CNPJ e nome
- ✅ Busca otimizada com LIKE
- ✅ Paginação em listagens
- ✅ Cache de consultas frequentes

---

## 🔄 MELHORIAS IMPLEMENTADAS (Setembro 2025)

### **Correção do Mapeamento de Endereços do Representante Legal**

**Problema:** Endereço armazenado como string no banco vs objeto estruturado no frontend.

**Solução:** Função de parsing bidirecional aprimorada que converte corretamente:
- ✅ CEP extraído e preservado
- ✅ Campos bairro e cidade mapeados corretamente  
- ✅ Conversão automática string ↔ objeto estruturado
- ✅ Compatibilidade com dados existentes

### **Sincronização de Múltiplos Contatos**

**Implementação:** Sistema otimizado de soft delete + inserção:
- ✅ Desativação de registros antigos (ativo = 0)
- ✅ Inserção de novos contatos com flag principal automática
- ✅ Sincronização com campos únicos para compatibilidade
- ✅ Transações atômicas para consistência

### **Sistema de Validação Padronizado**

**Recursos:** Validador centralizado com regras específicas por tipo:
- ✅ Validações PF vs PJ diferenciadas
- ✅ Verificação de campos obrigatórios por contexto
- ✅ Validação de relacionamentos (cônjuge, representante legal)
- ✅ Mensagens de erro específicas por campo

### **Compatibilidade com Dados Legados**

**Estratégia:** Sistema de fallback automático:
- ✅ Busca primária na nova estrutura (Locatarios)
- ✅ Fallback para tabela legada (Inquilinos) em caso de erro
- ✅ Conversão automática de dados legados
- ✅ Preservação de dados históricos

### **Sistema de Auditoria e Controle**

**Funcionalidades:** Rastreamento completo de mudanças:
- ✅ Log de todas as operações (CREATE, UPDATE, DELETE)
- ✅ Armazenamento de dados anteriores e novos
- ✅ Rastreamento de usuário e timestamp
- ✅ Histórico completo por entidade

---

## 🔮 ROADMAP FUTURO

### **Q4 2025**
- Interface unificada com módulo Locadores
- Sistema de cache inteligente  
- Relatórios avançados de cobrança
- API GraphQL

### **Q1 2026**
- Migração automática tabela Inquilinos → Locatarios
- Dashboard de estatísticas avançadas
- Integração com sistema de contratos
- Mobile app para locatários

---

## 📋 STATUS ATUAL

**✅ FUNCIONAL:** Todos os recursos principais implementados  
**✅ TESTADO:** Operações CRUD validadas  
**✅ DOCUMENTADO:** Documentação técnica completa  
**✅ OTIMIZADO:** Performance e compatibilidade garantidas

---

**Atualizada:** 10/09/2025  
**Módulo Locatários v2.0 - Documentação Completa**