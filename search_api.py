"""
API de busca integrada para SQL Server
"""
import pyodbc
import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    """Conecta ao SQL Server"""
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    return pyodbc.connect(connection_string)

def buscar_global(query: str, tipo: Optional[str] = None) -> Dict[str, List[Dict[str, Any]]]:
    """
    Busca global em todas as tabelas ou em um tipo específico
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    resultado = {
        'locadores': [],
        'locatarios': [],
        'imoveis': [],
        'contratos': []
    }
    
    query_lower = query.lower() if query else ''
    buscar_todos = query == '*'  # Flag para buscar todos os registros
    
    try:
        # Buscar Locadores
        if not tipo or tipo == 'locadores':
            if buscar_todos:
                cursor.execute("""
                    SELECT TOP 50 
                        id, nome, cpf_cnpj, telefone, email, endereco,
                        tipo_recebimento, rg, nacionalidade, estado_civil, profissao
                    FROM Locadores 
                    ORDER BY nome
                """)
            else:
                cursor.execute("""
                    SELECT TOP 50 
                        id, nome, cpf_cnpj, telefone, email, endereco,
                        tipo_recebimento, rg, nacionalidade, estado_civil, profissao
                    FROM Locadores 
                    WHERE 
                        LOWER(nome) LIKE ? OR
                        LOWER(cpf_cnpj) LIKE ? OR
                        LOWER(email) LIKE ? OR
                        LOWER(telefone) LIKE ? OR
                        LOWER(endereco) LIKE ?
                    ORDER BY nome
                """, (f'%{query_lower}%',) * 5)
            
            columns = [column[0] for column in cursor.description]
            for row in cursor.fetchall():
                locador = dict(zip(columns, row))
                resultado['locadores'].append(locador)
        
        # Buscar Locatários
        if not tipo or tipo == 'locatarios':
            if buscar_todos:
                cursor.execute("""
                    SELECT TOP 50 
                        id, nome, cpf_cnpj, telefone, email,
                        tipo_garantia, rg, nacionalidade, estado_civil, profissao
                    FROM Locatarios 
                    ORDER BY nome
                """)
            else:
                cursor.execute("""
                    SELECT TOP 50 
                        id, nome, cpf_cnpj, telefone, email,
                        tipo_garantia, rg, nacionalidade, estado_civil, profissao
                    FROM Locatarios 
                    WHERE 
                        LOWER(nome) LIKE ? OR
                        LOWER(cpf_cnpj) LIKE ? OR
                        LOWER(email) LIKE ? OR
                        LOWER(telefone) LIKE ?
                    ORDER BY nome
                """, (f'%{query_lower}%',) * 4)
            
            columns = [column[0] for column in cursor.description]
            for row in cursor.fetchall():
                locatario = dict(zip(columns, row))
                resultado['locatarios'].append(locatario)
        
        # Buscar Imóveis
        if not tipo or tipo == 'imoveis':
            if buscar_todos:
                cursor.execute("""
                    SELECT TOP 50 
                        i.id, i.tipo, i.endereco, i.valor_aluguel, 
                        i.status, i.quartos, i.banheiros,
                        i.vagas_garagem, i.metragem_total, i.andar,
                        l.nome as locador_nome
                    FROM Imoveis i
                    LEFT JOIN Locadores l ON i.id_locador = l.id
                    ORDER BY i.endereco
                """)
            else:
                cursor.execute("""
                    SELECT TOP 50 
                        i.id, i.tipo, i.endereco, i.valor_aluguel, 
                        i.status, i.quartos, i.banheiros,
                        i.vagas_garagem, i.metragem_total, i.andar,
                        l.nome as locador_nome
                    FROM Imoveis i
                    LEFT JOIN Locadores l ON i.id_locador = l.id
                    WHERE 
                        LOWER(i.tipo) LIKE ? OR
                        LOWER(i.endereco) LIKE ? OR
                        LOWER(i.status) LIKE ? OR
                        LOWER(l.nome) LIKE ?
                    ORDER BY i.endereco
                """, (f'%{query_lower}%',) * 4)
            
            columns = [column[0] for column in cursor.description]
            for row in cursor.fetchall():
                imovel = dict(zip(columns, row))
                # Converter Decimal para float
                if imovel.get('valor_aluguel'):
                    imovel['valor_aluguel'] = float(imovel['valor_aluguel'])
                if imovel.get('metragem_total'):
                    imovel['metragem_total'] = float(imovel['metragem_total'])
                resultado['imoveis'].append(imovel)
        
        # Buscar Contratos
        if not tipo or tipo == 'contratos':
            if buscar_todos:
                cursor.execute("""
                    SELECT TOP 50 
                        c.id, c.data_inicio, c.data_fim,
                        c.vencimento_dia, c.tipo_garantia,
                        i.endereco as imovel_endereco, i.tipo as imovel_tipo,
                        loc.nome as locatario_nome,
                        ldr.nome as locador_nome
                    FROM Contratos c
                    LEFT JOIN Imoveis i ON c.id_imovel = i.id
                    LEFT JOIN Locatarios loc ON c.id_locatario = loc.id
                    LEFT JOIN Locadores ldr ON i.id_locador = ldr.id
                    ORDER BY c.data_inicio DESC
                """)
            else:
                cursor.execute("""
                    SELECT TOP 50 
                        c.id, c.data_inicio, c.data_fim,
                        c.vencimento_dia, c.tipo_garantia,
                        i.endereco as imovel_endereco, i.tipo as imovel_tipo,
                        loc.nome as locatario_nome,
                        ldr.nome as locador_nome
                    FROM Contratos c
                    LEFT JOIN Imoveis i ON c.id_imovel = i.id
                    LEFT JOIN Locatarios loc ON c.id_locatario = loc.id
                    LEFT JOIN Locadores ldr ON i.id_locador = ldr.id
                    WHERE 
                        LOWER(loc.nome) LIKE ? OR
                        LOWER(ldr.nome) LIKE ? OR
                        LOWER(i.endereco) LIKE ? OR
                        CAST(c.id AS VARCHAR) LIKE ?
                    ORDER BY c.data_inicio DESC
                """, (f'%{query_lower}%',) * 4)
            
            columns = [column[0] for column in cursor.description]
            for row in cursor.fetchall():
                contrato = dict(zip(columns, row))
                # Converter datas para string
                if contrato.get('data_inicio'):
                    contrato['data_inicio'] = str(contrato['data_inicio'])
                if contrato.get('data_fim'):
                    contrato['data_fim'] = str(contrato['data_fim'])
                contrato['numero_contrato'] = f"CT-{contrato['id']:04d}"
                contrato['status'] = 'ativo' if contrato.get('data_fim') and contrato['data_fim'] >= str(datetime.now().date()) else 'vencido'
                resultado['contratos'].append(contrato)
        
        return resultado
        
    except Exception as e:
        print(f"Erro na busca: {e}")
        return resultado
    finally:
        conn.close()

def obter_estatisticas_busca(query: str) -> Dict[str, int]:
    """
    Retorna estatísticas da busca
    """
    resultado = buscar_global(query)
    return {
        'total': sum(len(v) for v in resultado.values()),
        'locadores': len(resultado['locadores']),
        'locatarios': len(resultado['locatarios']),
        'imoveis': len(resultado['imoveis']),
        'contratos': len(resultado['contratos'])
    }

def buscar_sugestoes() -> Dict[str, Any]:
    """
    Retorna sugestões de busca baseadas em dados recentes
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    sugestoes = {
        'recentes': [],
        'populares': [],
        'categorias': {}
    }
    
    try:
        # Contratos ativos
        cursor.execute("""
            SELECT COUNT(*) FROM Contratos 
            WHERE data_fim >= GETDATE()
        """)
        sugestoes['categorias']['contratos_ativos'] = cursor.fetchone()[0]
        
        # Imóveis disponíveis
        cursor.execute("""
            SELECT COUNT(*) FROM Imoveis i
            WHERE NOT EXISTS (
                SELECT 1 FROM Contratos c 
                WHERE c.id_imovel = i.id AND c.data_fim >= GETDATE()
            )
        """)
        sugestoes['categorias']['imoveis_disponiveis'] = cursor.fetchone()[0]
        
        # Total locadores
        cursor.execute("SELECT COUNT(*) FROM Locadores")
        sugestoes['categorias']['total_locadores'] = cursor.fetchone()[0]
        
        # Total locatários
        cursor.execute("SELECT COUNT(*) FROM Locatarios")
        sugestoes['categorias']['total_locatarios'] = cursor.fetchone()[0]
        
        return sugestoes
        
    except Exception as e:
        print(f"Erro ao buscar sugestões: {e}")
        return sugestoes
    finally:
        conn.close()

