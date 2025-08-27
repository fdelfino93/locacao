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

# Importar funções específicas para dashboard
from dashboard_sql_server import (
    obter_metricas_dashboard,
    obter_ocupacao_dashboard,
    obter_vencimentos_dashboard,
    obter_alertas_dashboard
)
from datetime import datetime

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
    metragem: float
    numero_quartos: int
    numero_banheiros: int
    numero_vagas: int
    andar: int
    mobiliado: bool
    aceita_animais: bool
    valor_condominio: float
    valor_iptu_mensal: float
    finalidade_imovel: str
    nome_edificio: str
    armario_embutido: int = 0
    escritorio: int = 0
    area_servico: int = 0

class ContratoCreate(BaseModel):
    id_imovel: int
    id_locatario: int
    data_inicio: date
    data_fim: date
    tipo_garantia: str
    vencimento_dia: int
    taxa_administracao: float
    antecipacao_encargos: bool
    aluguel_garantido: bool
    mes_de_referencia: str
    tipo_plano_locacao: str
    retidos: str
    info_garantias: str
    valor_aluguel: float
    valor_desconto: float
    valor_multa: float
    valor_caucao: float
    data_caucao_dev: date
    numero_contrato: str
    status: str

# Rotas para Locadores
@app.post("/api/locadores")
async def criar_locador(locador: LocadorCreate):
    try:
        novo_locador = inserir_locador(**locador.dict())
        return {"data": novo_locador, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar locador: {str(e)}")

@app.get("/api/locadores")
async def listar_locadores():
    try:
        locadores = buscar_locadores()
        return {"data": locadores, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locadores: {str(e)}")

# Rotas para Locatarios
@app.post("/api/locatarios")
async def criar_locatario(locatario: LocatarioCreate):
    try:
        novo_locatario = inserir_locatario(**locatario.dict())
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

# Rotas para Imóveis
@app.post("/api/imoveis")
async def criar_imovel(imovel: ImovelCreate):
    try:
        novo_imovel = inserir_imovel(**imovel.dict())
        return {"data": novo_imovel, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar imóvel: {str(e)}")

@app.get("/api/imoveis")
async def listar_imoveis():
    try:
        imoveis = buscar_imoveis()
        return {"data": imoveis, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar imóveis: {str(e)}")

# Rotas para Contratos
@app.post("/api/contratos")
async def criar_contrato(contrato: ContratoCreate):
    try:
        novo_contrato = inserir_contrato(**contrato.dict())
        return {"data": novo_contrato, "success": True}
    except Exception as e:
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

# Endpoints para Prestação de Contas
@app.get("/api/faturas")
async def listar_faturas(
    status: Optional[str] = None, 
    mes: Optional[int] = None,
    ano: Optional[int] = None,
    sort_field: Optional[str] = None,
    sort_direction: Optional[str] = 'DESC',
    search: Optional[str] = None
):
    try:
        faturas = buscar_faturas(status, mes, ano, sort_field, sort_direction, search)
        return faturas
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)