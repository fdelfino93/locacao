"""
Script para analisar a estrutura do banco de dados e remover locadores inativos
com segurança, verificando todas as dependências
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

def analisar_estrutura_banco():
    """Analisa a estrutura do banco para identificar todas as tabelas relacionadas a locadores"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            print("=== ANÁLISE DA ESTRUTURA DO BANCO ===\n")
            
            # Buscar todas as tabelas que fazem referência a locadores
            cursor.execute("""
                SELECT 
                    t.name AS tabela,
                    c.name AS coluna,
                    fk.name AS nome_fk
                FROM sys.foreign_keys fk
                INNER JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
                INNER JOIN sys.tables t ON fkc.parent_object_id = t.object_id
                INNER JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
                INNER JOIN sys.tables ref_t ON fkc.referenced_object_id = ref_t.object_id
                WHERE ref_t.name = 'Locadores'
                ORDER BY t.name
            """)
            
            tabelas_relacionadas = []
            for row in cursor.fetchall():
                tabela, coluna, nome_fk = row
                tabelas_relacionadas.append((tabela, coluna))
                print(f"Tabela: {tabela} | Coluna: {coluna} | FK: {nome_fk}")
            
            return tabelas_relacionadas
            
    except Exception as e:
        print(f"Erro ao analisar estrutura: {e}")
        return []

def verificar_dependencias_locador(locador_id, tabelas_relacionadas):
    """Verifica se um locador tem dependências em outras tabelas"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            dependencias = {}
            
            for tabela, coluna in tabelas_relacionadas:
                cursor.execute(f"SELECT COUNT(*) FROM {tabela} WHERE {coluna} = ?", (locador_id,))
                count = cursor.fetchone()[0]
                if count > 0:
                    dependencias[tabela] = count
            
            return dependencias
            
    except Exception as e:
        print(f"Erro ao verificar dependências do locador {locador_id}: {e}")
        return {}

def listar_locadores_inativos():
    """Lista todos os locadores inativos"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT id, nome, cpf_cnpj FROM Locadores WHERE ativo = 0")
            return cursor.fetchall()
            
    except Exception as e:
        print(f"Erro ao buscar locadores inativos: {e}")
        return []

def remover_locador_completo(locador_id, tabelas_relacionadas):
    """Remove um locador e todas suas dependências de forma segura"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            print(f"\nRemoção do locador ID {locador_id}:")
            
            # Remover dependências primeiro
            for tabela, coluna in tabelas_relacionadas:
                cursor.execute(f"DELETE FROM {tabela} WHERE {coluna} = ?", (locador_id,))
                rows_affected = cursor.rowcount
                if rows_affected > 0:
                    print(f"  - Removidos {rows_affected} registros da tabela {tabela}")
            
            # Remover o locador
            cursor.execute("DELETE FROM Locadores WHERE id = ?", (locador_id,))
            if cursor.rowcount > 0:
                print(f"  - Locador removido com sucesso")
                return True
            else:
                print(f"  - Erro: Locador não encontrado")
                return False
                
    except Exception as e:
        print(f"Erro ao remover locador {locador_id}: {e}")
        return False

def main():
    print("SCRIPT DE REMOÇÃO SEGURA DE LOCADORES INATIVOS")
    print("=" * 50)
    
    # 1. Analisar estrutura do banco
    print("\n1. Analisando estrutura do banco de dados...")
    tabelas_relacionadas = analisar_estrutura_banco()
    
    if not tabelas_relacionadas:
        print("Não foi possível analisar a estrutura. Abortando.")
        return
    
    # 2. Listar locadores inativos
    print("\n2. Buscando locadores inativos...")
    locadores_inativos = listar_locadores_inativos()
    
    if not locadores_inativos:
        print("Nenhum locador inativo encontrado.")
        return
    
    print(f"Encontrados {len(locadores_inativos)} locadores inativos:")
    
    # 3. Verificar dependências de cada locador inativo
    todos_locadores_inativos = []
    
    for locador_id, nome, cpf_cnpj in locadores_inativos:
        dependencias = verificar_dependencias_locador(locador_id, tabelas_relacionadas)
        todos_locadores_inativos.append((locador_id, nome, cpf_cnpj))
        
        if dependencias:
            print(f"  ID {locador_id} ({nome}) - COM dependências: {dependencias}")
        else:
            print(f"  ID {locador_id} ({nome}) - SEM dependências")
    
    # 4. Mostrar resumo
    print(f"\nRESUMO:")
    print(f"  - Total de locadores inativos: {len(todos_locadores_inativos)}")
    
    if todos_locadores_inativos:
        print(f"\nTODOS os locadores inativos serão removidos (incluindo dependências):")
        for locador_id, nome, cpf_cnpj in todos_locadores_inativos:
            print(f"  - ID {locador_id}: {nome} (CPF/CNPJ: {cpf_cnpj})")
        
        # 5. Executar remoção de TODOS os locadores inativos
        print(f"\nExecutando remoção de TODOS os {len(todos_locadores_inativos)} locadores inativos...")
        
        print("\nIniciando remoção...")
        removidos = 0
        
        for locador_id, nome, cpf_cnpj in todos_locadores_inativos:
            if remover_locador_completo(locador_id, tabelas_relacionadas):
                removidos += 1
                print(f"OK - Locador {locador_id} ({nome}) removido")
            else:
                print(f"ERRO - Falha ao remover locador {locador_id} ({nome})")
        
        print(f"\nRemoção concluída: {removidos}/{len(todos_locadores_inativos)} locadores removidos")
    else:
        print("\nNenhum locador inativo encontrado.")

if __name__ == "__main__":
    main()