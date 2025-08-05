"""
Script para verificar se as novas tabelas foram criadas corretamente
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

def verificar_tabelas_novas():
    """Verifica se as novas tabelas existem e têm dados"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    tabelas_novas = ['Enderecos', 'DadosBancarios']
    
    print("VERIFICANDO NOVAS TABELAS CRIADAS")
    print("=" * 40)
    
    for tabela in tabelas_novas:
        try:
            # Verificar estrutura
            cursor.execute(f"""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '{tabela}'
                ORDER BY ORDINAL_POSITION
            """)
            
            colunas = cursor.fetchall()
            print(f"\nTabela {tabela}:")
            print(f"  Colunas: {len(colunas)}")
            for coluna in colunas:
                print(f"    {coluna[0]}: {coluna[1]} {'NULL' if coluna[2] == 'YES' else 'NOT NULL'}")
            
            # Verificar dados
            cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
            count = cursor.fetchone()[0]
            print(f"  Total de registros: {count}")
            
            if count > 0:
                cursor.execute(f"SELECT TOP 3 * FROM {tabela}")
                rows = cursor.fetchall()
                print(f"  Amostra de dados:")
                for i, row in enumerate(rows, 1):
                    print(f"    Registro {i}: {dict(zip([col[0] for col in cursor.description], row))}")
            
        except Exception as e:
            print(f"  ERRO ao verificar {tabela}: {e}")
    
    conn.close()

def verificar_relacionamentos():
    """Verifica se os relacionamentos FK foram criados"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    print(f"\nVERIFICANDO RELACIONAMENTOS (FOREIGN KEYS)")
    print("=" * 40)
    
    try:
        cursor.execute("""
            SELECT 
                fk.name AS FK_Name,
                tp.name AS Parent_Table,
                cp.name AS Parent_Column,
                tr.name AS Referenced_Table,
                cr.name AS Referenced_Column
            FROM sys.foreign_keys fk
            INNER JOIN sys.tables tp ON fk.parent_object_id = tp.object_id
            INNER JOIN sys.tables tr ON fk.referenced_object_id = tr.object_id
            INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
            INNER JOIN sys.columns cp ON fkc.parent_object_id = cp.object_id AND fkc.parent_column_id = cp.column_id
            INNER JOIN sys.columns cr ON fkc.referenced_object_id = cr.object_id AND fkc.referenced_column_id = cr.column_id
            WHERE tp.name = 'Clientes'
        """)
        
        fks = cursor.fetchall()
        if fks:
            for fk in fks:
                print(f"  {fk[0]}: {fk[1]}.{fk[2]} -> {fk[3]}.{fk[4]}")
        else:
            print("  Nenhuma FK encontrada para tabela Clientes")
    
    except Exception as e:
        print(f"  ERRO ao verificar FKs: {e}")
    
    conn.close()

def verificar_dados_migrados():
    """Verifica se os dados existentes têm os novos campos preenchidos"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    print(f"\nVERIFICANDO MIGRAÇÃO DE DADOS")
    print("=" * 40)
    
    try:
        cursor.execute("""
            SELECT 
                id, nome, tipo_pessoa, endereco_id, dados_bancarios_id,
                CASE WHEN endereco_id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_endereco_estruturado,
                CASE WHEN dados_bancarios_id IS NOT NULL THEN 'SIM' ELSE 'NÃO' END as tem_dados_bancarios
            FROM Clientes
            ORDER BY id
        """)
        
        clientes = cursor.fetchall()
        print(f"  Total de clientes: {len(clientes)}")
        print(f"  Estrutura dos dados migrados:")
        
        for cliente in clientes:
            print(f"    ID {cliente[0]} - {cliente[1]}")
            print(f"      Tipo Pessoa: {cliente[2] or 'NÃO DEFINIDO'}")
            print(f"      Endereço estruturado: {cliente[5]}")
            print(f"      Dados bancários: {cliente[6]}")
    
    except Exception as e:
        print(f"  ERRO ao verificar migração: {e}")
    
    conn.close()

if __name__ == "__main__":
    verificar_tabelas_novas()
    verificar_relacionamentos()
    verificar_dados_migrados()
    
    print(f"\nVERIFICAÇÃO CONCLUÍDA!")
    print("Se não houver erros acima, as melhorias foram implementadas com sucesso!")