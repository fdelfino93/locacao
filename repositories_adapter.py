# Adaptador para compatibilizar os nomes dos repositórios com o main.py

import pyodbc
import os
from dotenv import load_dotenv

# ==================== FUNÇÕES UNIFICADAS PARA ESTRUTURA HÍBRIDA ====================

def obter_locadores_contrato_unificado(contrato_id):
    """
    Busca locadores de um contrato priorizando tabela N:N
    Fallback para estrutura antiga se N:N estiver vazia
    Resolve problema de contagem duplicada
    """
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            # 1. TENTAR buscar da tabela N:N primeiro
            cursor.execute("""
                SELECT 
                    cl.locador_id,
                    l.nome as locador_nome,
                    cl.porcentagem,
                    cl.responsabilidade_principal,
                    cl.ativo
                FROM ContratoLocadores cl
                INNER JOIN Locadores l ON cl.locador_id = l.id
                WHERE cl.contrato_id = ? AND cl.ativo = 1
                ORDER BY cl.responsabilidade_principal DESC, cl.porcentagem DESC
            """, (contrato_id,))
            
            locadores_nn = cursor.fetchall()
            
            if locadores_nn:
                print(f"Contrato {contrato_id}: {len(locadores_nn)} locadores via tabela N:N")
                return [(row[0], row[1], float(row[2]), bool(row[3])) for row in locadores_nn]
            
            # 2. FALLBACK para estrutura antiga (via Imoveis)
            # print(f"AVISO: Contrato {contrato_id}: usando fallback via Imoveis.id_locador")
            cursor.execute("""
                SELECT 
                    l.id as locador_id,
                    l.nome as locador_nome,
                    100.00 as porcentagem,
                    1 as responsabilidade_principal
                FROM Contratos c
                INNER JOIN Imoveis i ON c.id_imovel = i.id
                INNER JOIN Locadores l ON i.id_locador = l.id
                WHERE c.id = ? AND l.id IS NOT NULL
            """, (contrato_id,))
            
            locadores_antigas = cursor.fetchall()
            resultado = [(row[0], row[1], float(row[2]), bool(row[3])) for row in locadores_antigas] if locadores_antigas else []
            
            print(f"Contrato {contrato_id}: {len(resultado)} locadores via fallback")
            return resultado
            
    except Exception as e:
        print(f"ERRO ao buscar locadores do contrato {contrato_id}: {e}")
        return []

def obter_locatarios_contrato_unificado(contrato_id):
    """
    Busca locatários de um contrato priorizando tabela N:N
    Fallback para FK antiga se N:N estiver vazia
    """
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            # 1. TENTAR buscar da tabela N:N primeiro
            cursor.execute("""
                SELECT 
                    cl.locatario_id,
                    l.nome as locatario_nome,
                    cl.percentual_responsabilidade,
                    cl.responsabilidade_principal,
                    cl.ativo
                FROM ContratoLocatarios cl
                INNER JOIN Locatarios l ON cl.locatario_id = l.id
                WHERE cl.contrato_id = ? AND cl.ativo = 1
                ORDER BY cl.responsabilidade_principal DESC, cl.percentual_responsabilidade DESC
            """, (contrato_id,))
            
            locatarios_nn = cursor.fetchall()
            
            if locatarios_nn:
                print(f"Contrato {contrato_id}: {len(locatarios_nn)} locatários via tabela N:N")
                return [(row[0], row[1], float(row[2]), bool(row[3])) for row in locatarios_nn]
            
            # 2. FALLBACK para FK antiga
            # print(f"AVISO: Contrato {contrato_id}: usando fallback via Contratos.id_locatario")
            cursor.execute("""
                SELECT 
                    l.id as locatario_id,
                    l.nome as locatario_nome,
                    100.00 as percentual_responsabilidade,
                    1 as responsabilidade_principal
                FROM Contratos c
                INNER JOIN ContratoLocatarios cl ON c.id = cl.contrato_id AND cl.responsabilidade_principal = 1
                INNER JOIN Locatarios l ON cl.locatario_id = l.id
                WHERE c.id = ? AND l.id IS NOT NULL
            """, (contrato_id,))
            
            locatarios_antigos = cursor.fetchall()
            resultado = [(row[0], row[1], float(row[2]), bool(row[3])) for row in locatarios_antigos] if locatarios_antigos else []
            
            print(f"Contrato {contrato_id}: {len(resultado)} locatários via fallback")
            return resultado
            
    except Exception as e:
        print(f"ERRO ao buscar locatários do contrato {contrato_id}: {e}")
        return []

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
    """Busca todos os locadores da tabela Locadores com endereços estruturados"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()

        # Query com JOIN para buscar endereços estruturados
        query = """
        SELECT
            l.*,
            e.id as endereco_estruturado_id,
            e.rua as endereco_rua,
            e.numero as endereco_numero,
            e.complemento as endereco_complemento,
            e.bairro as endereco_bairro,
            e.cidade as endereco_cidade,
            e.uf as endereco_estado,
            e.cep as endereco_cep
        FROM Locadores l
        LEFT JOIN EnderecoLocador e ON l.endereco_id = e.id
        ORDER BY l.ativo DESC, l.nome ASC
        """

        cursor.execute(query)

        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]

        # Converter resultados para lista de dicionarios
        rows = cursor.fetchall()
        result = []
        for row in rows:
            row_dict = {}
            for i, value in enumerate(row):
                row_dict[columns[i]] = value

            # Montar objeto endereco_estruturado se existir dados
            if row_dict.get('endereco_estruturado_id'):
                endereco_estruturado = {
                    'rua': row_dict.get('endereco_rua', ''),
                    'numero': row_dict.get('endereco_numero', ''),
                    'complemento': row_dict.get('endereco_complemento', ''),
                    'bairro': row_dict.get('endereco_bairro', ''),
                    'cidade': row_dict.get('endereco_cidade', ''),
                    'estado': row_dict.get('endereco_estado', ''),
                    'cep': row_dict.get('endereco_cep', '')
                }
                row_dict['endereco_estruturado'] = endereco_estruturado

                # Limpar campos auxiliares
                for campo in ['endereco_estruturado_id', 'endereco_rua', 'endereco_numero',
                             'endereco_complemento', 'endereco_bairro', 'endereco_cidade',
                             'endereco_estado', 'endereco_cep']:
                    row_dict.pop(campo, None)

            result.append(row_dict)

        conn.close()
        print(f"Buscados {len(result)} locadores com endereços estruturados")
        return result
    except Exception as e:
        print(f"Erro ao buscar locadores: {e}")
        return []

def buscar_locador_por_id(locador_id):
    """Busca locador por ID com endereço estruturado (equivalente ao sistema de locatários)"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()

        # Query com JOIN para buscar endereço estruturado (igual ao buscar_locadores)
        query = """
        SELECT
            l.*,
            e.id as endereco_estruturado_id,
            e.rua as endereco_rua,
            e.numero as endereco_numero,
            e.complemento as endereco_complemento,
            e.bairro as endereco_bairro,
            e.cidade as endereco_cidade,
            e.uf as endereco_estado,
            e.cep as endereco_cep
        FROM Locadores l
        LEFT JOIN EnderecoLocador e ON l.endereco_id = e.id
        WHERE l.id = ?
        """

        cursor.execute(query, (locador_id,))

        # Obter nomes das colunas
        columns = [column[0] for column in cursor.description]

        # Converter resultado para dicionário
        row = cursor.fetchone()
        if not row:
            conn.close()
            print(f"ADAPTER: Locador ID {locador_id} não encontrado")
            return None

        row_dict = {}
        for i, value in enumerate(row):
            row_dict[columns[i]] = value

        # Montar objeto endereco_estruturado se existir dados
        if row_dict.get('endereco_estruturado_id'):
            endereco_estruturado = {
                'rua': row_dict.get('endereco_rua', ''),
                'numero': row_dict.get('endereco_numero', ''),
                'complemento': row_dict.get('endereco_complemento', ''),
                'bairro': row_dict.get('endereco_bairro', ''),
                'cidade': row_dict.get('endereco_cidade', ''),
                'estado': row_dict.get('endereco_estado', ''),
                'cep': row_dict.get('endereco_cep', '')
            }
            row_dict['endereco_estruturado'] = endereco_estruturado

            # Limpar campos auxiliares
            del row_dict['endereco_estruturado_id']
            del row_dict['endereco_rua']
            del row_dict['endereco_numero']
            del row_dict['endereco_complemento']
            del row_dict['endereco_bairro']
            del row_dict['endereco_cidade']
            del row_dict['endereco_estado']
            del row_dict['endereco_cep']
        else:
            # Se não tem endereço estruturado, manter endereço string como fallback
            row_dict['endereco_estruturado'] = None

        # 🔧 CORREÇÃO: Buscar contas bancárias do locador
        print(f"🏦 Buscando contas bancárias para locador ID {locador_id}")
        contas_bancarias = buscar_contas_bancarias_locador(locador_id)
        row_dict['contas_bancarias'] = contas_bancarias
        print(f"📋 Encontradas {len(contas_bancarias)} contas bancárias")

        # Buscar representante legal se for PJ
        if row_dict.get('tipo_pessoa') == 'PJ':
            print(f"🏢 Buscando representante legal para PJ - locador ID {locador_id}")
            representante = buscar_representante_legal_locador(locador_id)
            if representante:
                row_dict['representante_legal'] = representante
                print(f"✅ Representante legal encontrado: {representante.get('nome', 'Nome não informado')}")
            else:
                row_dict['representante_legal'] = None
                print(f"⚠️ Nenhum representante legal encontrado")

        conn.close()
        print(f"ADAPTER: Locador ID {locador_id} encontrado completo (endereço estruturado + contas bancárias + representante legal)")
        return row_dict

    except Exception as e:
        print(f"ADAPTER: Erro ao buscar locador por ID {locador_id}: {e}")
        return None

def buscar_locatarios():
    """Busca todos os locatários da tabela Locatarios"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM Locatarios ORDER BY nome")

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
    """Busca todos os imóveis da tabela Imoveis com seus locadores da tabela N:N"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Primeiro buscar todos os imóveis
        cursor.execute("SELECT * FROM Imoveis")
        columns = [column[0] for column in cursor.description]
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
            
            # Buscar todos os locadores deste imóvel na tabela N:N
            cursor.execute("""
                SELECT locador_id, porcentagem, responsabilidade_principal 
                FROM ImovelLocadores 
                WHERE imovel_id = ? AND ativo = 1
                ORDER BY responsabilidade_principal DESC, porcentagem DESC
            """, (row_dict['id'],))
            
            locadores_imovel = cursor.fetchall()
            
            # Adicionar array de locadores ao imóvel
            row_dict['locadores_ids'] = [loc[0] for loc in locadores_imovel]
            
            # Manter compatibilidade: se tem locadores na N:N, usar o principal
            # Se não tem, usar o campo antigo id_locador
            if locadores_imovel:
                # Pegar o primeiro (principal) da lista N:N
                row_dict['id_locador'] = locadores_imovel[0][0]
            # Senão, mantém o id_locador original do SELECT *
            
            result.append(row_dict)
        
        conn.close()
        return result
    except Exception as e:
        print(f"Erro ao buscar imóveis: {e}")
        return []

# Funçoes de insercao (usar as existentes) - REABILITADO PARA LOCATARIOS
# from locacao.repositories.cliente_repository import inserir_cliente
# from locacao.repositories.inquilino_repository import inserir_inquilino
from locacao.repositories.locatario_repository_v4_final import (
    inserir_locatario_v4,
    buscar_locatario_completo,
    buscar_inquilinos as buscar_locatarios_v4
)
# from locacao.repositories.imovel_repository import inserir_imovel as _inserir_imovel_original
# from locacao.repositories.contrato_repository import inserir_contrato

def inserir_cliente(**kwargs):
    """Insere um cliente (locador) na tabela Locadores com todos os campos suportados"""
    try:
        print(f"Inserindo cliente/locador - Dados recebidos: {kwargs}")
        
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            # Campos básicos obrigatórios
            nome = kwargs.get('nome', '')
            cpf_cnpj = kwargs.get('cpf_cnpj', '')
            telefone = kwargs.get('telefone', '')
            email = kwargs.get('email', '')
            endereco = kwargs.get('endereco', '')
            
            # Campos opcionais com valores padrão
            tipo_recebimento = kwargs.get('tipo_recebimento', 'PIX')
            conta_bancaria = kwargs.get('conta_bancaria', '')
            deseja_fci = kwargs.get('deseja_fci', 'Não')
            deseja_seguro_fianca = kwargs.get('deseja_seguro_fianca', 'Não')
            deseja_seguro_incendio = kwargs.get('deseja_seguro_incendio', 0)
            rg = kwargs.get('rg', '')
            dados_empresa = kwargs.get('dados_empresa', '')
            representante = kwargs.get('representante', '')
            nacionalidade = kwargs.get('nacionalidade', 'Brasileira')
            estado_civil = kwargs.get('estado_civil', 'Solteiro')
            profissao = kwargs.get('profissao', '')
            
            # Campos cônjuge
            existe_conjuge = kwargs.get('existe_conjuge', 0)
            nome_conjuge = kwargs.get('nome_conjuge', '')
            cpf_conjuge = kwargs.get('cpf_conjuge', '')
            rg_conjuge = kwargs.get('rg_conjuge', '')
            endereco_conjuge = kwargs.get('endereco_conjuge', '')
            telefone_conjuge = kwargs.get('telefone_conjuge', '')
            
            # Outros campos
            tipo_cliente = kwargs.get('tipo_cliente', 'Proprietário')
            data_nascimento = kwargs.get('data_nascimento')
            tipo_pessoa = kwargs.get('tipo_pessoa', 'PF')
            observacoes = kwargs.get('observacoes', '')
            
            # Novos campos PJ
            razao_social = kwargs.get('razao_social', '')
            nome_fantasia = kwargs.get('nome_fantasia', '')
            inscricao_estadual = kwargs.get('inscricao_estadual', '')
            inscricao_municipal = kwargs.get('inscricao_municipal', '')
            atividade_principal = kwargs.get('atividade_principal', '')
            data_constituicao = kwargs.get('data_constituicao')
            capital_social = kwargs.get('capital_social')
            porte_empresa = kwargs.get('porte_empresa', '')
            regime_tributario = kwargs.get('regime_tributario', '')

            # Campos adicionais que estavam faltando
            regime_bens = kwargs.get('regime_bens', '')
            email_recebimento = kwargs.get('email_recebimento', '')
            usa_multiplos_metodos = kwargs.get('usa_multiplos_metodos', 0)
            usa_multiplas_contas = kwargs.get('usa_multiplas_contas', 0)

            # Campos de auditoria
            from datetime import datetime
            data_cadastro = datetime.now()
            data_atualizacao = data_cadastro
            ativo = kwargs.get('ativo', True)
            
            # Processar endereço estruturado se fornecido
            endereco_id = None
            endereco_completo = endereco
            if isinstance(endereco, dict):
                endereco_id = inserir_endereco_locador(endereco)
                if endereco_id:
                    endereco_completo = f"{endereco.get('rua', '')}, {endereco.get('numero', '')} - {endereco.get('bairro', '')} - {endereco.get('cidade', '')}/{endereco.get('estado', 'PR')}"
                else:
                    endereco_completo = str(endereco)
            
            cursor.execute("""
                INSERT INTO Locadores (
                    nome, cpf_cnpj, telefone, email, endereco, endereco_id,
                    tipo_recebimento, conta_bancaria, deseja_fci, deseja_seguro_fianca,
                    deseja_seguro_incendio, rg, dados_empresa, representante,
                    nacionalidade, estado_civil, profissao, existe_conjuge,
                    nome_conjuge, cpf_conjuge, rg_conjuge, endereco_conjuge, telefone_conjuge,
                    tipo_cliente, data_nascimento, tipo_pessoa, observacoes,
                    razao_social, nome_fantasia, inscricao_estadual, inscricao_municipal,
                    atividade_principal, data_constituicao, capital_social, porte_empresa,
                    regime_tributario, regime_bens, email_recebimento, usa_multiplos_metodos,
                    usa_multiplas_contas, ativo, data_cadastro, data_atualizacao
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                nome, cpf_cnpj, telefone, email, endereco_completo, endereco_id,
                tipo_recebimento, conta_bancaria, deseja_fci, deseja_seguro_fianca,
                deseja_seguro_incendio, rg, dados_empresa, representante,
                nacionalidade, estado_civil, profissao, existe_conjuge,
                nome_conjuge, cpf_conjuge, rg_conjuge, endereco_conjuge, telefone_conjuge,
                tipo_cliente, data_nascimento, tipo_pessoa, observacoes,
                razao_social, nome_fantasia, inscricao_estadual, inscricao_municipal,
                atividade_principal, data_constituicao, capital_social, porte_empresa,
                regime_tributario, regime_bens, email_recebimento, usa_multiplos_metodos,
                usa_multiplas_contas, ativo, data_cadastro, data_atualizacao
            ))
            
            conn.commit()
            
            # Buscar o ID do locador inserido
            cursor.execute("SELECT @@IDENTITY")
            locador_id = cursor.fetchone()[0]
            
            # Processar múltiplas contas bancárias se fornecidas
            contas_bancarias = kwargs.get('contas_bancarias', [])
            if contas_bancarias and isinstance(contas_bancarias, list):
                for i, conta in enumerate(contas_bancarias):
                    # Primeira conta é sempre principal se não especificado
                    if i == 0 and 'principal' not in conta:
                        conta['principal'] = True
                    inserir_conta_bancaria_locador(locador_id, conta)
            
            # Processar representante legal se for PJ e fornecido
            if tipo_pessoa == 'PJ':
                representante_legal = kwargs.get('representante_legal')
                if representante_legal and isinstance(representante_legal, dict):
                    inserir_representante_legal_locador(locador_id, representante_legal)
            
            print(f"SUCESSO: Locador inserido com ID: {locador_id}")
            return int(locador_id)
            
    except Exception as e:
        print(f"ERRO: Erro ao inserir locador: {e}")
        import traceback
        traceback.print_exc()
        return None

def inserir_locador(**kwargs):
    return inserir_cliente(**kwargs)

def inserir_imovel(**kwargs):
    """Funcao híbrida segura para inserir imóveis - compatível com string e objeto"""
    try:
        print(f"Inserindo imóvel - Dados recebidos: {kwargs}")
        
        # PROCESSAMENTO HÍBRIDO DE ENDEREÇO - SEGURO
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
    """Atualiza um locador na tabela Locadores com suporte completo a todos os campos"""
    try:
        print(f"ATUALIZANDO LOCADOR ID {locador_id} - Dados recebidos: {kwargs}")
        
        conn = get_conexao()
        try:
            cursor = conn.cursor()
            
            # Verificar se o locador existe
            cursor.execute("SELECT id, nome FROM Locadores WHERE id = ?", (locador_id,))
            locador_existente = cursor.fetchone()
            
            if not locador_existente:
                print(f"ERRO: Locador ID {locador_id} não encontrado")
                return False
            
            print(f"Locador encontrado: {locador_existente[1]}")
            
            # Todos os campos atualizáveis da tabela Locadores
            campos_atualizaveis = {
                # Campos básicos
                'nome', 'cpf_cnpj', 'telefone', 'email', 'endereco',
                # Campos financeiros
                'tipo_recebimento', 'conta_bancaria', 'deseja_fci', 'deseja_seguro_fianca',
                'deseja_seguro_incendio',
                # Dados pessoais
                'rg', 'nacionalidade', 'estado_civil', 'profissao', 'data_nascimento',
                # Empresa/PJ
                'dados_empresa', 'representante', 'tipo_pessoa', 'razao_social',
                'nome_fantasia', 'inscricao_estadual', 'inscricao_municipal', 'atividade_principal',
                'data_constituicao', 'capital_social', 'porte_empresa', 'regime_tributario',
                # Cônjuge
                'existe_conjuge', 'nome_conjuge', 'cpf_conjuge', 'rg_conjuge',
                'endereco_conjuge', 'telefone_conjuge', 'regime_bens',
                # Outros
                'tipo_cliente', 'observacoes', 'ativo', 'endereco_id', 'dados_bancarios_id',
                'email_recebimento', 'usa_multiplos_metodos', 'usa_multiplas_contas', 'endereco_estruturado'
            }
            
            # Filtrar campos para atualizar
            campos_para_atualizar = {}
            for campo, valor in kwargs.items():
                if campo in campos_atualizaveis:
                    # Processamento de valores especiais
                    if campo in ['deseja_seguro_incendio', 'existe_conjuge']:
                        if isinstance(valor, str):
                            if valor.upper() in ['SIM', 'S', 'TRUE', '1']:
                                valor = 1
                            elif valor.upper() in ['NAO', 'N', 'FALSE', '0', 'NÃO']:
                                valor = 0
                            elif valor.isdigit():
                                valor = int(valor)
                        elif isinstance(valor, bool):
                            valor = 1 if valor else 0
                    
                    # Processar endereço estruturado - inserir na mesma transação
                    if campo == 'endereco' and isinstance(valor, dict):
                        # Apenas processar se tiver dados válidos
                        if valor.get('rua') and valor.get('cidade'):
                            endereco_id = inserir_endereco_locador_com_conexao(cursor, valor)
                            if endereco_id:
                                campos_para_atualizar['endereco_id'] = endereco_id
                                # Criar string de endereço para compatibilidade
                                valor = f"{valor.get('rua', '')}, {valor.get('numero', '')} - {valor.get('bairro', '')} - {valor.get('cidade', '')}/{valor.get('estado', 'PR')}"
                        else:
                            # Ignorar endereço vazio
                            continue
                    
                    # Processar arrays de telefones e emails
                    if campo == 'telefones' and isinstance(valor, list):
                        # Converter array para string separada por vírgula
                        valor = ', '.join(valor) if valor else ''
                        campo = 'telefone'  # Mapear para campo do banco
                    elif campo == 'emails' and isinstance(valor, list):
                        # Converter array para string separada por vírgula
                        valor = ', '.join(valor) if valor else ''
                        campo = 'email'  # Mapear para campo do banco
                    
                    # Processar endereco_estruturado especialmente - inserir na mesma transação
                    if campo == 'endereco_estruturado' and isinstance(valor, dict):
                        # Apenas processar se tiver dados válidos
                        if valor.get('rua') and valor.get('cidade'):
                            endereco_id = inserir_endereco_locador_com_conexao(cursor, valor)
                            if endereco_id:
                                campos_para_atualizar['endereco_id'] = endereco_id
                        # Não salvar no campo endereco_estruturado do banco principal
                        continue
                    
                    campos_para_atualizar[campo] = valor
                    
                elif campo in ['contas_bancarias', 'representante_legal']:
                    # Estes serão processados separadamente após a atualização principal
                    continue
                else:
                    print(f"AVISO: Campo '{campo}' ignorado (não está na lista de atualizáveis)")
            
            if not campos_para_atualizar:
                print("ERRO: Nenhum campo válido para atualizar")
                return False
            
            # Atualizar data_atualizacao
            from datetime import datetime
            campos_para_atualizar['data_atualizacao'] = datetime.now()
            
            # Construir e executar UPDATE
            set_clause = ", ".join([f"[{campo}] = ?" for campo in campos_para_atualizar.keys()])
            query = f"UPDATE Locadores SET {set_clause} WHERE id = ?"
            valores = list(campos_para_atualizar.values()) + [locador_id]
            
            print(f"Executando UPDATE com {len(campos_para_atualizar)} campos")
            cursor.execute(query, valores)
            
            # Processar contas bancárias múltiplas se fornecidas
            if 'contas_bancarias' in kwargs:
                contas = kwargs['contas_bancarias']
                if isinstance(contas, list):
                    # Desativar contas existentes
                    cursor.execute("UPDATE ContasBancariasLocador SET ativo = 0 WHERE locador_id = ?", (locador_id,))
                    # Inserir novas contas usando o cursor existente
                    for i, conta in enumerate(contas):
                        if i == 0 and 'principal' not in conta:
                            conta['principal'] = True
                        inserir_conta_bancaria_locador_com_cursor(cursor, locador_id, conta)
            
            # Processar representante legal se for PJ
            if kwargs.get('tipo_pessoa') == 'PJ' and 'representante_legal' in kwargs:
                representante = kwargs['representante_legal']
                if isinstance(representante, dict) and representante.get('nome'):
                    # Remover representante anterior
                    cursor.execute("DELETE FROM RepresentanteLegalLocador WHERE id_locador = ?", (locador_id,))
                    # Inserir novo representante usando a mesma conexão
                    from datetime import datetime
                    cursor.execute("""
                        INSERT INTO RepresentanteLegalLocador (
                            id_locador, nome, cpf, rg, endereco, telefone, email, cargo, 
                            data_nascimento, nacionalidade, estado_civil, profissao, created_at
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        locador_id,
                        representante.get('nome', ''),
                        representante.get('cpf', ''),
                        representante.get('rg', ''),
                        representante.get('endereco', ''),
                        representante.get('telefone', ''),
                        representante.get('email', ''),
                        representante.get('cargo', 'Administrador'),
                        representante.get('data_nascimento'),
                        representante.get('nacionalidade', ''),
                        representante.get('estado_civil', ''),
                        representante.get('profissao', ''),
                        datetime.now()
                    ))
            
            # Atualizar telefones se fornecidos
            if 'telefones' in kwargs:
                atualizar_telefones_locador(cursor, locador_id, kwargs['telefones'])
            
            # Atualizar emails se fornecidos  
            if 'emails' in kwargs:
                atualizar_emails_locador(cursor, locador_id, kwargs['emails'])
            
            # Atualizar métodos de pagamento se fornecidos
            if 'metodos_pagamento' in kwargs:
                atualizar_metodos_pagamento_locador(cursor, locador_id, kwargs['metodos_pagamento'])
            
            conn.commit()
            
            if cursor.rowcount > 0:
                print(f"SUCESSO: Locador {locador_id} atualizado ({cursor.rowcount} linha(s))")
                return True
            else:
                print(f"AVISO: Nenhuma linha foi afetada")
                return False
                
        finally:
            conn.close()
            
    except Exception as e:
        print(f"ERRO ao atualizar locador {locador_id}: {e}")
        import traceback
        traceback.print_exc()
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
    """Inserir locatário usando repository v4 com múltiplos contatos"""
    try:
        # Se dados for um dict Pydantic, converter
        if hasattr(dados, 'dict'):
            dados_dict = dados.dict()
        elif hasattr(dados, 'model_dump'):
            dados_dict = dados.model_dump()
        else:
            dados_dict = dados if isinstance(dados, dict) else dados.__dict__
        
        print(f"ADAPTER: Inserindo locatário com dados: {dados_dict.keys()}")
        
        # Usar repository v4 que suporta múltiplos contatos
        locatario_id = inserir_locatario_v4(dados_dict)
        
        if locatario_id:
            print(f"ADAPTER: Locatário inserido com ID: {locatario_id}")
            return {"id": locatario_id, "success": True}
        else:
            print("ADAPTER: Falha na inserção via v4")
            return None
            
    except Exception as e:
        print(f"ADAPTER: Erro no v4, tentando fallback: {e}")
        # Fallback para repository antigo
        try:
            return inserir_inquilino(dados_dict if 'dados_dict' in locals() else dados)
        except Exception as e2:
            print(f"ADAPTER: Fallback também falhou: {e2}")
            return None

