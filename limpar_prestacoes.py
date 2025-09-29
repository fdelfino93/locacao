"""
Script para limpar todas as prestações de contas do banco de dados
Executa limpeza completa para começar com dados reais
"""
import pyodbc
from repositories_adapter import get_conexao

def limpar_todas_prestacoes():
    """Limpa todas as prestações de contas e lançamentos relacionados"""
    try:
        print("=" * 60)
        print("INICIANDO LIMPEZA COMPLETA DAS PRESTAÇÕES DE CONTAS")
        print("=" * 60)

        conn = get_conexao()
        cursor = conn.cursor()

        # 1. Contar quantas prestações existem antes da limpeza
        cursor.execute("SELECT COUNT(*) FROM PrestacaoContas WHERE ativo = 1")
        qtd_prestacoes = cursor.fetchone()[0]
        print(f"\n[OK] Encontradas {qtd_prestacoes} prestações ativas no banco")

        # 2. Contar lançamentos relacionados
        cursor.execute("SELECT COUNT(*) FROM LancamentosPrestacaoContas WHERE ativo = 1")
        qtd_lancamentos = cursor.fetchone()[0]
        print(f"[OK] Encontrados {qtd_lancamentos} lançamentos ativos")

        if qtd_prestacoes == 0:
            print("\n[AVISO] Nenhuma prestação encontrada para limpar!")
            return

        resposta = input(f"\n[ATENCAO]: Isso irá DELETAR permanentemente {qtd_prestacoes} prestações e {qtd_lancamentos} lançamentos!\nTem certeza? (S/N): ")

        if resposta.upper() != 'S':
            print("\n[X] Limpeza cancelada pelo usuário")
            return

        print("\n[...] Iniciando limpeza...")

        # 3. Marcar todos os lançamentos como inativos (soft delete)
        print("   - Desativando lançamentos...")
        cursor.execute("""
            UPDATE LancamentosPrestacaoContas
            SET ativo = 0,
                data_atualizacao = GETDATE()
            WHERE ativo = 1
        """)
        lancamentos_afetados = cursor.rowcount

        # 4. Marcar todas as prestações como inativas (soft delete)
        print("   - Desativando prestações...")
        cursor.execute("""
            UPDATE PrestacaoContas
            SET ativo = 0,
                data_atualizacao = GETDATE()
            WHERE ativo = 1
        """)
        prestacoes_afetadas = cursor.rowcount

        # 5. Opcional: DELETE físico (descomente se quiser remover permanentemente)
        # print("   - Deletando lançamentos permanentemente...")
        # cursor.execute("DELETE FROM LancamentosPrestacaoContas")
        #
        # print("   - Deletando prestações permanentemente...")
        # cursor.execute("DELETE FROM PrestacaoContas")

        # 6. Resetar contadores de identidade (opcional - só se fizer delete físico)
        # cursor.execute("DBCC CHECKIDENT ('PrestacaoContas', RESEED, 0)")
        # cursor.execute("DBCC CHECKIDENT ('LancamentosPrestacaoContas', RESEED, 0)")

        # Confirmar transação
        conn.commit()

        print("\n[OK] LIMPEZA CONCLUIDA COM SUCESSO!")
        print(f"   - {prestacoes_afetadas} prestações desativadas")
        print(f"   - {lancamentos_afetados} lançamentos desativados")

        # 7. Verificar resultado
        cursor.execute("SELECT COUNT(*) FROM PrestacaoContas WHERE ativo = 1")
        qtd_final = cursor.fetchone()[0]
        print(f"\n[STATUS] Final: {qtd_final} prestacoes ativas no banco")

        conn.close()
        print("\n[PRONTO] Banco de dados pronto para dados reais!")

    except Exception as e:
        print(f"\n[ERRO] Durante a limpeza: {e}")
        if conn:
            conn.rollback()
            conn.close()
        raise e

def limpar_prestacoes_por_contrato(contrato_id=None):
    """Limpa prestações de um contrato específico ou todos se não especificado"""
    try:
        conn = get_conexao()
        cursor = conn.cursor()

        if contrato_id:
            print(f"\n[LIMPANDO] Prestacoes do contrato {contrato_id}...")

            # Desativar lançamentos do contrato
            cursor.execute("""
                UPDATE LancamentosPrestacaoContas
                SET ativo = 0
                WHERE prestacao_id IN (
                    SELECT id FROM PrestacaoContas
                    WHERE contrato_id = ? AND ativo = 1
                )
            """, (contrato_id,))

            # Desativar prestações do contrato
            cursor.execute("""
                UPDATE PrestacaoContas
                SET ativo = 0
                WHERE contrato_id = ? AND ativo = 1
            """, (contrato_id,))

            print(f"[OK] Prestacoes do contrato {contrato_id} limpas!")
        else:
            limpar_todas_prestacoes()

        conn.commit()
        conn.close()

    except Exception as e:
        print(f"[ERRO]: {e}")
        if conn:
            conn.rollback()
            conn.close()

if __name__ == "__main__":
    print("\n[LIMPEZA] SCRIPT DE LIMPEZA DE PRESTACOES DE CONTAS")
    print("-" * 60)
    print("Opções:")
    print("1. Limpar TODAS as prestações")
    print("2. Limpar prestações de um contrato específico")
    print("3. Cancelar")

    opcao = input("\nEscolha uma opção (1-3): ")

    if opcao == "1":
        limpar_todas_prestacoes()
    elif opcao == "2":
        contrato_id = input("Digite o ID do contrato: ")
        if contrato_id.isdigit():
            limpar_prestacoes_por_contrato(int(contrato_id))
        else:
            print("[ERRO] ID do contrato invalido!")
    else:
        print("[X] Operacao cancelada")