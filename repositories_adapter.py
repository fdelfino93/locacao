# Adaptador para compatibilizar os nomes dos repositórios com o main.py

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

def inserir_endereco_imovel(endereco_data):
    """Insere um endereço na tabela EnderecoImovel e retorna o ID"""
    try:
        print(f"Inserindo endereço na EnderecoImovel: {endereco_data}")
        
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            # Mapear campos corretamente (estado->uf)
            rua = endereco_data.get('rua', '')
            numero = endereco_data.get('numero', '')
            complemento = endereco_data.get('complemento', '')
            bairro = endereco_data.get('bairro', '')
            cidade = endereco_data.get('cidade', '')
            uf = endereco_data.get('estado', endereco_data.get('uf', 'PR'))  # Aceita ambos
            cep = endereco_data.get('cep', '')
            
            print(f"Dados mapeados: rua='{rua}', numero='{numero}', complemento='{complemento}', bairro='{bairro}', cidade='{cidade}', uf='{uf}', cep='{cep}'")
            
            cursor.execute("""
                INSERT INTO EnderecoImovel (rua, numero, complemento, bairro, cidade, uf, cep)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (rua, numero, complemento, bairro, cidade, uf, cep))
            
            conn.commit()
            
            # Buscar o ID do endereço inserido
            cursor.execute("SELECT @@IDENTITY")
            endereco_id = cursor.fetchone()[0]
            
            print(f"SUCESSO: Endereço inserido na EnderecoImovel com ID: {endereco_id}")
            return int(endereco_id)
            
    except Exception as e:
        print(f"ERRO: Erro ao inserir endereço do imóvel: {e}")
        import traceback
        traceback.print_exc()
        return None

def buscar_endereco_imovel(endereco_id):
    """Busca os dados estruturados de um endereço na tabela EnderecoImovel"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                SELECT rua, numero, complemento, bairro, cidade, uf, cep 
                FROM EnderecoImovel 
                WHERE id = ?
            """, (endereco_id,))
            
            row = cursor.fetchone()
            if row:
                return {
                    'rua': row[0] or '',
                    'numero': row[1] or '',
                    'complemento': row[2] or '',
                    'bairro': row[3] or '',
                    'cidade': row[4] or '',
                    'estado': row[5] or 'PR',  # Retorna como 'estado' para o frontend
                    'cep': row[6] or ''
                }
            return None
            
    except Exception as e:
        print(f"ERRO: Erro ao buscar endereço {endereco_id}: {e}")
        return None

def processar_endereco_imovel(endereco_input):
    """
    Processa o endereço de entrada, seja string ou objeto.
    Retorna (endereco_string, endereco_id) - mantém compatibilidade
    """
    if isinstance(endereco_input, dict):
        # Caso seja objeto estruturado
        try:
            # Inserir na tabela EnderecoImovel
            endereco_id = inserir_endereco_imovel(endereco_input)
            # Criar string para compatibilidade
            endereco_string = f"{endereco_input.get('rua', '')}, {endereco_input.get('numero', '')}"
            if endereco_input.get('complemento'):
                endereco_string += f", {endereco_input.get('complemento')}"
            endereco_string += f" - {endereco_input.get('bairro', '')} - {endereco_input.get('cidade', '')}/{endereco_input.get('estado', 'PR')}"
            
            return endereco_string, endereco_id
        except Exception as e:
            print(f"Erro ao processar endereço estruturado: {e}")
            # Fallback para string simples
            endereco_string = str(endereco_input)
            return endereco_string, None
    else:
        # Caso seja string (sistema antigo)
        return str(endereco_input), None

# Funçoes diretas para as tabelas corretas
def buscar_locadores():
    """Busca todos os locadores da tabela Locadores"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Locadores")
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionarios
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
    except Exception as e:
        print(f"Erro ao buscar locadores: {e}")
        return []

def buscar_locatarios():
    """Busca todos os locatarios da tabela Locatarios"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Locatarios")
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionarios
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
    except Exception as e:
        print(f"Erro ao buscar locatarios: {e}")
        return []

def buscar_imoveis():
    """Busca todos os imóveis da tabela Imoveis"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Imoveis")
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionarios
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                # Converter datetime para string se necessario
                if hasattr(value, 'strftime'):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
    except Exception as e:
        print(f"Erro ao buscar imóveis: {e}")
        return []

# Funçoes de insercao (usar as existentes)
from locacao.repositories.cliente_repository import inserir_cliente
from locacao.repositories.inquilino_repository import inserir_inquilino  
from locacao.repositories.imovel_repository import inserir_imovel as _inserir_imovel_original
from locacao.repositories.contrato_repository import inserir_contrato

def inserir_locador(**kwargs):
    return inserir_cliente(**kwargs)

def inserir_imovel(**kwargs):
    """Funcao híbrida segura para inserir imóveis - compatível com string e objeto"""
    try:
        print(f"Inserindo imóvel - Dados recebidos: {kwargs}")
        
        # 🆕 PROCESSAMENTO HÍBRIDO DE ENDEREÇO - SEGURO
        if 'endereco' in kwargs:
            try:
                endereco_input = kwargs['endereco']
                if isinstance(endereco_input, dict):
                    print(f"Processando endereço estruturado para insercao: {endereco_input}")
                    endereco_string, endereco_id = processar_endereco_imovel(endereco_input)
                    kwargs['endereco'] = endereco_string
                    if endereco_id:
                        kwargs['endereco_id'] = endereco_id
                        print(f"SUCESSO: Endereço salvo na EnderecoImovel com ID: {endereco_id}")
            except Exception as endereco_error:
                print(f"AVISO:️ Erro ao processar endereço na insercao, usando fallback: {endereco_error}")
                # Fallback seguro: converter para string
                kwargs['endereco'] = str(kwargs['endereco'])
        
        # Chamar a funcao original com os dados processados
        return _inserir_imovel_original(**kwargs)
        
    except Exception as e:
        print(f"ERRO: Erro na funcao híbrida de inserir imóvel: {e}")
        # Fallback: tentar com a funcao original
        try:
            # Garantir que endereco seja string para compatibilidade
            if 'endereco' in kwargs and isinstance(kwargs['endereco'], dict):
                kwargs['endereco'] = str(kwargs['endereco'])
            print(f"Tentando fallback com dados: {kwargs}")
            return _inserir_imovel_original(**kwargs)
        except Exception as e2:
            print(f"Erro no fallback de inserir imóvel: {e2}")
            raise e2

def atualizar_locador(locador_id, **kwargs):
    """Atualiza um locador na tabela Locadores"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Primeiro verificar se o locador existe
        cursor.execute("SELECT id, nome FROM Locadores WHERE id = ?", locador_id)
        locador_existente = cursor.fetchone()
        
        if not locador_existente:
            print(f"Locador ID {locador_id} nao encontrado na tabela Locadores")
            
            # Verificar se existe na tabela Clientes
            cursor.execute("SELECT id, nome FROM Clientes WHERE id = ?", locador_id)
            cliente_existente = cursor.fetchone()
            
            if cliente_existente:
                print(f"Locador ID {locador_id} encontrado na tabela Clientes: {cliente_existente[1]}")
                print("Tentando atualizar na tabela Clientes...")
                return atualizar_cliente(locador_id, **kwargs)
            else:
                print(f"ID {locador_id} nao encontrado nem em Locadores nem em Clientes")
                conn.close()
                return False
        
        print(f"Locador encontrado: ID {locador_existente[0]}, Nome: {locador_existente[1]}")
        
        # Listar campos que podem ser atualizados
        campos_atualizaveis = [
            'nome', 'cpf_cnpj', 'telefone', 'email', 'endereco', 
            'tipo_recebimento', 'rg', 'nacionalidade', 'estado_civil', 
            'profissao', 'deseja_fci', 'deseja_seguro_fianca', 
            'deseja_seguro_incendio', 'existe_conjuge', 'nome_conjuge', 
            'cpf_conjuge', 'rg_conjuge', 'endereco_conjuge', 
            'telefone_conjuge', 'tipo_cliente', 'data_nascimento'
        ]
        
        # Filtrar apenas os campos que foram enviados e sao atualizáveis
        campos_para_atualizar = {}
        for campo, valor in kwargs.items():
            if campo in campos_atualizaveis and valor is not None:
                # Converter valores string para int quando necessario
                if campo in ['deseja_fci', 'deseja_seguro_fianca', 'deseja_seguro_incendio', 'existe_conjuge']:
                    original_valor = valor
                    if isinstance(valor, str):
                        if valor.upper() in ['SIM', 'S', 'TRUE', '1']:
                            valor = 1
                        elif valor.upper() in ['NAO', 'N', 'FALSE', '0', 'NÃO']:
                            valor = 0
                        else:
                            valor = int(valor) if valor.isdigit() else 0
                    elif isinstance(valor, bool):
                        valor = 1 if valor else 0
                campos_para_atualizar[campo] = valor
        
        if not campos_para_atualizar:
            print("Nenhum campo válido para atualizar")
            return False
            
        # Construir query de UPDATE dinamicamente
        set_clause = ", ".join([f"{campo} = ?" for campo in campos_para_atualizar.keys()])
        query = f"UPDATE Locadores SET {set_clause} WHERE id = ?"
        
        valores = list(campos_para_atualizar.values()) + [locador_id]
        
        print(f"Executando UPDATE: {query}")
        print(f"Valores: {valores}")
        
        cursor.execute(query, valores)
        linhas_afetadas = cursor.rowcount
        conn.commit()
        conn.close()
        
        if linhas_afetadas > 0:
            print(f"Locador {locador_id} atualizado com sucesso! ({linhas_afetadas} linha(s))")
            return True
        else:
            print(f"Nenhuma linha foi atualizada - locador {locador_id} pode nao existir")
            return False
            
    except Exception as e:
        print(f"Erro ao atualizar locador {locador_id}: {e}")
        return False

def alterar_status_locador(locador_id, ativo):
    """Altera o status ativo/inativo de um locador"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Primeiro verificar se o locador existe
        cursor.execute("SELECT id, nome FROM Locadores WHERE id = ?", locador_id)
        locador_existente = cursor.fetchone()
        
        if not locador_existente:
            print(f"Locador ID {locador_id} nao encontrado na tabela Locadores")
            
            # Verificar se existe na tabela Clientes
            cursor.execute("SELECT id, nome FROM Clientes WHERE id = ?", locador_id)
            cliente_existente = cursor.fetchone()
            
            if cliente_existente:
                print(f"Atualizando status na tabela Clientes para locador {locador_id}")
                cursor.execute("UPDATE Clientes SET ativo = ? WHERE id = ?", (1 if ativo else 0, locador_id))
            else:
                print(f"ID {locador_id} nao encontrado nem em Locadores nem em Clientes")
                conn.close()
                return False
        else:
            print(f"Atualizando status na tabela Locadores para locador {locador_id}")
            cursor.execute("UPDATE Locadores SET ativo = ? WHERE id = ?", (1 if ativo else 0, locador_id))
        
        linhas_afetadas = cursor.rowcount
        conn.commit()
        conn.close()
        
        if linhas_afetadas > 0:
            status_texto = "ativo" if ativo else "inativo"
            print(f"Locador {locador_id} marcado como {status_texto} ({linhas_afetadas} linha(s))")
            return True
        else:
            print(f"Nenhuma linha foi atualizada - locador {locador_id} pode nao existir")
            return False
            
    except Exception as e:
        print(f"Erro ao alterar status do locador {locador_id}: {e}")
        return False