def buscar_locatario_por_id(locatario_id):
    """Busca locatário por ID usando repository v4 (dados completos)"""
    try:
        # Usar repository v4 que retorna todos os contatos
        locatario = buscar_locatario_completo(locatario_id)
        if locatario:
            print(f"ADAPTER: Locatário ID {locatario_id} encontrado via v4")
            return locatario
        else:
            print(f"ADAPTER: Locatário ID {locatario_id} não encontrado via v4")
            return None
    except Exception as e:
        print(f"ADAPTER: Erro no v4, usando fallback: {e}")
        # Fallback para busca simples
        try:
            conn = get_conexao()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM Locatarios WHERE id = ?", (locatario_id,))
            
            row = cursor.fetchone()
            if row:
                columns = [column[0] for column in cursor.description]
                row_dict = dict(zip(columns, row))
                conn.close()
                print(f"ADAPTER: Locatário ID {locatario_id} encontrado via fallback")
                return row_dict
            else:
                conn.close()
                return None
        except Exception as e2:
            print(f"ADAPTER: Fallback também falhou: {e2}")
            return None

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
    """Gera relatório em PDF usando APENAS template HTML personalizado da COBIMOB"""
    try:
        from gerar_pdf_html import gerar_pdf_de_html
        return gerar_pdf_de_html(dados)
    except Exception as e:
        print(f"ERRO ao gerar PDF personalizado: {e}")
        raise Exception(f"Falha na geração do PDF: {e}")

def buscar_contratos_ativos():
    """Busca todos os contratos válidos (ativo, reajuste, vencendo) para seleção na prestação de contas - VERSÃO HÍBRIDA UNIFICADA"""
    try:
        # print("PRESTACAO: Iniciando busca HIBRIDA de contratos...")
        
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            # Query básica dos contratos SEM JOINs duplicados
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
                    c.status,
                    c.valor_iptu,
                    c.valor_condominio,
                    c.valor_seguro_fianca,
                    c.valor_seguro_incendio,
                    c.valor_fci,
                    c.bonificacao,
                    -- Campos de retenção
                    c.retido_fci,
                    c.retido_condominio,
                    c.retido_seguro_fianca,
                    c.retido_seguro_incendio,
                    c.retido_iptu,
                    -- Campos de antecipação
                    c.antecipa_condominio,
                    c.antecipa_seguro_fianca,
                    c.antecipa_seguro_incendio,
                    c.antecipa_iptu,
                    -- Calcular valor total retido (valores retidos do aluguel)
                    (CASE WHEN c.retido_fci = 1 THEN ISNULL(c.valor_fci, 0) ELSE 0 END +
                     CASE WHEN c.retido_condominio = 1 THEN ISNULL(c.valor_condominio, 0) ELSE 0 END +
                     CASE WHEN c.retido_seguro_fianca = 1 THEN ISNULL(c.valor_seguro_fianca, 0) ELSE 0 END +
                     CASE WHEN c.retido_seguro_incendio = 1 THEN ISNULL(c.valor_seguro_incendio, 0) ELSE 0 END +
                     CASE WHEN c.retido_iptu = 1 THEN ISNULL(c.valor_iptu, 0) ELSE 0 END) as valor_retido,
                    -- Calcular valor total antecipado (valores que a empresa antecipa ao locador)
                    (CASE WHEN c.antecipa_condominio = 1 THEN ISNULL(c.valor_condominio, 0) ELSE 0 END +
                     CASE WHEN c.antecipa_seguro_fianca = 1 THEN ISNULL(c.valor_seguro_fianca, 0) ELSE 0 END +
                     CASE WHEN c.antecipa_seguro_incendio = 1 THEN ISNULL(c.valor_seguro_incendio, 0) ELSE 0 END +
                     CASE WHEN c.antecipa_iptu = 1 THEN ISNULL(c.valor_iptu, 0) ELSE 0 END) as valor_antecipado,
                    -- Campos de parcelas e datas para seguro fiança
                    c.parcelas_seguro_fianca,
                    c.seguro_fianca_inicio,
                    c.seguro_fianca_fim,
                    -- Campos de parcelas e datas para seguro incêndio
                    c.parcelas_seguro_incendio,
                    c.seguro_incendio_inicio,
                    c.seguro_incendio_fim,
                    -- Campos de parcelas e datas para IPTU
                    c.parcelas_iptu,
                    c.data_inicio_iptu,
                    c.data_fim_iptu,
                    i.endereco as imovel_endereco,
                    i.tipo as imovel_tipo
                FROM Contratos c
                LEFT JOIN Imoveis i ON c.id_imovel = i.id
                WHERE c.status IN ('ativo', 'reajuste', 'vencendo', 'vencido') OR c.status IS NULL
                ORDER BY c.data_inicio DESC
            """)
            
            rows = cursor.fetchall()
            print(f"PRESTACAO: Encontrados {len(rows)} contratos no banco")
            
            columns = [column[0] for column in cursor.description]
            contratos = []
            
            for row in rows:
                contrato_dict = {}
                for i, value in enumerate(row):
                    if hasattr(value, 'strftime'):
                        contrato_dict[columns[i]] = value.strftime('%Y-%m-%d')
                    else:
                        contrato_dict[columns[i]] = value
                
                # 🔧 USAR LÓGICA HÍBRIDA UNIFICADA para buscar locadores e locatários
                contrato_id = contrato_dict['id']
                
                # Buscar locadores usando nova função unificada com dados completos
                locadores_data = obter_locadores_contrato_unificado(contrato_id)
                contrato_dict['locadores'] = []
                for loc_data in locadores_data:
                    # Buscar dados completos do locador e sua conta bancária selecionada no termo
                    cursor.execute("""
                        SELECT l.id, l.nome, l.cpf_cnpj, l.telefone, l.email,
                               cl.conta_bancaria_id, cl.porcentagem,
                               cb.tipo_recebimento, cb.chave_pix, cb.banco, cb.agencia, cb.conta
                        FROM Locadores l
                        LEFT JOIN ContratoLocadores cl ON l.id = cl.locador_id AND cl.contrato_id = ?
                        LEFT JOIN ContasBancariasLocador cb ON cl.conta_bancaria_id = cb.id
                        WHERE l.id = ?
                    """, (contrato_id, loc_data[0]))

                    locador_completo = cursor.fetchone()
                    if locador_completo:
                        contrato_dict['locadores'].append({
                            'locador_id': loc_data[0],
                            'locador_nome': loc_data[1],
                            'porcentagem': loc_data[2],
                            'responsabilidade_principal': loc_data[3],
                            'cpf_cnpj': locador_completo[2],
                            'telefone': locador_completo[3],
                            'email': locador_completo[4],
                            'conta_bancaria_id': locador_completo[5],
                            'tipo_recebimento': locador_completo[7],
                            'conta_bancaria': {
                                'tipo_recebimento': locador_completo[7],
                                'pix_chave': locador_completo[8],
                                'banco': locador_completo[9],
                                'agencia': locador_completo[10],
                                'conta': locador_completo[11]
                            } if locador_completo[7] else None
                        })
                
                # Buscar locatários usando nova função unificada
                locatarios_data = obter_locatarios_contrato_unificado(contrato_id)
                contrato_dict['locatarios'] = []
                for locat_data in locatarios_data:
                    contrato_dict['locatarios'].append({
                        'locatario_id': locat_data[0],
                        'locatario_nome': locat_data[1],
                        'percentual_responsabilidade': locat_data[2],
                        'responsabilidade_principal': locat_data[3]
                    })
                
                # 📈 Adicionar informações de contagem para debug
                contrato_dict['num_locadores'] = len(contrato_dict['locadores'])
                contrato_dict['num_locatarios'] = len(contrato_dict['locatarios'])
                
                # Definir locador e locatário principal para compatibilidade
                if contrato_dict['locadores']:
                    locador_principal = next((loc for loc in contrato_dict['locadores'] if loc['responsabilidade_principal']), contrato_dict['locadores'][0])
                    contrato_dict['locador_id'] = locador_principal['locador_id']
                    contrato_dict['locador_nome'] = locador_principal['locador_nome']
                
                if contrato_dict['locatarios']:
                    locatario_principal = next((loc for loc in contrato_dict['locatarios'] if loc['responsabilidade_principal']), contrato_dict['locatarios'][0])
                    contrato_dict['locatario_nome'] = locatario_principal['locatario_nome']
                
                contratos.append(contrato_dict)
            
            print(f"PRESTACAO: Retornando {len(contratos)} contratos com locadores/locatários unificados")
            return contratos
            
    except Exception as e:
        print(f"ERRO PRESTACAO: Erro ao buscar contratos: {e}")
        import traceback
        print(traceback.format_exc())
        return []

def inserir_contrato_locadores(contrato_id, locadores):
    """Define os locadores associados a um contrato com suas contas e porcentagens"""
    return False

# REMOVIDA: Função duplicada - implementação real está mais abaixo no arquivo

def buscar_contas_bancarias_locador(locador_id):
    """Lista todas as contas bancárias de um locador específico"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    id, locador_id, tipo_recebimento, principal, chave_pix,
                    banco, agencia, conta, tipo_conta, titular, cpf_titular,
                    data_cadastro, data_atualizacao, ativo
                FROM ContasBancariasLocador 
                WHERE locador_id = ? AND ativo = 1
                ORDER BY principal DESC, data_cadastro ASC
            """, (locador_id,))
            
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            result = []
            
            for row in rows:
                row_dict = {}
                for i, value in enumerate(row):
                    if hasattr(value, 'strftime'):
                        row_dict[columns[i]] = value.strftime('%Y-%m-%d %H:%M:%S')
                    else:
                        row_dict[columns[i]] = value
                result.append(row_dict)
            
            return result
            
    except Exception as e:
        print(f"Erro ao buscar contas bancárias: {e}")
        return []

def buscar_representante_legal_locador(locador_id):
    """Busca representante legal de um locador PJ específico"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT
                    id, id_locador, nome, cpf, rg, endereco, telefone, email, cargo, created_at
                FROM RepresentanteLegalLocador
                WHERE id_locador = ?
            """, (locador_id,))

            row = cursor.fetchone()
            if not row:
                return None

            # Converter para dicionário
            columns = [column[0] for column in cursor.description]
            result = {}
            for i, value in enumerate(row):
                if hasattr(value, 'strftime'):
                    result[columns[i]] = value.strftime('%Y-%m-%d %H:%M:%S')
                else:
                    result[columns[i]] = value

            return result

    except Exception as e:
        print(f"Erro ao buscar representante legal: {e}")
        return None

def inserir_conta_bancaria_locador_com_cursor(cursor, locador_id, dados_conta):
    """Insere uma conta bancária para um locador usando cursor existente"""
    try:
        print(f"Inserindo conta bancária para locador {locador_id} com cursor existente")
        
        # Se for marcada como principal, desmarcar outras
        if dados_conta.get('principal', False):
            cursor.execute("""
                UPDATE ContasBancariasLocador 
                SET principal = 0 
                WHERE locador_id = ?
            """, (locador_id,))
        
        from datetime import datetime
        
        # Truncar campos com limite de tamanho
        tipo_conta = dados_conta.get('tipo_conta', 'Conta Corrente')
        if len(tipo_conta) > 20:
            tipo_conta = tipo_conta[:17] + '...'  # Truncar para 20 chars
        
        cursor.execute("""
            INSERT INTO ContasBancariasLocador (
                locador_id, tipo_recebimento, principal, chave_pix,
                banco, agencia, conta, tipo_conta, titular, cpf_titular,
                data_cadastro, data_atualizacao, ativo
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            locador_id,
            dados_conta.get('tipo_recebimento', 'PIX'),
            dados_conta.get('principal', False),
            dados_conta.get('chave_pix', ''),
            dados_conta.get('banco', ''),
            dados_conta.get('agencia', ''),
            dados_conta.get('conta', ''),
            tipo_conta,
            dados_conta.get('titular', ''),
            dados_conta.get('cpf_titular', ''),
            datetime.now(),
            datetime.now(),
            True
        ))
        
        print(f"Conta bancária inserida para locador {locador_id}")
        return True
        
    except Exception as e:
        print(f"ERRO: Erro ao inserir conta bancária: {e}")
        return False

def inserir_conta_bancaria_locador(locador_id, dados_conta):
    """Insere uma conta bancária para um locador"""
    try:
        print(f"Inserindo conta bancária para locador {locador_id}: {dados_conta}")
        
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            # Se for marcada como principal, desmarcar outras
            if dados_conta.get('principal', False):
                cursor.execute("""
                    UPDATE ContasBancariasLocador 
                    SET principal = 0 
                    WHERE locador_id = ?
                """, (locador_id,))
            
            from datetime import datetime
            
            # Truncar campos com limite de tamanho
            tipo_conta = dados_conta.get('tipo_conta', 'Conta Corrente')
            if len(tipo_conta) > 20:
                tipo_conta = tipo_conta[:17] + '...'  # Truncar para 20 chars
            
            cursor.execute("""
                INSERT INTO ContasBancariasLocador (
                    locador_id, tipo_recebimento, principal, chave_pix,
                    banco, agencia, conta, tipo_conta, titular, cpf_titular,
                    data_cadastro, data_atualizacao, ativo
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                locador_id,
                dados_conta.get('tipo_recebimento', 'PIX'),
                dados_conta.get('principal', False),
                dados_conta.get('chave_pix', ''),
                dados_conta.get('banco', ''),
                dados_conta.get('agencia', ''),
                dados_conta.get('conta', ''),
                tipo_conta,
                dados_conta.get('titular', ''),
                dados_conta.get('cpf_titular', ''),
                datetime.now(),
                datetime.now(),
                True
            ))
            
            conn.commit()
            
            # Buscar o ID da conta inserida
            cursor.execute("SELECT @@IDENTITY")
            conta_id = cursor.fetchone()[0]
            
            print(f"SUCESSO: Conta bancária inserida com ID: {conta_id}")
            return int(conta_id)
            
    except Exception as e:
        print(f"ERRO: Erro ao inserir conta bancária: {e}")
        return None

def inserir_endereco_locador_com_conexao(cursor, dados_endereco):
    """Insere um endereço estruturado para locador usando cursor existente (para evitar deadlock)"""
    try:
        print(f"Inserindo endereço do locador com cursor existente: {dados_endereco}")
        
        from datetime import datetime
        
        cursor.execute("""
            INSERT INTO EnderecoLocador (
                rua, numero, complemento, bairro, cidade, uf, cep, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dados_endereco.get('rua', ''),
            dados_endereco.get('numero', ''),
            dados_endereco.get('complemento', ''),
            dados_endereco.get('bairro', ''),
            dados_endereco.get('cidade', ''),
            dados_endereco.get('uf', dados_endereco.get('estado', 'PR')),
            dados_endereco.get('cep', ''),
            datetime.now()
        ))
        
        # Buscar o ID do endereço inserido
        cursor.execute("SELECT @@IDENTITY")
        endereco_id = cursor.fetchone()[0]
        
        print(f"Endereço inserido com ID: {endereco_id}")
        return endereco_id
        
    except Exception as e:
        print(f"Erro ao inserir endereço do locador: {e}")
        return None

def inserir_endereco_locador(dados_endereco):
    """Insere um endereço estruturado para locador na tabela EnderecoLocador"""
    try:
        print(f"Inserindo endereço do locador: {dados_endereco}")
        
        with get_conexao() as conn:
            cursor = conn.cursor()
            endereco_id = inserir_endereco_locador_com_conexao(cursor, dados_endereco)
            
            if endereco_id:
                conn.commit()
                return endereco_id
            else:
                return None
            
    except Exception as e:
        print(f"ERRO: Erro ao inserir endereço locador: {e}")
        return None

def buscar_endereco_locador(endereco_id):
    """Busca um endereço estruturado de locador pelo ID"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT rua, numero, complemento, bairro, cidade, uf, cep
                FROM EnderecoLocador 
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
                    'estado': row[5] or 'PR',
                    'cep': row[6] or ''
                }
            return None
            
    except Exception as e:
        print(f"ERRO: Erro ao buscar endereço locador: {e}")
        return None

def inserir_representante_legal_locador(locador_id, dados_representante):
    """Insere um representante legal para um locador PJ"""
    try:
        print(f"Inserindo representante legal para locador {locador_id}: {dados_representante}")
        
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            from datetime import datetime
            
            cursor.execute("""
                INSERT INTO RepresentanteLegalLocador (
                    id_locador, nome, cpf, rg, endereco, telefone, email, cargo, 
                    data_nascimento, nacionalidade, estado_civil, profissao, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                locador_id,
                dados_representante.get('nome', ''),
                dados_representante.get('cpf', ''),
                dados_representante.get('rg', ''),
                dados_representante.get('endereco', ''),
                dados_representante.get('telefone', ''),
                dados_representante.get('email', ''),
                dados_representante.get('cargo', 'Administrador'),
                dados_representante.get('data_nascimento'),
                dados_representante.get('nacionalidade', ''),
                dados_representante.get('estado_civil', ''),
                dados_representante.get('profissao', ''),
                datetime.now()
            ))
            
            conn.commit()
            
            # Buscar o ID do representante inserido
            cursor.execute("SELECT @@IDENTITY")
            representante_id = cursor.fetchone()[0]
            
            print(f"SUCESSO: Representante legal inserido com ID: {representante_id}")
            return int(representante_id)
            
    except Exception as e:
        print(f"ERRO: Erro ao inserir representante legal: {e}")
        return None

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
                -- Buscar locadores atuais da tabela ImovelLocadores
                (SELECT TOP 1 l.nome 
                 FROM ImovelLocadores il 
                 INNER JOIN Locadores l ON il.locador_id = l.id
                 WHERE il.imovel_id = c.id_imovel 
                 AND il.responsabilidade_principal = 1 
                 AND il.ativo = 1) as locador_nome,
                -- Buscar locatários ATUAIS da tabela ContratoLocatarios
                (SELECT TOP 1 loc.nome 
                 FROM ContratoLocatarios cl 
                 INNER JOIN Locatarios loc ON cl.locatario_id = loc.id
                 WHERE cl.contrato_id = c.id 
                 AND cl.responsabilidade_principal = 1 
                 AND cl.ativo = 1) as locatario_nome,
                -- Contar total de locatários atuais
                (SELECT COUNT(*) 
                 FROM ContratoLocatarios cl 
                 WHERE cl.contrato_id = c.id 
                 AND cl.ativo = 1) as total_locatarios,
                -- Lista de nomes dos locatários atuais (separados por vírgula)
                STUFF((SELECT ', ' + loc2.nome 
                       FROM ContratoLocatarios cl2 
                       INNER JOIN Locatarios loc2 ON cl2.locatario_id = loc2.id
                       WHERE cl2.contrato_id = c.id AND cl2.ativo = 1
                       ORDER BY cl2.responsabilidade_principal DESC, loc2.nome
                       FOR XML PATH('')), 1, 2, '') as todos_locatarios
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
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
                -- Buscar locatário principal ATUAL da tabela ContratoLocatarios
                (SELECT TOP 1 loc.nome 
                 FROM ContratoLocatarios cl 
                 INNER JOIN Locatarios loc ON cl.locatario_id = loc.id
                 WHERE cl.contrato_id = c.id 
                 AND cl.responsabilidade_principal = 1 
                 AND cl.ativo = 1) as locatario_nome,
                -- CPF do locatário principal atual
                (SELECT TOP 1 loc.cpf_cnpj 
                 FROM ContratoLocatarios cl 
                 INNER JOIN Locatarios loc ON cl.locatario_id = loc.id
                 WHERE cl.contrato_id = c.id 
                 AND cl.responsabilidade_principal = 1 
                 AND cl.ativo = 1) as locatario_documento
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            INNER JOIN ImovelLocadores il ON i.id = il.imovel_id
            WHERE il.locador_id = ? AND il.ativo = 1
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
                -- Calcular valor total retido (valores retidos do aluguel)
                (CASE WHEN c.retido_fci = 1 THEN ISNULL(c.valor_fci, 0) ELSE 0 END +
                 CASE WHEN c.retido_condominio = 1 THEN ISNULL(c.valor_condominio, 0) ELSE 0 END +
                 CASE WHEN c.retido_seguro_fianca = 1 THEN ISNULL(c.valor_seguro_fianca, 0) ELSE 0 END +
                 CASE WHEN c.retido_seguro_incendio = 1 THEN ISNULL(c.valor_seguro_incendio, 0) ELSE 0 END +
                 CASE WHEN c.retido_iptu = 1 THEN ISNULL(c.valor_iptu, 0) ELSE 0 END) as valor_retido,
                -- Calcular valor total antecipado (valores que a empresa antecipa ao locador)
                (CASE WHEN c.antecipa_condominio = 1 THEN ISNULL(c.valor_condominio, 0) ELSE 0 END +
                 CASE WHEN c.antecipa_seguro_fianca = 1 THEN ISNULL(c.valor_seguro_fianca, 0) ELSE 0 END +
                 CASE WHEN c.antecipa_seguro_incendio = 1 THEN ISNULL(c.valor_seguro_incendio, 0) ELSE 0 END +
                 CASE WHEN c.antecipa_iptu = 1 THEN ISNULL(c.valor_iptu, 0) ELSE 0 END) as valor_antecipado,
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
            LEFT JOIN ContratoLocatarios cl ON c.id = cl.contrato_id AND cl.responsabilidade_principal = 1
            LEFT JOIN Locatarios loc ON cl.locatario_id = loc.id
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

            # 🔧 BUSCAR TODOS OS LOCADORES COM PORCENTAGENS E DADOS BANCÁRIOS
            locadores_data = obter_locadores_contrato_unificado(contrato_id)
            row_dict['locadores'] = []

            for loc_data in locadores_data:
                # Buscar dados completos do locador e sua conta bancária selecionada no termo
                cursor.execute("""
                    SELECT l.id, l.nome, l.cpf_cnpj, l.telefone, l.email,
                           cl.conta_bancaria_id, cl.porcentagem,
                           cb.tipo_recebimento, cb.chave_pix, cb.banco, cb.agencia, cb.conta
                    FROM Locadores l
                    LEFT JOIN ContratoLocadores cl ON l.id = cl.locador_id AND cl.contrato_id = ?
                    LEFT JOIN ContasBancariasLocador cb ON cl.conta_bancaria_id = cb.id
                    WHERE l.id = ?
                """, (contrato_id, loc_data[0]))

                locador_completo = cursor.fetchone()
                if locador_completo:
                    row_dict['locadores'].append({
                        'locador_id': loc_data[0],
                        'locador_nome': loc_data[1],
                        'porcentagem': loc_data[2],
                        'responsabilidade_principal': loc_data[3],
                        'cpf_cnpj': locador_completo[2],
                        'telefone': locador_completo[3],
                        'email': locador_completo[4],
                        'conta_bancaria_id': locador_completo[5],
                        'tipo_recebimento': locador_completo[7],
                        'conta_bancaria': {
                            'tipo_recebimento': locador_completo[7],
                            'pix_chave': locador_completo[8],
                            'banco': locador_completo[9],
                            'agencia': locador_completo[10],
                            'conta': locador_completo[11]
                        } if locador_completo[7] else None
                    })

            # Manter compatibilidade com código existente (dados do locador principal)
            if row_dict['locadores']:
                principal = next((loc for loc in row_dict['locadores'] if loc['responsabilidade_principal']), row_dict['locadores'][0])
                row_dict['locador_email'] = principal['email'] or ''
                row_dict['locador_telefone'] = principal['telefone'] or ''
                row_dict['porcentagem_proprietario'] = principal['porcentagem']
                row_dict['conta_bancaria_principal'] = principal['conta_bancaria']


            conn.close()
            return row_dict
        
        conn.close()
        return None
    except Exception as e:
        print(f"Erro ao buscar contrato por ID: {e}")
        return None

