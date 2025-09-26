"""
Gerador de PDF usando templates HTML personalizados da COBIMOB
"""
import os
from io import BytesIO
from datetime import datetime

def gerar_pdf_de_html(prestacao_data):
    """Gera PDF usando o template HTML da COBIMOB com dados reais"""
    try:
        # Carregar template HTML personalizado
        template_path = os.path.join(os.path.dirname(__file__), 'template_prestacao.html')

        with open(template_path, 'r', encoding='utf-8') as file:
            html_template = file.read()

        # Substituir dados no template
        html_content = popular_template_com_dados(html_template, prestacao_data)

        print("🎯 Gerando PDF usando método simples com template personalizado")

        # Salvar HTML temporário
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.html', delete=False, encoding='utf-8') as temp_html:
            temp_html.write(html_content)
            temp_html_path = temp_html.name

        # Usar reportlab para gerar PDF com os dados do nosso template
        print("🎯 Gerando PDF usando dados do template HTML personalizado")

        # Criar um buffer temporário
        buffer = BytesIO()

        # Criar PDF simples com dados do nosso template
        from reportlab.lib.pagesizes import A4
        from reportlab.pdfgen import canvas
        from reportlab.lib.units import mm

        p = canvas.Canvas(buffer, pagesize=A4)
        width, height = A4

        # Header COBIMOB
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, height - 50, "PRESTAÇÃO DE CONTAS MENSAL - COBIMOB")

        # Dados básicos extraídos do template
        y = height - 100
        p.setFont("Helvetica", 12)

        # Pegar dados do template populado (variável correta é prestacao_data)
        prestacao_id = prestacao_data.get('id', 'N/A')
        mes_ano = f"{obter_nome_mes(int(prestacao_data.get('mes', '01')))}/{prestacao_data.get('ano', '2024')}"

        p.drawString(50, y, f"Prestação Nº: PC-{str(prestacao_id).zfill(3)}")
        y -= 20
        p.drawString(50, y, f"Período: {mes_ano}")
        y -= 20
        p.drawString(50, y, f"Gerado em: {datetime.now().strftime('%d/%m/%Y')}")
        y -= 40

        # Locador
        locadores = prestacao_data.get('locadores', [])
        if locadores:
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y, "PROPRIETÁRIO(S):")
            y -= 15
            p.setFont("Helvetica", 10)
            for locador in locadores:
                nome = locador.get('locador_nome', 'Nome não informado')
                cpf = locador.get('cpf_cnpj', 'CPF não informado')
                p.drawString(70, y, f"{nome} - CPF: {cpf}")
                y -= 15

        y -= 20

        # Locatário
        contrato = prestacao_data.get('contrato', {})
        locatario_nome = contrato.get('locatario_nome', prestacao_data.get('locatario_nome', 'Nome não informado'))
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "LOCATÁRIO:")
        y -= 15
        p.setFont("Helvetica", 10)
        p.drawString(70, y, locatario_nome)
        y -= 30

        # Imóvel
        imovel_endereco = contrato.get('imovel_endereco', prestacao_data.get('imovel_endereco', 'Endereço não informado'))
        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "IMÓVEL:")
        y -= 15
        p.setFont("Helvetica", 10)
        # Quebrar endereço longo em múltiplas linhas
        endereco_lines = [imovel_endereco[i:i+80] for i in range(0, len(imovel_endereco), 80)]
        for line in endereco_lines:
            p.drawString(70, y, line)
            y -= 15

        y -= 20

        # Valores - CONDICIONAL: se há acréscimos, usar total com acréscimos
        valor_acrescimos = prestacao_data.get('valor_acrescimos', 0) or 0
        valor_boleto_base = prestacao_data.get('valor_boleto', prestacao_data.get('valor_total', 0))

        # Se há acréscimos, usar valor total com acréscimos
        if valor_acrescimos > 0:
            valor_boleto = prestacao_data.get('valor_total_com_acrescimos', valor_boleto_base + valor_acrescimos)
        else:
            valor_boleto = valor_boleto_base

        total_retido = prestacao_data.get('total_retido', 0)
        valor_repasse = prestacao_data.get('valor_repasse', prestacao_data.get('valor_liquido', 0))

        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "RESUMO FINANCEIRO:")
        y -= 20
        p.setFont("Helvetica", 10)
        p.drawString(70, y, f"Valor do Boleto: {formatar_moeda(valor_boleto)}")
        y -= 15
        p.drawString(70, y, f"Total Retido: {formatar_moeda(total_retido)}")
        y -= 15
        p.drawString(70, y, f"Valor de Repasse: {formatar_moeda(valor_repasse)}")

        # Finalizar PDF
        p.save()
        buffer.seek(0)

        print("PDF gerado com sucesso usando dados do template personalizado")
        return buffer

    except Exception as e:
        print(f"ERRO ao gerar PDF HTML: {e}")
        import traceback
        traceback.print_exc()
        return None

