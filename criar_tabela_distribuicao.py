#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()

def get_conexao():
    """Conexão com banco de dados"""
    conn_str = f'DRIVER={{{os.getenv("DB_DRIVER")}}};SERVER={os.getenv("DB_SERVER")};DATABASE={os.getenv("DB_DATABASE")};UID={os.getenv("DB_USER")};PWD={os.getenv("DB_PASSWORD")};Encrypt={os.getenv("DB_ENCRYPT", "yes")};TrustServerCertificate={os.getenv("DB_TRUST_CERT", "yes")}'
    return pyodbc.connect(conn_str)

def criar_tabela_distribuicao():
    """Cria a tabela DistribuicaoRepasseLocadores"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()

        print("Criando tabela DistribuicaoRepasseLocadores...")

        # Verificar se a tabela já existe
        cursor.execute("""
            SELECT COUNT(*)
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_NAME = 'DistribuicaoRepasseLocadores'
        """)

        existe = cursor.fetchone()[0]
        if existe > 0:
            print("OK Tabela ja existe")
            return

        # Criar a tabela
        sql_create = """
        CREATE TABLE DistribuicaoRepasseLocadores (
            id INT IDENTITY(1,1) PRIMARY KEY,
            prestacao_id INT NOT NULL,
            locador_id INT NULL,
            locador_nome NVARCHAR(255) NOT NULL,
            percentual_participacao DECIMAL(5,2) DEFAULT 100.00,
            valor_repasse DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            responsabilidade_principal BIT DEFAULT 0,
            data_criacao DATETIME DEFAULT GETDATE(),
            data_atualizacao DATETIME NULL,
            ativo BIT DEFAULT 1
        )
        """

        # Criar a tabela base
        cursor.execute(sql_create)
        print("OK Tabela base criada...")

        # Adicionar Foreign Key separadamente
        cursor.execute("""
            ALTER TABLE DistribuicaoRepasseLocadores
            ADD CONSTRAINT FK_DistribuicaoRepasseLocadores_PrestacaoId
            FOREIGN KEY (prestacao_id) REFERENCES PrestacaoContas(id)
        """)
        print("OK Foreign Key criada...")

        # Criar índices separadamente
        cursor.execute("""
            CREATE INDEX IX_DistribuicaoRepasseLocadores_PrestacaoId
            ON DistribuicaoRepasseLocadores (prestacao_id)
        """)

        cursor.execute("""
            CREATE INDEX IX_DistribuicaoRepasseLocadores_LocadorId
            ON DistribuicaoRepasseLocadores (locador_id)
        """)

        cursor.execute("""
            CREATE INDEX IX_DistribuicaoRepasseLocadores_Ativo
            ON DistribuicaoRepasseLocadores (ativo)
        """)

        cursor.execute("""
            CREATE INDEX IX_DistribuicaoRepasseLocadores_PrestacaoAtivo
            ON DistribuicaoRepasseLocadores (prestacao_id, ativo)
        """)
        print("OK Indices criados...")
        conn.commit()
        print("OK Tabela DistribuicaoRepasseLocadores criada com sucesso!")

        conn.close()

    except Exception as e:
        print(f"ERRO ao criar tabela: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    criar_tabela_distribuicao()