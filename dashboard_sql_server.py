"""
Funções do Dashboard adaptadas para o SQL Server real
"""
import pyodbc
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

def conectar_db():
    """Conecta ao SQL Server usando as configurações do .env"""
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    return pyodbc.connect(connection_string)

def obter_metricas_dashboard():
    """Obter métricas principais do dashboard"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    try:
        # Total de contratos
        cursor.execute("SELECT COUNT(*) FROM Contratos")
        total_contratos = cursor.fetchone()[0] or 0
        
        # Contratos ativos (data_fim >= hoje)
        cursor.execute("SELECT COUNT(*) FROM Contratos WHERE data_fim >= GETDATE()")
        contratos_ativos = cursor.fetchone()[0] or 0
        
        # Total de clientes (locadores + locatários)
        cursor.execute("SELECT COUNT(*) FROM Locadores")
        total_locadores = cursor.fetchone()[0] or 0
        cursor.execute("SELECT COUNT(*) FROM Locatarios")
        total_locatarios = cursor.fetchone()[0] or 0
        total_clientes = total_locadores + total_locatarios
        
        # Receita mensal (soma dos valores de aluguel dos contratos ativos)
        cursor.execute("""
            SELECT SUM(i.valor_aluguel) 
            FROM Contratos c
            JOIN Imoveis i ON c.id_imovel = i.id
            WHERE c.data_fim >= GETDATE()
        """)
        result = cursor.fetchone()[0]
        receita_mensal = float(result) if result else 0.0
        
        # Calcular crescimento (placeholder por enquanto)
        crescimento_percentual = 12.5
        
        # Novos clientes este mês (simplificado)
        novos_clientes_mes = 2
        
        return {
            "total_contratos": total_contratos,
            "contratos_ativos": contratos_ativos,
            "receita_mensal": receita_mensal,
            "crescimento_percentual": crescimento_percentual,
            "total_clientes": total_clientes,
            "novos_clientes_mes": novos_clientes_mes
        }
    except Exception as e:
        print(f"Erro em métricas: {e}")
        # Retornar valores padrão em caso de erro
        return {
            "total_contratos": 0,
            "contratos_ativos": 0,
            "receita_mensal": 0.0,
            "crescimento_percentual": 0,
            "total_clientes": 0,
            "novos_clientes_mes": 0
        }
    finally:
        conn.close()

def obter_ocupacao_dashboard():
    """Obter dados de ocupação dos imóveis"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    try:
        # Total de imóveis
        cursor.execute("SELECT COUNT(*) FROM Imoveis")
        unidades_totais = cursor.fetchone()[0] or 0
        
        # Imóveis ocupados (com contratos ativos)
        cursor.execute("""
            SELECT COUNT(DISTINCT i.id) 
            FROM Imoveis i 
            JOIN Contratos c ON i.id = c.id_imovel 
            WHERE c.data_fim >= GETDATE()
        """)
        unidades_ocupadas = cursor.fetchone()[0] or 0
        
        unidades_disponiveis = unidades_totais - unidades_ocupadas
        taxa_ocupacao = (unidades_ocupadas / unidades_totais * 100) if unidades_totais > 0 else 0
        
        # Ocupação por tipo de imóvel
        cursor.execute("""
            SELECT 
                i.tipo,
                COUNT(*) as total,
                SUM(CASE WHEN c.data_fim >= GETDATE() THEN 1 ELSE 0 END) as ocupadas
            FROM Imoveis i
            LEFT JOIN Contratos c ON i.id = c.id_imovel
            GROUP BY i.tipo
        """)
        ocupacao_por_tipo = []
        for row in cursor.fetchall():
            tipo, total, ocupadas = row
            ocupadas = ocupadas or 0
            percentual = (ocupadas / total * 100) if total > 0 else 0
            ocupacao_por_tipo.append({
                "tipo": tipo or "Outros",
                "total": total,
                "ocupadas": ocupadas,
                "percentual": round(percentual, 1)
            })
        
        return {
            "taxa_ocupacao": round(taxa_ocupacao, 1),
            "unidades_ocupadas": unidades_ocupadas,
            "unidades_totais": unidades_totais,
            "unidades_disponiveis": unidades_disponiveis,
            "ocupacao_por_tipo": ocupacao_por_tipo
        }
    except Exception as e:
        print(f"Erro em ocupação: {e}")
        return {
            "taxa_ocupacao": 0,
            "unidades_ocupadas": 0,
            "unidades_totais": 0,
            "unidades_disponiveis": 0,
            "ocupacao_por_tipo": []
        }
    finally:
        conn.close()