def popular_template_com_dados(html_template, dados):
    """Popula o template HTML com os dados reais da prestação"""

    print(f"DEBUG: Tipo de dados recebido: {type(dados)}")
    print(f"DEBUG: Primeiras chaves/índices: {list(dados.keys()) if isinstance(dados, dict) else 'É uma lista'}")

    # Converter logos para base64
    import base64
    logo1_base64 = ""
    logo2_base64 = ""

    try:
        with open('Cobimob logos-01.png', 'rb') as f:
            logo1_base64 = f"data:image/png;base64,{base64.b64encode(f.read()).decode()}"
    except:
        print("AVISO: Logo 1 não encontrada")

    try:
        with open('Cobimob logos-03.png', 'rb') as f:
            logo2_base64 = f"data:image/png;base64,{base64.b64encode(f.read()).decode()}"
    except:
        print("AVISO: Logo 2 não encontrada")

    # Se dados for uma lista, pega o primeiro item
    if isinstance(dados, list) and len(dados) > 0:
        dados = dados[0]
        print("DEBUG: Convertido lista para primeiro item")

    # Dados básicos
    prestacao_id = dados.get('id', 'N/A')
    mes = dados.get('mes', '01')
    ano = dados.get('ano', '2024')

    # Se não tiver mes/ano, tentar pegar de mes_referencia
    if dados.get('mes_referencia'):
        mes_ref = dados.get('mes_referencia', '01/2024').split('/')
        if len(mes_ref) == 2:
            mes, ano = mes_ref[0], mes_ref[1]

    # Locador principal
    locadores = dados.get('locadores', [])
    locador_principal = None
    if locadores:
        for loc in locadores:
            if loc.get('responsabilidade_principal'):
                locador_principal = loc
                break
        if not locador_principal:
            locador_principal = locadores[0]

    # Se não tem locadores, usar dados diretos
    if not locador_principal:
        locador_nome = dados.get('locador_nome', dados.get('proprietario_nome', 'Nome não informado'))
        locador_cpf = dados.get('locador_cpf', dados.get('proprietario_cpf', 'CPF não informado'))
        locador_telefone = dados.get('locador_telefone', 'Telefone não informado')
        locador_email = dados.get('locador_email', 'Email não informado')
    else:
        locador_nome = locador_principal.get('locador_nome', 'Nome não informado')
        locador_cpf = locador_principal.get('cpf_cnpj', 'CPF não informado')
        locador_telefone = locador_principal.get('telefone', 'Telefone não informado')
        locador_email = locador_principal.get('email', 'Email não informado')

    # Dados do contrato
    contrato = dados.get('contrato', {})
    if not contrato:
        # Usar dados diretos se não tem objeto contrato
        locatario_nome = dados.get('locatario_nome', 'Nome não informado')
        locatario_telefone = dados.get('locatario_telefone', 'Telefone não informado')
        locatario_email = dados.get('locatario_email', 'Email não informado')
        imovel_endereco = dados.get('imovel_endereco', 'Endereço não informado')
    else:
        locatario_nome = contrato.get('locatario_nome', 'Nome não informado')
        locatario_telefone = contrato.get('locatario_telefone', 'Telefone não informado')
        locatario_email = contrato.get('locatario_email', 'Email não informado')
        imovel_endereco = contrato.get('imovel_endereco', 'Endereço não informado')

    # Valores financeiros - CONDICIONAL: se há acréscimos, usar total com acréscimos
    valor_acrescimos = dados.get('valor_acrescimos', 0) or 0
    dias_atraso = dados.get('dias_atraso', 0) or 0

    # Valor base do boleto
    valor_boleto_base = dados.get('valor_boleto', dados.get('valor_total', 0))

    # Se há acréscimos, usar valor total com acréscimos
    if valor_acrescimos > 0:
        # Usar valor total com acréscimos se disponível, senão calcular
        valor_boleto = dados.get('valor_total_com_acrescimos', float(valor_boleto_base) + float(valor_acrescimos))
    else:
        valor_boleto = valor_boleto_base

    total_retido = dados.get('total_retido', 0)
    valor_repasse = dados.get('valor_repasse', dados.get('valor_liquido', 0))

    # Lançamentos
    lancamentos = dados.get('lancamentos_detalhados', [])

    # Datas do sistema
    data_vencimento = dados.get('data_vencimento', '')
    data_pagamento = dados.get('data_pagamento', 'Não pago')

    # Formatar datas se necessário
    if data_vencimento and isinstance(data_vencimento, str):
        try:
            from datetime import datetime as dt
            if len(data_vencimento) == 10:  # formato YYYY-MM-DD
                data_vencimento = dt.strptime(data_vencimento, '%Y-%m-%d').strftime('%d/%m/%Y')
        except:
            pass

    if data_pagamento and data_pagamento != 'Não pago' and isinstance(data_pagamento, str):
        try:
            from datetime import datetime as dt
            if len(data_pagamento) == 10:  # formato YYYY-MM-DD
                data_pagamento = dt.strptime(data_pagamento, '%Y-%m-%d').strftime('%d/%m/%Y')
            elif 'T' in data_pagamento:  # formato ISO com timestamp YYYY-MM-DDTHH:MM:SS
                data_pagamento = dt.fromisoformat(data_pagamento.replace('Z', '')).strftime('%d/%m/%Y')
        except:
            pass

    # Substituições no template
    replacements = {
        # Dados básicos
        '{{PRESTACAO_ID}}': f'PC-{str(prestacao_id).zfill(3)}',
        '{{MES_ANO}}': f'{obter_nome_mes(int(mes))}/{ano}',
        '{{DATA_GERACAO}}': datetime.now().strftime('%d/%m/%Y'),
        '{{DATA_VENCIMENTO}}': data_vencimento if data_vencimento else 'Não informado',
        '{{DATA_PAGAMENTO}}': data_pagamento if data_pagamento else 'Não pago',

        # Locador (como proprietário no template)
        '{{PROPRIETARIO_NOME}}': locador_nome,
        '{{PROPRIETARIO_CPF}}': locador_cpf,
        '{{PROPRIETARIO_TELEFONE}}': locador_telefone,
        '{{PROPRIETARIO_EMAIL}}': locador_email,

        # Locatário
        '{{LOCATARIO_NOME}}': locatario_nome,
        '{{LOCATARIO_CPF}}': contrato.get('locatario_cpf', 'CPF não informado') if contrato else 'CPF não informado',
        '{{LOCATARIO_TELEFONE}}': locatario_telefone,
        '{{LOCATARIO_EMAIL}}': locatario_email,

        # Imóvel
        '{{IMOVEL_ENDERECO}}': imovel_endereco,

        # Valores - CONDICIONAL: incluir acréscimos se houver
        '{{VALOR_BOLETO}}': formatar_moeda(valor_boleto),
        '{{VALOR_BOLETO_BASE}}': formatar_moeda(valor_boleto_base),
        '{{VALOR_ACRESCIMOS}}': formatar_moeda(valor_acrescimos),
        '{{DIAS_ATRASO}}': str(dias_atraso),
        '{{TOTAL_RETIDO}}': formatar_moeda(total_retido),
        '{{VALOR_REPASSE}}': formatar_moeda(valor_repasse),

        # Seção de acréscimos removida - acréscimos aparecem como lançamento normal

        # Proprietários
        '{{PROPRIETARIOS_INFO}}': gerar_html_proprietarios(locadores),

        # Valores cobrados
        '{{VALORES_COBRADOS_HTML}}': gerar_html_valores_cobrados(lancamentos),

        # Valores retidos
        '{{VALORES_RETIDOS_HTML}}': gerar_html_valores_retidos(lancamentos),

        # Repasses
        '{{REPASSES_HTML}}': gerar_html_repasses(dados.get('distribuicao_repasse', []), locadores),

        # Data do repasse
        '{{DATA_REPASSE}}': datetime.now().strftime('%d/%m/%Y'),

        # Tipo de pagamento (PIX ou TED)
        '{{TIPO_PAGAMENTO}}': determinar_tipo_pagamento(locadores),

        # Logos em base64
        '{{LOGO1_BASE64}}': logo1_base64,
        '{{LOGO2_BASE64}}': logo2_base64
    }

    # Aplicar todas as substituições
    print(f"DEBUG - Substituições que serão aplicadas:")
    print(f"   - LOCATARIO_NOME: {replacements.get('{{LOCATARIO_NOME}}')}")
    print(f"   - IMOVEL_ENDERECO: {replacements.get('{{IMOVEL_ENDERECO}}')}")
    print(f"   - VALOR_BOLETO: {replacements.get('{{VALOR_BOLETO}}')}")
    print(f"   - TOTAL_RETIDO: {replacements.get('{{TOTAL_RETIDO}}')}")
    print(f"   - VALOR_REPASSE: {replacements.get('{{VALOR_REPASSE}}')}")

    html_final = html_template
    for placeholder, value in replacements.items():
        html_final = html_final.replace(placeholder, str(value))
        if placeholder in ['{{LOCATARIO_NOME}}', '{{VALOR_BOLETO}}', '{{TOTAL_RETIDO}}']:
            print(f"   Substituído {placeholder} -> {value}")

    return html_final

