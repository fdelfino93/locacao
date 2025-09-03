from repositories_adapter import atualizar_contrato

# Testar diretamente a função sem caracteres especiais
contrato_id = 1

dados_simples = {
    "valor_aluguel": 1500.00,
    "data_entrega_chaves": "2024-01-20",
    "periodo_contrato": 18
}

print(f"Testando funcao direta atualizar_contrato")
print(f"Contrato ID: {contrato_id}")
print(f"Dados: {dados_simples}")

try:
    resultado = atualizar_contrato(contrato_id, **dados_simples)
    print(f"Resultado: {resultado}")
    
    if resultado:
        print("SUCESSO: Contrato atualizado!")
    else:
        print("FALHA: Contrato NAO foi atualizado")
except Exception as e:
    print(f"ERRO: {e}")
    import traceback
    traceback.print_exc()