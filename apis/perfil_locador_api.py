from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import pyodbc
import os
from dotenv import load_dotenv
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
from locacao.repositories.locador_repository_v2 import buscar_locador_completo, listar_locadores, inserir_locador_v2, atualizar_locador, desativar_locador

load_dotenv()

router = APIRouter()

def get_conexao():
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    return pyodbc.connect(connection_string)

@router.get("/api/search/advanced/detalhes/locadores/{locador_id}")
async def obter_detalhes_locador(locador_id: int) -> Dict[str, Any]:
    """Obter detalhes completos de um locador específico usando novo repository"""
    try:
        locador = buscar_locador_completo(locador_id)
        
        if not locador:
            raise HTTPException(status_code=404, detail="Locador não encontrado")
        
        # Formatar dados para compatibilidade com frontend
        resultado = {
            "success": True,
            "data": locador
        }
        
        return resultado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar detalhes: {str(e)}")

@router.post("/api/locadores")
async def criar_locador(dados_locador: Dict[str, Any]) -> Dict[str, Any]:
    """Criar um novo locador usando novo repository"""
    try:
        resultado = inserir_locador_v2(dados_locador)
        return resultado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar locador: {str(e)}")

@router.get("/api/locadores")
async def listar_locadores_api() -> Dict[str, Any]:
    """Listar todos os locadores ativos"""
    try:
        locadores = listar_locadores()
        return {
            "success": True,
            "data": locadores
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar locadores: {str(e)}")

@router.put("/api/locadores/{locador_id}")
async def atualizar_locador_api(locador_id: int, dados_atualizacao: Dict[str, Any]) -> Dict[str, Any]:
    """Atualizar um locador existente"""
    try:
        resultado = atualizar_locador(locador_id, dados_atualizacao)
        return resultado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar locador: {str(e)}")

@router.delete("/api/locadores/{locador_id}")
async def desativar_locador_api(locador_id: int) -> Dict[str, Any]:
    """Desativar um locador"""
    try:
        resultado = desativar_locador(locador_id)
        return resultado
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao desativar locador: {str(e)}")

@router.get("/api/search/advanced/relacionamentos/locadores/{locador_id}")
async def obter_relacionamentos_locador(locador_id: int) -> Dict[str, Any]:
    """Obter relacionamentos de um locador (imóveis e contratos)"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Buscar imóveis do locador
        cursor.execute("""
            SELECT 
                id, endereco, tipo, valor_aluguel, status, 
                quartos, banheiros, vagas_garagem, metragem_total,
                ativo
            FROM Imoveis 
            WHERE id_locador = ? AND ativo = 1
        """, (locador_id,))
        
        imoveis_rows = cursor.fetchall()
        imoveis = []
        for row in imoveis_rows:
            imoveis.append({
                "id": row[0],
                "endereco": row[1],
                "endereco_completo": row[1],
                "tipo": row[2],
                "valor_aluguel": float(row[3]) if row[3] else 0,
                "status": row[4] or "DISPONIVEL",
                "quartos": row[5] or 0,
                "banheiros": row[6] or 0,
                "vagas_garagem": row[7] or 0,
                "area_total": float(row[8]) if row[8] else 0,
                "ativo": row[9]
            })
        
        # Buscar contratos ativos do locador
        cursor.execute("""
            SELECT 
                c.id, c.data_inicio, c.data_fim, c.valor_aluguel,
                i.endereco as imovel_endereco,
                cl.nome as locatario_nome
            FROM Contratos c
            INNER JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN Clientes cl ON c.id_locatario = cl.id
            WHERE i.id_locador = ? 
            AND c.data_fim >= GETDATE()
        """, (locador_id,))
        
        contratos_rows = cursor.fetchall()
        contratos = []
        for row in contratos_rows:
            contratos.append({
                "id": row[0],
                "data_inicio": row[1].isoformat() if row[1] else None,
                "data_fim": row[2].isoformat() if row[2] else None,
                "valor_aluguel": float(row[3]) if row[3] else 0,
                "imovel_endereco": row[4],
                "locatario": row[5] or "Não informado",
                "status": "ATIVO"
            })
        
        conn.close()
        
        return {
            "success": True,
            "relacionamentos": {
                "imoveis": imoveis,
                "contratos_ativos": contratos
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar relacionamentos: {str(e)}")

@router.get("/api/search/advanced/estatisticas/locadores/{locador_id}")
async def obter_estatisticas_locador(locador_id: int) -> Dict[str, Any]:
    """Obter estatísticas de um locador"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Contar imóveis totais
        cursor.execute("SELECT COUNT(*) FROM Imoveis WHERE id_locador = ? AND ativo = 1", (locador_id,))
        total_imoveis = cursor.fetchone()[0]
        
        # Contar imóveis ocupados (com contrato ativo)
        cursor.execute("""
            SELECT COUNT(DISTINCT i.id) 
            FROM Imoveis i
            INNER JOIN Contratos c ON i.id = c.id_imovel
            WHERE i.id_locador = ? AND c.data_fim >= GETDATE() AND i.ativo = 1
        """, (locador_id,))
        imoveis_ocupados = cursor.fetchone()[0]
        
        # Contar contratos ativos
        cursor.execute("""
            SELECT COUNT(*) 
            FROM Contratos c
            INNER JOIN Imoveis i ON c.id_imovel = i.id
            WHERE i.id_locador = ? AND c.data_fim >= GETDATE()
        """, (locador_id,))
        contratos_ativos = cursor.fetchone()[0]
        
        # Calcular receita mensal bruta
        cursor.execute("""
            SELECT SUM(c.valor_aluguel) 
            FROM Contratos c
            INNER JOIN Imoveis i ON c.id_imovel = i.id
            WHERE i.id_locador = ? AND c.data_fim >= GETDATE()
        """, (locador_id,))
        receita_result = cursor.fetchone()[0]
        receita_mensal_bruta = float(receita_result) if receita_result else 0.0
        
        conn.close()
        
        estatisticas = {
            "total_imoveis": total_imoveis,
            "imoveis_ocupados": imoveis_ocupados,
            "imoveis_disponiveis": total_imoveis - imoveis_ocupados,
            "contratos_ativos": contratos_ativos,
            "receita_mensal_bruta": receita_mensal_bruta,
            "receita_mensal_estimada": receita_mensal_bruta,
            "avaliacao_media": 4.8  # Valor fictício - implementar sistema de avaliação
        }
        
        return {
            "success": True,
            "data": estatisticas
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar estatísticas: {str(e)}")

@router.get("/api/search/global")
async def busca_global(q: str = "", limit: int = 10):
    """Busca global por locadores, imóveis e contratos"""
    try:
        if not q or len(q) < 2:
            return {
                "success": False,
                "message": "Termo de busca deve ter pelo menos 2 caracteres"
            }
        
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Buscar locadores
        cursor.execute("""
            SELECT TOP (?) id, nome, cpf_cnpj, telefone, email, ativo
            FROM Clientes 
            WHERE tipo_cliente = 'Locador' 
            AND (nome LIKE ? OR cpf_cnpj LIKE ? OR telefone LIKE ? OR email LIKE ?)
            ORDER BY nome
        """, (limit, f"%{q}%", f"%{q}%", f"%{q}%", f"%{q}%"))
        
        locadores_rows = cursor.fetchall()
        locadores = []
        for row in locadores_rows:
            locadores.append({
                "id": row[0],
                "nome": row[1],
                "cpf_cnpj": row[2],
                "telefone": row[3],
                "email": row[4],
                "ativo": row[5]
            })
        
        # Buscar imóveis
        cursor.execute("""
            SELECT TOP (?) i.id, i.endereco, i.tipo, i.valor_aluguel, i.status, c.nome as locador_nome
            FROM Imoveis i
            LEFT JOIN Clientes c ON i.id_locador = c.id
            WHERE i.ativo = 1 
            AND (i.endereco LIKE ? OR i.tipo LIKE ?)
            ORDER BY i.endereco
        """, (limit, f"%{q}%", f"%{q}%"))
        
        imoveis_rows = cursor.fetchall()
        imoveis = []
        for row in imoveis_rows:
            imoveis.append({
                "id": row[0],
                "endereco": row[1],
                "endereco_completo": row[1],
                "tipo": row[2],
                "valor_aluguel": float(row[3]) if row[3] else 0,
                "status": row[4] or "DISPONIVEL",
                "locador": {"nome": row[5]} if row[5] else {"nome": "Não informado"}
            })
        
        # Buscar contratos
        cursor.execute("""
            SELECT TOP (?) c.id, c.valor_aluguel, i.endereco, cl.nome as locatario_nome, 
                   c.data_inicio, c.data_fim
            FROM Contratos c
            INNER JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN Clientes cl ON c.id_locatario = cl.id
            WHERE c.data_fim >= GETDATE()
            AND (cl.nome LIKE ? OR i.endereco LIKE ?)
            ORDER BY c.data_inicio DESC
        """, (limit, f"%{q}%", f"%{q}%"))
        
        contratos_rows = cursor.fetchall()
        contratos = []
        for row in contratos_rows:
            contratos.append({
                "id": row[0],
                "valor_aluguel": float(row[1]) if row[1] else 0,
                "imovel_endereco": row[2],
                "locatario": row[3] or "Não informado",
                "data_inicio": row[4].isoformat() if row[4] else None,
                "data_fim": row[5].isoformat() if row[5] else None,
                "status": "ATIVO"
            })
        
        conn.close()
        
        total_resultados = len(locadores) + len(imoveis) + len(contratos)
        
        return {
            "success": True,
            "total_resultados": total_resultados,
            "termo_busca": q,
            "data": {
                "resultados_por_tipo": {
                    "locadores": {"dados": locadores},
                    "locatarios": {"dados": []},  # Implementar se necessário
                    "imoveis": {"dados": imoveis},
                    "contratos": {"dados": contratos}
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na busca: {str(e)}")