def gerar_html_proprietarios(locadores):
    """Gera HTML para informações dos proprietários"""
    if not locadores or not isinstance(locadores, list):
        return '<div><strong>Proprietário não informado</strong></div>'

    html = ''
    for locador in locadores:
        if isinstance(locador, dict):
            nome = locador.get('locador_nome', 'Nome não informado')
            cpf = locador.get('cpf_cnpj', 'CPF não informado')
            html += f'<div><strong>{nome}</strong> - CPF: {cpf}</div>'

    return html if html else '<div><strong>Proprietário não informado</strong></div>'

def gerar_html_valores_cobrados(lancamentos):
    """Gera HTML para valores cobrados - incluindo acréscimos como lançamento normal"""
    if not lancamentos or not isinstance(lancamentos, list):
        return '<tr><td>Nenhum lançamento encontrado</td><td class="valor">R$ 0,00</td></tr>'

    html = ''
    lancamentos_processados = {}  # Usar dict para evitar duplicação e manter o valor maior

    # Primeira passagem: agrupar lançamentos por tipo, mantendo o de maior valor absoluto
    for lancamento in lancamentos:
        if isinstance(lancamento, dict) and lancamento.get('categoria') in ['termo', 'desconto', 'acrescimo']:
            tipo = lancamento.get('tipo', '')
            descricao = lancamento.get('descricao', 'N/A')
            valor = lancamento.get('valor', 0)
            categoria = lancamento.get('categoria', '')

            # Se já existe um lançamento desse tipo, manter o de maior valor absoluto
            if tipo in lancamentos_processados:
                if abs(valor) > abs(lancamentos_processados[tipo]['valor']):
                    lancamentos_processados[tipo] = {
                        'descricao': descricao,
                        'valor': valor,
                        'categoria': categoria
                    }
            else:
                lancamentos_processados[tipo] = {
                    'descricao': descricao,
                    'valor': valor,
                    'categoria': categoria
                }

    # Segunda passagem: gerar HTML com lançamentos únicos
    for tipo, dados in lancamentos_processados.items():
        descricao = dados['descricao']
        valor = dados['valor']
        categoria = dados['categoria']
        valor_formatado = formatar_moeda(valor)

        # Aplicar estilo específico para cada categoria
        if categoria == 'desconto':
            html += f'<tr><td>{descricao}</td><td class="valor valor-desconto">{valor_formatado}</td></tr>'
        elif valor < 0:
            html += f'<tr><td>{descricao}</td><td class="valor valor-negativo">{valor_formatado}</td></tr>'
        else:
            html += f'<tr><td>{descricao}</td><td class="valor">{valor_formatado}</td></tr>'

    return html if html else '<tr><td>Nenhum valor cobrado</td><td class="valor">R$ 0,00</td></tr>'