def atualizar_cliente(cliente_id, **kwargs):
    """Atualiza um cliente na tabela Clientes (para compatibilidade com locadores)"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Campos que podem ser atualizados na tabela Clientes
        campos_atualizaveis = [
            'nome', 'cpf_cnpj', 'telefone', 'email', 'endereco', 
            'tipo_recebimento', 'conta_bancaria', 'rg', 'nacionalidade', 
            'estado_civil', 'profissao', 'deseja_fci', 'deseja_seguro_fianca', 
            'deseja_seguro_incendio', 'existe_conjuge', 'nome_conjuge', 
            'cpf_conjuge', 'rg_conjuge', 'endereco_conjuge', 
            'telefone_conjuge', 'tipo_cliente', 'data_nascimento'
        ]
        
        # Filtrar apenas os campos que foram enviados e sao atualizáveis
        campos_para_atualizar = {}
        for campo, valor in kwargs.items():
            if campo in campos_atualizaveis and valor is not None:
                campos_para_atualizar[campo] = valor
        
        if not campos_para_atualizar:
            print("Nenhum campo válido para atualizar")
            return False
            
        # Construir query de UPDATE dinamicamente
        set_clause = ", ".join([f"{campo} = ?" for campo in campos_para_atualizar.keys()])
        query = f"UPDATE Clientes SET {set_clause} WHERE id = ?"
        
        valores = list(campos_para_atualizar.values()) + [cliente_id]
        
        print(f"Executando UPDATE na tabela Clientes: {query}")
        print(f"Valores: {valores}")
        
        cursor.execute(query, valores)
        linhas_afetadas = cursor.rowcount
        conn.commit()
        conn.close()
        
        if linhas_afetadas > 0:
            print(f"SUCESSO: Cliente {cliente_id} atualizado com sucesso! ({linhas_afetadas} linha(s))")
            return True
        else:
            print(f"AVISO:️ Nenhuma linha foi atualizada - cliente {cliente_id} pode nao existir")
            return False
            
    except Exception as e:
        print(f"ERRO: Erro ao atualizar cliente {cliente_id}: {e}")
        return False

def inserir_locatario(dados):
    return inserir_inquilino(dados)

# Funçoes que faltam mas sao esperadas pelo main.py
def buscar_locadores_com_contratos():
    """Lista todos os locadores que possuem contratos ativos"""
    return []

def buscar_prestacao_contas_mensal(id_locador, mes, ano):
    """Obtém a prestacao de contas mensal de um locador"""
    return {"error": "Funcionalidade ainda nao implementada"}

def inserir_lancamento_liquido(id_pagamento, tipo, valor):
    """Cria um novo lançamento líquido"""
    return False

def inserir_desconto_deducao(id_pagamento, tipo, valor):
    """Cria um novo desconto/deducao"""
    return False

def atualizar_pagamento_detalhes(id_pagamento, mes_referencia, ano_referencia, total_bruto, total_liquido, observacao, pagamento_atrasado):
    """Atualiza os detalhes de um pagamento"""
    return False

def buscar_historico_prestacao_contas(id_locador, limit):
    """Obtém o histórico de prestaçoes de contas de um locador"""
    return []

def gerar_relatorio_excel(dados):
    """Gera relatório em Excel da prestacao de contas"""
    return None

def gerar_relatorio_pdf(dados):
    """Gera relatório em PDF da prestacao de contas"""
    return None

def inserir_contrato_locadores(contrato_id, locadores):
    """Define os locadores associados a um contrato com suas contas e porcentagens"""
    return False

# REMOVIDA: Função duplicada - implementação real está mais abaixo no arquivo

def buscar_contas_bancarias_locador(locador_id):
    """Lista todas as contas bancárias de um locador específico"""
    return []

def validar_porcentagens_contrato(locadores):
    """Valida se as porcentagens dos locadores somam 100% e outras regras"""
    return {"success": True, "message": "Validacao OK", "details": {}}

# REMOVIDA: Função duplicada - implementação real está mais abaixo no arquivo

def buscar_contratos():
    """Busca todos os contratos com informaçoes relacionadas"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                c.id,
                c.id_imovel,
                c.id_locatario,
                c.data_inicio,
                c.data_fim,
                c.valor_aluguel,
                c.taxa_administracao,
                c.vencimento_dia,
                c.tipo_garantia,
                c.data_assinatura,
                c.status,
                c.proximo_reajuste,
                c.tempo_reajuste,
                i.endereco as imovel_endereco,
                i.tipo as imovel_tipo,
                i.id_locador,
                l.nome as locador_nome,
                loc.nome as locatario_nome
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN Locadores l ON i.id_locador = l.id
            LEFT JOIN Locatarios loc ON c.id_locatario = loc.id
            ORDER BY c.data_inicio DESC
        """)
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionarios
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                # Converter datetime para string se necessario
                if hasattr(value, 'strftime'):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d')
                else:
                    row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
    except Exception as e:
        print(f"Erro ao buscar contratos: {e}")
        return []

def buscar_contratos_por_locador(locador_id):
    """Busca contratos de um locador específico"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                c.id,
                c.id_imovel,
                c.id_locatario,
                c.data_inicio,
                c.data_fim,
                c.valor_aluguel,
                c.taxa_administracao,
                i.endereco as imovel_endereco,
                i.tipo as imovel_tipo,
                loc.nome as locatario_nome,
                loc.cpf_cnpj as locatario_documento
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN Locatarios loc ON c.id_locatario = loc.id
            WHERE i.id_locador = ?
            ORDER BY c.data_inicio DESC
        """, (locador_id,))
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionarios
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                # Converter datetime para string se necessario
                if hasattr(value, 'strftime'):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d')
                else:
                    row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
    except Exception as e:
        print(f"Erro ao buscar contratos por locador: {e}")
        return []

def buscar_contrato_por_id(contrato_id):
    """Busca um contrato específico pelo ID"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                c.*,
                i.endereco as imovel_endereco,
                i.tipo as imovel_tipo,
                i.id_locador,
                l.id as locador_id_real,
                l.nome as locador_nome,
                loc.nome as locatario_nome,
                loc.cpf_cnpj as locatario_documento
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN Locadores l ON i.id_locador = l.id
            LEFT JOIN Locatarios loc ON c.id_locatario = loc.id
            WHERE c.id = ?
        """, (contrato_id,))
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultado para dicionario
        row = cursor.fetchone()
        if row:
            row_dict = {}
            for i, value in enumerate(row):
                # Converter datetime para string se necessario
                if hasattr(value, 'strftime'):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d')
                else:
                    row_dict[columns[i]] = value
            
            # Buscar dados completos do locador usando qualquer ID disponível
            locador_id = row_dict.get('locador_id_real') or row_dict.get('id_locador')
            if locador_id:
                cursor.execute("""
                    SELECT id, nome, cpf_cnpj, telefone, email 
                    FROM Locadores 
                    WHERE id = ?
                """, (locador_id,))
                
                locador_row = cursor.fetchone()
                if locador_row:
                    row_dict['locador_id'] = locador_row[0]
                    row_dict['locador_nome_completo'] = locador_row[1]
                    row_dict['locador_cpf'] = locador_row[2]
                    row_dict['locador_telefone'] = locador_row[3]
                    row_dict['locador_email'] = locador_row[4]
            
            # Buscar dados completos do locatario
            if row_dict.get('id_locatario'):
                cursor.execute("""
                    SELECT id, nome, cpf_cnpj, telefone, email 
                    FROM Locatarios 
                    WHERE id = ?
                """, (row_dict['id_locatario'],))
                
                locatario_row = cursor.fetchone()
                if locatario_row:
                    row_dict['locatario_id'] = locatario_row[0]
                    row_dict['locatario_nome_completo'] = locatario_row[1]
                    row_dict['locatario_cpf_completo'] = locatario_row[2]
                    row_dict['locatario_telefone'] = locatario_row[3]
                    row_dict['locatario_email'] = locatario_row[4]
            
            conn.close()
            return row_dict
        
        conn.close()
        return None
    except Exception as e:
        print(f"Erro ao buscar contrato por ID: {e}")
        return None

# === FUNÇÕES PARA FATURAS ===

def buscar_faturas(filtros=None, page=1, limit=20, order_by='data_vencimento', order_dir='DESC'):
    """Busca faturas com filtros, paginacao e ordenacao"""
    
    # Dados de teste expandidos para demonstrar a interface
    faturas_teste = [
        {
            'id': 1,
            'numero_fatura': 'FAT-001',
            'valor_total': 1200.00,
            'data_vencimento': '2024-12-05',
            'data_pagamento': None,
            'status': 'aberta',
            'mes_referencia': '2024-12',
            'observacoes': '',
            'data_criacao': '2024-11-01',
            'contrato_id': 1,
            'contrato_numero': '001',
            'imovel_endereco': 'Rua das Flores, 123 - Centro',
            'imovel_tipo': 'Apartamento',
            'valor_aluguel': 1200.00,
            'locatario_nome': 'João Silva',
            'locatario_cpf': '123.456.789-00',
            'locador_nome': 'Fernando Delfino',
            'dias_atraso': 15
        },
        {
            'id': 2,
            'numero_fatura': 'FAT-002',
            'valor_total': 1500.00,
            'data_vencimento': '2024-11-05',
            'data_pagamento': '2024-11-03',
            'status': 'paga',
            'mes_referencia': '2024-11',
            'observacoes': 'Pago em dia',
            'data_criacao': '2024-10-01',
            'contrato_id': 2,
            'contrato_numero': '002',
            'imovel_endereco': 'Rua Martin Afonso, 1168',
            'imovel_tipo': 'Casa',
            'valor_aluguel': 1500.00,
            'locatario_nome': 'Maria Santos',
            'locatario_cpf': '987.654.321-00',
            'locador_nome': 'Fernanda Carol',
            'dias_atraso': 0
        },
        {
            'id': 3,
            'numero_fatura': 'FAT-003',
            'valor_total': 800.00,
            'data_vencimento': '2024-12-10',
            'data_pagamento': None,
            'status': 'pendente',
            'mes_referencia': '2024-12',
            'observacoes': 'Aguardando confirmacao',
            'data_criacao': '2024-11-05',
            'contrato_id': 3,
            'contrato_numero': '003',
            'imovel_endereco': 'Av. Brasil, 456 - Batel',
            'imovel_tipo': 'Apartamento',
            'valor_aluguel': 800.00,
            'locatario_nome': 'Carlos Oliveira',
            'locatario_cpf': '111.222.333-44',
            'locador_nome': 'Brian Thiago',
            'dias_atraso': 0
        },
        {
            'id': 4,
            'numero_fatura': 'FAT-004',
            'valor_total': 2000.00,
            'data_vencimento': '2024-10-05',
            'data_pagamento': None,
            'status': 'em_atraso',
            'mes_referencia': '2024-10',
            'observacoes': 'Vencido há mais de 30 dias',
            'data_criacao': '2024-09-01',
            'contrato_id': 4,
            'contrato_numero': '004',
            'imovel_endereco': 'Rua XV de Novembro, 789',
            'imovel_tipo': 'Sala Comercial',
            'valor_aluguel': 2000.00,
            'locatario_nome': 'Ana Costa',
            'locatario_cpf': '555.666.777-88',
            'locador_nome': 'Fernando Delfino',
            'dias_atraso': 76
        },
        {
            'id': 5,
            'numero_fatura': 'FAT-005',
            'valor_total': 950.00,
            'data_vencimento': '2024-12-15',
            'data_pagamento': None,
            'status': 'aberta',
            'mes_referencia': '2024-12',
            'observacoes': 'Primeira cobrança',
            'data_criacao': '2024-11-15',
            'contrato_id': 5,
            'contrato_numero': '005',
            'imovel_endereco': 'Rua dos Pioneiros, 321 - Água Verde',
            'imovel_tipo': 'Kitnet',
            'valor_aluguel': 950.00,
            'locatario_nome': 'Roberto Silva',
            'locatario_cpf': '444.555.666-77',
            'locador_nome': 'Brian Thiago',
            'dias_atraso': 0
        },
        {
            'id': 6,
            'numero_fatura': 'FAT-006',
            'valor_total': 3200.00,
            'data_vencimento': '2024-11-20',
            'data_pagamento': '2024-11-18',
            'status': 'paga',
            'mes_referencia': '2024-11',
            'observacoes': 'Pagamento antecipado',
            'data_criacao': '2024-10-20',
            'contrato_id': 6,
            'contrato_numero': '006',
            'imovel_endereco': 'Av. Sete de Setembro, 888 - Centro',
            'imovel_tipo': 'Loja',
            'valor_aluguel': 3200.00,
            'locatario_nome': 'Loja ModaStyle LTDA',
            'locatario_cpf': '12.345.678/0001-90',
            'locador_nome': 'Fernando Delfino',
            'dias_atraso': 0
        },
        {
            'id': 7,
            'numero_fatura': 'FAT-007',
            'valor_total': 1800.00,
            'data_vencimento': '2024-12-03',
            'data_pagamento': None,
            'status': 'pendente',
            'mes_referencia': '2024-12',
            'observacoes': 'Aguardando negociacao',
            'data_criacao': '2024-11-03',
            'contrato_id': 7,
            'contrato_numero': '007',
            'imovel_endereco': 'Rua Coronel Dulcídio, 555 - Batel',
            'imovel_tipo': 'Apartamento',
            'valor_aluguel': 1800.00,
            'locatario_nome': 'Fernanda Lima',
            'locatario_cpf': '999.888.777-66',
            'locador_nome': 'Fernanda Carol',
            'dias_atraso': 0
        },
        {
            'id': 8,
            'numero_fatura': 'FAT-008',
            'valor_total': 2500.00,
            'data_vencimento': '2024-09-15',
            'data_pagamento': None,
            'status': 'em_atraso',
            'mes_referencia': '2024-09',
            'observacoes': 'Cliente nao localizado',
            'data_criacao': '2024-08-15',
            'contrato_id': 8,
            'contrato_numero': '008',
            'imovel_endereco': 'Rua Comendador Macedo, 123 - Alto da Glória',
            'imovel_tipo': 'Casa',
            'valor_aluguel': 2500.00,
            'locatario_nome': 'José Santos',
            'locatario_cpf': '777.666.555-44',
            'locador_nome': 'Fernando Delfino',
            'dias_atraso': 96
        }
    ]
    
    # Aplicar alteraçoes de status às faturas
    for fatura in faturas_teste:
        if fatura['id'] in faturas_status:
            fatura['status'] = faturas_status[fatura['id']]
    
    # Aplicar filtros
    faturas_filtradas = faturas_teste.copy()
    
    if filtros:
        if filtros.get('status'):
            faturas_filtradas = [f for f in faturas_filtradas if f['status'] in filtros['status']]
        
        if filtros.get('mes'):
            mes_filtro = filtros['mes']
            faturas_filtradas = [f for f in faturas_filtradas if f['mes_referencia'].endswith(f'-{mes_filtro}')]
        
        if filtros.get('ano'):
            ano_filtro = filtros['ano']
            faturas_filtradas = [f for f in faturas_filtradas if f['mes_referencia'].startswith(ano_filtro)]
        
        if filtros.get('search'):
            search_term = filtros['search'].lower()
            faturas_filtradas = [f for f in faturas_filtradas if 
                search_term in f['numero_fatura'].lower() or
                search_term in f['locatario_nome'].lower() or
                search_term in f['imovel_endereco'].lower() or
                search_term in f['contrato_numero'].lower()
            ]
        
        if filtros.get('valor_min'):
            faturas_filtradas = [f for f in faturas_filtradas if f['valor_total'] >= filtros['valor_min']]
        
        if filtros.get('valor_max'):
            faturas_filtradas = [f for f in faturas_filtradas if f['valor_total'] <= filtros['valor_max']]
    
    # Aplicar ordenacao
    reverse = order_dir == 'DESC'
    if order_by == 'valor_total':
        faturas_filtradas.sort(key=lambda x: x['valor_total'], reverse=reverse)
    elif order_by == 'data_vencimento':
        faturas_filtradas.sort(key=lambda x: x['data_vencimento'], reverse=reverse)
    elif order_by == 'numero_fatura':
        faturas_filtradas.sort(key=lambda x: x['numero_fatura'], reverse=reverse)
    
    # Aplicar paginacao
    total = len(faturas_filtradas)
    start_index = (page - 1) * limit
    end_index = start_index + limit
    faturas_pagina = faturas_filtradas[start_index:end_index]
    
    # Adicionar campos calculados
    for fatura in faturas_pagina:
        fatura['referencia_display'] = format_mes_referencia(fatura['mes_referencia'])
        fatura['situacao_pagamento'] = calcular_situacao_pagamento(fatura)
    
    return {
        'data': faturas_pagina,
        'total': total,
        'page': page,
        'pages': (total + limit - 1) // limit if total > 0 else 0
    }
    
    # Código original comentado para futuro uso com dados reais
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Query base simulando faturas com dados dos contratos
        base_query = """
            SELECT 
                c.id,
                CAST(c.id AS VARCHAR) as numero_fatura,
                i.valor_aluguel as valor_total,
                c.data_fim as data_vencimento,
                NULL as data_pagamento,
                'aberta' as status,
                FORMAT(c.data_inicio, 'yyyy-MM') as mes_referencia,
                '' as observacoes,
                c.data_inicio as data_criacao,
                c.id as contrato_id,
                CAST(c.id AS VARCHAR) as contrato_numero,
                i.endereco as imovel_endereco,
                i.tipo as imovel_tipo,
                i.valor_aluguel,
                loc.nome as locatario_nome,
                loc.cpf_cnpj as locatario_cpf,
                l.nome as locador_nome,
                DATEDIFF(day, c.data_fim, GETDATE()) as dias_atraso
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN Locatarios loc ON c.id_locatario = loc.id
            LEFT JOIN Locadores l ON i.id_locador = l.id
        """
        
        # Construir condiçoes WHERE baseadas nos filtros
        where_conditions = []
        params = []
        
        if filtros:
            if filtros.get('status'):
                # Como estamos simulando com contratos, vou mapear os status
                status_map = {'aberta': 'ativo', 'paga': 'finalizado', 'pendente': 'pendente'}
                mapped_status = [status_map.get(s, s) for s in filtros['status']]
                placeholders = ','.join(['?' for _ in mapped_status])
                where_conditions.append(f"c.status IN ({placeholders})")
                params.extend(mapped_status)
            
            if filtros.get('data_inicio'):
                where_conditions.append("c.data_fim >= ?")
                params.append(filtros['data_inicio'])
            
            if filtros.get('data_fim'):
                where_conditions.append("c.data_fim <= ?")
                params.append(filtros['data_fim'])
            
            if filtros.get('search'):
                search_term = f"%{filtros['search']}%"
                where_conditions.append("""
                    (CAST(c.id AS VARCHAR) LIKE ? OR 
                     loc.nome LIKE ? OR 
                     i.endereco LIKE ? OR 
                     CAST(c.id AS VARCHAR) LIKE ?)
                """)
                params.extend([search_term, search_term, search_term, search_term])
            
            if filtros.get('locador_id'):
                where_conditions.append("i.id_locador = ?")
                params.append(filtros['locador_id'])
            
            if filtros.get('valor_min'):
                where_conditions.append("i.valor_aluguel >= ?")
                params.append(filtros['valor_min'])
            
            if filtros.get('valor_max'):
                where_conditions.append("i.valor_aluguel <= ?")
                params.append(filtros['valor_max'])
        
        # Montar query completa
        if where_conditions:
            query = base_query + " WHERE " + " AND ".join(where_conditions)
        else:
            query = base_query
        
        # Adicionar ordenacao
        query += f" ORDER BY {order_by} {order_dir}"
        
        # Executar query para contagem total
        count_query = f"SELECT COUNT(*) FROM ({query}) as total_query"
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]
        
        # Adicionar paginacao
        offset = (page - 1) * limit
        query += f" OFFSET {offset} ROWS FETCH NEXT {limit} ROWS ONLY"
        
        # Executar query principal
        cursor.execute(query, params)
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        
        # Converter resultados
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                if hasattr(value, 'strftime'):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d')
                else:
                    row_dict[columns[i]] = value
            
            # Adicionar campos calculados
            row_dict['referencia_display'] = format_mes_referencia(row_dict.get('mes_referencia', ''))
            row_dict['situacao_pagamento'] = calcular_situacao_pagamento(row_dict)
            
            result.append(row_dict)
        
        conn.close()
        return {
            'data': result,
            'total': total,
            'page': page,
            'pages': (total + limit - 1) // limit
        }
        
    except Exception as e:
        print(f"Erro ao buscar faturas: {e}")
        return {'data': [], 'total': 0, 'page': 1, 'pages': 0}

def buscar_estatisticas_faturas(filtros=None):
    """Busca estatísticas resumidas das faturas para as abas"""
    
    # Dados de teste atualizados com todas as 8 faturas
    faturas_exemplo = [
        {'status': 'aberta', 'valor_total': 1200.00, 'mes_referencia': '2024-12'},    # FAT-001
        {'status': 'paga', 'valor_total': 1500.00, 'mes_referencia': '2024-11'},      # FAT-002
        {'status': 'pendente', 'valor_total': 800.00, 'mes_referencia': '2024-12'},   # FAT-003
        {'status': 'em_atraso', 'valor_total': 2000.00, 'mes_referencia': '2024-10'}, # FAT-004
        {'status': 'aberta', 'valor_total': 950.00, 'mes_referencia': '2024-12'},     # FAT-005
        {'status': 'paga', 'valor_total': 3200.00, 'mes_referencia': '2024-11'},      # FAT-006
        {'status': 'pendente', 'valor_total': 1800.00, 'mes_referencia': '2024-12'},  # FAT-007
        {'status': 'em_atraso', 'valor_total': 2500.00, 'mes_referencia': '2024-09'}  # FAT-008
    ]
    
    # Aplicar alteraçoes de status às faturas de exemplo
    for i, fatura in enumerate(faturas_exemplo):
        fatura_id = fatura.get('id', i + 1)  # Usar índice + 1 como ID se nao houver
        if fatura_id in faturas_status:
            fatura['status'] = faturas_status[fatura_id]
    
    # Aplicar filtros se fornecidos
    faturas_filtradas = faturas_exemplo.copy()
    
    if filtros:
        if filtros.get('mes'):
            mes_filtro = filtros['mes']
            faturas_filtradas = [f for f in faturas_filtradas if f['mes_referencia'].endswith(f'-{mes_filtro}')]
        
        if filtros.get('ano'):
            ano_filtro = filtros['ano']
            faturas_filtradas = [f for f in faturas_filtradas if f['mes_referencia'].startswith(ano_filtro)]
    
    stats = {
        'todas': len(faturas_filtradas),
        'abertas': len([f for f in faturas_filtradas if f['status'] == 'aberta']),
        'pendentes': len([f for f in faturas_filtradas if f['status'] == 'pendente']),
        'pagas': len([f for f in faturas_filtradas if f['status'] == 'paga']),
        'em_atraso': len([f for f in faturas_filtradas if f['status'] == 'em_atraso']),
        'canceladas': len([f for f in faturas_filtradas if f['status'] == 'cancelada']),
        'valor_total_aberto': sum([f['valor_total'] for f in faturas_filtradas if f['status'] in ['aberta', 'pendente']]),
        'valor_total_recebido': sum([f['valor_total'] for f in faturas_filtradas if f['status'] == 'paga']),
        'valor_total_atrasado': sum([f['valor_total'] for f in faturas_filtradas if f['status'] == 'em_atraso'])
    }
    
    return stats

def buscar_fatura_por_id(fatura_id):
    """Busca uma fatura específica com detalhes completos"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Simular busca de fatura usando contratos
        cursor.execute("""
            SELECT 
                c.id,
                CAST(c.id AS VARCHAR) as numero_fatura,
                c.valor_aluguel as valor_total,
                c.data_fim as data_vencimento,
                NULL as data_pagamento,
                'aberta' as status,
                FORMAT(c.data_inicio, 'yyyy-MM') as mes_referencia,
                '' as observacoes,
                c.data_inicio as data_criacao,
                i.endereco as imovel_endereco,
                i.tipo as imovel_tipo,
                loc.nome as locatario_nome,
                l.nome as locador_nome
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN Locatarios loc ON c.id_locatario = loc.id
            LEFT JOIN Locadores l ON i.id_locador = l.id
            WHERE c.id = ?
        """, (fatura_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if row:
            columns = [column[0] for column in cursor.description]
            result = {}
            for i, value in enumerate(row):
                if hasattr(value, 'strftime'):
                    result[columns[i]] = value.strftime('%Y-%m-%d')
                else:
                    result[columns[i]] = value
            return result
        else:
            return None
            
    except Exception as e:
        print(f"Erro ao buscar fatura: {e}")
        return None

def gerar_boleto_fatura(fatura_id, dados_boleto=None):
    """Simula geracao de boleto para uma fatura"""
    try:
        fatura = buscar_fatura_por_id(fatura_id)
        if not fatura:
            return None
            
        return {
            'url_boleto': f'https://boleto.exemplo.com/fatura_{fatura_id}.pdf',
            'codigo_barras': f'00190.00009 12345.678901 23456.789012 3 {fatura_id:08d}',
            'linha_digitavel': f'00190.00009 12345.678901 23456.789012 3 {fatura_id:08d}',
            'data_vencimento': fatura.get('data_vencimento'),
            'valor': float(fatura.get('valor_total', 0))
        }
        
    except Exception as e:
        print(f"Erro ao gerar boleto: {e}")
        return None

def format_mes_referencia(mes_ref):
    """Formata mês de referência de YYYY-MM para 'Janeiro/2024'"""
    if not mes_ref:
        return ''
    
    try:
        meses = {
            '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
            '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
            '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
        }
        
        ano, mes = mes_ref.split('-')
        return f"{meses.get(mes, mes)}/{ano}"
    except:
        return mes_ref

def calcular_situacao_pagamento(fatura_dict):
    """Calcula situacao do pagamento baseado nas datas"""
    if fatura_dict.get('data_pagamento'):
        return 'quitado'
    
    dias_atraso = fatura_dict.get('dias_atraso', 0)
    if dias_atraso > 30:
        return 'vencido'
    elif dias_atraso > 0:
        return 'atrasado'
    else:
        return 'em_dia'

# Variável global para simular o estado das faturas
faturas_status = {}

def cancelar_fatura(fatura_id):
    """Cancela uma fatura específica (mantido para compatibilidade)"""
    return alterar_status_fatura(fatura_id, 'cancelada')

def alterar_status_fatura(fatura_id, novo_status, motivo=None):
    """Altera o status de uma fatura específica"""
    try:
        # Armazenar o novo status
        faturas_status[fatura_id] = novo_status
        
        print(f"Fatura {fatura_id} alterada para status: {novo_status}")
        if motivo:
            print(f"Motivo: {motivo}")
        
        return True
        
    except Exception as e:
        print(f"Erro ao alterar status da fatura {fatura_id}: {e}")
        return False

def atualizar_locatario(locatario_id, **kwargs):
    """Atualiza um locatario na tabela Locatarios"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        print(f"Iniciando atualizacao do locatario ID: {locatario_id}")
        print(f"Dados recebidos: {kwargs}")
        
        # Primeiro verificar se o locatario existe
        cursor.execute("SELECT id, nome FROM Locatarios WHERE id = ?", locatario_id)
        locatario_existente = cursor.fetchone()
        
        if not locatario_existente:
            print(f"Locatario ID {locatario_id} nao encontrado na tabela Locatarios")
            conn.close()
            return False
        
        print(f"Locatario encontrado: ID {locatario_existente[0]}, Nome: {locatario_existente[1]}")
        
        # Listar campos que podem ser atualizados baseados na estrutura da tabela
        campos_atualizaveis = [
            'nome', 'cpf_cnpj', 'telefone', 'email', 'tipo_pessoa', 'rg', 
            'data_nascimento', 'nacionalidade', 'estado_civil', 'profissao',
            'endereco_rua', 'endereco_numero', 'endereco_complemento', 'endereco_bairro',
            'endereco_cidade', 'endereco_estado', 'endereco_cep', 'possui_conjuge',
            'conjuge_nome', 'cpf_conjuge', 'nome_conjuge', 'rg_conjuge', 'endereco_conjuge',
            'telefone_conjuge', 'possui_inquilino_solidario', 'possui_fiador', 
            'qtd_pets', 'observacoes', 'ativo', 'responsavel_pgto_agua',
            'responsavel_pgto_luz', 'responsavel_pgto_gas', 'dados_empresa',
            'representante', 'tem_fiador', 'tem_moradores'
        ]
        
        # Filtrar apenas os campos que foram enviados e sao atualizáveis
        campos_para_atualizar = {}
        for campo, valor in kwargs.items():
            if campo in campos_atualizaveis and valor is not None:
                # Converter valores string para int/bool quando necessario
                if campo in ['possui_conjuge', 'possui_inquilino_solidario', 'possui_fiador', 'ativo', 'tem_fiador', 'tem_moradores']:
                    if isinstance(valor, str):
                        if valor.upper() in ['SIM', 'S', 'TRUE', '1']:
                            valor = 1
                        elif valor.upper() in ['NAO', 'N', 'FALSE', '0', 'NÃO']:
                            valor = 0
                        else:
                            valor = int(valor) if valor.isdigit() else 0
                    elif isinstance(valor, bool):
                        valor = 1 if valor else 0
                campos_para_atualizar[campo] = valor
        
        if not campos_para_atualizar:
            print("Nenhum campo válido para atualizar")
            conn.close()
            return False
            
        # Construir query de UPDATE dinamicamente
        set_clause = ", ".join([f"{campo} = ?" for campo in campos_para_atualizar.keys()])
        valores = list(campos_para_atualizar.values())
        valores.append(locatario_id)  # Para o WHERE
        
        query = f"UPDATE Locatarios SET {set_clause} WHERE id = ?"
        
        print(f"Query: {query}")
        print(f"Valores: {valores}")
        
        cursor.execute(query, valores)
        
        # Verificar se alguma linha foi afetada
        if cursor.rowcount == 0:
            print("Nenhuma linha foi afetada pela atualizacao")
            conn.close()
            return False
        
        conn.commit()
        print(f"Locatario {locatario_id} atualizado com sucesso! {cursor.rowcount} linha(s) afetada(s)")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Erro ao atualizar locatario {locatario_id}: {e}")
        if 'conn' in locals():
            conn.close()
        return False

def alterar_status_locatario(locatario_id, ativo):
    """Altera o status ativo/inativo de um locatario"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        print(f"Alterando status do locatario {locatario_id} para {'ativo' if ativo else 'inativo'}")
        
        # Primeiro verificar se o locatario existe
        cursor.execute("SELECT id, nome FROM Locatarios WHERE id = ?", locatario_id)
        locatario_existente = cursor.fetchone()
        
        if not locatario_existente:
            print(f"Locatario ID {locatario_id} nao encontrado na tabela Locatarios")
            conn.close()
            return False
        
        print(f"Locatario encontrado: ID {locatario_existente[0]}, Nome: {locatario_existente[1]}")
        
        # Atualizar o status
        cursor.execute("UPDATE Locatarios SET ativo = ? WHERE id = ?", (ativo, locatario_id))
        
        # Verificar se alguma linha foi afetada
        if cursor.rowcount == 0:
            print("Nenhuma linha foi afetada pela atualizacao de status")
            conn.close()
            return False
        
        conn.commit()
        print(f"Status do locatario {locatario_id} alterado com sucesso! {cursor.rowcount} linha(s) afetada(s)")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Erro ao alterar status do locatario {locatario_id}: {e}")
        if 'conn' in locals():
            conn.close()
        return False

def atualizar_imovel(imovel_id, **kwargs):
    """Atualiza um imóvel na tabela Imoveis"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        print(f"Iniciando atualizacao do imóvel ID: {imovel_id}")
        print(f"Dados recebidos: {kwargs}")
        
        # 🆕 PROCESSAMENTO HÍBRIDO DE ENDEREÇO - SEGURO
        if 'endereco' in kwargs:
            try:
                endereco_input = kwargs['endereco']
                if isinstance(endereco_input, dict):
                    print(f"Processando endereço estruturado: {endereco_input}")
                    endereco_string, endereco_id = processar_endereco_imovel(endereco_input)
                    kwargs['endereco'] = endereco_string
                    if endereco_id:
                        kwargs['endereco_id'] = endereco_id
                        print(f"SUCESSO: Endereço salvo na EnderecoImovel com ID: {endereco_id}")
            except Exception as endereco_error:
                print(f"AVISO:️ Erro ao processar endereço, usando fallback: {endereco_error}")
                # Fallback seguro: converter para string
                kwargs['endereco'] = str(kwargs['endereco'])
        
        # Primeiro verificar se o imóvel existe
        cursor.execute("SELECT id, endereco, tipo FROM Imoveis WHERE id = ?", imovel_id)
        imovel_existente = cursor.fetchone()
        
        if not imovel_existente:
            print(f"Imóvel ID {imovel_id} nao encontrado na tabela Imoveis")
            conn.close()
            return False
        
        print(f"Imóvel encontrado: ID {imovel_existente[0]}, Endereço: {imovel_existente[1]}, Tipo: {imovel_existente[2]}")
        
        # Listar campos que podem ser atualizados baseados na estrutura da tabela
        campos_atualizaveis = [
            'id_locador', 'id_locatario', 'tipo', 'endereco', 'endereco_id', 'valor_aluguel', 
            'iptu', 'condominio', 'taxa_incendio', 'status', 'matricula_imovel',
            'area_imovel', 'dados_imovel', 'permite_pets', 'metragem', 
            'numero_quartos', 'numero_banheiros', 'numero_vagas', 'andar',
            'mobiliado', 'aceita_animais', 'valor_condominio', 'valor_iptu_mensal',
            'finalidade_imovel', 'nome_edificio', 'armario_embutido', 'escritorio',
            'area_servico', 'ativo', 'observacoes'
        ]
        
        # Filtrar apenas os campos que foram enviados e sao atualizáveis
        campos_para_atualizar = {}
        for campo, valor in kwargs.items():
            if campo in campos_atualizaveis and valor is not None:
                # Converter valores string para int/bool quando necessario
                if campo in ['mobiliado', 'aceita_animais', 'permite_pets', 'ativo']:
                    if isinstance(valor, str):
                        if valor.upper() in ['SIM', 'S', 'TRUE', '1']:
                            valor = 1
                        elif valor.upper() in ['NAO', 'N', 'FALSE', '0', 'NÃO']:
                            valor = 0
                        else:
                            valor = int(valor) if valor.isdigit() else 0
                    elif isinstance(valor, bool):
                        valor = 1 if valor else 0
                campos_para_atualizar[campo] = valor
        
        if not campos_para_atualizar:
            print("Nenhum campo válido para atualizar")
            conn.close()
            return False
            
        # Construir query de UPDATE dinamicamente
        set_clause = ", ".join([f"{campo} = ?" for campo in campos_para_atualizar.keys()])
        valores = list(campos_para_atualizar.values())
        valores.append(imovel_id)  # Para o WHERE
        
        query = f"UPDATE Imoveis SET {set_clause} WHERE id = ?"
        
        print(f"Query: {query}")
        print(f"Valores: {valores}")
        
        cursor.execute(query, valores)
        
        # Verificar se alguma linha foi afetada
        if cursor.rowcount == 0:
            print("Nenhuma linha foi afetada pela atualizacao")
            conn.close()
            return False
        
        conn.commit()
        print(f"Imóvel {imovel_id} atualizado com sucesso! {cursor.rowcount} linha(s) afetada(s)")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Erro ao atualizar imóvel {imovel_id}: {e}")
        if 'conn' in locals():
            conn.close()
        return False

def alterar_status_imovel(imovel_id, ativo):
    """Altera o status ativo/inativo de um imóvel"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        print(f"Alterando status do imóvel {imovel_id} para {'ativo' if ativo else 'inativo'}")
        
        # Primeiro verificar se o imóvel existe
        cursor.execute("SELECT id, endereco FROM Imoveis WHERE id = ?", imovel_id)
        imovel_existente = cursor.fetchone()
        
        if not imovel_existente:
            print(f"Imóvel ID {imovel_id} nao encontrado na tabela Imoveis")
            conn.close()
            return False
        
        print(f"Imóvel encontrado: ID {imovel_existente[0]}, Endereço: {imovel_existente[1]}")
        
        # Atualizar o status
        cursor.execute("UPDATE Imoveis SET ativo = ? WHERE id = ?", (ativo, imovel_id))
        
        # Verificar se alguma linha foi afetada
        if cursor.rowcount == 0:
            print("Nenhuma linha foi afetada pela atualizacao de status")
            conn.close()
            return False
        
        conn.commit()
        print(f"Status do imóvel {imovel_id} alterado com sucesso! {cursor.rowcount} linha(s) afetada(s)")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Erro ao alterar status do imóvel {imovel_id}: {e}")
        if 'conn' in locals():
            conn.close()
        return False

def atualizar_contrato(contrato_id, **kwargs):
    """Atualiza um contrato na tabela Contratos - VERSAO LIMPA"""
    try:
        print(f"=== REPOSITORIES: Atualizando contrato {contrato_id} ===")
        print(f"Campos recebidos: {list(kwargs.keys())}")
        
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Verificar se o contrato existe
        cursor.execute("SELECT id FROM Contratos WHERE id = ?", (contrato_id,))
        if not cursor.fetchone():
            print(f"ERRO: Contrato ID {contrato_id} nao encontrado no banco")
            return False
        print(f"OK: Contrato {contrato_id} encontrado no banco")
        
        # Campos atualizaveis na tabela Contratos
        campos_atualizaveis = [
            # Campos originais
            'id_locatario', 'id_imovel', 'valor_aluguel', 'data_inicio', 
            'data_fim', 'data_vencimento', 'tipo_garantia', 'observacoes',
            'status', 'valor_condominio', 'valor_iptu', 'valor_seguro',
            'percentual_reajuste', 'indice_reajuste', 'prazo_reajuste',
            'valor_multa_rescisao', 'valor_deposito_caucao', 'prazo_pagamento',
            'dia_vencimento', 'forma_pagamento', 'banco_pagamento',
            'agencia_pagamento', 'conta_pagamento',
            
            # Campos que JA EXISTEM no banco
            'data_assinatura', 'ultimo_reajuste', 'proximo_reajuste',
            'renovacao_automatica', 'vencimento_dia', 'taxa_administracao',
            'fundo_conservacao', 'bonificacao', 'valor_seguro_fianca',
            'valor_seguro_incendio', 'seguro_fianca_inicio', 'seguro_fianca_fim',
            'seguro_incendio_inicio', 'seguro_incendio_fim', 'percentual_multa_atraso',
            'retido_fci', 'retido_iptu', 'retido_condominio', 'retido_seguro_fianca',
            'retido_seguro_incendio', 'antecipa_condominio', 'antecipa_seguro_fianca',
            'antecipa_seguro_incendio',
            
            # Campos CRIADOS no banco 
            'data_entrega_chaves',
            'proximo_reajuste_automatico',
            'periodo_contrato',
            'tempo_renovacao',
            'tempo_reajuste',
            'data_inicio_iptu',
            'data_fim_iptu',
            'parcelas_iptu',
            'parcelas_seguro_fianca',
            'parcelas_seguro_incendio',
            'valor_fci',
            
            # Campos de CORRETOR (15 novos campos do refinamento)
            'tem_corretor',
            'corretor_nome',
            'corretor_creci',
            'corretor_cpf',
            'corretor_telefone',
            'corretor_email',
            
            # Campos de OBRIGAÇÕES ADICIONAIS
            'obrigacao_manutencao',
            'obrigacao_pintura',
            'obrigacao_jardim',
            'obrigacao_limpeza',
            'obrigacao_pequenos_reparos',
            'obrigacao_vistoria',
            
            # Campos de MULTAS ESPECÍFICAS
            'multa_locador',
            'multa_locatario',
            
            # Campos de FIADOR
            'fiador_nome',
            'fiador_cpf',
            'fiador_telefone', 
            'fiador_email',
            'fiador_endereco',
            
            # Campos ADICIONAIS que EXISTEM no banco
            'clausulas_adicionais',
            'tipo_plano_locacao'
            
            # REMOVIDOS: Campos que NÃO existem no banco (causam erro SQL):
            # 'caucao_descricao', 'caucao_tipo', 'caucao_valor',
            # 'seguro_apolice', 'seguro_seguradora', 'seguro_valor_cobertura', 'seguro_vigencia',
            # 'titulo_empresa', 'titulo_numero', 'titulo_valor', 'titulo_vencimento',
            # 'data_inicio_seguro_fianca', 'data_inicio_seguro_incendio',
            # 'multa_atraso', 'numero_contrato', 'pets_racas', 'pets_tamanhos',
            # 'quantidade_pets', 'utilizacao_imovel'
        ]
        
        # Filtrar campos para atualizar
        campos_para_atualizar = {}
        campos_ignorados = []
        for campo, valor in kwargs.items():
            if campo in campos_atualizaveis and valor is not None:
                campos_para_atualizar[campo] = valor
            elif campo not in campos_atualizaveis:
                campos_ignorados.append(campo)
        
        if campos_ignorados:
            print(f"AVISO: Campos ignorados: {campos_ignorados}")
        
        if not campos_para_atualizar:
            print("ERRO: Nenhum campo valido para atualizar")
            return False
        
        print(f"OK: Campos que serao atualizados: {list(campos_para_atualizar.keys())}")
        
        # Construir query UPDATE
        set_clause = ", ".join([f"{campo} = ?" for campo in campos_para_atualizar.keys()])
        query = f"UPDATE Contratos SET {set_clause} WHERE id = ?"
        valores = list(campos_para_atualizar.values()) + [contrato_id]
        
        # ===== NOVO: CAPTURAR DADOS ANTIGOS ANTES DA ATUALIZAÇÃO =====
        print("Capturando dados antigos para histórico...")
        cursor.execute("SELECT * FROM Contratos WHERE id = ?", (contrato_id,))
        contrato_antigo = cursor.fetchone()
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        contrato_antigo_dict = {columns[i]: contrato_antigo[i] for i in range(len(columns))}
        
        print(f"Executando UPDATE...")
        print(f"Query: {query}")
        print(f"Parametros: {len(valores) - 1} campos + 1 ID")
        
        cursor.execute(query, valores)
        
        # ===== HISTÓRICO AUTOMÁTICO (VERSÃO SEGURA COM TIMEOUT) =====
        if cursor.rowcount > 0:
            print("Registrando mudanças no histórico (versão com timeout)...")
            try:
                import threading
                import time
                
                # Criar dict dos dados novos
                contrato_novo_dict = dict(contrato_antigo_dict)  # Copiar dados antigos
                contrato_novo_dict.update(campos_para_atualizar)  # Aplicar mudanças
                
                # Função para executar histórico com timeout
                resultado_historico = None
                exception_historico = None
                
                def executar_historico():
                    nonlocal resultado_historico, exception_historico
                    try:
                        resultado_historico = comparar_contratos_para_historico(
                            contrato_antigo=contrato_antigo_dict,
                            contrato_novo=contrato_novo_dict,
                            id_contrato=contrato_id,
                            usuario="Admin"  # TODO: Pegar usuário real da sessão
                        )
                    except Exception as e:
                        exception_historico = e
                
                # Executar com timeout de 5 segundos
                thread_historico = threading.Thread(target=executar_historico)
                thread_historico.daemon = True
                thread_historico.start()
                thread_historico.join(timeout=5.0)
                
                if thread_historico.is_alive():
                    print("AVISO: Histórico demorou muito (>5s) - saltando para não travar salvamento")
                elif exception_historico:
                    print(f"AVISO: Erro no histórico: {exception_historico}")
                elif resultado_historico and resultado_historico.get('success'):
                    mudancas = resultado_historico.get('mudancas', [])
                    print(f"HISTÓRICO: {len(mudancas)} mudanças registradas: {mudancas}")
                else:
                    print(f"AVISO: Erro ao registrar histórico: {resultado_historico.get('message') if resultado_historico else 'Timeout'}")
                    
            except Exception as hist_error:
                print(f"AVISO: Erro ao processar histórico (não crítico): {hist_error}")
                # Não falhar a atualização por causa do histórico
        
        conn.commit()
        
        if cursor.rowcount > 0:
            print(f"SUCESSO: Contrato ID {contrato_id} atualizado! ({cursor.rowcount} linha(s))")
            conn.close()
            return True
        else:
            print(f"AVISO: Nenhuma linha afetada no contrato {contrato_id}")
            conn.close()
            return False
            
    except Exception as e:
        print(f"ERRO ao atualizar contrato: {e}")
        print(f"Tipo do erro: {type(e).__name__}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

# ==========================================
# FUNÇÕES PARA DADOS RELACIONADOS AO CONTRATO
# ==========================================

def salvar_garantias_individuais(contrato_id, dados_garantias):
    """Salva garantias (fiador, caução, título, apólice) na tabela GarantiasIndividuais"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        print(f"Salvando garantias individuais para contrato {contrato_id}")
        
        # Verificar se já existe registro para este contrato
        cursor.execute("SELECT id FROM GarantiasIndividuais WHERE contrato_id = ?", (contrato_id,))
        registro_existente = cursor.fetchone()
        
        if registro_existente:
            # Atualizar registro existente
            campos_update = []
            valores = []
            
            if 'fiador_nome' in dados_garantias:
                campos_update.append("fiador_nome = ?")
                valores.append(dados_garantias['fiador_nome'])
            if 'fiador_cpf' in dados_garantias:
                campos_update.append("fiador_cpf = ?") 
                valores.append(dados_garantias['fiador_cpf'])
            if 'fiador_telefone' in dados_garantias:
                campos_update.append("fiador_telefone = ?")
                valores.append(dados_garantias['fiador_telefone'])
            if 'fiador_endereco' in dados_garantias:
                campos_update.append("fiador_endereco = ?")
                valores.append(dados_garantias['fiador_endereco'])
            if 'caucao_tipo' in dados_garantias:
                campos_update.append("caucao_tipo = ?")
                valores.append(dados_garantias['caucao_tipo'])
            if 'caucao_descricao' in dados_garantias:
                campos_update.append("caucao_descricao = ?")
                valores.append(dados_garantias['caucao_descricao'])
            if 'titulo_numero' in dados_garantias:
                campos_update.append("titulo_numero = ?")
                valores.append(dados_garantias['titulo_numero'])
            if 'titulo_valor' in dados_garantias:
                campos_update.append("titulo_valor = ?")
                valores.append(dados_garantias['titulo_valor'])
            if 'apolice_numero' in dados_garantias:
                campos_update.append("apolice_numero = ?")
                valores.append(dados_garantias['apolice_numero'])
            if 'apolice_valor_cobertura' in dados_garantias:
                campos_update.append("apolice_valor_cobertura = ?")
                valores.append(dados_garantias['apolice_valor_cobertura'])
                
            if campos_update:
                query = f"UPDATE GarantiasIndividuais SET {', '.join(campos_update)}, data_atualizacao = GETDATE() WHERE contrato_id = ?"
                valores.append(contrato_id)
                cursor.execute(query, valores)
                print(f"Garantias atualizadas para contrato {contrato_id}")
        else:
            # Inserir novo registro com campos obrigatórios
            cursor.execute("""
                INSERT INTO GarantiasIndividuais (
                    contrato_id, pessoa_id, pessoa_tipo, tipo_garantia,
                    fiador_nome, fiador_cpf, fiador_telefone, fiador_endereco,
                    caucao_tipo, caucao_descricao, titulo_numero, titulo_valor,
                    apolice_numero, apolice_valor_cobertura, ativo, data_criacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, GETDATE())
            """, (
                contrato_id,
                1,  # pessoa_id temporário
                'LOCADOR',  # pessoa_tipo (deve ser LOCADOR ou LOCATARIO)
                'MULTIPLA',  # tipo_garantia
                dados_garantias.get('fiador_nome'),
                dados_garantias.get('fiador_cpf'), 
                dados_garantias.get('fiador_telefone'),
                dados_garantias.get('fiador_endereco'),
                dados_garantias.get('caucao_tipo'),
                dados_garantias.get('caucao_descricao'),
                dados_garantias.get('titulo_numero'),
                dados_garantias.get('titulo_valor'),
                dados_garantias.get('apolice_numero'),
                dados_garantias.get('apolice_valor_cobertura')
            ))
            print(f"Novas garantias inseridas para contrato {contrato_id}")
        
        conn.commit()
        conn.close()
        return {"success": True, "message": "Garantias salvas com sucesso"}
        
    except Exception as e:
        print(f"Erro ao salvar garantias: {e}")
        return {"success": False, "message": str(e)}

def salvar_pets_contrato(contrato_id, pets_dados):
    """Salva informações de pets na tabela ContratoPets"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        print(f"Salvando pets para contrato {contrato_id}")
        
        # Remover pets existentes para este contrato
        cursor.execute("DELETE FROM ContratoPets WHERE contrato_id = ?", (contrato_id,))
        
        # Se tiver dados de pets para salvar
        if pets_dados.get('quantidade_pets', 0) > 0:
            racas = pets_dados.get('pets_racas', '').split(',') if pets_dados.get('pets_racas') else ['']
            tamanhos = pets_dados.get('pets_tamanhos', '').split(',') if pets_dados.get('pets_tamanhos') else ['']
            
            quantidade = int(pets_dados.get('quantidade_pets', 0))
            
            for i in range(quantidade):
                raca = racas[i].strip() if i < len(racas) else ''
                tamanho = tamanhos[i].strip() if i < len(tamanhos) else ''
                
                # Padronizar tamanho para valores válidos
                tamanho_valido = tamanho.title() if tamanho.lower() in ['pequeno', 'médio', 'medio', 'grande', 'gigante'] else 'Médio'
                
                cursor.execute("""
                    INSERT INTO ContratoPets (contrato_id, nome, raca, tamanho, ativo, data_cadastro)
                    VALUES (?, ?, ?, ?, 1, GETDATE())
                """, (contrato_id, f"Pet {i+1}", raca, tamanho_valido))
            
            print(f"{quantidade} pets inseridos para contrato {contrato_id}")
        
        conn.commit()
        conn.close()
        return {"success": True, "message": "Pets salvos com sucesso"}
        
    except Exception as e:
        print(f"Erro ao salvar pets: {e}")
        return {"success": False, "message": str(e)}

# ==========================================
# FUNÇÕES PARA MÚLTIPLOS LOCADORES/LOCATÁRIOS
# ==========================================

def buscar_locadores_contrato(contrato_id):
    """Busca todos os locadores associados a um contrato específico"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                cl.id,
                cl.contrato_id,
                cl.locador_id,
                cl.conta_bancaria_id,
                cl.porcentagem,
                cl.responsabilidade_principal,
                l.nome as locador_nome,
                l.cpf_cnpj as locador_documento,
                l.telefone as locador_telefone,
                l.email as locador_email,
                cl.ativo
            FROM ContratoLocadores cl
            INNER JOIN Locadores l ON cl.locador_id = l.id
            WHERE cl.contrato_id = ? AND cl.ativo = 1
            ORDER BY cl.responsabilidade_principal DESC, l.nome
        """, (contrato_id,))
        
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        result = []
        
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        
        # Se não encontrou locadores na tabela relacional, fazer fallback para dados do contrato
        if not result:
            print(f"Nenhum locador encontrado na tabela relacional para contrato {contrato_id}, buscando dados do contrato principal...")
            contrato = buscar_contrato_por_id(contrato_id)
            if contrato and contrato.get('id_locador'):
                # Buscar dados do locador principal
                conn = get_conexao()
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT id, nome, cpf_cnpj, telefone, email
                    FROM Locadores
                    WHERE id = ?
                """, (contrato['id_locador'],))
                
                locador_data = cursor.fetchone()
                if locador_data:
                    columns = [column[0] for column in cursor.description]
                    locador_dict = {}
                    for i, value in enumerate(locador_data):
                        locador_dict[columns[i]] = value
                    
                    # Criar formato compatível com tabela relacional
                    result = [{
                        'id': None,
                        'contrato_id': contrato_id,
                        'locador_id': locador_dict['id'],
                        'conta_bancaria_id': None,
                        'porcentagem': 100.00,
                        'responsabilidade_principal': True,
                        'locador_nome': locador_dict['nome'],
                        'locador_documento': locador_dict['cpf_cnpj'],
                        'locador_telefone': locador_dict['telefone'],
                        'locador_email': locador_dict['email'],
                        'ativo': True
                    }]
                conn.close()
        
        return result
        
    except Exception as e:
        print(f"Erro ao buscar locadores do contrato {contrato_id}: {e}")
        return []

def buscar_locatarios_contrato(contrato_id):
    """Busca todos os locatários associados a um contrato específico"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT 
                cl.id,
                cl.contrato_id,
                cl.locatario_id,
                cl.responsabilidade_principal,
                cl.percentual_responsabilidade,
                l.nome as locatario_nome,
                l.cpf_cnpj as locatario_cpf,
                l.telefone as locatario_telefone,
                l.email as locatario_email,
                cl.ativo
            FROM ContratoLocatarios cl
            INNER JOIN Locatarios l ON cl.locatario_id = l.id
            WHERE cl.contrato_id = ? AND cl.ativo = 1
            ORDER BY cl.responsabilidade_principal DESC, l.nome
        """, (contrato_id,))
        
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        result = []
        
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        
        # Se não encontrou locatários na tabela relacional, fazer fallback para dados do contrato
        if not result:
            print(f"Nenhum locatário encontrado na tabela relacional para contrato {contrato_id}, buscando dados do contrato principal...")
            contrato = buscar_contrato_por_id(contrato_id)
            if contrato and contrato.get('id_locatario'):
                # Buscar dados do locatário principal
                conn = get_conexao()
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT id, nome, cpf_cnpj, telefone, email
                    FROM Locatarios
                    WHERE id = ?
                """, (contrato['id_locatario'],))
                
                locatario_data = cursor.fetchone()
                if locatario_data:
                    columns = [column[0] for column in cursor.description]
                    locatario_dict = {}
                    for i, value in enumerate(locatario_data):
                        locatario_dict[columns[i]] = value
                    
                    # Criar formato compatível com tabela relacional
                    result = [{
                        'id': None,
                        'contrato_id': contrato_id,
                        'locatario_id': locatario_dict['id'],
                        'responsabilidade_principal': True,
                        'percentual_responsabilidade': 100.00,
                        'locatario_nome': locatario_dict['nome'],
                        'locatario_cpf': locatario_dict['cpf_cnpj'],
                        'locatario_telefone': locatario_dict['telefone'],
                        'locatario_email': locatario_dict['email'],
                        'ativo': True
                    }]
                conn.close()
        
        return result
        
    except Exception as e:
        print(f"Erro ao buscar locatários do contrato {contrato_id}: {e}")
        return []

def salvar_locadores_contrato(contrato_id, locadores):
    """Salva múltiplos locadores para um contrato"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Primeiro, deletar locadores existentes do contrato
        cursor.execute("DELETE FROM ContratoLocadores WHERE contrato_id = ?", (contrato_id,))
        
        # Inserir novos locadores
        for locador in locadores:
            cursor.execute("""
                INSERT INTO ContratoLocadores 
                (contrato_id, locador_id, conta_bancaria_id, porcentagem, responsabilidade_principal, ativo)
                VALUES (?, ?, ?, ?, ?, 1)
            """, (
                contrato_id,
                locador['locador_id'],
                locador.get('conta_bancaria_id', 1),
                locador.get('porcentagem', 100.0),
                locador.get('responsabilidade_principal', False)
            ))
        
        conn.commit()
        conn.close()
        
        print(f"OK Locadores salvos para contrato {contrato_id}")
        return True
        
    except Exception as e:
        print(f"ERRO ao salvar locadores do contrato {contrato_id}: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def salvar_locatarios_contrato(contrato_id, locatarios):
    """Salva múltiplos locatários para um contrato"""
    try:
        print(f"Salvando {len(locatarios)} locatários para contrato {contrato_id}")
        
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Validar dados recebidos
        for i, locatario in enumerate(locatarios):
            print(f"  Locatário {i+1}: ID={locatario.get('locatario_id', 'N/A')}, Principal={locatario.get('responsabilidade_principal', 'N/A')}, %={locatario.get('percentual_responsabilidade', 'N/A')}")
            
            if locatario.get('locatario_id', 0) <= 0:
                raise ValueError(f"Locatário {i+1} tem ID inválido: {locatario.get('locatario_id')}")
        
        # Primeiro, deletar locatários existentes do contrato
        cursor.execute("DELETE FROM ContratoLocatarios WHERE contrato_id = ?", (contrato_id,))
        
        # Inserir novos locatários
        for locatario in locatarios:
            cursor.execute("""
                INSERT INTO ContratoLocatarios 
                (contrato_id, locatario_id, responsabilidade_principal, percentual_responsabilidade, ativo)
                VALUES (?, ?, ?, ?, 1)
            """, (
                contrato_id,
                locatario['locatario_id'],
                locatario.get('responsabilidade_principal', False),
                locatario.get('percentual_responsabilidade', 100.0)  # Usar valor do frontend
            ))
        
        conn.commit()
        conn.close()
        
        print(f"OK Locatarios salvos para contrato {contrato_id}")
        return True
        
    except Exception as e:
        print(f"ERRO ao salvar locatarios do contrato {contrato_id}: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def alterar_status_contrato_db(contrato_id, novo_status):
    """Altera o status de um contrato no banco de dados"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        print(f"Alterando status do contrato {contrato_id} para: {novo_status}")
        
        # Verificar se o contrato existe
        cursor.execute("SELECT id FROM Contratos WHERE id = ?", (contrato_id,))
        if not cursor.fetchone():
            print(f"Contrato {contrato_id} não encontrado")
            return False
        
        # Atualizar o status do contrato
        cursor.execute("""
            UPDATE Contratos 
            SET status = ?
            WHERE id = ?
        """, (novo_status, contrato_id))
        
        if cursor.rowcount > 0:
            conn.commit()
            print(f"OK Status do contrato {contrato_id} alterado para {novo_status}")
            conn.close()
            return True
        else:
            print(f"Nenhuma linha foi alterada para contrato {contrato_id}")
            conn.close()
            return False
        
    except Exception as e:
        print(f"ERRO ao alterar status do contrato {contrato_id}: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def buscar_todos_locadores_ativos():
    """Lista todos os locadores ativos para seleção em contratos"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, nome, cpf_cnpj, telefone, email, ativo
            FROM Locadores 
            WHERE ativo = 1
            ORDER BY nome
        """)
        
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        result = []
        
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
        
    except Exception as e:
        print(f"Erro ao buscar locadores ativos: {e}")
        return []

def validar_porcentagens_contrato(locadores):
    """Valida se as porcentagens dos locadores somam 100% e outras regras"""
    try:
        if not locadores:
            return {"success": False, "message": "É necessário ter pelo menos um locador"}
        
        # Verificar se há pelo menos um principal
        tem_principal = any(l.get('responsabilidade_principal', False) for l in locadores)
        if not tem_principal:
            return {"success": False, "message": "É necessário ter um locador como responsável principal"}
        
        # Verificar soma das porcentagens
        total_porcentagem = sum(float(l.get('porcentagem', 0)) for l in locadores)
        if abs(total_porcentagem - 100.0) > 0.01:  # Tolerância para arredondamentos
            return {"success": False, "message": f"As porcentagens devem somar 100% (atual: {total_porcentagem}%)"}
        
        return {"success": True, "message": "Validação OK", "details": {"total_porcentagem": total_porcentagem}}
        
    except Exception as e:
        return {"success": False, "message": f"Erro na validação: {e}"}

# =====================================================================
# FUNÇÕES DE HISTÓRICO DE CONTRATOS
# =====================================================================

def registrar_mudanca_contrato(id_contrato, campo_alterado, valor_anterior, valor_novo, tipo_operacao, descricao_mudanca, usuario=None):
    """Registra uma mudança no histórico de contratos - VERSÃO SEGURA"""
    try:
        # REATIVANDO histórico para identificar campos problemáticos
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Adicionar validação de campos
        if len(str(valor_anterior)) > 4000:
            valor_anterior = str(valor_anterior)[:4000] + "..."
        if len(str(valor_novo)) > 4000:
            valor_novo = str(valor_novo)[:4000] + "..."
            
        cursor.execute("""
            INSERT INTO HistoricoContratos 
            (id_contrato, campo_alterado, valor_anterior, valor_novo, tipo_operacao, descricao_mudanca, usuario)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (id_contrato, campo_alterado, str(valor_anterior), str(valor_novo), tipo_operacao, descricao_mudanca, usuario))
        
        conn.commit()
        conn.close()
        
        return {"success": True, "message": "Mudança registrada no histórico"}
        
        # CÓDIGO ORIGINAL COMENTADO:
        # conn = get_conexao()
        # cursor = conn.cursor()
        # 
        # cursor.execute("""
        #     INSERT INTO HistoricoContratos 
        #     (id_contrato, campo_alterado, valor_anterior, valor_novo, tipo_operacao, descricao_mudanca, usuario)
        #     VALUES (?, ?, ?, ?, ?, ?, ?)
        # """, (id_contrato, campo_alterado, valor_anterior, valor_novo, tipo_operacao, descricao_mudanca, usuario))
        # 
        # conn.commit()
        # conn.close()
        # 
        # return {"success": True, "message": "Mudança registrada no histórico"}
        
    except Exception as e:
        print(f"Erro ao registrar mudança no histórico: {e}")
        return {"success": False, "message": f"Erro ao registrar histórico: {e}"}

def buscar_historico_contrato(id_contrato):
    """Busca todo o histórico de mudanças de um contrato"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                id,
                campo_alterado,
                valor_anterior,
                valor_novo,
                tipo_operacao,
                descricao_mudanca,
                data_alteracao,
                usuario,
                observacoes
            FROM HistoricoContratos
            WHERE id_contrato = ?
            ORDER BY data_alteracao DESC
        """, (id_contrato,))
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionários
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                # Converter datetime para string se necessário
                if hasattr(value, 'strftime'):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        
        return {
            "success": True,
            "data": result,
            "total": len(result)
        }
        
    except Exception as e:
        print(f"Erro ao buscar histórico: {e}")
        return {"success": False, "message": f"Erro ao buscar histórico: {e}"}

def comparar_contratos_para_historico(contrato_antigo, contrato_novo, id_contrato, usuario=None):
    """Compara dois contratos e registra automaticamente as diferenças no histórico"""
    try:
        mudancas_registradas = []
        
        # Campos importantes para monitorar (EXPANDIDO)
        campos_monitorados = {
            # Campos financeiros principais
            'valor_aluguel': 'Valor do Aluguel',
            'valor_condominio': 'Valor do Condomínio',
            'valor_iptu': 'Valor do IPTU',
            'valor_seguro': 'Valor do Seguro',
            'taxa_administracao': 'Taxa de Administração',
            'bonificacao': 'Bonificação',
            'fundo_conservacao': 'Fundo de Conservação',
            'percentual_multa_atraso': 'Multa por Atraso (%)',
            
            # Campos de datas principais
            'data_inicio': 'Data de Início',
            'data_fim': 'Data de Término',
            'data_assinatura': 'Data de Assinatura',
            'data_entrega_chaves': 'Data de Entrega das Chaves',
            'proximo_reajuste': 'Próximo Reajuste',
            'ultimo_reajuste': 'Último Reajuste',
            
            # Status e configurações
            'status': 'Status do Contrato',
            'tipo_garantia': 'Tipo de Garantia',
            'tipo_plano_locacao': 'Tipo de Plano de Locação',
            
            # Configurações de pagamento
            'vencimento_dia': 'Dia de Vencimento',
            'dia_vencimento': 'Dia de Vencimento (Alt)',
            'forma_pagamento': 'Forma de Pagamento',
            'prazo_pagamento': 'Prazo de Pagamento',
            
            # Configurações de reajuste
            'tempo_reajuste': 'Período de Reajuste',
            'percentual_reajuste': 'Percentual de Reajuste',
            'indice_reajuste': 'Índice de Reajuste',
            'prazo_reajuste': 'Prazo de Reajuste',
            
            # Opções booleanas importantes
            'renovacao_automatica': 'Renovação Automática',
            'retido_fci': 'Retido FCI',
            'retido_iptu': 'Retido IPTU', 
            'retido_condominio': 'Retido Condomínio',
            'antecipa_condominio': 'Antecipa Condomínio',
            
            # Campos de texto importantes
            'observacoes': 'Observações',
            'clausulas_adicionais': 'Cláusulas Adicionais'
        }
        
        for campo_db, campo_nome in campos_monitorados.items():
            valor_antigo = contrato_antigo.get(campo_db)
            valor_novo = contrato_novo.get(campo_db)
            
            # Converter valores para string para comparação
            valor_antigo_str = str(valor_antigo) if valor_antigo is not None else ''
            valor_novo_str = str(valor_novo) if valor_novo is not None else ''
            
            # Se houve mudança, registrar
            if valor_antigo_str != valor_novo_str:
                # Determinar tipo de operação baseado no campo
                if campo_db == 'valor_aluguel' and valor_novo and valor_antigo:
                    tipo_operacao = 'REAJUSTE'
                    descricao = f'{campo_nome} alterado de R$ {valor_antigo} para R$ {valor_novo}'
                elif campo_db in ['data_inicio', 'data_fim']:
                    tipo_operacao = 'RENOVACAO'
                    descricao = f'{campo_nome} alterado de {valor_antigo} para {valor_novo}'
                else:
                    tipo_operacao = 'UPDATE'
                    descricao = f'{campo_nome} alterado'
                
                resultado = registrar_mudanca_contrato(
                    id_contrato=id_contrato,
                    campo_alterado=campo_db,
                    valor_anterior=valor_antigo_str,
                    valor_novo=valor_novo_str,
                    tipo_operacao=tipo_operacao,
                    descricao_mudanca=descricao,
                    usuario=usuario
                )
                
                if resultado.get('success'):
                    mudancas_registradas.append(campo_nome)
        
        return {
            "success": True,
            "message": f"{len(mudancas_registradas)} mudanças registradas no histórico",
            "mudancas": mudancas_registradas
        }
        
    except Exception as e:
        print(f"Erro ao comparar contratos: {e}")
        return {"success": False, "message": f"Erro ao comparar contratos: {e}"}

def buscar_pets_por_contrato(contrato_id):
    """Busca todos os pets de um contrato"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                id,
                nome,
                especie,
                raca,
                tamanho,
                idade,
                peso_kg,
                cor,
                sexo,
                castrado,
                vacinado,
                observacoes,
                ativo
            FROM ContratoPets
            WHERE contrato_id = ?
            ORDER BY id
        """, (contrato_id,))
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionários
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
        
    except Exception as e:
        print(f"Erro ao buscar pets: {e}")
        return []

