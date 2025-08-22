from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import date
import os
from dotenv import load_dotenv

# Importar repositórios existentes via adapter
from repositories_adapter import (
    inserir_locador, buscar_locadores,
    inserir_locatario, buscar_locatarios,
    inserir_imovel, buscar_imoveis,
    inserir_contrato, buscar_contratos, buscar_contratos_por_locador,
    buscar_faturas, buscar_estatisticas_faturas, buscar_fatura_por_id, gerar_boleto_fatura
)

load_dotenv()

app = FastAPI(title="Cobimob API", version="1.0.0", description="Sistema de Locações")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:3005"],
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

# Endpoints da API
@app.get("/")
async def root():
    return {"message": "Cobimob API - Sistema de Locações", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

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
        return {"data": locadores, "success": True, "count": len(locadores)}
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
        return {"data": locatarios, "success": True, "count": len(locatarios)}
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
async def listar_imoveis(locador_id: int = None):
    try:
        imoveis = buscar_imoveis()
        
        # Filtrar por locador se especificado
        if locador_id:
            imoveis = [imovel for imovel in imoveis if imovel.get('id_locador') == locador_id]
        
        return {"data": imoveis, "success": True, "count": len(imoveis)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar imóveis: {str(e)}")

# --- ENDPOINTS DE CONTRATOS ---
@app.post("/api/contratos")
async def criar_contrato(contrato: ContratoCreate):
    try:
        inserir_contrato(
            id_imovel=contrato.id_imovel,
            id_inquilino=contrato.id_locatario,
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

@app.get("/api/contratos")
async def listar_contratos(locador_id: int = None):
    try:
        if locador_id:
            contratos = buscar_contratos_por_locador(locador_id)
        else:
            contratos = buscar_contratos()
        return {"data": contratos, "success": True, "count": len(contratos)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contratos: {str(e)}")

# --- ENDPOINTS DO DASHBOARD ---
@app.get("/api/dashboard/metricas")
async def obter_metricas_dashboard():
    try:
        locadores = buscar_locadores()
        locatarios = buscar_locatarios()
        imoveis = buscar_imoveis()
        contratos = buscar_contratos()
        
        return {
            "total_contratos": len(contratos),
            "contratos_ativos": len([c for c in contratos if c.get('status') == 'Ativo']),
            "receita_mensal": sum([float(i.get('valor_aluguel', 0)) for i in imoveis]),
            "crescimento_percentual": 8.5,
            "total_clientes": len(locadores),
            "novos_clientes_mes": 2
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar métricas: {str(e)}")

@app.get("/api/dashboard/ocupacao")
async def obter_ocupacao_dashboard():
    try:
        imoveis = buscar_imoveis()
        total_imoveis = len(imoveis)
        ocupados = len([i for i in imoveis if i.get('status') == 'Ativo'])
        
        return {
            "taxa_ocupacao": (ocupados / total_imoveis * 100) if total_imoveis > 0 else 0,
            "unidades_ocupadas": ocupados,
            "unidades_totais": total_imoveis,
            "unidades_disponiveis": total_imoveis - ocupados,
            "ocupacao_por_tipo": [
                {"tipo": "Apartamento", "total": 2, "ocupadas": 1, "percentual": 50},
                {"tipo": "Casa", "total": 0, "ocupadas": 0, "percentual": 0}
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar ocupação: {str(e)}")

@app.get("/api/dashboard/vencimentos")
async def obter_vencimentos_dashboard():
    return []

@app.get("/api/dashboard/alertas")
async def obter_alertas_dashboard():
    return [
        {
            "id": 1,
            "tipo": "vencimento",
            "titulo": "Contrato próximo ao vencimento",
            "descricao": "Contrato de João Silva vence em 15 dias",
            "severidade": "MEDIO",
            "data_criacao": "2024-08-20T10:00:00",
            "ativo": True
        }
    ]

@app.get("/api/dashboard")
async def obter_dashboard_completo():
    try:
        metricas = await obter_metricas_dashboard()
        ocupacao = await obter_ocupacao_dashboard()
        vencimentos = await obter_vencimentos_dashboard()
        alertas = await obter_alertas_dashboard()
        
        return {
            "metricas": metricas,
            "ocupacao": ocupacao,
            "vencimentos": vencimentos,
            "alertas": alertas,
            "timestamp": "2024-08-20T20:00:00"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar dashboard: {str(e)}")

# --- ENDPOINTS DE FATURAS ---
@app.get("/api/faturas")
async def listar_faturas(
    status: str = None,
    data_inicio: str = None,
    data_fim: str = None,
    mes: str = None,
    ano: str = None,
    search: str = None,
    locador_id: int = None,
    valor_min: float = None,
    valor_max: float = None,
    page: int = 1,
    limit: int = 20,
    order_by: str = 'data_vencimento',
    order_dir: str = 'DESC'
):
    try:
        # Construir filtros
        filtros = {}
        if status:
            filtros['status'] = status.split(',')
        if data_inicio:
            filtros['data_inicio'] = data_inicio
        if data_fim:
            filtros['data_fim'] = data_fim
        if mes:
            filtros['mes'] = mes
        if ano:
            filtros['ano'] = ano
        if search:
            filtros['search'] = search
        if locador_id:
            filtros['locador_id'] = locador_id
        if valor_min:
            filtros['valor_min'] = valor_min
        if valor_max:
            filtros['valor_max'] = valor_max
        
        # Buscar faturas
        resultado = buscar_faturas(filtros, page, limit, order_by, order_dir)
        
        # Buscar estatísticas com os mesmos filtros
        stats = buscar_estatisticas_faturas(filtros)
        
        return {
            "data": resultado['data'],
            "total": resultado['total'],
            "page": resultado['page'],
            "pages": resultado['pages'],
            "stats": stats,
            "success": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar faturas: {str(e)}")

@app.get("/api/faturas/stats")
async def obter_estatisticas_faturas():
    try:
        stats = buscar_estatisticas_faturas()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar estatísticas: {str(e)}")

@app.get("/api/faturas/{fatura_id}")
async def obter_fatura(fatura_id: int):
    try:
        fatura = buscar_fatura_por_id(fatura_id)
        if not fatura:
            raise HTTPException(status_code=404, detail="Fatura não encontrada")
        return {"data": fatura, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar fatura: {str(e)}")

@app.post("/api/faturas/{fatura_id}/gerar-boleto")
async def gerar_boleto(fatura_id: int):
    try:
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

class AlterarStatusRequest(BaseModel):
    status: str
    motivo: Optional[str] = None

@app.put("/api/faturas/{fatura_id}/status")
async def alterar_status_fatura(fatura_id: int, request: AlterarStatusRequest):
    try:
        from repositories_adapter import alterar_status_fatura
        resultado = alterar_status_fatura(fatura_id, request.status, request.motivo)
        
        if resultado:
            return {"message": f"Status da fatura {fatura_id} alterado para {request.status}", "success": True}
        else:
            raise HTTPException(status_code=404, detail="Fatura não encontrada")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao alterar status da fatura: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)