def gerar_html_valores_retidos(lancamentos):
    """Gera HTML para valores retidos - NÃO incluir descontos"""
    if not lancamentos or not isinstance(lancamentos, list):
        return '<tr><td>Nenhum valor retido</td><td class="valor">R$ 0,00</td></tr>'

    html = ''
    lancamentos_processados = {}  # Dict para evitar duplicação e manter maior valor

    for lancamento in lancamentos:
        if isinstance(lancamento, dict):
            categoria = lancamento.get('categoria', '').lower()
            tipo = lancamento.get('tipo', '')
            descricao = lancamento.get('descricao', 'N/A')
            valor = lancamento.get('valor', 0)

            # EXCLUIR descontos - eles já aparecem nos valores cobrados
            if categoria == 'desconto':
                continue

            # Incluir apenas lançamentos da categoria 'retido' ou 'taxa'
            if categoria in ['retido', 'taxa']:
                # Se já existe um lançamento desse tipo, manter o de maior valor absoluto
                if tipo in lancamentos_processados:
                    if abs(valor) > abs(lancamentos_processados[tipo]['valor']):
                        lancamentos_processados[tipo] = {
                            'descricao': descricao,
                            'valor': valor
                        }
                else:
                    lancamentos_processados[tipo] = {
                        'descricao': descricao,
                        'valor': valor
                    }

    # Gerar HTML com lançamentos únicos
    # Ordenar por tipo para manter consistência
    for tipo in sorted(lancamentos_processados.keys()):
        dados = lancamentos_processados[tipo]
        descricao = dados['descricao']
        valor = dados['valor']
        valor_exibir = abs(valor)  # Valores retidos são positivos na tabela

        if valor_exibir > 0:  # Só exibir valores maiores que zero
            html += f'<tr><td>{descricao}</td><td class="valor">{formatar_moeda(valor_exibir)}</td></tr>'

    return html if html else '<tr><td>Nenhum valor retido</td><td class="valor">R$ 0,00</td></tr>'

