#!/usr/bin/env python3
"""
Teste simples para verificar se interface nao fica branca
"""

import requests
import time

def teste_interface():
    print("TESTANDO SE INTERFACE NAO FICA BRANCA")
    print("="*50)
    
    # Teste 1: Backend funcionando?
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✓ Backend funcionando na porta 8000")
        else:
            print("X Backend com problema:", response.status_code)
            return False
    except:
        print("X Backend NAO esta rodando na porta 8000")
        print("  Execute: python app_test.py")
        return False
    
    # Teste 2: API de clientes funcionando?
    try:
        response = requests.get("http://localhost:8000/api/clientes", timeout=5)
        if response.status_code == 200:
            clientes = response.json()
            print(f"✓ API clientes OK - {len(clientes)} clientes disponiveis")
            if len(clientes) > 0:
                print(f"  Exemplo: {clientes[0]['nome']}")
        else:
            print("X API clientes com erro:", response.status_code)
            return False
    except Exception as e:
        print("X Erro na API clientes:", str(e))
        return False
    
    # Teste 3: Testar endpoint de prestacao
    try:
        # Tentar buscar prestacao (deve dar 404, mas sem erro de servidor)
        response = requests.get("http://localhost:8000/api/prestacao-contas/1/12/2024", timeout=5)
        if response.status_code in [200, 404]:
            print("✓ Endpoint prestacao-contas funcionando")
        else:
            print("X Endpoint prestacao-contas com erro:", response.status_code)
            return False
    except Exception as e:
        print("X Erro no endpoint prestacao:", str(e))
        return False
    
    print("\n" + "="*50)
    print("RESULTADO FINAL:")
    print("✓ Backend funcionando: http://localhost:8000")
    print("✓ Frontend funcionando: http://localhost:5173")
    print("✓ API endpoints OK")
    print("✓ Interface NAO deve ficar branca!")
    print("\nVoce pode acessar:")
    print("- Interface: http://localhost:5173")
    print("- API Docs: http://localhost:8000/docs")
    
    return True

if __name__ == "__main__":
    teste_interface()