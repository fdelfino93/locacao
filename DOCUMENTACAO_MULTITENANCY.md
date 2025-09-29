# Documentação do Sistema de Multilocação

Este documento detalha a implementação da arquitetura multilocatário, que permite que múltiplas empresas utilizem o sistema de forma isolada e segura.

## 1. Visão Geral da Arquitetura

O sistema foi transformado de uma aplicação de inquilino único para uma plataforma multilocatário. O princípio fundamental é o **isolamento de dados por empresa**, garantido em todas as camadas da aplicação, desde o banco de dados até a API.

Cada registro de negócio (locadores, locatários, imóveis, contratos, etc.) agora está associado a uma `empresa_id`, garantindo que uma empresa não possa, em nenhuma circunstância, acessar os dados de outra.

## 2. Modificações no Banco de Dados

Um novo script de migração, `script_add_multitenancy.sql`, foi criado para adaptar o banco de dados. Ele realiza as seguintes operações:

- **Criação da Tabela `Empresas`**:
  - Uma nova tabela `Empresas` foi adicionada para armazenar as informações de cada empresa cliente.
  - Campos: `id`, `nome`, `cnpj`, `data_cadastro`, `ativo`.

- **Adição da Coluna `empresa_id`**:
  - A coluna `empresa_id` foi adicionada a todas as tabelas de negócio relevantes, incluindo:
    - `Usuarios`
    - `Locadores`
    - `Locatarios`
    - `Imoveis`
    - `Contratos`
    - `PrestacaoContas`
    - `HistoricoContratos`
  - Esta coluna possui uma chave estrangeira que a vincula à tabela `Empresas`.

- **Controle de Acesso (RBAC)**:
  - Foram criadas as tabelas `Perfis` e `Permissoes` para permitir um controle de acesso baseado em funções (Role-Based Access Control) dentro de cada empresa. Isso permite que cada empresa defina seus próprios níveis de acesso (ex: Administrador, Gerente).

## 3. Sistema de Autenticação e Segurança

A segurança da plataforma é garantida por um sistema de autenticação baseado em **Tokens JWT (JSON Web Tokens)**.

- **Endpoint de Login (`POST /api/token`)**:
  - Os usuários se autenticam fornecendo email e senha.
  - Se as credenciais estiverem corretas, a API gera um token de acesso.
  - **Crucial**: O token contém o `empresa_id` do usuário, que é usado para filtrar todas as operações subsequentes.

- **Proteção de Endpoints**:
  - Todos os endpoints da API que manipulam dados de negócio agora são protegidos.
  - Para acessar esses endpoints, é necessário fornecer o token JWT no cabeçalho `Authorization` da requisição.
  - Uma dependência (`get_current_user`) extrai e valida o token, disponibilizando os dados do usuário (incluindo o `empresa_id`) para a lógica do endpoint.

## 4. Gerenciamento de Empresas

Foram adicionados novos endpoints para a administração das empresas na plataforma:

- `POST /api/empresas`: Cria uma nova empresa.
- `GET /api/empresas`: Lista todas as empresas cadastradas.
- `GET /api/empresas/{empresa_id}`: Busca os detalhes de uma empresa específica.
- `PUT /api/empresas/{empresa_id}`: Atualiza as informações de uma empresa.

**Nota:** Estes endpoints devem ser acessíveis apenas por usuários com permissões de superadministrador.

## 5. Fluxo de Operação

1.  **Cadastro de Empresa**: Um superadministrador cadastra uma nova empresa usando o endpoint `POST /api/empresas`.
2.  **Cadastro de Usuário**: Um usuário é criado e associado a essa nova empresa.
3.  **Login**: O usuário faz login através do endpoint `POST /api/token`, recebendo um token JWT que contém seu `empresa_id`.
4.  **Requisições à API**: Em todas as requisições subsequentes para a API (ex: listar locadores, criar um contrato), o usuário envia o token JWT.
5.  **Isolamento de Dados**: A API valida o token, extrai o `empresa_id` e o utiliza para filtrar todas as consultas ao banco de dados, garantindo que o usuário veja e manipule apenas os dados de sua própria empresa.