#!/usr/bin/env python3
"""
Script de teste simples para verificar funcionalidades de Prestacao de Contas
"""

import json
import requests
import sys

BASE_URL = "http://localhost:8000/api"
HEADERS = {"Content-Type": "application/json"}

def main():
    print("INICIANDO TESTES DA PRESTACAO DE CONTAS")
    print("="*50)
    
    # Teste 1: Conexao com API
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✓ API Backend esta funcionando")
        else:
            print("✗ API Backend nao esta funcionando")
            return
    except:
        print("✗ API Backend nao esta rodando na porta 8000")
        return
    
    # Teste 2: Buscar clientes
    try:
        response = requests.get(f"{BASE_URL}/clientes")
        if response.status_code == 200:
            clientes = response.json()
            print(f"✓ Busca de clientes OK - {len(clientes)} encontrados")
            if clientes:
                cliente_id = clientes[0].get('id', 1)
            else:
                cliente_id = 1
        else:
            print("✗ Erro ao buscar clientes")
            cliente_id = 1
    except Exception as e:
        print(f"✗ Erro na busca de clientes: {e}")
        cliente_id = 1
    
    print(f"Usando cliente ID {cliente_id} para testes")
    
    # Teste 3: Buscar prestacao existente
    try:
        response = requests.get(f"{BASE_URL}/prestacao-contas/{cliente_id}/11/2024")
        if response.status_code == 200:
            print("✓ Busca de prestacao existente OK")
        elif response.status_code == 404:
            print("- Nenhuma prestacao encontrada (normal)")
        else:
            print(f"✗ Erro na busca: {response.status_code}")
    except Exception as e:
        print(f"✗ Erro na busca: {e}")
    
    # Teste 4: Criar nova prestacao
    dados_teste = {
        "cliente_id": cliente_id,
        "mes": "12", 
        "ano": "2024",
        "referencia": "12/2024",
        "valor_pago": 1500.00,
        "valor_vencido": 0.00,
        "encargos": 150.00,
        "deducoes": 50.00,
        "total_bruto": 1650.00,
        "total_liquido": 1600.00,
        "status": "pago",
        "observacoes_manuais": "Teste automatizado",
        "pagamento_atrasado": False,
        "lancamentos": [
            {
                "tipo": "receita",
                "descricao": "Aluguel do mes", 
                "valor": 1500.00,
                "data_lancamento": "2024-12-01"
            }
        ]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/prestacao-contas", 
                               json=dados_teste, headers=HEADERS)
        if response.status_code in [200, 201]:
            print("✓ Criacao de prestacao OK")
        else:
            print(f"✗ Erro ao criar prestacao: {response.status_code}")
            if response.text:
                print(f"Resposta: {response.text[:200]}")
    except Exception as e:
        print(f"✗ Erro na criacao: {e}")
    
    print("\n" + "="*50)
    print("RESUMO DOS INPUTS TESTADOS:")
    print("✓ Cliente:", cliente_id)
    print("✓ Referencia (mes/ano): 12/2024")  
    print("✓ Valor pago: R$ 1.500,00")
    print("✓ Valor vencido: R$ 0,00")
    print("✓ Encargos: R$ 150,00")
    print("✓ Deducoes: R$ 50,00")
    print("✓ Total bruto: R$ 1.650,00")
    print("✓ Total liquido: R$ 1.600,00")
    print("✓ Status: pago")
    print("✓ Observacoes manuais: Teste automatizado")
    print("✓ Lancamentos: 1 item (receita)")
    print("\nFRONTEND: http://localhost:5173")
    print("BACKEND: http://localhost:8000")

if __name__ == "__main__":
    main()