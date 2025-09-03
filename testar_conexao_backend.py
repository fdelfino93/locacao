#!/usr/bin/env python3
"""
Script para testar a conexão e funções do backend
"""
import sys
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def testar_variaveis_ambiente():
    """Testa se as variáveis de ambiente estão sendo carregadas"""
    print("=== TESTANDO VARIÁVEIS DE AMBIENTE ===")
    
    vars_necessarias = ['DB_DRIVER', 'DB_SERVER', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD']
    
    for var in vars_necessarias:
        valor = os.getenv(var)
        if valor:
            # Mascarar senha para segurança
            if 'PASSWORD' in var:
                valor_mascarado = '*' * len(valor)
                print(f"  {var}: {valor_mascarado}")
            else:
                print(f"  {var}: {valor}")
        else:
            print(f"  {var}: ERRO NÃO DEFINIDA")
    
    return all(os.getenv(var) for var in vars_necessarias)

def testar_conexao():
    """Testa a conexão com o banco"""
    print("\n=== TESTANDO CONEXÃO COM BANCO ===")
    
    try:
        from repositories_adapter import get_conexao
        
        conn = get_conexao()
        if conn:
            print("  OK Conexão estabelecida com sucesso")
            
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM Contratos")
            count = cursor.fetchone()[0]
            print(f"  OK Teste de consulta: {count} contratos encontrados")
            
            conn.close()
            return True
        else:
            print("  ERRO Falha na conexão")
            return False
            
    except Exception as e:
        print(f"  ERRO Erro na conexão: {e}")
        return False

def testar_funcoes_locadores():
    """Testa as funções de locadores"""
    print("\n=== TESTANDO FUNÇÕES DE LOCADORES ===")
    
    try:
        from repositories_adapter import salvar_locadores_contrato, buscar_locadores_contrato
        
        # Dados de teste
        contrato_id = 4
        locadores_teste = [
            {
                'locador_id': 1,
                'conta_bancaria_id': 1, 
                'porcentagem': 100.0,
                'responsabilidade_principal': True
            }
        ]
        
        print(f"  Testando salvar_locadores_contrato com contrato {contrato_id}...")
        resultado = salvar_locadores_contrato(contrato_id, locadores_teste)
        
        if resultado:
            print("  OK salvar_locadores_contrato funcionou")
            
            print("  Testando buscar_locadores_contrato...")
            locadores = buscar_locadores_contrato(contrato_id)
            print(f"  OK buscar_locadores_contrato retornou {len(locadores)} locadores")
            
        else:
            print("  ERRO salvar_locadores_contrato falhou")
            
        return resultado
        
    except Exception as e:
        print(f"  ERRO Erro nas funções de locadores: {e}")
        import traceback
        traceback.print_exc()
        return False

def testar_funcoes_locatarios():
    """Testa as funções de locatários"""
    print("\n=== TESTANDO FUNÇÕES DE LOCATÁRIOS ===")
    
    try:
        from repositories_adapter import salvar_locatarios_contrato, buscar_locatarios_contrato
        
        # Dados de teste - mesmos dados do erro
        contrato_id = 4
        locatarios_teste = [
            {
                "locatario_id": 1,
                "responsabilidade_principal": True,
                "percentual_responsabilidade": 50.0
            },
            {
                "locatario_id": 2,
                "responsabilidade_principal": False,
                "percentual_responsabilidade": 50.0
            }
        ]
        
        print(f"  Testando salvar_locatarios_contrato com contrato {contrato_id}...")
        print(f"  Dados: {locatarios_teste}")
        
        resultado = salvar_locatarios_contrato(contrato_id, locatarios_teste)
        
        if resultado:
            print("  OK salvar_locatarios_contrato funcionou")
            
            print("  Testando buscar_locatarios_contrato...")
            locatarios = buscar_locatarios_contrato(contrato_id)
            print(f"  OK buscar_locatarios_contrato retornou {len(locatarios)} locatários")
            
        else:
            print("  ERRO salvar_locatarios_contrato falhou")
            
        return resultado
        
    except Exception as e:
        print(f"  ERRO Erro nas funções de locatários: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Função principal"""
    print("TESTANDO BACKEND - DIAGNOSTICO COMPLETO")
    print("=" * 50)
    
    # Testar variáveis de ambiente
    vars_ok = testar_variaveis_ambiente()
    
    if not vars_ok:
        print("\nERRO FALHA: Variáveis de ambiente não estão configuradas")
        return False
    
    # Testar conexão
    conexao_ok = testar_conexao()
    
    if not conexao_ok:
        print("\nERRO FALHA: Não foi possível conectar ao banco")
        return False
    
    # Testar funções
    locadores_ok = testar_funcoes_locadores()
    locatarios_ok = testar_funcoes_locatarios()
    
    # Resultado final
    print("\n" + "=" * 50)
    print(" RESULTADO DO DIAGNÓSTICO:")
    print(f"  Variáveis de ambiente: {'OK' if vars_ok else 'ERRO'}")
    print(f"  Conexão com banco: {'OK' if conexao_ok else 'ERRO'}")
    print(f"  Funções de locadores: {'OK' if locadores_ok else 'ERRO'}")
    print(f"  Funções de locatários: {'OK' if locatarios_ok else 'ERRO'}")
    
    sucesso_total = vars_ok and conexao_ok and locadores_ok and locatarios_ok
    
    if sucesso_total:
        print("\n DIAGNÓSTICO: TUDO FUNCIONANDO!")
    else:
        print("\nAVISO DIAGNÓSTICO: PROBLEMAS ENCONTRADOS")
    
    return sucesso_total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)