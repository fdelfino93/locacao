import requests

# Verificar contratos existentes
response = requests.get("http://localhost:8000/api/contratos")
if response.status_code == 200:
    contratos = response.json().get('data', [])
    print(f"Total de contratos: {len(contratos)}")
    for contrato in contratos[:5]:  # Mostrar apenas os primeiros 5
        print(f"- Contrato ID: {contrato.get('id')} - Locatário: {contrato.get('id_locatario')} - Imóvel: {contrato.get('id_imovel')}")
else:
    print(f"Erro ao buscar contratos: {response.status_code}")