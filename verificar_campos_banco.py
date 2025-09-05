"""
Script para verificar quais campos existem nas tabelas do banco
"""
import pyodbc
import sys
import os
from dotenv import load_dotenv

# Configurar encoding para Windows
import io
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

def verificar_campos_tabela(nome_tabela):
    """Verifica quais campos existem em uma tabela"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Query para listar todas as colunas da tabela
        cursor.execute("""
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = ? 
            ORDER BY ORDINAL_POSITION
        """, (nome_tabela,))
        
        campos = cursor.fetchall()
        
        print(f"\n📋 CAMPOS DA TABELA '{nome_tabela}':")
        print("=" * 60)
        
        if not campos:
            print(f"❌ Tabela '{nome_tabela}' não encontrada!")
            return []
            
        campos_encontrados = []
        for campo in campos:
            nome, tipo, nullable, default = campo
            status_null = "NULL" if nullable == "YES" else "NOT NULL"
            default_val = f" DEFAULT({default})" if default else ""
            
            print(f"✅ {nome:<25} {tipo:<15} {status_null}{default_val}")
            campos_encontrados.append(nome)
            
        conn.close()
        return campos_encontrados
        
    except Exception as e:
        print(f"❌ Erro ao verificar tabela {nome_tabela}: {e}")
        return []

def verificar_campos_extras():
    """Verifica se os campos extras do script SQL existem"""
    
    # Campos que deveriam existir na tabela Locadores
    campos_esperados_locadores = [
        'regime_bens',
        'data_constituicao', 
        'capital_social',
        'porte_empresa',
        'regime_tributario',
        'email_recebimento',
        'observacoes_especiais',
        'usa_multiplos_metodos',
        'usa_multiplas_contas'
    ]
    
    # Campos que deveriam existir na tabela RepresentanteLegalLocador
    campos_esperados_representante = [
        'data_nascimento',
        'nacionalidade',
        'estado_civil', 
        'profissao'
    ]
    
    print("🔍 VERIFICAÇÃO DE CAMPOS EXTRAS NO BANCO DE DADOS")
    print("=" * 70)
    
    # 1. Verificar tabela Locadores
    campos_locadores = verificar_campos_tabela('Locadores')
    
    print(f"\n🔍 VERIFICAÇÃO DOS CAMPOS EXTRAS - LOCADORES:")
    print("-" * 50)
    for campo in campos_esperados_locadores:
        if campo in campos_locadores:
            print(f"✅ {campo}: EXISTE")
        else:
            print(f"❌ {campo}: NÃO EXISTE")
    
    # 2. Verificar tabela RepresentanteLegalLocador
    campos_representante = verificar_campos_tabela('RepresentanteLegalLocador')
    
    print(f"\n🔍 VERIFICAÇÃO DOS CAMPOS EXTRAS - REPRESENTANTE LEGAL:")
    print("-" * 50)
    for campo in campos_esperados_representante:
        if campo in campos_representante:
            print(f"✅ {campo}: EXISTE")
        else:
            print(f"❌ {campo}: NÃO EXISTE")
    
    # 3. Verificar tabela FormasRecebimentoLocador
    print(f"\n🔍 VERIFICAÇÃO DA TABELA FormasRecebimentoLocador:")
    print("-" * 50)
    campos_formas = verificar_campos_tabela('FormasRecebimentoLocador')
    if campos_formas:
        print("✅ Tabela FormasRecebimentoLocador EXISTE")
    else:
        print("❌ Tabela FormasRecebimentoLocador NÃO EXISTE")
    
    # 4. Verificar outras tabelas relacionadas importantes
    tabelas_importantes = ['EnderecoLocador', 'ContasBancariasLocador']
    for tabela in tabelas_importantes:
        print(f"\n🔍 VERIFICAÇÃO DA TABELA {tabela}:")
        print("-" * 50)
        campos = verificar_campos_tabela(tabela)
        if campos:
            print(f"✅ Tabela {tabela} EXISTE com {len(campos)} campos")
        else:
            print(f"❌ Tabela {tabela} NÃO EXISTE")

if __name__ == "__main__":
    verificar_campos_extras()