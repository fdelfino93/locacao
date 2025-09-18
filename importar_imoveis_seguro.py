"""
Script SEGURO para importar imóveis de planilha Excel para o sistema
- Importa um por vez
- Verifica cada etapa
- Para se houver erro
"""

import pandas as pd
import pyodbc
import os
import time
from dotenv import load_dotenv

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
        print(f"ERRO ao buscar locador {nome}: {e}")
        return None

def inserir_endereco_imovel(cursor, endereco_data):
    """Insere um endereço para imóvel"""
    try:
        cursor.execute("""
            INSERT INTO EnderecoImoveis (rua, numero, complemento, bairro, cidade, estado, cep)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            endereco_data['rua'],
            endereco_data['numero'],
            endereco_data['complemento'],
            endereco_data['bairro'],
            endereco_data['cidade'],
            endereco_data['estado'],
            endereco_data['cep']
        ))
        
        cursor.execute("SELECT @@IDENTITY")
        endereco_id = cursor.fetchone()[0]
        return endereco_id
    except Exception as e:
        print(f"ERRO ao inserir endereço: {e}")
        return None

def inserir_imovel_seguro(imovel_data):
    """Insere um imóvel de forma segura"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            # 1. Inserir endereço primeiro
            endereco_id = None
            if 'endereco_estruturado' in imovel_data:
                endereco_id = inserir_endereco_imovel(cursor, imovel_data['endereco_estruturado'])
                if not endereco_id:
                    return False
            
            # 2. Preparar string de endereço para compatibilidade
            endereco_string = ""
            if 'endereco_estruturado' in imovel_data:
                addr = imovel_data['endereco_estruturado']
                endereco_string = f"{addr['rua']}, {addr['numero']}"
                if addr.get('complemento'):
                    endereco_string += f", {addr['complemento']}"
                endereco_string += f" - {addr['bairro']} - {addr['cidade']}/{addr['estado']}"
            
            # 3. Inserir na tabela Imoveis
            cursor.execute("""
                INSERT INTO Imoveis (
                    id_locador, tipo, endereco, endereco_id, valor_aluguel, iptu, condominio,
                    taxa_incendio, matricula_imovel, permite_pets, aceita_pets, mobiliado,
                    quartos, banheiros, vagas_garagem, observacoes, titular_iptu,
                    inscricao_imobiliaria, indicacao_fiscal, info_iptu, nome_condominio,
                    sindico_condominio, email_condominio, telefone_condominio,
                    copel_unidade_consumidora, sanepar_matricula, tem_gas, status,
                    ativo, data_cadastro, data_atualizacao
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), GETDATE()
                )
            """, (
                imovel_data['id_locador'],
                imovel_data['tipo'],
                endereco_string,
                endereco_id,
                imovel_data['valor_aluguel'],
                imovel_data.get('iptu', 0),
                imovel_data.get('condominio', 0),
                imovel_data.get('taxa_incendio', 0),
                imovel_data.get('matricula_imovel', ''),
                imovel_data.get('permite_pets', False),
                imovel_data.get('aceita_pets', False),
                imovel_data.get('mobiliado', False),
                imovel_data.get('quartos', 0),
                imovel_data.get('banheiros', 0),
                imovel_data.get('vagas_garagem', 0),
                imovel_data.get('observacoes', ''),
                imovel_data.get('titular_iptu', ''),
                imovel_data.get('inscricao_imobiliaria', ''),
                imovel_data.get('indicacao_fiscal', ''),
                imovel_data.get('info_iptu', ''),
                imovel_data.get('nome_condominio', ''),
                imovel_data.get('sindico_condominio', ''),
                imovel_data.get('email_condominio', ''),
                imovel_data.get('telefone_condominio', ''),
                imovel_data.get('copel_unidade_consumidora', ''),
                imovel_data.get('sanepar_matricula', ''),
                imovel_data.get('tem_gas', False),
                imovel_data.get('status', 'Disponível'),
                True  # ativo
            ))
            
            cursor.execute("SELECT @@IDENTITY")
            imovel_id = cursor.fetchone()[0]
            
            # 4. Inserir na tabela ImovelLocadores (nova estrutura)
            if 'locadores' in imovel_data:
                for locador in imovel_data['locadores']:
                    cursor.execute("""
                        INSERT INTO ImovelLocadores (imovel_id, locador_id, porcentagem, responsabilidade_principal, ativo)
                        VALUES (?, ?, ?, ?, 1)
                    """, (
                        imovel_id,
                        locador['locador_id'],
                        locador['porcentagem'],
                        locador['responsabilidade_principal']
                    ))
            
            conn.commit()
            return imovel_id
            
    except Exception as e:
        print(f"ERRO ao inserir imóvel: {e}")
        return False

def importar_imoveis_seguro():
    print("=" * 70)
    print("IMPORTACAO SEGURA DE IMOVEIS - UM POR VEZ")
    print("=" * 70)
    
    # Ler planilha
    df = pd.read_excel('imovel.xlsx')
    print(f"Total de imoveis para importar: {len(df)}")
    
    # Mapear proprietários
    proprietarios_map = {
        'Edison Eloi Plombon': 24,
        'Grzegorz Stanislaw Drozdz': 66,
        'David Bazzani': 77,
        'Maria Aparecida de Souza': 84,
        'Terezinha Maria de Souza Maia': 87
    }
    
    sucesso = 0
    erro = 0
    
    for idx, row in df.iterrows():
        print(f"\\n--- IMOVEL {idx + 1}/{len(df)} ---")
        
        try:
            proprietario_nome = row['proprietário 1']
            locador_id = proprietarios_map[proprietario_nome]
            
            print(f"Proprietario: {proprietario_nome} (ID: {locador_id})")
            print(f"Endereco: {row['rua/logradouro']}, {row['numero']} - {row['bairro']}")
            print(f"Tipo: {row['tipo do imovel']} | Valor: R$ {row['Valor aluguel']}")
            
            # Preparar dados
            imovel_data = {
                'id_locador': locador_id,
                'tipo': row['tipo do imovel'],
                'status': 'Disponível' if row['status'].lower() in ['disponível', 'disponivel'] else 'Ocupado',
                'valor_aluguel': float(row['Valor aluguel']) if pd.notna(row['Valor aluguel']) else 0,
                'iptu': 0,
                'condominio': 0,
                'taxa_incendio': 0,
                'matricula_imovel': str(row['matricula do imovel']) if pd.notna(row['matricula do imovel']) else '',
                'permite_pets': False,
                'aceita_pets': False,
                'mobiliado': False,
                'quartos': 0,
                'banheiros': 0,
                'vagas_garagem': 0,
                'observacoes': '',
                
                'endereco_estruturado': {
                    'rua': row['rua/logradouro'],
                    'numero': str(row['numero']),
                    'complemento': str(row['complemento']) if pd.notna(row['complemento']) else '',
                    'bairro': row['bairro'],
                    'cidade': row['cidade'],
                    'estado': row['estado'],
                    'cep': str(row['cep'])
                },
                
                'titular_iptu': str(row['titular iptu']) if pd.notna(row['titular iptu']) else '',
                'inscricao_imobiliaria': str(row['inscrição imobiliaria']) if pd.notna(row['inscrição imobiliaria']) else '',
                'indicacao_fiscal': str(row['indicação fiscal casa']) if pd.notna(row['indicação fiscal casa']) else '',
                'info_iptu': f"Sub Lote: {row['sub lote']}" if pd.notna(row['sub lote']) else '',
                
                'nome_condominio': str(row['nome do condominio']) if pd.notna(row['nome do condominio']) else '',
                'sindico_condominio': str(row['sindico']) if pd.notna(row['sindico']) else '',
                'email_condominio': str(row['email']) if pd.notna(row['email']) else '',
                'telefone_condominio': str(row['telefone']) if pd.notna(row['telefone']) else '',
                
                'copel_unidade_consumidora': str(row['unidade consumidora']) if pd.notna(row['unidade consumidora']) else '',
                'sanepar_matricula': str(row['sanepar']) if pd.notna(row['sanepar']) else '',
                'tem_gas': str(row['gás']).lower() in ['sim', 's'] if pd.notna(row['gás']) else False,
                
                'locadores': [{
                    'locador_id': locador_id,
                    'porcentagem': 100.0,
                    'responsabilidade_principal': True
                }]
            }
            
            # Inserir
            resultado = inserir_imovel_seguro(imovel_data)
            
            if resultado:
                print(f"SUCESSO - Imovel cadastrado (ID: {resultado})")
                sucesso += 1
                time.sleep(0.5)  # Pausa para segurança
            else:
                print(f"ERRO - Falha ao cadastrar imovel")
                erro += 1
                
        except Exception as e:
            print(f"ERRO GERAL no imovel {idx + 1}: {e}")
            erro += 1
    
    print(f"\\n" + "=" * 70)
    print("RELATORIO FINAL DA IMPORTACAO")
    print("=" * 70)
    print(f"SUCESSO: {sucesso} imoveis")
    print(f"ERRO: {erro} imoveis")
    print(f"TOTAL: {sucesso + erro}/{len(df)}")
    
    if erro == 0:
        print(f"\\nTODOS OS IMOVEIS FORAM IMPORTADOS COM SUCESSO!")
    else:
        print(f"\\nALGUNS IMOVEIS TIVERAM ERRO - VERIFICAR LOGS ACIMA")

if __name__ == "__main__":
    importar_imoveis_seguro()