from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Union, List
from datetime import date
import os
import json
from dotenv import load_dotenv

# Importar repositórios existentes via adapter
from repositories_adapter import (
    inserir_locador, buscar_locadores, atualizar_locador,
    inserir_locatario, buscar_locatarios, atualizar_locatario, buscar_locatario_por_id,
    inserir_imovel, buscar_imoveis, atualizar_imovel,
    inserir_contrato_completo, buscar_contratos, buscar_contratos_por_locador, buscar_contrato_por_id,
    buscar_faturas, buscar_estatisticas_faturas, buscar_fatura_por_id, gerar_boleto_fatura,
    buscar_historico_contrato, registrar_mudanca_contrato, listar_planos_locacao,
    salvar_dados_bancarios_corretor, buscar_dados_bancarios_corretor,
    buscar_contas_bancarias_locador, inserir_conta_bancaria_locador,
    inserir_endereco_locador, buscar_endereco_locador,
    inserir_representante_legal_locador,
    # Novas funções híbridas
    obter_locadores_contrato_unificado, obter_locatarios_contrato_unificado,
    buscar_contratos_ativos,
    # Funções de prestação detalhada
    buscar_prestacao_detalhada, listar_prestacoes_contrato
)

# Importar funções específicas para dashboard
from dashboard_sql_server import (
    obter_metricas_dashboard,
    obter_ocupacao_dashboard,
    obter_vencimentos_dashboard,
    obter_alertas_dashboard
)

# Importar funções de busca
from search_api import (
    buscar_global,
    obter_estatisticas_busca,
    buscar_sugestoes,
    buscar_relacionados
)
from datetime import datetime

load_dotenv()

app = FastAPI(title="Cobimob API", version="1.0.0", description="Sistema de Locações")

# Endpoint de health check
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "API funcionando"}

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", "http://localhost:3001", "http://localhost:3002",
        "http://localhost:3003", "http://localhost:3004", "http://localhost:3005",
        "http://192.168.1.159:3000", "http://192.168.1.159:3001", "http://192.168.1.159:3002",
        "http://192.168.1.159:3003", "http://192.168.1.159:3004", "http://192.168.1.159:3005"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de debug para ver todas as requisições
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"REQUEST: {request.method} {request.url} - Origin: {request.headers.get('origin')}")
    response = await call_next(request)
    print(f"RESPONSE: {response.status_code}")
    return response

# Modelos Pydantic para validação dos dados
class LocadorCreate(BaseModel):
    model_config = {"extra": "allow"}  # Permitir campos extras
    # Campos básicos - obrigatórios para cadastro, opcionais para edição
    nome: Optional[str] = ""
    cpf_cnpj: Optional[str] = ""
    telefone: Optional[str] = ""
    telefones: Optional[List[str]] = []
    email: Optional[str] = ""
    emails: Optional[List[str]] = []
    endereco: Optional[Union[str, dict]] = ""  # Pode ser string ou objeto estruturado
    endereco_estruturado: Optional[dict] = None  # Endereço estruturado
    
    # Campos financeiros
    tipo_recebimento: Optional[str] = "PIX"
    conta_bancaria: Optional[str] = ""
    contas_bancarias: Optional[List[dict]] = []
    deseja_fci: Optional[str] = "Não"
    deseja_seguro_fianca: Optional[str] = "Não" 
    deseja_seguro_incendio: Optional[Union[str, int, bool]] = "Não"
    dados_bancarios_id: Optional[int] = None
    
    # Dados pessoais
    rg: Optional[str] = ""
    nacionalidade: Optional[str] = "Brasileira"
    estado_civil: Optional[str] = "Solteiro"
    profissao: Optional[str] = ""
    data_nascimento: Optional[Union[date, str]] = None
    tipo_cliente: Optional[str] = "Proprietário"
    
    # Campos empresa/PJ
    dados_empresa: Optional[str] = ""
    representante: Optional[str] = ""
    tipo_pessoa: Optional[str] = "PF"
    razao_social: Optional[str] = ""
    nome_fantasia: Optional[str] = ""
    inscricao_estadual: Optional[str] = ""
    inscricao_municipal: Optional[str] = ""
    atividade_principal: Optional[str] = ""
    
    # Campos cônjuge
    existe_conjuge: Optional[Union[int, bool, str]] = None
    nome_conjuge: Optional[str] = None
    cpf_conjuge: Optional[str] = None
    rg_conjuge: Optional[str] = None
    endereco_conjuge: Optional[str] = None
    telefone_conjuge: Optional[str] = None
    regime_bens: Optional[str] = None
    
    # Campos adicionais
    observacoes: Optional[str] = ""
    ativo: Optional[bool] = True
    email_recebimento: Optional[str] = None
    usa_multiplos_metodos: Optional[Union[bool, int, str]] = False
    representante_legal: Optional[dict] = None
    
    # Campos para funcionalidades avançadas
    contas_bancarias: Optional[list] = None
    representante_legal: Optional[dict] = None
    dados_bancarios: Optional[dict] = None
    documentos_empresa: Optional[dict] = None
    
    # Campos de arrays do frontend
    telefones: Optional[list] = None
    emails: Optional[list] = None

class LocadorUpdate(BaseModel):
    model_config = {"extra": "allow"}  # Permitir campos extras
    
    # Campos básicos
    nome: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    telefone: Optional[str] = None
    telefones: Optional[List[str]] = None
    email: Optional[str] = None
    emails: Optional[List[str]] = None
    endereco: Optional[Union[str, dict]] = None
    endereco_estruturado: Optional[dict] = None
    
    # Campos financeiros
    tipo_recebimento: Optional[str] = None
    conta_bancaria: Optional[str] = None
    contas_bancarias: Optional[List[dict]] = None
    deseja_fci: Optional[str] = None
    deseja_seguro_fianca: Optional[str] = None
    deseja_seguro_incendio: Optional[Union[str, int, bool]] = None
    dados_bancarios_id: Optional[int] = None
    
    # Dados pessoais
    rg: Optional[str] = None
    nacionalidade: Optional[str] = None
    estado_civil: Optional[str] = None
    profissao: Optional[str] = None
    data_nascimento: Optional[Union[date, str]] = None
    tipo_cliente: Optional[str] = None
    
    # Campos empresa/PJ
    dados_empresa: Optional[str] = None
    representante: Optional[str] = None
    tipo_pessoa: Optional[str] = None
    razao_social: Optional[str] = None
    nome_fantasia: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    atividade_principal: Optional[str] = None
    
    # Campos cônjuge
    existe_conjuge: Optional[Union[int, bool, str]] = None
    nome_conjuge: Optional[str] = None
    cpf_conjuge: Optional[str] = None
    rg_conjuge: Optional[str] = None
    endereco_conjuge: Optional[str] = None
    telefone_conjuge: Optional[str] = None
    regime_bens: Optional[str] = None
    
    # Campos adicionais
    observacoes: Optional[str] = None
    ativo: Optional[bool] = None
    email_recebimento: Optional[str] = None
    usa_multiplos_metodos: Optional[Union[bool, int, str]] = None
    representante_legal: Optional[dict] = None
    dados_bancarios: Optional[dict] = None

class EnderecoLocatarioInput(BaseModel):
    rua: Optional[str] = ""
    numero: Optional[str] = ""
    complemento: Optional[str] = ""
    bairro: Optional[str] = ""
    cidade: Optional[str] = ""
    estado: Optional[str] = "PR"
    uf: Optional[str] = "PR"  # Alias para compatibilidade
    cep: Optional[str] = ""

class FormaEnvioCobrancaInput(BaseModel):
    tipo: str  # 'email', 'whatsapp', 'imovel'
    contato: str
    observacoes: Optional[str] = ""

class RepresentanteLegalInput(BaseModel):
    # Formato principal (usado pelo frontend e repository)
    nome: Optional[str] = ""
    cpf: Optional[str] = ""
    rg: Optional[str] = ""
    cargo: Optional[str] = ""
    telefone: Optional[str] = ""
    email: Optional[str] = ""
    endereco: Optional[str] = ""  # String para compatibilidade com repository
    
    # Compatibilidade com nomes antigos
    nome_representante: Optional[str] = ""
    cpf_representante: Optional[str] = ""
    rg_representante: Optional[str] = ""
    cargo_representante: Optional[str] = ""
    telefone_representante: Optional[str] = ""
    email_representante: Optional[str] = ""
    endereco_representante: Optional[Union[EnderecoLocatarioInput, str]] = None

class LocatarioCreate(BaseModel):
    model_config = {"extra": "allow"}  # Permitir campos extras
    
    # CAMPOS BÁSICOS OBRIGATÓRIOS
    nome: str
    cpf_cnpj: str
    tipo_pessoa: Optional[str] = "PF"
    
    # MÚLTIPLOS CONTATOS (NOVA FUNCIONALIDADE)
    telefones: Optional[List[str]] = []
    emails: Optional[List[str]] = []
    telefone: Optional[str] = ""  # Compatibilidade - será o primeiro da lista
    email: Optional[str] = ""     # Compatibilidade - será o primeiro da lista
    
    # ENDEREÇO HÍBRIDO (NOVA FUNCIONALIDADE)
    endereco: Optional[EnderecoLocatarioInput] = None  # Endereço estruturado
    endereco_rua: Optional[str] = ""      # Compatibilidade inline
    endereco_numero: Optional[str] = ""   # Compatibilidade inline
    endereco_complemento: Optional[str] = ""
    endereco_bairro: Optional[str] = ""
    endereco_cidade: Optional[str] = ""
    endereco_estado: Optional[str] = ""
    endereco_cep: Optional[str] = ""
    Endereco_inq: Optional[str] = ""      # Campo string original
    
    # FORMAS DE ENVIO DE COBRANÇA (NOVA FUNCIONALIDADE)
    formas_envio_cobranca: Optional[List[FormaEnvioCobrancaInput]] = []
    
    # CAMPOS PESSOA FÍSICA
    rg: Optional[str] = ""
    data_nascimento: Optional[Union[date, str]] = None
    nacionalidade: Optional[str] = "Brasileira"
    estado_civil: Optional[str] = "Solteiro"
    profissao: Optional[str] = ""
    
    # CAMPOS PESSOA JURÍDICA
    razao_social: Optional[str] = ""
    nome_fantasia: Optional[str] = ""
    inscricao_estadual: Optional[str] = ""
    inscricao_municipal: Optional[str] = ""
    atividade_principal: Optional[str] = ""
    data_constituicao: Optional[Union[date, str]] = None
    capital_social: Optional[str] = ""
    porte_empresa: Optional[str] = ""
    regime_tributario: Optional[str] = ""
    
    # REPRESENTANTE LEGAL (PJ)
    representante_legal: Optional[RepresentanteLegalInput] = None
    nome_representante: Optional[str] = ""    # Compatibilidade
    cpf_representante: Optional[str] = ""     # Compatibilidade
    rg_representante: Optional[str] = ""      # Compatibilidade
    cargo_representante: Optional[str] = ""   # Compatibilidade
    telefone_representante: Optional[str] = "" # Telefone do representante
    email_representante: Optional[str] = ""    # Email do representante
    endereco_representante: Optional[EnderecoLocatarioInput] = None  # Endereço do representante
    
    # CÔNJUGE
    possui_conjuge: Optional[bool] = False
    existe_conjuge: Optional[Union[int, bool]] = None  # Compatibilidade
    nome_conjuge: Optional[str] = ""
    cpf_conjuge: Optional[str] = ""
    rg_conjuge: Optional[str] = ""
    endereco_conjuge: Optional[str] = ""
    telefone_conjuge: Optional[str] = ""
    regime_bens: Optional[str] = ""
    
    # CAMPOS DE NEGÓCIO
    tipo_garantia: Optional[str] = ""
    responsavel_pgto_agua: Optional[str] = "Locatario"
    responsavel_pgto_luz: Optional[str] = "Locatario"
    responsavel_pgto_gas: Optional[str] = "Locatario"
    
    # CAMPOS DIVERSOS
    dados_empresa: Optional[str] = ""
    representante: Optional[str] = ""        # Campo legado
    dados_moradores: Optional[str] = ""
    responsavel_inq: Optional[int] = None
    dependentes_inq: Optional[int] = None
    qtd_dependentes_inq: int = 0
    pet_inquilino: Optional[int] = None
    qtd_pet_inquilino: int = 0
    porte_pet: Optional[str] = ""
    observacoes: Optional[str] = ""
    ativo: Optional[bool] = True

