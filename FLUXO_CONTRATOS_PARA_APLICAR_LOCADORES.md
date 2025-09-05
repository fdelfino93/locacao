# Análise do Fluxo de Contratos para Aplicar em Locadores

## 🎯 OBJETIVO
Analisar como o módulo de **CONTRATOS** funciona para aplicar a mesma lógica no módulo de **LOCADORES** e garantir 100% de funcionamento.

---

## 1. FLUXO FRONTEND - CONTRATOS

### 📝 **CADASTRO** (`ModernContratoForm.tsx`)
```tsx
// Estados principais
const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState<Contrato>({ /* dados iniciais */ });
const [locadores, setLocadores] = useState<ContratoLocador[]>([]);
const [locatarios, setLocatarios] = useState<ContratoLocatario[]>([]);

// Função de salvamento
const handleSubmit = async () => {
  setLoading(true);
  try {
    // 1. Salvar contrato principal
    const response = await fetch('http://localhost:8000/api/contratos', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    
    // 2. Salvar tabelas relacionadas se necessário
    if (locadores.length > 0) {
      await salvarLocadoresContrato(contratoId, locadores);
    }
    
    alert('✅ Contrato criado com sucesso!');
  } catch (error) {
    alert('❌ Erro ao criar contrato');
  } finally {
    setLoading(false);
  }
};
```

### 📖 **VISUALIZAÇÃO** (`isViewing = true`)
```tsx
// Estados para carregamento
const [loadingData, setLoadingData] = useState(true);
const [contratoData, setContratoData] = useState<any>(null);
const [apiError, setApiError] = useState<string | null>(null);

// Carregamento automático via useEffect
useEffect(() => {
  if (isViewing || isEditing) {
    const pathParts = window.location.pathname.split('/');
    const contratoId = pathParts[pathParts.length - 1];
    carregarDadosContrato(parseInt(contratoId));
  }
}, [isViewing, isEditing]);

// Função de carregamento
const carregarDadosContrato = async (contratoId: number) => {
  setLoadingData(true);
  try {
    const response = await fetch(`http://localhost:8000/api/contratos/${contratoId}`);
    const data = await response.json();
    
    if (data.success) {
      setContratoData(data.data);
      // Preencher formData com os dados carregados
      setFormData({ ...data.data });
    } else {
      setApiError('Contrato não encontrado');
    }
  } catch (error) {
    setApiError('Erro ao carregar dados');
  } finally {
    setLoadingData(false);
  }
};

// Telas de loading e erro
if ((isViewing || isEditing) && loadingData) {
  return <TelaLoading />;
}

if ((isViewing || isEditing) && apiError) {
  return <TelaErro />;
}
```

### ✏️ **EDIÇÃO** (`isEditing = true`)
```tsx
// Mesmo carregamento da visualização
// Diferença: isReadonly = false

const isReadonly = isViewing; // Em editar: false, Em visualizar: true

