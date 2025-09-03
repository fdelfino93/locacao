from repositories_adapter import atualizar_contrato

# Testar a função diretamente
print("=== TESTE DIRETO DA FUNCAO atualizar_contrato ===")

# Dados para teste
contrato_id = 1
dados_teste = {
    "valor_aluguel": 2500.00,
    "taxa_administracao": 10.5,
    "bonificacao": 100.00,
    "data_entrega_chaves": "2024-01-15",
    "periodo_contrato": 24,
    "tempo_renovacao": 12,
    "tempo_reajuste": 12,
    "parcelas_iptu": 12,
    "valor_fci": 50.00
}

print(f"\nTestando contrato ID: {contrato_id}")
print(f"Dados a enviar: {list(dados_teste.keys())}")

# Chamar a função
resultado = atualizar_contrato(contrato_id, **dados_teste)

print(f"\nResultado: {resultado}")
if resultado:
    print("SUCESSO: Contrato atualizado!")
else:
    print("ERRO: Falha ao atualizar contrato")