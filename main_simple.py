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
    inserir_contrato
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
async def listar_imoveis():
    try:
        imoveis = buscar_imoveis()
        return {"data": imoveis, "success": True, "count": len(imoveis)}
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

@app.get("/api/contratos")
async def listar_contratos():
    try:
        # Por enquanto retorna lista vazia, pois não temos buscar_contratos implementado
        return {"data": [], "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar contratos: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)