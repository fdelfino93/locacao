#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import pyodbc
import sys
import os

def get_connection():
    try:
        connection_string = (
            "DRIVER={ODBC Driver 17 for SQL Server};"
            "SERVER=.;"
            "DATABASE=locacao;"
            "Trusted_Connection=yes;"
        )
        conn = pyodbc.connect(connection_string)
        return conn
    except Exception as e:
        print(f"Erro ao conectar: {e}")
        return None

def criar_tabelas_multiplos():
    """Cria as tabelas para múltiplos locadores e locatários"""
    try:
        conn = get_connection()
        if not conn:
            return False
            
        cursor = conn.cursor()
        
        # Criar tabela ContratoLocadores
        print("Criando tabela ContratoLocadores...")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ContratoLocadores')
            BEGIN
                CREATE TABLE ContratoLocadores (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    contrato_id INT NOT NULL,
                    locador_id INT NOT NULL,
                    conta_bancaria_id INT NULL,
                    porcentagem DECIMAL(5,2) DEFAULT 100.00,
                    responsabilidade_principal BIT DEFAULT 0,
                    data_entrada DATE NULL,
                    data_saida DATE NULL,
                    observacoes TEXT NULL,
                    ativo BIT DEFAULT 1,
                    data_criacao DATETIME2 DEFAULT GETDATE(),
                    data_atualizacao DATETIME2 DEFAULT GETDATE(),
                    
                    CONSTRAINT FK_ContratoLocadores_Contrato 
                        FOREIGN KEY (contrato_id) REFERENCES Contratos(id) ON DELETE CASCADE,
                    CONSTRAINT FK_ContratoLocadores_Locador 
                        FOREIGN KEY (locador_id) REFERENCES Locadores(id),
                    CONSTRAINT UC_ContratoLocadores_Unico 
                        UNIQUE (contrato_id, locador_id),
                    CONSTRAINT CK_ContratoLocadores_Percentual 
                        CHECK (porcentagem > 0 AND porcentagem <= 100)
                );
                PRINT 'Tabela ContratoLocadores criada';
            END
            ELSE
            BEGIN
                PRINT 'Tabela ContratoLocadores ja existe';
            END
        """)
        conn.commit()
        
        # Criar tabela ContratoLocatarios
        print("Criando tabela ContratoLocatarios...")
        cursor.execute("""
            IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ContratoLocatarios')
            BEGIN
                CREATE TABLE ContratoLocatarios (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    contrato_id INT NOT NULL,
                    locatario_id INT NOT NULL,
                    responsabilidade_principal BIT DEFAULT 0,
                    percentual_responsabilidade DECIMAL(5,2) DEFAULT 100.00,
                    data_entrada DATE NULL,
                    data_saida DATE NULL,
                    observacoes TEXT NULL,
                    ativo BIT DEFAULT 1,
                    data_criacao DATETIME2 DEFAULT GETDATE(),
                    data_atualizacao DATETIME2 DEFAULT GETDATE(),
                    
                    CONSTRAINT FK_ContratoLocatarios_Contrato 
                        FOREIGN KEY (contrato_id) REFERENCES Contratos(id) ON DELETE CASCADE,
                    CONSTRAINT FK_ContratoLocatarios_Locatario 
                        FOREIGN KEY (locatario_id) REFERENCES Locatarios(id),
                    CONSTRAINT UC_ContratoLocatarios_Unico 
                        UNIQUE (contrato_id, locatario_id),
                    CONSTRAINT CK_ContratoLocatarios_Percentual 
                        CHECK (percentual_responsabilidade > 0 AND percentual_responsabilidade <= 100)
                );
                PRINT 'Tabela ContratoLocatarios criada';
            END
            ELSE
            BEGIN
                PRINT 'Tabela ContratoLocatarios ja existe';
            END
        """)
        conn.commit()
        
        # Migrar dados existentes para ContratoLocadores
        print("Migrando dados existentes para ContratoLocadores...")
        cursor.execute("""
            INSERT INTO ContratoLocadores (contrato_id, locador_id, porcentagem, responsabilidade_principal, ativo)
            SELECT c.id, i.id_locador, 100.00, 1, 1
            FROM Contratos c
            INNER JOIN Imoveis i ON c.id_imovel = i.id
            WHERE i.id_locador IS NOT NULL
            AND NOT EXISTS (
                SELECT 1 FROM ContratoLocadores cl 
                WHERE cl.contrato_id = c.id AND cl.locador_id = i.id_locador
            );
        """)
        conn.commit()
        
        # Migrar dados existentes para ContratoLocatarios  
        print("Migrando dados existentes para ContratoLocatarios...")
        cursor.execute("""
            INSERT INTO ContratoLocatarios (contrato_id, locatario_id, responsabilidade_principal, percentual_responsabilidade, ativo)
            SELECT id, id_locatario, 1, 100.00, 1
            FROM Contratos 
            WHERE id_locatario IS NOT NULL
            AND NOT EXISTS (
                SELECT 1 FROM ContratoLocatarios cl 
                WHERE cl.contrato_id = Contratos.id AND cl.locatario_id = Contratos.id_locatario
            );
        """)
        conn.commit()
        
        cursor.close()
        conn.close()
        
        print("Tabelas criadas e dados migrados com sucesso!")
        return True
        
    except Exception as e:
        print(f"Erro: {e}")
        return False

def verificar_tabelas():
    """Verifica se as tabelas foram criadas"""
    try:
        conn = get_connection()
        if not conn:
            return False
            
        cursor = conn.cursor()
        
        tabelas = ['ContratoLocadores', 'ContratoLocatarios']
        
        for tabela in tabelas:
            cursor.execute("""
                SELECT COUNT(*) 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_NAME = ?
            """, (tabela,))
            
            result = cursor.fetchone()
            if result and result[0] > 0:
                cursor.execute(f"SELECT COUNT(*) FROM {tabela}")
                count = cursor.fetchone()[0]
                print(f"Tabela {tabela}: {count} registros")
            else:
                print(f"Tabela {tabela}: NAO EXISTE")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print(f"Erro ao verificar: {e}")
        return False

if __name__ == "__main__":
    print("Criando tabelas para multiplos locadores/locatarios...")
    
    if criar_tabelas_multiplos():
        print("\nVerificando resultado:")
        verificar_tabelas()
        print("\nPROCESSO CONCLUIDO!")
    else:
        print("FALHA!")
        sys.exit(1)