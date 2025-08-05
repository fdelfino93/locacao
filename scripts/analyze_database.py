"""
Script para analisar a estrutura atual do banco de dados
e propor melhorias baseadas nas melhores práticas
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

def analisar_estrutura_tabelas():
    """Analisa a estrutura atual das tabelas principais"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    tabelas = ['Clientes', 'Inquilinos', 'Imoveis', 'Contratos']
    estrutura = {}
    
    for tabela in tabelas:
        try:
            # Busca informações das colunas
            cursor.execute(f"""
                SELECT 
                    COLUMN_NAME,
                    DATA_TYPE,
                    IS_NULLABLE,
                    CHARACTER_MAXIMUM_LENGTH,
                    COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '{tabela}'
                ORDER BY ORDINAL_POSITION
            """)
            
            colunas = []
            for row in cursor.fetchall():
                colunas.append({
                    'nome': row[0],
                    'tipo': row[1],
                    'nullable': row[2] == 'YES',
                    'tamanho': row[3],
                    'default': row[4]
                })
            
            estrutura[tabela] = colunas
            print(f"\n=== TABELA {tabela} ===")
            for col in colunas:
                null_info = "NULL" if col['nullable'] else "NOT NULL"
                tamanho_info = f"({col['tamanho']})" if col['tamanho'] else ""
                print(f"  {col['nome']}: {col['tipo']}{tamanho_info} {null_info}")
                
        except Exception as e:
            print(f"Erro ao analisar tabela {tabela}: {e}")
    
    conn.close()
    return estrutura

def analisar_dados_sample():
    """Analisa uma amostra dos dados existentes"""
    conn = get_conexao()
    cursor = conn.cursor()
    
    print("\n=== ANÁLISE DE DADOS EXISTENTES ===")
    
    # Clientes
    try:
        cursor.execute("SELECT COUNT(*) FROM Clientes")
        count_clientes = cursor.fetchone()[0]
        print(f"Total de Clientes: {count_clientes}")
        
        cursor.execute("SELECT TOP 5 nome, cpf_cnpj, endereco, tipo_recebimento FROM Clientes")
        print("Amostra de Clientes:")
        for row in cursor.fetchall():
            print(f"  {row[0]} | {row[1]} | {row[2][:50]}... | {row[3]}")
    except Exception as e:
        print(f"Erro ao analisar Clientes: {e}")
    
    # Inquilinos
    try:
        cursor.execute("SELECT COUNT(*) FROM Inquilinos")
        count_inquilinos = cursor.fetchone()[0]
        print(f"\nTotal de Inquilinos: {count_inquilinos}")
    except Exception as e:
        print(f"Erro ao analisar Inquilinos: {e}")
    
    # Imóveis
    try:
        cursor.execute("SELECT COUNT(*) FROM Imoveis")
        count_imoveis = cursor.fetchone()[0]
        print(f"Total de Imóveis: {count_imoveis}")
    except Exception as e:
        print(f"Erro ao analisar Imóveis: {e}")
    
    # Contratos
    try:
        cursor.execute("SELECT COUNT(*) FROM Contratos")
        count_contratos = cursor.fetchone()[0]
        print(f"Total de Contratos: {count_contratos}")
    except Exception as e:
        print(f"Erro ao analisar Contratos: {e}")
    
    conn.close()

def propor_melhorias():
    """Propõe melhorias baseadas na análise"""
    print("\n=== MELHORIAS PROPOSTAS ===")
    
    melhorias = {
        "CLIENTES": [
            "- Separar endereço em: rua, numero, bairro, cidade, cep",
            "- Expandir dados financeiros: chave_pix, banco, agencia, conta",
            "- Melhorar classificação: tipo_pessoa (PF/PJ)",
            "- Adicionar tabela DocumentosCliente para PJ",
            "- Tabela RepresentanteLegal para PJ",
            "- Campo observacoes"
        ],
        "INQUILINOS": [
            "- Mesma melhoria de endereço dos Clientes",
            "- Tabela MoradoresInquilino (condicional)",
            "- Tabela FiadorInquilino (condicional)",
            "- Mesmos dados financeiros dos Clientes",
            "- Campo observacoes"
        ],
        "IMOVEIS": [
            "- Separar endereço em campos individuais",
            "- Adicionar validações de CEP",
            "- Melhorar relacionamentos com Clientes/Inquilinos"
        ],
        "CONTRATOS": [
            "- Sistema de Planos de Locação estruturado",
            "- Cálculo automático de taxas por plano",
            "- Separar valores: aluguel, iptu, condominio",
            "- Checkboxes para antecipação de encargos",
            "- Melhorar gestão de seguros e garantias",
            "- Campos de data mais específicos"
        ]
    }
    
    for tabela, lista_melhorias in melhorias.items():
        print(f"\n{tabela}:")
        for melhoria in lista_melhorias:
            print(f"  {melhoria}")

if __name__ == "__main__":
    print("ANÁLISE DA ESTRUTURA ATUAL DO SISTEMA IMOBILIÁRIO")
    print("=" * 60)
    
    try:
        estrutura = analisar_estrutura_tabelas()
        analisar_dados_sample()
        propor_melhorias()
        
        print("\nAnálise concluída! Use essas informações para implementar melhorias.")
        
    except Exception as e:
        print(f"Erro na análise: {e}")
        print("Verifique as configurações do banco de dados no arquivo .env")