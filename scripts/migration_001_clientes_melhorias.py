"""
Migration 001: Melhorias no modelo Cliente
- Separar endereço em campos individuais
- Expandir dados financeiros 
- Melhorar classificação PF/PJ
- Adicionar tabelas relacionadas
"""
import pyodbc
import os
from dotenv import load_dotenv
import re

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

def criar_novas_tabelas():
    """Cria as novas tabelas para melhorias"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    try:
        # Tabela para endereços estruturados
        cursor.execute("""
            CREATE TABLE Enderecos (
                id int IDENTITY(1,1) PRIMARY KEY,
                rua nvarchar(255) NULL,
                numero nvarchar(20) NULL,
                complemento nvarchar(100) NULL,
                bairro nvarchar(100) NULL,
                cidade nvarchar(100) NULL,
                estado nvarchar(2) NULL,
                cep nvarchar(10) NULL,
                endereco_completo nvarchar(500) NULL -- Para backup do endereço original
            )
        """)
        print("OK Tabela Enderecos criada")
        
        # Tabela para dados bancários estruturados
        cursor.execute("""
            CREATE TABLE DadosBancarios (
                id int IDENTITY(1,1) PRIMARY KEY,
                tipo_recebimento nvarchar(20) NULL,
                chave_pix nvarchar(255) NULL,
                banco nvarchar(100) NULL,
                agencia nvarchar(20) NULL,
                conta nvarchar(30) NULL,
                tipo_conta nvarchar(20) NULL,
                titular nvarchar(255) NULL,
                cpf_titular nvarchar(14) NULL
            )
        """)
        print("OK Tabela DadosBancarios criada")
        
        # Tabela para representantes legais (PJ)
        cursor.execute("""
            CREATE TABLE RepresentantesLegais (
                id int IDENTITY(1,1) PRIMARY KEY,
                cliente_id int NULL,
                nome nvarchar(255) NULL,
                cpf nvarchar(14) NULL,
                rg nvarchar(20) NULL,
                cargo nvarchar(100) NULL,
                email nvarchar(255) NULL,
                telefone nvarchar(20) NULL,
                endereco_id int NULL,
                FOREIGN KEY (endereco_id) REFERENCES Enderecos(id)
            )
        """)
        print("OK Tabela RepresentantesLegais criada")
        
        # Tabela para documentos de empresas
        cursor.execute("""
            CREATE TABLE DocumentosEmpresa (
                id int IDENTITY(1,1) PRIMARY KEY,
                cliente_id int NULL,
                contrato_social nvarchar(255) NULL, -- Caminho do arquivo
                cartao_cnpj nvarchar(255) NULL,
                comprovante_renda nvarchar(255) NULL,
                comprovante_endereco nvarchar(255) NULL,
                outros_documentos nvarchar(500) NULL,
                data_upload datetime DEFAULT GETDATE()
            )
        """)
        print("OK Tabela DocumentosEmpresa criada")
        
        conn.commit()
        
    except Exception as e:
        print(f"ERRO ao criar tabelas: {e}")
        conn.rollback()
    finally:
        conn.close()

def adicionar_colunas_clientes():
    """Adiciona as novas colunas à tabela Clientes"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    try:
        # Novas colunas para melhorias
        novas_colunas = [
            "endereco_id int NULL",
            "dados_bancarios_id int NULL", 
            "tipo_pessoa nvarchar(2) NULL",  # PF ou PJ
            "observacoes nvarchar(1000) NULL",
            "data_criacao datetime DEFAULT GETDATE()",
            "data_atualizacao datetime DEFAULT GETDATE()"
        ]
        
        for coluna in novas_colunas:
            try:
                cursor.execute(f"ALTER TABLE Clientes ADD {coluna}")
                print(f"✓ Coluna adicionada: {coluna.split()[0]}")
            except Exception as e:
                if "already exists" in str(e) or "já existe" in str(e):
                    print(f"⚠ Coluna já existe: {coluna.split()[0]}")
                else:
                    print(f"❌ Erro ao adicionar coluna {coluna}: {e}")
        
        # Adicionar foreign keys
        try:
            cursor.execute("""
                ALTER TABLE Clientes 
                ADD CONSTRAINT FK_Clientes_Endereco 
                FOREIGN KEY (endereco_id) REFERENCES Enderecos(id)
            """)
            print("✓ FK para Enderecos adicionada")
        except Exception as e:
            print(f"⚠ FK Enderecos: {e}")
            
        try:
            cursor.execute("""
                ALTER TABLE Clientes 
                ADD CONSTRAINT FK_Clientes_DadosBancarios 
                FOREIGN KEY (dados_bancarios_id) REFERENCES DadosBancarios(id)
            """)
            print("✓ FK para DadosBancarios adicionada")
        except Exception as e:
            print(f"⚠ FK DadosBancarios: {e}")
        
        conn.commit()
        
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        conn.rollback()
    finally:
        conn.close()