class LocatarioUpdate(BaseModel):
    model_config = {"extra": "allow"}  # Permitir campos extras
    
    nome: Optional[str] = None
    cpf_cnpj: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    tipo_pessoa: Optional[str] = None
    rg: Optional[str] = None
    data_nascimento: Optional[date] = None
    nacionalidade: Optional[str] = None
    estado_civil: Optional[str] = None
    profissao: Optional[str] = None
    endereco_rua: Optional[str] = None
    endereco_numero: Optional[str] = None
    endereco_complemento: Optional[str] = None
    endereco_bairro: Optional[str] = None
    endereco_cidade: Optional[str] = None
    endereco_estado: Optional[str] = None
    endereco_cep: Optional[str] = None
    possui_conjuge: Optional[bool] = None
    conjuge_nome: Optional[str] = None
    cpf_conjuge: Optional[str] = None
    nome_conjuge: Optional[str] = None
    rg_conjuge: Optional[str] = None
    endereco_conjuge: Optional[str] = None
    telefone_conjuge: Optional[str] = None
    possui_inquilino_solidario: Optional[bool] = None
    possui_fiador: Optional[bool] = None
    qtd_pets: Optional[int] = None
    observacoes: Optional[str] = None
    ativo: Optional[bool] = None
    responsavel_pgto_agua: Optional[str] = None
    responsavel_pgto_luz: Optional[str] = None
    responsavel_pgto_gas: Optional[str] = None
    dados_empresa: Optional[str] = None
    representante: Optional[str] = None
    tem_fiador: Optional[bool] = None
    tem_moradores: Optional[bool] = None
    data_constituicao: Optional[Union[date, str]] = None
    capital_social: Optional[str] = None
    porte_empresa: Optional[str] = None
    regime_tributario: Optional[str] = None
    representante_legal: Optional[dict] = None
    
    # MÚLTIPLOS CONTATOS - CAMPOS ESSENCIAIS PARA A CORREÇÃO
    telefones: Optional[List[str]] = None
    emails: Optional[List[str]] = None
    
    # FORMAS DE ENVIO DE COBRANÇA
    formas_envio_cobranca: Optional[List[FormaEnvioCobrancaInput]] = None
    
    # DADOS BANCÁRIOS/MÉTODOS DE PAGAMENTO
    metodos_pagamento: Optional[List[dict]] = None
    dados_bancarios: Optional[dict] = None
    
    # ENDEREÇO ESTRUTURADO  
    endereco: Optional[Union[str, dict]] = None
    endereco_estruturado: Optional[dict] = None

class EnderecoImovelInput(BaseModel):
    rua: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cidade: str
    estado: str = "PR"
    cep: Optional[str] = None

class InformacoesIPTUInput(BaseModel):
    titular: Optional[str] = ""
    inscricao_imobiliaria: Optional[str] = ""
    indicacao_fiscal: Optional[str] = ""

class InformacoesCondominioInput(BaseModel):
    nome_condominio: Optional[str] = ""
    sindico_condominio: Optional[str] = ""
    cnpj_condominio: Optional[str] = ""
    email_condominio: Optional[str] = ""
    telefone_condominio: Optional[str] = ""

class DadosGeraisImovelInput(BaseModel):
    quartos: Optional[int] = 0
    suites: Optional[int] = 0
    banheiros: Optional[int] = 0
    salas: Optional[int] = 0
    cozinha: Optional[int] = 0
    tem_garagem: Optional[bool] = False
    qtd_garagem: Optional[int] = None
    tem_sacada: Optional[bool] = False
    qtd_sacada: Optional[int] = None
    tem_churrasqueira: Optional[bool] = False
    qtd_churrasqueira: Optional[int] = None
    mobiliado: Optional[str] = "nao"  # 'sim', 'nao', 'parcialmente'
    permite_pets: Optional[bool] = False

class LocadorImovelInput(BaseModel):
    locador_id: int
    porcentagem: Optional[float] = 100.0
    responsabilidade_principal: Optional[bool] = False

class ImovelCreate(BaseModel):
    # Campos obrigatórios básicos
    id_locador: int
    tipo: str
    endereco: Union[str, EnderecoImovelInput]  # Aceita string OU objeto
    valor_aluguel: float
    
    # Campos opcionais com defaults
    id_locatario: Optional[int] = None
    iptu: Optional[float] = 0
    condominio: Optional[float] = 0
    taxa_incendio: Optional[float] = 0
    status: Optional[str] = "Disponivel"
    matricula_imovel: Optional[str] = ""
    area_imovel: Optional[str] = ""
    dados_imovel: Optional[str] = ""
    permite_pets: Optional[bool] = False
    info_iptu: Optional[str] = ""
    observacoes_condominio: Optional[str] = ""
    copel_unidade_consumidora: Optional[str] = ""
    sanepar_matricula: Optional[str] = ""
    tem_gas: Optional[bool] = False
    info_gas: Optional[str] = ""
    boleto_condominio: Optional[bool] = False
    
    # Campos extras opcionais (não usados no DB atual)
    metragem: Optional[float] = None
    numero_quartos: Optional[int] = None
    numero_banheiros: Optional[int] = None
    numero_vagas: Optional[int] = None
    andar: Optional[int] = None
    mobiliado: Optional[bool] = None
    aceita_animais: Optional[bool] = None
    valor_condominio: Optional[float] = None
    valor_iptu_mensal: Optional[float] = None
    finalidade_imovel: Optional[str] = None
    nome_edificio: Optional[str] = None
    armario_embutido: Optional[int] = 0
    escritorio: Optional[int] = 0
    area_servico: Optional[int] = 0
    
    # Novos campos estruturados
    informacoes_iptu: Optional[InformacoesIPTUInput] = None
    informacoes_condominio: Optional[InformacoesCondominioInput] = None
    dados_gerais: Optional[DadosGeraisImovelInput] = None
    locadores: Optional[List[LocadorImovelInput]] = []

class ImovelUpdate(BaseModel):
    id_locador: Optional[int] = None
    id_locatario: Optional[int] = None
    tipo: Optional[str] = None
    endereco: Optional[Union[str, EnderecoImovelInput]] = None  # Aceita string OU objeto
    valor_aluguel: Optional[float] = None
    iptu: Optional[float] = None
    condominio: Optional[float] = None
    taxa_incendio: Optional[float] = None
    status: Optional[str] = None
    matricula_imovel: Optional[str] = None
    area_imovel: Optional[str] = None
    dados_imovel: Optional[str] = None
    permite_pets: Optional[bool] = None
    # Campos de metragem (nomes corretos do banco)
    metragem_total: Optional[str] = None
    metragem_construida: Optional[str] = None
    area_total: Optional[str] = None
    area_privativa: Optional[str] = None
    # Campos básicos do imóvel
    quartos: Optional[int] = None
    banheiros: Optional[int] = None
    salas: Optional[int] = None
    vagas_garagem: Optional[int] = None
    andar: Optional[int] = None
    mobiliado: Optional[str] = None  # 'nao', 'sim', 'parcial'
    aceita_pets: Optional[bool] = None
    # Campos opcionais extras
    numero_quartos: Optional[int] = None
    numero_banheiros: Optional[int] = None
    numero_vagas: Optional[int] = None
    metragem: Optional[float] = None
    aceita_animais: Optional[bool] = None
    valor_condominio: Optional[float] = None
    valor_iptu_mensal: Optional[float] = None
    finalidade_imovel: Optional[str] = None
    nome_edificio: Optional[str] = None
    armario_embutido: Optional[int] = None
    escritorio: Optional[int] = None
    area_servico: Optional[int] = None
    ativo: Optional[bool] = None
    observacoes: Optional[str] = None
    caracteristicas: Optional[str] = None
    suites: Optional[int] = None
    cozinha: Optional[int] = None
    # ✅ CORREÇÃO: Campos de Encargos IPTU (que estavam faltando)
    titular_iptu: Optional[str] = None
    inscricao_imobiliaria: Optional[str] = None
    indicacao_fiscal: Optional[str] = None
    info_iptu: Optional[str] = None
    # ✅ CORREÇÃO: Campos de Condomínio (que estavam faltando)
    nome_condominio: Optional[str] = None
    sindico_condominio: Optional[str] = None
    cnpj_condominio: Optional[str] = None
    email_condominio: Optional[str] = None
    telefone_condominio: Optional[str] = None
    observacoes_condominio: Optional[str] = None
    boleto_condominio: Optional[bool] = None
    # ✅ CORREÇÃO: Campos de Concessionárias (que estavam faltando)
    copel_unidade_consumidora: Optional[str] = None
    sanepar_matricula: Optional[str] = None
    tem_gas: Optional[bool] = None
    info_gas: Optional[str] = None
    # ✅ CORREÇÃO: Campo para múltiplos locadores (que estava faltando)
    locadores: Optional[List[LocadorImovelInput]] = []

