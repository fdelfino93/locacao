-- Fase 1: Criação das Novas Tabelas para Multilocação e Controle de Acesso

-- Tabela para armazenar as empresas clientes
CREATE TABLE [dbo].[Empresas](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [nome] [nvarchar](200) NOT NULL,
    [cnpj] [nvarchar](18) NULL,
    [data_cadastro] [datetime] NOT NULL DEFAULT GETDATE(),
    [ativo] [bit] NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Empresas] PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

-- Tabela para os perfis (roles) de usuário dentro de cada empresa
CREATE TABLE [dbo].[Perfis](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [empresa_id] [int] NOT NULL,
    [nome] [nvarchar](100) NOT NULL,
    [descricao] [nvarchar](500) NULL,
    [ativo] [bit] NOT NULL DEFAULT 1,
    CONSTRAINT [PK_Perfis] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [FK_Perfis_Empresas] FOREIGN KEY ([empresa_id]) REFERENCES [dbo].[Empresas]([id]) ON DELETE CASCADE
);
GO

-- Tabela para as permissões específicas do sistema
CREATE TABLE [dbo].[Permissoes](
    [id] [int] IDENTITY(1,1) NOT NULL,
    [nome] [nvarchar](100) NOT NULL, -- Ex: 'ver_contratos', 'editar_imoveis'
    [descricao] [nvarchar](500) NULL,
    CONSTRAINT [PK_Permissoes] PRIMARY KEY CLUSTERED ([id] ASC)
);
GO

-- Tabela de junção entre Perfis e Permissões (N-para-N)
CREATE TABLE [dbo].[PerfilPermissoes](
    [perfil_id] [int] NOT NULL,
    [permissao_id] [int] NOT NULL,
    CONSTRAINT [PK_PerfilPermissoes] PRIMARY KEY CLUSTERED ([perfil_id] ASC, [permissao_id] ASC),
    CONSTRAINT [FK_PerfilPermissoes_Perfis] FOREIGN KEY ([perfil_id]) REFERENCES [dbo].[Perfis]([id]) ON DELETE CASCADE,
    CONSTRAINT [FK_PerfilPermissoes_Permissoes] FOREIGN KEY ([permissao_id]) REFERENCES [dbo].[Permissoes]([id]) ON DELETE CASCADE
);
GO

-- Fase 2: Adicionar a coluna `empresa_id` nas tabelas existentes

-- Adicionar à tabela de Usuários e vincular a um perfil
ALTER TABLE [dbo].[Usuarios] ADD [empresa_id] [int];
ALTER TABLE [dbo].[Usuarios] ADD [perfil_id] [int];
GO

-- Adicionar chaves estrangeiras à tabela Usuarios
ALTER TABLE [dbo].[Usuarios] WITH CHECK ADD CONSTRAINT [FK_Usuarios_Empresas] FOREIGN KEY([empresa_id])
REFERENCES [dbo].[Empresas] ([id]);
GO
ALTER TABLE [dbo].[Usuarios] CHECK CONSTRAINT [FK_Usuarios_Empresas];
GO

ALTER TABLE [dbo].[Usuarios] WITH CHECK ADD CONSTRAINT [FK_Usuarios_Perfis] FOREIGN KEY([perfil_id])
REFERENCES [dbo].[Perfis] ([id]);
GO
ALTER TABLE [dbo].[Usuarios] CHECK CONSTRAINT [FK_Usuarios_Perfis];
GO

-- Adicionar `empresa_id` às tabelas principais de negócio
ALTER TABLE [dbo].[Locadores] ADD [empresa_id] [int];
ALTER TABLE [dbo].[Locatarios] ADD [empresa_id] [int];
ALTER TABLE [dbo].[Imoveis] ADD [empresa_id] [int];
ALTER TABLE [dbo].[Contratos] ADD [empresa_id] [int];
ALTER TABLE [dbo].[PrestacaoContas] ADD [empresa_id] [int];
ALTER TABLE [dbo].[HistoricoContratos] ADD [empresa_id] [int];
GO

-- Adicionar chaves estrangeiras para as tabelas de negócio
ALTER TABLE [dbo].[Locadores] WITH CHECK ADD CONSTRAINT [FK_Locadores_Empresas] FOREIGN KEY([empresa_id])
REFERENCES [dbo].[Empresas] ([id]);
GO
ALTER TABLE [dbo].[Locadores] CHECK CONSTRAINT [FK_Locadores_Empresas];
GO

