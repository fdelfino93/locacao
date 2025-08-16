import pyodbc
import os
import json
from dotenv import load_dotenv

load_dotenv()

try:
    connection_string = (
        f"DRIVER={{{os.getenv('DB_DRIVER')}}};"
        f"SERVER={os.getenv('DB_SERVER')};"
        f"DATABASE={os.getenv('DB_DATABASE')};"
        f"UID={os.getenv('DB_USER')};"
        f"PWD={os.getenv('DB_PASSWORD')}"
    )
    conn = pyodbc.connect(connection_string)
    print('Conexao com banco estabelecida com sucesso!')
    
    cursor = conn.cursor()
    
    # Buscar todos os locadores
    print('\n=== LOCADORES ===')
    cursor.execute("SELECT TOP 10 * FROM Clientes WHERE tipo_cliente = 'Locador'")
    locadores_rows = cursor.fetchall()
    locadores = []
    for row in locadores_rows:
        locador = {
            "id": row[0],
            "nome": row[1], 
            "cpf_cnpj": row[2] or "",
            "telefone": row[3] or "",
            "email": row[4] or "",
            "endereco": row[5] or "",
            "ativo": row[13] if len(row) > 13 else True
        }
        locadores.append(locador)
        print(f'  - ID: {locador["id"]}, Nome: {locador["nome"]}, Telefone: {locador["telefone"]}')
    
    # Buscar todos os locatários  
    print('\n=== LOCATARIOS ===')
    cursor.execute("SELECT TOP 10 * FROM Clientes WHERE tipo_cliente = 'Locatario'")
    locatarios_rows = cursor.fetchall()
    locatarios = []
    for row in locatarios_rows:
        locatario = {
            "id": row[0],
            "nome": row[1],
            "cpf_cnpj": row[2] or "",
            "telefone": row[3] or "",
            "email": row[4] or "",
            "endereco": row[5] or "",
            "ativo": row[13] if len(row) > 13 else True
        }
        locatarios.append(locatario)
        print(f'  - ID: {locatario["id"]}, Nome: {locatario["nome"]}, Telefone: {locatario["telefone"]}')
    
    # Buscar todos os imóveis
    print('\n=== IMOVEIS ===')
    cursor.execute("""
        SELECT TOP 10 i.id, i.endereco, i.tipo, i.valor_aluguel, i.status, 
               i.quartos, i.banheiros, i.vagas_garagem, i.metragem_total, 
               i.id_locador, i.ativo, c.nome as locador_nome 
        FROM Imoveis i 
        LEFT JOIN Clientes c ON i.id_locador = c.id 
        WHERE i.ativo = 1
    """)
    imoveis_rows = cursor.fetchall()
    imoveis = []
    for row in imoveis_rows:
        try:
            imovel = {
                "id": row[0],
                "endereco": row[1] or "",
                "tipo": row[2] or "Casa",
                "valor_aluguel": float(row[3]) if row[3] and str(row[3]).replace('.', '').replace(',', '').isdigit() else 0,
                "status": row[4] or "DISPONIVEL",
                "quartos": int(row[5]) if row[5] and str(row[5]).isdigit() else 0,
                "banheiros": int(row[6]) if row[6] and str(row[6]).isdigit() else 0,
                "vagas_garagem": int(row[7]) if row[7] and str(row[7]).isdigit() else 0,
                "area_total": float(row[8]) if row[8] and str(row[8]).replace('.', '').replace(',', '').isdigit() else 0,
                "id_locador": row[9],
                "locador_nome": row[11] if row[11] else "Não informado"
            }
            imoveis.append(imovel)
            print(f'  - ID: {imovel["id"]}, Endereço: {imovel["endereco"]}, Valor: R$ {imovel["valor_aluguel"]}, Locador: {imovel["locador_nome"]}')
        except Exception as e:
            print(f'  - Erro ao processar imóvel ID {row[0]}: {e}')
            continue
    
    # Buscar contratos ativos
    print('\n=== CONTRATOS ===')
    cursor.execute("""
        SELECT TOP 10 c.id, c.data_inicio, c.data_fim, c.valor_aluguel, 
               c.id_imovel, c.id_locatario, i.endereco as imovel_endereco, 
               cl_locador.nome as locador_nome, cl_locatario.nome as locatario_nome
        FROM Contratos c
        LEFT JOIN Imoveis i ON c.id_imovel = i.id
        LEFT JOIN Clientes cl_locador ON i.id_locador = cl_locador.id
        LEFT JOIN Clientes cl_locatario ON c.id_locatario = cl_locatario.id
        WHERE c.data_fim >= GETDATE() OR c.data_fim IS NULL
    """)
    contratos_rows = cursor.fetchall()
    contratos = []
    for row in contratos_rows:
        try:
            contrato = {
                "id": row[0],
                "data_inicio": row[1].isoformat() if hasattr(row[1], 'isoformat') and row[1] else str(row[1]) if row[1] else None,
                "data_fim": row[2].isoformat() if hasattr(row[2], 'isoformat') and row[2] else str(row[2]) if row[2] else None,
                "valor_aluguel": float(row[3]) if row[3] and str(row[3]).replace('.', '').replace(',', '').isdigit() else 0,
                "id_imovel": row[4],
                "id_locatario": row[5],
                "imovel_endereco": row[6] if row[6] else "Não informado",
                "locador_nome": row[7] if row[7] else "Não informado",
                "locatario_nome": row[8] if row[8] else "Não informado",
                "status": "ATIVO"
            }
            contratos.append(contrato)
            print(f'  - ID: {contrato["id"]}, Imóvel: {contrato["imovel_endereco"]}, Locador: {contrato["locador_nome"]}, Locatário: {contrato["locatario_nome"]}, Valor: R$ {contrato["valor_aluguel"]}')
        except Exception as e:
            print(f'  - Erro ao processar contrato ID {row[0]}: {e}')
            continue
    
    # Salvar dados em arquivo JSON para usar no frontend
    dados_completos = {
        "locadores": locadores,
        "locatarios": locatarios,
        "imoveis": imoveis,
        "contratos": contratos
    }
    
    with open('dados_reais_completos.json', 'w', encoding='utf-8') as f:
        json.dump(dados_completos, f, indent=2, ensure_ascii=False)
    
    print(f'\n=== RESUMO ===')
    print(f'Locadores: {len(locadores)}')
    print(f'Locatários: {len(locatarios)}')
    print(f'Imóveis: {len(imoveis)}')
    print(f'Contratos: {len(contratos)}')
    print('\nDados salvos em: dados_reais_completos.json')
    
    conn.close()
    
except Exception as e:
    print(f'Erro na conexao: {e}')
    print('Verifique se:')
    print('  - O arquivo .env existe')
    print('  - As variaveis DB_* estao configuradas')
    print('  - O SQL Server esta rodando')
    print('  - As credenciais estao corretas')