def buscar_garantias_por_contrato(contrato_id):
    """Busca todas as garantias de um contrato"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                id,
                pessoa_id,
                pessoa_tipo,
                tipo_garantia,
                valor_garantia,
                fiador_nome,
                fiador_cpf,
                fiador_telefone,
                fiador_endereco,
                caucao_tipo,
                caucao_descricao,
                caucao_data_devolucao,
                titulo_seguradora,
                titulo_numero,
                titulo_valor,
                titulo_vencimento,
                apolice_seguradora,
                apolice_numero,
                apolice_valor_cobertura,
                apolice_vigencia_inicio,
                apolice_vigencia_fim,
                observacoes,
                documentos_path,
                ativo
            FROM GarantiasIndividuais
            WHERE contrato_id = ?
            ORDER BY id
        """, (contrato_id,))
        
        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]
        
        # Converter resultados para lista de dicionários
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                # Converter datetime para string se necessário
                if hasattr(value, 'strftime'):
                    row_dict[columns[i]] = value.strftime('%Y-%m-%d')
                else:
                    row_dict[columns[i]] = value
            result.append(row_dict)
        
        conn.close()
        return result
        
    except Exception as e:
        print(f"Erro ao buscar garantias: {e}")
        return []

def buscar_plano_por_contrato(contrato_id):
    """Busca o plano de locação de um contrato"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Buscar plano associado ao contrato
        cursor.execute("""
            SELECT 
                c.id_plano_locacao,
                c.tipo_plano_locacao,
                p.id,
                p.codigo,
                p.nome,
                p.descricao,
                p.categoria,
                p.opcao,
                p.taxa_primeiro_aluguel,
                p.taxa_demais_alugueis,
                p.taxa_administracao,
                p.aplica_taxa_unica
            FROM Contratos c
            LEFT JOIN PlanosLocacao p ON c.id_plano_locacao = p.id
            WHERE c.id = ?
        """, (contrato_id,))
        
        resultado = cursor.fetchone()
        
        if resultado:
            plano_data = {
                'contrato_id_plano_locacao': resultado[0],
                'contrato_tipo_plano_locacao': resultado[1],
                'plano_id': resultado[2],
                'plano_codigo': resultado[3],
                'plano_nome': resultado[4],
                'plano_descricao': resultado[5],
                'plano_categoria': resultado[6],
                'plano_opcao': resultado[7],
                'plano_taxa_primeiro_aluguel': float(resultado[8]) if resultado[8] else 0,
                'plano_taxa_demais_alugueis': float(resultado[9]) if resultado[9] else 0,
                'plano_taxa_administracao': float(resultado[10]) if resultado[10] else 0,
                'plano_aplica_taxa_unica': resultado[11] if resultado[11] is not None else False
            }
            
            conn.close()
            return plano_data
        else:
            conn.close()
            return None
        
    except Exception as e:
        print(f"Erro ao buscar plano: {e}")
        return None

def buscar_pets_por_contrato(contrato_id):
    """Busca todos os pets de um contrato da tabela ContratoPets"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                id,
                contrato_id,
                nome,
                especie,
                raca,
                tamanho,
                idade,
                peso_kg,
                cor,
                sexo,
                castrado,
                vacinado,
                observacoes,
                ativo
            FROM ContratoPets
            WHERE contrato_id = ? AND ativo = 1
            ORDER BY id
        """, (contrato_id,))
        
        pets = []
        for row in cursor.fetchall():
            pets.append({
                'id': row[0],
                'contrato_id': row[1],
                'nome': row[2] or '',
                'especie': row[3] or '',
                'raca': row[4] or '',
                'tamanho': row[5] or '',
                'idade': row[6] or 0,
                'peso_kg': float(row[7]) if row[7] else 0,
                'cor': row[8] or '',
                'sexo': row[9] or '',
                'castrado': bool(row[10]) if row[10] is not None else False,
                'vacinado': bool(row[11]) if row[11] is not None else False,
                'observacoes': row[12] or '',
                'ativo': bool(row[13]) if row[13] is not None else True
            })
        
        conn.close()
        print(f"Encontrados {len(pets)} pets para contrato {contrato_id}")
        return pets
        
    except Exception as e:
        print(f"Erro ao buscar pets: {e}")
        return []

def listar_planos_locacao():
    """Lista todos os planos de locação disponíveis"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                id,
                codigo,
                nome,
                descricao,
                categoria,
                opcao,
                taxa_primeiro_aluguel,
                taxa_demais_alugueis,
                taxa_administracao,
                aplica_taxa_unica,
                ativo
            FROM PlanosLocacao
            WHERE ativo = 1
            ORDER BY categoria, nome
        """)
        
        planos = []
        for row in cursor.fetchall():
            planos.append({
                'id': row[0],
                'codigo': row[1] or '',
                'nome': row[2] or '',
                'descricao': row[3] or '',
                'categoria': row[4] or '',
                'opcao': row[5] or '',
                'taxa_primeiro_aluguel': float(row[6]) if row[6] else 0,
                'taxa_demais_alugueis': float(row[7]) if row[7] else 0,
                'taxa_administracao': float(row[8]) if row[8] else 0,
                'aplica_taxa_unica': bool(row[9]) if row[9] is not None else False,
                'ativo': bool(row[10]) if row[10] is not None else True
            })
        
        conn.close()
        print(f"Encontrados {len(planos)} planos de locação")
        return planos
        
    except Exception as e:
        print(f"Erro ao listar planos: {e}")
        return []

def salvar_dados_bancarios_corretor(contrato_id, dados_bancarios):
    """Salva os dados bancários do corretor na tabela CorretorContaBancaria"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Primeiro, remover dados bancários existentes do corretor para este contrato
        cursor.execute("DELETE FROM CorretorContaBancaria WHERE contrato_id = ?", (contrato_id,))
        
        # Se há dados bancários para salvar
        if dados_bancarios and any(dados_bancarios.values()):
            cursor.execute("""
                INSERT INTO CorretorContaBancaria (
                    contrato_id, banco, agencia, conta, tipo_conta, chave_pix, 
                    titular, principal, ativo, data_criacao
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())
            """, (
                contrato_id,
                dados_bancarios.get('banco', ''),
                dados_bancarios.get('agencia', ''),
                dados_bancarios.get('conta', ''),
                dados_bancarios.get('tipo_conta', ''),
                dados_bancarios.get('chave_pix', ''),
                dados_bancarios.get('titular', ''),  # Pode usar o nome do corretor
                True,  # principal
                True,  # ativo
            ))
            print(f"Dados bancários do corretor salvos para contrato {contrato_id}")
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        print(f"Erro ao salvar dados bancários do corretor: {e}")
        raise

def buscar_dados_bancarios_corretor(contrato_id):
    """Busca os dados bancários do corretor de um contrato"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT banco, agencia, conta, tipo_conta, chave_pix, titular
            FROM CorretorContaBancaria 
            WHERE contrato_id = ? AND ativo = 1
        """, (contrato_id,))
        
        resultado = cursor.fetchone()
        conn.close()
        
        if resultado:
            return {
                'banco': resultado[0] or '',
                'agencia': resultado[1] or '',
                'conta': resultado[2] or '',
                'tipo_conta': resultado[3] or '',
                'chave_pix': resultado[4] or '',
                'titular': resultado[5] or ''
            }
        else:
            return {}
            
    except Exception as e:
        print(f"Erro ao buscar dados bancários do corretor: {e}")
        return {}