from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import date, datetime
import os
from dotenv import load_dotenv

# Importar repositórios existentes
from locacao.repositories.locador_repository import inserir_locador, buscar_locadores
from locacao.repositories.locatario_repository import inserir_locatario, buscar_locatarios
from locacao.repositories.imovel_repository import inserir_imovel, buscar_imoveis
from locacao.repositories.contrato_repository import inserir_contrato
from locacao.repositories.contrato_locadores_repository import (
    inserir_contrato_locadores,
    buscar_locadores_contrato,
    buscar_contas_bancarias_locador,
    validar_porcentagens_contrato,
    buscar_todos_locadores_ativos
)
from locacao.repositories.prestacao_contas_repository import (
    buscar_prestacao_contas_mensal,
    buscar_locadores_com_contratos,
    inserir_lancamento_liquido,
    inserir_desconto_deducao,
    atualizar_pagamento_detalhes,
    buscar_historico_prestacao_contas,
    gerar_relatorio_excel,
    gerar_relatorio_pdf
)

# Importar novos repositórios
from locacao.repositories.search_repository import (
    busca_global_unificada,
    buscar_locadores_avancado,
    buscar_locatarios_avancado,
    buscar_imoveis_avancado,
    buscar_contratos_avancado,
    buscar_sugestoes_autocomplete,
    obter_detalhes_completos_locador,
    obter_detalhes_completos_locatario,
    obter_detalhes_completos_imovel,
    obter_detalhes_completos_contrato,
    obter_historico_completo_contrato
)
from locacao.repositories.timeline_repository import (
    inserir_evento_contrato,
    buscar_timeline_contrato,
    buscar_todos_eventos,
    atualizar_evento_contrato,
    deletar_evento_contrato,
    buscar_tipos_eventos,
    buscar_eventos_proximos
)
from locacao.repositories.dashboard_repository import (
    obter_dashboard_completo,
    obter_metricas_gerais,
    obter_ocupacao_por_tipo_imovel,
    obter_ocupacao_imoveis,
    obter_contratos_vencendo,
    obter_alertas_sistema
)

load_dotenv()

app = FastAPI(title="Cobimob API", version="1.0.0")

# Configurar CORS para permitir requisições do frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:3000", "http://127.0.0.1:3001", "http://127.0.0.1:3002", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],  # URLs comuns do React/Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic para validação dos dados
class LocadorCreate(BaseModel):
    nome: str
    cpf_cnpj: str
    telefone: str
    email: str
    endereco: str
    tipo_recebimento: str
    conta_bancaria: str
    deseja_fci: str
    deseja_seguro_fianca: str
    deseja_seguro_incendio: str
    rg: str
    dados_empresa: str
    representante: str
    nacionalidade: str
    estado_civil: str
    profissao: str
    existe_conjuge: Optional[int] = None
    nome_conjuge: Optional[str] = None
    cpf_conjuge: Optional[str] = None
    rg_conjuge: Optional[str] = None
    endereco_conjuge: Optional[str] = None
    telefone_conjuge: Optional[str] = None
    tipo_cliente: str
    data_nascimento: date

class LocatarioCreate(BaseModel):
    nome: str
    cpf_cnpj: str
    telefone: str
    email: str
    tipo_garantia: str
    responsavel_pgto_agua: str
    responsavel_pgto_luz: str
    responsavel_pgto_gas: str
    rg: str
    dados_empresa: str
    representante: str
    nacionalidade: str
    estado_civil: str
    profissao: str
    dados_moradores: str
    Endereco_inq: str
    responsavel_inq: Optional[int] = None
    dependentes_inq: Optional[int] = None
    qtd_dependentes_inq: int = 0
    pet_inquilino: Optional[int] = None
    qtd_pet_inquilino: int = 0
    porte_pet: Optional[str] = None
    nome_conjuge: Optional[str] = None
    cpf_conjuge: Optional[str] = None
    rg_conjuge: Optional[str] = None
    endereco_conjuge: Optional[str] = None
    telefone_conjuge: Optional[str] = None

class ImovelCreate(BaseModel):
    id_locador: int
    id_locatario: int
    tipo: str
    endereco: str
    valor_aluguel: float
    iptu: float
    condominio: float
    taxa_incendio: float
    status: str
    matricula_imovel: str
    area_imovel: str
    dados_imovel: str
    permite_pets: bool
    info_iptu: str
    observacoes_condominio: str
    copel_unidade_consumidora: str
    sanepar_matricula: str
    tem_gas: bool
    info_gas: str
    boleto_condominio: bool

