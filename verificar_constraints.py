#!/usr/bin/env python3
"""
Script para verificar constraints e estrutura das tabelas ContratoLocadores e ContratoLocatarios
"""
import pyodbc
import sys

def get_connection():
    """Conecta ao banco de dados usando as mesmas credenciais do sistema"""
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

def verificar_constraints(cursor, tabela):
    """Verifica constraints de uma tabela"""
    try:
        print(f"\n=== CONSTRAINTS DA TABELA {tabela} ===")
        cursor.execute("""
            SELECT 
                tc.CONSTRAINT_NAME,
                tc.CONSTRAINT_TYPE,
                kcu.COLUMN_NAME,
                tc.TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
                ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
            WHERE tc.TABLE_NAME = ?
            ORDER BY tc.CONSTRAINT_TYPE, tc.CONSTRAINT_NAME
        """, (tabela,))
        
        constraints = cursor.fetchall()
        
        for constraint in constraints:
            print(f"  {constraint[1]}: {constraint[0]} ({constraint[2]})")
            
        if not constraints:
            print(f"  Nenhuma constraint encontrada para {tabela}")
            
        return constraints
    except Exception as e:
        print(f"Erro ao verificar constraints de {tabela}: {e}")
        return []

def verificar_indices(cursor, tabela):
    """Verifica índices de uma tabela"""
    try:
        print(f"\n=== INDICES DA TABELA {tabela} ===")
        cursor.execute("""
            SELECT 
                i.name as index_name,
                i.type_desc,
                i.is_unique,
                c.name as column_name
            FROM sys.indexes i
            JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
            JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
            JOIN sys.tables t ON i.object_id = t.object_id
            WHERE t.name = ?
            ORDER BY i.name, ic.key_ordinal
        """, (tabela,))
        
        indices = cursor.fetchall()
        
        for index in indices:
            unique_str = "UNIQUE" if index[2] else "NON-UNIQUE"
            print(f"  {index[0]} ({index[1]}, {unique_str}): {index[3]}")
            
        if not indices:
            print(f"  Nenhum indice encontrado para {tabela}")
            
        return indices
    except Exception as e:
        print(f"Erro ao verificar indices de {tabela}: {e}")
        return []

def verificar_dados_existentes(cursor, tabela):
    """Verifica quantos registros existem e se há múltiplos por contrato"""
    try:
        print(f"\n=== DADOS EXISTENTES NA TABELA {tabela} ===")
        
        # Total de registros
        cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
        total = cursor.fetchone()[0]
        print(f"  Total de registros: {total}")
        
        # Registros por contrato
        if tabela == 'ContratoLocadores':
            cursor.execute("""
                SELECT contrato_id, COUNT(*) as qtd_locadores
                FROM ContratoLocadores 
                WHERE ativo = 1
                GROUP BY contrato_id
                HAVING COUNT(*) > 1
                ORDER BY qtd_locadores DESC
            """)
        else:
            cursor.execute("""
                SELECT contrato_id, COUNT(*) as qtd_locatarios
                FROM ContratoLocatarios 
                WHERE ativo = 1
                GROUP BY contrato_id
                HAVING COUNT(*) > 1
                ORDER BY qtd_locatarios DESC
            """)
        
        multiplos = cursor.fetchall()
        
        if multiplos:
            print(f"  Contratos com múltiplos registros:")
            for registro in multiplos:
                print(f"    Contrato {registro[0]}: {registro[1]} registros")
        else:
            print(f"  Nenhum contrato possui múltiplos registros em {tabela}")
            
        return multiplos
    except Exception as e:
        print(f"Erro ao verificar dados de {tabela}: {e}")
        return []

def verificar_triggers(cursor, tabela):
    """Verifica triggers da tabela"""
    try:
        print(f"\n=== TRIGGERS DA TABELA {tabela} ===")
        cursor.execute("""
            SELECT 
                t.name as trigger_name,
                t.type_desc,
                t.is_disabled
            FROM sys.triggers t
            JOIN sys.tables tb ON t.parent_id = tb.object_id
            WHERE tb.name = ?
        """, (tabela,))
        
        triggers = cursor.fetchall()
        
        for trigger in triggers:
            status = "DISABLED" if trigger[2] else "ENABLED"
            print(f"  {trigger[0]} ({trigger[1]}) - {status}")
            
        if not triggers:
            print(f"  Nenhum trigger encontrado para {tabela}")
            
        return triggers
    except Exception as e:
        print(f"Erro ao verificar triggers de {tabela}: {e}")
        return []