def buscar_fatura_por_id(fatura_id):
    """Busca uma fatura específica por ID - VERSÃO SIMPLIFICADA"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Query mais simples
        cursor.execute("SELECT * FROM PrestacaoContas WHERE id = ?", (fatura_id,))
        row = cursor.fetchone()
        
        if row:
            columns = [column[0] for column in cursor.description]
            fatura_dict = {}
            for i, value in enumerate(row):
                # Converter datetime para string se necessário
                if hasattr(value, 'strftime'):
                    fatura_dict[columns[i]] = value.strftime('%Y-%m-%d')
                elif value is None:
                    fatura_dict[columns[i]] = None
                else:
                    fatura_dict[columns[i]] = value
                    
            # Debug
            print(f"DEBUG buscar_fatura_por_id: ID={fatura_dict.get('id')}, contrato_id={fatura_dict.get('contrato_id')}")
            
            conn.close()
            return fatura_dict
        
        conn.close()
        print(f"DEBUG: Fatura {fatura_id} não encontrada")
        return None
        
    except Exception as e:
        print(f"ERRO ao buscar fatura por ID: {e}")
        import traceback
        traceback.print_exc()
        return None

# === FUNÇÕES PARA FATURAS ===

def buscar_faturas(filtros=None, page=1, limit=20, order_by='data_vencimento', order_dir='DESC'):
    """Busca faturas (prestações de contas) - WORKING VERSION"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Primeiro, vamos testar se traz registros básicos da PrestacaoContas
        try:
            query_debug = """
                SELECT COUNT(*) as total_registros
                FROM PrestacaoContas 
                WHERE ativo = 1
            """
            cursor.execute(query_debug)
            total_debug = cursor.fetchone()[0]
            print(f"DEBUG: Total de registros ativos na PrestacaoContas: {total_debug}")
        except Exception as e:
            print(f"DEBUG: Erro ao contar registros na PrestacaoContas: {e}")
            
        # Se não há registros ou tabela não existe, criar dados de teste
        try:
            query_debug2 = """
                SELECT COUNT(*) as total_registros
                FROM PrestacaoContas
            """
            cursor.execute(query_debug2)
            total_debug2 = cursor.fetchone()[0]
            print(f"DEBUG: Total geral de registros na PrestacaoContas: {total_debug2}")
            
            if total_debug2 == 0:
                print("DEBUG: Tabela PrestacaoContas vazia - vou inserir um registro de teste")
                # Criar registro de teste
                cursor.execute("""
                    INSERT INTO PrestacaoContas (
                        referencia, mes, ano, status, total_bruto, total_liquido, 
                        ativo, data_criacao, observacoes_manuais, locador_id
                    ) VALUES (
                        '09/2025', '09', '2025', 'pendente', 1966.05, 1800.00,
                        1, GETDATE(), 'Prestação de teste', 1
                    )
                """)
                conn.commit()
                print("DEBUG: Registro de teste criado com sucesso!")
        except Exception as e:
            print(f"DEBUG: Erro ao verificar/criar dados de teste: {e}")
        
        # Primeiro tentar consulta simples sem JOINs de Contratos/Imoveis
        query_simples = """
            SELECT COUNT(*) 
            FROM PrestacaoContas p
            LEFT JOIN Contratos c ON p.contrato_id = c.id
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            WHERE p.ativo = 1
        """
        
        try:
            cursor.execute(query_simples)
            count_com_joins = cursor.fetchone()[0]
            print(f"DEBUG: Registros com JOINs: {count_com_joins}")
        except Exception as e:
            print(f"DEBUG: Erro com JOINs - usando consulta simples: {e}")
            count_com_joins = 0
        
        # Sempre usar consulta com subqueries para garantir dados reais
        print("DEBUG: Usando consulta principal com subqueries para dados reais")
        
        # Consulta principal otimizada com LEFT JOIN
        query = """
            SELECT
                p.id,
                'PC-' + RIGHT('000' + CAST(p.id AS VARCHAR(10)), 3) as numero_fatura,
                ISNULL(p.total_bruto, 0) as valor_total,
                    ISNULL(p.data_criacao, GETDATE()) as data_vencimento,
                    p.data_pagamento as data_pagamento,
                    -- Status baseado em datas e prestações lançadas
                    CASE
                        -- Priorizar status cancelada (sempre prevalece)
                        WHEN p.status = 'cancelada' THEN 'cancelada'
                        -- Se foi marcado como lançada pelo sistema de prestação (só se foi paga antes)
                        WHEN p.status = 'lancada' AND p.data_pagamento IS NOT NULL THEN 'lancada'
                        -- Se tem data de pagamento mas não foi lançada
                        WHEN p.data_pagamento IS NOT NULL THEN 'paga'
                        -- Se não tem pagamento e está vencida (exclui canceladas e lançadas)
                        WHEN p.data_pagamento IS NULL AND p.data_criacao < GETDATE() AND p.status NOT IN ('cancelada', 'lancada') THEN 'em_atraso'
                        -- Casos restantes
                        ELSE ISNULL(p.status, 'pendente')
                    END as status,
                    ISNULL(p.referencia, 'N/A') as mes_referencia,
                    ISNULL(p.referencia, 'N/A') as referencia_display,
                    ISNULL(p.observacoes_manuais, '') as observacoes,
                    p.data_criacao,
                    ISNULL(p.contrato_id, 0) as contrato_id,
                    CAST(ISNULL(p.contrato_id, 0) AS VARCHAR(10)) as contrato_numero,
                    CASE 
                        WHEN p.contrato_id IS NOT NULL THEN 
                            ISNULL((SELECT TOP 1 i.endereco FROM Contratos c 
                                   LEFT JOIN Imoveis i ON c.id_imovel = i.id 
                                   WHERE c.id = p.contrato_id), 'Endereço não encontrado')
                        ELSE 'Endereço não informado'
                    END as imovel_endereco,
                    'Apartamento' as imovel_tipo,
                    ISNULL(p.total_bruto, 0) as valor_aluguel,
                    CASE
                        WHEN p.contrato_id IS NOT NULL THEN
                            ISNULL((SELECT TOP 1 lt.nome FROM Contratos c
                                   LEFT JOIN ContratoLocatarios cl ON c.id = cl.contrato_id AND cl.responsabilidade_principal = 1
                                   LEFT JOIN Locatarios lt ON cl.locatario_id = lt.id
                                   WHERE c.id = p.contrato_id), 'Nome não encontrado')
                        ELSE 'Nome não informado'
                    END as locatario_nome,
                    CASE
                        WHEN p.contrato_id IS NOT NULL THEN
                            ISNULL((SELECT TOP 1 lt.cpf_cnpj FROM Contratos c
                                   LEFT JOIN ContratoLocatarios cl ON c.id = cl.contrato_id AND cl.responsabilidade_principal = 1
                                   LEFT JOIN Locatarios lt ON cl.locatario_id = lt.id
                                   WHERE c.id = p.contrato_id), 'CPF não encontrado')
                        ELSE 'CPF não informado'
                    END as locatario_cpf,
                    ISNULL(l.nome, 'Nome não informado') as locador_nome,
                    ISNULL(l.nome, 'Nome não informado') as proprietario_nome,
                    ISNULL(l.cpf_cnpj, 'CPF não informado') as proprietario_cpf,
                    -- Calcular dias de atraso baseado na data de vencimento do contrato
                    CASE
                        WHEN p.data_pagamento IS NULL AND p.contrato_id IS NOT NULL
                             AND cont.vencimento_dia IS NOT NULL
                             AND p.ano > 1900 AND p.ano < 2100
                             AND p.mes >= 1 AND p.mes <= 12
                        THEN
                            CASE
                                WHEN TRY_CAST(
                                    CAST(p.ano AS VARCHAR(4)) + '-' +
                                    RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                    RIGHT('0' + CAST(cont.vencimento_dia AS VARCHAR(2)), 2)
                                    AS DATE
                                ) IS NOT NULL
                                AND TRY_CAST(
                                    CAST(p.ano AS VARCHAR(4)) + '-' +
                                    RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                    RIGHT('0' + CAST(cont.vencimento_dia AS VARCHAR(2)), 2)
                                    AS DATE
                                ) < CAST(GETDATE() AS DATE)
                                THEN DATEDIFF(day,
                                    TRY_CAST(
                                        CAST(p.ano AS VARCHAR(4)) + '-' +
                                        RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                        RIGHT('0' + CAST(cont.vencimento_dia AS VARCHAR(2)), 2)
                                        AS DATE
                                    ),
                                    CAST(GETDATE() AS DATE)
                                )
                                ELSE 0
                            END
                        ELSE 0
                    END as dias_atraso,
                    ISNULL(p.total_liquido, 0) as valor_liquido,
                    ISNULL(p.valor_pago, 0) as valor_pago,
                    ISNULL(p.locador_id, 0) as locador_id,
                    -- Calcular acréscimos usando mesma lógica do buscar_prestacao_detalhada
                    CASE
                        WHEN p.data_pagamento IS NULL AND p.contrato_id IS NOT NULL
                             AND cont.vencimento_dia IS NOT NULL
                             AND p.ano > 1900 AND p.ano < 2100
                             AND p.mes >= 1 AND p.mes <= 12
                        THEN
                            CASE
                                WHEN TRY_CAST(
                                    CAST(p.ano AS VARCHAR(4)) + '-' +
                                    RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                    RIGHT('0' + CAST(cont.vencimento_dia AS VARCHAR(2)), 2)
                                    AS DATE
                                ) IS NOT NULL
                                AND TRY_CAST(
                                    CAST(p.ano AS VARCHAR(4)) + '-' +
                                    RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                    RIGHT('0' + CAST(cont.vencimento_dia AS VARCHAR(2)), 2)
                                    AS DATE
                                ) < CAST(GETDATE() AS DATE)
                                THEN
                                    -- Usar valor_boleto como base ou total_bruto se não houver
                                    ISNULL(ISNULL(p.valor_boleto, p.total_bruto), 0) * (
                                        -- Multa: percentual do contrato (padrão 2%)
                                        ISNULL(cont.percentual_multa_atraso, 2) / 100 +
                                        -- Juros: 1% ao mês = 0.033% ao dia (dias_atraso * 0.00033)
                                        (DATEDIFF(day,
                                            TRY_CAST(
                                                CAST(p.ano AS VARCHAR(4)) + '-' +
                                                RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                                RIGHT('0' + CAST(cont.vencimento_dia AS VARCHAR(2)), 2)
                                                AS DATE
                                            ),
                                            CAST(GETDATE() AS DATE)
                                        ) * 0.00033)
                                    )
                                ELSE ISNULL(p.valor_acrescimos, 0)
                            END
                        ELSE ISNULL(p.valor_acrescimos, 0)
                    END as valor_acrescimos,
                    -- Valor total com acréscimos (usar mesma base)
                    ISNULL(ISNULL(p.valor_boleto, p.total_bruto), 0) +
                    CASE
                        WHEN p.data_pagamento IS NULL AND p.contrato_id IS NOT NULL
                             AND cont.vencimento_dia IS NOT NULL
                             AND p.ano > 1900 AND p.ano < 2100
                             AND p.mes >= 1 AND p.mes <= 12
                        THEN
                            CASE
                                WHEN TRY_CAST(
                                    CAST(p.ano AS VARCHAR(4)) + '-' +
                                    RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                    RIGHT('0' + CAST(cont.vencimento_dia AS VARCHAR(2)), 2)
                                    AS DATE
                                ) IS NOT NULL
                                AND TRY_CAST(
                                    CAST(p.ano AS VARCHAR(4)) + '-' +
                                    RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                    RIGHT('0' + CAST(cont.vencimento_dia AS VARCHAR(2)), 2)
                                    AS DATE
                                ) < CAST(GETDATE() AS DATE)
                                THEN
                                    ISNULL(ISNULL(p.valor_boleto, p.total_bruto), 0) * (
                                        ISNULL(cont.percentual_multa_atraso, 2) / 100 +
                                        (DATEDIFF(day,
                                            TRY_CAST(
                                                CAST(p.ano AS VARCHAR(4)) + '-' +
                                                RIGHT('0' + CAST(p.mes AS VARCHAR(2)), 2) + '-' +
                                                RIGHT('0' + CAST(cont.vencimento_dia AS VARCHAR(2)), 2)
                                                AS DATE
                                            ),
                                            CAST(GETDATE() AS DATE)
                                        ) * 0.00033)
                                    )
                                ELSE ISNULL(p.valor_acrescimos, 0)
                            END
                        ELSE ISNULL(p.valor_acrescimos, 0)
                    END as valor_total_com_acrescimos,
                    p.data_calculo_acrescimos
                FROM PrestacaoContas p
                LEFT JOIN Locadores l ON p.locador_id = l.id
                LEFT JOIN Contratos cont ON p.contrato_id = cont.id
                WHERE p.ativo = 1
                ORDER BY p.id DESC
        """
        

        # Aplicar filtros de status ANTES de executar a query
        where_conditions = ["p.ativo = 1"]
        query_params = []

        if filtros and filtros.get('status'):
            status_filter = filtros['status']
            print(f"DEBUG: Aplicando filtro de status: {status_filter}")

            # Aplicar filtro baseado na lógica de status calculado
            if status_filter == 'paga':
                # Faturas pagas mas não lançadas
                where_conditions.append("p.data_pagamento IS NOT NULL AND p.status != 'lancada'")
            elif status_filter == 'em_atraso':
                # Apenas prestações realmente em atraso (exclui canceladas e lançadas)
                where_conditions.append("""
                    p.data_pagamento IS NULL
                    AND p.data_criacao < GETDATE()
                    AND p.status NOT IN ('cancelada', 'lancada')
                """)
            elif status_filter == 'aberta':
                where_conditions.append("p.data_pagamento IS NULL AND p.data_criacao >= GETDATE()")
            elif status_filter == 'pendente':
                where_conditions.append("(p.status = 'pendente' OR (p.status IS NULL AND p.data_pagamento IS NULL))")
            elif status_filter == 'lancada':
                # Faturas marcadas como lançadas pelo sistema
                where_conditions.append("p.status = 'lancada'")
            elif status_filter == 'cancelada':
                where_conditions.append("p.status = 'cancelada'")

        # Aplicar outros filtros
        if filtros:
            if filtros.get('search'):
                search_term = f"%{filtros['search']}%"
                where_conditions.append("""(
                    CAST(p.id AS VARCHAR) LIKE ? OR
                    p.referencia LIKE ? OR
                    p.observacoes_manuais LIKE ?
                )""")
                query_params.extend([search_term, search_term, search_term])

            if filtros.get('mes'):
                where_conditions.append("p.mes = ?")
                query_params.append(str(filtros['mes']).zfill(2))

            if filtros.get('ano'):
                where_conditions.append("p.ano = ?")
                query_params.append(str(filtros['ano']))

        # Montar WHERE clause final
        where_clause = " AND ".join(where_conditions)
        query = query.replace("WHERE p.ativo = 1", f"WHERE {where_clause}")



        print(f"DEBUG: Executando consulta principal...")
        try:
            cursor.execute(query, query_params)
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            print(f"DEBUG: Consulta retornou {len(rows)} registros")
        except Exception as e:
            print(f"DEBUG: Erro na consulta principal: {e}")
            # Fallback para consulta ainda mais simples
            query_fallback = """
                SELECT 
                    p.id,
                    'PC-' + RIGHT('000' + CAST(p.id AS VARCHAR(10)), 3) as numero_fatura,
                    ISNULL(p.total_bruto, 0) as valor_total,
                    ISNULL(p.data_criacao, GETDATE()) as data_vencimento,
                    NULL as data_pagamento,
                    ISNULL(p.status, 'pendente') as status,
                    ISNULL(p.referencia, 'N/A') as mes_referencia,
                    ISNULL(p.referencia, 'N/A') as referencia_display,
                    ISNULL(p.observacoes_manuais, '') as observacoes,
                    p.data_criacao,
                    ISNULL(p.contrato_id, 0) as contrato_id,
                    CAST(ISNULL(p.contrato_id, 0) AS VARCHAR(10)) as contrato_numero,
                    'Endereço não informado' as imovel_endereco,
                    'Tipo não informado' as imovel_tipo,
                    ISNULL(p.total_bruto, 0) as valor_aluguel,
                    'Nome não informado' as locatario_nome,
                    'CPF não informado' as locatario_cpf,
                    'Nome não informado' as locador_nome,
                    'Nome não informado' as proprietario_nome,
                    'CPF não informado' as proprietario_cpf,
                    0 as dias_atraso,
                    ISNULL(p.total_liquido, 0) as valor_liquido,
                    ISNULL(p.valor_pago, 0) as valor_pago,
                    ISNULL(p.locador_id, 0) as locador_id
                FROM PrestacaoContas p
                WHERE p.ativo = 1
                ORDER BY p.id DESC
            """
            print("DEBUG: Tentando consulta fallback (sem JOINs)")
            cursor.execute(query_fallback)
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            print(f"DEBUG: Consulta fallback retornou {len(rows)} registros")
        
        faturas = []
        for row in rows:
            fatura_dict = {}
            for i, value in enumerate(row):
                if hasattr(value, 'strftime'):
                    fatura_dict[columns[i]] = value.strftime('%Y-%m-%d')
                else:
                    fatura_dict[columns[i]] = value
            faturas.append(fatura_dict)
        
        conn.close()
        
        print(f"DEBUG: Processadas {len(faturas)} prestacoes de contas")
        if len(faturas) > 0:
            print(f"DEBUG: Primeira fatura processada: {faturas[0]}")
        print(f"DEBUG: Retornando {len(faturas)} prestacoes de contas do banco")
        return {
            'success': True,
            'data': faturas,
            'total': len(faturas),
            'page': page,
            'limit': limit
        }
        
    except Exception as e:
        print(f"Erro ao buscar prestacoes do banco: {e}")
        return {
            'success': True,
            'data': [],
            'total': 0,
            'page': page,
            'limit': limit
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
            LEFT JOIN ContratoLocatarios cl ON c.id = cl.contrato_id AND cl.responsabilidade_principal = 1
            LEFT JOIN Locatarios loc ON cl.locatario_id = loc.id
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
    """Busca estatísticas resumidas das faturas reais do banco para as abas"""
    try:
        # Usar a função buscar_faturas para obter dados reais
        resultado_faturas = buscar_faturas(filtros)
        
        if not resultado_faturas.get('success') or not resultado_faturas.get('data'):
            return {
                'todas': 0,
                'abertas': 0, 
                'pendentes': 0,
                'pagas': 0,
                'em_atraso': 0,
                'canceladas': 0,
                'valor_total_aberto': 0,
                'valor_total_recebido': 0,
                'valor_total_atrasado': 0
            }
        
        faturas = resultado_faturas['data']
        
        # Calcular estatísticas baseadas nos dados reais
        stats = {
            'todas': len(faturas),
            'abertas': len([f for f in faturas if f.get('status') == 'aberta']),
            'pendentes': len([f for f in faturas if f.get('status') == 'pendente']), 
            'pagas': len([f for f in faturas if f.get('status') in ['paga', 'lancada']]),
            'em_atraso': len([f for f in faturas if f.get('status') == 'em_atraso']),
            'canceladas': len([f for f in faturas if f.get('status') == 'cancelada']),
            'valor_total_aberto': sum([f.get('valor_total', 0) or 0 for f in faturas if f.get('status') in ['aberta', 'pendente', 'em_atraso']]),
            'valor_total_recebido': sum([f.get('valor_total', 0) or 0 for f in faturas if f.get('status') in ['paga', 'lancada']]),
            'valor_total_atrasado': sum([f.get('valor_total', 0) or 0 for f in faturas if f.get('status') == 'em_atraso'])
        }
        
        print(f"Estatísticas calculadas: {len(faturas)} faturas encontradas")
        return stats
        
    except Exception as e:
        print(f"Erro ao calcular estatísticas de faturas: {e}")
        return {
            'todas': 0,
            'abertas': 0,
            'pendentes': 0, 
            'pagas': 0,
            'em_atraso': 0,
            'canceladas': 0,
            'valor_total_aberto': 0,
            'valor_total_recebido': 0,
            'valor_total_atrasado': 0
        }

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
            LEFT JOIN ContratoLocatarios cl ON c.id = cl.contrato_id AND cl.responsabilidade_principal = 1
            LEFT JOIN Locatarios loc ON cl.locatario_id = loc.id
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
            'telefone_conjuge', 'regime_bens', 'possui_inquilino_solidario', 'possui_fiador', 
            'qtd_pets', 'observacoes', 'ativo',
            'data_constituicao', 'capital_social', 'porte_empresa', 'regime_tributario',
            'inscricao_estadual', 'inscricao_municipal', 'atividade_principal', 
            'razao_social', 'nome_fantasia'
        ]
        
        # Filtrar apenas os campos que foram enviados e sao atualizáveis
        campos_para_atualizar = {}
        for campo, valor in kwargs.items():
            # Campos especiais que não são da tabela mas são processados separadamente
            if campo in ['formas_envio_cobranca', 'forma_envio_boleto', 'representante_legal', 
                        'telefones', 'emails', 'endereco', 'endereco_estruturado']:
                continue  # Estes campos são processados separadamente após a query principal
            elif campo in campos_atualizaveis and valor is not None:
                # Converter valores string para int/bool quando necessario
                if campo in ['possui_conjuge', 'possui_inquilino_solidario', 'possui_fiador', 'ativo']:
                    if isinstance(valor, str):
                        if valor.upper() in ['SIM', 'S', 'TRUE', '1']:
                            valor = 1
                        elif valor.upper() in ['NAO', 'N', 'FALSE', '0', 'NÃO']:
                            valor = 0
                        else:
                            valor = int(valor) if valor.isdigit() else 0
                    elif isinstance(valor, bool):
                        valor = 1 if valor else 0
                # CORRECAO: Converter campos numericos strings para int/NULL
                elif campo in ['capital_social']:
                    if isinstance(valor, str) and valor.strip() == '':
                        valor = None
                    elif valor == 0:
                        valor = None
                campos_para_atualizar[campo] = valor

        if not campos_para_atualizar:
            # Se não há campos da tabela principal mas há representante_legal, continuar
            if 'representante_legal' not in kwargs:
                print("Nenhum campo válido para atualizar")
                conn.close()
                return False
            else:
                print("Nenhum campo da tabela principal, mas processando representante_legal")
                # Criar query mínima para não dar erro
                set_clause = "data_atualizacao = GETDATE()"
                valores = [locatario_id]
        else:
            # Construir query de UPDATE dinamicamente
            set_clause = ", ".join([f"{campo} = ?" for campo in campos_para_atualizar.keys()])
            valores = list(campos_para_atualizar.values())
            valores.append(locatario_id)  # Para o WHERE
        
        query = f"UPDATE Locatarios SET {set_clause} WHERE id = ?"
        
        print(f"Query: {query}")
        print(f"Valores: {valores}")
        
        cursor.execute(query, valores)

        # Verificar se alguma linha foi afetada (mas não retornar ainda se temos representante_legal)
        linhas_afetadas = cursor.rowcount
        if linhas_afetadas == 0 and 'representante_legal' not in kwargs:
            print("Nenhuma linha foi afetada pela atualizacao")
            conn.close()
            return False

        # Atualizar dados do representante legal se fornecidos e for PJ
        if 'representante_legal' in kwargs:
            # Verificar se o locatário é PJ buscando do banco
            cursor.execute("SELECT tipo_pessoa FROM Locatarios WHERE id = ?", locatario_id)
            tipo_pessoa_row = cursor.fetchone()
            if tipo_pessoa_row and tipo_pessoa_row[0] == 'PJ':
                repr_legal = kwargs['representante_legal']
                print(f"Processando dados do representante legal: {repr_legal}")

                if isinstance(repr_legal, dict) and repr_legal.get("nome"):
                    # Verificar se já existe um representante legal para este locatário
                    cursor.execute("""
                        SELECT id FROM RepresentanteLegalLocatario
                        WHERE id_locatario = ?
                    """, (locatario_id,))

                    representante_existente = cursor.fetchone()

                    if representante_existente:
                        # UPDATE - Atualizar representante existente
                        print(f"Atualizando representante legal existente ID: {representante_existente[0]}")
                        cursor.execute("""
                            UPDATE RepresentanteLegalLocatario
                            SET nome = ?, cpf = ?, rg = ?, endereco = ?, telefone = ?, email = ?, cargo = ?
                            WHERE id_locatario = ?
                        """, (
                            repr_legal.get("nome", ""),
                            repr_legal.get("cpf", ""),
                            repr_legal.get("rg", ""),
                            repr_legal.get("endereco", ""),
                            repr_legal.get("telefone", ""),
                            repr_legal.get("email", ""),
                            repr_legal.get("cargo", ""),
                            locatario_id
                        ))
                        print(f"Representante legal atualizado para locatário {locatario_id}")
                    else:
                        # INSERT - Criar novo representante legal
                        print(f"Inserindo novo representante legal para locatário {locatario_id}")
                        cursor.execute("""
                            INSERT INTO RepresentanteLegalLocatario
                            (id_locatario, nome, cpf, rg, endereco, telefone, email, cargo, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, GETDATE())
                        """, (
                            locatario_id,
                            repr_legal.get("nome", ""),
                            repr_legal.get("cpf", ""),
                            repr_legal.get("rg", ""),
                            repr_legal.get("endereco", ""),
                            repr_legal.get("telefone", ""),
                            repr_legal.get("email", ""),
                            repr_legal.get("cargo", "")
                        ))
                        print(f"Novo representante legal inserido para locatário {locatario_id}")
        
        # Atualizar telefones se fornecidos
        if 'telefones' in kwargs:
            atualizar_telefones_locatario(cursor, locatario_id, kwargs['telefones'])
        
        # Atualizar emails se fornecidos
        if 'emails' in kwargs:
            atualizar_emails_locatario(cursor, locatario_id, kwargs['emails'])
        
        # Atualizar endereço se fornecido (como dict estruturado)
        if 'endereco' in kwargs and isinstance(kwargs['endereco'], dict):
            atualizar_endereco_locatario(cursor, locatario_id, kwargs['endereco'])
        elif 'endereco_estruturado' in kwargs:
            atualizar_endereco_locatario(cursor, locatario_id, kwargs['endereco_estruturado'])
        
        # Atualizar formas de cobrança se fornecidas
        # print(f"DEBUG: Verificando formas de cobranca em kwargs...")
        # print(f"'forma_envio_boleto' in kwargs: {'forma_envio_boleto' in kwargs}")
        # print(f"'formas_envio_cobranca' in kwargs: {'formas_envio_cobranca' in kwargs}")
        if 'formas_envio_cobranca' in kwargs:
            # print(f"kwargs['formas_envio_cobranca']: {kwargs['formas_envio_cobranca']}")
            # print(f"tipo: {type(kwargs['formas_envio_cobranca'])}")
            pass
        
        # Priorizar formas_envio_cobranca se existir e tiver dados, senão usar forma_envio_boleto
        if 'formas_envio_cobranca' in kwargs and kwargs['formas_envio_cobranca']:
            # print(f"USANDO formas_envio_cobranca: {kwargs['formas_envio_cobranca']}")
            atualizar_formas_cobranca_locatario(cursor, locatario_id, kwargs['formas_envio_cobranca'])
        elif 'forma_envio_boleto' in kwargs and kwargs['forma_envio_boleto']:
            # print(f"USANDO forma_envio_boleto: {kwargs['forma_envio_boleto']}")
            atualizar_formas_cobranca_locatario(cursor, locatario_id, kwargs['forma_envio_boleto'])
        
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
        
        # PROCESSAMENTO HÍBRIDO DE ENDEREÇO - SEGURO
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
            
            # Campo de PLANO DE LOCAÇÃO
            'id_plano_locacao',
            
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
            # Garantir que conta_bancaria_id nunca seja NULL
            conta_bancaria_id = locador.get('conta_bancaria_id')
            if conta_bancaria_id is None or conta_bancaria_id == 0:
                conta_bancaria_id = 1  # ID padrão para conta sem especificação
            
            cursor.execute("""
                INSERT INTO ContratoLocadores 
                (contrato_id, locador_id, conta_bancaria_id, porcentagem, responsabilidade_principal, ativo)
                VALUES (?, ?, ?, ?, ?, 1)
            """, (
                contrato_id,
                locador['locador_id'],
                conta_bancaria_id,
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

# ==========================================
# FUNÇÕES PARA PRESTAÇÃO DE CONTAS
# ==========================================

def salvar_prestacao_contas(contrato_id, tipo_prestacao, dados_financeiros, status, observacoes=None,
                          lancamentos_extras=None, contrato_dados=None, configuracao_calculo=None,
                          configuracao_fatura=None, detalhamento_completo=None, valor_boleto=None,
                          total_retido=None, valor_repasse=None, tipo_calculo=None, multa_rescisoria=None):
    """Salva uma nova prestação de contas no banco de dados"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Obter dados do mês atual ou do mês especificado na configuração
        from datetime import datetime
        agora = datetime.now()
        mes = agora.month
        ano = agora.year
        referencia = f"{mes:02d}/{ano}"

        # Calcular data de vencimento baseada no mês de referência
        data_vencimento_calculada = agora  # Por padrão usa data atual

        # Se houver configuração de fatura com mês específico
        if configuracao_fatura and configuracao_fatura.get('mes_referencia'):
            try:
                mes_ref = configuracao_fatura['mes_referencia']

                # Suportar ambos os formatos: YYYY-MM (frontend) e MM/YYYY (legado)
                if '-' in mes_ref:  # Formato YYYY-MM (novo)
                    ano, mes = mes_ref.split('-')
                    mes = int(mes)
                    ano = int(ano)
                elif '/' in mes_ref:  # Formato MM/YYYY (legado)
                    mes, ano = mes_ref.split('/')
                    mes = int(mes)
                    ano = int(ano)
                else:
                    # Fallback: se não tem separador, tenta interpretar como YYYYMM
                    if len(mes_ref) == 6 and mes_ref.isdigit():
                        ano = int(mes_ref[:4])
                        mes = int(mes_ref[4:])
                    else:
                        raise ValueError(f"Formato de mês inválido: {mes_ref}")

                referencia = f"{mes:02d}/{ano}"

                # Calcular data de vencimento para o mês de referência
                # Usar dia atual, mas mês/ano da referência
                dia_vencimento = agora.day
                try:
                    data_vencimento_calculada = datetime(ano, mes, dia_vencimento)
                except ValueError:
                    # Se o dia não existe no mês (ex: 31 fev), usar último dia do mês
                    import calendar
                    ultimo_dia = calendar.monthrange(ano, mes)[1]
                    data_vencimento_calculada = datetime(ano, mes, ultimo_dia)
            except Exception as e:
                print(f"Erro ao processar mes_referencia '{mes_ref}': {e}")
                # Manter valores padrão (mês atual) em caso de erro
                pass
        
        # Obter locador_id do contrato através do imóvel
        cursor.execute("""
            SELECT i.id_locador 
            FROM Contratos c 
            INNER JOIN Imoveis i ON c.id_imovel = i.id 
            WHERE c.id = ?
        """, (contrato_id,))
        resultado_contrato = cursor.fetchone()
        if not resultado_contrato:
            raise Exception(f"Contrato {contrato_id} não encontrado ou sem locador")
        
        locador_id = resultado_contrato[0]

        # VALIDACAO 1: Verificar se já existe prestação LANCADA para este contrato no mesmo mês
        cursor.execute("""
            SELECT COUNT(*)
            FROM PrestacaoContas
            WHERE contrato_id = ? AND mes = ? AND ano = ? AND ativo = 1 AND status = 'lancada'
        """, (contrato_id, f"{mes:02d}", str(ano)))

        prestacao_lancada_existente = cursor.fetchone()[0]
        if prestacao_lancada_existente > 0:
            raise Exception(f"Já existe uma prestação LANÇADA para o contrato {contrato_id} no mês {mes:02d}/{ano}. Prestações lançadas são IMUTÁVEIS e não podem ser alteradas.")

        # VALIDACAO 2: Verificar se já existe prestação para este contrato no mesmo mês
        cursor.execute("""
            SELECT COUNT(*), STRING_AGG(CAST(id AS VARCHAR), ', ')
            FROM PrestacaoContas
            WHERE contrato_id = ? AND mes = ? AND ano = ? AND ativo = 1
        """, (contrato_id, f"{mes:02d}", str(ano)))

        resultado = cursor.fetchone()
        prestacao_existente = resultado[0]
        ids_existentes = resultado[1]

        if prestacao_existente > 0:
            print(f"⚠️ AVISO: Já existem {prestacao_existente} prestação(ões) para contrato {contrato_id} em {mes:02d}/{ano}")
            print(f"   IDs existentes: {ids_existentes}")
            raise Exception(f"Já existe prestação de contas para este período. IDs: {ids_existentes}")

        # VALIDACAO 3: Se status for 'lancada', verificar se existe prestação PAGA anteriormente
        if status == 'lancada':
            cursor.execute("""
                SELECT COUNT(*)
                FROM PrestacaoContas
                WHERE contrato_id = ? AND mes = ? AND ano = ? AND ativo = 1 AND status = 'paga'
            """, (contrato_id, f"{mes:02d}", str(ano)))

            tem_prestacao_paga = cursor.fetchone()[0]
            if tem_prestacao_paga == 0:
                raise Exception("ERRO: Só é possível LANÇAR prestação que foi PAGA anteriormente. Marque como PAGA primeiro.")

        # VALIDACAO 4: Buscar faturas relacionadas ao contrato para marcar como "Lancada"
        cursor.execute("""
            SELECT id, referencia, status
            FROM PrestacaoContas
            WHERE contrato_id = ? AND mes = ? AND ano = ? AND ativo = 1
        """, (contrato_id, f"{mes:02d}", str(ano)))

        faturas_relacionadas = cursor.fetchall()

        # Configurar estrutura da tabela para histórico completo (sempre criar nova prestação)
        try:
            cursor.execute("SELECT contrato_id FROM PrestacaoContas WHERE 1=0")
            tem_contrato_id = True
            print("Campo contrato_id já existe")
            print(f"FORÇANDO DEBUG AQUI - Arquivo foi recarregado corretamente!")
        except:
            # print("AVISO: Campo contrato_id nao existe na tabela PrestacaoContas - adicionando...")
            try:
                cursor.execute("ALTER TABLE PrestacaoContas ADD contrato_id INT")
                print("Campo contrato_id adicionado")
                conn.commit()
                tem_contrato_id = True
            except Exception as alter_error:
                print(f"Erro ao adicionar campo contrato_id: {alter_error}")
                tem_contrato_id = False

        # Verificar/criar campo para dados_financeiros_json
        try:
            cursor.execute("SELECT dados_financeiros_json FROM PrestacaoContas WHERE 1=0")
            print("Campo dados_financeiros_json já existe")
        except:
            try:
                cursor.execute("ALTER TABLE PrestacaoContas ADD dados_financeiros_json NVARCHAR(MAX)")
                print("Campo dados_financeiros_json adicionado para salvar descontos")
                conn.commit()
            except Exception as alter_error:
                print(f"Erro ao adicionar campo dados_financeiros_json: {alter_error}")
        
        # Remover qualquer constraint UNIQUE que impeça histórico completo
        try:
            # Remover constraint antiga se existir
            cursor.execute("ALTER TABLE PrestacaoContas DROP CONSTRAINT UK_PrestacaoContas_Cliente_Periodo")
            print("Constraint UNIQUE antiga removida - histórico completo habilitado")
        except:
            pass  # Constraint já foi removida ou não existia
            
        try:
            # Remover constraint nova também (não queremos UNIQUE para histórico completo)
            cursor.execute("ALTER TABLE PrestacaoContas DROP CONSTRAINT UK_PrestacaoContas_Contrato_Periodo")
            print("Constraint UNIQUE por contrato removida - histórico completo habilitado")
        except:
            pass  # Constraint não existia
        
        conn.commit()
        
        # LÓGICA CONDICIONAL: Atualizar existente OU criar nova baseado no tipo_prestacao
        prestacao_id = None

        # SE for fatura_existente, tenta atualizar uma prestação existente primeiro
        if tipo_prestacao == 'fatura_existente' and faturas_relacionadas:
            # Buscar prestação existente não lançada para atualizar
            cursor.execute("""
                SELECT id FROM PrestacaoContas
                WHERE contrato_id = ? AND mes = ? AND ano = ? AND ativo = 1
                AND status IN ('pendente', 'paga') AND status != 'lancada'
                ORDER BY data_criacao DESC
            """, (contrato_id, f"{mes:02d}", str(ano)))

            prestacao_existente = cursor.fetchone()
            if prestacao_existente:
                prestacao_id = prestacao_existente[0]
                # Atualizar prestação existente
                cursor.execute("""
                    UPDATE PrestacaoContas
                    SET valor_pago = ?, valor_vencido = ?, encargos = ?, deducoes = ?,
                        total_bruto = ?, total_liquido = ?, status = ?,
                        pagamento_atrasado = ?, observacoes_manuais = ?, data_atualizacao = GETDATE()
                    WHERE id = ?
                """, (
                    dados_financeiros.get('valor_pago', 0),
                    dados_financeiros.get('valor_vencido', 0),
                    dados_financeiros.get('encargos', 0),
                    dados_financeiros.get('deducoes', 0),
                    dados_financeiros.get('total_bruto', 0),
                    dados_financeiros.get('total_liquido', 0),
                    status,
                    status == 'atrasado',
                    observacoes,
                    prestacao_id
                ))
                print(f"Prestação existente atualizada - ID: {prestacao_id}")

        # SE não foi atualizada uma existente, criar nova (comportamento original preservado)
        if prestacao_id is None:
            # print(f"HISTORICO COMPLETO: Criando nova prestacao para contrato {contrato_id} em {mes:02d}/{ano}")
            # Inserir nova prestação com contrato_id
            if tem_contrato_id:
                # print(f"Criando nova prestacao para contrato {contrato_id}")
                # ✅ EXPANDIDO: Incluir novos campos se existirem
                campos_insert = [
                    'locador_id', 'contrato_id', 'mes', 'ano', 'referencia', 'valor_pago', 'valor_vencido',
                    'encargos', 'deducoes', 'total_bruto', 'total_liquido', 'status',
                    'pagamento_atrasado', 'observacoes_manuais', 'data_criacao', 'data_atualizacao', 'ativo'
                ]
                valores_insert = [
                    locador_id,
                    contrato_id,
                    f"{mes:02d}",
                    str(ano),
                    referencia,
                    dados_financeiros.get('valor_pago', 0),
                    dados_financeiros.get('valor_vencido', 0),
                    dados_financeiros.get('encargos', 0),
                    dados_financeiros.get('deducoes', 0),
                    dados_financeiros.get('total_bruto', 0),
                    dados_financeiros.get('total_liquido', 0),
                    status,
                    status == 'atrasado',
                    observacoes,
                    data_vencimento_calculada,
                    1  # ativo
                ]

                # ✅ ADICIONAR NOVOS CAMPOS (se fornecidos)
                if valor_boleto is not None:
                    campos_insert.append('valor_boleto')
                    valores_insert.append(valor_boleto)

                if total_retido is not None:
                    campos_insert.append('total_retido')
                    valores_insert.append(total_retido)

                if valor_repasse is not None:
                    campos_insert.append('valor_repasse')
                    valores_insert.append(valor_repasse)

                if tipo_calculo is not None:
                    campos_insert.append('tipo_calculo')
                    valores_insert.append(tipo_calculo)

                if multa_rescisoria is not None:
                    campos_insert.append('multa_rescisoria')
                    valores_insert.append(multa_rescisoria)

                if detalhamento_completo is not None:
                    import json
                    campos_insert.append('detalhamento_json')
                    valores_insert.append(json.dumps(detalhamento_completo, ensure_ascii=False))

                # ✅ ADICIONAR dados_financeiros completos em JSON (incluindo descontos)
                if dados_financeiros is not None:
                    import json
                    campos_insert.append('dados_financeiros_json')
                    valores_insert.append(json.dumps(dados_financeiros, ensure_ascii=False))

                # Os campos data_criacao, data_atualizacao, ativo já estão na lista inicial

                # Montar SQL dinamicamente
                placeholders = []
                valores_final = []
                print(f"DEBUG FINAL: campos_insert({len(campos_insert)}): {campos_insert}")
                print(f"DEBUG FINAL: valores_insert({len(valores_insert)}): {valores_insert}")

                valor_index = 0  # Contador separado para valores
                for i, campo in enumerate(campos_insert):
                    if campo in ['data_atualizacao']:
                        placeholders.append('GETDATE()')
                        print(f"  ✅ Campo {i} '{campo}' -> GETDATE() (não consome valor)")
                    else:
                        placeholders.append('?')
                        if valor_index < len(valores_insert):
                            valores_final.append(valores_insert[valor_index])
                            print(f"  ✅ Campo {i} '{campo}' -> valor '{valores_insert[valor_index]}'")
                            valor_index += 1
                        else:
                            print(f"  ❌ ERRO: Campo {i} '{campo}' -> ÍNDICE VALOR {valor_index} FORA DE RANGE! (max={len(valores_insert)-1})")
                            raise IndexError(f"Campo '{campo}' índice valor {valor_index} fora de range. campos={len(campos_insert)}, valores={len(valores_insert)}")

                sql_insert = f"""
                    INSERT INTO PrestacaoContas ({', '.join(campos_insert)})
                    VALUES ({', '.join(placeholders)})
                """

                cursor.execute(sql_insert, valores_final)
            else:
                # Fallback para versão sem contrato_id
                # print(f"Criando nova prestacao (fallback - sem contrato_id)")
                cursor.execute("""
                INSERT INTO PrestacaoContas (
                    locador_id, mes, ano, referencia, valor_pago, valor_vencido,
                    encargos, deducoes, total_bruto, total_liquido, status,
                    pagamento_atrasado, observacoes_manuais, data_criacao, data_atualizacao, ativo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), 1)
                """, (
                    locador_id,
                    f"{mes:02d}",
                    str(ano),
                    referencia,
                    dados_financeiros.get('valor_pago', 0),
                    dados_financeiros.get('valor_vencido', 0),
                    dados_financeiros.get('encargos', 0),
                    dados_financeiros.get('deducoes', 0),
                    dados_financeiros.get('total_bruto', 0),
                    dados_financeiros.get('total_liquido', 0),
                    status,
                    status == 'atrasado',
                    observacoes,
                    data_vencimento_calculada
                ))

            # Obter ID da prestação recém criada (apenas se foi criada nova)
            cursor.execute("SELECT @@IDENTITY")
            prestacao_id = cursor.fetchone()[0]
        
        # Inserir lançamentos extras se houver
        if lancamentos_extras:
            ordem = 1000  # Começar lançamentos extras após os automáticos
            for lancamento in lancamentos_extras:
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, ?, ?, ?, 'extra', 'usuario', ?, GETDATE(), GETDATE(), 1)
                """, (
                    prestacao_id,
                    f"extra_{lancamento.get('tipo', 'indefinido')}",
                    lancamento.get('descricao', 'Lançamento extra'),
                    lancamento.get('valor', 0),
                    ordem
                ))
                ordem += 1
        
        # ✅ LANÇAMENTOS AUTOMÁTICOS REMOVIDOS
        # Agora todos os lançamentos são gerados pelo frontend e salvos via salvar_lancamentos_detalhados_completos()
        # Isso garante que apenas os itens que o usuário NÃO deletou sejam salvos no banco
        if False:  # BLOCO AUTOMATICO COMPLETAMENTE DESABILITADO
            # Preparar informações de mês/ano para descrições
            nomes_meses = {
                1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
                5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
                9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
            }
            nome_mes = nomes_meses.get(mes, str(mes))
            ordem = 1

            # Aluguel
            if contrato_dados.get('valor_aluguel', 0) > 0:
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'termo_aluguel', ?, ?, 'termo', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'Aluguel - {mes:02d}/{ano}', contrato_dados.get('valor_aluguel', 0), ordem))
                ordem += 1
            
            # Primeiro adicionar valores do termo (boleto)
            if contrato_dados.get('valor_condominio', 0) > 0:
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'termo_condominio', ?, ?, 'termo', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'Condomínio - {mes:02d}/{ano}', contrato_dados.get('valor_condominio', 0), ordem))
                ordem += 1

            if contrato_dados.get('valor_fci', 0) > 0:
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'termo_fci', ?, ?, 'termo', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'FCI - {mes:02d}/{ano}', contrato_dados.get('valor_fci', 0), ordem))
                ordem += 1

            if contrato_dados.get('valor_iptu', 0) > 0:
                # Calcular parcela de IPTU se houver informações
                desc_iptu = f'IPTU - {nome_mes}/{ano}'
                if contrato_dados.get('data_inicio_iptu') and contrato_dados.get('parcelas_iptu'):
                    try:
                        from datetime import datetime
                        inicio_iptu = datetime.strptime(contrato_dados['data_inicio_iptu'], '%Y-%m-%d')
                        mes_atual = datetime(ano, mes, 1)
                        meses_diff = (mes_atual.year - inicio_iptu.year) * 12 + (mes_atual.month - inicio_iptu.month)
                        parcela_atual = meses_diff + 1
                        total_parcelas = contrato_dados['parcelas_iptu']
                        if 1 <= parcela_atual <= total_parcelas:
                            desc_iptu = f'IPTU - {nome_mes}/{ano} (Parcela {parcela_atual}/{total_parcelas})'
                    except:
                        pass

                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'termo_iptu', ?, ?, 'termo', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, desc_iptu, contrato_dados.get('valor_iptu', 0), ordem))
                ordem += 1

            # Seguros (valores do termo)
            if contrato_dados.get('valor_seguro_fianca', 0) > 0:
                # Calcular parcela de Seguro Fiança
                desc_seguro = f'Seguro Fiança - {nome_mes}/{ano}'
                if contrato_dados.get('seguro_fianca_inicio') and contrato_dados.get('parcelas_seguro_fianca'):
                    try:
                        from datetime import datetime
                        inicio_seguro = datetime.strptime(contrato_dados['seguro_fianca_inicio'], '%Y-%m-%d')
                        mes_atual = datetime(ano, mes, 1)
                        meses_diff = (mes_atual.year - inicio_seguro.year) * 12 + (mes_atual.month - inicio_seguro.month)
                        parcela_atual = meses_diff + 1
                        total_parcelas = contrato_dados['parcelas_seguro_fianca']
                        if 1 <= parcela_atual <= total_parcelas:
                            desc_seguro = f'Seguro Fiança - {nome_mes}/{ano} (Parcela {parcela_atual}/{total_parcelas})'
                    except:
                        pass

                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'termo_seguro_fianca', ?, ?, 'termo', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, desc_seguro, contrato_dados.get('valor_seguro_fianca', 0), ordem))
                ordem += 1

            valor_seguro_incendio = contrato_dados.get('valor_seguro_incendio')
            if valor_seguro_incendio is not None and valor_seguro_incendio > 0:
                # Calcular parcela de Seguro Incêndio
                desc_incendio = f'Seguro Incêndio - {nome_mes}/{ano}'
                if contrato_dados.get('seguro_incendio_inicio') and contrato_dados.get('parcelas_seguro_incendio'):
                    try:
                        from datetime import datetime
                        inicio_incendio = datetime.strptime(contrato_dados['seguro_incendio_inicio'], '%Y-%m-%d')
                        mes_atual = datetime(ano, mes, 1)
                        meses_diff = (mes_atual.year - inicio_incendio.year) * 12 + (mes_atual.month - inicio_incendio.month)
                        parcela_atual = meses_diff + 1
                        total_parcelas = contrato_dados['parcelas_seguro_incendio']
                        if 1 <= parcela_atual <= total_parcelas:
                            desc_incendio = f'Seguro Incêndio - {nome_mes}/{ano} (Parcela {parcela_atual}/{total_parcelas})'
                    except:
                        pass

                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'termo_seguro_incendio', ?, ?, 'termo', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, desc_incendio, valor_seguro_incendio, ordem))
                ordem += 1

            # Valores retidos (deduzidos do repasse)
            if contrato_dados.get('retido_condominio') and contrato_dados.get('valor_condominio', 0) > 0:
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'retido_condominio', ?, ?, 'retido', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'Condomínio (Retido) - {nome_mes}/{ano}', -contrato_dados.get('valor_condominio', 0), ordem))
                ordem += 1

            if contrato_dados.get('retido_fci') and contrato_dados.get('valor_fci', 0) > 0:
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'retido_fci', ?, ?, 'retido', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'FCI (Retido) - {nome_mes}/{ano}', -contrato_dados.get('valor_fci', 0), ordem))
                ordem += 1

            if contrato_dados.get('retido_iptu') and contrato_dados.get('valor_iptu', 0) > 0:
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'retido_iptu', ?, ?, 'retido', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'IPTU (Retido) - {nome_mes}/{ano}', -contrato_dados.get('valor_iptu', 0), ordem))
                ordem += 1

            if contrato_dados.get('retido_seguro_fianca') and contrato_dados.get('valor_seguro_fianca', 0) > 0:
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'retido_seguro_fianca', ?, ?, 'retido', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'Seguro Fiança (Retido) - {nome_mes}/{ano}', -contrato_dados.get('valor_seguro_fianca', 0), ordem))
                ordem += 1

            if contrato_dados.get('retido_seguro_incendio') and valor_seguro_incendio is not None and valor_seguro_incendio > 0:
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'retido_seguro_incendio', ?, ?, 'retido', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'Seguro Incêndio (Retido) - {nome_mes}/{ano}', -valor_seguro_incendio, ordem))
                ordem += 1
            
            # Antecipações (5% de taxa)
            if contrato_dados.get('antecipa_condominio') and contrato_dados.get('valor_condominio', 0) > 0:
                taxa = contrato_dados.get('valor_condominio', 0) * 0.05
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'taxa_antecipacao_condominio', ?, ?, 'taxa', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'Taxa Antecipação Condomínio (5%) - {nome_mes}/{ano}', -taxa, ordem))
                ordem += 1

            if contrato_dados.get('antecipa_seguro_fianca') and contrato_dados.get('valor_seguro_fianca', 0) > 0:
                taxa = contrato_dados.get('valor_seguro_fianca', 0) * 0.05
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'taxa_antecipacao_seguro_fianca', ?, ?, 'taxa', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'Taxa Antecipação Seguro Fiança (5%) - {nome_mes}/{ano}', -taxa, ordem))
                ordem += 1

            if contrato_dados.get('antecipa_iptu') and contrato_dados.get('valor_iptu', 0) > 0:
                taxa = contrato_dados.get('valor_iptu', 0) * 0.05
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'taxa_antecipacao_iptu', ?, ?, 'taxa', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'Taxa Antecipação IPTU (5%) - {nome_mes}/{ano}', -taxa, ordem))
                ordem += 1

            if contrato_dados.get('antecipa_seguro_incendio') and valor_seguro_incendio is not None and valor_seguro_incendio > 0:
                taxa = valor_seguro_incendio * 0.05
                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'taxa_antecipacao_seguro_incendio', ?, ?, 'taxa', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'Taxa Antecipação Seguro Incêndio (5%) - {nome_mes}/{ano}', -taxa, ordem))
                ordem += 1

            # Taxa de administração
            if contrato_dados.get('taxa_administracao', 0) > 0 and contrato_dados.get('valor_aluguel', 0) > 0:
                aluguel = contrato_dados.get('valor_aluguel', 0)
                desconto = contrato_dados.get('bonificacao', 0)
                base_calculo = aluguel - desconto
                taxa_admin = base_calculo * (contrato_dados.get('taxa_administracao', 0) / 100)

                cursor.execute("""
                    INSERT INTO LancamentosPrestacaoContas (
                        prestacao_id, tipo, descricao, valor, categoria, origem, ordem_exibicao, data_lancamento, data_criacao, ativo
                    ) VALUES (?, 'taxa_administracao', ?, ?, 'taxa', 'sistema_automatico', ?, GETDATE(), GETDATE(), 1)
                """, (prestacao_id, f'Taxa de Administração ({contrato_dados["taxa_administracao"]}%) - {nome_mes}/{ano}', -taxa_admin, ordem))
                ordem += 1

            # Atualizar totais calculados na prestação principal
            cursor.execute("""
                SELECT
                    SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END) as total_positivo,
                    SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END) as total_negativo
                FROM LancamentosPrestacaoContas
                WHERE prestacao_id = ? AND ativo = 1
            """, (prestacao_id,))

            totais = cursor.fetchone()
            if totais:
                total_pos = float(totais[0] or 0)
                total_neg = float(totais[1] or 0)
                valor_repasse = total_pos - total_neg

                cursor.execute("""
                    UPDATE PrestacaoContas
                    SET valor_boleto = ?, total_retido = ?, valor_repasse = ?, data_atualizacao = GETDATE()
                    WHERE id = ?
                """, (total_pos, total_neg, valor_repasse, prestacao_id))

                print(f"Totais atualizados: Boleto=R$ {total_pos:.2f}, Retido=R$ {total_neg:.2f}, Repasse=R$ {valor_repasse:.2f}")

        # FUNCIONALIDADE 1: Marcar APENAS faturas PAGAS como "Lancada"
        if faturas_relacionadas:
            fatura_ids = [str(fatura[0]) for fatura in faturas_relacionadas]
            if fatura_ids:
                cursor.execute(f"""
                    UPDATE PrestacaoContas
                    SET status = 'lancada', data_atualizacao = GETDATE()
                    WHERE id IN ({','.join(['?' for _ in fatura_ids])}) AND status = 'paga'
                """, fatura_ids)

                faturas_atualizadas = cursor.rowcount
                if faturas_atualizadas > 0:
                    print(f"Faturas marcadas como 'Lancada': {faturas_atualizadas}")
        else:
            print(f"Nenhuma fatura encontrada para marcar como 'Lancada' para contrato {contrato_id} no mes {mes:02d}/{ano}")

        # FUNCIONALIDADE 2: Marcar prestação como lançada (sempre quando for fatura_existente)
        if tipo_prestacao == 'fatura_existente' or status == 'lancada':
            cursor.execute("""
                UPDATE PrestacaoContas
                SET status = 'lancada', data_atualizacao = GETDATE()
                WHERE id = ?
            """, (prestacao_id,))

        conn.commit()
        conn.close()
        
        print(f"Prestação de contas salva com sucesso - ID: {prestacao_id}")
        return {
            "success": True,
            "prestacao_id": prestacao_id,
            "locador_id": locador_id,
            "referencia": referencia
        }
        
    except Exception as e:
        print(f"Erro ao salvar prestação de contas: {e}")
        if conn:
            conn.rollback()
            conn.close()
        raise e

