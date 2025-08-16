from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
import pyodbc
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

router = APIRouter()

def get_conexao():
    """Estabelece conexão com o banco SQL Server"""
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    return pyodbc.connect(connection_string)

@router.get("/api/search/enhanced/{entity_type}/{entity_id}")
async def get_complete_entity_data(entity_type: str, entity_id: int) -> Dict[str, Any]:
    """
    Busca dados completos de uma entidade com histórico e vínculos
    entity_type: 'locador', 'locatario', 'imovel', 'contrato'
    """
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        if entity_type == 'locador':
            return await _get_complete_locador_data(cursor, entity_id)
        elif entity_type == 'locatario':
            return await _get_complete_locatario_data(cursor, entity_id)
        elif entity_type == 'imovel':
            return await _get_complete_imovel_data(cursor, entity_id)
        elif entity_type == 'contrato':
            return await _get_complete_contrato_data(cursor, entity_id)
        else:
            raise HTTPException(status_code=400, detail=f"Tipo de entidade inválido: {entity_type}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dados: {str(e)}")
    finally:
        if 'conn' in locals():
            conn.close()

async def _get_complete_locador_data(cursor, locador_id: int) -> Dict[str, Any]:
    """Busca dados completos do locador com histórico e vínculos"""
    
    # 1. Dados principais do locador
    cursor.execute("""
        SELECT 
            id, nome, cpf_cnpj, telefone, email, endereco, 
            tipo_recebimento, conta_bancaria, rg, profissao, 
            estado_civil, nacionalidade, data_nascimento, 
            ativo, data_cadastro, tipo_pessoa, observacoes,
            razao_social, nome_fantasia, inscricao_estadual
        FROM Clientes 
        WHERE id = ? AND tipo_cliente = 'Locador'
    """, (locador_id,))
    
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Locador não encontrado")
    
    locador = {
        "id": row[0],
        "nome": row[1],
        "cpf_cnpj": row[2] or "",
        "telefone": row[3] or "",
        "email": row[4] or "",
        "endereco": row[5] or "",
        "tipo_recebimento": row[6] or "",
        "conta_bancaria": row[7] or "",
        "rg": row[8] or "",
        "profissao": row[9] or "",
        "estado_civil": row[10] or "",
        "nacionalidade": row[11] or "Brasileiro",
        "data_nascimento": row[12].isoformat() if row[12] else None,
        "ativo": row[13],
        "data_cadastro": row[14].isoformat() if row[14] else None,
        "tipo_pessoa": row[15] or "PF",
        "observacoes": row[16] or "",
        "razao_social": row[17] or "",
        "nome_fantasia": row[18] or "",
        "inscricao_estadual": row[19] or ""
    }
    
    # 2. Imóveis vinculados
    cursor.execute("""
        SELECT 
            i.id, i.endereco, i.tipo, i.valor_aluguel, i.status, 
            i.quartos, i.banheiros, i.vagas_garagem, i.metragem_total,
            i.ativo, i.data_cadastro
        FROM Imoveis i 
        WHERE i.id_locador = ? AND (i.ativo = 1 OR i.ativo IS NULL)
        ORDER BY i.data_cadastro DESC
    """, (locador_id,))
    
    imoveis = []
    for row in cursor.fetchall():
        imoveis.append({
            "id": row[0],
            "endereco": row[1] or "",
            "tipo": row[2] or "Não informado",
            "valor_aluguel": float(row[3]) if row[3] else 0,
            "status": row[4] or "DISPONIVEL",
            "quartos": row[5] or 0,
            "banheiros": row[6] or 0,
            "vagas_garagem": row[7] or 0,
            "area_total": float(row[8]) if row[8] else 0,
            "ativo": row[9],
            "data_cadastro": row[10].isoformat() if row[10] else None
        })
    
    # 3. Contratos ativos
    cursor.execute("""
        SELECT 
            c.id, c.data_inicio, c.data_fim, c.valor_aluguel,
            i.endereco as imovel_endereco,
            l.nome as locatario_nome,
            c.status, c.data_cadastro
        FROM Contratos c
        INNER JOIN Imoveis i ON c.id_imovel = i.id
        LEFT JOIN Locatarios l ON c.id_locatario = l.id
        WHERE i.id_locador = ?
        ORDER BY c.data_cadastro DESC
    """, (locador_id,))
    
    contratos = []
    for row in cursor.fetchall():
        contratos.append({
            "id": row[0],
            "data_inicio": row[1].isoformat() if row[1] else None,
            "data_fim": row[2].isoformat() if row[2] else None,
            "valor_aluguel": float(row[3]) if row[3] else 0,
            "imovel_endereco": row[4] or "",
            "locatario_nome": row[5] or "Não informado",
            "status": row[6] or "ATIVO",
            "data_cadastro": row[7].isoformat() if row[7] else None
        })
    
    # 4. Histórico de atividades (simulado)
    historico = [
        {
            "id": 1,
            "data": datetime.now().isoformat(),
            "tipo": "CADASTRO",
            "descricao": f"Locador {locador['nome']} cadastrado no sistema",
            "valor": None
        },
        {
            "id": 2,
            "data": (datetime.now()).isoformat(),
            "tipo": "IMOVEL",
            "descricao": f"Cadastrado {len(imoveis)} imóvel(s)",
            "valor": None
        },
        {
            "id": 3,
            "data": (datetime.now()).isoformat(),
            "tipo": "CONTRATO",
            "descricao": f"Criado {len(contratos)} contrato(s)",
            "valor": sum(c['valor_aluguel'] for c in contratos)
        }
    ]
    
    # 5. Estatísticas
    estatisticas = {
        "total_imoveis": len(imoveis),
        "imoveis_ocupados": len([c for c in contratos if c['status'] == 'ATIVO']),
        "imoveis_disponiveis": len(imoveis) - len([c for c in contratos if c['status'] == 'ATIVO']),
        "contratos_ativos": len([c for c in contratos if c['status'] == 'ATIVO']),
        "receita_mensal_bruta": sum(c['valor_aluguel'] for c in contratos if c['status'] == 'ATIVO'),
        "receita_mensal_estimada": sum(i['valor_aluguel'] for i in imoveis),
        "avaliacao_media": 4.8
    }
    
    return {
        "success": True,
        "data": {
            "entidade": "locador",
            "dados_principais": locador,
            "vinculos": {
                "imoveis": imoveis,
                "contratos": contratos
            },
            "historico": historico,
            "estatisticas": estatisticas
        }
    }

