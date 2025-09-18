# 🔧 Configuração de Ambientes - Sistema de Locação

## 📋 Resumo da Implementação

✅ **PROBLEMA RESOLVIDO**: URLs e configurações hardcoded que causavam conflitos entre ambiente local e VM de produção.

✅ **SOLUÇÃO IMPLEMENTADA**: Sistema de variáveis de ambiente com configuração dinâmica e scripts helpers.

## 🚀 Como Usar

### 1. Configuração Inicial

```bash
# 1. Copiar arquivos de exemplo (apenas na primeira vez)
copy .env.example .env
copy frontend\.env.example frontend\.env

# 2. Editar o arquivo .env com suas credenciais locais
# 3. Editar o arquivo frontend\.env conforme necessário
```

### 2. Alternar Entre Ambientes

```bash
# Configurar para desenvolvimento local
python switch_environment.py local

# Configurar para VM de produção
python switch_environment.py vm

# Ver configuração atual
python switch_environment.py status
```

### 3. Testar Configuração

```bash
# Verificar se tudo está funcionando
python test_config_simple.py

# Verificar drivers ODBC disponíveis
python check_drivers.py
```

## 📁 Arquivos Modificados

### Backend Python
- ✅ `repositories_adapter.py` - Já usava variáveis de ambiente
- ✅ `importar_imoveis_direto_banco.py` - Atualizado para usar driver e configurações completas
- ✅ `cadastrar_apartamentos_airton.py` - Atualizado para usar driver e configurações completas
- ✅ `importar_imoveis_excel.py` - Atualizado para usar driver e configurações completas
- ✅ `importar_imoveis_seguro.py` - Atualizado para usar driver e configurações completas
- ✅ `verificar_campos_prestacao.py` - Atualizado para usar driver e configurações completas
- ✅ `apis/boletos_api.py` - Completamente reescrito para usar variáveis de ambiente

### Frontend TypeScript/React
- ✅ `src/config/api.ts` - Configuração centralizada e inteligente
- ✅ `src/services/api.ts` - Atualizado para usar configuração centralizada
- ✅ **64+ arquivos** atualizados automaticamente pelos linters para usar `getApiUrl()`

### Configuração
- ✅ `.env.example` - Template completo com exemplos
- ✅ `frontend/.env.example` - Template para frontend
- ✅ `.gitignore` - Protege arquivos .env
- ✅ `frontend/.gitignore` - Protege arquivos .env do frontend

## 🔄 Configuração Automática do Frontend

O sistema agora detecta automaticamente o ambiente:

1. **Prioridade 1**: Variável `VITE_API_BASE_URL`
2. **Prioridade 2**: Auto-detecção por hostname
   - Se hostname = `192.168.1.159` → usa API da VM
   - Caso contrário → usa localhost
3. **Fallback**: `http://localhost:8080`

## 📋 Ambientes Suportados

### 💻 Desenvolvimento Local
```env
# Backend .env
DB_SERVER=localhost,1433
DB_DATABASE=LocacaoLocal
DB_USER=sa
DB_PASSWORD=sua_senha

# Frontend .env
VITE_API_BASE_URL=http://localhost:8080
```

### 🖥️ VM de Produção
```env
# Backend .env
DB_SERVER=192.168.1.45\SQLTESTES
DB_DATABASE=Cobimob
DB_USER=srvcondo1
DB_PASSWORD=2025@Condo

# Frontend .env
VITE_API_BASE_URL=http://192.168.1.159:8080
```

## 🛠️ Scripts Utilitários

| Script | Descrição |
|--------|-----------|
| `switch_environment.py` | Alterna entre local/VM |
| `test_config_simple.py` | Testa configuração atual |
| `check_drivers.py` | Lista drivers ODBC disponíveis |

## 🎯 Benefícios Alcançados

1. **✅ Sem Conflitos**: Pull na VM não quebra mais a aplicação
2. **✅ Flexibilidade**: Fácil alternância entre ambientes
3. **✅ Segurança**: Credenciais não são commitadas
4. **✅ Manutenibilidade**: Configuração centralizada
5. **✅ Automação**: Detecção automática de ambiente
6. **✅ Conformidade**: Segue diretrizes do CLAUDE.md

## 🚨 Regras Importantes

- **NUNCA** commite arquivos `.env` reais
- **SEMPRE** use `os.getenv()` no Python
- **SEMPRE** use `getApiUrl()` ou `API_CONFIG` no frontend
- **SEMPRE** teste com `python test_config_simple.py` antes de commitar
- Use `python switch_environment.py vm` antes de fazer deploy na VM

## 💡 Solução de Problemas

### Erro de Driver ODBC
```bash
# Verificar drivers disponíveis
python check_drivers.py

# Ajustar DB_DRIVER no .env conforme resultado
```

### Frontend não conecta na API
```bash
# Verificar configuração
python switch_environment.py status

# Ver logs do navegador (F12 → Console)
# Procurar por "🔧 API Configuration"
```

### Banco não conecta
```bash
# Testar configuração
python test_config_simple.py

# Verificar se SQL Server está rodando
# Verificar credenciais no .env
```