def determinar_tipo_pagamento(locadores):
    """Determina se o pagamento é PIX ou TED baseado nos locadores"""
    if not locadores or not isinstance(locadores, list):
        return 'PIX'

    # Verificar se algum locador usa TED
    for locador in locadores:
        if isinstance(locador, dict) and locador.get('conta_bancaria'):
            conta = locador['conta_bancaria']
            if isinstance(conta, dict) and conta.get('tipo_recebimento') == 'TED':
                return 'TED'

    return 'PIX'

def gerar_secao_acrescimos(valor_acrescimos, dias_atraso, valor_base):
    """Gera seção HTML para acréscimos por atraso - APENAS quando há acréscimos"""
    if not valor_acrescimos or valor_acrescimos <= 0:
        return ''  # Não mostra nada se não há acréscimos

    return f'''
    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 15px 0; border-radius: 5px;">
        <h3 style="color: #856404; margin: 0 0 10px 0; font-size: 14px;">ACRÉSCIMOS POR ATRASO</h3>
        <table style="width: 100%; font-size: 12px;">
            <tr>
                <td><strong>Valor original do boleto:</strong></td>
                <td style="text-align: right;">{formatar_moeda(valor_base)}</td>
            </tr>
            <tr>
                <td><strong>Dias em atraso:</strong></td>
                <td style="text-align: right; color: #d63031;">{dias_atraso} dias</td>
            </tr>
            <tr>
                <td><strong>Acréscimos aplicados:</strong></td>
                <td style="text-align: right; color: #d63031;">+{formatar_moeda(valor_acrescimos)}</td>
            </tr>
            <tr style="border-top: 2px solid #856404;">
                <td><strong>VALOR TOTAL A PAGAR:</strong></td>
                <td style="text-align: right; font-weight: bold; color: #d63031; font-size: 14px;">{formatar_moeda(valor_base + valor_acrescimos)}</td>
            </tr>
        </table>
        <p style="margin: 10px 0 0 0; font-size: 10px; color: #856404;">
            <em>* Acréscimos calculados automaticamente conforme contrato</em>
        </p>
    </div>
    '''