async def _get_complete_locatario_data(cursor, locatario_id: int) -> Dict[str, Any]:
    """Busca dados completos do locatário"""
    
    # Dados principais do locatário
    cursor.execute("""
        SELECT 
            id, nome, cpf_cnpj, telefone, email, endereco_rua,
            tipo_pessoa, rg, data_nascimento, nacionalidade, 
            estado_civil, profissao, ativo, data_cadastro,
            possui_conjuge, conjuge_nome, qtd_pets, observacoes
        FROM Locatarios 
        WHERE id = ?
    """, (locatario_id,))
    
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Locatário não encontrado")
    
    locatario = {
        "id": row[0],
        "nome": row[1] or "",
        "cpf_cnpj": row[2] or "",
        "telefone": row[3] or "",
        "email": row[4] or "",
        "endereco": row[5] or "",
        "tipo_pessoa": row[6] or "PF",
        "rg": row[7] or "",
        "data_nascimento": row[8].isoformat() if row[8] else None,
        "nacionalidade": row[9] or "Brasileiro",
        "estado_civil": row[10] or "",
        "profissao": row[11] or "",
        "ativo": row[12],
        "data_cadastro": row[13].isoformat() if row[13] else None,
        "possui_conjuge": row[14] or False,
        "conjuge_nome": row[15] or "",
        "qtd_pets": row[16] or 0,
        "observacoes": row[17] or ""
    }
    
    # Contratos do locatário
    cursor.execute("""
        SELECT 
            c.id, c.data_inicio, c.data_fim, c.valor_aluguel,
            i.endereco as imovel_endereco, i.tipo as imovel_tipo,
            c.status, c.data_cadastro
        FROM Contratos c
        LEFT JOIN Imoveis i ON c.id_imovel = i.id
        WHERE c.id_locatario = ?
        ORDER BY c.data_cadastro DESC
    """, (locatario_id,))
    
    contratos = []
    for row in cursor.fetchall():
        contratos.append({
            "id": row[0],
            "data_inicio": row[1].isoformat() if row[1] else None,
            "data_fim": row[2].isoformat() if row[2] else None,
            "valor_aluguel": float(row[3]) if row[3] else 0,
            "imovel_endereco": row[4] or "",
            "imovel_tipo": row[5] or "",
            "status": row[6] or "ATIVO",
            "data_cadastro": row[7].isoformat() if row[7] else None
        })
    
    return {
        "success": True,
        "data": {
            "entidade": "locatario",
            "dados_principais": locatario,
            "vinculos": {
                "contratos": contratos
            },
            "historico": [],
            "estatisticas": {
                "total_contratos": len(contratos),
                "contratos_ativos": len([c for c in contratos if c['status'] == 'ATIVO']),
                "valor_medio_aluguel": sum(c['valor_aluguel'] for c in contratos) / len(contratos) if contratos else 0
            }
        }
    }