class ContratoCreate(BaseModel):
    id_imovel: int
    id_locatario: int
    data_inicio: date
    data_fim: date
    taxa_administracao: float
    fundo_conservacao: float
    tipo_reajuste: str
    percentual_reajuste: float
    vencimento_dia: int
    renovacao_automatica: bool
    seguro_obrigatorio: bool
    clausulas_adicionais: str
    tipo_plano_locacao: str
    valores_contrato: str
    data_vigencia_segfianca: date
    data_vigencia_segincendio: date
    data_assinatura: date
    ultimo_reajuste: date
    proximo_reajuste: date
    antecipacao_encargos: bool
    aluguel_garantido: bool
    mes_de_referencia: str
    tipo_garantia: str
    bonificacao: float
    retidos: str
    info_garantias: str

# Modelos para Contrato Locadores
class ContratoLocadorCreate(BaseModel):
    locador_id: int
    conta_bancaria_id: int
    porcentagem: float

class ContratoCreateWithLocadores(ContratoCreate):
    locadores: List[ContratoLocadorCreate]

class ContratoLocadorResponse(BaseModel):
    id: Optional[int] = None
    locador_id: int
    locador_nome: Optional[str] = None
    locador_documento: Optional[str] = None
    conta_bancaria_id: int
    conta_tipo_recebimento: Optional[str] = None
    conta_chave_pix: Optional[str] = None
    conta_banco: Optional[str] = None
    conta_agencia: Optional[str] = None
    conta_conta: Optional[str] = None
    conta_tipo_conta: Optional[str] = None
    conta_titular: Optional[str] = None
    conta_cpf_titular: Optional[str] = None
    porcentagem: float
    data_criacao: Optional[str] = None

class ContaBancariaLocadorResponse(BaseModel):
    id: int
    tipo_recebimento: str
    chave_pix: Optional[str] = None
    banco: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    tipo_conta: Optional[str] = None
    titular: Optional[str] = None
    cpf_titular: Optional[str] = None
    principal: bool
    ativo: bool
    descricao: str

class LocadorOptionResponse(BaseModel):
    id: int
    nome: str
    cpf_cnpj: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None

class ValidacaoPorcentagemResponse(BaseModel):
    success: bool
    message: str
    details: Dict[str, Any]

# Modelos para Prestação de Contas
class LancamentoLiquidoCreate(BaseModel):
    id_pagamento: int
    tipo: str
    valor: float

class DescontoDeducaoCreate(BaseModel):
    id_pagamento: int
    tipo: str
    valor: float

class PagamentoDetalheUpdate(BaseModel):
    id_pagamento: int
    mes_referencia: int
    ano_referencia: int
    total_bruto: float
    total_liquido: float
    observacao: Optional[str] = None
    pagamento_atrasado: bool = False

