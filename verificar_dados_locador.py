"""
Script para verificar dados específicos de um locador no banco
"""
import pyodbc
import sys
import os
from dotenv import load_dotenv
import io

# Configurar encoding para Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Carregar variáveis de ambiente
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

def verificar_dados_locador(locador_id=55):
    """Verifica os dados específicos de um locador no banco"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        print(f"🔍 VERIFICANDO DADOS DO LOCADOR ID {locador_id}:")
        print("=" * 60)
        
        # Query para buscar dados específicos
        cursor.execute("""
            SELECT 
                id, nome, cpf_cnpj, estado_civil, 
                regime_bens, email_recebimento, usa_multiplos_metodos,
                observacoes
            FROM Locadores 
            WHERE id = ?
        """, (locador_id,))
        
        resultado = cursor.fetchone()
        
        if resultado:
            print(f"📋 ID: {resultado[0]}")
            print(f"📋 Nome: {resultado[1]}")
            print(f"📋 CPF: {resultado[2]}")
            print(f"📋 Estado Civil: '{resultado[3]}'")
            print(f"📋 Regime Bens: '{resultado[4]}'")
            print(f"📋 Email Recebimento: '{resultado[5]}'")
            print(f"📋 Usa Múltiplos Métodos: {resultado[6]}")
            print(f"📋 Observações: '{resultado[7]}'")
        else:
            print("❌ Locador ID 55 não encontrado!")
            
        # Verificar se há dados no JSON original
        print("\n🔍 DADOS ORIGINAIS DO JSON:")
        print("-" * 40)
        dados_json = {
            "regime_bens": "Comunhão universal de bens",
            "email_recebimento": "relatorios@test.com",
            "usa_multiplos_metodos": 1
        }
        for campo, valor in dados_json.items():
            print(f"📋 {campo}: '{valor}'")
            
        conn.close()
        
    except Exception as e:
        print(f"❌ Erro ao verificar dados: {e}")

if __name__ == "__main__":
    import sys
    locador_id = int(sys.argv[1]) if len(sys.argv) > 1 else 55
    verificar_dados_locador(locador_id)