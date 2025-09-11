"""
Script para importar imóveis diretamente no banco
Usa EXATAMENTE a mesma estrutura que o frontend ModernImovelFormV2.tsx
- Testa com 1 imóvel primeiro
- Se funcionar, pergunta se quer continuar com todos
- Insere em todas as tabelas necessárias: Imoveis, EnderecoImoveis, ImovelLocadores
"""

import pandas as pd
import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_conexao():
    connection_string = (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    return pyodbc.connect(connection_string)

def inserir_imovel_completo(imovel_data):
    """Insere imóvel exatamente como o frontend faz"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            # Verificar se imóvel já existe (mesmo endereço e locador)
            addr = imovel_data['endereco_estruturado']
            endereco_check = f"{addr['rua']}, {addr['numero']}"
            if addr.get('complemento'):
                endereco_check += f", {addr['complemento']}"
            endereco_check += f" - {addr['bairro']}"
            
            cursor.execute("""
                SELECT id FROM Imoveis 
                WHERE endereco LIKE ? AND id_locador = ? AND ativo = 1
            """, (f'%{endereco_check}%', imovel_data['id_locador']))
            
            if cursor.fetchone():
                print(f"AVISO: Imovel ja existe no sistema")
                return "JA_EXISTS"
            
            # 1. Inserir endereço primeiro (igual frontend)
            endereco_id = None
            if 'endereco_estruturado' in imovel_data:
                addr = imovel_data['endereco_estruturado']
                cursor.execute("""
                    INSERT INTO EnderecoImovel (rua, numero, complemento, bairro, cidade, uf, cep)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    addr['rua'],
                    addr['numero'], 
                    addr['complemento'],
                    addr['bairro'],
                    addr['cidade'],
                    addr['estado'],
                    addr['cep']
                ))
                
                cursor.execute("SELECT @@IDENTITY")
                endereco_id = cursor.fetchone()[0]
            
            # 2. Criar string de endereço para compatibilidade
            endereco_string = ""
            if 'endereco_estruturado' in imovel_data:
                addr = imovel_data['endereco_estruturado']
                endereco_string = f"{addr['rua']}, {addr['numero']}"
                if addr.get('complemento'):
                    endereco_string += f", {addr['complemento']}"
                endereco_string += f" - {addr['bairro']} - {addr['cidade']}/{addr['estado']}"
            
            # 3. Inserir na tabela Imoveis (todos os campos do frontend)
            cursor.execute("""
                INSERT INTO Imoveis (
                    id_locador, tipo, endereco, endereco_id, valor_aluguel, iptu, condominio,
                    taxa_incendio, matricula_imovel, area_imovel, permite_pets, aceita_pets, 
                    mobiliado, quartos, banheiros, vagas_garagem, observacoes, titular_iptu,
                    inscricao_imobiliaria, indicacao_fiscal, info_iptu, nome_condominio,
                    sindico_condominio, email_condominio, telefone_condominio,
                    copel_unidade_consumidora, sanepar_matricula, tem_gas, status,
                    ativo, data_cadastro, data_atualizacao
                ) VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), GETDATE()
                )
            """, (
                imovel_data['id_locador'],  # Locador principal para compatibilidade
                imovel_data['tipo'],
                endereco_string,
                endereco_id,
                imovel_data['valor_aluguel'],
                imovel_data.get('iptu', 0),
                imovel_data.get('condominio', 0),
                imovel_data.get('taxa_incendio', 0),
                imovel_data.get('matricula_imovel', ''),
                imovel_data.get('area_imovel', ''),
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
            
            # 4. Inserir na tabela ImovelLocadores (nova estrutura do frontend)
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

def test_com_um_imovel():
    """Teste com apenas 1 imóvel"""
    print("=" * 60)
    print("TESTE SEGURO - APENAS 1 IMOVEL")
    print("=" * 60)
    
    # Ler planilha
    df = pd.read_excel('imovel.xlsx')
    
    # Mapear proprietários (confirmado que existem)
    proprietarios_map = {
        'Edison Eloi Plombon': 24,
        'Grzegorz Stanislaw Drozdz': 66,
        'David Bazzani': 77,
        'Maria Aparecida de Souza': 84,
        'Terezinha Maria de Souza Maia': 87
    }
    
    # Pegar apenas o PRIMEIRO imóvel
    row = df.iloc[0]
    
    print(f"TESTE COM:")
    print(f"Proprietário: {row['proprietário 1']}")
    print(f"Endereço: {row['rua/logradouro']}, {row['numero']} - {row['bairro']}")
    print(f"Tipo: {row['tipo do imovel']}")
    print(f"Valor: R$ {row['Valor aluguel']}")
    
    try:
        proprietario_nome = row['proprietário 1']
        locador_id = proprietarios_map[proprietario_nome]
        
        # Preparar dados EXATAMENTE como frontend
        imovel_data = {
            'id_locador': locador_id,  # Para compatibilidade com campo legado
            'tipo': row['tipo do imovel'],
            'status': 'Disponível' if row['status'].lower() in ['disponível', 'disponivel'] else 'Ocupado',
            'valor_aluguel': float(row['Valor aluguel']) if pd.notna(row['Valor aluguel']) else 0,
            'iptu': 0,
            'condominio': 0,
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
            
            # Endereço estruturado (como frontend)
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
            
            # Serviços (campos que você perguntou)
            'copel_unidade_consumidora': str(int(row['unidade consumidora'])) if pd.notna(row['unidade consumidora']) else '',
            'sanepar_matricula': str(row['sanepar']) if pd.notna(row['sanepar']) else '',
            'tem_gas': str(row['gás']).lower() in ['sim', 's'] if pd.notna(row['gás']) else False,
            
            # Array de locadores (estrutura nova do frontend)
            'locadores': [{
                'locador_id': locador_id,
                'porcentagem': 100.0,
                'responsabilidade_principal': True
            }]
        }
        
        print(f"\nInserindo diretamente no banco...")
        print(f"Dados preparados: {len(imovel_data)} campos")
        
        resultado = inserir_imovel_completo(imovel_data)
        
        if resultado == "JA_EXISTS":
            print(f"\nAVISO: Imovel ja existe no sistema")
            return True
        elif resultado:
            print(f"\nSUCESSO! Imovel cadastrado (ID: {resultado})")
            print(f"TESTE APROVADO - Insercao funcionando")
            return True
        else:
            print(f"\nERRO: Falha na insercao")
            return False
            
    except Exception as e:
        print(f"\nERRO DURANTE TESTE: {e}")
        return False

def importar_todos_imoveis():
    """Importa todos os 31 imóveis"""
    print("\n" + "=" * 60)
    print("IMPORTACAO COMPLETA - TODOS OS 31 IMOVEIS")
    print("=" * 60)
    
    df = pd.read_excel('imovel.xlsx')
    
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
        print(f"\n--- Imóvel {idx + 1}/31 ---")
        
        try:
            proprietario_nome = row['proprietário 1']
            locador_id = proprietarios_map[proprietario_nome]
            
            print(f"Proprietário: {proprietario_nome}")
            print(f"Endereço: {row['rua/logradouro']}, {row['numero']}")
            
            imovel_data = {
                'id_locador': locador_id,
                'tipo': row['tipo do imovel'],
                'status': 'Disponível' if row['status'].lower() in ['disponível', 'disponivel'] else 'Ocupado',
                'valor_aluguel': float(row['Valor aluguel']) if pd.notna(row['Valor aluguel']) else 0,
                'iptu': 0,
                'condominio': 0,
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
                
                'copel_unidade_consumidora': str(int(row['unidade consumidora'])) if pd.notna(row['unidade consumidora']) else '',
                'sanepar_matricula': str(row['sanepar']) if pd.notna(row['sanepar']) else '',
                'tem_gas': str(row['gás']).lower() in ['sim', 's'] if pd.notna(row['gás']) else False,
                
                'locadores': [{
                    'locador_id': locador_id,
                    'porcentagem': 100.0,
                    'responsabilidade_principal': True
                }]
            }
            
            resultado = inserir_imovel_completo(imovel_data)
            
            if resultado == "JA_EXISTS":
                print(f"JA EXISTE")
                sucesso += 1
            elif resultado:
                print(f"SUCESSO (ID: {resultado})")
                sucesso += 1
            else:
                print(f"ERRO")
                erro += 1
                
        except Exception as e:
            print(f"ERRO: {e}")
            erro += 1
    
    print(f"\n" + "=" * 60)
    print("RELATÓRIO FINAL")
    print("=" * 60)
    print(f"Sucesso: {sucesso}/31")
    print(f"Erro: {erro}/31")
    
    if erro == 0:
        print(f"\nTODOS OS 31 IMOVEIS IMPORTADOS!")
    else:
        print(f"\nAlguns erros ocorreram")

if __name__ == "__main__":
    # TESTE PRIMEIRO
    print("Iniciando teste com 1 imóvel...")
    teste_ok = test_com_um_imovel()
    
    if teste_ok:
        resposta = input("\nTeste funcionou! Continuar com todos os 31 imoveis? (s/n): ")
        if resposta.lower() in ['s', 'sim', 'yes', 'y']:
            importar_todos_imoveis()
        else:
            print("\nImportacao cancelada. Sistema preservado.")
    else:
        print("\nTeste falhou. Sistema preservado.")