// Função de atualização
const handleUpdate = async () => {
  setLoading(true);
  try {
    const response = await fetch(`http://localhost:8000/api/contratos/${contratoId}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
    
    alert('✅ Contrato atualizado com sucesso!');
  } catch (error) {
    alert('❌ Erro ao atualizar contrato');
  } finally {
    setLoading(false);
  }
};
```

---

## 2. FLUXO BACKEND - CONTRATOS

### 🔗 **ROTAS API** (`main.py`)
```python
# CREATE
@app.post("/api/contratos")
async def criar_contrato(contrato: ContratoCreate):
    try:
        novo_contrato = inserir_contrato(
            contrato.id_imovel,
            contrato.id_locatario,
            contrato.data_inicio,
            # ... outros campos
        )
        return {"success": True, "data": novo_contrato}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# READ
@app.get("/api/contratos/{contrato_id}")
async def obter_contrato_por_id(contrato_id: int):
    try:
        contrato = buscar_contrato_por_id(contrato_id)
        if contrato:
            return {"data": contrato, "success": True}
        else:
            raise HTTPException(status_code=404, detail="Contrato não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# UPDATE
@app.put("/api/contratos/{contrato_id}")
async def atualizar_contrato(contrato_id: int, contrato: ContratoUpdate):
    try:
        dados_filtrados = {k: v for k, v in contrato.dict().items() if v is not None}
        resultado = atualizar_contrato_db(contrato_id, dados_filtrados)
        return {"success": True, "message": "Contrato atualizado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# LIST
@app.get("/api/contratos")
async def listar_contratos():
    try:
        contratos = buscar_contratos()
        return {"data": contratos, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 🗄️ **REPOSITORY** (`repositories_adapter.py`)
```python
def buscar_contrato_por_id(contrato_id):
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Query principal com JOINs
        cursor.execute("""
            SELECT c.*, i.endereco, l.nome as locador_nome
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN Locadores l ON i.id_locador = l.id
            WHERE c.id = ?
        """, (contrato_id,))
        
        row = cursor.fetchone()
        if row:
            return {
                "id": row[0],
                "data_inicio": row[1],
                # ... mapear todos os campos
            }
        return None
    except Exception as e:
        raise e
```

---

## 3. PADRÃO IDENTIFICADO PARA LOCADORES

### 🎯 **ESTRUTURA NECESSÁRIA**

#### **Frontend: ModernLocadorFormV2.tsx**
```tsx
interface ModernLocadorFormV2Props {
  onBack?: () => void;
  isViewing?: boolean;    // Modo visualização (readonly)
  isEditing?: boolean;    // Modo edição (editável)
}

// Estados principais
const [loading, setLoading] = useState(false);
const [loadingData, setLoadingData] = useState(true);
const [formData, setFormData] = useState<Locador>({ /* dados iniciais */ });
const [apiError, setApiError] = useState<string | null>(null);

// Carregamento automático
useEffect(() => {
  if (isViewing || isEditing) {
    const pathParts = window.location.pathname.split('/');
    const locadorId = pathParts[pathParts.length - 1];
    carregarDadosLocador(parseInt(locadorId));
  }
}, [isViewing, isEditing]);

// Determinação de readonly
const isReadonly = isViewing;
```

#### **Backend: main.py - Rotas Locadores**
```python
@app.post("/api/locadores")
async def criar_locador(locador: LocadorCreate):
    try:
        resultado = inserir_locador_v2(locador.dict(exclude_none=True))
        return {"success": True, "data": resultado}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/locadores/{locador_id}")
async def obter_locador_por_id(locador_id: int):
    try:
        locador = buscar_locador_completo(locador_id)  # ❌ FALTA IMPLEMENTAR
        if locador:
            return {"data": locador, "success": True}
        else:
            raise HTTPException(status_code=404, detail="Locador não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/locadores/{locador_id}")
async def atualizar_locador(locador_id: int, locador: LocadorUpdate):
    try:
        dados_filtrados = {k: v for k, v in locador.dict().items() if v is not None}
        resultado = atualizar_locador_v2(locador_id, dados_filtrados)  # ❌ FALTA IMPLEMENTAR
        return {"success": True, "message": "Locador atualizado"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### **Repository: locador_repository_v2.py** ❌ **ARQUIVO FALTA**
```python
def buscar_locador_completo(locador_id):
    """Buscar locador com todas as tabelas relacionadas"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Query principal
        cursor.execute("""
            SELECT l.*
            FROM Locadores l
            WHERE l.id = ? AND l.ativo = 1
        """, (locador_id,))
        
        locador = cursor.fetchone()
        if not locador:
            return None
            
        # Buscar endereço
        cursor.execute("""
            SELECT * FROM EnderecoLocador
            WHERE id = ?
        """, (locador.endereco_id,))
        endereco = cursor.fetchone()
        
        # Buscar contas bancárias
        cursor.execute("""
            SELECT * FROM ContasBancariasLocador
            WHERE locador_id = ? AND ativo = 1
        """, (locador_id,))
        contas = cursor.fetchall()
        
        # Buscar representante legal
        cursor.execute("""
            SELECT * FROM RepresentanteLegalLocador
            WHERE id_locador = ?
        """, (locador_id,))
        representante = cursor.fetchone()
        
        return {
            "id": locador.id,
            "nome": locador.nome,
            # ... mapear todos os campos
            "endereco": endereco,
            "contas_bancarias": contas,
            "representante_legal": representante
        }
    except Exception as e:
        raise e

def inserir_locador_v2(dados):
    """Inserir locador com todas as tabelas relacionadas"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Transaction para garantir consistência
        cursor.execute("BEGIN TRANSACTION")
        
        # 1. Inserir locador principal
        cursor.execute("""
            INSERT INTO Locadores (nome, cpf_cnpj, telefone, email, ...)
            VALUES (?, ?, ?, ?, ...)
        """, (...))
        
        locador_id = cursor.lastrowid
        
        # 2. Inserir endereço se fornecido
        if dados.get('endereco'):
            cursor.execute("""
                INSERT INTO EnderecoLocador (rua, numero, ...)
                VALUES (?, ?, ...)
            """, (...))
            endereco_id = cursor.lastrowid
            
            # Atualizar referência no locador
            cursor.execute("""
                UPDATE Locadores SET endereco_id = ? WHERE id = ?
            """, (endereco_id, locador_id))
        
        # 3. Inserir contas bancárias
        if dados.get('contas_bancarias'):
            for conta in dados['contas_bancarias']:
                cursor.execute("""
                    INSERT INTO ContasBancariasLocador (locador_id, banco, ...)
                    VALUES (?, ?, ...)
                """, (locador_id, ...))
        
        # 4. Inserir representante legal
        if dados.get('representante_legal'):
            cursor.execute("""
                INSERT INTO RepresentanteLegalLocador (id_locador, nome, ...)
                VALUES (?, ?, ...)
            """, (locador_id, ...))
        
        cursor.execute("COMMIT")
        return {"success": True, "id": locador_id}
        
    except Exception as e:
        cursor.execute("ROLLBACK")
        raise e

def atualizar_locador_v2(locador_id, dados):
    """Atualizar locador com todas as tabelas relacionadas"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        cursor.execute("BEGIN TRANSACTION")
        
        # 1. Atualizar locador principal
        campos = []
        valores = []
        for campo, valor in dados.items():
            if campo not in ['endereco', 'contas_bancarias', 'representante_legal']:
                campos.append(f"{campo} = ?")
                valores.append(valor)
        
        if campos:
            cursor.execute(f"""
                UPDATE Locadores 
                SET {', '.join(campos)}, data_atualizacao = GETDATE()
                WHERE id = ?
            """, valores + [locador_id])
        
        # 2. Atualizar endereço
        if dados.get('endereco'):
            # Verificar se já existe endereço
            cursor.execute("""
                SELECT endereco_id FROM Locadores WHERE id = ?
            """, (locador_id,))
            endereco_id = cursor.fetchone()[0]
            
            if endereco_id:
                # Atualizar existente
                cursor.execute("""
                    UPDATE EnderecoLocador SET rua = ?, numero = ? ... WHERE id = ?
                """, (..., endereco_id))
            else:
                # Criar novo
                cursor.execute("""
                    INSERT INTO EnderecoLocador (rua, numero, ...)
                    VALUES (?, ?, ...)
                """, (...))
                endereco_id = cursor.lastrowid
                cursor.execute("""
                    UPDATE Locadores SET endereco_id = ? WHERE id = ?
                """, (endereco_id, locador_id))
        
        cursor.execute("COMMIT")
        return {"success": True}
        
    except Exception as e:
        cursor.execute("ROLLBACK")
        raise e
```

---

## 4. PROBLEMAS ATUAIS NO LOCADOR

### ❌ **ARQUIVO FALTANTE**
- `locacao/repositories/locador_repository_v2.py` **NÃO EXISTE**
- Mas é chamado em `apis/perfil_locador_api.py`:
  ```python
  from locacao.repositories.locador_repository_v2 import buscar_locador_completo, inserir_locador_v2
  ```

### ❌ **ROTAS API INCOMPLETAS**
- `main.py` não tem rotas `/api/locadores/{id}` específicas
- Falta integração com `perfil_locador_api.py`

### ❌ **FRONTEND DESCONECTADO**
- `ModernLocadorFormV2.tsx` tenta buscar dados mas API falha
- Não utiliza tabelas relacionadas (`RepresentanteLegalLocador`, `ContasBancariasLocador`, `EnderecoLocador`)

---

## 5. PLANO DE IMPLEMENTAÇÃO

### 🚀 **FASE 1: BACKEND**
1. **Criar `locador_repository_v2.py`** com todas as funções necessárias
2. **Integrar rotas no `main.py`** seguindo padrão dos contratos
3. **Testar APIs** com Postman/Thunder Client

### 🚀 **FASE 2: FRONTEND**
4. **Corrigir carregamento de dados** no `ModernLocadorFormV2.tsx`
5. **Implementar salvamento** das tabelas relacionadas
6. **Adicionar telas de loading/erro** como nos contratos

### 🚀 **FASE 3: TESTES**
7. **Testar fluxo completo** de cadastro/edição/visualização
8. **Validar integridade** dos dados nas tabelas relacionadas

---

## 6. DIFERENÇAS CONTRATOS vs LOCADORES

| Aspecto | **CONTRATOS** ✅ | **LOCADORES** ❌ |
|---------|------------------|-------------------|
| Repository completo | `contrato_repository.py` existe | `locador_repository_v2.py` FALTA |
| APIs funcionando | `/api/contratos/*` OK | `/api/locadores/{id}` FALTA |
| Tabelas relacionadas | Implementado | Falta conectar |
| Frontend carregamento | Funciona | Falha na API |
| Telas loading/erro | Implementadas | Implementadas |
| Salvamento múltiplas tabelas | Funciona | Não implementado |

---

## 7. CONCLUSÃO

O **módulo de contratos** está **100% funcional** e serve como **modelo perfeito** para implementar o módulo de locadores. 

**Principal gargalo**: Falta o arquivo `locador_repository_v2.py` que é a ponte entre o frontend e o banco de dados.

**Próximo passo**: Criar esse repository seguindo exatamente o padrão dos contratos, mas adaptado para as tabelas de locadores (`Locadores`, `EnderecoLocador`, `ContasBancariasLocador`, `RepresentanteLegalLocador`).