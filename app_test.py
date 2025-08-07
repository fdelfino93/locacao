#!/usr/bin/env python3
"""
FastAPI de teste simples para Prestacao de Contas
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn

app = FastAPI(title="Cobimob API", version="1.0.0")

# CORS para desenvolvimento
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos
class Cliente(BaseModel):
    id: Optional[int] = None
    nome: str
    cpf_cnpj: str = "000.000.000-00"
    telefone: str = "(00) 00000-0000"
    email: str = "test@test.com"

class LancamentoPrestacao(BaseModel):
    id: Optional[int] = None
    prestacao_id: Optional[int] = None
    tipo: str
    descricao: str
    valor: float
    data_lancamento: Optional[str] = None

class PrestacaoContas(BaseModel):
    id: Optional[int] = None
    cliente_id: int
    mes: str
    ano: str
    referencia: str
    valor_pago: float
    valor_vencido: float
    encargos: float
    deducoes: float
    total_bruto: float
    total_liquido: float
    status: str
    pagamento_atrasado: bool
    observacoes_manuais: Optional[str] = None
    observacoes: Optional[str] = None
    data_criacao: Optional[str] = None
    data_atualizacao: Optional[str] = None
    lancamentos: Optional[List[LancamentoPrestacao]] = []

# Dados de teste em memória
clientes_db = [
    {"id": 1, "nome": "João Silva", "cpf_cnpj": "123.456.789-00", "telefone": "(11) 99999-9999", "email": "joao@email.com"},
    {"id": 2, "nome": "Maria Santos", "cpf_cnpj": "987.654.321-00", "telefone": "(11) 88888-8888", "email": "maria@email.com"},
    {"id": 3, "nome": "Pedro Costa", "cpf_cnpj": "456.789.123-00", "telefone": "(11) 77777-7777", "email": "pedro@email.com"}
]

prestacoes_db = []

# Endpoints
@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "API funcionando"}

@app.get("/api/clientes")
async def listar_clientes():
    return clientes_db

@app.get("/api/prestacao-contas/{cliente_id}/{mes}/{ano}")
async def buscar_prestacao(cliente_id: int, mes: str, ano: str):
    # Buscar prestação existente
    for prestacao in prestacoes_db:
        if (prestacao["cliente_id"] == cliente_id and 
            prestacao["mes"] == mes and 
            prestacao["ano"] == ano):
            return prestacao
    
    # Se não encontrar, retornar 404
    raise HTTPException(status_code=404, detail="Prestação não encontrada")

@app.post("/api/prestacao-contas")
async def criar_prestacao(prestacao: PrestacaoContas):
    # Simular criação no banco
    nova_prestacao = prestacao.dict()
    nova_prestacao["id"] = len(prestacoes_db) + 1
    nova_prestacao["data_criacao"] = "2024-12-01"
    nova_prestacao["data_atualizacao"] = "2024-12-01"
    
    prestacoes_db.append(nova_prestacao)
    
    return {"message": "Prestação criada com sucesso", "data": nova_prestacao}

@app.put("/api/prestacao-contas/{prestacao_id}")
async def atualizar_prestacao(prestacao_id: int, prestacao: PrestacaoContas):
    # Buscar e atualizar prestação
    for i, p in enumerate(prestacoes_db):
        if p["id"] == prestacao_id:
            prestacao_atualizada = prestacao.dict()
            prestacao_atualizada["id"] = prestacao_id
            prestacao_atualizada["data_atualizacao"] = "2024-12-01"
            prestacoes_db[i] = prestacao_atualizada
            return {"message": "Prestação atualizada", "data": prestacao_atualizada}
    
    raise HTTPException(status_code=404, detail="Prestação não encontrada")

@app.post("/api/prestacao-contas/ajustes")
async def salvar_ajustes(dados: dict):
    # Endpoint legado de ajustes
    return {"message": "Ajustes salvos com sucesso"}

@app.get("/api/prestacao-contas/export/excel/{cliente_id}/{mes}/{ano}")
async def exportar_excel(cliente_id: int, mes: str, ano: str):
    # Simular export Excel
    return {"message": "Excel gerado com sucesso", "filename": f"prestacao_{cliente_id}_{mes}_{ano}.xlsx"}

@app.get("/api/prestacao-contas/export/pdf/{cliente_id}/{mes}/{ano}")
async def exportar_pdf(cliente_id: int, mes: str, ano: str):
    # Simular export PDF
    return {"message": "PDF gerado com sucesso", "filename": f"prestacao_{cliente_id}_{mes}_{ano}.pdf"}

if __name__ == "__main__":
    print("Iniciando servidor FastAPI de teste...")
    print("Frontend: http://localhost:5173")
    print("Backend: http://localhost:8000")
    print("Docs: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)