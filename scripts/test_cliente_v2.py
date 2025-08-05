"""
Script de teste para a nova estrutura de clientes
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from locacao.repositories.cliente_repository_v2 import ClienteService, EnderecoService, DadosBancariosService

def test_endereco_service():
    """Testa o serviço de endereços"""
    print("1. Testando EnderecoService...")
    
    try:
        # Testar parseamento de endereço legado
        endereco_legado = "Rua das Flores, 123 - Centro - São Paulo - SP - 01234-567"
        parsed = EnderecoService.parsear_endereco_legado(endereco_legado)
        
        print(f"   Endereço original: {endereco_legado}")
        print(f"   Rua: {parsed['rua']}")
        print(f"   Número: {parsed['numero']}")
        print(f"   CEP: {parsed['cep']}")
        
        # Testar inserção de endereço
        endereco_id = EnderecoService.inserir_endereco(
            rua="Rua Teste",
            numero="999",
            bairro="Centro",
            cidade="Curitiba",
            estado="PR",
            cep="80000-000"
        )
        print(f"   Endereço inserido com ID: {endereco_id}")
        
        # Testar busca
        endereco_encontrado = EnderecoService.buscar_endereco(endereco_id)
        print(f"   Endereço encontrado: {endereco_encontrado['rua']}, {endereco_encontrado['numero']}")
        
        print("   OK EnderecoService funcionando!")
        
    except Exception as e:
        print(f"   ERRO no EnderecoService: {e}")

def test_dados_bancarios_service():
    """Testa o serviço de dados bancários"""
    print("\n2. Testando DadosBancariosService...")
    
    try:
        # Testar inserção PIX
        dados_id = DadosBancariosService.inserir_dados_bancarios(
            tipo_recebimento="PIX",
            chave_pix="usuario@email.com",
            titular="João Silva",
            cpf_titular="12345678901"
        )
        print(f"   Dados bancários PIX inseridos com ID: {dados_id}")
        
        # Testar busca
        dados_encontrados = DadosBancariosService.buscar_dados_bancarios(dados_id)
        print(f"   Tipo: {dados_encontrados['tipo_recebimento']}")
        print(f"   Chave PIX: {dados_encontrados['chave_pix']}")
        
        print("   OK DadosBancariosService funcionando!")
        
    except Exception as e:
        print(f"   ERRO no DadosBancariosService: {e}")

def test_cliente_service():
    """Testa o serviço principal de clientes"""
    print("\n3. Testando ClienteService...")
    
    try:
        # Testar validação de CPF/CNPJ
        valido, tipo = ClienteService.validar_cpf_cnpj("123.456.789-01")
        print(f"   Validação CPF: {valido}, Tipo: {tipo}")
        
        # Testar inserção de cliente com nova estrutura
        ClienteService.inserir_cliente_v2(
            nome="Cliente Teste V2",
            cpf_cnpj="12345678901",
            telefone="(41) 99999-9999",
            email="teste@email.com",
            endereco_rua="Rua Nova",
            endereco_numero="456",
            endereco_bairro="Bairro Novo",
            endereco_cidade="Curitiba",
            endereco_cep="80000-001",
            tipo_recebimento="PIX",
            chave_pix="teste@pix.com",
            observacoes="Cliente de teste da nova estrutura"
        )
        print("   OK Cliente inserido com nova estrutura!")
        
        # Testar busca com nova estrutura
        clientes = ClienteService.buscar_clientes_v2()
        print(f"   Total de clientes encontrados: {len(clientes)}")
        
        if clientes:
            ultimo_cliente = clientes[-1]
            print(f"   Último cliente: {ultimo_cliente['nome']}")
            if ultimo_cliente['endereco']:
                print(f"   Endereço: {ultimo_cliente['endereco']['endereco_completo']}")
            if ultimo_cliente['dados_bancarios']:
                print(f"   Recebimento: {ultimo_cliente['dados_bancarios']['tipo_recebimento']}")
        
        print("   OK ClienteService funcionando!")
        
    except Exception as e:
        print(f"   ERRO no ClienteService: {e}")

def test_compatibilidade():
    """Testa compatibilidade com código existente"""
    print("\n4. Testando compatibilidade...")
    
    try:
        from locacao.repositories.cliente_repository_v2 import buscar_clientes, buscar_cliente_por_id
        
        clientes = buscar_clientes()
        print(f"   Função legada buscar_clientes(): {len(clientes)} clientes")
        
        if clientes:
            cliente = buscar_cliente_por_id(clientes[0]['id'])
            print(f"   Função legada buscar_cliente_por_id(): {cliente['nome']}")
        
        print("   OK Compatibilidade mantida!")
        
    except Exception as e:
        print(f"   ERRO na compatibilidade: {e}")

if __name__ == "__main__":
    print("TESTE DA NOVA ESTRUTURA DE CLIENTE V2")
    print("=" * 40)
    
    test_endereco_service()
    test_dados_bancarios_service()
    test_cliente_service()
    test_compatibilidade()
    
    print("\n" + "=" * 40)
    print("TESTES CONCLUIDOS!")
    print("\nSe todos os testes passaram, a nova estrutura esta funcionando!")
    print("Proximo passo: Atualizar o frontend para usar os novos campos.")