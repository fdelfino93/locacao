"""
Teste de performance das melhorias implementadas
"""
import time
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from locacao.repositories.cliente_repository_v2 import ClienteService, EnderecoService, DadosBancariosService
from locacao.repositories.cliente_repository import buscar_clientes as buscar_legado

def test_performance_comparison():
    """Compara performance entre método legado e novo"""
    print("TESTE DE PERFORMANCE")
    print("=" * 30)
    
    # Teste método legado
    start_time = time.time()
    clientes_legado = buscar_legado()
    tempo_legado = time.time() - start_time
    
    print(f"Método LEGADO:")
    print(f"  Clientes encontrados: {len(clientes_legado)}")
    print(f"  Tempo execução: {tempo_legado:.4f}s")
    
    # Teste método novo
    start_time = time.time()
    clientes_novo = ClienteService.buscar_clientes_v2()
    tempo_novo = time.time() - start_time
    
    print(f"Método NOVO (V2):")
    print(f"  Clientes encontrados: {len(clientes_novo)}")
    print(f"  Tempo execução: {tempo_novo:.4f}s")
    
    # Comparação
    if tempo_novo < tempo_legado:
        melhoria = ((tempo_legado - tempo_novo) / tempo_legado) * 100
        print(f"  MELHORIA: {melhoria:.1f}% mais rápido")
    else:
        piora = ((tempo_novo - tempo_legado) / tempo_legado) * 100
        print(f"  IMPACTO: {piora:.1f}% mais lento (esperado devido a JOINs)")

def test_data_quality():
    """Testa qualidade dos dados estruturados"""
    print(f"\nTESTE DE QUALIDADE DOS DADOS")
    print("=" * 30)
    
    clientes = ClienteService.buscar_clientes_v2()
    
    total_clientes = len(clientes)
    com_endereco_estruturado = sum(1 for c in clientes if c['endereco'])
    com_dados_bancarios = sum(1 for c in clientes if c['dados_bancarios'])
    com_tipo_pessoa = sum(1 for c in clientes if c['tipo_pessoa'])
    
    print(f"Total de clientes: {total_clientes}")
    print(f"Com endereço estruturado: {com_endereco_estruturado} ({(com_endereco_estruturado/total_clientes)*100:.1f}%)")
    print(f"Com dados bancários: {com_dados_bancarios} ({(com_dados_bancarios/total_clientes)*100:.1f}%)")
    print(f"Com tipo pessoa definido: {com_tipo_pessoa} ({(com_tipo_pessoa/total_clientes)*100:.1f}%)")
    
    if com_endereco_estruturado > 0:
        print(f"\nExemplo de endereço estruturado:")
        for cliente in clientes:
            if cliente['endereco']:
                endereco = cliente['endereco']
                print(f"  Cliente: {cliente['nome']}")
                print(f"  Rua: {endereco['rua']}")
                print(f"  Número: {endereco['numero']}")
                print(f"  Bairro: {endereco['bairro']}")
                print(f"  Cidade: {endereco['cidade']}")
                print(f"  CEP: {endereco['cep']}")
                break
    
    if com_dados_bancarios > 0:
        print(f"\nExemplo de dados bancários estruturados:")
        for cliente in clientes:
            if cliente['dados_bancarios']:
                dados = cliente['dados_bancarios']
                print(f"  Cliente: {cliente['nome']}")
                print(f"  Tipo: {dados['tipo_recebimento']}")
                print(f"  Chave PIX: {dados['chave_pix']}")
                break

def test_validation_functions():
    """Testa funções de validação"""
    print(f"\nTESTE DE VALIDAÇÕES")
    print("=" * 30)
    
    test_cases = [
        ("123.456.789-01", "CPF válido"),
        ("12.345.678/0001-90", "CNPJ válido"),
        ("12345678901", "CPF sem formatação"),
        ("12345678000190", "CNPJ sem formatação"),
        ("123", "Documento inválido"),
        ("", "Documento vazio")
    ]
    
    for documento, descricao in test_cases:
        valido, tipo = ClienteService.validar_cpf_cnpj(documento)
        status = "VÁLIDO" if valido else "INVÁLIDO"
        print(f"  {descricao}: {documento} -> {status} ({tipo})")

if __name__ == "__main__":
    test_performance_comparison()
    test_data_quality()
    test_validation_functions()
    
    print(f"\nTESTE DE PERFORMANCE CONCLUÍDO!")