def obter_vencimentos_dashboard(dias=30):
    """Obter contratos próximos ao vencimento"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    try:
        data_limite = datetime.now() + timedelta(days=dias)
        
        cursor.execute("""
            SELECT 
                c.id,
                l.nome as cliente_nome,
                CAST(c.id as NVARCHAR(10)) as contrato_numero,
                c.data_fim as data_vencimento,
                i.valor_aluguel as valor,
                DATEDIFF(day, GETDATE(), c.data_fim) as dias_para_vencer
            FROM Contratos c
            JOIN Locatarios l ON c.id_locatario = l.id
            JOIN Imoveis i ON c.id_imovel = i.id
            WHERE c.data_fim BETWEEN GETDATE() AND ?
            ORDER BY c.data_fim ASC
        """, (data_limite,))
        
        vencimentos = []
        for row in cursor.fetchall():
            id_contrato, cliente_nome, contrato_numero, data_vencimento, valor, dias_para_vencer = row
            vencimentos.append({
                "id": id_contrato,
                "cliente_nome": cliente_nome,
                "contrato_numero": f"CT-{id_contrato:04d}",
                "data_vencimento": data_vencimento.strftime('%Y-%m-%d') if data_vencimento else "",
                "valor": float(valor) if valor else 0.0,
                "dias_para_vencer": int(dias_para_vencer) if dias_para_vencer else 0,
                "status": "proximo" if dias_para_vencer <= 30 else "normal"
            })
        
        return vencimentos
    except Exception as e:
        print(f"Erro em vencimentos: {e}")
        return []
    finally:
        conn.close()

def obter_alertas_dashboard():
    """Obter alertas do sistema"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    alertas = []
    
    try:
        # Verificar imóveis disponíveis
        cursor.execute("""
            SELECT COUNT(*) FROM Imoveis i
            WHERE NOT EXISTS (
                SELECT 1 FROM Contratos c 
                WHERE c.id_imovel = i.id AND c.data_fim >= GETDATE()
            )
        """)
        imoveis_disponiveis = cursor.fetchone()[0] or 0
        
        if imoveis_disponiveis > 0:
            alertas.append({
                "id": 1,
                "tipo": "imovel",
                "titulo": "Imóveis disponíveis",
                "descricao": f"{imoveis_disponiveis} imóvel(is) disponível(is) para locação",
                "severidade": "BAIXO",
                "data_criacao": datetime.now().isoformat(),
                "ativo": True
            })
        
        # Verificar contratos vencendo em 30 dias
        cursor.execute("""
            SELECT COUNT(*) FROM Contratos c
            WHERE c.data_fim BETWEEN GETDATE() AND DATEADD(day, 30, GETDATE())
        """)
        contratos_vencendo = cursor.fetchone()[0] or 0
        
        if contratos_vencendo > 0:
            alertas.append({
                "id": 2,
                "tipo": "contrato",
                "titulo": "Contratos próximos ao vencimento",
                "descricao": f"{contratos_vencendo} contrato(s) vencem nos próximos 30 dias",
                "severidade": "MEDIO",
                "data_criacao": datetime.now().isoformat(),
                "ativo": True
            })
        
        # Verificar contratos vencidos
        cursor.execute("""
            SELECT COUNT(*) FROM Contratos c
            WHERE c.data_fim < GETDATE()
        """)
        contratos_vencidos = cursor.fetchone()[0] or 0
        
        if contratos_vencidos > 0:
            alertas.append({
                "id": 3,
                "tipo": "contrato",
                "titulo": "Contratos vencidos",
                "descricao": f"{contratos_vencidos} contrato(s) já venceram",
                "severidade": "ALTO",
                "data_criacao": datetime.now().isoformat(),
                "ativo": True
            })
        
        return alertas
    except Exception as e:
        print(f"Erro em alertas: {e}")
        return []
    finally:
        conn.close()

# Testar conexão
if __name__ == "__main__":
    print("Testando funções do dashboard...")
    
    print("\nMétricas:")
    print(obter_metricas_dashboard())
    
    print("\nOcupação:")
    print(obter_ocupacao_dashboard())
    
    print("\nVencimentos:")
    print(obter_vencimentos_dashboard())
    
    print("\nAlertas:")
    print(obter_alertas_dashboard())