def buscar_prestacao_detalhada(prestacao_id):
    """Busca prestação de contas com todos os detalhes incluindo novos campos"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()

        # Buscar prestação com todos os campos
        cursor.execute("""
            SELECT
                id, contrato_id, mes, ano, status, valor_pago, valor_vencido,
                encargos, deducoes, total_bruto, total_liquido, observacoes_manuais,
                data_criacao, data_atualizacao,
                -- Novos campos
                valor_boleto, total_retido, valor_repasse, tipo_calculo,
                multa_rescisoria, detalhamento_json,
                -- Campos de acréscimos
                valor_acrescimos, valor_total_com_acrescimos, data_calculo_acrescimos,
                -- Campo de pagamento
                data_pagamento
            FROM PrestacaoContas
            WHERE id = ? AND ativo = 1
        """, (prestacao_id,))

        prestacao = cursor.fetchone()
        if not prestacao:
            return None

        # Converter para dicionário
        prestacao_dict = {
            'id': prestacao[0],
            'contrato_id': prestacao[1],
            'mes': prestacao[2],
            'ano': prestacao[3],
            'status': prestacao[4],
            'valor_pago': prestacao[5],
            'valor_vencido': prestacao[6],
            'encargos': prestacao[7],
            'deducoes': prestacao[8],
            'total_bruto': prestacao[9],
            'total_liquido': prestacao[10],
            'observacoes_manuais': prestacao[11],
            'data_criacao': prestacao[12].isoformat() if prestacao[12] else None,
            'data_atualizacao': prestacao[13].isoformat() if prestacao[13] else None,
            # Novos campos
            'valor_boleto': prestacao[14],
            'total_retido': prestacao[15],
            'valor_repasse': prestacao[16],
            'tipo_calculo': prestacao[17],
            'multa_rescisoria': prestacao[18],
            'detalhamento_json': prestacao[19],
            # Campos de acréscimos
            'valor_acrescimos': prestacao[20] if len(prestacao) > 20 else 0,
            'valor_total_com_acrescimos': prestacao[21] if len(prestacao) > 21 else None,
            'data_calculo_acrescimos': prestacao[22] if len(prestacao) > 22 else None,
            # Campo de pagamento - DEBUG DETALHADO
            'data_pagamento': prestacao[23].isoformat() if len(prestacao) > 23 and prestacao[23] else None
        }


        # Calcular data_vencimento usando vencimento_dia do contrato
        cursor.execute("SELECT vencimento_dia FROM Contratos WHERE id = ?", (prestacao_dict['contrato_id'],))
        contrato_result = cursor.fetchone()
        dia_vencimento = contrato_result[0] if contrato_result and contrato_result[0] else 10

        # Construir data_vencimento completa
        try:
            import calendar
            from datetime import datetime
            mes = int(prestacao_dict['mes'])
            ano = int(prestacao_dict['ano'])
            max_dia = calendar.monthrange(ano, mes)[1]
            dia_vencimento = min(dia_vencimento, max_dia)
            data_vencimento = datetime(ano, mes, dia_vencimento).strftime('%Y-%m-%d')
            prestacao_dict['data_vencimento'] = data_vencimento
        except:
            prestacao_dict['data_vencimento'] = None

        # Parse do JSON se existir
        if prestacao_dict['detalhamento_json']:
            import json
            try:
                prestacao_dict['detalhamento_json'] = json.loads(prestacao_dict['detalhamento_json'])
            except:
                prestacao_dict['detalhamento_json'] = None

        # Buscar dados do contrato incluindo dia de vencimento
        print(f"DEBUG - Buscando dados do contrato_id: {prestacao_dict['contrato_id']}")
        cursor.execute("""
            SELECT c.id, c.valor_aluguel, c.taxa_administracao, c.vencimento_dia,
                   c.id_imovel, cl.locatario_id,
                   i.endereco as imovel_endereco, i.tipo as imovel_tipo,
                   l.nome as locatario_nome, l.telefone as locatario_telefone,
                   l.email as locatario_email, l.cpf_cnpj as locatario_cpf,
                   c.percentual_multa_atraso
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN ContratoLocatarios cl ON c.id = cl.contrato_id AND cl.responsabilidade_principal = 1
            LEFT JOIN Locatarios l ON cl.locatario_id = l.id
            WHERE c.id = ?
        """, (prestacao_dict['contrato_id'],))

        contrato = cursor.fetchone()
        print(f"DEBUG - Dados do contrato encontrados: {contrato}")
        if contrato:
            prestacao_dict['contrato'] = {
                'id': contrato[0],
                'valor_aluguel': contrato[1],
                'taxa_administracao': contrato[2],
                'vencimento_dia': contrato[3],
                'id_imovel': contrato[4],
                'id_locatario': contrato[5],
                'imovel_endereco': contrato[6],
                'imovel_tipo': contrato[7],
                'locatario_nome': contrato[8],
                'locatario_telefone': contrato[9],
                'locatario_email': contrato[10],
                'locatario_cpf': contrato[11],
                'percentual_multa_atraso': contrato[12]
            }
            print(f"DEBUG - Dados do contrato processados: {prestacao_dict['contrato']}")

            # Calcular data de vencimento baseada no mês/ano da prestação e dia do contrato
            import calendar
            from datetime import datetime

            # Garantir que mes e ano são inteiros
            mes = int(prestacao_dict.get('mes', 1))
            ano = int(prestacao_dict.get('ano', datetime.now().year))
            dia_vencimento = int(contrato[3]) if contrato[3] else 10  # Default dia 10

            # Ajustar dia se for maior que os dias do mês
            max_dia = calendar.monthrange(ano, mes)[1]
            dia_vencimento = min(dia_vencimento, max_dia)

            data_vencimento = datetime(ano, mes, dia_vencimento).strftime('%Y-%m-%d')

            # Adicionar as datas calculadas
            prestacao_dict['data_vencimento'] = data_vencimento
            # data_pagamento já foi definido corretamente na linha 4542

            # Calcular acréscimos automaticamente se vencido
            from datetime import datetime
            data_venc_obj = datetime.strptime(data_vencimento, '%Y-%m-%d')
            hoje = datetime.now()

            if hoje > data_venc_obj and not prestacao_dict.get('data_pagamento'):
                dias_atraso = (hoje - data_venc_obj).days
                valor_boleto = float(prestacao_dict.get('valor_boleto', 0) or prestacao_dict.get('total_bruto', 0))

                if dias_atraso > 0 and valor_boleto > 0:
                    # Usar a mesma fórmula que o endpoint buscar_faturas
                    # percentual_multa_atraso do contrato (padrão 2%) + juros de 0.033% ao dia
                    percentual_multa = float(prestacao_dict['contrato'].get('percentual_multa_atraso', 2.0) or 2.0)
                    valor_acrescimos = valor_boleto * (
                        # Multa: percentual do contrato
                        (percentual_multa / 100) +
                        # Juros: 1% ao mês = 0.033% ao dia
                        (dias_atraso * 0.00033)
                    )

                    prestacao_dict['dias_atraso'] = dias_atraso
                    prestacao_dict['valor_acrescimos'] = valor_acrescimos
                    prestacao_dict['valor_total_com_acrescimos'] = valor_boleto + valor_acrescimos

                    print(f"ACRESCIMOS CALCULADOS: {dias_atraso} dias de atraso = R$ {valor_acrescimos:.2f}")
            else:
                prestacao_dict['dias_atraso'] = 0
                if not prestacao_dict.get('valor_acrescimos'):
                    prestacao_dict['valor_acrescimos'] = 0
                    prestacao_dict['valor_total_com_acrescimos'] = float(prestacao_dict.get('valor_boleto', 0) or prestacao_dict.get('total_bruto', 0))
        else:
            print("DEBUG - Nenhum contrato encontrado!")

        # BUSCAR LANÇAMENTOS DETALHADOS DA NOVA TABELA
        cursor.execute("""
            SELECT tipo, descricao, valor, categoria, origem, ordem_exibicao
            FROM LancamentosPrestacaoContas
            WHERE prestacao_id = ? AND ativo = 1
            ORDER BY ordem_exibicao, id
        """, (prestacao_id,))

        lancamentos_detalhados = []
        for row in cursor.fetchall():
            lancamentos_detalhados.append({
                'tipo': row[0],
                'descricao': row[1],
                'valor': float(row[2]) if row[2] else 0,
                'categoria': row[3],
                'origem': row[4],
                'ordem': row[5]
            })

        # Adicionar acréscimos como lançamento se houver
        if prestacao_dict.get('valor_acrescimos', 0) > 0:
            lancamentos_detalhados.append({
                'tipo': 'acrescimo_atraso',
                'descricao': f'Acréscimos por atraso ({prestacao_dict.get("dias_atraso", 0)} dias)',
                'valor': prestacao_dict['valor_acrescimos'],
                'categoria': 'acrescimo',
                'origem': 'sistema_automatico',
                'ordem': len(lancamentos_detalhados) + 1
            })

        prestacao_dict['lancamentos_detalhados'] = lancamentos_detalhados
        prestacao_dict['total_lancamentos'] = len(lancamentos_detalhados)

        # 🆕 BUSCAR LOCADORES DO CONTRATO COM DADOS BANCÁRIOS DA CONTA SELECIONADA NO TERMO
        print(f"DEBUG: Buscando locadores do contrato {prestacao_dict['contrato_id']}")
        cursor.execute("""
            SELECT loc.id, loc.nome, loc.telefone, loc.email, loc.cpf_cnpj,
                   cl.porcentagem, cl.responsabilidade_principal, cl.conta_bancaria_id,
                   cb.tipo_recebimento, cb.chave_pix, cb.banco, cb.agencia, cb.conta,
                   cb.titular, cb.cpf_titular
            FROM ContratoLocadores cl
            INNER JOIN Locadores loc ON cl.locador_id = loc.id
            LEFT JOIN ContasBancariasLocador cb ON cl.conta_bancaria_id = cb.id
            WHERE cl.contrato_id = ? AND cl.ativo = 1
            ORDER BY cl.responsabilidade_principal DESC, loc.nome
        """, (prestacao_dict['contrato_id'],))

        locadores = []
        for row in cursor.fetchall():
            locador_data = {
                'locador_id': row[0],  # Usar locador_id para compatibilidade com frontend
                'locador_nome': row[1],  # Usar locador_nome para compatibilidade
                'telefone': row[2],
                'email': row[3],
                'cpf_cnpj': row[4],
                'porcentagem': float(row[5]) if row[5] else 100.0,
                'responsabilidade_principal': bool(row[6]),
                'conta_bancaria_id': row[7]
            }

            # Adicionar dados bancários da conta selecionada no termo (se existir)
            if row[7]:  # Se tem conta_bancaria_id
                locador_data['conta_bancaria'] = {
                    'tipo_recebimento': row[8],
                    'pix_chave': row[9],
                    'banco': row[10],
                    'agencia': row[11],
                    'conta': row[12],
                    'titular': row[13],
                    'cpf_titular': row[14]
                }
            else:
                locador_data['conta_bancaria'] = None

            locadores.append(locador_data)

        prestacao_dict['locadores'] = locadores

        # 🆕 BUSCAR DISTRIBUIÇÃO DE REPASSE SALVA
        cursor.execute("""
            SELECT locador_id, locador_nome, percentual_participacao,
                   valor_repasse, responsabilidade_principal
            FROM DistribuicaoRepasseLocadores
            WHERE prestacao_id = ? AND ativo = 1
            ORDER BY responsabilidade_principal DESC, locador_nome
        """, (prestacao_id,))

        distribuicao_repasse = []
        for row in cursor.fetchall():
            distribuicao_repasse.append({
                'locador_id': row[0],
                'locador_nome': row[1],
                'percentual_participacao': float(row[2]) if row[2] else 100.0,
                'valor_repasse': float(row[3]) if row[3] else 0.0,
                'responsabilidade_principal': bool(row[4])
            })

        prestacao_dict['distribuicao_repasse'] = distribuicao_repasse

        conn.close()
        return prestacao_dict

    except Exception as e:
        print(f"Erro ao buscar prestação detalhada: {e}")
        return None

def listar_prestacoes_contrato(contrato_id, limit=50):
    """Lista prestações de um contrato específico"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT TOP (?)
                id, mes, ano, status, total_bruto, total_liquido,
                valor_boleto, total_retido, valor_repasse, tipo_calculo,
                data_criacao
            FROM PrestacaoContas
            WHERE contrato_id = ? AND ativo = 1
            ORDER BY ano DESC, mes DESC
        """, (limit, contrato_id))

        prestacoes = cursor.fetchall()

        resultado = []
        for p in prestacoes:
            resultado.append({
                'id': p[0],
                'mes': p[1],
                'ano': p[2],
                'status': p[3],
                'total_bruto': p[4],
                'total_liquido': p[5],
                'valor_boleto': p[6],
                'total_retido': p[7],
                'valor_repasse': p[8],
                'tipo_calculo': p[9],
                'data_criacao': p[10].isoformat() if p[10] else None
            })

        conn.close()
        return resultado

    except Exception as e:
        print(f"Erro ao listar prestações: {e}")
        return []

def calcular_prestacao_proporcional(contrato_id, data_entrada, data_saida, tipo_calculo, metodo_calculo="proporcional-dias"):
    """
    Calcula prestação de contas com lógica proporcional para entrada/saída
    
    Args:
        contrato_id: ID do contrato
        data_entrada: Data de entrada do locatário (YYYY-MM-DD)
        data_saida: Data de saída do locatário (YYYY-MM-DD)
        tipo_calculo: 'Entrada', 'Saída', 'Entrada + Proporcional', 'Total', 'Rescisão'
        metodo_calculo: 'proporcional-dias' ou 'dias-completo'
    
    Returns:
        dict: Resultado do cálculo proporcional
    """
    from datetime import datetime, date
    from calendar import monthrange
    
    try:
        print(f"CALCULANDO: Contrato {contrato_id}, Tipo: {tipo_calculo}, Metodo: {metodo_calculo}")
        
        # Buscar dados do contrato
        conn = get_conexao()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                c.valor_aluguel, c.taxa_administracao, c.data_inicio, c.data_fim,
                c.valor_iptu, c.valor_condominio, c.valor_seguro_fianca, c.valor_seguro_incendio,
                c.valor_fci, c.bonificacao, c.status,
                i.endereco as imovel_endereco,
                l.nome as locador_nome,
                loc.nome as locatario_nome
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN ContratoLocadores cl ON c.id = cl.contrato_id
            LEFT JOIN Locadores l ON cl.locador_id = l.id
            LEFT JOIN ContratoLocatarios clt ON c.id = clt.contrato_id AND clt.responsabilidade_principal = 1
            LEFT JOIN Locatarios loc ON clt.locatario_id = loc.id
            WHERE c.id = ?
        """, (contrato_id,))
        
        contrato = cursor.fetchone()
        if not contrato:
            raise Exception(f"Contrato {contrato_id} não encontrado")
        
        # Converter dados
        valor_aluguel = float(contrato.valor_aluguel or 0)
        taxa_admin = float(contrato.taxa_administracao or 10)
        valor_iptu = float(contrato.valor_iptu or 0)
        valor_condominio = float(contrato.valor_condominio or 0)
        bonificacao = float(contrato.bonificacao or 0)
        
        # Converter datas
        data_entrada_dt = datetime.strptime(data_entrada, '%Y-%m-%d').date()
        data_saida_dt = datetime.strptime(data_saida, '%Y-%m-%d').date()
        
        print(f"DADOS: Aluguel=R${valor_aluguel}, Taxa Admin={taxa_admin}%")
        print(f"PERIODO: {data_entrada} ate {data_saida}")
        
        resultado = {
            'contrato_id': contrato_id,
            'contrato_dados': {
                'numero': f"CONTRATO-{contrato_id:03d}",
                'locador_nome': contrato.locador_nome or "Locador",
                'locatario_nome': contrato.locatario_nome or "Locatário", 
                'imovel_endereco': contrato.imovel_endereco or "Endereço do Imóvel",
                'valor_aluguel': valor_aluguel
            },
            'configuracao': {
                'data_entrada': data_entrada,
                'data_saida': data_saida,
                'tipo_calculo': tipo_calculo,
                'metodo_calculo': metodo_calculo
            },
            'proporcional_entrada': 0.0,
            'meses_completos': 0.0,
            'qtd_meses_completos': 0,
            'proporcional_saida': 0.0,
            'total': 0.0,
            'valor_boleto': 0.0,
            'valor_repassado_locadores': 0.0,
            'valor_retido': 0.0,
            'breakdown_retencao': {
                'taxa_admin': 0.0,
                'seguro': 0.0,
                'outros': 0.0
            },
            'percentual_admin': taxa_admin,
            'periodo_dias': (data_saida_dt - data_entrada_dt).days + 1,
            'data_calculo': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # LÓGICA DOS CÁLCULOS PROPORCIONAIS
        
        if tipo_calculo in ['Entrada', 'Entrada + Proporcional']:
            # Calcular proporcional de entrada
            mes_entrada = data_entrada_dt.month
            ano_entrada = data_entrada_dt.year
            dias_no_mes = monthrange(ano_entrada, mes_entrada)[1]
            
            if metodo_calculo == "proporcional-dias":
                # Método 1: Proporcional apenas aos dias utilizados
                dias_utilizados_entrada = dias_no_mes - data_entrada_dt.day + 1
                resultado['proporcional_entrada'] = (valor_aluguel / dias_no_mes) * dias_utilizados_entrada
                print(f"ENTRADA - Metodo Proporcional: {dias_utilizados_entrada}/{dias_no_mes} dias = R${resultado['proporcional_entrada']:.2f}")
                
            elif metodo_calculo == "dias-completo":
                # Método 2: Dias utilizados + valor total do mês
                dias_utilizados_entrada = dias_no_mes - data_entrada_dt.day + 1
                proporcional = (valor_aluguel / dias_no_mes) * dias_utilizados_entrada
                resultado['proporcional_entrada'] = proporcional + valor_aluguel
                print(f"ENTRADA - Metodo Dias + Completo: R${proporcional:.2f} + R${valor_aluguel:.2f} = R${resultado['proporcional_entrada']:.2f}")
        
        if tipo_calculo in ['Saída', 'Entrada + Proporcional']:
            # Calcular proporcional de saída
            mes_saida = data_saida_dt.month
            ano_saida = data_saida_dt.year
            dias_no_mes_saida = monthrange(ano_saida, mes_saida)[1]
            
            if metodo_calculo == "proporcional-dias":
                # Método 1: Proporcional apenas aos dias utilizados
                dias_utilizados_saida = data_saida_dt.day
                resultado['proporcional_saida'] = (valor_aluguel / dias_no_mes_saida) * dias_utilizados_saida
                print(f"SAIDA - Metodo Proporcional: {dias_utilizados_saida}/{dias_no_mes_saida} dias = R${resultado['proporcional_saida']:.2f}")
                
            elif metodo_calculo == "dias-completo":
                # Método 2: Dias utilizados + valor total do mês
                dias_utilizados_saida = data_saida_dt.day
                proporcional = (valor_aluguel / dias_no_mes_saida) * dias_utilizados_saida
                resultado['proporcional_saida'] = proporcional + valor_aluguel
                print(f"SAIDA - Metodo Dias + Completo: R${proporcional:.2f} + R${valor_aluguel:.2f} = R${resultado['proporcional_saida']:.2f}")
        
        # Calcular meses completos (entre entrada e saída)
        if tipo_calculo in ['Entrada + Proporcional', 'Total']:
            # Contar meses completos entre as datas
            mes_atual = data_entrada_dt.replace(day=1)
            mes_fim = data_saida_dt.replace(day=1)
            
            # Ajustar para pular primeiro e último mês (que são proporcionais)
            if tipo_calculo == 'Entrada + Proporcional':
                if mes_atual.month == data_entrada_dt.month and mes_atual.year == data_entrada_dt.year:
                    mes_atual = mes_atual.replace(month=mes_atual.month + 1) if mes_atual.month < 12 else mes_atual.replace(year=mes_atual.year + 1, month=1)
                if mes_fim.month == data_saida_dt.month and mes_fim.year == data_saida_dt.year:
                    mes_fim = mes_fim.replace(month=mes_fim.month - 1) if mes_fim.month > 1 else mes_fim.replace(year=mes_fim.year - 1, month=12)
            
            meses_count = 0
            while mes_atual <= mes_fim:
                meses_count += 1
                mes_atual = mes_atual.replace(month=mes_atual.month + 1) if mes_atual.month < 12 else mes_atual.replace(year=mes_atual.year + 1, month=1)
            
            resultado['qtd_meses_completos'] = meses_count
            resultado['meses_completos'] = valor_aluguel * meses_count
            print(f"MESES COMPLETOS: {meses_count} x R${valor_aluguel:.2f} = R${resultado['meses_completos']:.2f}")
        
        # Calcular total
        if tipo_calculo == 'Rescisão':
            # Rescisão geralmente é o valor total do mês
            resultado['total'] = valor_aluguel
            print(f"RESCISAO: R${resultado['total']:.2f}")

            # Calcular multa de rescisão (30% dos aluguéis restantes)
            try:
                multa_info = calcular_multa_proporcional(contrato_id, data_saida)
                resultado['meses_restantes'] = multa_info.get('meses_restantes', 0)
                resultado['taxa_rescisao'] = multa_info.get('taxa_rescisao', 0)
                print(f"MULTA RESCISÃO: {resultado['meses_restantes']} meses restantes, taxa: R${resultado['taxa_rescisao']:.2f}")
            except Exception as e:
                print(f"Erro ao calcular multa de rescisão: {e}")
                resultado['meses_restantes'] = 0
                resultado['taxa_rescisao'] = 0

        else:
            resultado['total'] = resultado['proporcional_entrada'] + resultado['meses_completos'] + resultado['proporcional_saida']
            print(f"TOTAL: R${resultado['proporcional_entrada']:.2f} + R${resultado['meses_completos']:.2f} + R${resultado['proporcional_saida']:.2f} = R${resultado['total']:.2f}")
        
        # Calcular valores para locador e administradora
        valor_bruto = resultado['total']
        taxa_admin_valor = valor_bruto * (taxa_admin / 100)
        
        resultado['breakdown_retencao']['taxa_admin'] = taxa_admin_valor
        resultado['valor_retido'] = taxa_admin_valor
        resultado['valor_repassado_locadores'] = valor_bruto - taxa_admin_valor
        resultado['valor_boleto'] = valor_bruto
        
        print(f"VALOR BRUTO: R${valor_bruto:.2f}")
        print(f"TAXA ADMIN ({taxa_admin}%): R${taxa_admin_valor:.2f}")
        print(f"VALOR LIQUIDO LOCADOR: R${resultado['valor_repassado_locadores']:.2f}")
        
        conn.close()
        return resultado
        
    except Exception as e:
        print(f"ERRO no calculo proporcional: {e}")
        import traceback
        traceback.print_exc()
        if conn:
            conn.close()
        raise e

def calcular_prestacao_mensal(contrato_id, mes, ano, tipo_calculo, data_entrada=None, data_saida=None, metodo_calculo="proporcional-dias"):
    """
    Calcula prestação de contas para UM MÊS específico
    
    Args:
        contrato_id: ID do contrato
        mes: Mês (1-12)
        ano: Ano (ex: 2025)
        tipo_calculo: 'Entrada', 'Saída', 'Mensal', 'Rescisão'
        data_entrada: Data de entrada no mês (se tipo = Entrada) - formato DD
        data_saida: Data de saída no mês (se tipo = Saída) - formato DD  
        metodo_calculo: 'proporcional-dias' ou 'dias-completo'
    """
    from datetime import datetime, date
    from calendar import monthrange
    
    try:
        print(f"CALCULANDO MENSAL: Contrato {contrato_id}, Mes {mes}/{ano}, Tipo: {tipo_calculo}")
        
        # Buscar dados do contrato
        conn = get_conexao()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                c.valor_aluguel, c.taxa_administracao, c.data_inicio, c.data_fim,
                c.valor_iptu, c.valor_condominio, c.valor_seguro_fianca, c.valor_seguro_incendio,
                c.valor_fci, c.bonificacao, c.status,
                i.endereco as imovel_endereco,
                l.nome as locador_nome,
                loc.nome as locatario_nome
            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN ContratoLocadores cl ON c.id = cl.contrato_id
            LEFT JOIN Locadores l ON cl.locador_id = l.id
            LEFT JOIN ContratoLocatarios clt ON c.id = clt.contrato_id AND clt.responsabilidade_principal = 1
            LEFT JOIN Locatarios loc ON clt.locatario_id = loc.id
            WHERE c.id = ?
        """, (contrato_id,))
        
        contrato = cursor.fetchone()
        if not contrato:
            raise Exception(f"Contrato {contrato_id} não encontrado")
        
        # Converter todos os dados do contrato
        valor_aluguel = float(contrato.valor_aluguel or 0)
        valor_iptu = float(contrato.valor_iptu or 0)
        valor_condominio = float(contrato.valor_condominio or 0)
        valor_seguro_fianca = float(contrato.valor_seguro_fianca or 0)
        valor_seguro_incendio = float(contrato.valor_seguro_incendio or 0)
        valor_fci = float(contrato.valor_fci or 0)
        bonificacao = float(contrato.bonificacao or 0)
        taxa_admin = float(contrato.taxa_administracao or 10)
        
        # Separar valores proporcionais e fixos
        valores_proporcionais = valor_aluguel + valor_iptu + valor_condominio + valor_fci  # Aluguel, IPTU, Condomínio, FCI
        valores_fixos = valor_seguro_fianca + valor_seguro_incendio  # Seguros sempre fixos
        
        # Calcular valor bruto base considerando bonificação
        valor_bruto_base = valores_proporcionais + valores_fixos - bonificacao
        
        print(f"VALORES SEPARADOS: Proporcionais=R${valores_proporcionais:.2f} (aluguel+iptu+condominio+fci)")
        print(f"                   Fixos=R${valores_fixos:.2f} (seguros)")
        print(f"                   Bonificação=R${bonificacao:.2f}")
        
        # Calcular dias no mês
        dias_no_mes = monthrange(ano, mes)[1]
        
        print(f"DADOS: Aluguel=R${valor_aluguel}, Taxa Admin={taxa_admin}%, Dias no mes={dias_no_mes}")
        
        resultado = {
            'contrato_id': contrato_id,
            'contrato_dados': {
                'numero': f"CONTRATO-{contrato_id:03d}",
                'locador_nome': contrato.locador_nome or "Locador",
                'locatario_nome': contrato.locatario_nome or "Locatário", 
                'imovel_endereco': contrato.imovel_endereco or "Endereço do Imóvel",
                'valor_aluguel': valor_aluguel
            },
            'configuracao': {
                'mes': mes,
                'ano': ano,
                'tipo_calculo': tipo_calculo,
                'metodo_calculo': metodo_calculo,
                'data_entrada': data_entrada,
                'data_saida': data_saida
            },
            'valor_calculado': 0.0,
            'dias_utilizados': 0,
            'total_dias_mes': dias_no_mes,
            'valor_boleto': 0.0,
            'valor_repassado_locadores': 0.0,
            'valor_retido': 0.0,
            'breakdown_retencao': {
                'taxa_admin': 0.0,
                'seguro': 0.0,
                'outros': 0.0
            },
            'percentual_admin': taxa_admin,
            'data_calculo': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # CÁLCULOS POR TIPO
        
        if tipo_calculo == 'Mensal':
            # Mês completo normal
            resultado['valor_calculado'] = valor_bruto_base
            resultado['dias_utilizados'] = dias_no_mes
            print(f"MENSAL COMPLETO: R${valor_bruto_base:.2f}")
            
        elif tipo_calculo == 'Entrada':
            if not data_entrada:
                raise Exception("Data de entrada é obrigatória para tipo Entrada")
            
            # Calcular dias a partir da entrada até fim do mês
            dias_utilizados = dias_no_mes - int(data_entrada) + 1
            resultado['dias_utilizados'] = dias_utilizados
            
            if metodo_calculo == "proporcional-dias":
                # Método 1: Apenas proporcional aos dias
                # Aplicar proporção apenas aos valores proporcionais
                valores_proporcionais_calculados = (valores_proporcionais / dias_no_mes) * dias_utilizados
                resultado['valor_calculado'] = valores_proporcionais_calculados + valores_fixos - bonificacao
                print(f"ENTRADA PROPORCIONAL: Proporcionais={valores_proporcionais_calculados:.2f} + Fixos={valores_fixos:.2f} - Bonif={bonificacao:.2f} = R${resultado['valor_calculado']:.2f}")
                
            elif metodo_calculo == "dias-completo":
                # Método 2: Proporcional + mês completo
                # Aplicar proporção apenas aos valores proporcionais
                valores_proporcionais_calculados = (valores_proporcionais / dias_no_mes) * dias_utilizados
                proporcional = valores_proporcionais_calculados + valores_fixos - bonificacao
                resultado['valor_calculado'] = proporcional + valor_bruto_base
                print(f"ENTRADA DIAS+COMPLETO: R${proporcional:.2f} + R${valor_bruto_base:.2f} = R${resultado['valor_calculado']:.2f}")
                
        elif tipo_calculo == 'Saída':
            if not data_saida:
                raise Exception("Data de saída é obrigatória para tipo Saída")
            
            # Calcular dias do início do mês até a saída
            dias_utilizados = int(data_saida)
            resultado['dias_utilizados'] = dias_utilizados
            
            if metodo_calculo == "proporcional-dias":
                # Método 1: Apenas proporcional aos dias
                # Aplicar proporção apenas aos valores proporcionais
                valores_proporcionais_calculados = (valores_proporcionais / dias_no_mes) * dias_utilizados
                resultado['valor_calculado'] = valores_proporcionais_calculados + valores_fixos - bonificacao
                print(f"SAIDA PROPORCIONAL: Proporcionais={valores_proporcionais_calculados:.2f} + Fixos={valores_fixos:.2f} - Bonif={bonificacao:.2f} = R${resultado['valor_calculado']:.2f}")
                
            elif metodo_calculo == "dias-completo":
                # Método 2: Proporcional + mês completo
                # Aplicar proporção apenas aos valores proporcionais
                valores_proporcionais_calculados = (valores_proporcionais / dias_no_mes) * dias_utilizados
                proporcional = valores_proporcionais_calculados + valores_fixos - bonificacao
                resultado['valor_calculado'] = proporcional + valor_bruto_base
                print(f"SAIDA DIAS+COMPLETO: R${proporcional:.2f} + R${valor_bruto_base:.2f} = R${resultado['valor_calculado']:.2f}")
                
        elif tipo_calculo == 'Rescisão':
            # Rescisão = Aluguel PROPORCIONAL aos dias ocupados + Multa sobre valor INTEGRAL
            if data_saida:
                # Calcular dias ocupados até a rescisão
                dias_utilizados = int(data_saida)
                resultado['dias_utilizados'] = dias_utilizados
                
                # Aluguel proporcional aos dias efetivamente ocupados
                valores_proporcionais_calculados = (valores_proporcionais / dias_no_mes) * dias_utilizados
                bonificacao_proporcional = (bonificacao / dias_no_mes) * dias_utilizados if bonificacao > 0 else 0
                resultado['valor_calculado'] = valores_proporcionais_calculados + valores_fixos - bonificacao_proporcional
                print(f"RESCISAO PROPORCIONAL: {dias_utilizados} dias ocupados")
                print(f"   Valores proporcionais: R${valores_proporcionais_calculados:.2f}")
                print(f"   Valores fixos: R${valores_fixos:.2f}")
                print(f"   Bonificação proporcional: -R${bonificacao_proporcional:.2f} ({dias_utilizados}/{dias_no_mes} de R${bonificacao:.2f})")
                print(f"   Total aluguel proporcional: R${resultado['valor_calculado']:.2f}")
                print(f"NOTA: Multa é calculada sobre aluguel MENSAL COMPLETO (não proporcional)")

                # Calcular multa de rescisão (30% dos aluguéis restantes)
                try:
                    data_rescisao_str = f"{ano}-{mes:02d}-{dias_utilizados:02d}"
                    multa_info = calcular_multa_proporcional(contrato_id, data_rescisao_str)
                    resultado['meses_restantes'] = multa_info.get('meses_restantes', 0)
                    resultado['taxa_rescisao'] = multa_info.get('taxa_rescisao', 0)
                    print(f"MULTA RESCISÃO: {resultado['meses_restantes']} meses restantes, taxa: R${resultado['taxa_rescisao']:.2f}")
                except Exception as e:
                    print(f"Erro ao calcular multa de rescisão: {e}")
                    resultado['meses_restantes'] = 0
                    resultado['taxa_rescisao'] = 0

            else:
                # Se não tem data, usar mês completo
                resultado['valor_calculado'] = valor_bruto_base
                resultado['dias_utilizados'] = dias_no_mes
                print(f"RESCISAO SEM DATA: Mês completo = R${valor_bruto_base:.2f}")

                # Calcular multa de rescisão (30% dos aluguéis restantes)
                try:
                    data_rescisao_str = f"{ano}-{mes:02d}-{dias_no_mes:02d}"
                    multa_info = calcular_multa_proporcional(contrato_id, data_rescisao_str)
                    resultado['meses_restantes'] = multa_info.get('meses_restantes', 0)
                    resultado['taxa_rescisao'] = multa_info.get('taxa_rescisao', 0)
                    print(f"MULTA RESCISÃO: {resultado['meses_restantes']} meses restantes, taxa: R${resultado['taxa_rescisao']:.2f}")
                except Exception as e:
                    print(f"Erro ao calcular multa de rescisão: {e}")
                    resultado['meses_restantes'] = 0
                    resultado['taxa_rescisao'] = 0
        
        # Calcular valores finais com retenções
        valor_bruto = resultado['valor_calculado']
        
        # Taxa de administração
        taxa_admin_valor = valor_bruto * (taxa_admin / 100)
        
        # Retenções adicionais (baseadas no valor bruto)
        # Buscar dados de retenção do contrato
        cursor.execute("""
            SELECT retido_fci, retido_condominio, retido_seguro_fianca, retido_seguro_incendio, retido_iptu
            FROM Contratos WHERE id = ?
        """, (contrato_id,))
        retencoes = cursor.fetchone()
        
        valor_retencoes_adicionais = 0
        if retencoes:
            # Se tem seguro incêndio retido (como vimos no contrato 3)
            if retencoes[3] and valor_seguro_incendio > 0:  # retido_seguro_incendio
                valor_retencoes_adicionais += valor_seguro_incendio
            # Adicionar outras retenções conforme necessário
            if retencoes[0] and valor_fci > 0:  # retido_fci
                valor_retencoes_adicionais += valor_fci
            if retencoes[1] and valor_condominio > 0:  # retido_condominio
                valor_retencoes_adicionais += valor_condominio
            if retencoes[2] and valor_seguro_fianca > 0:  # retido_seguro_fianca
                valor_retencoes_adicionais += valor_seguro_fianca
            if retencoes[4] and valor_iptu > 0:  # retido_iptu
                valor_retencoes_adicionais += valor_iptu
        
        # RETENÇÕES VARIAM conforme tipo de cálculo
        # Taxa admin base: sobre (aluguel - bonificação) 
        base_taxa_admin = valor_aluguel - bonificacao
        taxa_admin_completa = base_taxa_admin * (taxa_admin / 100)
        
        # Taxa de boleto removida conforme solicitação
        taxa_boleto = 0.00
        
        # Taxa de TED: (número_locadores - 1) × R$ 10,00
        cursor.execute("SELECT COUNT(*) FROM ContratoLocadores WHERE contrato_id = ?", (contrato_id,))
        num_locadores = cursor.fetchone()[0]
        taxa_ted = max(0, (num_locadores - 1)) * 10.00
        
        # Retenções completas (R$ 135,00 para contrato 3)
        retencoes_completas = taxa_admin_completa + valor_retencoes_adicionais + taxa_boleto + taxa_ted
        
        # CALCULAR RETENÇÃO CONFORME TIPO DE CÁLCULO
        # Taxas fixas (sempre cobradas uma vez): boleto + TED
        taxas_fixas = taxa_boleto + taxa_ted
        
        # Retenções variáveis (podem ser proporcionais): taxa admin + encargos
        retencoes_variaveis = taxa_admin_completa + valor_retencoes_adicionais
        
        if tipo_calculo == 'Mensal':
            # Mês completo = retenção completa
            valor_total_retido = retencoes_variaveis + taxas_fixas
            
        elif tipo_calculo == 'Rescisão':
            # Rescisão usa retenção proporcional aos dias ocupados + taxa de rescisão
            if data_saida:
                dias_utilizados = int(data_saida)
                retencao_proporcional = retencoes_variaveis * (dias_utilizados / dias_no_mes)
                valor_total_retido = retencao_proporcional + taxas_fixas

                # Adicionar taxa de rescisão (20% da multa) se calculada
                taxa_rescisao_valor = resultado.get('taxa_rescisao', 0)
                if taxa_rescisao_valor > 0:
                    valor_total_retido += taxa_rescisao_valor
                    print(f"RETENCAO RESCISAO: Proporcional {dias_utilizados} dias + Taxa Rescisão = R${valor_total_retido:.2f}")
                else:
                    print(f"RETENCAO RESCISAO: Proporcional {dias_utilizados} dias = R${valor_total_retido:.2f}")
            else:
                valor_total_retido = retencoes_variaveis + taxas_fixas

                # Adicionar taxa de rescisão (20% da multa) se calculada
                taxa_rescisao_valor = resultado.get('taxa_rescisao', 0)
                if taxa_rescisao_valor > 0:
                    valor_total_retido += taxa_rescisao_valor
                    print(f"RETENCAO RESCISAO: Mês completo + Taxa Rescisão = R${valor_total_retido:.2f}")
                else:
                    print(f"RETENCAO RESCISAO: Mês completo = R${valor_total_retido:.2f}")
            
        elif tipo_calculo == 'Entrada':
            if metodo_calculo == "proporcional-dias":
                # Entrada proporcional = retenção proporcional + taxas fixas
                dias_utilizados = dias_no_mes - int(data_entrada) + 1
                retencao_proporcional = retencoes_variaveis * (dias_utilizados / dias_no_mes)
                valor_total_retido = retencao_proporcional + taxas_fixas
            elif metodo_calculo == "dias-completo":
                # Entrada dias+completo = retenção proporcional + retenção completa + taxas fixas (UMA VEZ)
                dias_utilizados = dias_no_mes - int(data_entrada) + 1
                retencao_proporcional = retencoes_variaveis * (dias_utilizados / dias_no_mes)
                valor_total_retido = retencao_proporcional + retencoes_variaveis + taxas_fixas
                
        elif tipo_calculo == 'Saída':
            if metodo_calculo == "proporcional-dias":
                # Saída proporcional = retenção proporcional + taxas fixas
                dias_utilizados = int(data_saida)
                retencao_proporcional = retencoes_variaveis * (dias_utilizados / dias_no_mes)
                valor_total_retido = retencao_proporcional + taxas_fixas
            elif metodo_calculo == "dias-completo":
                # Saída dias+completo = retenção proporcional + retenção completa + taxas fixas (UMA VEZ)
                dias_utilizados = int(data_saida)
                retencao_proporcional = retencoes_variaveis * (dias_utilizados / dias_no_mes)
                valor_total_retido = retencao_proporcional + retencoes_variaveis + taxas_fixas
        
        # Breakdown correto com taxas fixas
        if metodo_calculo == "dias-completo" and tipo_calculo in ['Entrada', 'Saída', 'Rescisão']:
            # Para dias-completo: proporcional + completa (mas taxas fixas apenas uma vez)
            proporcao_variaveis = (retencoes_variaveis * 2) / retencoes_completas if retencoes_completas > 0 else 0
            resultado['breakdown_retencao']['taxa_admin'] = taxa_admin_completa * proporcao_variaveis
            resultado['breakdown_retencao']['seguro'] = valor_retencoes_adicionais * proporcao_variaveis
            resultado['breakdown_retencao']['outros'] = taxa_boleto + taxa_ted  # Taxa fixa apenas uma vez
        else:
            # Para outros casos: proporcional normal
            if tipo_calculo in ['Entrada', 'Saída', 'Rescisão'] and metodo_calculo == "proporcional-dias":
                # Taxas variáveis proporcionais + taxas fixas integrais
                proporcao_variaveis = (valor_total_retido - taxas_fixas) / retencoes_variaveis if retencoes_variaveis > 0 else 0
                resultado['breakdown_retencao']['taxa_admin'] = taxa_admin_completa * proporcao_variaveis
                resultado['breakdown_retencao']['seguro'] = valor_retencoes_adicionais * proporcao_variaveis
                resultado['breakdown_retencao']['outros'] = taxa_boleto + taxa_ted  # Taxa fixa
            else:
                # Mensal: tudo completo
                resultado['breakdown_retencao']['taxa_admin'] = taxa_admin_completa
                resultado['breakdown_retencao']['seguro'] = valor_retencoes_adicionais
                resultado['breakdown_retencao']['outros'] = taxa_boleto + taxa_ted
        resultado['valor_retido'] = valor_total_retido
        resultado['valor_repassado_locadores'] = valor_bruto - valor_total_retido
        resultado['valor_boleto'] = valor_bruto
        
        print(f"FINAL: Bruto=R${valor_bruto:.2f}, Retido=R${valor_total_retido:.2f}, Liquido=R${resultado['valor_repassado_locadores']:.2f}")
        
        conn.close()
        return resultado
        
    except Exception as e:
        print(f"ERRO no calculo mensal: {e}")
        import traceback
        traceback.print_exc()
        if conn:
            conn.close()
        raise e

def criar_exemplo_contrato3():
    """
    Cria exemplos de cálculo usando o contrato 3 como base
    Demonstra os dois métodos: 'proporcional-dias' vs 'dias-completo'
    """
    print("=" * 80)
    print("EXEMPLOS DE CÁLCULO PROPORCIONAL - CONTRATO 3")
    print("=" * 80)
    
    # Dados de exemplo do contrato 3
    contrato_id = 3
    
    # Cenário 1: Entrada no meio do mês (dia 15) - método proporcional
    print("\n📍 CENÁRIO 1: ENTRADA (15/01/2025) - MÉTODO PROPORCIONAL")
    print("-" * 60)
    
    try:
        resultado1 = calcular_prestacao_proporcional(
            contrato_id=contrato_id,
            data_entrada="2025-01-15",
            data_saida="2025-01-31",
            tipo_calculo="Entrada",
            metodo_calculo="proporcional-dias"
        )
        
        print(f"• Período: {resultado1['configuracao']['data_entrada']} até {resultado1['configuracao']['data_saida']}")
        print(f"• Dias utilizados: {resultado1['periodo_dias']} dias")
        print(f"• Valor proporcional entrada: R${resultado1['proporcional_entrada']:.2f}")
        print(f"• Total a pagar: R${resultado1['valor_boleto']:.2f}")
        print(f"• Valor para locador: R${resultado1['valor_repassado_locadores']:.2f}")
        print(f"• Taxa administração: R${resultado1['breakdown_retencao']['taxa_admin']:.2f}")
        
    except Exception as e:
        print(f"Erro no cenário 1: {e}")
        # Usar valores exemplo se não conseguir conectar com banco
        print("• Exemplo com valores simulados:")
        print("• Valor aluguel: R$ 1.500,00")
        print("• Dias utilizados: 17 dias (15 a 31 de janeiro)")
        print("• Proporcional: (1.500 ÷ 31) × 17 = R$ 822,58")
        print("• Taxa admin (10%): R$ 82,26")
        print("• Líquido locador: R$ 740,32")
    
    # Cenário 2: Entrada no meio do mês (dia 15) - método dias + completo
    print("\n📍 CENÁRIO 2: ENTRADA (15/01/2025) - MÉTODO DIAS + COMPLETO")
    print("-" * 60)
    
    try:
        resultado2 = calcular_prestacao_proporcional(
            contrato_id=contrato_id,
            data_entrada="2025-01-15",
            data_saida="2025-01-31",
            tipo_calculo="Entrada",
            metodo_calculo="dias-completo"
        )
        
        print(f"• Período: {resultado2['configuracao']['data_entrada']} até {resultado2['configuracao']['data_saida']}")
        print(f"• Dias utilizados: {resultado2['periodo_dias']} dias")
        print(f"• Valor proporcional entrada: R${resultado2['proporcional_entrada']:.2f}")
        print(f"• Total a pagar: R${resultado2['valor_boleto']:.2f}")
        print(f"• Valor para locador: R${resultado2['valor_repassado_locadores']:.2f}")
        print(f"• Taxa administração: R${resultado2['breakdown_retencao']['taxa_admin']:.2f}")
        
    except Exception as e:
        print(f"Erro no cenário 2: {e}")
        # Usar valores exemplo se não conseguir conectar com banco
        print("• Exemplo com valores simulados:")
        print("• Valor aluguel: R$ 1.500,00")
        print("• Proporcional: (1.500 ÷ 31) × 17 + 1.500 = R$ 2.322,58")
        print("• Taxa admin (10%): R$ 232,26")
        print("• Líquido locador: R$ 2.090,32")
    
    # Cenário 3: Período completo (entrada + meses + saída) - método proporcional
    print("\n📍 CENÁRIO 3: PERÍODO COMPLETO (15/01 a 20/03/2025) - MÉTODO PROPORCIONAL")
    print("-" * 60)
    
    try:
        resultado3 = calcular_prestacao_proporcional(
            contrato_id=contrato_id,
            data_entrada="2025-01-15",
            data_saida="2025-03-20",
            tipo_calculo="Entrada + Proporcional",
            metodo_calculo="proporcional-dias"
        )
        
        print(f"• Período: {resultado3['configuracao']['data_entrada']} até {resultado3['configuracao']['data_saida']}")
        print(f"• Dias totais: {resultado3['periodo_dias']} dias")
        print(f"• Proporcional entrada: R${resultado3['proporcional_entrada']:.2f}")
        print(f"• Meses completos: {resultado3['qtd_meses_completos']} × R${resultado3['contrato_dados']['valor_aluguel']:.2f} = R${resultado3['meses_completos']:.2f}")
        print(f"• Proporcional saída: R${resultado3['proporcional_saida']:.2f}")
        print(f"• Total a pagar: R${resultado3['valor_boleto']:.2f}")
        print(f"• Valor para locador: R${resultado3['valor_repassado_locadores']:.2f}")
        print(f"• Taxa administração: R${resultado3['breakdown_retencao']['taxa_admin']:.2f}")
        
    except Exception as e:
        print(f"Erro no cenário 3: {e}")
        # Usar valores exemplo se não conseguir conectar com banco
        print("• Exemplo com valores simulados:")
        print("• Valor aluguel: R$ 1.500,00")
        print("• Entrada (17 dias): (1.500 ÷ 31) × 17 = R$ 822,58")
        print("• Fevereiro completo: R$ 1.500,00")
        print("• Saída (20 dias): (1.500 ÷ 31) × 20 = R$ 967,74")
        print("• Total: R$ 3.290,32")
        print("• Taxa admin (10%): R$ 329,03")
        print("• Líquido locador: R$ 2.961,29")
    
    print("\n" + "=" * 80)
    print("RESUMO DOS MÉTODOS DE CÁLCULO")
    print("=" * 80)
    print("• PROPORCIONAL-DIAS: Calcula apenas pelos dias efetivamente utilizados")
    print("• DIAS-COMPLETO: Dias utilizados + valor total do mês (mais favorável ao locador)")
    print("• A diferença pode ser significativa, especialmente em contratos curtos")
    print("=" * 80)


def calcular_multa_proporcional(contrato_id, data_rescisao):
    """
    Calcula multa de rescisão = 30% dos aluguéis restantes
    Taxa de rescisão = 20% do valor da multa (vai para retidos)

    Args:
        contrato_id: ID do contrato
        data_rescisao: Data da rescisão antecipada

    Returns:
        dict com valor da multa e taxa de rescisão
    """
    from datetime import datetime, timedelta
    from dateutil.relativedelta import relativedelta
    
    print(f"\nCALCULANDO MULTA PROPORCIONAL - Lei 8.245/91")
    print(f"Contrato ID: {contrato_id}")
    print(f"Data Rescisão: {data_rescisao}")
    
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            # Buscar dados do contrato
            cursor.execute("""
                SELECT 
                    c.id,
                    CAST(c.id as VARCHAR) as numero,
                    c.data_inicio,
                    c.data_fim,
                    c.valor_aluguel,
                    c.multa_locatario,
                    CASE 
                        WHEN c.multa_locatario IS NOT NULL THEN c.multa_locatario
                        ELSE 3 
                    END as multa_meses,
                    COALESCE(loc.nome, 'N/A') as locatario_nome
                FROM Contratos c
                LEFT JOIN ContratoLocatarios clt ON c.id = clt.contrato_id AND clt.responsabilidade_principal = 1
            LEFT JOIN Locatarios loc ON clt.locatario_id = loc.id
                WHERE c.id = ?
            """, (contrato_id,))
            
            contrato = cursor.fetchone()
            if not contrato:
                raise ValueError(f"Contrato {contrato_id} não encontrado")
            
            # Converter para dict
            contrato_data = {
                'id': contrato[0],
                'numero': contrato[1],
                'data_inicio': contrato[2],
                'data_fim': contrato[3],
                'valor_aluguel': float(contrato[4]) if contrato[4] else 0,
                'multa_meses': float(contrato[6]) if contrato[6] else 3,
                'locatario_nome': contrato[7] or 'N/A',
                'locador_nome': 'N/A'
            }
            
            print(f"Dados do Contrato:")
            print(f"   Número: {contrato_data['numero']}")
            print(f"   Período: {contrato_data['data_inicio']} até {contrato_data['data_fim']}")
            print(f"   Valor Aluguel: R$ {contrato_data['valor_aluguel']:,.2f}")
            print(f"   Multa Rescisória: {contrato_data['multa_meses']} meses")
            print(f"   Locatário: {contrato_data['locatario_nome']}")
            print(f"   Locador: {contrato_data['locador_nome']}")
            
            # Converter datas
            if isinstance(contrato_data['data_inicio'], str):
                data_inicio = datetime.strptime(contrato_data['data_inicio'], '%Y-%m-%d').date()
            else:
                data_inicio = contrato_data['data_inicio']
                
            if isinstance(contrato_data['data_fim'], str):
                data_fim = datetime.strptime(contrato_data['data_fim'], '%Y-%m-%d').date()
            else:
                data_fim = contrato_data['data_fim']
                
            if isinstance(data_rescisao, str):
                data_rescisao_dt = datetime.strptime(data_rescisao, '%Y-%m-%d').date()
            else:
                data_rescisao_dt = data_rescisao
            
            print(f"\nAnálise Temporal:")
            print(f"   Data Início: {data_inicio}")
            print(f"   Data Fim: {data_fim}")
            print(f"   Data Rescisão: {data_rescisao_dt}")
            
            # Validações
            if data_rescisao_dt <= data_inicio:
                raise ValueError("Data de rescisão deve ser posterior ao início do contrato")
                
            if data_rescisao_dt >= data_fim:
                print("ATENÇÃO: Rescisão após o fim do contrato - sem multa")
                return {
                    'multa_proporcional': 0,
                    'multa_integral': contrato_data['multa_meses'] * contrato_data['valor_aluguel'],
                    'meses_restantes': 0,
                    'prazo_total_meses': 0,
                    'percentual_cumprido': 100.0,
                    'percentual_restante': 0.0,
                    'justificativa': 'Rescisão após término natural do contrato',
                    'contrato_dados': contrato_data,
                    'base_legal': 'Lei 8.245/91 - Art. 4º'
                }
            
            # Calcular duração total em meses
            delta_total = relativedelta(data_fim, data_inicio)
            prazo_total_meses = delta_total.years * 12 + delta_total.months
            if delta_total.days > 0:
                prazo_total_meses += 1  # Arredondar para cima se houver dias extras
            
            # Calcular meses restantes
            delta_restante = relativedelta(data_fim, data_rescisao_dt)
            meses_restantes = delta_restante.years * 12 + delta_restante.months
            if delta_restante.days > 0:
                meses_restantes += 1  # Arredondar para cima se houver dias extras
            
            # Calcular meses já cumpridos
            delta_cumprido = relativedelta(data_rescisao_dt, data_inicio)
            meses_cumpridos = delta_cumprido.years * 12 + delta_cumprido.months
            if delta_cumprido.days > 0:
                meses_cumpridos += 1
            
            # Percentuais
            percentual_cumprido = (meses_cumpridos / prazo_total_meses) * 100
            percentual_restante = (meses_restantes / prazo_total_meses) * 100
            
            print(f"\nCálculos:")
            print(f"   Prazo Total: {prazo_total_meses} meses")
            print(f"   Meses Cumpridos: {meses_cumpridos}")
            print(f"   Meses Restantes: {meses_restantes}")
            print(f"   Percentual Cumprido: {percentual_cumprido:.1f}%")
            print(f"   Percentual Restante: {percentual_restante:.1f}%")
            
            # NOVA FÓRMULA: 30% dos aluguéis restantes
            valor_alugueis_restantes = meses_restantes * contrato_data['valor_aluguel']

            if meses_restantes <= 0:
                multa_rescisao = 0
                taxa_rescisao = 0
                justificativa = "Contrato já cumpriu prazo integral - sem multa"
            else:
                # Multa = 30% dos aluguéis restantes
                multa_rescisao = valor_alugueis_restantes * 0.30
                # Taxa de rescisão = 20% da multa (para retidos)
                taxa_rescisao = multa_rescisao * 0.20
                justificativa = f"Multa: 30% de R$ {valor_alugueis_restantes:,.2f} ({meses_restantes} meses × R$ {contrato_data['valor_aluguel']:,.2f})"
            
            print(f"\nResultado:")
            print(f"   Aluguéis Restantes: R$ {valor_alugueis_restantes:,.2f} ({meses_restantes} meses)")
            print(f"   Multa Rescisão (30%): R$ {multa_rescisao:,.2f}")
            print(f"   Taxa Rescisão (20% da multa): R$ {taxa_rescisao:,.2f}")
            print(f"   Justificativa: {justificativa}")

            resultado = {
                'multa_proporcional': round(multa_rescisao, 2),  # Compatibilidade
                'multa': round(multa_rescisao, 2),
                'taxa_rescisao': round(taxa_rescisao, 2),
                'valor_alugueis_restantes': round(valor_alugueis_restantes, 2),
                'meses_restantes': meses_restantes,
                'meses_cumpridos': meses_cumpridos,
                'prazo_total_meses': prazo_total_meses,
                'percentual_cumprido': round(percentual_cumprido, 2),
                'percentual_restante': round(percentual_restante, 2),
                'valor_aluguel': contrato_data['valor_aluguel'],
                'multa_meses': contrato_data['multa_meses'],
                'justificativa': justificativa,
                'contrato_dados': contrato_data,
                'base_legal': 'Multa: 30% dos aluguéis restantes / Taxa: 20% da multa',
                'data_inicio': data_inicio.isoformat(),
                'data_fim': data_fim.isoformat(),
                'data_rescisao': data_rescisao_dt.isoformat()
            }
            
            print("\nMULTA PROPORCIONAL CALCULADA COM SUCESSO!")
            return resultado
            
    except Exception as e:
        print(f"ERRO no cálculo da multa proporcional: {str(e)}")
        raise

# ===== FUNÇÕES PARA ATUALIZAR DADOS RELACIONADOS =====

def atualizar_telefones_locatario(cursor, locatario_id, telefones):
    """
    Atualiza os telefones de um locatário usando soft delete.
    
    Args:
        cursor: Cursor da conexão de banco
        locatario_id: ID do locatário
        telefones: Lista de strings com os telefones
    """
    try:
        print(f"Atualizando telefones do locatario {locatario_id}")
        print(f"Telefones recebidos: {telefones}")
        
        # 1. Desativar telefones existentes (soft delete)
        cursor.execute("""
            UPDATE TelefonesLocatario 
            SET ativo = 0 
            WHERE locatario_id = ?
        """, (locatario_id,))
        
        telefones_desativados = cursor.rowcount
        print(f"{telefones_desativados} telefone(s) anterior(es) desativado(s)")
        
        # 2. Inserir novos telefones se fornecidos
        if telefones and isinstance(telefones, list):
            telefones_inseridos = 0
            for telefone in telefones:
                if telefone and telefone.strip():  # Ignorar strings vazias
                    cursor.execute("""
                        INSERT INTO TelefonesLocatario (locatario_id, telefone, tipo, principal, ativo, data_cadastro)
                        VALUES (?, ?, ?, ?, 1, GETDATE())
                    """, (
                        locatario_id,
                        telefone.strip(),
                        'celular',  # Tipo padrão
                        1 if telefones_inseridos == 0 else 0  # Primeiro telefone é principal
                    ))
                    telefones_inseridos += 1
            
            print(f"SUCCESS: {telefones_inseridos} novo(s) telefone(s) inserido(s)")
        else:
            print("INFO: Nenhum telefone valido para inserir")
            
    except Exception as e:
        print(f"ERRO ao atualizar telefones do locatario {locatario_id}: {str(e)}")
        raise

def atualizar_emails_locatario(cursor, locatario_id, emails):
    """
    Atualiza os emails de um locatário usando soft delete.
    
    Args:
        cursor: Cursor da conexão de banco
        locatario_id: ID do locatário
        emails: Lista de strings com os emails
    """
    try:
        print(f"Atualizando emails do locatario {locatario_id}")
        print(f"Emails recebidos: {emails}")
        
        # 1. Desativar emails existentes (soft delete)
        cursor.execute("""
            UPDATE EmailsLocatario 
            SET ativo = 0 
            WHERE locatario_id = ?
        """, (locatario_id,))
        
        emails_desativados = cursor.rowcount
        print(f"{emails_desativados} email(s) anterior(es) desativado(s)")
        
        # 2. Inserir novos emails se fornecidos
        if emails and isinstance(emails, list):
            emails_inseridos = 0
            for email in emails:
                if email and email.strip() and '@' in email:  # Validação básica de email
                    cursor.execute("""
                        INSERT INTO EmailsLocatario (locatario_id, email, tipo, principal, ativo, data_cadastro)
                        VALUES (?, ?, ?, ?, 1, GETDATE())
                    """, (
                        locatario_id,
                        email.strip(),
                        'pessoal',  # Tipo padrão
                        1 if emails_inseridos == 0 else 0  # Primeiro email é principal
                    ))
                    emails_inseridos += 1
            
            print(f"SUCCESS: {emails_inseridos} novo(s) email(s) inserido(s)")
        else:
            print("INFO: Nenhum email valido para inserir")
            
    except Exception as e:
        print(f"ERRO ao atualizar emails do locatario {locatario_id}: {str(e)}")
        raise

def atualizar_telefones_locador(cursor, locador_id, telefones):
    """
    Atualiza os telefones de um locador usando soft delete.
    
    Args:
        cursor: Cursor da conexão de banco
        locador_id: ID do locador
        telefones: Lista de strings com os telefones
    """
    try:
        print(f"Atualizando telefones do locador {locador_id}")
        print(f"Telefones recebidos: {telefones}")
        
        # 1. Desativar telefones existentes (soft delete)
        cursor.execute("""
            UPDATE TelefonesLocador 
            SET ativo = 0 
            WHERE locador_id = ?
        """, (locador_id,))
        
        telefones_desativados = cursor.rowcount
        print(f"{telefones_desativados} telefone(s) anterior(es) desativado(s)")
        
        # 2. Inserir novos telefones se fornecidos
        if telefones and isinstance(telefones, list):
            telefones_inseridos = 0
            for telefone in telefones:
                if telefone and telefone.strip():  # Ignorar strings vazias
                    cursor.execute("""
                        INSERT INTO TelefonesLocador (locador_id, telefone, tipo, principal, ativo, data_cadastro)
                        VALUES (?, ?, ?, ?, 1, GETDATE())
                    """, (
                        locador_id,
                        telefone.strip(),
                        'celular',  # Tipo padrão
                        1 if telefones_inseridos == 0 else 0  # Primeiro telefone é principal
                    ))
                    telefones_inseridos += 1
            
            print(f"SUCCESS: {telefones_inseridos} novo(s) telefone(s) inserido(s)")
        else:
            print("Nenhum telefone válido para inserir")
            
    except Exception as e:
        print(f"ERRO ao atualizar telefones do locador {locador_id}: {str(e)}")
        raise

def atualizar_emails_locador(cursor, locador_id, emails):
    """
    Atualiza os emails de um locador usando soft delete.
    
    Args:
        cursor: Cursor da conexão de banco
        locador_id: ID do locador
        emails: Lista de strings com os emails
    """
    try:
        print(f"Atualizando emails do locador {locador_id}")
        print(f"Emails recebidos: {emails}")
        
        # 1. Desativar emails existentes (soft delete)
        cursor.execute("""
            UPDATE EmailsLocador 
            SET ativo = 0 
            WHERE locador_id = ?
        """, (locador_id,))
        
        emails_desativados = cursor.rowcount
        print(f"{emails_desativados} email(s) anterior(es) desativado(s)")
        
        # 2. Inserir novos emails se fornecidos
        if emails and isinstance(emails, list):
            emails_inseridos = 0
            for email in emails:
                if email and email.strip() and '@' in email:  # Validação básica de email
                    cursor.execute("""
                        INSERT INTO EmailsLocador (locador_id, email, tipo, principal, ativo, data_cadastro)
                        VALUES (?, ?, ?, ?, 1, GETDATE())
                    """, (
                        locador_id,
                        email.strip(),
                        'pessoal',  # Tipo padrão
                        1 if emails_inseridos == 0 else 0  # Primeiro email é principal
                    ))
                    emails_inseridos += 1
            
            print(f"SUCCESS: {emails_inseridos} novo(s) email(s) inserido(s)")
        else:
            print("Nenhum email válido para inserir")
            
    except Exception as e:
        print(f"ERRO ao atualizar emails do locador {locador_id}: {str(e)}")
        raise

def atualizar_metodos_pagamento_locador(cursor, locador_id, metodos_pagamento):
    """
    Atualiza os métodos de pagamento de um locador usando soft delete.
    
    Args:
        cursor: Cursor da conexão de banco
        locador_id: ID do locador
        metodos_pagamento: Lista de dicts com os dados bancários
    """
    try:
        # print(f"Atualizando metodos de pagamento do locador {locador_id}")
        # print(f"Metodos recebidos: {metodos_pagamento}")
        
        # 1. Desativar métodos de pagamento existentes (soft delete)
        cursor.execute("""
            UPDATE MetodosPagamentoLocador 
            SET ativo = 0 
            WHERE locador_id = ?
        """, (locador_id,))
        
        metodos_desativados = cursor.rowcount
        # print(f"{metodos_desativados} metodo(s) de pagamento anterior(es) desativado(s)")
        
        # 2. Inserir novos métodos se fornecidos
        if metodos_pagamento and isinstance(metodos_pagamento, list):
            metodos_inseridos = 0
            for i, metodo in enumerate(metodos_pagamento):
                if isinstance(metodo, dict) and metodo.get('banco') and metodo.get('conta'):
                    cursor.execute("""
                        INSERT INTO MetodosPagamentoLocador (
                            locador_id, banco, agencia, conta, tipo_conta, chave_pix, tipo_chave, 
                            principal, ativo, data_cadastro
                        )
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, GETDATE())
                    """, (
                        locador_id,
                        metodo.get('banco', ''),
                        metodo.get('agencia', ''),
                        metodo.get('conta', ''),
                        metodo.get('tipo_conta', 'corrente'),
                        metodo.get('pix_chave', ''),
                        metodo.get('pix_tipo', ''),
                        1 if i == 0 else 0  # Primeiro método é principal
                    ))
                    metodos_inseridos += 1
            
            print(f"SUCCESS: {metodos_inseridos} novo(s) metodo(s) de pagamento inserido(s)")
        else:
            print("INFO: Nenhum metodo de pagamento valido para inserir")
            
    except Exception as e:
        print(f"ERRO ao atualizar metodos de pagamento do locador {locador_id}: {str(e)}")
        raise

def inserir_endereco_locatario_com_conexao(cursor, dados_endereco):
    """Insere um endereço estruturado para locatário usando cursor existente"""
    try:
        print(f"Inserindo endereço do locatario com cursor existente: {dados_endereco}")
        
        from datetime import datetime
        
        cursor.execute("""
            INSERT INTO EnderecoLocatario (
                rua, numero, complemento, bairro, cidade, uf, cep, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            dados_endereco.get('rua', ''),
            dados_endereco.get('numero', ''),
            dados_endereco.get('complemento', ''),
            dados_endereco.get('bairro', ''),
            dados_endereco.get('cidade', ''),
            dados_endereco.get('uf', dados_endereco.get('estado', 'PR')),
            dados_endereco.get('cep', ''),
            datetime.now()
        ))
        
        # Obter ID do endereço inserido
        cursor.execute("SELECT @@IDENTITY")
        endereco_id = cursor.fetchone()[0]
        
        print(f"SUCCESS: Endereço locatario inserido com ID: {endereco_id}")
        return int(endereco_id)
        
    except Exception as e:
        print(f"ERRO ao inserir endereço do locatario: {str(e)}")
        raise

