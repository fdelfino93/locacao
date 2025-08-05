"""
Migration 001: Melhorias no modelo Cliente (versão simplificada)
"""
import pyodbc
import os
from dotenv import load_dotenv

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

def executar_migration():
    """Executa a migração completa"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    try:
        print("1. Criando tabela Enderecos...")
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
                endereco_completo nvarchar(500) NULL
            )
        """)
        print("   OK - Tabela Enderecos criada")
        
        print("2. Criando tabela DadosBancarios...")
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
        print("   OK - Tabela DadosBancarios criada")
        
        print("3. Adicionando colunas na tabela Clientes...")
        
        # Lista de colunas para adicionar
        colunas = [
            ("endereco_id", "int NULL"),
            ("dados_bancarios_id", "int NULL"), 
            ("tipo_pessoa", "nvarchar(2) NULL"),
            ("observacoes", "nvarchar(1000) NULL")
        ]
        
        for nome_coluna, definicao in colunas:
            try:
                cursor.execute(f"ALTER TABLE Clientes ADD {nome_coluna} {definicao}")
                print(f"   OK - Coluna {nome_coluna} adicionada")
            except Exception as e:
                if "already exists" in str(e).lower():
                    print(f"   AVISO - Coluna {nome_coluna} já existe")
                else:
                    print(f"   ERRO - {nome_coluna}: {e}")
        
        print("4. Criando relacionamentos...")
        try:
            cursor.execute("""
                ALTER TABLE Clientes 
                ADD CONSTRAINT FK_Clientes_Endereco 
                FOREIGN KEY (endereco_id) REFERENCES Enderecos(id)
            """)
            print("   OK - FK Enderecos criada")
        except Exception as e:
            print(f"   AVISO - FK Enderecos: {e}")
            
        try:
            cursor.execute("""
                ALTER TABLE Clientes 
                ADD CONSTRAINT FK_Clientes_DadosBancarios 
                FOREIGN KEY (dados_bancarios_id) REFERENCES DadosBancarios(id)
            """)
            print("   OK - FK DadosBancarios criada")
        except Exception as e:
            print(f"   AVISO - FK DadosBancarios: {e}")
        
        print("5. Atualizando tipo_pessoa baseado em CPF/CNPJ...")
        cursor.execute("""
            UPDATE Clientes 
            SET tipo_pessoa = CASE 
                WHEN LEN(REPLACE(REPLACE(REPLACE(cpf_cnpj, '.', ''), '-', ''), '/', '')) = 11 THEN 'PF'
                ELSE 'PJ'
            END
            WHERE cpf_cnpj IS NOT NULL
        """)
        print("   OK - Tipos de pessoa atualizados")
        
        conn.commit()
        print("\nMIGRACAO CONCLUIDA COM SUCESSO!")
        print("\nProximos passos:")
        print("- Atualizar cliente_repository.py")
        print("- Atualizar frontend para novos campos")
        print("- Testar integracao")
        
    except Exception as e:
        print(f"\nERRO na migracao: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    print("MIGRATION 001: Melhorias no modelo Cliente")
    print("=" * 50)
    executar_migration()