from dotenv import load_dotenv
import os
import re
import pyodbc


# =============================================
# Configurações
# =============================================
PROJECT_PATH = "C:/Users/matheus/Documents/Locacao/locacao"  # Caminho do projeto (ajuste se necessário)

load_dotenv()

DB_CONNECTION_STRING = (
    f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
    f"SERVER={os.getenv('DB_SERVER')};"
    f"DATABASE={os.getenv('DB_DATABASE')};"
    f"UID={os.getenv('DB_USER')};"
    f"PWD={os.getenv('DB_PASSWORD')};"  # Use autenticação do Windows, ou especifique UID e PWD para autenticação SQL
    # Exemplo com autenticação SQL: "UID=your_username;PWD=your_password;"
)
OUTPUT_FILE = "relatorio_alinhamento.md"

# =============================================
# Funções auxiliares
# =============================================

def get_db_schema(connection_string):
    schema = {}
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        # Obter lista de tabelas
        cursor.execute("""
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE'
        """)
        tables = [row[0] for row in cursor.fetchall()]

        # Obter colunas de cada tabela
        for table in tables:
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = ?
            """, (table,))
            columns = [row[0] for row in cursor.fetchall()]
            schema[table] = columns

        conn.close()
    except Exception as e:
        print(f"Erro ao conectar ou consultar o banco: {e}")
    return schema

def scan_project_files(project_path, db_schema):
    results = {"missing_in_code": {}, "missing_in_db": {}, "suspects": {}}
    pattern = re.compile(r"[a-zA-Z_][a-zA-Z0-9_]*")

    all_columns = set()
    for cols in db_schema.values():
        all_columns.update(cols)

    # Percorrer todos arquivos do projeto
    for root, _, files in os.walk(project_path):
        for file in files:
            if file.endswith((".py", ".ts", ".js")):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()
                        found = set(pattern.findall(content))

                        # Campos do banco não encontrados no código
                        for col in all_columns:
                            if col not in found:
                                results["missing_in_code"].setdefault(col, []).append(path)

                        # Campos do código que parecem não estar no banco
                        for word in found:
                            if word.lower() not in (c.lower() for c in all_columns):
                                if len(word) > 3:  # evita falsos positivos como "def", "for"
                                    results["missing_in_db"].setdefault(word, []).append(path)
                except Exception as e:
                    print(f"Erro lendo {path}: {e}")

    return results

def generate_report(results, db_schema, output_file):
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("# Relatório de Alinhamento Banco ↔ Código\n\n")

        f.write("## Estrutura do Banco (extraída do SQL Server)\n")
        for table, cols in db_schema.items():
            f.write(f"- **{table}**: {', '.join(cols)}\n")

        f.write("\n## Campos do Banco não encontrados no código\n")
        for col, files in results["missing_in_code"].items():
            f.write(f"- `{col}` ausente em: {len(files)} arquivos\n")

        f.write("\n## Campos do Código que não existem no Banco\n")
        for col, files in results["missing_in_db"].items():
            f.write(f"- `{col}` encontrado em: {', '.join(files)}\n")

    return output_file

# =============================================
# Execução principal
# =============================================
if __name__ == "__main__":
    db_schema = get_db_schema(DB_CONNECTION_STRING) 
    results = scan_project_files(PROJECT_PATH, db_schema)
    report = generate_report(results, db_schema, OUTPUT_FILE)
    print(f"Relatório gerado em: {report}")