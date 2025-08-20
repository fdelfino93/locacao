from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Importar apenas os repositórios básicos
from repositories_adapter import buscar_locadores, buscar_locatarios, buscar_imoveis

load_dotenv()

app = FastAPI(title="Cobimob API - Teste", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "http://localhost:3004", "http://localhost:3005"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Cobimob API - Conexão reestabelecida!", "status": "online"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

@app.get("/api/locadores")
async def listar_locadores():
    try:
        print("Chamando buscar_locadores()...")
        locadores = buscar_locadores()
        print(f"Resultado: {len(locadores)} locadores encontrados")
        return {"data": locadores, "success": True, "count": len(locadores)}
    except Exception as e:
        print(f"Erro capturado: {str(e)}")
        return {"error": f"Erro ao buscar locadores: {str(e)}", "success": False}

@app.get("/api/locatarios")
async def listar_locatarios():
    try:
        locatarios = buscar_locatarios()
        return {"data": locatarios, "success": True, "count": len(locatarios)}
    except Exception as e:
        return {"error": f"Erro ao buscar locatários: {str(e)}", "success": False}

@app.get("/api/imoveis")
async def listar_imoveis():
    try:
        imoveis = buscar_imoveis()
        return {"data": imoveis, "success": True, "count": len(imoveis)}
    except Exception as e:
        return {"error": f"Erro ao buscar imóveis: {str(e)}", "success": False}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8003)