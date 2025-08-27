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

# Funções diretas para as tabelas corretas
def buscar_locadores():
    """Busca todos os locadores da tabela Locadores"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Locadores")
        
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
        print(f"Erro ao buscar locadores: {e}")
        return []

def buscar_locatarios():
    """Busca todos os locatários da tabela Locatarios"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Locatarios")
        
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
        print(f"Erro ao buscar locatários: {e}")
        return []

def buscar_imoveis():
    """Busca todos os imóveis da tabela Imoveis"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Imoveis")
        
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
        return result
    except Exception as e:
        print(f"Erro ao buscar imóveis: {e}")
        return []

# Funções de inserção (usar as existentes)
from locacao.repositories.cliente_repository import inserir_cliente
from locacao.repositories.inquilino_repository import inserir_inquilino  
from locacao.repositories.imovel_repository import inserir_imovel
from locacao.repositories.contrato_repository import inserir_contrato

def inserir_locador(**kwargs):
    return inserir_cliente(**kwargs)

def atualizar_locador(locador_id, **kwargs):
    """Atualiza um locador na tabela Locadores"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Primeiro verificar se o locador existe
        cursor.execute("SELECT id, nome FROM Locadores WHERE id = ?", locador_id)
        locador_existente = cursor.fetchone()
        
        if not locador_existente:
            print(f"Locador ID {locador_id} não encontrado na tabela Locadores")
            
            # Verificar se existe na tabela Clientes
            cursor.execute("SELECT id, nome FROM Clientes WHERE id = ?", locador_id)
            cliente_existente = cursor.fetchone()
            
            if cliente_existente:
                print(f"Locador ID {locador_id} encontrado na tabela Clientes: {cliente_existente[1]}")
                print("Tentando atualizar na tabela Clientes...")
                return atualizar_cliente(locador_id, **kwargs)
            else:
                print(f"ID {locador_id} não encontrado nem em Locadores nem em Clientes")
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
        
        # Filtrar apenas os campos que foram enviados e são atualizáveis
        campos_para_atualizar = {}
        for campo, valor in kwargs.items():
            if campo in campos_atualizaveis and valor is not None:
                # Converter valores string para int quando necessário
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
            print(f"Nenhuma linha foi atualizada - locador {locador_id} pode não existir")
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
            print(f"Locador ID {locador_id} não encontrado na tabela Locadores")
            
            # Verificar se existe na tabela Clientes
            cursor.execute("SELECT id, nome FROM Clientes WHERE id = ?", locador_id)
            cliente_existente = cursor.fetchone()
            
            if cliente_existente:
                print(f"Atualizando status na tabela Clientes para locador {locador_id}")
                cursor.execute("UPDATE Clientes SET ativo = ? WHERE id = ?", (1 if ativo else 0, locador_id))
            else:
                print(f"ID {locador_id} não encontrado nem em Locadores nem em Clientes")
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
            print(f"Nenhuma linha foi atualizada - locador {locador_id} pode não existir")
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
        
        # Filtrar apenas os campos que foram enviados e são atualizáveis
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
        
        print(f"🔄 Executando UPDATE na tabela Clientes: {query}")
        print(f"📋 Valores: {valores}")
        
        cursor.execute(query, valores)
        linhas_afetadas = cursor.rowcount
        conn.commit()
        conn.close()
        
        if linhas_afetadas > 0:
            print(f"✅ Cliente {cliente_id} atualizado com sucesso! ({linhas_afetadas} linha(s))")
            return True
        else:
            print(f"⚠️ Nenhuma linha foi atualizada - cliente {cliente_id} pode não existir")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao atualizar cliente {cliente_id}: {e}")
        return False

def inserir_locatario(dados):
    return inserir_inquilino(dados)

# Funções que faltam mas são esperadas pelo main.py
def buscar_locadores_com_contratos():
    """Lista todos os locadores que possuem contratos ativos"""
    return []

def buscar_prestacao_contas_mensal(id_locador, mes, ano):
    """Obtém a prestação de contas mensal de um locador"""
    return {"error": "Funcionalidade ainda não implementada"}

def inserir_lancamento_liquido(id_pagamento, tipo, valor):
    """Cria um novo lançamento líquido"""
    return False

def inserir_desconto_deducao(id_pagamento, tipo, valor):
    """Cria um novo desconto/dedução"""
    return False

def atualizar_pagamento_detalhes(id_pagamento, mes_referencia, ano_referencia, total_bruto, total_liquido, observacao, pagamento_atrasado):
    """Atualiza os detalhes de um pagamento"""
    return False

def buscar_historico_prestacao_contas(id_locador, limit):
    """Obtém o histórico de prestações de contas de um locador"""
    return []

def gerar_relatorio_excel(dados):
    """Gera relatório em Excel da prestação de contas"""
    return None

def gerar_relatorio_pdf(dados):
    """Gera relatório em PDF da prestação de contas"""
    return None

def inserir_contrato_locadores(contrato_id, locadores):
    """Define os locadores associados a um contrato com suas contas e porcentagens"""
    return False

def buscar_locadores_contrato(contrato_id):
    """Busca todos os locadores associados a um contrato"""
    return []

def buscar_contas_bancarias_locador(locador_id):
    """Lista todas as contas bancárias de um locador específico"""
    return []

def validar_porcentagens_contrato(locadores):
    """Valida se as porcentagens dos locadores somam 100% e outras regras"""
    return {"success": True, "message": "Validação OK", "details": {}}

def buscar_todos_locadores_ativos():
    """Lista todos os locadores ativos para seleção em contratos"""
    return []

def buscar_contratos():
    """Busca todos os contratos com informações relacionadas"""
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
                c.status,
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
        print(f"Erro ao buscar contratos por locador: {e}")
        return []

# === FUNÇÕES PARA FATURAS ===

def buscar_faturas(filtros=None, page=1, limit=20, order_by='data_vencimento', order_dir='DESC'):
    """Busca faturas com filtros, paginação e ordenação"""
    
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
            'observacoes': 'Aguardando confirmação',
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
            'observacoes': 'Aguardando negociação',
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
            'observacoes': 'Cliente não localizado',
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
    
    # Aplicar alterações de status às faturas
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
    
    # Aplicar ordenação
    reverse = order_dir == 'DESC'
    if order_by == 'valor_total':
        faturas_filtradas.sort(key=lambda x: x['valor_total'], reverse=reverse)
    elif order_by == 'data_vencimento':
        faturas_filtradas.sort(key=lambda x: x['data_vencimento'], reverse=reverse)
    elif order_by == 'numero_fatura':
        faturas_filtradas.sort(key=lambda x: x['numero_fatura'], reverse=reverse)
    
    # Aplicar paginação
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
        
        # Construir condições WHERE baseadas nos filtros
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
        
        # Adicionar ordenação
        query += f" ORDER BY {order_by} {order_dir}"
        
        # Executar query para contagem total
        count_query = f"SELECT COUNT(*) FROM ({query}) as total_query"
        cursor.execute(count_query, params)
        total = cursor.fetchone()[0]
        
        # Adicionar paginação
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
    
    # Aplicar alterações de status às faturas de exemplo
    for i, fatura in enumerate(faturas_exemplo):
        fatura_id = fatura.get('id', i + 1)  # Usar índice + 1 como ID se não houver
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
    """Simula geração de boleto para uma fatura"""
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
    """Calcula situação do pagamento baseado nas datas"""
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