def testar_insercao_multipla(cursor):
    """Testa se é possível inserir múltiplos registros"""
    print(f"\n=== TESTE DE INSERCAO MULTIPLA ===")
    
    try:
        # Verificar se existe algum contrato para usar no teste
        cursor.execute("SELECT TOP 1 id FROM Contratos ORDER BY id")
        contrato = cursor.fetchone()
        
        if not contrato:
            print("  Nenhum contrato encontrado para teste")
            return False
            
        contrato_id = contrato[0]
        print(f"  Usando contrato {contrato_id} para teste")
        
        # Testar ContratoLocadores
        print("  Testando ContratoLocadores...")
        try:
            cursor.execute("""
                INSERT INTO ContratoLocadores 
                (contrato_id, locador_id, conta_bancaria_id, porcentagem, responsabilidade_principal, ativo)
                VALUES (?, 999, 1, 50.0, 1, 0)
            """, (contrato_id,))
            
            cursor.execute("""
                INSERT INTO ContratoLocadores 
                (contrato_id, locador_id, conta_bancaria_id, porcentagem, responsabilidade_principal, ativo)
                VALUES (?, 998, 1, 50.0, 0, 0)
            """, (contrato_id,))
            
            print("    OK: Multiplos locadores inseridos com sucesso")
            
            # Limpar teste
            cursor.execute("DELETE FROM ContratoLocadores WHERE locador_id IN (999, 998)")
            
        except Exception as e:
            print(f"    ERRO ao inserir multiplos locadores: {e}")
            
        # Testar ContratoLocatarios
        print("  Testando ContratoLocatarios...")
        try:
            cursor.execute("""
                INSERT INTO ContratoLocatarios 
                (contrato_id, locatario_id, responsabilidade_principal, percentual_responsabilidade, ativo)
                VALUES (?, 999, 1, 50.0, 0)
            """, (contrato_id,))
            
            cursor.execute("""
                INSERT INTO ContratoLocatarios 
                (contrato_id, locatario_id, responsabilidade_principal, percentual_responsabilidade, ativo)
                VALUES (?, 998, 0, 50.0, 0)
            """, (contrato_id,))
            
            print("    OK: Multiplos locatarios inseridos com sucesso")
            
            # Limpar teste
            cursor.execute("DELETE FROM ContratoLocatarios WHERE locatario_id IN (999, 998)")
            
        except Exception as e:
            print(f"    ERRO ao inserir multiplos locatarios: {e}")
            
        return True
        
    except Exception as e:
        print(f"  ERRO no teste de inserção: {e}")
        return False

def main():
    """Função principal"""
    print("VERIFICANDO CONFIGURACAO DO BANCO PARA MULTIPLOS LOCADORES/LOCATARIOS")
    
    conn = get_connection()
    if not conn:
        print("Nao foi possivel conectar ao banco de dados")
        return False
    
    cursor = conn.cursor()
    
    tabelas = ['ContratoLocadores', 'ContratoLocatarios']
    
    for tabela in tabelas:
        print(f"\n{'='*60}")
        print(f"ANALISANDO TABELA: {tabela}")
        print(f"{'='*60}")
        
        # Verificar constraints
        constraints = verificar_constraints(cursor, tabela)
        
        # Verificar índices
        indices = verificar_indices(cursor, tabela)
        
        # Verificar triggers
        triggers = verificar_triggers(cursor, tabela)
        
        # Verificar dados existentes
        dados = verificar_dados_existentes(cursor, tabela)
    
    # Teste de inserção
    testar_insercao_multipla(cursor)
    
    cursor.close()
    conn.close()
    
    print(f"\n{'='*60}")
    print("VERIFICACAO CONCLUIDA!")
    print(f"{'='*60}")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)