async def _get_complete_imovel_data(cursor, imovel_id: int) -> Dict[str, Any]:
    """Busca dados completos do imóvel"""
    
    # Dados principais do imóvel
    cursor.execute("""
        SELECT 
            i.id, i.endereco, i.tipo, i.valor_aluguel, i.status, 
            i.quartos, i.banheiros, i.vagas_garagem, i.metragem_total,
            i.ativo, i.data_cadastro, i.id_locador,
            c.nome as locador_nome
        FROM Imoveis i 
        LEFT JOIN Clientes c ON i.id_locador = c.id
        WHERE i.id = ?
    """, (imovel_id,))
    
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Imóvel não encontrado")
    
    imovel = {
        "id": row[0],
        "endereco": row[1] or "",
        "tipo": row[2] or "Casa",
        "valor_aluguel": float(row[3]) if row[3] else 0,
        "status": row[4] or "DISPONIVEL",
        "quartos": row[5] or 0,
        "banheiros": row[6] or 0,
        "vagas_garagem": row[7] or 0,
        "area_total": float(row[8]) if row[8] else 0,
        "ativo": row[9],
        "data_cadastro": row[10].isoformat() if row[10] else None,
        "id_locador": row[11],
        "locador_nome": row[12] or "Não informado"
    }
    
    # Contratos do imóvel
    cursor.execute("""
        SELECT 
            c.id, c.data_inicio, c.data_fim, c.valor_aluguel,
            l.nome as locatario_nome,
            c.status, c.data_cadastro
        FROM Contratos c
        LEFT JOIN Locatarios l ON c.id_locatario = l.id
        WHERE c.id_imovel = ?
        ORDER BY c.data_cadastro DESC
    """, (imovel_id,))
    
    contratos = []
    for row in cursor.fetchall():
        contratos.append({
            "id": row[0],
            "data_inicio": row[1].isoformat() if row[1] else None,
            "data_fim": row[2].isoformat() if row[2] else None,
            "valor_aluguel": float(row[3]) if row[3] else 0,
            "locatario_nome": row[4] or "Não informado",
            "status": row[5] or "ATIVO",
            "data_cadastro": row[6].isoformat() if row[6] else None
        })
    
    return {
        "success": True,
        "data": {
            "entidade": "imovel",
            "dados_principais": imovel,
            "vinculos": {
                "contratos": contratos
            },
            "historico": [],
            "estatisticas": {
                "total_contratos": len(contratos),
                "contratos_ativos": len([c for c in contratos if c['status'] == 'ATIVO']),
                "ocupado": len([c for c in contratos if c['status'] == 'ATIVO']) > 0
            }
        }
    }

async def _get_complete_contrato_data(cursor, contrato_id: int) -> Dict[str, Any]:
    """Busca dados completos do contrato"""
    
    # Dados principais do contrato
    cursor.execute("""
        SELECT 
            c.id, c.data_inicio, c.data_fim, c.valor_aluguel,
            c.id_imovel, c.id_locatario, c.status, c.data_cadastro,
            i.endereco as imovel_endereco, i.tipo as imovel_tipo,
            l.nome as locatario_nome,
            cl.nome as locador_nome
        FROM Contratos c
        LEFT JOIN Imoveis i ON c.id_imovel = i.id
        LEFT JOIN Locatarios l ON c.id_locatario = l.id
        LEFT JOIN Clientes cl ON i.id_locador = cl.id
        WHERE c.id = ?
    """, (contrato_id,))
    
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Contrato não encontrado")
    
    contrato = {
        "id": row[0],
        "data_inicio": row[1].isoformat() if row[1] else None,
        "data_fim": row[2].isoformat() if row[2] else None,
        "valor_aluguel": float(row[3]) if row[3] else 0,
        "id_imovel": row[4],
        "id_locatario": row[5],
        "status": row[6] or "ATIVO",
        "data_cadastro": row[7].isoformat() if row[7] else None,
        "imovel_endereco": row[8] or "",
        "imovel_tipo": row[9] or "",
        "locatario_nome": row[10] or "Não informado",
        "locador_nome": row[11] or "Não informado"
    }
    
    return {
        "success": True,
        "data": {
            "entidade": "contrato",
            "dados_principais": contrato,
            "vinculos": {},
            "historico": [],
            "estatisticas": {}
        }
    }

@router.get("/api/search/enhanced/timeline/{entity_type}/{entity_id}")
async def get_entity_timeline(entity_type: str, entity_id: int) -> Dict[str, Any]:
    """Busca timeline de eventos de uma entidade"""
    
    # Timeline simulada - em produção seria uma tabela de auditoria
    timeline = [
        {
            "id": 1,
            "data": "2024-01-15T10:00:00",
            "tipo": "CADASTRO",
            "descricao": f"{entity_type.title()} cadastrado no sistema",
            "usuario": "Sistema",
            "detalhes": "Cadastro inicial"
        },
        {
            "id": 2,
            "data": "2024-02-10T14:30:00",
            "tipo": "ATUALIZACAO",
            "descricao": "Dados atualizados",
            "usuario": "Admin",
            "detalhes": "Atualização de dados de contato"
        },
        {
            "id": 3,
            "data": "2024-03-05T09:15:00",
            "tipo": "VINCULO",
            "descricao": "Nova relação estabelecida",
            "usuario": "Sistema",
            "detalhes": "Vínculo criado automaticamente"
        }
    ]
    
    return {
        "success": True,
        "data": {
            "entity_type": entity_type,
            "entity_id": entity_id,
            "timeline": timeline,
            "total_events": len(timeline)
        }
    }