def migrar_dados_existentes():
    """Migra os dados existentes para a nova estrutura"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    try:
        # Buscar clientes existentes
        cursor.execute("""
            SELECT id, endereco, tipo_recebimento, conta_bancaria, cpf_cnpj
            FROM Clientes 
            WHERE endereco IS NOT NULL OR tipo_recebimento IS NOT NULL
        """)
        
        clientes = cursor.fetchall()
        print(f"📋 Migrando {len(clientes)} clientes...")
        
        for cliente in clientes:
            cliente_id, endereco_original, tipo_recebimento, conta_bancaria, cpf_cnpj = cliente
            
            endereco_id = None
            dados_bancarios_id = None
            
            # Migrar endereço
            if endereco_original:
                endereco_id = migrar_endereco(cursor, endereco_original)
            
            # Migrar dados bancários
            if tipo_recebimento or conta_bancaria:
                dados_bancarios_id = migrar_dados_bancarios(cursor, tipo_recebimento, conta_bancaria)
            
            # Determinar tipo de pessoa baseado no CPF/CNPJ
            tipo_pessoa = 'PF' if cpf_cnpj and len(cpf_cnpj.replace('.', '').replace('-', '').replace('/', '')) == 11 else 'PJ'
            
            # Atualizar cliente com novos IDs
            cursor.execute("""
                UPDATE Clientes 
                SET endereco_id = ?, dados_bancarios_id = ?, tipo_pessoa = ?
                WHERE id = ?
            """, (endereco_id, dados_bancarios_id, tipo_pessoa, cliente_id))
            
            print(f"  ✓ Cliente {cliente_id} migrado")
        
        conn.commit()
        print("✅ Migração de dados concluída!")
        
    except Exception as e:
        print(f"❌ Erro na migração: {e}")
        conn.rollback()
    finally:
        conn.close()

def migrar_endereco(cursor, endereco_original):
    """Migra um endereço para a estrutura separada"""
    if not endereco_original:
        return None
    
    # Tentar extrair componentes do endereço (regex básico)
    endereco_parts = extrair_componentes_endereco(endereco_original)
    
    cursor.execute("""
        INSERT INTO Enderecos (rua, numero, bairro, cidade, cep, endereco_completo)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        endereco_parts.get('rua'),
        endereco_parts.get('numero'), 
        endereco_parts.get('bairro'),
        endereco_parts.get('cidade'),
        endereco_parts.get('cep'),
        endereco_original
    ))
    
    cursor.execute("SELECT @@IDENTITY")
    return cursor.fetchone()[0]

def migrar_dados_bancarios(cursor, tipo_recebimento, conta_bancaria):
    """Migra dados bancários para estrutura separada"""
    if not tipo_recebimento and not conta_bancaria:
        return None
    
    cursor.execute("""
        INSERT INTO DadosBancarios (tipo_recebimento, banco, agencia, conta)
        VALUES (?, ?, ?, ?)
    """, (
        tipo_recebimento,
        None,  # banco - será preenchido manualmente após migração
        None,  # agencia 
        conta_bancaria
    ))
    
    cursor.execute("SELECT @@IDENTITY")
    return cursor.fetchone()[0]