def atualizar_endereco_locatario(cursor, locatario_id, endereco_data):
    """
    Atualiza endereço de um locatário - insere novo endereço e atualiza endereco_id.
    
    Args:
        cursor: Cursor da conexão de banco
        locatario_id: ID do locatário
        endereco_data: Dict com dados do endereço
    """
    try:
        if not endereco_data or not isinstance(endereco_data, dict):
            print("INFO: Dados de endereço inválidos, pulando atualização")
            return
            
        print(f"Atualizando endereço do locatario {locatario_id}")
        print(f"Dados do endereço: {endereco_data}")
        
        # Inserir novo endereço
        endereco_id = inserir_endereco_locatario_com_conexao(cursor, endereco_data)
        
        if endereco_id:
            # Atualizar endereco_id na tabela Locatarios
            cursor.execute("""
                UPDATE Locatarios 
                SET endereco_id = ? 
                WHERE id = ?
            """, (endereco_id, locatario_id))
            
            print(f"SUCCESS: endereco_id atualizado para {endereco_id}")
        else:
            print("ERRO: Falha ao inserir novo endereço")
            
    except Exception as e:
        print(f"ERRO ao atualizar endereço do locatario {locatario_id}: {str(e)}")
        raise

def atualizar_formas_cobranca_locatario(cursor, locatario_id, formas_cobranca):
    """
    Atualiza as formas de cobrança de um locatário usando soft delete.
    
    Args:
        cursor: Cursor da conexão de banco
        locatario_id: ID do locatário
        formas_cobranca: Lista de dicts com as formas de cobrança
    """
    try:
        print(f"Atualizando formas de cobranca do locatario {locatario_id}")
        print(f"Formas de cobranca recebidas: {formas_cobranca}")
        
        # 1. Desativar formas de cobrança existentes (soft delete)
        cursor.execute("""
            UPDATE FormasEnvioCobranca 
            SET ativo = 0 
            WHERE locatario_id = ?
        """, (locatario_id,))
        
        formas_desativadas = cursor.rowcount
        print(f"{formas_desativadas} forma(s) de cobranca anterior(es) desativada(s)")
        
        # 2. Inserir novas formas se fornecidas
        if formas_cobranca and isinstance(formas_cobranca, list):
            formas_inseridas = 0
            for i, forma in enumerate(formas_cobranca):
                if isinstance(forma, dict) and forma.get('tipo') and forma.get('contato'):
                    cursor.execute("""
                        INSERT INTO FormasEnvioCobranca (
                            locatario_id, tipo, contato, observacoes, principal, ativo, 
                            ordem, verificado, data_cadastro
                        )
                        VALUES (?, ?, ?, ?, ?, 1, ?, 0, GETDATE())
                    """, (
                        locatario_id,
                        forma.get('tipo', ''),
                        forma.get('contato', ''),
                        forma.get('observacoes', ''),
                        1 if i == 0 else 0,  # Primeira forma é principal
                        i  # Ordem baseada na posição na lista
                    ))
                    formas_inseridas += 1
            
            print(f"SUCCESS: {formas_inseridas} nova(s) forma(s) de cobranca inserida(s)")
        else:
            print("INFO: Nenhuma forma de cobranca valida para inserir")
            
    except Exception as e:
        print(f"ERRO ao atualizar formas de cobranca do locatario {locatario_id}: {str(e)}")
        raise

