from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from datetime import date
import os
from dotenv import load_dotenv

# Importar repositórios existentes
from locacao.repositories.locador_repository import inserir_locador, buscar_locadores
from locacao.repositories.locatario_repository import inserir_locatario, buscar_locatarios
from locacao.repositories.imovel_repository import inserir_imovel, buscar_imoveis
from locacao.repositories.contrato_repository import inserir_contrato
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

load_dotenv()

app = FastAPI(title="Cobimob API", version="1.0.0")

# Configurar CORS para permitir requisições do frontend React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],  # URLs comuns do React/Vite dev server
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)