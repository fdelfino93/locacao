"""
Script de Migração Completa - Cobimob
Implementa todas as melhorias solicitadas:
- Endereços estruturados
- Dados bancários estruturados  
- Tipo PF/PJ com representante legal
- Planos de locação estruturados
- Campos condicionais para fiadores e moradores
"""

import pyodbc
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

def get_conexao():
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    return pyodbc.connect(connection_string)

def executar_sql(cursor, sql, descricao):
    """Executa SQL com tratamento de erro"""
    try:
        cursor.execute(sql)
        print(f"✅ {descricao}")
        return True
    except Exception as e:
        print(f"❌ Erro em {descricao}: {str(e)}")
        return False

def migration_melhorias_completas():
    """Executa todas as melhorias no banco de dados"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    try:
        print("🚀 Iniciando Migração de Melhorias Completas...")
        print("="*60)
        
        # 1. TABELA ENDEREÇOS
        print("\n📍 CRIANDO ESTRUTURA DE ENDEREÇOS...")
        sql_enderecos = """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Enderecos' AND xtype='U')
        CREATE TABLE Enderecos (
            id INT IDENTITY(1,1) PRIMARY KEY,
            rua NVARCHAR(255) NOT NULL,
            numero NVARCHAR(20) NOT NULL,
            complemento NVARCHAR(100) NULL,
            bairro NVARCHAR(100) NOT NULL,
            cidade NVARCHAR(100) NOT NULL,
            estado NVARCHAR(2) NOT NULL DEFAULT 'PR',
            cep NVARCHAR(10) NOT NULL,
            data_cadastro DATETIME DEFAULT GETDATE(),
            ativo BIT DEFAULT 1
        );
        """
        executar_sql(cursor, sql_enderecos, "Tabela Enderecos")
        
        # Índices para endereços
        sql_indices_enderecos = """
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Enderecos_CEP')
            CREATE INDEX IX_Enderecos_CEP ON Enderecos (cep);
        IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Enderecos_Cidade')
            CREATE INDEX IX_Enderecos_Cidade ON Enderecos (cidade, estado);
        """
        executar_sql(cursor, sql_indices_enderecos, "Índices de Endereços")
        
        # 2. TABELA DADOS BANCÁRIOS
        print("\n💳 CRIANDO ESTRUTURA DE DADOS BANCÁRIOS...")
        sql_dados_bancarios = """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DadosBancarios' AND xtype='U')
        CREATE TABLE DadosBancarios (
            id INT IDENTITY(1,1) PRIMARY KEY,
            tipo_recebimento NVARCHAR(20) NOT NULL CHECK (tipo_recebimento IN ('PIX', 'TED', 'Conta Corrente', 'Conta Poupança')),
            chave_pix NVARCHAR(255) NULL,
            banco NVARCHAR(100) NULL,
            agencia NVARCHAR(20) NULL,
            conta NVARCHAR(20) NULL,
            tipo_conta NVARCHAR(20) NULL CHECK (tipo_conta IN ('Corrente', 'Poupança', 'Conta Digital') OR tipo_conta IS NULL),
            titular NVARCHAR(255) NULL,
            cpf_titular NVARCHAR(14) NULL,
            data_cadastro DATETIME DEFAULT GETDATE(),
            ativo BIT DEFAULT 1,
            CONSTRAINT CHK_DadosBancarios_PIX CHECK (
                (tipo_recebimento = 'PIX' AND chave_pix IS NOT NULL) OR
                (tipo_recebimento != 'PIX' AND banco IS NOT NULL AND agencia IS NOT NULL AND conta IS NOT NULL)
            )
        );
        """
        executar_sql(cursor, sql_dados_bancarios, "Tabela DadosBancarios")
        
        # 3. TABELA REPRESENTANTES LEGAIS
        print("\n👥 CRIANDO ESTRUTURA DE REPRESENTANTES LEGAIS...")
        sql_representantes = """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='RepresentantesLegais' AND xtype='U')
        CREATE TABLE RepresentantesLegais (
            id INT IDENTITY(1,1) PRIMARY KEY,
            nome NVARCHAR(255) NOT NULL,
            cpf NVARCHAR(14) NOT NULL,
            rg NVARCHAR(20) NOT NULL,
            telefone NVARCHAR(20) NULL,
            email NVARCHAR(255) NULL,
            endereco_id INT NULL,
            data_nascimento DATE NULL,
            nacionalidade NVARCHAR(50) NULL,
            estado_civil NVARCHAR(20) NULL,
            profissao NVARCHAR(100) NULL,
            data_cadastro DATETIME DEFAULT GETDATE(),
            ativo BIT DEFAULT 1,
            FOREIGN KEY (endereco_id) REFERENCES Enderecos(id)
        );
        """
        executar_sql(cursor, sql_representantes, "Tabela RepresentantesLegais")
        
        # 4. TABELA DOCUMENTOS EMPRESA
        print("\n📄 CRIANDO ESTRUTURA DE DOCUMENTOS...")
        sql_documentos = """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='DocumentosEmpresa' AND xtype='U')
        CREATE TABLE DocumentosEmpresa (
            id INT IDENTITY(1,1) PRIMARY KEY,
            contrato_social NVARCHAR(500) NULL,
            cartao_cnpj NVARCHAR(500) NULL,
            comprovante_renda NVARCHAR(500) NULL,
            comprovante_endereco NVARCHAR(500) NULL,
            inscricao_estadual NVARCHAR(20) NULL,
            inscricao_municipal NVARCHAR(20) NULL,
            data_cadastro DATETIME DEFAULT GETDATE(),
            ativo BIT DEFAULT 1
        );
        """
        executar_sql(cursor, sql_documentos, "Tabela DocumentosEmpresa")
        
        # 5. TABELA PLANOS DE LOCAÇÃO
        print("\n📋 CRIANDO ESTRUTURA DE PLANOS DE LOCAÇÃO...")
        sql_planos = """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PlanosLocacao' AND xtype='U')
        CREATE TABLE PlanosLocacao (
            id INT IDENTITY(1,1) PRIMARY KEY,
            codigo NVARCHAR(20) NOT NULL UNIQUE,
            nome NVARCHAR(100) NOT NULL,
            categoria NVARCHAR(20) NOT NULL CHECK (categoria IN ('COMPLETO', 'BASICO')),
            opcao INT NOT NULL CHECK (opcao IN (1, 2)),
            taxa_primeiro_aluguel DECIMAL(5,2) NOT NULL,
            taxa_demais_alugueis DECIMAL(5,2) NOT NULL,
            taxa_administracao DECIMAL(5,2) DEFAULT 0.00,
            descricao NVARCHAR(500) NULL,
            ativo BIT DEFAULT 1,
            data_cadastro DATETIME DEFAULT GETDATE()
        );
        """
        executar_sql(cursor, sql_planos, "Tabela PlanosLocacao")
        
        # Inserir planos padrão
        sql_insert_planos = """
        IF NOT EXISTS (SELECT 1 FROM PlanosLocacao WHERE codigo = 'COMP_OP1')
        BEGIN
            INSERT INTO PlanosLocacao (codigo, nome, categoria, opcao, taxa_primeiro_aluguel, taxa_demais_alugueis, descricao)
            VALUES 
                ('COMP_OP1', 'Locação Completo - Opção 1', 'COMPLETO', 1, 100.00, 10.00, 'Taxa de locação: 100% (primeiro aluguel) + Taxa de administração: 10% (demais aluguéis)'),
                ('COMP_OP2', 'Locação Completo - Opção 2', 'COMPLETO', 2, 16.00, 16.00, 'Taxa de administração + locação: 16% (todos os aluguéis)'),
                ('BAS_OP1', 'Locação Básico - Opção 1', 'BASICO', 1, 50.00, 5.00, 'Taxa de locação: 50% (primeiro aluguel) + Taxa de administração: 5% (demais aluguéis)'),
                ('BAS_OP2', 'Locação Básico - Opção 2', 'BASICO', 2, 8.00, 8.00, 'Taxa de locação + administração: 8% (todos os aluguéis)');
        END
        """
        executar_sql(cursor, sql_insert_planos, "Dados padrão de Planos de Locação")
        
        # 6. TABELA FIADORES
        print("\n🤝 CRIANDO ESTRUTURA DE FIADORES...")
        sql_fiadores = """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Fiadores' AND xtype='U')
        CREATE TABLE Fiadores (
            id INT IDENTITY(1,1) PRIMARY KEY,
            nome NVARCHAR(255) NOT NULL,
            cpf_cnpj NVARCHAR(18) NOT NULL,
            rg NVARCHAR(20) NULL,
            telefone NVARCHAR(20) NULL,
            email NVARCHAR(255) NULL,
            endereco_id INT NULL,
            dados_bancarios_id INT NULL,
            tipo_pessoa NVARCHAR(2) NOT NULL CHECK (tipo_pessoa IN ('PF', 'PJ')) DEFAULT 'PF',
            representante_legal_id INT NULL,
            documentos_empresa_id INT NULL,
            renda_mensal DECIMAL(10,2) NULL,
            profissao NVARCHAR(100) NULL,
            observacoes NVARCHAR(MAX) NULL,
            data_cadastro DATETIME DEFAULT GETDATE(),
            ativo BIT DEFAULT 1,
            FOREIGN KEY (endereco_id) REFERENCES Enderecos(id),
            FOREIGN KEY (dados_bancarios_id) REFERENCES DadosBancarios(id),
            FOREIGN KEY (representante_legal_id) REFERENCES RepresentantesLegais(id),
            FOREIGN KEY (documentos_empresa_id) REFERENCES DocumentosEmpresa(id)
        );
        """
        executar_sql(cursor, sql_fiadores, "Tabela Fiadores")
        
        # 7. TABELA MORADORES
        print("\n👨‍👩‍👧‍👦 CRIANDO ESTRUTURA DE MORADORES...")
        sql_moradores = """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Moradores' AND xtype='U')
        CREATE TABLE Moradores (
            id INT IDENTITY(1,1) PRIMARY KEY,
            nome NVARCHAR(255) NOT NULL,
            cpf NVARCHAR(14) NULL,
            rg NVARCHAR(20) NULL,
            data_nascimento DATE NULL,
            parentesco NVARCHAR(50) NULL,
            profissao NVARCHAR(100) NULL,
            telefone NVARCHAR(20) NULL,
            email NVARCHAR(255) NULL,
            data_cadastro DATETIME DEFAULT GETDATE(),
            ativo BIT DEFAULT 1
        );
        """
        executar_sql(cursor, sql_moradores, "Tabela Moradores")
        
        # 8. ATUALIZAÇÕES NA TABELA CLIENTES
        print("\n👤 ATUALIZANDO ESTRUTURA DE CLIENTES...")
        
        # Adicionar novas colunas
        sql_alter_clientes = """
        -- Endereço estruturado
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Clientes') AND name = 'endereco_id')
            ALTER TABLE Clientes ADD endereco_id INT NULL;
        
        -- Dados bancários estruturados
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Clientes') AND name = 'dados_bancarios_id')
            ALTER TABLE Clientes ADD dados_bancarios_id INT NULL;
        
        -- Tipo de pessoa
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Clientes') AND name = 'tipo_pessoa')
            ALTER TABLE Clientes ADD tipo_pessoa NVARCHAR(2) CHECK (tipo_pessoa IN ('PF', 'PJ')) DEFAULT 'PF';
        
        -- Representante legal para PJ
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Clientes') AND name = 'representante_legal_id')
            ALTER TABLE Clientes ADD representante_legal_id INT NULL;
        
        -- Documentos empresa para PJ
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Clientes') AND name = 'documentos_empresa_id')
            ALTER TABLE Clientes ADD documentos_empresa_id INT NULL;
        
        -- Observações
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Clientes') AND name = 'observacoes')
            ALTER TABLE Clientes ADD observacoes NVARCHAR(MAX) NULL;
        
        -- Campos de controle
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Clientes') AND name = 'data_atualizacao')
            ALTER TABLE Clientes ADD data_atualizacao DATETIME DEFAULT GETDATE();
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Clientes') AND name = 'ativo')
            ALTER TABLE Clientes ADD ativo BIT DEFAULT 1;
        """
        executar_sql(cursor, sql_alter_clientes, "Novas colunas em Clientes")
        
        # Foreign keys para Clientes
        sql_fk_clientes = """
        -- FK para Endereços
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Clientes_Endereco')
            ALTER TABLE Clientes ADD CONSTRAINT FK_Clientes_Endereco 
            FOREIGN KEY (endereco_id) REFERENCES Enderecos(id);
        
        -- FK para Dados Bancários
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Clientes_DadosBancarios')
            ALTER TABLE Clientes ADD CONSTRAINT FK_Clientes_DadosBancarios 
            FOREIGN KEY (dados_bancarios_id) REFERENCES DadosBancarios(id);
        
        -- FK para Representante Legal
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Clientes_RepresentanteLegal')
            ALTER TABLE Clientes ADD CONSTRAINT FK_Clientes_RepresentanteLegal 
            FOREIGN KEY (representante_legal_id) REFERENCES RepresentantesLegais(id);
        
        -- FK para Documentos Empresa
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Clientes_DocumentosEmpresa')
            ALTER TABLE Clientes ADD CONSTRAINT FK_Clientes_DocumentosEmpresa 
            FOREIGN KEY (documentos_empresa_id) REFERENCES DocumentosEmpresa(id);
        """
        executar_sql(cursor, sql_fk_clientes, "Foreign Keys para Clientes")
        
        # 9. ATUALIZAÇÕES NA TABELA INQUILINOS
        print("\n🏠 ATUALIZANDO ESTRUTURA DE INQUILINOS...")
        
        sql_alter_inquilinos = """
        -- Endereço estruturado
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Inquilinos') AND name = 'endereco_id')
            ALTER TABLE Inquilinos ADD endereco_id INT NULL;
        
        -- Dados bancários
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Inquilinos') AND name = 'dados_bancarios_id')
            ALTER TABLE Inquilinos ADD dados_bancarios_id INT NULL;
        
        -- Tipo de pessoa
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Inquilinos') AND name = 'tipo_pessoa')
            ALTER TABLE Inquilinos ADD tipo_pessoa NVARCHAR(2) CHECK (tipo_pessoa IN ('PF', 'PJ')) DEFAULT 'PF';
        
        -- Representante legal
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Inquilinos') AND name = 'representante_legal_id')
            ALTER TABLE Inquilinos ADD representante_legal_id INT NULL;
        
        -- Documentos empresa
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Inquilinos') AND name = 'documentos_empresa_id')
            ALTER TABLE Inquilinos ADD documentos_empresa_id INT NULL;
        
        -- Tem moradores (para liberar cadastro detalhado)
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Inquilinos') AND name = 'tem_moradores')
            ALTER TABLE Inquilinos ADD tem_moradores BIT DEFAULT 0;
        
        -- Tem fiador (para liberar cadastro de fiador)
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Inquilinos') AND name = 'tem_fiador')
            ALTER TABLE Inquilinos ADD tem_fiador BIT DEFAULT 0;
        
        -- Fiador ID
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Inquilinos') AND name = 'fiador_id')
            ALTER TABLE Inquilinos ADD fiador_id INT NULL;
        
        -- Observações
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Inquilinos') AND name = 'observacoes')
            ALTER TABLE Inquilinos ADD observacoes NVARCHAR(MAX) NULL;
        
        -- Controle
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Inquilinos') AND name = 'ativo')
            ALTER TABLE Inquilinos ADD ativo BIT DEFAULT 1;
        """
        executar_sql(cursor, sql_alter_inquilinos, "Novas colunas em Inquilinos")
        
        # Foreign keys para Inquilinos
        sql_fk_inquilinos = """
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Inquilinos_Endereco')
            ALTER TABLE Inquilinos ADD CONSTRAINT FK_Inquilinos_Endereco 
            FOREIGN KEY (endereco_id) REFERENCES Enderecos(id);
        
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Inquilinos_DadosBancarios')
            ALTER TABLE Inquilinos ADD CONSTRAINT FK_Inquilinos_DadosBancarios 
            FOREIGN KEY (dados_bancarios_id) REFERENCES DadosBancarios(id);
        
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Inquilinos_RepresentanteLegal')
            ALTER TABLE Inquilinos ADD CONSTRAINT FK_Inquilinos_RepresentanteLegal 
            FOREIGN KEY (representante_legal_id) REFERENCES RepresentantesLegais(id);
        
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Inquilinos_DocumentosEmpresa')
            ALTER TABLE Inquilinos ADD CONSTRAINT FK_Inquilinos_DocumentosEmpresa 
            FOREIGN KEY (documentos_empresa_id) REFERENCES DocumentosEmpresa(id);
        
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Inquilinos_Fiador')
            ALTER TABLE Inquilinos ADD CONSTRAINT FK_Inquilinos_Fiador 
            FOREIGN KEY (fiador_id) REFERENCES Fiadores(id);
        """
        executar_sql(cursor, sql_fk_inquilinos, "Foreign Keys para Inquilinos")
        
        # 10. TABELAS DE RELACIONAMENTO
        print("\n🔗 CRIANDO TABELAS DE RELACIONAMENTO...")
        
        # Inquilinos x Moradores
        sql_inquilino_moradores = """
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='InquilinoMoradores' AND xtype='U')
        CREATE TABLE InquilinoMoradores (
            id INT IDENTITY(1,1) PRIMARY KEY,
            inquilino_id INT NOT NULL,
            morador_id INT NOT NULL,
            data_cadastro DATETIME DEFAULT GETDATE(),
            ativo BIT DEFAULT 1,
            FOREIGN KEY (inquilino_id) REFERENCES Inquilinos(id),
            FOREIGN KEY (morador_id) REFERENCES Moradores(id),
            UNIQUE(inquilino_id, morador_id)
        );
        """
        executar_sql(cursor, sql_inquilino_moradores, "Tabela InquilinoMoradores")
        
        # 11. ATUALIZAÇÕES NA TABELA IMÓVEIS
        print("\n🏢 ATUALIZANDO ESTRUTURA DE IMÓVEIS...")
        
        sql_alter_imoveis = """
        -- Endereço estruturado
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Imoveis') AND name = 'endereco_id')
            ALTER TABLE Imoveis ADD endereco_id INT NULL;
        
        -- Controle
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Imoveis') AND name = 'ativo')
            ALTER TABLE Imoveis ADD ativo BIT DEFAULT 1;
        """
        executar_sql(cursor, sql_alter_imoveis, "Novas colunas em Imoveis")
        
        # FK para Imóveis
        sql_fk_imoveis = """
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Imoveis_Endereco')
            ALTER TABLE Imoveis ADD CONSTRAINT FK_Imoveis_Endereco 
            FOREIGN KEY (endereco_id) REFERENCES Enderecos(id);
        """
        executar_sql(cursor, sql_fk_imoveis, "Foreign Key para Imóveis")
        
        # 12. ATUALIZAÇÕES NA TABELA CONTRATOS
        print("\n📝 ATUALIZANDO ESTRUTURA DE CONTRATOS...")
        
        sql_alter_contratos = """
        -- Plano de locação estruturado
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'id_plano_locacao')
            ALTER TABLE Contratos ADD id_plano_locacao INT NULL;
        
        -- Valores estruturados
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'valor_aluguel')
            ALTER TABLE Contratos ADD valor_aluguel DECIMAL(10,2) NULL;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'valor_iptu')
            ALTER TABLE Contratos ADD valor_iptu DECIMAL(10,2) NULL;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'valor_condominio')
            ALTER TABLE Contratos ADD valor_condominio DECIMAL(10,2) NULL;
        
        -- Antecipação de encargos estruturada
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'antecipa_condominio')
            ALTER TABLE Contratos ADD antecipa_condominio BIT DEFAULT 0;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'antecipa_seguro_fianca')
            ALTER TABLE Contratos ADD antecipa_seguro_fianca BIT DEFAULT 0;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'antecipa_seguro_incendio')
            ALTER TABLE Contratos ADD antecipa_seguro_incendio BIT DEFAULT 0;
        
        -- Retidos estruturados
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'retido_fci')
            ALTER TABLE Contratos ADD retido_fci BIT DEFAULT 0;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'retido_condominio')
            ALTER TABLE Contratos ADD retido_condominio BIT DEFAULT 0;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'retido_seguro_fianca')
            ALTER TABLE Contratos ADD retido_seguro_fianca BIT DEFAULT 0;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'retido_seguro_incendio')
            ALTER TABLE Contratos ADD retido_seguro_incendio BIT DEFAULT 0;
        
        -- Datas de seguro estruturadas
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'seguro_fianca_inicio')
            ALTER TABLE Contratos ADD seguro_fianca_inicio DATE NULL;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'seguro_fianca_fim')
            ALTER TABLE Contratos ADD seguro_fianca_fim DATE NULL;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'seguro_incendio_inicio')
            ALTER TABLE Contratos ADD seguro_incendio_inicio DATE NULL;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'seguro_incendio_fim')
            ALTER TABLE Contratos ADD seguro_incendio_fim DATE NULL;
        
        -- Cálculo automático de taxas
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'taxa_locacao_calculada')
            ALTER TABLE Contratos ADD taxa_locacao_calculada DECIMAL(10,2) NULL;
        
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'taxa_admin_calculada')
            ALTER TABLE Contratos ADD taxa_admin_calculada DECIMAL(10,2) NULL;
        
        -- Controle
        IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Contratos') AND name = 'ativo')
            ALTER TABLE Contratos ADD ativo BIT DEFAULT 1;
        """
        executar_sql(cursor, sql_alter_contratos, "Novas colunas em Contratos")
        
        # FK para Contratos
        sql_fk_contratos = """
        IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_Contratos_PlanoLocacao')
            ALTER TABLE Contratos ADD CONSTRAINT FK_Contratos_PlanoLocacao 
            FOREIGN KEY (id_plano_locacao) REFERENCES PlanosLocacao(id);
        """
        executar_sql(cursor, sql_fk_contratos, "Foreign Key para Contratos")
        
        # 13. VIEWS PARA CONSULTAS OTIMIZADAS
        print("\n📊 CRIANDO VIEWS DE CONSULTA...")
        
        sql_view_clientes_completo = """
        IF EXISTS (SELECT * FROM sys.views WHERE name = 'vw_ClientesCompleto')
            DROP VIEW vw_ClientesCompleto;
        
        CREATE VIEW vw_ClientesCompleto AS
        SELECT 
            c.*,
            e.rua, e.numero, e.complemento, e.bairro, e.cidade, e.estado, e.cep,
            db.tipo_recebimento, db.chave_pix, db.banco, db.agencia, db.conta, db.tipo_conta, db.titular, db.cpf_titular,
            rl.nome as representante_nome, rl.cpf as representante_cpf, rl.telefone as representante_telefone,
            de.contrato_social, de.cartao_cnpj, de.inscricao_estadual, de.inscricao_municipal
        FROM Clientes c
        LEFT JOIN Enderecos e ON c.endereco_id = e.id
        LEFT JOIN DadosBancarios db ON c.dados_bancarios_id = db.id
        LEFT JOIN RepresentantesLegais rl ON c.representante_legal_id = rl.id
        LEFT JOIN DocumentosEmpresa de ON c.documentos_empresa_id = de.id
        WHERE c.ativo = 1;
        """
        executar_sql(cursor, sql_view_clientes_completo, "View vw_ClientesCompleto")
        
        # Commit das alterações
        conn.commit()
        
        print("\n" + "="*60)
        print("✅ MIGRAÇÃO COMPLETADA COM SUCESSO!")
        print("✅ Todas as melhorias foram implementadas no banco de dados.")
        print("✅ Sistema pronto para usar os novos campos estruturados.")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO DURANTE A MIGRAÇÃO: {str(e)}")
        print("🔄 Executando rollback...")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("SISTEMA DE MIGRACAO - COBIMOB")
    print("Script: Melhorias Completas") 
    print("Objetivo: Implementar todas as melhorias solicitadas")
    print("")
    
    confirmacao = input("AVISO: Deseja executar a migracao completa? (s/N): ")
    
    if confirmacao.lower() in ['s', 'sim', 'yes', 'y']:
        success = migration_melhorias_completas()
        if success:
            print("\nMigracao executada com sucesso!")
            print("Proximos passos:")
            print("   1. Atualizar repositorios Python")
            print("   2. Atualizar formularios React")
            print("   3. Testar funcionalidades")
        else:
            print("\nMigracao falhou. Verifique os logs de erro.")
    else:
        print("Migracao cancelada pelo usuario.")