def extrair_componentes_endereco(endereco):
    """Extrai componentes básicos do endereço usando regex"""
    componentes = {
        'rua': None,
        'numero': None,
        'bairro': None,
        'cidade': None,
        'cep': None
    }
    
    # Regex para CEP (formato: 12345-678 ou 12345678)
    cep_match = re.search(r'(\d{5}-?\d{3})', endereco)
    if cep_match:
        componentes['cep'] = cep_match.group(1)
    
    # Regex básico para número (sequência de dígitos)
    numero_match = re.search(r',\s*(\d+)', endereco)
    if numero_match:
        componentes['numero'] = numero_match.group(1)
        # Extrair rua (parte antes do número)
        rua_match = re.search(r'^([^,]+)', endereco)
        if rua_match:
            componentes['rua'] = rua_match.group(1).strip()
    
    return componentes

def criar_indices():
    """Cria índices para melhor performance"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    indices = [
        "CREATE INDEX IX_Clientes_TipoPessoa ON Clientes(tipo_pessoa)",
        "CREATE INDEX IX_Clientes_EnderecoId ON Clientes(endereco_id)",
        "CREATE INDEX IX_Enderecos_CEP ON Enderecos(cep)",
        "CREATE INDEX IX_Enderecos_Cidade ON Enderecos(cidade)"
    ]
    
    for indice in indices:
        try:
            cursor.execute(indice)
            print(f"✓ Índice criado: {indice.split()[-1]}")
        except Exception as e:
            print(f"⚠ Índice já existe ou erro: {e}")
    
    conn.commit()
    conn.close()

def rollback_migration():
    """Rollback da migração (remover colunas e tabelas)"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    print("🔄 Executando rollback da migração...")
    
    try:
        # Remover foreign keys
        cursor.execute("ALTER TABLE Clientes DROP CONSTRAINT FK_Clientes_Endereco")
        cursor.execute("ALTER TABLE Clientes DROP CONSTRAINT FK_Clientes_DadosBancarios")
        
        # Remover colunas adicionadas
        cursor.execute("ALTER TABLE Clientes DROP COLUMN endereco_id")
        cursor.execute("ALTER TABLE Clientes DROP COLUMN dados_bancarios_id")
        cursor.execute("ALTER TABLE Clientes DROP COLUMN tipo_pessoa")
        cursor.execute("ALTER TABLE Clientes DROP COLUMN observacoes")
        cursor.execute("ALTER TABLE Clientes DROP COLUMN data_criacao")
        cursor.execute("ALTER TABLE Clientes DROP COLUMN data_atualizacao")
        
        # Dropar tabelas criadas
        cursor.execute("DROP TABLE RepresentantesLegais")
        cursor.execute("DROP TABLE DocumentosEmpresa")
        cursor.execute("DROP TABLE DadosBancarios")
        cursor.execute("DROP TABLE Enderecos")
        
        conn.commit()
        print("✅ Rollback concluído!")
        
    except Exception as e:
        print(f"❌ Erro no rollback: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    import sys
    
    print("MIGRATION 001: Melhorias no modelo Cliente")
    print("=" * 50)
    
    if len(sys.argv) > 1 and sys.argv[1] == '--rollback':
        rollback_migration()
    else:
        print("1. Criando novas tabelas...")
        criar_novas_tabelas()
        
        print("\n2. Adicionando colunas à tabela Clientes...")
        adicionar_colunas_clientes()
        
        print("\n3. Migrando dados existentes...")
        migrar_dados_existentes()
        
        print("\n4. Criando índices...")
        criar_indices()
        
        print("\nMigração concluída com sucesso!")
        print("\nPróximos passos:")
        print("   - Atualizar repositórios para usar nova estrutura")
        print("   - Atualizar formulários no frontend")
        print("   - Testar integração completa")
        print("\nPara reverter: python migration_001_clientes_melhorias.py --rollback")