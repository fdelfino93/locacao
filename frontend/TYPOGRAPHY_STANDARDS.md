# Padrões de Tipografia - Sistema de Design

Este documento define os padrões hierárquicos de tipografia implementados em todo o sistema.

## 🎯 Hierarquia Padronizada de Títulos

### Níveis de Título

#### H1 - Título Principal de Páginas/Módulos
```html
<h1 className="text-2xl font-bold text-primary-foreground">
  Cadastro de Contrato
</h1>
```
- **Uso**: Título principal de cada módulo/página
- **Tamanho**: `text-2xl` (24px)
- **Peso**: `font-bold` (700)
- **Exemplos**: "Cadastro de Contrato", "Cadastro de Locador", "Prestação de Contas"

#### H2 - Título de Seções
```html
<h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
  <Users className="w-5 h-5 text-blue-600" />
  Partes do Contrato
</h2>
```
- **Uso**: Seções principais dentro dos formulários
- **Tamanho**: `text-xl` (20px)
- **Peso**: `font-semibold` (600)
- **Exemplos**: "Partes do Contrato", "Dados Financeiros", "Endereço"

#### H3 - Subtítulos
```html
<h3 className="text-lg font-semibold text-foreground">
  Dados Bancários do Corretor
</h3>
```
- **Uso**: Subseções e grupos de campos
- **Tamanho**: `text-lg` (18px)
- **Peso**: `font-semibold` (600)
- **Exemplos**: "Dados Bancários", "Pet 1", "Seguro Fiança"

#### H4 - Sub-subtítulos (Ocasional)
```html
<h4 className="text-base font-medium text-foreground">
  Informações Adicionais
</h4>
```
- **Uso**: Divisões menores quando necessário
- **Tamanho**: `text-base` (16px)
- **Peso**: `font-medium` (500)
- **Exemplos**: Labels descritivos, subdivisões específicas

## 📋 Implementação por Módulo

### ✅ Módulos Padronizados

#### 📄 Módulo Contrato
- **H1**: "Cadastro de Contrato" (`text-2xl font-bold`)
- **H2**: Seções das abas (`text-xl font-semibold`)
- **H3**: Subseções (`text-lg font-semibold`)

#### 👤 Módulo Locador
- **H1**: "Cadastro de Locador" (`text-2xl font-bold`)
- **H2**: Seções das abas (`text-xl font-semibold`)

#### 🏠 Módulo Imóvel
- **H1**: "Cadastro de Imóvel" (`text-2xl font-bold`)
- **H2**: Seções do formulário (`text-xl font-semibold`)

#### 👥 Módulo Locatário
- **H1**: "Cadastro de Locatário" (`text-2xl font-bold`)
- **H2**: Seções do formulário (`text-xl font-semibold`)
- **H3**: Subseções (`text-lg font-semibold`)

#### 💰 Módulo Prestação de Contas
- **H1**: "Prestação de Contas" (`text-2xl font-bold`)
- **H2**: Seções principais (`text-xl font-semibold`)

## 🎨 Complementos Visuais

### Ícones em Títulos
```html
<h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
  <Calendar className="w-5 h-5 text-blue-600" />
  Datas do Contrato
</h2>
```
- **Tamanho do ícone**: `w-5 h-5` (20px)
- **Cor**: `text-blue-600` ou cor temática apropriada
- **Espaçamento**: `gap-2` entre ícone e texto

### Cores por Contexto
- **Títulos principais**: `text-primary-foreground` (cabeçalhos com fundo colorido)
- **Títulos de seção**: `text-foreground` (conteúdo principal)
- **Subtítulos descritivos**: `text-muted-foreground` (informações secundárias)

## ✅ Checklist de Consistência

- [ ] Todos os títulos principais usam `text-2xl font-bold`
- [ ] Todas as seções usam `text-xl font-semibold`
- [ ] Todos os subtítulos usam `text-lg font-semibold`
- [ ] Ícones têm tamanho `w-5 h-5` consistente
- [ ] Cores seguem a hierarquia estabelecida
- [ ] Espaçamentos são consistentes (`gap-2`, `mb-2`, etc.)

## 🔄 Manutenção

Ao adicionar novos módulos ou seções:

1. **Seguir a hierarquia estabelecida**
2. **Usar as classes CSS definidas**
3. **Manter consistência visual**
4. **Testar em temas claro e escuro**

---

*Padrões implementados para garantir consistência visual e hierarquia clara em toda a aplicação.*