class ContratoCreate(BaseModel):
    # Campos obrigatórios essenciais
    id_imovel: int
    id_locatario: int
    data_inicio: date
    data_fim: date
    valor_aluguel: float
    vencimento_dia: int
    tipo_garantia: str
    
    # Campos opcionais com valores padrão
    taxa_administracao: float = 0.0
    antecipacao_encargos: bool = False
    aluguel_garantido: bool = False
    mes_de_referencia: str = "mes_atual"
    tipo_plano_locacao: str = "padrao"
    retidos: str = ""
    info_garantias: str = ""
    valor_desconto: float = 0.0
    valor_multa: float = 0.0
    valor_caucao: float = 0.0
    data_caucao_dev: Optional[date] = None
    numero_contrato: str = ""
    status: str = "ativo"
    
    # Campos monetários adicionais
    valor_condominio: float = 0.0
    valor_fci: float = 0.0
    bonificacao: float = 0.0
    valor_seguro_fianca: float = 0.0
    valor_seguro_incendio: float = 0.0
    valor_iptu: float = 0.0
    seguro_valor_cobertura: float = 0.0
    titulo_valor: float = 0.0
    
    # Campos de datas e prazos
    data_assinatura: Optional[date] = None
    periodo_contrato: Optional[int] = None
    ultimo_reajuste: Optional[date] = None
    proximo_reajuste: Optional[date] = None
    
    # CAMPOS DE DATAS DE SEGUROS E IPTU (FALTAVAM!)
    seguro_fianca_inicio: Optional[date] = None
    seguro_fianca_fim: Optional[date] = None
    seguro_incendio_inicio: Optional[date] = None
    seguro_incendio_fim: Optional[date] = None
    data_inicio_iptu: Optional[date] = None
    data_fim_iptu: Optional[date] = None
    
    # CAMPOS DE ANTECIPAÇÃO (CHECKBOXES - FALTAVAM!)
    antecipa_condominio: bool = False
    antecipa_seguro_fianca: bool = False
    antecipa_seguro_incendio: bool = False
    antecipa_iptu: bool = False
    antecipa_taxa_lixo: bool = False
    
    # CAMPOS DE RETENÇÃO (CHECKBOXES - FALTAVAM!)
    retido_fci: bool = False
    retido_condominio: bool = False
    retido_seguro_fianca: bool = False
    retido_seguro_incendio: bool = False
    retido_iptu: bool = False
    retido_taxa_lixo: bool = False
    
    # Campos de cláusulas e observações
    clausulas_adicionais: str = ""
    
    # Campos de multas e taxas
    multa_atraso: float = 0.0
    juros_atraso: float = 0.0
    
    # Campos de reajuste
    tempo_reajuste: int = 12
    indice_reajuste: str = 'IPCA'
    percentual_reajuste: float = 0.0
    proximo_reajuste_automatico: bool = False

class ContratoUpdate(BaseModel):
    id_locatario: Optional[int] = None
    id_imovel: Optional[int] = None
    valor_aluguel: Optional[float] = None
    data_inicio: Optional[date] = None
    data_fim: Optional[date] = None
    data_vencimento: Optional[date] = None
    tipo_garantia: Optional[str] = None
    observacoes: Optional[str] = None
    status: Optional[str] = None
    valor_condominio: Optional[float] = None
    valor_iptu: Optional[float] = None
    valor_seguro: Optional[float] = None
    percentual_reajuste: Optional[float] = None
    indice_reajuste: Optional[str] = None
    prazo_reajuste: Optional[int] = None
    valor_multa_rescisao: Optional[float] = None
    valor_deposito_caucao: Optional[float] = None
    prazo_pagamento: Optional[int] = None
    dia_vencimento: Optional[int] = None
    forma_pagamento: Optional[str] = None
    banco_pagamento: Optional[str] = None
    agencia_pagamento: Optional[str] = None
    conta_pagamento: Optional[str] = None
    
    # Campos que JÁ EXISTEM no banco (confirmados pela varredura)
    data_assinatura: Optional[date] = None
    ultimo_reajuste: Optional[date] = None
    proximo_reajuste: Optional[date] = None
    renovacao_automatica: Optional[str] = None
    vencimento_dia: Optional[int] = None
    taxa_administracao: Optional[float] = None
    fundo_conservacao: Optional[float] = None
    bonificacao: Optional[float] = None
    valor_seguro_fianca: Optional[float] = None
    valor_seguro_incendio: Optional[float] = None
    seguro_fianca_inicio: Optional[date] = None
    seguro_fianca_fim: Optional[date] = None
    seguro_incendio_inicio: Optional[date] = None
    seguro_incendio_fim: Optional[date] = None
    percentual_multa_atraso: Optional[float] = None  # Mapeado do frontend multa_atraso
    retido_fci: Optional[bool] = None
    retido_iptu: Optional[bool] = None
    retido_condominio: Optional[bool] = None
    retido_seguro_fianca: Optional[bool] = None
    retido_seguro_incendio: Optional[bool] = None
    antecipa_condominio: Optional[bool] = None
    antecipa_seguro_fianca: Optional[bool] = None
    antecipa_seguro_incendio: Optional[bool] = None
    
    # Campos CRIADOS no banco (anteriormente marcados com *)
    data_entrega_chaves: Optional[date] = None
    proximo_reajuste_automatico: Optional[bool] = None
    periodo_contrato: Optional[int] = None
    tempo_renovacao: Optional[int] = None
    tempo_reajuste: Optional[int] = None
    data_inicio_iptu: Optional[date] = None
    data_fim_iptu: Optional[date] = None
    parcelas_iptu: Optional[int] = None
    parcelas_seguro_fianca: Optional[int] = None
    parcelas_seguro_incendio: Optional[int] = None
    valor_fci: Optional[float] = None
    
    # Campos de PLANO DE LOCAÇÃO
    id_plano_locacao: Optional[int] = None
    
    # Campos de CORRETOR (6 campos)
    tem_corretor: Optional[bool] = None
    corretor_nome: Optional[str] = None
    corretor_creci: Optional[str] = None
    corretor_cpf: Optional[str] = None
    corretor_telefone: Optional[str] = None
    corretor_email: Optional[str] = None
    
    # Campos de OBRIGAÇÕES ADICIONAIS (6 campos)
    obrigacao_manutencao: Optional[bool] = None
    obrigacao_pintura: Optional[bool] = None
    obrigacao_jardim: Optional[bool] = None
    obrigacao_limpeza: Optional[bool] = None
    obrigacao_pequenos_reparos: Optional[bool] = None
    obrigacao_vistoria: Optional[bool] = None
    
    # Campos de MULTAS ESPECÍFICAS (2 campos)
    multa_locador: Optional[float] = None
    multa_locatario: Optional[float] = None

# Rotas para Locadores
@app.post("/api/locadores")
async def criar_locador(locador: LocadorCreate):
    try:
        print(f"Criando novo locador: {locador.nome}")
        
        # Usar adapter
        resultado = inserir_locador(locador.dict(exclude_none=True))
        
        if resultado.get("success"):
            return {"data": {"id": resultado["id"]}, "success": True, "message": resultado["message"]}
        else:
            raise HTTPException(status_code=500, detail=resultado.get("error", "Erro desconhecido"))
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao criar locador: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar locador: {str(e)}")

@app.put("/api/locadores/{locador_id}")
async def atualizar_locador_endpoint(locador_id: int, locador: LocadorUpdate):
    try:
        print(f"\n=== INICIANDO ATUALIZAÇÃO DO LOCADOR {locador_id} ===")
        dados_recebidos = locador.model_dump(exclude_none=True)
        print(f"Dados recebidos do frontend:")
        for campo, valor in dados_recebidos.items():
            print(f"  - {campo}: {valor}")
        print(f"Total de campos enviados: {len(dados_recebidos)}")
        
        from repositories_adapter import atualizar_locador as atualizar_locador_db
        
        # Filtrar campos None e strings vazias que devem ser NULL (campos numéricos/data)
        campos_numericos = [
            'data_constituicao', 'capital_social', 'porte_empresa', 'regime_tributario',
            'dados_bancarios_id', 'endereco_id'
        ]
        
        dados_filtrados = {}
        for k, v in dados_recebidos.items():
            if v is not None:
                # Se for campo numérico e string vazia, não incluir (será NULL)
                if k in campos_numericos and v == "":
                    continue
                # Se for lista vazia, não incluir
                if isinstance(v, list) and len(v) == 0:
                    continue
                dados_filtrados[k] = v
        
        print(f"Dados após filtrar None e strings vazias: {len(dados_filtrados)} campos")
        for campo, valor in dados_filtrados.items():
            print(f"  - {campo}: {valor}")
        
        print(f"🔧 DEBUG: Chamando atualizar_locador({locador_id}, **{list(dados_filtrados.keys())})")
        resultado = atualizar_locador_db(locador_id, **dados_filtrados)
        print(f"🔧 DEBUG: Resultado do adapter: {resultado} (tipo: {type(resultado)})")
        
        if resultado:
            print(f"✓ Locador {locador_id} atualizado com sucesso!")
            return {"message": f"Locador {locador_id} atualizado com sucesso", "success": True}
        else:
            print(f"✗ Falha ao atualizar locador {locador_id}")
            raise HTTPException(status_code=404, detail="Locador não encontrado ou nenhuma alteração foi feita")
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO no endpoint PUT /api/locadores/{locador_id}: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar locador: {str(e)}")

@app.get("/api/locadores/{locador_id}")
async def buscar_locador_por_id_endpoint(locador_id: int):
    try:
        print(f"Buscando locador completo ID: {locador_id}")

        # Usar a nova função buscar_locador_por_id com endereço estruturado
        from repositories_adapter import buscar_locador_por_id
        locador = buscar_locador_por_id(locador_id)

        if not locador:
            raise HTTPException(status_code=404, detail="Locador não encontrado")

        # DEBUG: Verificar se endereco_estruturado está presente
        endereco_estruturado = locador.get('endereco_estruturado')
        print(f"DEBUG API - endereco_estruturado: {endereco_estruturado}")
        print(f"DEBUG API - endereco_id: {locador.get('endereco_id')}")
        print(f"DEBUG API - chaves do objeto: {list(locador.keys())}")

        return {"data": locador, "success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao buscar locador: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locador: {str(e)}")