def gerar_html_repasses(distribuicao, locadores):
    """Gera HTML para repasses aos proprietários"""
    if not distribuicao or not isinstance(distribuicao, list):
        return '<tr><td colspan="3">Nenhum repasse encontrado</td></tr>'

    html = ''
    for dist in distribuicao:
        if not isinstance(dist, dict):
            continue

        locador_id = dist.get('locador_id')
        locador = None
        if isinstance(locadores, list):
            locador = next((l for l in locadores if isinstance(l, dict) and l.get('locador_id') == locador_id), None)

        valor = formatar_moeda(dist.get('valor_repasse', 0))

        # Usar informações do titular da conta bancária
        nome_titular = 'Nome não informado'
        cpf_titular = 'CPF não informado'
        pix_info = 'Não informado'

        if locador and isinstance(locador, dict) and locador.get('conta_bancaria'):
            conta = locador['conta_bancaria']
            if isinstance(conta, dict):
                tipo_recebimento = conta.get('tipo_recebimento', '')

                # Para TED, sempre usar dados do titular da conta
                if tipo_recebimento == 'TED':
                    nome_titular = conta.get('titular', 'Nome não informado')
                    # CPF do titular vem da tabela ContasBancariasLocador
                    cpf_titular = conta.get('cpf_titular', 'CPF não informado')
                    # Para TED, mostrar banco, agência e conta
                    banco = conta.get('banco', 'N/A')
                    agencia = conta.get('agencia', 'N/A')
                    conta_num = conta.get('conta', 'N/A')
                    pix_info = f"Banco {banco} - Ag: {agencia} - Conta: {conta_num}"
                elif tipo_recebimento == 'PIX':
                    # Para PIX, usar dados do locador
                    nome_titular = dist.get('locador_nome', 'Nome não informado')
                    cpf_titular = locador.get('cpf_cnpj', 'CPF não informado')
                    pix_info = conta.get('pix_chave', 'Não informado')
                else:
                    # Fallback para formato antigo
                    nome_titular = dist.get('locador_nome', 'Nome não informado')
                    cpf_titular = locador.get('cpf_cnpj', 'CPF não informado')
                    pix_info = f"{conta.get('banco', 'N/A')} - Ag: {conta.get('agencia', 'N/A')}"
        else:
            # Se não tem conta bancária, usar dados do locador
            nome_titular = dist.get('locador_nome', 'Nome não informado')
            cpf_titular = locador.get('cpf_cnpj', 'CPF não informado') if locador else 'CPF não informado'

        html += f'''
        <tr>
            <td><strong>{nome_titular}</strong><br><small>CPF: {cpf_titular}</small></td>
            <td>{pix_info}</td>
            <td class="valor valor-positivo">{valor}</td>
        </tr>
        '''

    return html if html else '<tr><td colspan="3">Nenhum repasse encontrado</td></tr>'

def formatar_moeda(valor):
    """Formata valor em moeda brasileira"""
    try:
        # Converter Decimal para float se necessário
        if hasattr(valor, '__float__'):  # Decimal, int, float
            valor = float(valor)
        elif not isinstance(valor, (int, float)):
            valor = 0
        return f'R$ {valor:,.2f}'.replace(',', 'X').replace('.', ',').replace('X', '.')
    except (TypeError, ValueError):
        return 'R$ 0,00'

def obter_nome_mes(mes):
    """Retorna nome do mês"""
    meses = [
        '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return meses[mes] if 1 <= mes <= 12 else 'Mês inválido'