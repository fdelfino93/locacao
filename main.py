from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Union
from datetime import date
import os
from dotenv import load_dotenv

# Importar repositórios existentes via adapter
from repositories_adapter import (
    inserir_locador, buscar_locadores, atualizar_locador,
    inserir_locatario, buscar_locatarios, atualizar_locatario,
    inserir_imovel, buscar_imoveis, atualizar_imovel,
    inserir_contrato, buscar_contratos, buscar_contratos_por_locador, buscar_contrato_por_id,
    buscar_faturas, buscar_estatisticas_faturas, buscar_fatura_por_id, gerar_boleto_fatura
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
    tipo_garantia: Optional[str] = None
    responsavel_pgto_agua: Optional[str] = None
    responsavel_pgto_luz: Optional[str] = None
    responsavel_pgto_gas: Optional[str] = None
    rg: Optional[str] = None
    dados_empresa: Optional[str] = None
    representante: Optional[str] = None
    nacionalidade: Optional[str] = "Brasileira"
    estado_civil: Optional[str] = "Solteiro"
    profissao: Optional[str] = None
    dados_moradores: Optional[str] = None
    Endereco_inq: Optional[str] = None
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

class LocatarioUpdate(BaseModel):
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

class EnderecoImovelInput(BaseModel):
    rua: str
    numero: str
    complemento: Optional[str] = None
    bairro: str
    cidade: str
    estado: str = "PR"
    cep: Optional[str] = None

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
    armario_embutido: Optional[int] = None
    escritorio: Optional[int] = None
    area_servico: Optional[int] = None
    ativo: Optional[bool] = None
    observacoes: Optional[str] = None

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

# Rotas para Locadores
@app.post("/api/locadores")
async def criar_locador(locador: LocadorCreate):
    try:
        novo_locador = inserir_locador(**locador.dict())
        return {"data": novo_locador, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar locador: {str(e)}")

@app.put("/api/locadores/{locador_id}")
async def atualizar_locador_endpoint(locador_id: int, locador: LocadorCreate):
    try:
        print(f"ENDPOINT: Iniciando atualização de locador ID: {locador_id}")
        print(f"ENDPOINT: Dados recebidos: {locador.model_dump()}")
        
        # Primeiro verificar se conseguimos buscar o locador
        print(f"ENDPOINT: Tentando buscar locador {locador_id} antes da atualização...")
        locadores = buscar_locadores()
        locador_existente = next((loc for loc in locadores if loc.get('id') == locador_id), None)
        
        if locador_existente:
            print(f"ENDPOINT: Locador encontrado na busca: {locador_existente.get('nome')}")
        else:
            print(f"ENDPOINT: Locador {locador_id} não encontrado na busca geral")
        
        # Chamar função de atualização real
        print(f"ENDPOINT: Chamando atualizar_locador({locador_id}, **kwargs)")
        sucesso = atualizar_locador(locador_id, **locador.model_dump())
        print(f"ENDPOINT: Resultado da atualização: {sucesso}")
        
        if not sucesso:
            raise HTTPException(status_code=404, detail="Locador não encontrado ou erro na atualização")
            
        locador_atualizado = {"id": locador_id, **locador.model_dump()}
        
        return {
            "data": locador_atualizado, 
            "success": True, 
            "message": f"Locador {locador_id} atualizado com sucesso!"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"ENDPOINT ERROR: Erro geral ao atualizar locador: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar locador: {str(e)}")

@app.get("/api/locadores/{locador_id}")
async def buscar_locador_por_id(locador_id: int):
    try:
        print(f"Buscando locador ID: {locador_id}")
        
        # Por enquanto, usar busca geral e filtrar
        locadores = buscar_locadores()
        locador = next((loc for loc in locadores if loc.get('id') == locador_id), None)
        
        if not locador:
            raise HTTPException(status_code=404, detail="Locador não encontrado")
            
        return {"data": locador, "success": True}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao buscar locador: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao buscar locador: {str(e)}")

@app.get("/api/locadores")
async def listar_locadores():
    try:
        locadores = buscar_locadores()
        return {"data": locadores, "success": True}
    except Exception as e:
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

@app.put("/api/locatarios/{locatario_id}")
async def atualizar_locatario_endpoint(locatario_id: int, locatario: LocatarioUpdate):
    try:
        print(f"ENDPOINT: Iniciando atualização de locatário ID: {locatario_id}")
        print(f"ENDPOINT: Dados recebidos: {locatario.model_dump()}")
        
        # Chamar função de atualização
        print(f"ENDPOINT: Chamando atualizar_locatario({locatario_id}, **kwargs)")
        sucesso = atualizar_locatario(locatario_id, **locatario.model_dump())
        print(f"ENDPOINT: Resultado da atualização: {sucesso}")
        
        if not sucesso:
            raise HTTPException(status_code=404, detail="Locatário não encontrado ou erro na atualização")
            
        locatario_atualizado = {"id": locatario_id, **locatario.model_dump()}
        
        return {
            "data": locatario_atualizado, 
            "success": True, 
            "message": f"Locatário {locatario_id} atualizado com sucesso!"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"ENDPOINT ERROR: Erro geral ao atualizar locatário: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar locatário: {str(e)}")

@app.get("/api/locatarios/{locatario_id}")
async def buscar_locatario_por_id(locatario_id: int):
    try:
        print(f"Buscando locatário ID: {locatario_id}")
        
        # Usar busca geral e filtrar
        locatarios = buscar_locatarios()
        locatario = next((loc for loc in locatarios if loc.get('id') == locatario_id), None)
        
        if not locatario:
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

@app.put("/api/imoveis/{imovel_id}")
async def atualizar_imovel_endpoint(imovel_id: int, imovel: ImovelUpdate):
    try:
        print(f"ENDPOINT: Iniciando atualização de imóvel ID: {imovel_id}")
        print(f"ENDPOINT: Dados recebidos: {imovel.model_dump()}")
        
        # Chamar função de atualização
        print(f"ENDPOINT: Chamando atualizar_imovel({imovel_id}, **kwargs)")
        sucesso = atualizar_imovel(imovel_id, **imovel.model_dump())
        print(f"ENDPOINT: Resultado da atualização: {sucesso}")
        
        if not sucesso:
            raise HTTPException(status_code=404, detail="Imóvel não encontrado ou erro na atualização")
            
        imovel_atualizado = {"id": imovel_id, **imovel.model_dump()}
        
        return {
            "data": imovel_atualizado, 
            "success": True, 
            "message": f"Imóvel {imovel_id} atualizado com sucesso!"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"ENDPOINT ERROR: Erro geral ao atualizar imóvel: {str(e)}")
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
        
        # 🆕 Se tem endereco_id, buscar dados estruturados
        endereco_id = imovel.get('endereco_id')
        if endereco_id:
            print(f"🏠 Buscando endereço estruturado ID: {endereco_id}")
            from repositories_adapter import buscar_endereco_imovel
            endereco_estruturado = buscar_endereco_imovel(endereco_id)
            if endereco_estruturado:
                imovel['endereco_estruturado'] = endereco_estruturado
                print(f"✅ Endereço estruturado adicionado: {endereco_estruturado}")
            
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

@app.put("/api/contratos/{contrato_id}")
async def atualizar_contrato(contrato_id: int, contrato: ContratoUpdate):
    try:
        from repositories_adapter import atualizar_contrato as atualizar_contrato_db
        resultado = atualizar_contrato_db(contrato_id, **contrato.dict(exclude_unset=True))
        
        if resultado:
            return {"message": f"Contrato {contrato_id} atualizado com sucesso", "success": True}
        else:
            raise HTTPException(status_code=404, detail="Contrato não encontrado ou nenhuma alteração foi feita")
    except HTTPException:
        raise
    except Exception as e:
        print(f"Erro ao atualizar contrato: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar contrato: {str(e)}")

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
        if not query or (len(query) < 2 and query != '*'):
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)