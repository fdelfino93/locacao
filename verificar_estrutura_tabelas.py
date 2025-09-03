#!/usr/bin/env python3
"""
Script para verificar e corrigir estrutura das tabelas ContratoLocadores e ContratoLocatarios
"""
import pyodbc
import sys

def get_connection():
    """Conecta ao banco de dados"""
    try:
        conn = pyodbc.connect(
            'DRIVER={ODBC Driver 17 for SQL Server};'
            'SERVER=SRVTESTES\\SQLTESTES;'
            'DATABASE=Cobimob;'
            'UID=srvcondo1;'
            'PWD=2025@Condo'
        )
        return conn
    except Exception as e:
        print(f"Erro ao conectar: {e}")
        return None

def verificar_colunas_tabela(cursor, tabela):
    """Verifica colunas de uma tabela"""
    try:
        cursor.execute("""
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
        """, (tabela,))
        
        colunas = cursor.fetchall()
        print(f"\n--- Colunas da tabela {tabela} ---")
        for coluna in colunas:
            print(f"  {coluna[0]}: {coluna[1]} ({'NULL' if coluna[2] == 'YES' else 'NOT NULL'})")
        
        return [col[0] for col in colunas]
    except Exception as e:
        print(f"Erro ao verificar colunas de {tabela}: {e}")
        return []

def verificar_se_tabela_existe(cursor, tabela):
    """Verifica se uma tabela existe"""
    try:
        cursor.execute("""
            SELECT COUNT(*) 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME = ?
        """, (tabela,))
        
        result = cursor.fetchone()
        return result and result[0] > 0
    except Exception as e:
        print(f"Erro ao verificar existência de {tabela}: {e}")
        return False

def adicionar_coluna_se_nao_existe(cursor, tabela, coluna, definicao):
    """Adiciona uma coluna se ela não existir"""
    try:
        cursor.execute(f"""
            IF NOT EXISTS (
                SELECT * FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '{tabela}' AND COLUMN_NAME = '{coluna}'
            )
            BEGIN
                ALTER TABLE {tabela} ADD {coluna} {definicao}
                PRINT 'Coluna {coluna} adicionada à tabela {tabela}'
            END
            ELSE
            BEGIN
                PRINT 'Coluna {coluna} já existe na tabela {tabela}'
            END
        """)
        print(f"OK Verificação da coluna {coluna} em {tabela} concluída")
    except Exception as e:
        print(f"ERRO Erro ao adicionar coluna {coluna} em {tabela}: {e}")

def criar_tabela_se_nao_existe(cursor, tabela, sql_create):
    """Cria uma tabela se ela não existir"""
    try:
        cursor.execute(f"""
            IF NOT EXISTS (
                SELECT * FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = '{tabela}'
            )
            BEGIN
                {sql_create}
                PRINT 'Tabela {tabela} criada'
            END
            ELSE
            BEGIN
                PRINT 'Tabela {tabela} já existe'
            END
        """)
        print(f"OK Verificação da tabela {tabela} concluída")
    except Exception as e:
        print(f"ERRO Erro ao criar tabela {tabela}: {e}")

def main():
    """Função principal"""
    print("VERIFICANDO ESTRUTURA DAS TABELAS...")
    
    conn = get_connection()
    if not conn:
        print("Nao foi possivel conectar ao banco de dados")
        return False
    
    cursor = conn.cursor()
    
    # 1. Verificar se tabelas existem
    tabelas_necessarias = ['ContratoLocadores', 'ContratoLocatarios']
    
    for tabela in tabelas_necessarias:
        existe = verificar_se_tabela_existe(cursor, tabela)
        if existe:
            print(f"OK Tabela {tabela} existe")
            colunas = verificar_colunas_tabela(cursor, tabela)
        else:
            print(f"ERRO Tabela {tabela} NAO existe")
            
            if tabela == 'ContratoLocadores':
                print(f" Criando tabela {tabela}...")
                sql_create = """
                CREATE TABLE ContratoLocadores (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    contrato_id INT NOT NULL,
                    locador_id INT NOT NULL,
                    conta_bancaria_id INT NULL,
                    porcentagem DECIMAL(5,2) DEFAULT 100.00,
                    responsabilidade_principal BIT DEFAULT 0,
                    data_entrada DATE NULL,
                    data_saida DATE NULL,
                    observacoes TEXT NULL,
                    ativo BIT DEFAULT 1,
                    data_criacao DATETIME2 DEFAULT GETDATE(),
                    data_atualizacao DATETIME2 DEFAULT GETDATE(),
                    
                    CONSTRAINT FK_ContratoLocadores_Contrato 
                        FOREIGN KEY (contrato_id) REFERENCES Contratos(id) ON DELETE CASCADE
                )
                """
                criar_tabela_se_nao_existe(cursor, tabela, sql_create)
                
            elif tabela == 'ContratoLocatarios':
                print(f" Criando tabela {tabela}...")
                sql_create = """
                CREATE TABLE ContratoLocatarios (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    contrato_id INT NOT NULL,
                    locatario_id INT NOT NULL,
                    responsabilidade_principal BIT DEFAULT 0,
                    data_entrada DATE NULL,
                    data_saida DATE NULL,
                    observacoes TEXT NULL,
                    ativo BIT DEFAULT 1,
                    data_criacao DATETIME2 DEFAULT GETDATE(),
                    data_atualizacao DATETIME2 DEFAULT GETDATE(),
                    
                    CONSTRAINT FK_ContratoLocatarios_Contrato 
                        FOREIGN KEY (contrato_id) REFERENCES Contratos(id) ON DELETE CASCADE
                )
                """
                criar_tabela_se_nao_existe(cursor, tabela, sql_create)
    
    # 2. Verificar colunas necessárias em ContratoLocadores
    if verificar_se_tabela_existe(cursor, 'ContratoLocadores'):
        colunas_locadores = verificar_colunas_tabela(cursor, 'ContratoLocadores')
        
        # Verificar se responsabilidade_principal existe
        if 'responsabilidade_principal' not in colunas_locadores:
            print(" Adicionando coluna responsabilidade_principal à ContratoLocadores...")
            adicionar_coluna_se_nao_existe(cursor, 'ContratoLocadores', 
                                         'responsabilidade_principal', 'BIT DEFAULT 0')
    
    # 3. Verificar colunas necessárias em ContratoLocatarios  
    if verificar_se_tabela_existe(cursor, 'ContratoLocatarios'):
        colunas_locatarios = verificar_colunas_tabela(cursor, 'ContratoLocatarios')
        
        # Verificar se responsabilidade_principal existe
        if 'responsabilidade_principal' not in colunas_locatarios:
            print(" Adicionando coluna responsabilidade_principal à ContratoLocatarios...")
            adicionar_coluna_se_nao_existe(cursor, 'ContratoLocatarios', 
                                         'responsabilidade_principal', 'BIT DEFAULT 0')
    
    # 4. Commit das alterações
    try:
        conn.commit()
        print("OK Todas as alterações foram salvas no banco")
    except Exception as e:
        print(f"ERRO Erro ao salvar alterações: {e}")
        conn.rollback()
        return False
    
    # 5. Verificação final
    print("\n VERIFICAÇÃO FINAL:")
    for tabela in tabelas_necessarias:
        if verificar_se_tabela_existe(cursor, tabela):
            colunas = verificar_colunas_tabela(cursor, tabela)
            print(f"OK {tabela}: {len(colunas)} colunas")
        else:
            print(f"ERRO {tabela}: NÃO EXISTE")
    
    cursor.close()
    conn.close()
    
    print("\n VERIFICAÇÃO CONCLUÍDA!")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)