@app.get("/api/locadores")
async def listar_locadores():
    try:
        print("Listando locadores")
        
        # Usar adapter
        locadores = buscar_locadores()
        return {"data": locadores, "success": True}
    except Exception as e:
        print(f"Erro ao listar locadores: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locadores: {str(e)}")

class StatusRequest(BaseModel):
    ativo: bool

@app.put("/api/locadores/{locador_id}/status")
async def alterar_status_locador(locador_id: int, request: StatusRequest):
    try:
        from repositories_adapter import alterar_status_locador as alterar_status_db
        resultado = alterar_status_db(locador_id, request.ativo)
        
        if resultado:
            status_texto = "ativo" if request.ativo else "inativo"
            return {"message": f"Locador {locador_id} marcado como {status_texto}", "success": True}
        else:
            raise HTTPException(status_code=404, detail="Locador não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao alterar status do locador: {str(e)}")

# Rotas para Locatarios
@app.post("/api/locatarios")
async def criar_locatario(locatario: LocatarioCreate):
    try:
        novo_locatario = inserir_locatario(locatario)
        return {"data": novo_locatario, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar locatário: {str(e)}")

@app.get("/api/locatarios")
async def listar_locatarios():
    try:
        locatarios = buscar_locatarios()
        return {"data": locatarios, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locatários: {str(e)}")

@app.put("/api/locatarios/{locatario_id}")
async def atualizar_locatario_endpoint(locatario_id: int, locatario: LocatarioUpdate):
    try:
        print(f"\n=== INICIANDO ATUALIZAÇÃO DO LOCATÁRIO {locatario_id} ===")
        dados_recebidos = locatario.model_dump(exclude_none=True)
        print(f"Dados recebidos do frontend:")
        for campo, valor in dados_recebidos.items():
            print(f"  - {campo}: {valor}")
        print(f"Total de campos enviados: {len(dados_recebidos)}")
        
        from repositories_adapter import atualizar_locatario as atualizar_locatario_db
        # Filtrar campos None antes de enviar para o banco
        dados_filtrados = {k: v for k, v in dados_recebidos.items() if v is not None}
        print(f"Dados após filtrar None: {len(dados_filtrados)} campos")
        for campo, valor in dados_filtrados.items():
            print(f"  - {campo}: {valor}")
        
        # DEBUG ESPECÍFICO PARA FORMAS DE COBRANÇA
        if 'formas_envio_cobranca' in dados_filtrados:
            print(f"🚨 DEBUG FORMAS_ENVIO_COBRANCA: {dados_filtrados['formas_envio_cobranca']}")
            print(f"🚨 TIPO: {type(dados_filtrados['formas_envio_cobranca'])}")
            if dados_filtrados['formas_envio_cobranca']:
                for i, forma in enumerate(dados_filtrados['formas_envio_cobranca']):
                    print(f"🚨 FORMA {i}: {forma} (tipo: {type(forma)})")
        else:
            print(f"🚨 DEBUG: formas_envio_cobranca NÃO ENCONTRADA em dados_filtrados")
        
        resultado = atualizar_locatario_db(locatario_id, **dados_filtrados)
        
        if resultado:
            print(f"✓ Locatário {locatario_id} atualizado com sucesso!")
            return {"message": f"Locatário {locatario_id} atualizado com sucesso", "success": True}
        else:
            print(f"✗ Falha ao atualizar locatário {locatario_id}")
            raise HTTPException(status_code=404, detail="Locatário não encontrado ou nenhuma alteração foi feita")
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO no endpoint PUT /api/locatarios/{locatario_id}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro interno do servidor: {str(e)}")

@app.get("/api/locatarios/{locatario_id}")
async def buscar_locatario_endpoint(locatario_id: int):
    try:
        print(f"ENDPOINT: Buscando locatário ID: {locatario_id}")
        
        # Usar nova função que busca com múltiplos contatos
        locatario = buscar_locatario_por_id(locatario_id)
        
        if not locatario:
            print(f"ENDPOINT: Locatário ID {locatario_id} não encontrado")
            raise HTTPException(status_code=404, detail="Locatário não encontrado")
            
        return {"data": locatario, "success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao buscar locatário: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locatário: {str(e)}")

@app.put("/api/locatarios/{locatario_id}/status")
async def alterar_status_locatario(locatario_id: int, request: StatusRequest):
    try:
        from repositories_adapter import alterar_status_locatario as alterar_status_db
        resultado = alterar_status_db(locatario_id, request.ativo)
        
        if resultado:
            status_texto = "ativo" if request.ativo else "inativo"
            return {"message": f"Locatário {locatario_id} marcado como {status_texto}", "success": True}
        else:
            raise HTTPException(status_code=404, detail="Locatário não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao alterar status do locatário: {str(e)}")

# Rotas para Imóveis
@app.post("/api/imoveis")
async def criar_imovel(imovel: ImovelCreate):
    try:
        # Converter para dict
        imovel_data = imovel.dict()
        
        # ✅ CORREÇÃO: Os campos Encargos agora vem diretamente do frontend (não mais aninhados)
        # Removido processamento de informacoes_iptu e informacoes_condominio - campos vem diretos
        
        if imovel_data.get('dados_gerais'):
            dados_gerais = imovel_data.pop('dados_gerais')
            # Mapear para campos planos
            imovel_data['quartos'] = dados_gerais.get('quartos', 0)
            imovel_data['suites'] = dados_gerais.get('suites', 0)
            imovel_data['banheiros'] = dados_gerais.get('banheiros', 0)
            imovel_data['salas'] = dados_gerais.get('salas', 0)
            imovel_data['cozinha'] = dados_gerais.get('cozinha', 0)
            imovel_data['vagas_garagem'] = dados_gerais.get('qtd_garagem', 0)
            imovel_data['tem_sacada'] = dados_gerais.get('tem_sacada', False)
            imovel_data['qtd_sacada'] = dados_gerais.get('qtd_sacada', 0)
            imovel_data['tem_churrasqueira'] = dados_gerais.get('tem_churrasqueira', False)
            imovel_data['qtd_churrasqueira'] = dados_gerais.get('qtd_churrasqueira', 0)
            # Converter mobiliado string para boolean (compatibilidade com DB atual)
            mobiliado_str = dados_gerais.get('mobiliado', 'nao')
            imovel_data['mobiliado'] = mobiliado_str.lower() == 'sim'
            # permite_pets já existe no nível principal
            if 'permite_pets' not in imovel_data or not imovel_data['permite_pets']:
                imovel_data['permite_pets'] = dados_gerais.get('permite_pets', False)
        
        # Processar múltiplos locadores se existirem
        locadores_data = imovel_data.pop('locadores', [])
        
        # ✅ CORREÇÃO: Passar locadores para o repository
        if locadores_data:
            imovel_data['locadores'] = locadores_data
            print(f"✅ Enviando {len(locadores_data)} locadores para o repository: {locadores_data}")
        
        # Chamar repository
        novo_imovel = inserir_imovel(**imovel_data)
        
        return {"data": novo_imovel, "success": True}
    except Exception as e:
        print(f"Erro ao criar imóvel: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao criar imóvel: {str(e)}")

@app.get("/api/imoveis")
async def listar_imoveis():
    try:
        imoveis = buscar_imoveis()
        return {"data": imoveis, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar imóveis: {str(e)}")

@app.put("/api/imoveis/{imovel_id}")
async def atualizar_imovel_endpoint(imovel_id: int, imovel: ImovelUpdate):
    try:
        print(f"\nINICIANDO ATUALIZACAO DO IMOVEL {imovel_id}")
        dados_recebidos = imovel.model_dump(exclude_none=True)
        print(f"DADOS RECEBIDOS DO FRONTEND ({len(dados_recebidos)} campos):")
        for campo, valor in dados_recebidos.items():
            print(f"   {campo}: {valor} (tipo: {type(valor)})")
        print(f"Total de campos enviados: {len(dados_recebidos)}")
        
        # Processar endereco estruturado se presente
        if 'endereco' in dados_recebidos and isinstance(dados_recebidos['endereco'], dict):
            endereco_estruturado = dados_recebidos.pop('endereco')
            dados_recebidos['endereco_estruturado'] = endereco_estruturado
            print(f"ENDERECO estruturado encontrado: {endereco_estruturado}")
        
        # ✅ CORREÇÃO: Os campos Encargos agora vem diretamente (não mais aninhados)
        # Removido processamento de informacoes_iptu - campo titular_iptu vem direto
        # ✅ CORREÇÃO: Os campos Condomínio agora vem diretamente (não mais aninhados)
        # Removido processamento de informacoes_condominio - campos vem diretos

        # Processar dados_gerais se presente (extrair campos para o nível principal)
        if 'dados_gerais' in dados_recebidos:
            dados_gerais = dados_recebidos.pop('dados_gerais')
            print(f"DADOS_GERAIS encontrados: {dados_gerais}")
            
            # Mapear campos de dados_gerais para campos do banco
            mapeamento_dados_gerais = {
                'quartos': 'quartos',
                'banheiros': 'banheiros', 
                'salas': 'salas',
                'qtd_garagem': 'vagas_garagem',
                'area_total': 'area_total',
                'area_construida': 'metragem_construida',  # Manter metragem_construida (existe no repo)
                'area_privativa': 'area_privativa',
                'mobiliado': 'mobiliado',
                'permite_pets': 'permite_pets',  # ✅ CORRIGIDO: aceita_pets -> permite_pets
                'caracteristicas': 'caracteristicas',
                'suites': 'suites',
                'cozinha': 'cozinha',
                # Campos adicionais que podem vir do frontend
                'tem_garagem': 'vagas_garagem',  # Mapear tem_garagem como indicador
                'tem_sacada': 'tem_sacada',
                'qtd_sacada': 'qtd_sacada',
                'tem_churrasqueira': 'tem_churrasqueira',
                'qtd_churrasqueira': 'qtd_churrasqueira',
                'elevador': 'elevador',
                'andar': 'andar',
                'ano_construcao': 'ano_construcao'
            }
            
            for campo_form, campo_db in mapeamento_dados_gerais.items():
                if campo_form in dados_gerais and dados_gerais[campo_form] is not None:
                    valor = dados_gerais[campo_form]
                    if valor != "":  # Não incluir strings vazias
                        dados_recebidos[campo_db] = valor
                        print(f"Mapeado: {campo_form} -> {campo_db} = {valor}")
        
        # Forçar reload do módulo
        import importlib
        import repositories_adapter
        importlib.reload(repositories_adapter)
        from repositories_adapter import atualizar_imovel as atualizar_imovel_db
        
        # Filtrar campos None e strings vazias que devem ser NULL (campos numéricos/data)
        campos_numericos = [
            'valor_aluguel', 'iptu', 'condominio', 'taxa_incendio', 'metragem',
            'numero_quartos', 'numero_banheiros', 'numero_vagas', 'andar',
            'valor_condominio', 'valor_iptu_mensal', 'armario_embutido',
            'escritorio', 'area_servico', 'id_locador', 'id_locatario',
            'quartos', 'banheiros', 'salas', 'vagas_garagem', 'suites', 'cozinha',
            'qtd_sacada', 'qtd_churrasqueira'
        ]
        
        dados_filtrados = {}
        for k, v in dados_recebidos.items():
            if v is not None:
                # Se for campo numérico e string vazia, converter para None (NULL no banco)
                if k in campos_numericos and v == "":
                    dados_filtrados[k] = None  # ✅ CORRIGIDO: Incluir como None para limpar o campo
                # Se for lista vazia, não incluir
                elif isinstance(v, list) and len(v) == 0:
                    continue
                else:
                    dados_filtrados[k] = v
        
        # ✅ CORREÇÃO: Processar múltiplos locadores se existirem
        print(f"🔍 DEBUG MAIN.PY: Verificando locadores em dados_recebidos...")
        print(f"🔍 DEBUG MAIN.PY: 'locadores' in dados_recebidos = {'locadores' in dados_recebidos}")
        if 'locadores' in dados_recebidos:
            locadores_data = dados_recebidos.get('locadores', [])
            print(f"🔍 DEBUG MAIN.PY: locadores_data = {locadores_data}")
            if locadores_data:
                dados_filtrados['locadores'] = locadores_data
                print(f"✅ MAIN.PY: Enviando {len(locadores_data)} locadores para atualização: {locadores_data}")
            else:
                print("⚠️ MAIN.PY: locadores_data está vazio!")
        else:
            print("⚠️ MAIN.PY: Campo 'locadores' NÃO encontrado em dados_recebidos!")
        
        print(f"DADOS APOS PROCESSAR ({len(dados_filtrados)} campos):")
        for campo, valor in dados_filtrados.items():
            print(f"   {campo}: {valor} (tipo: {type(valor)})")
        
        print(f"CHAMANDO atualizar_imovel(id={imovel_id}, campos={list(dados_filtrados.keys())})")
        resultado = atualizar_imovel_db(imovel_id, **dados_filtrados)
        print(f"RESULTADO DO REPOSITORY: {resultado} (tipo: {type(resultado)})")
        
        if hasattr(resultado, 'get'):
            print(f"Resultado detalhado: success={resultado.get('success')}, message={resultado.get('message')}")
        
        if resultado:
            print(f"Imovel {imovel_id} atualizado com sucesso!")
            return {"message": f"Imóvel {imovel_id} atualizado com sucesso", "success": True}
        else:
            print(f"Falha ao atualizar imovel {imovel_id}")
            raise HTTPException(status_code=404, detail="Imóvel não encontrado ou nenhuma alteração foi feita")
    except HTTPException:
        raise
    except Exception as e:
        print(f"ERRO no endpoint PUT /api/imoveis/{imovel_id}: {str(e)}")
        print("Erro no processamento - detalhes removidos para evitar problemas de encoding")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar imóvel: {str(e)}")

@app.get("/api/imoveis/{imovel_id}")
async def buscar_imovel_por_id(imovel_id: int):
    try:
        print(f"Buscando imóvel ID: {imovel_id}")
        
        # Usar busca geral e filtrar
        imoveis = buscar_imoveis()
        imovel = next((imo for imo in imoveis if imo.get('id') == imovel_id), None)
        
        if not imovel:
            raise HTTPException(status_code=404, detail="Imóvel não encontrado")
        
        # Se tem endereco_id, buscar dados estruturados
        endereco_id = imovel.get('endereco_id')
        if endereco_id:
            print(f"Buscando endereço estruturado ID: {endereco_id}")
            from repositories_adapter import buscar_endereco_imovel
            endereco_estruturado = buscar_endereco_imovel(endereco_id)
            if endereco_estruturado:
                imovel['endereco_estruturado'] = endereco_estruturado
                print(f"Endereço estruturado adicionado: {endereco_estruturado}")
        
        # ✅ CORREÇÃO: Buscar múltiplos locadores do imóvel
        try:
            from repositories_adapter import get_conexao
            with get_conexao() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    SELECT 
                        il.id as vinculo_id,
                        il.locador_id,
                        l.nome as locador_nome,
                        l.cpf_cnpj as locador_cpf_cnpj,
                        l.telefone as locador_telefone,
                        l.email as locador_email,
                        il.porcentagem,
                        il.responsabilidade_principal
                    FROM ImovelLocadores il
                    INNER JOIN Locadores l ON il.locador_id = l.id
                    WHERE il.imovel_id = ? AND il.ativo = 1
                    ORDER BY il.responsabilidade_principal DESC, il.porcentagem DESC
                """, (imovel_id,))
                
                locadores = []
                for row in cursor.fetchall():
                    cols = [col[0] for col in cursor.description]
                    locadores.append(dict(zip(cols, row)))
                
                imovel['locadores'] = locadores
                print(f"✅ {len(locadores)} locadores adicionados ao imóvel {imovel_id}")
        except Exception as e:
            print(f"⚠️ Erro ao buscar locadores do imóvel {imovel_id}: {e}")
            imovel['locadores'] = []
            
        return {"data": imovel, "success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao buscar imóvel: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar imóvel: {str(e)}")

@app.put("/api/imoveis/{imovel_id}/status")
async def alterar_status_imovel(imovel_id: int, request: StatusRequest):
    try:
        from repositories_adapter import alterar_status_imovel as alterar_status_db
        resultado = alterar_status_db(imovel_id, request.ativo)
        
        if resultado:
            status_texto = "ativo" if request.ativo else "inativo"
            return {"message": f"Imóvel {imovel_id} marcado como {status_texto}", "success": True}
        else:
            raise HTTPException(status_code=404, detail="Imóvel não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao alterar status do imóvel: {str(e)}")

# Rotas para Contratos
@app.post("/api/contratos")
async def criar_contrato(contrato: ContratoCreate):
    try:
        print(f"\n=== INICIANDO CRIAÇÃO DE NOVO CONTRATO ===")
        dados_recebidos = contrato.dict(exclude_none=True)
        print(f"Dados recebidos do frontend:")
        for campo, valor in dados_recebidos.items():
            print(f"  - {campo}: {valor}")
        print(f"Total de campos enviados: {len(dados_recebidos)}")
        
        from repositories_adapter import inserir_contrato_completo
        # Usar todos os campos do ContratoCreate (igual ao PUT)
        resultado = inserir_contrato_completo(**dados_recebidos)
        
        if resultado.get('success'):
            return {"id": resultado.get('id'), "success": True}
        else:
            raise HTTPException(status_code=500, detail=resultado.get('message', 'Erro ao criar contrato'))
            
    except Exception as e:
        print(f"ERRO na criação de contrato: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao criar contrato: {str(e)}")

@app.get("/api/contratos")
async def listar_contratos():
    try:
        contratos = buscar_contratos()
        return {"data": contratos, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contratos: {str(e)}")

@app.get("/api/contratos/locador/{locador_id}")
async def listar_contratos_por_locador(locador_id: int):
    try:
        contratos = buscar_contratos_por_locador(locador_id)
        return {"data": contratos, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contratos do locador: {str(e)}")

@app.get("/api/contratos/{contrato_id}")
async def obter_contrato_por_id(contrato_id: int):
    try:
        contrato = buscar_contrato_por_id(contrato_id)
        if contrato:
            return {"data": contrato, "success": True}
        else:
            raise HTTPException(status_code=404, detail="Contrato não encontrado")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contrato: {str(e)}")

@app.get("/api/contratos/{contrato_id}/historico")
async def obter_historico_contrato(contrato_id: int):
    """Endpoint para buscar histórico completo de mudanças de um contrato"""
    try:
        resultado = buscar_historico_contrato(contrato_id)
        if resultado.get('success'):
            return {
                "success": True,
                "data": resultado.get('data', []),
                "total": resultado.get('total', 0),
                "message": f"Histórico do contrato {contrato_id} encontrado"
            }
        else:
            return {
                "success": False,
                "message": resultado.get('message', 'Erro ao buscar histórico')
            }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erro interno ao buscar histórico do contrato: {str(e)}"
        )

@app.put("/api/contratos/{contrato_id}")
async def atualizar_contrato(contrato_id: int, contrato: ContratoUpdate):
    try:
        print(f"\n=== INICIANDO ATUALIZAÇÃO DO CONTRATO {contrato_id} ===")
        dados_recebidos = contrato.dict(exclude_none=True)
        print(f"Dados recebidos do frontend:")
        for campo, valor in dados_recebidos.items():
            print(f"  - {campo}: {valor}")
        print(f"Total de campos enviados: {len(dados_recebidos)}")
        
        from repositories_adapter import atualizar_contrato as atualizar_contrato_db
        # Filtrar campos None antes de enviar para o banco
        dados_filtrados = {k: v for k, v in dados_recebidos.items() if v is not None}
        print(f"Dados apos filtrar None: {len(dados_filtrados)} campos")
        for campo, valor in dados_filtrados.items():
            print(f"  - {campo}: {valor}")
        
        resultado = atualizar_contrato_db(contrato_id, **dados_filtrados)
        
        # Se há dados bancários do corretor, salvá-los na tabela CorretorContaBancaria
        if 'dados_bancarios_corretor' in dados_recebidos and dados_recebidos['dados_bancarios_corretor']:
            print("Salvando dados bancários do corretor...")
            salvar_dados_bancarios_corretor(contrato_id, dados_recebidos['dados_bancarios_corretor'])
        
        if resultado:
            print(f"\u2713 Contrato {contrato_id} atualizado com sucesso!")
            return {"message": f"Contrato {contrato_id} atualizado com sucesso", "success": True}
        else:
            print(f"\u2717 Falha ao atualizar contrato {contrato_id}")
            raise HTTPException(status_code=404, detail="Contrato não encontrado ou nenhuma alteração foi feita")
    except HTTPException:
        raise
    except Exception as e:
        print(f"\u2717 ERRO ao atualizar contrato: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar contrato: {str(e)}")

# Endpoints para Prestação de Contas
@app.get("/api/faturas")
async def listar_faturas(
    status: Optional[str] = None, 
    mes: Optional[int] = None,
    ano: Optional[int] = None,
    order_by: Optional[str] = 'data_vencimento',
    order_dir: Optional[str] = 'DESC',
    search: Optional[str] = None,
    page: Optional[int] = 1,
    limit: Optional[int] = 20
):
    try:
        from repositories_adapter import buscar_faturas
        # Criar objeto de filtros
        filtros = {}
        if status:
            filtros['status'] = status
        if mes:
            filtros['mes'] = mes
        if ano:
            filtros['ano'] = ano
        if search:
            filtros['search'] = search
            
        faturas = buscar_faturas(
            filtros=filtros if filtros else None,
            page=page,
            limit=limit,
            order_by=order_by,
            order_dir=order_dir
        )
        return faturas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar faturas: {str(e)}")

@app.get("/api/faturas/stats")
async def obter_estatisticas_faturas():
    try:
        from repositories_adapter import buscar_estatisticas_faturas
        stats = buscar_estatisticas_faturas()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar estatísticas: {str(e)}")

@app.get("/api/faturas/{fatura_id}")
async def obter_fatura(fatura_id: int):
    try:
        from repositories_adapter import buscar_fatura_por_id
        fatura = buscar_fatura_por_id(fatura_id)
        if not fatura:
            raise HTTPException(status_code=404, detail="Fatura não encontrada")
        return {"data": fatura, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar fatura: {str(e)}")

@app.post("/api/faturas/{fatura_id}/gerar-boleto")
async def gerar_boleto(fatura_id: int):
    try:
        from repositories_adapter import gerar_boleto_fatura
        boleto = gerar_boleto_fatura(fatura_id)
        if not boleto:
            raise HTTPException(status_code=404, detail="Fatura não encontrada")
        return {"data": boleto, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar boleto: {str(e)}")

@app.post("/api/faturas/{fatura_id}/cancelar")
async def cancelar_fatura(fatura_id: int):
    try:
        from repositories_adapter import cancelar_fatura
        resultado = cancelar_fatura(fatura_id)
        
        if resultado:
            return {"message": f"Fatura {fatura_id} cancelada com sucesso", "success": True}
        else:
            raise HTTPException(status_code=404, detail="Fatura não encontrada")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao cancelar fatura: {str(e)}")

@app.get("/api/prestacao-contas/contratos-ativos")
async def listar_contratos_ativos_prestacao():
    """Lista todos os contratos válidos (ativo, reajuste, vencendo) para seleção na prestação de contas"""
    try:
        from repositories_adapter import buscar_contratos_ativos
        contratos = buscar_contratos_ativos()
        return {"data": contratos, "success": True}
    except Exception as e:
        print(f"Erro ao buscar contratos ativos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contratos ativos: {str(e)}")


# Endpoints do Dashboard
@app.get("/api/dashboard/metricas")
async def dashboard_metricas():
    """Endpoint para obter métricas do dashboard"""
    try:
        metricas = obter_metricas_dashboard()
        return metricas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar métricas: {str(e)}")

@app.get("/api/dashboard/ocupacao")
async def dashboard_ocupacao():
    """Endpoint para obter dados de ocupação"""
    try:
        ocupacao = obter_ocupacao_dashboard()
        return ocupacao
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar ocupação: {str(e)}")

@app.get("/api/dashboard/vencimentos")
async def dashboard_vencimentos(dias: int = 30):
    """Endpoint para obter vencimentos próximos"""
    try:
        vencimentos = obter_vencimentos_dashboard(dias)
        return vencimentos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar vencimentos: {str(e)}")

@app.get("/api/dashboard/alertas")
async def dashboard_alertas():
    """Endpoint para obter alertas do sistema"""
    try:
        alertas = obter_alertas_dashboard()
        return alertas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar alertas: {str(e)}")

class PrestacaoContasRequest(BaseModel):
    contrato_id: int
    tipo_prestacao: str
    configuracao_calculo: Optional[dict] = None
    configuracao_fatura: Optional[dict] = None
    dados_financeiros: dict
    status: str
    observacoes: Optional[str] = None
    lancamentos_extras: Optional[list] = None
    contrato_dados: Optional[dict] = None
    fatura_origem: Optional[dict] = None
    data_processamento: str

@app.post("/api/prestacao-contas/salvar")
async def salvar_prestacao_contas(request: PrestacaoContasRequest):
    """Endpoint para salvar prestação de contas"""
    try:
        import traceback
        print(f"REQUEST DATA: {request.model_dump()}")

        from repositories_adapter import salvar_prestacao_contas
        resultado = salvar_prestacao_contas(
            contrato_id=request.contrato_id,
            tipo_prestacao=request.tipo_prestacao,
            dados_financeiros=request.dados_financeiros,
            status=request.status,
            observacoes=request.observacoes,
            lancamentos_extras=request.lancamentos_extras or [],
            contrato_dados=request.contrato_dados,
            configuracao_calculo=request.configuracao_calculo,
            configuracao_fatura=request.configuracao_fatura
        )
        return {"success": True, "data": resultado, "message": "Prestação de contas salva com sucesso"}
    except Exception as e:
        print(f"ERRO COMPLETO ao salvar prestacao de contas:")
        print(f"   Erro: {str(e)}")
        print(f"   Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro ao salvar prestação de contas: {str(e)}")

@app.get("/api/dashboard/completo")
async def dashboard_completo(mes: Optional[int] = None, ano: Optional[int] = None):
    """Endpoint para obter dashboard completo"""
    try:
        metricas = obter_metricas_dashboard()
        ocupacao = obter_ocupacao_dashboard()
        vencimentos = obter_vencimentos_dashboard(60)
        alertas = obter_alertas_dashboard()
        
        return {
            "metricas": metricas,
            "ocupacao": ocupacao,
            "vencimentos": vencimentos,
            "alertas": alertas,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dashboard: {str(e)}")

# Endpoints de Prestação Detalhada
@app.get("/api/prestacao-contas/{prestacao_id}")
async def buscar_prestacao_detalhada_endpoint(prestacao_id: int):
    """Busca prestação de contas com detalhamento completo"""
    try:
        prestacao = buscar_prestacao_detalhada(prestacao_id)
        if not prestacao:
            raise HTTPException(status_code=404, detail="Prestação não encontrada")
        return prestacao
    except Exception as e:
        print(f"Erro ao buscar prestação detalhada: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@app.get("/api/prestacao-contas/contrato/{contrato_id}")
async def listar_prestacoes_contrato_endpoint(contrato_id: int, limit: int = 50):
    """Lista prestações de um contrato específico"""
    try:
        prestacoes = listar_prestacoes_contrato(contrato_id, limit)
        return {"prestacoes": prestacoes, "total": len(prestacoes)}
    except Exception as e:
        print(f"Erro ao listar prestações do contrato: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

# Endpoints de Busca
@app.get("/api/busca")
async def buscar_dados(
    query: str, 
    tipo: Optional[str] = None,
    locador_id: Optional[int] = None,
    locatario_id: Optional[int] = None,
    imovel_id: Optional[int] = None
):
    """Endpoint para busca global com filtros relacionais"""
    try:
        # Permitir busca vazia ou com * para listar todos
        if query is None or (len(query) < 2 and query != '*' and query != ''):
            return {"data": {"locadores": [], "locatarios": [], "imoveis": [], "contratos": []}, "success": True}
        
        # Se houver filtros relacionais, usar busca específica
        if locador_id or locatario_id or imovel_id:
            resultado = buscar_relacionados(query, tipo, locador_id, locatario_id, imovel_id)
        else:
            resultado = buscar_global(query, tipo)
            
        return {"data": resultado, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na busca: {str(e)}")

@app.get("/api/busca/stats")
async def estatisticas_busca(query: str):
    """Endpoint para estatísticas de busca"""
    try:
        stats = obter_estatisticas_busca(query)
        return {"data": stats, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {str(e)}")

@app.get("/api/busca/sugestoes")
async def sugestoes_busca():
    """Endpoint para sugestões de busca"""
    try:
        sugestoes = buscar_sugestoes()
        return {"data": sugestoes, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter sugestões: {str(e)}")

# ==========================================
# ENDPOINTS PARA MÚLTIPLOS LOCADORES/LOCATÁRIOS
# ==========================================

@app.get("/api/contratos/{contrato_id}/locadores")
async def listar_locadores_contrato(contrato_id: int):
    """Lista todos os locadores de um contrato"""
    try:
        from repositories_adapter import buscar_locadores_contrato
        locadores = buscar_locadores_contrato(contrato_id)
        return {"data": locadores, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locadores: {str(e)}")

@app.get("/api/contratos/{contrato_id}/locatarios")
async def listar_locatarios_contrato(contrato_id: int):
    """Lista todos os locatários de um contrato"""
    try:
        from repositories_adapter import buscar_locatarios_contrato
        locatarios = buscar_locatarios_contrato(contrato_id)
        return {"data": locatarios, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locatários: {str(e)}")

@app.get("/api/locadores/ativos")
async def listar_locadores_ativos():
    """Lista todos os locadores ativos disponíveis"""
    try:
        from repositories_adapter import buscar_todos_locadores_ativos
        locadores = buscar_todos_locadores_ativos()
        return {"data": locadores, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locadores ativos: {str(e)}")

# Rotas para Contas Bancárias de Locadores
@app.get("/api/locadores/{locador_id}/contas-bancarias")
async def listar_contas_bancarias_locador(locador_id: int):
    """Lista todas as contas bancárias de um locador"""
    try:
        from repositories_adapter import buscar_contas_bancarias_locador
        contas = buscar_contas_bancarias_locador(locador_id)
        return {"data": contas, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contas bancárias: {str(e)}")

class ContaBancariaCreate(BaseModel):
    tipo_recebimento: str = "PIX"
    principal: Optional[bool] = False
    chave_pix: Optional[str] = ""
    banco: Optional[str] = ""
    agencia: Optional[str] = ""
    conta: Optional[str] = ""
    tipo_conta: Optional[str] = "Conta Corrente"
    titular: Optional[str] = ""
    cpf_titular: Optional[str] = ""

@app.post("/api/locadores/{locador_id}/contas-bancarias")
async def criar_conta_bancaria_locador(locador_id: int, conta: ContaBancariaCreate):
    """Cria uma nova conta bancária para um locador"""
    try:
        from repositories_adapter import inserir_conta_bancaria_locador
        conta_id = inserir_conta_bancaria_locador(locador_id, conta.dict())
        if conta_id:
            return {"data": {"id": conta_id}, "success": True, "message": "Conta bancária criada com sucesso"}
        else:
            raise HTTPException(status_code=500, detail="Erro ao criar conta bancária")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar conta bancária: {str(e)}")

class LocadoresContratoRequest(BaseModel):
    locadores: list[dict]

@app.post("/api/contratos/{contrato_id}/locadores")
async def salvar_locadores_contrato(contrato_id: int, request: LocadoresContratoRequest):
    """Salva múltiplos locadores para um contrato"""
    try:
        from repositories_adapter import salvar_locadores_contrato, validar_porcentagens_contrato
        
        # Validar dados
        validacao = validar_porcentagens_contrato(request.locadores)
        if not validacao["success"]:
            raise HTTPException(status_code=400, detail=validacao["message"])
        
        # Salvar locadores
        sucesso = salvar_locadores_contrato(contrato_id, request.locadores)
        if sucesso:
            return {"message": "Locadores salvos com sucesso", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Erro ao salvar locadores")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar locadores: {str(e)}")

class LocatariosContratoRequest(BaseModel):
    locatarios: list[dict]

@app.post("/api/contratos/{contrato_id}/locatarios")
async def salvar_locatarios_contrato(contrato_id: int, request: LocatariosContratoRequest):
    """Salva múltiplos locatários para um contrato"""
    try:
        from repositories_adapter import salvar_locatarios_contrato
        
        # Salvar locatários
        sucesso = salvar_locatarios_contrato(contrato_id, request.locatarios)
        if sucesso:
            return {"message": "Locatários salvos com sucesso", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Erro ao salvar locatários")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar locatários: {str(e)}")

# ==========================================
# ENDPOINTS PARA DADOS RELACIONADOS
# ==========================================

class GarantiasRequest(BaseModel):
    fiador_nome: Optional[str] = None
    fiador_cpf: Optional[str] = None 
    fiador_telefone: Optional[str] = None
    fiador_endereco: Optional[str] = None
    caucao_tipo: Optional[str] = None
    caucao_descricao: Optional[str] = None
    titulo_numero: Optional[str] = None
    titulo_valor: Optional[float] = None
    apolice_numero: Optional[str] = None
    apolice_valor_cobertura: Optional[float] = None

@app.post("/api/contratos/{contrato_id}/garantias")
async def salvar_garantias_contrato(contrato_id: int, request: GarantiasRequest):
    """Salva garantias (fiador, caução, título, apólice) para um contrato"""
    try:
        from repositories_adapter import salvar_garantias_individuais
        
        dados = request.dict(exclude_none=True)
        resultado = salvar_garantias_individuais(contrato_id, dados)
        
        if resultado["success"]:
            return {"message": resultado["message"], "success": True}
        else:
            raise HTTPException(status_code=500, detail=resultado["message"])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar garantias: {str(e)}")

class PetsRequest(BaseModel):
    quantidade_pets: Optional[int] = 0
    pets_racas: Optional[str] = None
    pets_tamanhos: Optional[str] = None

@app.post("/api/contratos/{contrato_id}/pets")
async def salvar_pets_contrato(contrato_id: int, request: PetsRequest):
    """Salva informações de pets para um contrato"""
    try:
        from repositories_adapter import salvar_pets_contrato
        
        dados = request.dict(exclude_none=True)
        resultado = salvar_pets_contrato(contrato_id, dados)
        
        if resultado["success"]:
            return {"message": resultado["message"], "success": True}
        else:
            raise HTTPException(status_code=500, detail=resultado["message"])
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar pets: {str(e)}")

@app.get("/api/contratos/{contrato_id}/pets")
async def buscar_pets_contrato(contrato_id: int):
    """Busca pets de um contrato"""
    try:
        from repositories_adapter import buscar_pets_por_contrato
        
        resultado = buscar_pets_por_contrato(contrato_id)
        return {"success": True, "data": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar pets: {str(e)}")

@app.get("/api/contratos/{contrato_id}/garantias")
async def buscar_garantias_contrato(contrato_id: int):
    """Busca garantias de um contrato"""
    try:
        from repositories_adapter import buscar_garantias_por_contrato
        
        resultado = buscar_garantias_por_contrato(contrato_id)
        return {"success": True, "data": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar garantias: {str(e)}")

@app.get("/api/contratos/{contrato_id}/plano")
async def buscar_plano_contrato(contrato_id: int):
    """Busca o plano de locação de um contrato"""
    try:
        from repositories_adapter import buscar_plano_por_contrato
        
        resultado = buscar_plano_por_contrato(contrato_id)
        return {"success": True, "data": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar plano: {str(e)}")

@app.get("/api/planos")
async def listar_planos():
    """Lista todos os planos de locação disponíveis"""
    try:
        resultado = listar_planos_locacao()
        return {"success": True, "data": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar planos: {str(e)}")

@app.get("/api/contratos/{contrato_id}/corretor/dados-bancarios")
async def buscar_dados_bancarios_corretor_contrato(contrato_id: int):
    """Busca os dados bancários do corretor de um contrato"""
    try:
        resultado = buscar_dados_bancarios_corretor(contrato_id)
        return {"success": True, "data": resultado}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dados bancários do corretor: {str(e)}")

@app.patch("/api/contratos/{contrato_id}/status")
async def alterar_status_contrato(contrato_id: int, request: dict):
    """Altera o status de um contrato"""
    try:
        from repositories_adapter import alterar_status_contrato_db
        
        novo_status = request.get("status")
        if not novo_status:
            raise HTTPException(status_code=400, detail="Status não fornecido")
            
        # Validar status
        status_validos = ['ativo', 'encerrado', 'pendente', 'vencido']
        if novo_status not in status_validos:
            raise HTTPException(status_code=400, detail=f"Status inválido. Use: {', '.join(status_validos)}")
        
        sucesso = alterar_status_contrato_db(contrato_id, novo_status)
        
        if sucesso:
            return {"message": f"Status alterado para {novo_status}", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Erro ao alterar status")
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao alterar status: {str(e)}")

@app.post("/api/contratos/calcular-prestacao")
async def calcular_prestacao_contrato(request: dict):
    """
    Calcula prestação de contas de um contrato
    
    Espera dados no formato:
    {
        "contrato_id": 123,
        "data_entrada": "2025-01-15", 
        "data_saida": "2025-01-31",
        "tipo_calculo": "Entrada", // "Entrada", "Saída", "Mensal", "Rescisão"
        "valores_mensais": {"aluguel": 2500.00, "iptu": 106.63, ...},
        "lancamentos_adicionais": [...],
        "desconto": 0,
        "multa": 0,
        "observacoes": ""
    }
    """
    try:
        from repositories_adapter import calcular_prestacao_mensal
        from datetime import datetime
        
        # Validar dados obrigatórios
        contrato_id = request.get('contrato_id')
        if not contrato_id:
            raise HTTPException(status_code=400, detail="contrato_id é obrigatório")
            
        tipo_calculo = request.get('tipo_calculo', 'Mensal')
        data_entrada = request.get('data_entrada')
        data_saida = request.get('data_saida')
        
        # Inicializar variáveis
        data_entrada_dia = None
        data_saida_dia = None
        
        # Extrair mês e ano das datas fornecidas
        # Processar data_entrada
        if data_entrada:
            dt_entrada = datetime.strptime(data_entrada, '%Y-%m-%d')
            mes, ano = dt_entrada.month, dt_entrada.year
            data_entrada_dia = str(dt_entrada.day)
        
        # Processar data_saida (independente de data_entrada)
        data_saida_iso = None  # Inicializar variável
        if data_saida:
            dt_saida = datetime.strptime(data_saida, '%Y-%m-%d')
            data_saida_iso = data_saida  # Guardar data completa em formato ISO
            if not data_entrada:  # Só atualiza mes/ano se não tem data_entrada
                mes, ano = dt_saida.month, dt_saida.year
            data_saida_dia = str(dt_saida.day)
        
        # Se não tem nenhuma data, usar mês/ano atual
        if not data_entrada and not data_saida:
            now = datetime.now()
            mes, ano = now.month, now.year
        
        # Determinar método de cálculo 
        metodo_calculo = request.get('metodo_calculo', "proporcional-dias")  # Usar valor do frontend
        
        # Mapear tipos do frontend para backend
        tipo_mapeado = tipo_calculo
        if tipo_calculo == "Entrada + Proporcional":
            tipo_mapeado = "Entrada"
            # Manter o método escolhido pelo usuário
        
        # Para tipo Mensal, sempre usar dias-completo
        if tipo_calculo == "Mensal":
            metodo_calculo = "dias-completo"
        
        # Para Rescisão, sempre usar proporcional-dias (conforme prática de mercado e lei)
        if tipo_calculo == "Rescisão":
            metodo_calculo = "proporcional-dias"
        
        # Processar lançamentos adicionais se fornecidos
        lancamentos_adicionais = request.get('lancamentos_adicionais', [])
        
        # Chamar função de cálculo
        resultado = calcular_prestacao_mensal(
            contrato_id=contrato_id,
            mes=mes,
            ano=ano,
            tipo_calculo=tipo_mapeado,
            data_entrada=data_entrada_dia if tipo_mapeado == "Entrada" else None,
            data_saida=data_saida_dia if tipo_mapeado in ["Saída", "Rescisão"] else None,
            metodo_calculo=metodo_calculo
        )
        
        # Calcular totais com lançamentos adicionais
        valor_base = resultado.get('valor_boleto', 0)
        valor_lancamentos_credito = sum(lanc.get('valor', 0) for lanc in lancamentos_adicionais if lanc.get('tipo') == 'credito')
        valor_lancamentos_debito = sum(lanc.get('valor', 0) for lanc in lancamentos_adicionais if lanc.get('tipo') == 'debito')
        
        # Aplicar desconto e multa
        desconto = request.get('desconto', 0)
        multa = request.get('multa', 0)
        
        # Para rescisão, calcular multa proporcional conforme Lei 8.245/91
        calculo_multa = None
        if tipo_mapeado == "Rescisão" and data_saida_iso:
            try:
                from repositories_adapter import calcular_multa_proporcional
                calculo_multa = calcular_multa_proporcional(contrato_id, data_saida_iso)
                multa = calculo_multa.get('multa_proporcional', multa)
                print(f"APLICANDO LEI 8.245/91 - Multa proporcional: R$ {multa:,.2f}")
                print(f"Meses restantes: {calculo_multa.get('meses_restantes', 0)}")
                print(f"Taxa rescisão: R$ {calculo_multa.get('taxa_rescisao', 0):,.2f}")
            except Exception as e:
                print(f"Erro no cálculo da multa proporcional: {e}")
                print("Usando valor de multa informado pelo usuário")
        
        valor_com_lancamentos = valor_base + valor_lancamentos_credito - valor_lancamentos_debito
        valor_com_desconto = valor_com_lancamentos * (1 - desconto / 100)
        valor_final = valor_com_desconto + multa
        
        # Converter para formato esperado pelo frontend
        valor_calculado = resultado.get('valor_calculado', 0)
        
        resposta = {
            "proporcional_entrada": valor_calculado if tipo_mapeado == "Entrada" else 0,
            "meses_completos": valor_calculado if tipo_mapeado in ["Mensal", "Rescisão"] else 0,
            "qtd_meses_completos": 1 if tipo_mapeado in ["Mensal", "Rescisão"] else 0,
            "proporcional_saida": valor_calculado if tipo_mapeado == "Saída" else 0,
            "lancamentos_adicionais": lancamentos_adicionais,
            "desconto": desconto,
            "multa": multa,
            "percentual_desconto": desconto,
            "total": valor_final,
            "valor_boleto": valor_final,
            "valor_repassado_locadores": valor_final - resultado.get('valor_retido', 0),
            "valor_retido": resultado.get('valor_retido', 0),
            "breakdown_retencao": resultado.get('breakdown_retencao', {
                "taxa_admin": 0,
                "seguro": 0,
                "outros": 0
            }),
            "percentual_admin": resultado.get('percentual_admin', 5),
            "periodo_dias": resultado.get('dias_utilizados', 31),
            "data_calculo": datetime.now().strftime('%Y-%m-%d'),
            "contrato_dados": resultado.get('contrato_dados', {})
        }

        # Adicionar campos específicos de rescisão
        if tipo_mapeado == "Rescisão" and calculo_multa:
            resposta["meses_restantes"] = calculo_multa.get('meses_restantes', 0)
            resposta["taxa_rescisao"] = calculo_multa.get('taxa_rescisao', 0)
        else:
            resposta["meses_restantes"] = 0
            resposta["taxa_rescisao"] = 0
        
        return resposta
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro no cálculo: {str(e)}")

# === CÁLCULO DE ACRÉSCIMOS PARA PRESTAÇÃO DE CONTAS ===

def calcular_acrescimos_prestacao(valor_original: float, dias_atraso: int, percentual_multa_contrato: float) -> dict:
    """
    Calcula acréscimos por atraso para prestação de contas:
    - Juros de mora: 1% ao mês (proporcional por dia)
    - Multa: percentual definido no contrato sobre o valor em atraso
    """
    if dias_atraso <= 0:
        return {
            'juros': 0.0,
            'multa': 0.0,
            'total_acrescimo': 0.0,
            'dias_atraso': 0
        }
    
    # Juros de mora: 1% ao mês (0.033% ao dia aproximadamente)
    juros_diario = 0.01 / 30  # 1% / 30 dias = 0.000333
    juros = valor_original * juros_diario * dias_atraso
    
    # Multa: percentual do contrato sobre o valor em atraso
    multa_decimal = percentual_multa_contrato / 100  # Converte % para decimal
    multa = valor_original * multa_decimal
    
    total_acrescimo = juros + multa
    
    return {
        'juros': round(juros, 2),
        'multa': round(multa, 2),
        'total_acrescimo': round(total_acrescimo, 2),
        'dias_atraso': dias_atraso,
        'percentual_multa_usado': percentual_multa_contrato
    }

@app.put("/api/faturas/{fatura_id}/calcular-acrescimos")
async def calcular_acrescimos_fatura(fatura_id: int):
    """
    Calcula e atualiza acréscimos por atraso para uma prestação de contas específica
    """
    try:
        # Buscar dados da fatura e contrato
        from repositories_adapter import buscar_fatura_por_id, buscar_contrato_por_id
        
        fatura = buscar_fatura_por_id(fatura_id)
        if not fatura:
            raise HTTPException(status_code=404, detail="Fatura não encontrada")
        
        # Se não tem contrato_id, não pode calcular
        if not fatura.get('contrato_id'):
            raise HTTPException(status_code=400, detail="Fatura sem contrato associado")
        
        contrato = buscar_contrato_por_id(fatura['contrato_id'])
        if not contrato:
            raise HTTPException(status_code=404, detail="Contrato não encontrado")
        
        # Calcular dias de atraso baseado na data de vencimento
        from datetime import datetime, date
        
        data_vencimento = fatura.get('data_vencimento')
        if isinstance(data_vencimento, str):
            data_vencimento = datetime.fromisoformat(data_vencimento).date()
        elif isinstance(data_vencimento, datetime):
            data_vencimento = data_vencimento.date()
        
        hoje = date.today()
        dias_atraso = (hoje - data_vencimento).days if hoje > data_vencimento else 0
        
        # Pegar percentual de multa do contrato
        percentual_multa = float(contrato.get('percentual_multa_atraso', 2.0))  # Default 2%
        
        # Calcular acréscimos
        valor_original = float(fatura.get('valor_total', 0))
        acrescimos = calcular_acrescimos_prestacao(valor_original, dias_atraso, percentual_multa)
        
        # Atualizar fatura na base de dados
        from repositories_adapter import get_conexao
        conn = get_conexao()
        cursor = conn.cursor()
        
        novo_valor_total = valor_original + acrescimos['total_acrescimo']
        
        cursor.execute("""
            UPDATE PrestacaoContas 
            SET 
                valor_acrescimos = ?,
                dias_atraso = ?,
                valor_total_com_acrescimos = ?,
                data_calculo_acrescimos = GETDATE()
            WHERE id = ?
        """, (acrescimos['total_acrescimo'], dias_atraso, novo_valor_total, fatura_id))
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "message": f"Acréscimos calculados para {dias_atraso} dias de atraso",
            "data": {
                "fatura_id": fatura_id,
                "valor_original": valor_original,
                "dias_atraso": dias_atraso,
                "acrescimos": acrescimos,
                "valor_total_novo": novo_valor_total
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao calcular acréscimos: {str(e)}")

@app.put("/api/faturas/{fatura_id}/status")
async def alterar_status_fatura(fatura_id: int, request: Request):
    """
    Altera status de uma fatura e calcula acréscimos automaticamente se for 'em_atraso'
    """
    try:
        body = await request.body()
        data = json.loads(body.decode('utf-8'))
        novo_status = data.get('status')
        
        if not novo_status:
            raise HTTPException(status_code=400, detail="Status é obrigatório")
        
        # Atualizar status na base de dados
        from repositories_adapter import get_conexao
        conn = get_conexao()
        cursor = conn.cursor()
        
        # Se mudando para 'paga', definir data_pagamento
        if novo_status == 'paga':
            cursor.execute("""
                UPDATE PrestacaoContas 
                SET status = ?, data_pagamento = GETDATE()
                WHERE id = ?
            """, (novo_status, fatura_id))
        else:
            cursor.execute("""
                UPDATE PrestacaoContas 
                SET status = ?
                WHERE id = ?
            """, (novo_status, fatura_id))
        
        conn.commit()
        conn.close()
        
        # Se status é 'em_atraso', calcular acréscimos automaticamente
        if novo_status == 'em_atraso':
            try:
                resultado_acrescimos = await calcular_acrescimos_fatura(fatura_id)
                return {
                    "success": True,
                    "message": f"Status alterado para '{novo_status}' e acréscimos calculados",
                    "acrescimos": resultado_acrescimos.get('data', {})
                }
            except Exception as e:
                # Se falhar ao calcular acréscimos, pelo menos o status foi alterado
                return {
                    "success": True,
                    "message": f"Status alterado para '{novo_status}', mas erro ao calcular acréscimos: {str(e)}"
                }
        
        return {
            "success": True,
            "message": f"Status alterado para '{novo_status}'"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao alterar status: {str(e)}")

@app.put("/api/faturas/{fatura_id}/pagamento")
async def registrar_pagamento_fatura(fatura_id: int, request: Request):
    """
    Registra o pagamento de uma fatura, alterando status para 'paga' e definindo data de pagamento
    """
    try:
        body = await request.body()
        data = json.loads(body.decode('utf-8'))

        data_pagamento = data.get('data_pagamento')
        valor_pago = data.get('valor_pago')
        forma_pagamento = data.get('forma_pagamento')
        observacoes = data.get('observacoes', '')

        if not data_pagamento:
            raise HTTPException(status_code=400, detail="Data de pagamento é obrigatória")

        if not valor_pago or valor_pago <= 0:
            raise HTTPException(status_code=400, detail="Valor pago deve ser maior que zero")

        if not forma_pagamento:
            raise HTTPException(status_code=400, detail="Forma de pagamento é obrigatória")

        # Atualizar fatura no banco de dados
        from repositories_adapter import get_conexao
        conn = get_conexao()
        cursor = conn.cursor()

        # Atualizar status para 'paga' e definir data e valor de pagamento
        cursor.execute("""
            UPDATE PrestacaoContas
            SET status = 'paga',
                data_pagamento = CAST(? AS DATE),
                valor_pago = ?
            WHERE id = ?
        """, (data_pagamento, valor_pago, fatura_id))

        # Verificar se a fatura foi encontrada e atualizada
        if cursor.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Fatura não encontrada")

        # Registrar observações se fornecidas
        if observacoes:
            cursor.execute("""
                INSERT INTO LancamentosPrestacaoContas
                (prestacao_id, tipo, descricao, valor, data_lancamento)
                VALUES (?, 'PAGAMENTO', ?, ?, GETDATE())
            """, (fatura_id, f"Pagamento via {forma_pagamento}: {observacoes}", valor_pago))

        conn.commit()
        conn.close()

        return {
            "success": True,
            "message": f"Pagamento registrado com sucesso! Fatura {fatura_id} marcada como paga.",
            "data": {
                "fatura_id": fatura_id,
                "data_pagamento": data_pagamento,
                "valor_pago": valor_pago,
                "forma_pagamento": forma_pagamento,
                "novo_status": "paga"
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao registrar pagamento: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    # Usar variáveis de ambiente para host e porta
    host = os.getenv('API_HOST', 'localhost')
    port = int(os.getenv('API_PORT', '8000'))
    uvicorn.run(app, host=host, port=port)