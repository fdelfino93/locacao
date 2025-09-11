"""
Script SEGURO usando a função existente do sistema
- USA: repositories_adapter.inserir_imovel() (função que já funciona)
- TESTA: com apenas 1 imóvel primeiro
- ZERO modificações na estrutura do banco
"""

import pandas as pd
import sys
import os

# Adicionar o diretório atual ao path para importar repositories_adapter
sys.path.append(os.getcwd())

from repositories_adapter import inserir_imovel

def test_com_um_imovel():
    """Teste com apenas o primeiro imóvel"""
    print("=" * 60)
    print("TESTE SEGURO - APENAS 1 IMOVEL")
    print("=" * 60)
    
    # Ler planilha
    df = pd.read_excel('imovel.xlsx')
    
    # Mapear proprietários (já confirmamos que existem)
    proprietarios_map = {
        'Edison Eloi Plombon': 24,
        'Grzegorz Stanislaw Drozdz': 66,
        'David Bazzani': 77,
        'Maria Aparecida de Souza': 84,
        'Terezinha Maria de Souza Maia': 87
    }
    
    # Pegar apenas o PRIMEIRO imóvel para teste
    row = df.iloc[0]
    
    print(f"TESTE COM:")
    print(f"Proprietário: {row['proprietário 1']}")
    print(f"Endereço: {row['rua/logradouro']}, {row['numero']} - {row['bairro']}")
    print(f"Tipo: {row['tipo do imovel']}")
    print(f"Valor: R$ {row['Valor aluguel']}")
    
    try:
        # Preparar dados EXATAMENTE como o frontend faz
        proprietario_nome = row['proprietário 1']
        locador_id = proprietarios_map[proprietario_nome]
        
        # Usar a mesma estrutura que o frontend envia
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
            
            # Endereço estruturado (como o frontend faz)
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
            'copel_unidade_consumidora': str(int(row['unidade consumidora'])) if pd.notna(row['unidade consumidora']) else '',
            'sanepar_matricula': str(row['sanepar']) if pd.notna(row['sanepar']) else '',
            'tem_gas': str(row['gás']).lower() in ['sim', 's'] if pd.notna(row['gás']) else False,
            
            # Locadores (nova estrutura)
            'locadores': [{
                'locador_id': locador_id,
                'porcentagem': 100.0,
                'responsabilidade_principal': True
            }]
        }
        
        print(f"\\nChamando inserir_imovel() do sistema...")
        print(f"Dados preparados: {len(imovel_data)} campos")
        
        # Chamar a função EXISTENTE do sistema
        resultado = inserir_imovel(**imovel_data)
        
        if resultado:
            print(f"\\n✅ SUCESSO! Imóvel cadastrado.")
            print(f"✅ TESTE APROVADO - Sistema funcionando perfeitamente")
            print(f"\\n🔄 Quer prosseguir com os outros 30 imóveis? (s/n)")
            return True
        else:
            print(f"\\n❌ ERRO: Função retornou False")
            print(f"❌ TESTE FALHOU - Não prosseguir com importação")
            return False
            
    except Exception as e:
        print(f"\\n❌ ERRO DURANTE TESTE: {e}")
        print(f"❌ TESTE FALHOU - Sistema preservado")
        return False

def importar_todos_os_imoveis():
    """Importa todos os 31 imóveis usando a função existente"""
    print("\\n" + "=" * 60)
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
        print(f"\\n--- Imóvel {idx + 1}/31 ---")
        
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
            
            resultado = inserir_imovel(**imovel_data)
            
            if resultado:
                print(f"✅ SUCESSO")
                sucesso += 1
            else:
                print(f"❌ ERRO")
                erro += 1
                
        except Exception as e:
            print(f"❌ ERRO: {e}")
            erro += 1
    
    print(f"\\n" + "=" * 60)
    print("RELATÓRIO FINAL")
    print("=" * 60)
    print(f"✅ Sucesso: {sucesso}/31")
    print(f"❌ Erro: {erro}/31")
    
    if erro == 0:
        print(f"\\n🎉 IMPORTAÇÃO 100% CONCLUÍDA!")
    else:
        print(f"\\n⚠️ Alguns erros ocorreram")

if __name__ == "__main__":
    # APENAS TESTE PRIMEIRO
    teste_ok = test_com_um_imovel()
    
    # SE TESTE OK, PERGUNTAR SE QUER CONTINUAR
    if teste_ok:
        resposta = input("\\nTeste funcionou! Continuar com todos os 31 imóveis? (s/n): ")
        if resposta.lower() in ['s', 'sim', 'yes', 'y']:
            importar_todos_os_imoveis()
        else:
            print("\\n✅ Importação cancelada pelo usuário. Sistema preservado.")
    else:
        print("\\n✅ Teste falhou. Sistema preservado. Nenhuma alteração feita.")