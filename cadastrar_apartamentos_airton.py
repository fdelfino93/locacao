"""
Script para cadastrar os 4 apartamentos que faltam na Rua Cel. Airton Plaisant
- Mesmo dados dos existentes
- Complemento: "Edifício Eloi Plombon 21/22/32/42"
"""

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
        f"PWD={os.getenv('DB_PASSWORD')};"
        f"Encrypt={os.getenv('DB_ENCRYPT')};"
        f"TrustServerCertificate={os.getenv('DB_TRUST_CERT')}"
    )
    return pyodbc.connect(connection_string)

def inserir_apartamento_airton(numero_apartamento):
    """Insere um apartamento na Airton Plaisant com dados base + numero específico"""
    try:
        with get_conexao() as conn:
            cursor = conn.cursor()
            
            # Dados base do Edison Eloi Plombon
            locador_id = 24  # Edison Eloi Plombon
            
            # 1. Inserir endereço primeiro
            complemento = f"Edifício Eloi Plombon {numero_apartamento}"
            cursor.execute("""
                INSERT INTO EnderecoImovel (rua, numero, complemento, bairro, cidade, uf, cep)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                "Rua Cel. Airton Plaisant",
                "239",
                complemento,
                "Santa Quitéria", 
                "Curitiba",
                "PR",
                "82530-240"
            ))
            
            cursor.execute("SELECT @@IDENTITY")
            endereco_id = cursor.fetchone()[0]
            
            # 2. String de endereço
            endereco_string = f"Rua Cel. Airton Plaisant, 239, {complemento} - Santa Quitéria - Curitiba/PR"
            
            # 3. Inserir na tabela Imoveis
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
                locador_id,  # Edison Eloi Plombon
                "Apartamento",
                endereco_string,
                endereco_id,
                100.0,  # Valor igual aos outros
                0,      # iptu
                0,      # condominio
                0,      # taxa_incendio
                "",     # matricula_imovel
                "",     # area_imovel
                False,  # permite_pets
                False,  # aceita_pets
                False,  # mobiliado
                0,      # quartos
                0,      # banheiros
                0,      # vagas_garagem
                "",     # observacoes
                "",     # titular_iptu
                "",     # inscricao_imobiliaria
                "",     # indicacao_fiscal
                "",     # info_iptu
                "",     # nome_condominio
                "",     # sindico_condominio
                "",     # email_condominio
                "",     # telefone_condominio
                "",     # copel_unidade_consumidora
                "",     # sanepar_matricula
                False,  # tem_gas
                "Disponível",  # status
                True    # ativo
            ))
            
            cursor.execute("SELECT @@IDENTITY")
            imovel_id = cursor.fetchone()[0]
            
            # 4. Inserir na tabela ImovelLocadores
            cursor.execute("""
                INSERT INTO ImovelLocadores (imovel_id, locador_id, porcentagem, responsabilidade_principal, ativo)
                VALUES (?, ?, ?, ?, 1)
            """, (
                imovel_id,
                locador_id,
                100.0,
                True
            ))
            
            conn.commit()
            return imovel_id
            
    except Exception as e:
        print(f"ERRO ao inserir apartamento {numero_apartamento}: {e}")
        return False

def cadastrar_apartamentos_faltantes():
    """Cadastra os 4 apartamentos que faltam"""
    print("=" * 60)
    print("CADASTRANDO 4 APARTAMENTOS AIRTON PLAISANT")
    print("=" * 60)
    
    apartamentos = [21, 22, 32, 42]
    sucesso = 0
    
    for numero in apartamentos:
        print(f"\n--- Apartamento Edifício Eloi Plombon {numero} ---")
        print(f"Proprietário: Edison Eloi Plombon")
        print(f"Endereço: Rua Cel. Airton Plaisant, 239")
        print(f"Complemento: Edifício Eloi Plombon {numero}")
        
        resultado = inserir_apartamento_airton(numero)
        
        if resultado:
            print(f"SUCESSO - Apartamento cadastrado (ID: {resultado})")
            sucesso += 1
        else:
            print(f"ERRO - Falha ao cadastrar apartamento {numero}")
    
    print(f"\n" + "=" * 60)
    print("RELATÓRIO FINAL")
    print("=" * 60)
    print(f"Apartamentos cadastrados: {sucesso}/4")
    
    if sucesso == 4:
        print(f"\nTODOS OS 4 APARTAMENTOS FORAM CADASTRADOS!")
    else:
        print(f"\nAlguns apartamentos tiveram erro")

if __name__ == "__main__":
    cadastrar_apartamentos_faltantes()