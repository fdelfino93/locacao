#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para testar a conectividade entre frontend e backend
"""
import requests
import time

def testar_comunicacao():
    print("TESTE DE COMUNICACAO FRONTEND <-> BACKEND")
    print("=" * 50)
    
    # URLs para testar
    backend_url = "http://localhost:8000"
    frontend_url = "http://localhost:3002"
    
    print(f"\nBackend URL: {backend_url}")
    print(f"Frontend URL: {frontend_url}")
    
    # Testar health check do backend
    print("\n1. Testando health check do backend...")
    try:
        response = requests.get(f"{backend_url}/health", timeout=5)
        if response.status_code == 200:
            print("  OK - Backend health check passou")
            print(f"  Resposta: {response.json()}")
        else:
            print(f"  ERRO - Health check falhou com status {response.status_code}")
            return False
    except Exception as e:
        print(f"  ERRO - Nao foi possivel conectar ao backend: {str(e)}")
        return False
    
    # Testar endpoints principais
    endpoints = [
        "/api/locadores",
        "/api/locatarios", 
        "/api/imoveis",
        "/api/contratos"
    ]
    
    print("\n2. Testando endpoints principais...")
    for endpoint in endpoints:
        try:
            response = requests.get(f"{backend_url}{endpoint}", timeout=5)
            if response.status_code == 200:
                data = response.json()
                count = len(data.get('data', []))
                print(f"  OK {endpoint}: {count} registros")
            else:
                print(f"  ERRO {endpoint}: Status {response.status_code}")
        except Exception as e:
            print(f"  ERRO {endpoint}: {str(e)}")
    
    # Testar se o frontend está acessível
    print("\n3. Testando acessibilidade do frontend...")
    try:
        response = requests.get(frontend_url, timeout=5)
        if response.status_code == 200:
            print("  OK - Frontend acessivel")
        else:
            print(f"  AVISO - Frontend retornou status {response.status_code}")
    except Exception as e:
        print(f"  AVISO - Frontend pode nao estar rodando: {str(e)}")
    
    # Testar CORS
    print("\n4. Testando configuracao CORS...")
    try:
        headers = {
            'Origin': 'http://localhost:3002',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
        }
        response = requests.options(f"{backend_url}/api/locadores", headers=headers, timeout=5)
        
        if 'Access-Control-Allow-Origin' in response.headers:
            allowed_origin = response.headers.get('Access-Control-Allow-Origin')
            print(f"  OK - CORS configurado. Allow-Origin: {allowed_origin}")
        else:
            print("  AVISO - Headers CORS nao encontrados")
            
    except Exception as e:
        print(f"  ERRO - Teste CORS falhou: {str(e)}")
    
    return True

if __name__ == "__main__":
    print("Aguardando 2 segundos para os servicos estabilizarem...")
    time.sleep(2)
    
    sucesso = testar_comunicacao()
    
    print("\n" + "=" * 50)
    if sucesso:
        print("DIAGNOSTICO: Comunicacao entre frontend e backend OK!")
        print("\nSERVICOS DISPONIVEIS:")
        print("- Backend API: http://localhost:8000")
        print("- Frontend App: http://localhost:3002")
        print("- Documentacao API: http://localhost:8000/docs")
    else:
        print("DIAGNOSTICO: Problemas na comunicacao detectados!")
        print("\nVERIFIQUE:")
        print("1. Backend rodando na porta 8000")
        print("2. Frontend rodando na porta 3002")
        print("3. Configuracao CORS atualizada")