def buscar_relacionados(query: str, tipo: Optional[str] = None, 
                        locador_id: Optional[int] = None, 
                        locatario_id: Optional[int] = None, 
                        imovel_id: Optional[int] = None) -> Dict[str, List[Dict[str, Any]]]:
    """
    Busca dados relacionados com base em IDs de entidades
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    resultado = {
        'locadores': [],
        'locatarios': [],
        'imoveis': [],
        'contratos': []
    }
    
    query_lower = query.lower() if query else ''
    buscar_todos = query == '*'
    
    try:
        # Buscar imóveis por locador
        if (not tipo or tipo == 'imoveis') and locador_id:
            cursor.execute("""
                SELECT i.id, i.endereco, i.tipo, i.valor_aluguel, i.quartos, i.area_total, i.status
                FROM Imoveis i 
                WHERE i.id_locador = ?
                ORDER BY i.endereco
            """, (locador_id,))
            
            for row in cursor.fetchall():
                resultado['imoveis'].append({
                    'id': row.id,
                    'endereco': row.endereco,
                    'tipo': row.tipo,
                    'valor_aluguel': float(row.valor_aluguel) if row.valor_aluguel else 0,
                    'quartos': row.quartos,
                    'area_total': float(row.area_total) if row.area_total else 0,
                    'status': row.status
                })
        
        # Buscar contratos por locador
        if (not tipo or tipo == 'contratos') and locador_id:
            cursor.execute("""
                SELECT c.id, c.data_inicio, c.data_fim, c.valor_aluguel, c.status,
                       lt.nome as locatario_nome, i.endereco as imovel_endereco
                FROM Contratos c
                LEFT JOIN Locatarios lt ON c.id_locatario = lt.id
                LEFT JOIN Imoveis i ON c.id_imovel = i.id
                WHERE c.id_locador = ?
                ORDER BY c.data_inicio DESC
            """, (locador_id,))
            
            for row in cursor.fetchall():
                resultado['contratos'].append({
                    'id': row.id,
                    'data_inicio': row.data_inicio.isoformat() if row.data_inicio else None,
                    'data_fim': row.data_fim.isoformat() if row.data_fim else None,
                    'valor_aluguel': float(row.valor_aluguel) if row.valor_aluguel else 0,
                    'status': row.status,
                    'locatario_nome': row.locatario_nome,
                    'imovel_endereco': row.imovel_endereco
                })
                
        # Buscar contratos por locatário
        if (not tipo or tipo == 'contratos') and locatario_id:
            cursor.execute("""
                SELECT c.id, c.data_inicio, c.data_fim, c.valor_aluguel, c.status,
                       l.nome as locador_nome, i.endereco as imovel_endereco
                FROM Contratos c
                LEFT JOIN Locadores l ON c.id_locador = l.id
                LEFT JOIN Imoveis i ON c.id_imovel = i.id
                WHERE c.id_locatario = ?
                ORDER BY c.data_inicio DESC
            """, (locatario_id,))
            
            for row in cursor.fetchall():
                resultado['contratos'].append({
                    'id': row.id,
                    'data_inicio': row.data_inicio.isoformat() if row.data_inicio else None,
                    'data_fim': row.data_fim.isoformat() if row.data_fim else None,
                    'valor_aluguel': float(row.valor_aluguel) if row.valor_aluguel else 0,
                    'status': row.status,
                    'locador_nome': row.locador_nome,
                    'imovel_endereco': row.imovel_endereco
                })
                
        # Buscar contratos por imóvel
        if (not tipo or tipo == 'contratos') and imovel_id:
            cursor.execute("""
                SELECT c.id, c.data_inicio, c.data_fim, c.valor_aluguel, c.status,
                       l.nome as locador_nome, lt.nome as locatario_nome
                FROM Contratos c
                LEFT JOIN Locadores l ON c.id_locador = l.id
                LEFT JOIN Locatarios lt ON c.id_locatario = lt.id
                WHERE c.id_imovel = ?
                ORDER BY c.data_inicio DESC
            """, (imovel_id,))
            
            for row in cursor.fetchall():
                resultado['contratos'].append({
                    'id': row.id,
                    'data_inicio': row.data_inicio.isoformat() if row.data_inicio else None,
                    'data_fim': row.data_fim.isoformat() if row.data_fim else None,
                    'valor_aluguel': float(row.valor_aluguel) if row.valor_aluguel else 0,
                    'status': row.status,
                    'locador_nome': row.locador_nome,
                    'locatario_nome': row.locatario_nome
                })
        
        # Buscar locadores por imóvel
        if (not tipo or tipo == 'locadores') and imovel_id:
            cursor.execute("""
                SELECT l.id, l.nome, l.cpf_cnpj, l.telefone, l.email, l.endereco,
                       CASE WHEN l.ativo IS NULL THEN 1 ELSE l.ativo END as ativo
                FROM Locadores l
                INNER JOIN Imoveis i ON l.id = i.id_locador
                WHERE i.id = ?
            """, (imovel_id,))
            
            for row in cursor.fetchall():
                resultado['locadores'].append({
                    'id': row.id,
                    'nome': row.nome,
                    'cpf_cnpj': row.cpf_cnpj,
                    'telefone': row.telefone,
                    'email': row.email,
                    'endereco': row.endereco,
                    'ativo': bool(row.ativo)
                })
        
        print(f"DEBUG: buscar_relacionados - query='{query}', tipo='{tipo}', locador_id={locador_id}, locatario_id={locatario_id}, imovel_id={imovel_id}")
        print(f"DEBUG: resultado - {len(resultado['imoveis'])} imoveis, {len(resultado['contratos'])} contratos, {len(resultado['locadores'])} locadores")
        
        return resultado
        
    except Exception as e:
        print(f"Erro ao buscar dados relacionados: {e}")
        return resultado
    finally:
        conn.close()

# Adicionar importação de datetime
from datetime import datetime

# Teste da API
if __name__ == "__main__":
    print("Testando API de busca...")
    
    # Testar busca geral
    resultado = buscar_global("fernando")
    print(f"\nBusca por 'fernando':")
    print(f"Locadores: {len(resultado['locadores'])}")
    print(f"Locatários: {len(resultado['locatarios'])}")
    print(f"Imóveis: {len(resultado['imoveis'])}")
    print(f"Contratos: {len(resultado['contratos'])}")
    
    # Testar estatísticas
    stats = obter_estatisticas_busca("teste")
    print(f"\nEstatísticas para 'teste': {stats}")
    
    # Testar sugestões
    sugestoes = buscar_sugestoes()
    print(f"\nSugestões: {sugestoes}")