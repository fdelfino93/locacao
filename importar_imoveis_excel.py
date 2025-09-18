"""
Script para importar imóveis de planilha Excel para o sistema
"""

import pandas as pd
import pyodbc
import os
from dotenv import load_dotenv
from repositories_adapter import inserir_imovel, buscar_locadores

load_dotenv()

def get_conexao():
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')};"
        f"Encrypt={os.getenv('DB_ENCRYPT')};"
        f"TrustServerCertificate={os.getenv('DB_TRUST_CERT')}"
    )
    return pyodbc.connect(connection_string)

def buscar_locador_por_nome(nome):
    """Busca um locador pelo nome"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, nome, cpf_cnpj 
                FROM Locadores 
                WHERE nome LIKE ? AND ativo = 1
            """, (f'%{nome}%',))
            
            resultado = cursor.fetchone()
            if resultado:
                return {'id': resultado[0], 'nome': resultado[1], 'cpf_cnpj': resultado[2]}
            return None
    except Exception as e:
        print(f"Erro ao buscar locador {nome}: {e}")
        return None

def importar_imoveis():
    # Ler a planilha
    df = pd.read_excel('imovel.xlsx')
    
    print("=" * 70)
    print("INICIANDO IMPORTAÇÃO DE IMÓVEIS")
    print("=" * 70)
    print(f"Total de imóveis para importar: {len(df)}")
    print()
    
    # Estatísticas
    sucesso = 0
    erro = 0
    proprietarios_nao_encontrados = set()
    
    # Processar cada linha
    for idx, row in df.iterrows():
        print(f"\n--- Processando imóvel {idx + 1}/{len(df)} ---")
        
        try:
            # 1. Buscar o proprietário
            proprietario_nome = row['proprietário 1']
            print(f"Buscando proprietário: {proprietario_nome}")
            
            locador = buscar_locador_por_nome(proprietario_nome)
            
            if not locador:
                print(f"⚠️ AVISO: Proprietário '{proprietario_nome}' não encontrado no sistema")
                proprietarios_nao_encontrados.add(proprietario_nome)
                erro += 1
                continue
            
            print(f"✓ Proprietário encontrado: {locador['nome']} (ID: {locador['id']})")
            
            # 2. Preparar dados do imóvel
            imovel_data = {
                'id_locador': locador['id'],
                'tipo': row['tipo do imovel'],
                'status': 'Disponível' if row['status'].lower() in ['disponível', 'disponivel'] else 'Ocupado',
                'valor_aluguel': float(row['Valor aluguel']) if pd.notna(row['Valor aluguel']) else 0,
                'iptu': 0,  # Não está na planilha
                'condominio': 0,  # Não está na planilha  
                'taxa_incendio': 0,
                'matricula_imovel': str(row['matricula do imovel']) if pd.notna(row['matricula do imovel']) else '',
                'area_imovel': '',
                'permite_pets': False,
                'aceita_pets': False,
                'mobiliado': False,
                'quartos': 0,
                'banheiros': 0,
                'vagas_garagem': 0,
                'observacoes': '',
                
                # Endereço estruturado
                'endereco_estruturado': {
                    'rua': row['rua/logradouro'],
                    'numero': str(row['numero']),
                    'complemento': str(row['complemento']) if pd.notna(row['complemento']) else '',
                    'bairro': row['bairro'],
                    'cidade': row['cidade'],
                    'estado': row['estado'],
                    'cep': str(row['cep'])
                },
                
                # Dados IPTU
                'titular_iptu': str(row['titular iptu']) if pd.notna(row['titular iptu']) else '',
                'inscricao_imobiliaria': str(row['inscrição imobiliaria']) if pd.notna(row['inscrição imobiliaria']) else '',
                'indicacao_fiscal': str(row['indicação fiscal casa']) if pd.notna(row['indicação fiscal casa']) else '',
                'info_iptu': f"Sub Lote: {row['sub lote']}" if pd.notna(row['sub lote']) else '',
                
                # Dados do condomínio
                'nome_condominio': str(row['nome do condominio']) if pd.notna(row['nome do condominio']) else '',
                'sindico_condominio': str(row['sindico']) if pd.notna(row['sindico']) else '',
                'email_condominio': str(row['email']) if pd.notna(row['email']) else '',
                'telefone_condominio': str(row['telefone']) if pd.notna(row['telefone']) else '',
                
                # Serviços
                'copel_unidade_consumidora': str(row['unidade consumidora']) if pd.notna(row['unidade consumidora']) else '',
                'sanepar_matricula': str(row['sanepar']) if pd.notna(row['sanepar']) else '',
                'tem_gas': row['gás'].lower() in ['sim', 's'] if pd.notna(row['gás']) else False,
                
                # Locadores (novo formato)
                'locadores': [{
                    'locador_id': locador['id'],
                    'porcentagem': 100.0,
                    'responsabilidade_principal': True
                }]
            }
            
            # Verificar se tem condomínio
            tem_condominio = row['condominio'].lower() in ['sim', 's'] if pd.notna(row['condominio']) else False
            if not tem_condominio:
                # Limpar dados de condomínio se não tem
                imovel_data['nome_condominio'] = ''
                imovel_data['sindico_condominio'] = ''
                imovel_data['email_condominio'] = ''
                imovel_data['telefone_condominio'] = ''
            
            # 3. Inserir o imóvel
            print("Inserindo imóvel no sistema...")
            resultado = inserir_imovel(**imovel_data)
            
            if resultado:
                print(f"✅ Imóvel cadastrado com sucesso!")
                print(f"   Endereço: {imovel_data['endereco_estruturado']['rua']}, {imovel_data['endereco_estruturado']['numero']}")
                print(f"   Tipo: {imovel_data['tipo']}")
                print(f"   Valor: R$ {imovel_data['valor_aluguel']}")
                sucesso += 1
            else:
                print(f"❌ Erro ao cadastrar imóvel")
                erro += 1
                
        except Exception as e:
            print(f"❌ Erro ao processar linha {idx + 1}: {e}")
            erro += 1
    
    # Relatório final
    print("\n" + "=" * 70)
    print("RELATÓRIO FINAL DA IMPORTAÇÃO")
    print("=" * 70)
    print(f"✅ Imóveis cadastrados com sucesso: {sucesso}")
    print(f"❌ Imóveis com erro: {erro}")
    print(f"📊 Total processado: {sucesso + erro}/{len(df)}")
    
    if proprietarios_nao_encontrados:
        print(f"\n⚠️ Proprietários não encontrados no sistema ({len(proprietarios_nao_encontrados)}):")
        for prop in proprietarios_nao_encontrados:
            print(f"   - {prop}")
        print("\nDica: Verifique se os nomes estão corretos ou cadastre os proprietários faltantes")
    
    print("\n" + "=" * 70)
    print("IMPORTAÇÃO CONCLUÍDA!")
    print("=" * 70)

if __name__ == "__main__":
    importar_imoveis()