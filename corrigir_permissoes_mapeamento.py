"""
Script para corrigir o mapeamento de permissões entre banco e aplicação
"""

def corrigir_permissoes():
    """Corrige todas as permissões do main.py para usar as chaves corretas do banco"""

    # Ler arquivo atual
    with open('main.py', 'r', encoding='utf-8') as file:
        content = file.read()

    # Mapeamento de correções específicas por contexto
    corrections = [
        # Locadores
        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar locadores.")',
         '_exigir_permissao(permissoes, "ver_locadores", "Usuario sem permissao para visualizar locadores.")'),

        # Locatários
        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar locatarios.")',
         '_exigir_permissao(permissoes, "ver_locatarios", "Usuario sem permissao para visualizar locatarios.")'),

        # Imóveis
        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar imoveis.")',
         '_exigir_permissao(permissoes, "ver_imoveis", "Usuario sem permissao para visualizar imoveis.")'),

        # Contratos
        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar contratos.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar contratos.")'),

        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar historico de contratos.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar historico de contratos.")'),

        # Prestação de Contas
        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar prestacao de contas.")',
         '_exigir_permissao(permissoes, "ver_prestacao_contas", "Usuario sem permissao para visualizar prestacao de contas.")'),

        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar prestacoes de contrato.")',
         '_exigir_permissao(permissoes, "ver_prestacao_contas", "Usuario sem permissao para visualizar prestacoes de contrato.")'),

        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para gerar PDF de prestacao de contas.")',
         '_exigir_permissao(permissoes, "ver_prestacao_contas", "Usuario sem permissao para gerar PDF de prestacao de contas.")'),

        # Faturas (usar contratos por enquanto)
        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar faturas.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar faturas.")'),

        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar estatisticas de faturas.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar estatisticas de faturas.")'),

        # Dashboard
        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar metricas do dashboard.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar metricas do dashboard.")'),

        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar ocupacao do dashboard.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar ocupacao do dashboard.")'),

        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar vencimentos do dashboard.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar vencimentos do dashboard.")'),

        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar alertas do dashboard.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar alertas do dashboard.")'),

        # Contratos para prestação de contas
        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar contratos para prestacao de contas.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar contratos para prestacao de contas.")'),

        # Busca
        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para realizar buscas.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para realizar buscas.")'),

        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar estatisticas de busca.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar estatisticas de busca.")'),

        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar sugestoes de busca.")',
         '_exigir_permissao(permissoes, "ver_contratos", "Usuario sem permissao para visualizar sugestoes de busca.")'),

        ('_exigir_permissao(permissoes, "visualizar", "Usuario sem permissao para visualizar locadores de contrato.")',
         '_exigir_permissao(permissoes, "ver_locadores", "Usuario sem permissao para visualizar locadores de contrato.")'),

        # Editar permissões
        ('_exigir_permissao(permissoes, "editar", "Usuario sem permissao para editar locadores.")',
         '_exigir_permissao(permissoes, "editar_locadores", "Usuario sem permissao para editar locadores.")'),

        ('_exigir_permissao(permissoes, "editar", "Usuario sem permissao para editar locatarios.")',
         '_exigir_permissao(permissoes, "editar_locatarios", "Usuario sem permissao para editar locatarios.")'),

        ('_exigir_permissao(permissoes, "editar", "Usuario sem permissao para editar imoveis.")',
         '_exigir_permissao(permissoes, "editar_imoveis", "Usuario sem permissao para editar imoveis.")'),

        ('_exigir_permissao(permissoes, "editar", "Usuario sem permissao para editar contratos.")',
         '_exigir_permissao(permissoes, "editar_contratos", "Usuario sem permissao para editar contratos.")'),

        # Cadastrar permissões (usar editar)
        ('_exigir_permissao(permissoes, "cadastrar", "Usuario sem permissao para cadastrar locadores.")',
         '_exigir_permissao(permissoes, "editar_locadores", "Usuario sem permissao para cadastrar locadores.")'),

        ('_exigir_permissao(permissoes, "cadastrar", "Usuario sem permissao para cadastrar locatarios.")',
         '_exigir_permissao(permissoes, "editar_locatarios", "Usuario sem permissao para cadastrar locatarios.")'),

        ('_exigir_permissao(permissoes, "cadastrar", "Usuario sem permissao para cadastrar imoveis.")',
         '_exigir_permissao(permissoes, "editar_imoveis", "Usuario sem permissao para cadastrar imoveis.")'),

        ('_exigir_permissao(permissoes, "cadastrar", "Usuario sem permissao para cadastrar contratos.")',
         '_exigir_permissao(permissoes, "editar_contratos", "Usuario sem permissao para cadastrar contratos.")'),

        # Excluir permissões
        ('_exigir_permissao(permissoes, "excluir", "Usuario sem permissao para excluir locadores.")',
         '_exigir_permissao(permissoes, "deletar_locadores", "Usuario sem permissao para excluir locadores.")'),

        ('_exigir_permissao(permissoes, "excluir", "Usuario sem permissao para excluir locatarios.")',
         '_exigir_permissao(permissoes, "deletar_locatarios", "Usuario sem permissao para excluir locatarios.")'),

        ('_exigir_permissao(permissoes, "excluir", "Usuario sem permissao para excluir imoveis.")',
         '_exigir_permissao(permissoes, "deletar_imoveis", "Usuario sem permissao para excluir imoveis.")'),

        ('_exigir_permissao(permissoes, "excluir", "Usuario sem permissao para excluir contratos.")',
         '_exigir_permissao(permissoes, "deletar_contratos", "Usuario sem permissao para excluir contratos.")'),
    ]

    # Aplicar correções
    changes_made = 0
    for old_pattern, new_pattern in corrections:
        if old_pattern in content:
            content = content.replace(old_pattern, new_pattern)
            changes_made += 1

    # Salvar arquivo corrigido
    with open('main.py', 'w', encoding='utf-8') as file:
        file.write(content)

    print(f"Correções aplicadas: {changes_made}")
    print("Arquivo main.py atualizado com mapeamento correto de permissões!")

    return changes_made > 0

if __name__ == "__main__":
    sucesso = corrigir_permissoes()
    if sucesso:
        print("\\nReinicie o servidor para aplicar as mudanças:")
        print("1. Mate o processo atual")
        print("2. Execute: python main.py")
    else:
        print("\\nNenhuma correção foi necessária.")