ALTER TABLE [dbo].[Locatarios] WITH CHECK ADD CONSTRAINT [FK_Locatarios_Empresas] FOREIGN KEY([empresa_id])
REFERENCES [dbo].[Empresas] ([id]);
GO
ALTER TABLE [dbo].[Locatarios] CHECK CONSTRAINT [FK_Locatarios_Empresas];
GO

ALTER TABLE [dbo].[Imoveis] WITH CHECK ADD CONSTRAINT [FK_Imoveis_Empresas] FOREIGN KEY([empresa_id])
REFERENCES [dbo].[Empresas] ([id]);
GO
ALTER TABLE [dbo].[Imoveis] CHECK CONSTRAINT [FK_Imoveis_Empresas];
GO

ALTER TABLE [dbo].[Contratos] WITH CHECK ADD CONSTRAINT [FK_Contratos_Empresas] FOREIGN KEY([empresa_id])
REFERENCES [dbo].[Empresas] ([id]);
GO
ALTER TABLE [dbo].[Contratos] CHECK CONSTRAINT [FK_Contratos_Empresas];
GO

ALTER TABLE [dbo].[PrestacaoContas] WITH CHECK ADD CONSTRAINT [FK_PrestacaoContas_Empresas] FOREIGN KEY([empresa_id])
REFERENCES [dbo].[Empresas] ([id]);
GO
ALTER TABLE [dbo].[PrestacaoContas] CHECK CONSTRAINT [FK_PrestacaoContas_Empresas];
GO

ALTER TABLE [dbo].[HistoricoContratos] WITH CHECK ADD CONSTRAINT [FK_HistoricoContratos_Empresas] FOREIGN KEY([empresa_id])
REFERENCES [dbo].[Empresas] ([id]);
GO
ALTER TABLE [dbo].[HistoricoContratos] CHECK CONSTRAINT [FK_HistoricoContratos_Empresas];
GO

-- Fase 3: Popular dados iniciais (Exemplo para a primeira empresa)

-- Inserir a empresa principal (sua empresa)
INSERT INTO [dbo].[Empresas] (nome, cnpj, ativo) VALUES ('Minha Imobiliária Principal', '00.000.000/0001-00', 1);
GO

-- Obter o ID da empresa recém-criada
DECLARE @empresa_id_principal INT;
SET @empresa_id_principal = (SELECT id FROM [dbo].[Empresas] WHERE nome = 'Minha Imobiliária Principal');

-- Atualizar todos os registros existentes para pertencerem à empresa principal
UPDATE [dbo].[Usuarios] SET [empresa_id] = @empresa_id_principal;
UPDATE [dbo].[Locadores] SET [empresa_id] = @empresa_id_principal;
UPDATE [dbo].[Locatarios] SET [empresa_id] = @empresa_id_principal;
UPDATE [dbo].[Imoveis] SET [empresa_id] = @empresa_id_principal;
UPDATE [dbo].[Contratos] SET [empresa_id] = @empresa_id_principal;
UPDATE [dbo].[PrestacaoContas] SET [empresa_id] = @empresa_id_principal;
UPDATE [dbo].[HistoricoContratos] SET [empresa_id] = @empresa_id_principal;
GO

-- Criar um perfil de "Administrador" para a empresa principal
INSERT INTO [dbo].[Perfis] (empresa_id, nome, descricao) VALUES (@empresa_id_principal, 'Administrador', 'Acesso total ao sistema.');
GO

-- Vincular todos os usuários existentes ao perfil de Administrador
DECLARE @perfil_id_admin INT;
SET @perfil_id_admin = (SELECT id FROM [dbo].[Perfis] WHERE nome = 'Administrador' AND empresa_id = @empresa_id_principal);

UPDATE [dbo].[Usuarios] SET [perfil_id] = @perfil_id_admin WHERE [empresa_id] = @empresa_id_principal;
GO

PRINT 'Migração para multilocação concluída com sucesso!';
PRINT 'Todos os dados existentes foram associados à empresa principal.';
PRINT 'Todos os usuários foram definidos como Administradores.';
GO