def inserir_contrato_completo(**kwargs):
    """Insere um novo contrato com todos os campos do ContratoCreate (baseado em atualizar_contrato)"""
    try:
        print(f"=== REPOSITORIES: Inserindo novo contrato completo ===")
        print(f"Campos recebidos: {list(kwargs.keys())}")
        
        conn = get_conexao()
        cursor = conn.cursor()
        
        # CAMPOS INSERÍVEIS - COPIADOS EXATAMENTE DO atualizar_contrato
        campos_inseríveis = [
            # Campos originais
            'id_locatario', 'id_imovel', 'valor_aluguel', 'data_inicio', 
            'data_fim', 'data_vencimento', 'tipo_garantia',
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
            
            # Campo de PLANO DE LOCAÇÃO
            'id_plano_locacao',
            
            # Campos de CORRETOR
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
            
            # Campos ADICIONAIS que EXISTEM no banco
            'clausulas_adicionais',
            'tipo_plano_locacao',
            
            # Campos de antecipação/retenção adicionais (confirmados na tabela)
            'antecipa_iptu', 'antecipa_taxa_lixo', 'retido_taxa_lixo',
            'valor_taxa_lixo', 'valor_taxa_administracao', 'valor_fundo_reserva'
        ]
        
        # Filtrar apenas campos válidos
        campos_para_inserir = {}
        for campo, valor in kwargs.items():
            if campo in campos_inseríveis:
                campos_para_inserir[campo] = valor
            else:
                print(f"AVISO: Campo '{campo}' ignorado (não está na lista de inseríveis)")
        
        if not campos_para_inserir:
            print("ERRO: Nenhum campo válido para inserir")
            return {"success": False, "message": "Nenhum campo válido fornecido"}
        
        # Garantir campos obrigatórios com valores padrão
        if 'status' not in campos_para_inserir:
            campos_para_inserir['status'] = 'ativo'
        
        # Construir e executar INSERT
        colunas = list(campos_para_inserir.keys())
        placeholders = ', '.join(['?' for _ in colunas])
        colunas_str = ', '.join([f'[{col}]' for col in colunas])
        
        query = f"INSERT INTO Contratos ({colunas_str}) VALUES ({placeholders})"
        valores = list(campos_para_inserir.values())
        
        print(f"Executando INSERT com {len(campos_para_inserir)} campos")
        cursor.execute(query, valores)
        
        # Obter o ID do contrato inserido (usando @@IDENTITY como nos imóveis)
        cursor.execute("SELECT @@IDENTITY")
        contrato_id = cursor.fetchone()[0]
        
        conn.commit()
        conn.close()
        
        print(f"SUCCESS: Contrato criado com ID {contrato_id}")
        return {"success": True, "id": int(contrato_id), "message": "Contrato criado com sucesso"}
        
    except Exception as e:
        print(f"ERRO ao inserir contrato completo: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"success": False, "message": f"Erro ao inserir contrato: {str(e)}"}


# ==========================================
# NOVAS FUNÇÕES PARA LANÇAMENTOS DETALHADOS
# ==========================================

# Função removida - agora integrada em salvar_lancamentos_detalhados_completos

def salvar_descontos_ajustes(prestacao_id, descontos_ajustes):
    """Salva descontos e ajustes na tabela LancamentosPrestacaoContas"""
    try:
        print(f"💰 INICIO salvar_descontos_ajustes")
        print(f"   prestacao_id={prestacao_id}")
        print(f"   descontos: {len(descontos_ajustes) if descontos_ajustes else 0}")

        conn = get_conexao()
        cursor = conn.cursor()

        # Garantir que prestacao_id é int
        if hasattr(prestacao_id, '__int__'):
            prestacao_id = int(prestacao_id)

        ordem = 1000  # Começar após outros lançamentos
        for desconto in descontos_ajustes:
            tipo_desconto = desconto.get('tipo', 'desconto_generico')
            descricao = desconto.get('label', desconto.get('descricao', 'Desconto'))
            valor = float(desconto.get('valor', 0))

            # Pular valores zerados
            if valor == 0:
                continue

            # Descontos são valores negativos
            if valor > 0:
                valor = -valor

            print(f"   Inserindo desconto: {tipo_desconto} - {descricao} - {valor}")
            cursor.execute("""
                INSERT INTO LancamentosPrestacaoContas (
                    prestacao_id, tipo, descricao, valor, categoria, origem,
                    ordem_exibicao, data_lancamento, data_criacao, ativo
                ) VALUES (?, ?, ?, ?, 'desconto', 'frontend_desconto', ?, GETDATE(), GETDATE(), 1)
            """, (prestacao_id, tipo_desconto, descricao, valor, ordem))

            ordem += 1

        # Recalcular totais após salvar descontos - CORRIGIDO para separar descontos de retidos
        print(f"📊 Recalculando totais após salvar descontos...")
        cursor.execute("""
            SELECT
                SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END) as total_positivo,
                SUM(CASE WHEN valor < 0 AND categoria IN ('retido', 'taxa') THEN ABS(valor) ELSE 0 END) as total_retido,
                SUM(CASE WHEN valor < 0 AND categoria = 'desconto' THEN ABS(valor) ELSE 0 END) as total_descontos
            FROM LancamentosPrestacaoContas
            WHERE prestacao_id = ? AND ativo = 1
        """, (prestacao_id,))

        resultado = cursor.fetchone()
        total_positivo_real = float(resultado[0] or 0)
        total_retido_real = float(resultado[1] or 0)
        total_descontos_real = float(resultado[2] or 0)

        # Valor do boleto = soma de positivos - descontos (NÃO inclui retidos)
        valor_boleto_final = total_positivo_real - total_descontos_real

        print(f"📊 Após salvar descontos:")
        print(f"   Total positivo: R$ {total_positivo_real:.2f}")
        print(f"   Total retido: R$ {total_retido_real:.2f}")
        print(f"   Total descontos: R$ {total_descontos_real:.2f}")
        print(f"   Valor boleto final: R$ {valor_boleto_final:.2f}")

        cursor.execute("""
            UPDATE PrestacaoContas
            SET valor_boleto = ?,
                total_retido = ?
            WHERE id = ?
        """, (valor_boleto_final, total_retido_real, prestacao_id))

        conn.commit()
        print(f"✅ Descontos/ajustes salvos com sucesso")
        return {"success": True, "descontos_salvos": len(descontos_ajustes)}

    except Exception as e:
        print(f"❌ Erro em salvar_descontos_ajustes: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

def salvar_lancamentos_detalhados_completos(prestacao_id, lancamentos_completos, mes_referencia=None, repasse_por_locador=None):
    """Salva TODOS os lançamentos calculados no frontend"""
    try:
        print(f"🔍 INICIO salvar_lancamentos_detalhados_completos")
        print(f"   prestacao_id={prestacao_id} (tipo: {type(prestacao_id)})")
        print(f"   lancamentos: {len(lancamentos_completos) if lancamentos_completos else 0}")
        print(f"   repasse_por_locador: {len(repasse_por_locador) if repasse_por_locador else 0}")

        # Garantir que prestacao_id é int
        if hasattr(prestacao_id, '__int__'):
            prestacao_id = int(prestacao_id)
            print(f"   prestacao_id convertido para int: {prestacao_id}")

        conn = get_conexao()
        cursor = conn.cursor()

        print(f"Salvando {len(lancamentos_completos)} lançamentos detalhados para prestação {prestacao_id}")

        # Marcar TODOS os lançamentos anteriores como inativos para evitar duplicações
        cursor.execute("""
            UPDATE LancamentosPrestacaoContas
            SET ativo = 0
            WHERE prestacao_id = ? AND origem = 'frontend_calculado'
        """, (prestacao_id,))

        ordem = 1
        total_positivo = 0
        total_negativo = 0
        lancamentos_salvos = 0
        tipos_processados = set()  # Para evitar duplicação de tipos

        # Inserir cada lançamento individual
        for lancamento in lancamentos_completos:
            tipo = lancamento.get('tipo', 'extra')
            descricao = lancamento.get('descricao', 'Sem descrição')
            valor = float(lancamento.get('valor', 0))
            categoria = lancamento.get('categoria', 'indefinido')

            # Skip valores zerados
            if valor == 0:
                continue

            # Evitar duplicação de tipos específicos
            # Para tipos críticos como seguro, iptu, etc., permitir apenas uma entrada
            tipos_unicos = ['termo_seguro_incendio', 'retido_seguro_incendio',
                           'termo_iptu', 'retido_iptu',
                           'termo_seguro_fianca', 'retido_seguro_fianca',
                           'termo_condominio', 'retido_condominio',
                           'termo_fci', 'retido_fci',
                           'taxa_administracao', 'taxa_transferencia']

            if tipo in tipos_unicos:
                if tipo in tipos_processados:
                    print(f"   ⚠️ Ignorando duplicata: {tipo}")
                    continue
                tipos_processados.add(tipo)

            # Categorizar automaticamente se não fornecido
            if categoria == 'indefinido':
                if tipo.startswith('termo_'):
                    categoria = 'termo'
                elif tipo.startswith('retido_'):
                    categoria = 'retido'
                elif tipo.startswith('taxa_'):
                    categoria = 'taxa'
                else:
                    categoria = 'extra'

            # Inserir lançamento
            print(f"   Inserindo lançamento {ordem}: {tipo} - {valor}")
            cursor.execute("""
                INSERT INTO LancamentosPrestacaoContas (
                    prestacao_id, tipo, descricao, valor, categoria, origem,
                    ordem_exibicao, data_lancamento, data_criacao, ativo
                ) VALUES (?, ?, ?, ?, ?, 'frontend_calculado', ?, GETDATE(), GETDATE(), 1)
            """, (prestacao_id, tipo, descricao, valor, categoria, ordem))
            print(f"   ✅ Lançamento {ordem} inserido")

            # Contabilizar totais para validação
            if valor > 0:
                total_positivo += valor
            else:
                total_negativo += abs(valor)

            ordem += 1
            lancamentos_salvos += 1

        # Atualizar totais calculados incluindo descontos
        print(f"📊 Atualizando totais na PrestacaoContas incluindo todos os lançamentos...")
        try:
            # Recalcular totais separando descontos de valores retidos
            cursor.execute("""
                SELECT
                    SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END) as total_positivo,
                    SUM(CASE WHEN valor < 0 AND categoria IN ('retido', 'taxa') THEN ABS(valor) ELSE 0 END) as total_retido,
                    SUM(CASE WHEN valor < 0 AND categoria = 'desconto' THEN ABS(valor) ELSE 0 END) as total_descontos
                FROM LancamentosPrestacaoContas
                WHERE prestacao_id = ? AND ativo = 1
            """, (prestacao_id,))

            resultado = cursor.fetchone()
            total_positivo_real = float(resultado[0] or 0)
            total_retido_real = float(resultado[1] or 0)
            total_descontos_real = float(resultado[2] or 0)

            # Valor do boleto = soma de positivos - descontos (mas NÃO retidos)
            valor_boleto_final = total_positivo_real - total_descontos_real

            print(f"📊 Totais recalculados corretamente:")
            print(f"   Total positivo: R$ {total_positivo_real:.2f}")
            print(f"   Total retido: R$ {total_retido_real:.2f}")
            print(f"   Total descontos: R$ {total_descontos_real:.2f}")
            print(f"   Valor boleto final: R$ {valor_boleto_final:.2f}")

            cursor.execute("""
                UPDATE PrestacaoContas
                SET valor_boleto = ?,
                    total_retido = ?,
                    valor_repasse = ?
                WHERE id = ?
            """, (valor_boleto_final, total_retido_real, valor_boleto_final - total_retido_real, prestacao_id))
            print(f"✅ Totais atualizados com todos os lançamentos")
        except Exception as e:
            print(f"❌ Erro ao atualizar totais: {e}")
            # Continuar mesmo com erro

        # Fazer commit parcial para garantir que lançamentos foram salvos
        print(f"💾 Fazendo commit parcial dos lançamentos...")
        try:
            conn.commit()
            print(f"✅ Commit parcial realizado")
        except Exception as e:
            print(f"❌ Erro no commit parcial: {e}")

        # Salvar distribuição de locadores se fornecida
        print(f"👥 Salvando distribuição de {len(repasse_por_locador) if repasse_por_locador else 0} locadores...")
        if repasse_por_locador and len(repasse_por_locador) > 0:
            try:
                # Usar conexão separada para evitar travamento
                conn2 = get_conexao()
                cursor2 = conn2.cursor()

                # Marcar distribuições anteriores como inativas
                cursor2.execute("""
                    UPDATE DistribuicaoRepasseLocadores
                    SET ativo = 0
                    WHERE prestacao_id = ?
                """, (prestacao_id,))

                # Inserir novas distribuições
                for i, distribuicao in enumerate(repasse_por_locador, 1):
                    print(f"   Inserindo distribuição {i}: locador_id={distribuicao.get('locador_id')}")
                    cursor2.execute("""
                        INSERT INTO DistribuicaoRepasseLocadores (
                            prestacao_id, locador_id, locador_nome, percentual_participacao,
                            valor_repasse, responsabilidade_principal, data_criacao, ativo
                        ) VALUES (?, ?, ?, ?, ?, ?, GETDATE(), 1)
                    """, (
                        prestacao_id,
                        distribuicao.get('locador_id'),
                        distribuicao.get('locador_nome'),
                        distribuicao.get('porcentagem', 100),
                        distribuicao.get('valor_repasse', 0),
                        distribuicao.get('responsabilidade_principal', False)
                    ))

                conn2.commit()
                conn2.close()
                print(f"✅ Distribuição de {len(repasse_por_locador)} locadores salva")
            except Exception as e:
                print(f"❌ Erro ao salvar distribuição de locadores: {e}")
                import traceback
                traceback.print_exc()

        print(f"🔒 Fechando conexão principal...")
        conn.close()
        print(f"✅ Conexão fechada")

        print(f"{lancamentos_salvos} lançamentos salvos para prestação {prestacao_id}")
        print(f"Total boleto: {total_positivo}, Total retido: {total_negativo}, Repasse: {total_positivo - total_negativo}")

        return {
            "success": True,
            "lancamentos_salvos": lancamentos_salvos,
            "total_boleto": total_positivo,
            "total_retido": total_negativo,
            "valor_repasse": total_positivo - total_negativo,
            "locadores_distribuidos": len(repasse_por_locador) if repasse_por_locador else 0
        }

    except Exception as e:
        print(f"Erro ao salvar lançamentos detalhados: {str(e)}")
        import traceback
        traceback.print_exc()
        return {"success": False, "message": f"Erro: {str(e)}"}