# Endpoints da API
@app.get("/")
async def root():
    return {"message": "Cobimob API - Sistema de Locações"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# --- ENDPOINTS DE LOCADORES ---
@app.post("/api/locadores")
async def criar_locador(locador: LocadorCreate):
    try:
        inserir_locador(**locador.dict())
        return {"message": "Locador cadastrado com sucesso!", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar locador: {str(e)}")

@app.get("/api/locadores")
async def listar_locadores():
    try:
        locadores = buscar_locadores()
        return {"data": locadores, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locadores: {str(e)}")

# --- ENDPOINTS DE LOCATARIOS ---
@app.post("/api/locatarios")
async def criar_locatario(locatario: LocatarioCreate):
    try:
        inserir_locatario(locatario.dict())
        return {"message": "Locatario cadastrado com sucesso!", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar locatario: {str(e)}")

@app.get("/api/locatarios")
async def listar_locatarios():
    try:
        locatarios = buscar_locatarios()
        return {"data": locatarios, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locatarios: {str(e)}")

# --- ENDPOINTS DE IMÓVEIS ---
@app.post("/api/imoveis")
async def criar_imovel(imovel: ImovelCreate):
    try:
        # Preparar dados no formato esperado pelo repositório
        dados_imovel = (
            imovel.id_locador, imovel.tipo, imovel.endereco, imovel.valor_aluguel,
            imovel.iptu, imovel.condominio, imovel.taxa_incendio, imovel.status,
            imovel.matricula_imovel, imovel.area_imovel, imovel.dados_imovel,
            int(imovel.permite_pets), imovel.info_iptu, imovel.observacoes_condominio,
            imovel.copel_unidade_consumidora, imovel.sanepar_matricula, int(imovel.tem_gas),
            imovel.info_gas, int(imovel.boleto_condominio), imovel.id_locatario
        )
        
        inserir_imovel(dados_imovel)
        return {"message": "Imóvel cadastrado com sucesso!", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao cadastrar imóvel: {str(e)}")

@app.get("/api/imoveis")
async def listar_imoveis():
    try:
        imoveis = buscar_imoveis()
        return {"data": imoveis, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar imóveis: {str(e)}")

# --- ENDPOINTS DE CONTRATOS ---
@app.post("/api/contratos")
async def criar_contrato(contrato: ContratoCreate):
    try:
        inserir_contrato(
            id_imovel=contrato.id_imovel,
            id_locatario=contrato.id_locatario,
            data_inicio=contrato.data_inicio,
            data_fim=contrato.data_fim,
            taxa_administracao=contrato.taxa_administracao,
            fundo_conservacao=contrato.fundo_conservacao,
            tipo_reajuste=contrato.tipo_reajuste,
            percentual_reajuste=contrato.percentual_reajuste,
            vencimento_dia=contrato.vencimento_dia,
            renovacao_automatica=contrato.renovacao_automatica,
            seguro_obrigatorio=contrato.seguro_obrigatorio,
            clausulas_adicionais=contrato.clausulas_adicionais,
            tipo_plano_locacao=contrato.tipo_plano_locacao,
            valores_contrato=contrato.valores_contrato,
            data_vigencia_segfianca=contrato.data_vigencia_segfianca,
            data_vigencia_segincendio=contrato.data_vigencia_segincendio,
            data_assinatura=contrato.data_assinatura,
            ultimo_reajuste=contrato.ultimo_reajuste,
            proximo_reajuste=contrato.proximo_reajuste,
            antecipacao_encargos=contrato.antecipacao_encargos,
            aluguel_garantido=contrato.aluguel_garantido,
            mes_de_referencia=contrato.mes_de_referencia,
            tipo_garantia=contrato.tipo_garantia,
            bonificacao=contrato.bonificacao,
            retidos=contrato.retidos,
            info_garantias=contrato.info_garantias
        )
        return {"message": "Contrato salvo com sucesso!", "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar contrato: {str(e)}")

# --- ENDPOINTS DE LOCADORES DOS CONTRATOS ---
@app.get("/api/locadores/ativos", response_model=List[LocadorOptionResponse])
async def listar_locadores_ativos():
    """Lista todos os locadores ativos para seleção em contratos"""
    try:
        locadores = buscar_todos_locadores_ativos()
        return locadores
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locadores: {str(e)}")

@app.get("/api/locadores/{locador_id}/contas", response_model=List[ContaBancariaLocadorResponse])
async def listar_contas_bancarias_locador(locador_id: int):
    """Lista todas as contas bancárias de um locador específico"""
    try:
        contas = buscar_contas_bancarias_locador(locador_id)
        if not contas:
            raise HTTPException(status_code=404, detail="Locador não encontrado ou sem contas bancárias")
        return contas
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contas do locador: {str(e)}")

@app.post("/api/contratos/{contrato_id}/locadores")
async def definir_locadores_contrato(contrato_id: int, locadores: List[ContratoLocadorCreate]):
    """Define os locadores associados a um contrato com suas contas e porcentagens"""
    try:
        # Validar porcentagens primeiro
        validacao = validar_porcentagens_contrato([l.dict() for l in locadores])
        if not validacao["success"]:
            raise HTTPException(status_code=400, detail=validacao["message"])
        
        # Inserir os locadores
        sucesso = inserir_contrato_locadores(contrato_id, [l.dict() for l in locadores])
        if sucesso:
            return {"message": "Locadores do contrato definidos com sucesso!", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Erro ao salvar locadores do contrato")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao definir locadores: {str(e)}")

@app.get("/api/contratos/{contrato_id}/locadores", response_model=List[ContratoLocadorResponse])
async def buscar_locadores_do_contrato(contrato_id: int):
    """Busca todos os locadores associados a um contrato"""
    try:
        locadores = buscar_locadores_contrato(contrato_id)
        return locadores
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locadores do contrato: {str(e)}")

@app.post("/api/contratos/validar-porcentagens", response_model=ValidacaoPorcentagemResponse)
async def validar_porcentagens(locadores: List[ContratoLocadorCreate]):
    """Valida se as porcentagens dos locadores somam 100% e outras regras"""
    try:
        resultado = validar_porcentagens_contrato([l.dict() for l in locadores])
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na validação: {str(e)}")

@app.get("/api/contratos")
async def listar_contratos():
    try:
        # Por enquanto retorna lista vazia, pois não temos buscar_contratos implementado
        return {"data": [], "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contratos: {str(e)}")

# --- ENDPOINTS DE PRESTAÇÃO DE CONTAS ---
@app.get("/api/prestacao-contas/locadores")
async def listar_locadores_prestacao():
    """Lista todos os locadores que possuem contratos ativos"""
    try:
        locadores = buscar_locadores_com_contratos()
        return {"data": locadores, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locadores: {str(e)}")

@app.get("/api/prestacao-contas/{id_locador}/{ano}/{mes}")
async def obter_prestacao_contas(id_locador: int, ano: int, mes: int):
    """Obtém a prestação de contas mensal de um locador"""
    try:
        if mes < 1 or mes > 12:
            raise HTTPException(status_code=400, detail="Mês deve estar entre 1 e 12")
        
        if ano < 2020 or ano > 2030:
            raise HTTPException(status_code=400, detail="Ano deve estar entre 2020 e 2030")
        
        dados = buscar_prestacao_contas_mensal(id_locador, mes, ano)
        
        if "error" in dados:
            raise HTTPException(status_code=404, detail=dados["error"])
        
        return {"data": dados, "success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar prestação de contas: {str(e)}")

@app.get("/api/prestacao-contas/{id_locador}/historico")
async def obter_historico_prestacao(id_locador: int, limit: int = 12):
    """Obtém o histórico de prestações de contas de um locador"""
    try:
        historico = buscar_historico_prestacao_contas(id_locador, limit)
        return {"data": historico, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar histórico: {str(e)}")

@app.post("/api/prestacao-contas/lancamentos")
async def criar_lancamento_liquido(lancamento: LancamentoLiquidoCreate):
    """Cria um novo lançamento líquido"""
    try:
        sucesso = inserir_lancamento_liquido(
            lancamento.id_pagamento, 
            lancamento.tipo, 
            lancamento.valor
        )
        if sucesso:
            return {"message": "Lançamento líquido criado com sucesso!", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Erro ao criar lançamento líquido")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar lançamento líquido: {str(e)}")

@app.post("/api/prestacao-contas/descontos")
async def criar_desconto_deducao(desconto: DescontoDeducaoCreate):
    """Cria um novo desconto/dedução"""
    try:
        sucesso = inserir_desconto_deducao(
            desconto.id_pagamento, 
            desconto.tipo, 
            desconto.valor
        )
        if sucesso:
            return {"message": "Desconto/dedução criado com sucesso!", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Erro ao criar desconto/dedução")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar desconto/dedução: {str(e)}")

@app.put("/api/prestacao-contas/pagamento-detalhes")
async def atualizar_detalhes_pagamento(detalhe: PagamentoDetalheUpdate):
    """Atualiza os detalhes de um pagamento"""
    try:
        sucesso = atualizar_pagamento_detalhes(
            detalhe.id_pagamento,
            detalhe.mes_referencia,
            detalhe.ano_referencia,
            detalhe.total_bruto,
            detalhe.total_liquido,
            detalhe.observacao,
            detalhe.pagamento_atrasado
        )
        if sucesso:
            return {"message": "Detalhes do pagamento atualizados com sucesso!", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Erro ao atualizar detalhes do pagamento")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar detalhes do pagamento: {str(e)}")

@app.get("/api/prestacao-contas/{id_locador}/{ano}/{mes}/relatorio/excel")
async def gerar_excel_prestacao_contas(id_locador: int, ano: int, mes: int):
    """Gera relatório em Excel da prestação de contas"""
    try:
        if mes < 1 or mes > 12:
            raise HTTPException(status_code=400, detail="Mês deve estar entre 1 e 12")
        
        if ano < 2020 or ano > 2030:
            raise HTTPException(status_code=400, detail="Ano deve estar entre 2020 e 2030")
        
        dados = buscar_prestacao_contas_mensal(id_locador, mes, ano)
        
        if "error" in dados:
            raise HTTPException(status_code=404, detail=dados["error"])
        
        excel_file = gerar_relatorio_excel(dados)
        
        meses = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
        
        filename = f"prestacao_contas_{dados['locador']['nome'].replace(' ', '_')}_{meses[mes]}_{ano}.xlsx"
        
        return StreamingResponse(
            excel_file,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório Excel: {str(e)}")

@app.get("/api/prestacao-contas/{id_locador}/{ano}/{mes}/relatorio/pdf")
async def gerar_pdf_prestacao_contas(id_locador: int, ano: int, mes: int):
    """Gera relatório em PDF da prestação de contas"""
    try:
        if mes < 1 or mes > 12:
            raise HTTPException(status_code=400, detail="Mês deve estar entre 1 e 12")
        
        if ano < 2020 or ano > 2030:
            raise HTTPException(status_code=400, detail="Ano deve estar entre 2020 e 2030")
        
        dados = buscar_prestacao_contas_mensal(id_locador, mes, ano)
        
        if "error" in dados:
            raise HTTPException(status_code=404, detail=dados["error"])
        
        pdf_file = gerar_relatorio_pdf(dados)
        
        meses = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
                'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
        
        filename = f"prestacao_contas_{dados['locador']['nome'].replace(' ', '_')}_{meses[mes]}_{ano}.pdf"
        
        return StreamingResponse(
            pdf_file,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar relatório PDF: {str(e)}")

# ===============================================
# NOVOS ENDPOINTS - SISTEMA DE BUSCA E TIMELINE
# ===============================================

# Modelos para Timeline de Eventos
class EventoContratoCreate(BaseModel):
    contrato_id: int
    tipo_evento: str
    data_evento: datetime
    titulo: str
    descricao: Optional[str] = None
    valor: Optional[float] = None
    usuario_id: Optional[int] = None
    metadados: Optional[Dict[str, Any]] = None
    status: str = 'ativo'

class EventoContratoUpdate(BaseModel):
    titulo: Optional[str] = None
    descricao: Optional[str] = None
    valor: Optional[float] = None
    metadados: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

# --- ENDPOINTS DE BUSCA GLOBAL ---
@app.get("/api/search/global")
async def busca_global(
    q: str = Query(..., description="Termo de busca"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    tipos: Optional[str] = Query(None, description="Tipos separados por vírgula: locadores,locatarios,imoveis,contratos")
):
    """Busca unificada em todas as entidades"""
    try:
        incluir_tipos = tipos.split(',') if tipos else None
        resultados = busca_global_unificada(q, limit, offset, incluir_tipos)
        return {"success": True, "data": resultados}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na busca global: {str(e)}")

@app.get("/api/search/autocomplete")
async def autocomplete(
    q: str = Query(..., min_length=2),
    tipo: Optional[str] = Query(None, description="Tipo específico: locadores, locatarios, enderecos")
):
    """Autocomplete para busca"""
    try:
        sugestoes = buscar_sugestoes_autocomplete(q, tipo)
        return {"success": True, "data": sugestoes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no autocomplete: {str(e)}")

# --- ENDPOINTS DE BUSCA AVANÇADA ---
@app.get("/api/search/locadores")
async def buscar_locadores_filtrado(
    nome: Optional[str] = None,
    cpf_cnpj: Optional[str] = None,
    telefone: Optional[str] = None,
    email: Optional[str] = None,
    cidade: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    order_by: str = Query("nome")
):
    """Busca avançada de locadores"""
    try:
        resultado = buscar_locadores_avancado(
            nome=nome, cpf_cnpj=cpf_cnpj, telefone=telefone, email=email,
            cidade=cidade, status=status, termo_busca=q,
            limit=limit, offset=offset, order_by=order_by
        )
        return {"success": True, **resultado}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locadores: {str(e)}")

@app.get("/api/search/locatarios")
async def buscar_locatarios_filtrado(
    nome: Optional[str] = None,
    cpf_cnpj: Optional[str] = None,
    telefone: Optional[str] = None,
    status_contrato: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Busca avançada de locatários"""
    try:
        resultado = buscar_locatarios_avancado(
            nome=nome, cpf_cnpj=cpf_cnpj, telefone=telefone,
            status_contrato=status_contrato, termo_busca=q,
            limit=limit, offset=offset
        )
        return {"success": True, **resultado}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locatários: {str(e)}")

@app.get("/api/search/imoveis")
async def buscar_imoveis_filtrado(
    endereco: Optional[str] = None,
    tipo: Optional[str] = None,
    valor_min: Optional[float] = None,
    valor_max: Optional[float] = None,
    status: Optional[str] = None,
    cidade: Optional[str] = None,
    quartos: Optional[int] = None,
    q: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Busca avançada de imóveis"""
    try:
        resultado = buscar_imoveis_avancado(
            endereco=endereco, tipo=tipo, valor_min=valor_min, valor_max=valor_max,
            status=status, cidade=cidade, quartos=quartos, termo_busca=q,
            limit=limit, offset=offset
        )
        return {"success": True, **resultado}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar imóveis: {str(e)}")

@app.get("/api/search/contratos")
async def buscar_contratos_filtrado(
    status: Optional[str] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    valor_min: Optional[float] = None,
    valor_max: Optional[float] = None,
    tipo_garantia: Optional[str] = None,
    vencimento_proximo: Optional[bool] = False,
    q: Optional[str] = None,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Busca avançada de contratos"""
    try:
        resultado = buscar_contratos_avancado(
            status=status, data_inicio=data_inicio, data_fim=data_fim,
            valor_min=valor_min, valor_max=valor_max, tipo_garantia=tipo_garantia,
            vencimento_proximo=vencimento_proximo, termo_busca=q,
            limit=limit, offset=offset
        )
        return {"success": True, **resultado}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contratos: {str(e)}")

# --- ENDPOINTS DE DETALHAMENTO DE ENTIDADES ---
@app.get("/api/search/locadores/{locador_id}/detalhes")
async def obter_detalhes_locador(locador_id: int):
    """Obtém informações completas de um locador incluindo seus imóveis e contratos"""
    try:
        detalhes = obter_detalhes_completos_locador(locador_id)
        if not detalhes:
            raise HTTPException(status_code=404, detail="Locador não encontrado")
        return {"success": True, "data": detalhes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar detalhes do locador: {str(e)}")

@app.get("/api/search/locatarios/{locatario_id}/detalhes")
async def obter_detalhes_locatario(locatario_id: int):
    """Obtém informações completas de um locatário incluindo seus contratos e histórico"""
    try:
        detalhes = obter_detalhes_completos_locatario(locatario_id)
        if not detalhes:
            raise HTTPException(status_code=404, detail="Locatário não encontrado")
        return {"success": True, "data": detalhes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar detalhes do locatário: {str(e)}")

@app.get("/api/search/imoveis/{imovel_id}/detalhes")
async def obter_detalhes_imovel(imovel_id: int):
    """Obtém informações completas de um imóvel incluindo contratos e histórico"""
    try:
        detalhes = obter_detalhes_completos_imovel(imovel_id)
        if not detalhes:
            raise HTTPException(status_code=404, detail="Imóvel não encontrado")
        return {"success": True, "data": detalhes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar detalhes do imóvel: {str(e)}")

@app.get("/api/search/contratos/{contrato_id}/detalhes")
async def obter_detalhes_contrato(contrato_id: int):
    """Obtém informações completas de um contrato incluindo histórico de eventos"""
    try:
        detalhes = obter_detalhes_completos_contrato(contrato_id)
        if not detalhes:
            raise HTTPException(status_code=404, detail="Contrato não encontrado")
        return {"success": True, "data": detalhes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar detalhes do contrato: {str(e)}")

@app.get("/api/search/contratos/{contrato_id}/historico")
async def obter_historico_contrato(contrato_id: int):
    """Obtém o histórico completo de eventos de um contrato"""
    try:
        historico = obter_historico_completo_contrato(contrato_id)
        return {"success": True, "data": historico}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar histórico do contrato: {str(e)}")

# --- ENDPOINTS DE TIMELINE DE EVENTOS ---
@app.post("/api/contratos/{contrato_id}/eventos")
async def criar_evento_contrato(contrato_id: int, evento: EventoContratoCreate):
    """Cria um novo evento na timeline do contrato"""
    try:
        # Usar o contrato_id da URL, ignorando o do body
        sucesso = inserir_evento_contrato(
            contrato_id=contrato_id,
            tipo_evento=evento.tipo_evento,
            data_evento=evento.data_evento,
            titulo=evento.titulo,
            descricao=evento.descricao,
            valor=evento.valor,
            usuario_id=evento.usuario_id,
            metadados=evento.metadados,
            status=evento.status
        )
        if sucesso:
            return {"message": "Evento criado com sucesso!", "success": True}
        else:
            raise HTTPException(status_code=500, detail="Erro ao criar evento")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar evento: {str(e)}")

@app.get("/api/contratos/{contrato_id}/timeline")
async def obter_timeline_contrato(
    contrato_id: int,
    tipo_evento: Optional[str] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """Obtém a timeline de eventos de um contrato"""
    try:
        eventos = buscar_timeline_contrato(
            contrato_id=contrato_id,
            tipo_evento=tipo_evento,
            data_inicio=data_inicio,
            data_fim=data_fim,
            limit=limit,
            offset=offset
        )
        return {"success": True, "data": eventos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar timeline: {str(e)}")

@app.get("/api/eventos")
async def listar_todos_eventos(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    tipo_evento: Optional[str] = None,
    data_inicio: Optional[date] = None,
    data_fim: Optional[date] = None
):
    """Lista todos os eventos do sistema"""
    try:
        eventos = buscar_todos_eventos(
            limit=limit, offset=offset, tipo_evento=tipo_evento,
            data_inicio=data_inicio, data_fim=data_fim
        )
        return {"success": True, "data": eventos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar eventos: {str(e)}")

@app.put("/api/eventos/{evento_id}")
async def atualizar_evento(evento_id: int, evento: EventoContratoUpdate):
    """Atualiza um evento existente"""
    try:
        sucesso = atualizar_evento_contrato(
            evento_id=evento_id,
            titulo=evento.titulo,
            descricao=evento.descricao,
            valor=evento.valor,
            metadados=evento.metadados,
            status=evento.status
        )
        if sucesso:
            return {"message": "Evento atualizado com sucesso!", "success": True}
        else:
            raise HTTPException(status_code=404, detail="Evento não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar evento: {str(e)}")

@app.delete("/api/eventos/{evento_id}")
async def remover_evento(evento_id: int):
    """Remove um evento"""
    try:
        sucesso = deletar_evento_contrato(evento_id)
        if sucesso:
            return {"message": "Evento removido com sucesso!", "success": True}
        else:
            raise HTTPException(status_code=404, detail="Evento não encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao remover evento: {str(e)}")

@app.get("/api/eventos/tipos")
async def obter_tipos_eventos():
    """Obtém todos os tipos de eventos disponíveis"""
    try:
        tipos = buscar_tipos_eventos()
        return {"success": True, "data": tipos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar tipos de eventos: {str(e)}")

@app.get("/api/eventos/proximos")
async def obter_eventos_proximos(dias: int = Query(30, ge=1, le=365)):
    """Obtém eventos futuros nos próximos dias"""
    try:
        eventos = buscar_eventos_proximos(dias)
        return {"success": True, "data": eventos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar eventos próximos: {str(e)}")

# --- ENDPOINTS DE DASHBOARD ---
@app.get("/api/dashboard")
async def obter_dashboard():
    """Obtém todos os dados do dashboard"""
    try:
        dashboard = obter_dashboard_completo()
        return dashboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter dashboard: {str(e)}")

@app.get("/api/dashboard/metricas")
async def obter_metricas():
    """Obtém métricas gerais"""
    try:
        metricas = obter_metricas_gerais()
        return metricas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter métricas: {str(e)}")

@app.get("/api/dashboard/ocupacao")
async def obter_ocupacao():
    """Obtém dados de ocupação por tipo de imóvel"""
    try:
        ocupacao = obter_ocupacao_imoveis()
        return ocupacao
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter ocupação: {str(e)}")

@app.get("/api/dashboard/vencimentos")
async def obter_vencimentos(dias: int = Query(30, ge=1, le=365)):
    """Obtém contratos próximos do vencimento"""
    try:
        vencimentos = obter_contratos_vencendo(dias)
        return vencimentos
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter vencimentos: {str(e)}")

@app.get("/api/dashboard/alertas")
async def obter_alertas(ativos_apenas: bool = Query(True)):
    """Obtém alertas do sistema"""
    try:
        alertas = obter_alertas_sistema(ativos_apenas)
        return alertas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter alertas: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)