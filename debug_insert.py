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

# Testar inserção simples
conn = get_conexao()
cursor = conn.cursor()

try:
    # Testar com campos problemáticos
    cursor.execute("""
        INSERT INTO Locadores (
            nome, cpf_cnpj, telefone, email, endereco,
            deseja_fci, deseja_seguro_fianca, deseja_seguro_incendio, existe_conjuge
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        "Teste Debug 2",
        "123.456.789-01",
        "(11) 99999-9998", 
        "debug2@test.com",
        "Rua Debug, 124",
        "Não",  # deseja_fci (nvarchar)
        "Não",  # deseja_seguro_fianca (nvarchar)
        0,      # deseja_seguro_incendio (int)
        0       # existe_conjuge (int)
    ))
    
    conn.commit()
    print("Inserção com campos problemáticos funcionou!")
    
except Exception as e:
    print(f"Erro na inserção básica: {e}")
    
finally:
    conn.close()