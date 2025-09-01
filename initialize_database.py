import sqlite3
import os

def initialize_database():
    """Inicializa o banco de dados com as tabelas necessárias"""
    
    # Cria o diretório database se não existir
    if not os.path.exists('database'):
        os.makedirs('database')
    
    # Conecta ao banco de dados
    conn = sqlite3.connect('database/database.db')
    cursor = conn.cursor()
    
    # Cria as tabelas principais
    
    # Tabela de locadores
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS locadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf_cnpj TEXT UNIQUE,
        rg TEXT,
        telefone TEXT,
        email TEXT,
        data_nascimento DATE,
        estado_civil TEXT,
        profissao TEXT,
        endereco TEXT,
        endereco_rua TEXT,
        endereco_numero TEXT,
        endereco_complemento TEXT,
        endereco_bairro TEXT,
        endereco_cidade TEXT,
        endereco_estado TEXT,
        endereco_cep TEXT,
        banco TEXT,
        agencia TEXT,
        conta TEXT,
        tipo_conta TEXT,
        pix_chave TEXT,
        tipo_recebimento TEXT DEFAULT 'PIX',
        taxa_administracao REAL DEFAULT 0.00,
        ativo INTEGER DEFAULT 1,
        observacoes TEXT,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Tabela de locatários
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS locatarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf_cnpj TEXT UNIQUE,
        rg TEXT,
        telefone TEXT,
        email TEXT,
        data_nascimento DATE,
        estado_civil TEXT,
        profissao TEXT,
        endereco TEXT,
        endereco_rua TEXT,
        endereco_numero TEXT,
        endereco_complemento TEXT,
        endereco_bairro TEXT,
        endereco_cidade TEXT,
        endereco_estado TEXT,
        endereco_cep TEXT,
        empresa TEXT,
        renda_mensal REAL,
        ativo INTEGER DEFAULT 1,
        observacoes TEXT,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Tabela de imóveis
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS imoveis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_locador INTEGER,
        tipo_imovel TEXT,
        endereco TEXT,
        endereco_rua TEXT,
        endereco_numero TEXT,
        endereco_complemento TEXT,
        endereco_bairro TEXT,
        endereco_cidade TEXT,
        endereco_estado TEXT,
        endereco_cep TEXT,
        area_total REAL,
        area_construida REAL,
        quartos INTEGER,
        banheiros INTEGER,
        vagas_garagem INTEGER,
        mobiliado INTEGER DEFAULT 0,
        valor_aluguel REAL,
        valor_iptu REAL,
        valor_condominio REAL,
        status TEXT DEFAULT 'disponivel',
        observacoes TEXT,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_locador) REFERENCES locadores(id)
    )
    ''')
    
    # Tabela de contratos
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS contratos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_contrato TEXT UNIQUE,
        id_imovel INTEGER,
        id_inquilino INTEGER,
        data_inicio DATE,
        data_fim DATE,
        data_entrega_chaves DATE,
        periodo_contrato INTEGER DEFAULT 12,
        taxa_administracao REAL DEFAULT 0,
        fundo_conservacao REAL DEFAULT 0,
        tipo_reajuste TEXT,
        percentual_reajuste REAL DEFAULT 0,
        vencimento_dia INTEGER,
        renovacao_automatica INTEGER DEFAULT 0,
        seguro_obrigatorio INTEGER DEFAULT 0,
        clausulas_adicionais TEXT,
        tipo_plano_locacao TEXT,
        valores_contrato TEXT,
        data_vigencia_segfianca DATE,
        data_vigencia_segincendio DATE,
        data_assinatura DATE,
        ultimo_reajuste DATE,
        proximo_reajuste DATE,
        antecipacao_encargos INTEGER DEFAULT 0,
        aluguel_garantido INTEGER DEFAULT 0,
        mes_de_referencia TEXT,
        tipo_garantia TEXT,
        bonificacao REAL DEFAULT 0,
        retidos TEXT,
        info_garantias TEXT,
        deseja_fci TEXT DEFAULT 'Não',
        deseja_seguro_fianca TEXT DEFAULT 'Não',
        deseja_seguro_incendio TEXT DEFAULT 'Não',
        valor_aluguel REAL DEFAULT 0,
        valor_iptu REAL DEFAULT 0,
        valor_condominio REAL DEFAULT 0,
        valor_fci REAL DEFAULT 0,
        valor_seguro_fianca REAL DEFAULT 0,
        valor_seguro_incendio REAL DEFAULT 0,
        tempo_renovacao INTEGER DEFAULT 12,
        tempo_reajuste INTEGER DEFAULT 12,
        indice_reajuste TEXT DEFAULT 'IPCA',
        proximo_reajuste_automatico INTEGER DEFAULT 0,
        tem_corretor INTEGER DEFAULT 0,
        dados_bancarios_corretor TEXT,
        retido_fci INTEGER DEFAULT 0,
        retido_iptu INTEGER DEFAULT 0,
        retido_condominio INTEGER DEFAULT 0,
        retido_seguro_fianca INTEGER DEFAULT 0,
        retido_seguro_incendio INTEGER DEFAULT 0,
        antecipa_condominio INTEGER DEFAULT 0,
        antecipa_seguro_fianca INTEGER DEFAULT 0,
        antecipa_seguro_incendio INTEGER DEFAULT 0,
        seguro_fianca_inicio DATE,
        seguro_fianca_fim DATE,
        seguro_incendio_inicio DATE,
        seguro_incendio_fim DATE,
        quantidade_pets INTEGER DEFAULT 0,
        pets TEXT,
        fiadores TEXT,
        caucao TEXT,
        titulo_capitalizacao TEXT,
        apolice_seguro_fianca TEXT,
        endereco_imovel TEXT,
        nome_inquilino TEXT,
        nome_locador TEXT,
        status TEXT DEFAULT 'ativo',
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_imovel) REFERENCES imoveis(id),
        FOREIGN KEY (id_inquilino) REFERENCES locatarios(id)
    )
    ''')
    
    # Tabela de prestação de contas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS prestacao_contas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_contrato INTEGER,
        competencia TEXT,
        data_vencimento DATE,
        data_pagamento DATE,
        valor_aluguel REAL,
        valor_iptu REAL,
        valor_condominio REAL,
        valor_agua REAL,
        valor_luz REAL,
        valor_gas REAL,
        valor_internet REAL,
        valor_manutencao REAL,
        valor_outros REAL,
        total_creditos REAL,
        total_debitos REAL,
        saldo REAL,
        status TEXT DEFAULT 'pendente',
        observacoes TEXT,
        arquivo_comprovante TEXT,
        data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
        data_ultima_atualizacao DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_contrato) REFERENCES contratos(id)
    )
    ''')
    
    # Tabela de timeline_events
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS timeline_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER,
        event_date DATE NOT NULL,
        event_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contract_id) REFERENCES contratos(id)
    )
    ''')
    
    # Tabela de formas de pagamento
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        locador_id INTEGER,
        type TEXT NOT NULL,
        bank_name TEXT,
        agency TEXT,
        account_number TEXT,
        account_type TEXT,
        pix_key TEXT,
        pix_key_type TEXT,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (locador_id) REFERENCES locadores(id)
    )
    ''')
    
    # Tabela de contas bancárias múltiplas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS bank_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        locador_id INTEGER,
        bank_name TEXT NOT NULL,
        agency TEXT NOT NULL,
        account_number TEXT NOT NULL,
        account_type TEXT NOT NULL,
        account_holder TEXT,
        pix_key TEXT,
        pix_key_type TEXT,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (locador_id) REFERENCES locadores(id)
    )
    ''')
    
    # Tabela de contrato_locadores
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS contrato_locadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contrato_id INTEGER NOT NULL,
        locador_id INTEGER NOT NULL,
        percentual_participacao REAL DEFAULT 100,
        valor_recebimento REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contrato_id) REFERENCES contratos(id),
        FOREIGN KEY (locador_id) REFERENCES locadores(id)
    )
    ''')
    
    # Tabela de contrato_locatarios
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS contrato_locatarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contrato_id INTEGER NOT NULL,
        locatario_id INTEGER NOT NULL,
        is_primary INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contrato_id) REFERENCES contratos(id),
        FOREIGN KEY (locatario_id) REFERENCES locatarios(id)
    )
    ''')
    
    # Commit das alterações
    conn.commit()
    
    # Verifica as tabelas criadas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print("Banco de dados inicializado com sucesso!")
    print(f"Tabelas criadas: {[t[0] for t in tables]}")
    
    # Fecha a conexão
    conn.close()
    
    return True

if __name__ == "__main__":
    initialize_database()