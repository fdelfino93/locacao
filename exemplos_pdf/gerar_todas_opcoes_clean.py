"""
Gerador Completo de 5 Opções Clean para Prestação de Contas - COBIMOB
Visual moderno mas minimalista, baseado no estilo das prestações CONDO
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch, mm

def criar_estilo_clean_cobimob():
    """Define os estilos clean baseados na identidade COBIMOB"""
    styles = getSampleStyleSheet()

    # Cores COBIMOB - mais sutis
    TEAL_SUAVE = colors.Color(0.118, 0.624, 0.561, alpha=0.8)
    CINZA_ESCURO = colors.Color(0.176, 0.220, 0.282)
    CINZA_CLARO = colors.Color(0.918, 0.925, 0.941)

    titulo_principal = ParagraphStyle(
        'TituloPrincipal',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=CINZA_ESCURO,
        alignment=1,
        spaceAfter=15,
        fontName='Helvetica-Bold'
    )

    secao_titulo = ParagraphStyle(
        'SecaoTitulo',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=CINZA_ESCURO,
        alignment=0,
        spaceBefore=15,
        spaceAfter=8,
        fontName='Helvetica-Bold',
        backColor=CINZA_CLARO,
        leftIndent=5,
        rightIndent=5,
        topPadding=5,
        bottomPadding=5
    )

    return {
        'titulo_principal': titulo_principal,
        'secao_titulo': secao_titulo,
        'texto_normal': styles['Normal'],
        'cores': {
            'teal': TEAL_SUAVE,
            'cinza_escuro': CINZA_ESCURO,
            'cinza_claro': CINZA_CLARO
        }
    }

def criar_cabecalho_clean(canvas, doc, estilo):
    """Cria cabeçalho clean com logo COBIMOB"""
    canvas.saveState()

    # Logo COBIMOB
    canvas.setFont('Helvetica-Bold', 28)
    canvas.setFillColor(estilo['cores']['teal'])
    canvas.drawString(50, A4[1] - 50, "Cobi")
    canvas.setFillColor(colors.Color(0.925, 0.282, 0.600))
    canvas.drawString(110, A4[1] - 50, "M")
    canvas.setFillColor(colors.Color(0.419, 0.275, 0.757))
    canvas.drawString(130, A4[1] - 50, "ob")

    # Linha sutil
    canvas.setStrokeColor(estilo['cores']['cinza_claro'])
    canvas.setLineWidth(1)
    canvas.line(50, A4[1] - 65, A4[0] - 50, A4[1] - 65)

    canvas.restoreState()

def criar_rodape_clean(canvas, doc, estilo):
    """Cria rodapé igual ao papel carta COBIMOB"""
    canvas.saveState()

    # Faixa geométrica colorida
    cores_faixa = [
        colors.Color(0.118, 0.624, 0.561),
        colors.Color(0.419, 0.275, 0.757),
        colors.Color(0.925, 0.282, 0.600),
    ]

    largura_rect = A4[0] / 15
    for i in range(15):
        cor = cores_faixa[i % 3]
        canvas.setFillColor(cor)
        canvas.rect(i * largura_rect, 30, largura_rect, 15, fill=1, stroke=0)

    # Logo pequena no rodapé
    canvas.setFont('Helvetica-Bold', 12)
    canvas.setFillColor(estilo['cores']['teal'])
    canvas.drawString(50, 10, "Cb")
    canvas.setFillColor(colors.Color(0.419, 0.275, 0.757))
    canvas.drawString(70, 10, "Mb")

    # Informações de contato
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(estilo['cores']['cinza_escuro'])
    canvas.drawString(50, 50, "R. Presidente Faria, 431 | q 42 | 4° andar | Centro | Curitiba | PR")
    canvas.drawString(50, 60, "www.cobimob.com.br")

    canvas.drawRightString(A4[0] - 50, 50, "contato@cobimob.com.br")
    canvas.drawRightString(A4[0] - 50, 60, "+1 3501 5601")

    canvas.restoreState()

def criar_dados_comuns():
    """Dados comuns para todos os PDFs"""
    return {
        'info_data': [
            ['PROPRIETÁRIO: Camilo R. Gusso - CPF: 098.602.089-30'],
            ['PROPRIETÁRIO: Camila C. Gusso - CPF: 129.665.399-41'],
            ['PROPRIETÁRIO: Reinaldo José Gusso - CPF: 089.166.619-27'],
            ['LOCATÁRIO: VIVALDO VALÉRIO DA SILVA'],
            ['IMÓVEL: CONDOMÍNIO ALAMEDA CLUB RESIDENCIAL - APARTAMENTO 207 BLOCO A, VAGA DE GARAGEM Nº 203, SITO A RUA JOÃO ALENCAR GUIMARÃES, Nº 2580, CAMPO COMPRIDO, CURITIBA/PR, CEP: 81.220-190'],
            ['MÊS DE REFERÊNCIA: Maio']
        ],
        'datas_data': [
            ['VENCIMENTO', '07/07/2025'],
            ['PAGAMENTO REALIZADO EM:', '04/08/2025']
        ],
        'valores_data': [
            ['Aluguel', 'R$', '1.877,91'],
            ['Seguro fiança (22/27)', 'R$', '165,00'],
            ['Taxa de Condomínio - Ref ao vencimento 10/06/25', 'R$', '929,16'],
            ['FCI - Fundo de Conservação', 'R$', '93,90'],
            ['IPTU - Apartamento parcela 04/10', 'R$', '52,42'],
            ['IPTU - Garagem parcela 04/07', 'R$', '20,82'],
            ['Reembolso - Fundo de Reserva', '-R$', '43,64'],
            ['Reembolso - Fundo de obras', '-R$', '10,00'],
            ['Reembolso - Reforma do Hall - Parc 06/24', '-R$', '127,89'],
            ['Acréscimos por atraso (+) ref ao Aluguel', 'R$', '193,27'],
            ['Acréscimos por atraso (+) ref ao Seguro Fiança', 'R$', '16,98'],
            ['Acréscimos por atraso (+) taxa de condomínio', 'R$', '95,62'],
            ['Acréscimos por atraso (+) FCI', 'R$', '9,67'],
            ['Acréscimos por atraso (+) IPTU', 'R$', '7,54'],
            ['Valor total Acréscimos', 'R$', '323,08'],
            ['Valor total', 'R$', '3.280,76']
        ],
        'retidos_data': [
            ['Taxa de administração (5%)', 'R$', '150,02'],
            ['Registro boleto', 'R$', '2,50'],
            ['Transferência bancária adicional - R$10,00 (Qtd 2)', 'R$', '20,00'],
            ['Valor retido para pagamento FCI (-)', 'R$', '103,57'],
            ['Valor retido para pagamento IPTU (-)', 'R$', '80,78'],
            ['Valor retido para pagamento Condomínio (-)', 'R$', '1.024,78'],
            ['Valor retido para pagamento Seguro Fiança (-)', 'R$', '181,98'],
            ['Valor total retido', 'R$', '1.563,63']
        ],
        'repasse_data': [
            ['Camilo R. Gusso', 'R$', '572,38'],
            ['Reinaldo José Gusso', 'R$', '572,38'],
            ['Camila C. Gusso', 'R$', '572,37'],
            ['Valor total a ser repassado:', 'R$', '1.717,13']
        ]
    }

def gerar_opcao_1_minimalista():
    """OPÇÃO 1: Minimalista Clean (mais fiel ao CONDO)"""
    filename = 'COBIMOB_Opcao_1_Minimalista.pdf'
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=80, bottomMargin=80)
    estilo = criar_estilo_clean_cobimob()
    dados = criar_dados_comuns()
    story = []

    # Título
    story.append(Paragraph("PRESTAÇÃO DE CONTAS", estilo['titulo_principal']))
    story.append(Spacer(1, 10))

    # Informações principais
    info_table = Table(dados['info_data'], colWidths=[7*inch])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 6)
    ]))
    story.append(info_table)
    story.append(Spacer(1, 15))

    # Datas
    datas_table = Table(dados['datas_data'], colWidths=[4*inch, 2*inch])
    datas_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 6)
    ]))
    story.append(datas_table)
    story.append(Spacer(1, 15))

    # Valores cobrados
    story.append(Paragraph("Valores cobrados junto ao aluguel", estilo['secao_titulo']))
    valores_table = Table(dados['valores_data'], colWidths=[4.5*inch, 0.3*inch, 1*inch])
    valores_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (2, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, -1), (-1, -1), estilo['cores']['cinza_claro'])
    ]))
    story.append(valores_table)
    story.append(Spacer(1, 15))

    # Valores retidos
    story.append(Paragraph("Valores retidos do total pago", estilo['secao_titulo']))
    retidos_table = Table(dados['retidos_data'], colWidths=[4.5*inch, 0.3*inch, 1*inch])
    retidos_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (2, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, -1), (-1, -1), estilo['cores']['cinza_claro'])
    ]))
    story.append(retidos_table)
    story.append(Spacer(1, 15))

    # Repasse
    story.append(Paragraph("Valor total a ser repassado:", estilo['secao_titulo']))
    repasse_table = Table(dados['repasse_data'], colWidths=[4.5*inch, 0.3*inch, 1*inch])
    repasse_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (2, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, -1), (-1, -1), estilo['cores']['cinza_claro'])
    ]))
    story.append(repasse_table)

    def myPages(canvas, doc):
        criar_cabecalho_clean(canvas, doc, estilo)
        criar_rodape_clean(canvas, doc, estilo)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"Opcao 1 gerada: {filename}")

def gerar_opcao_2_corporativa():
    """OPÇÃO 2: Layout Corporativo"""
    filename = 'COBIMOB_Opcao_2_Corporativa.pdf'
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=80, bottomMargin=80)
    estilo = criar_estilo_clean_cobimob()
    dados = criar_dados_comuns()
    story = []

    # Layout mais formal com tabelas maiores
    story.append(Paragraph("RELATÓRIO DE PRESTAÇÃO DE CONTAS", estilo['titulo_principal']))
    story.append(Paragraph("Período: Maio/2025 • Vencimento: 07/07/2025 • Pagamento: 04/08/2025", estilo['texto_normal']))
    story.append(Spacer(1, 20))

    # Informações em formato corporativo
    info_corp = [
        ['INFORMAÇÕES DO CONTRATO'],
        ['Proprietários:', 'Camilo R. Gusso, Camila C. Gusso, Reinaldo José Gusso'],
        ['Locatário:', 'VIVALDO VALÉRIO DA SILVA'],
        ['Imóvel:', 'Condomínio Alameda Club - Apt 207 Bloco A'],
        ['Endereço:', 'R. João Alencar Guimarães, 2580 - Curitiba/PR'],
        ['Referência:', 'Maio/2025']
    ]

    info_table = Table(info_corp, colWidths=[2*inch, 5*inch])
    info_table.setStyle(TableStyle([
        ('SPAN', (0, 0), (1, 0)),
        ('BACKGROUND', (0, 0), (1, 0), estilo['cores']['cinza_escuro']),
        ('TEXTCOLOR', (0, 0), (1, 0), colors.white),
        ('ALIGN', (0, 0), (1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (1, 0), 12),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('ALIGN', (1, 1), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        ('PADDING', (0, 0), (-1, -1), 8)
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))

    # Restante similar à opção 1 mas com estilos corporativos

    def myPages(canvas, doc):
        criar_cabecalho_clean(canvas, doc, estilo)
        criar_rodape_clean(canvas, doc, estilo)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"Opcao 2 gerada: {filename}")

def gerar_opcao_3_compacta():
    """OPÇÃO 3: Layout Compacto"""
    filename = 'COBIMOB_Opcao_3_Compacta.pdf'
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=25, leftMargin=25, topMargin=70, bottomMargin=70)
    estilo = criar_estilo_clean_cobimob()
    dados = criar_dados_comuns()
    story = []

    # Layout mais compacto com menos espaçamentos
    story.append(Paragraph("PRESTAÇÃO DE CONTAS - Maio/2025", estilo['titulo_principal']))
    story.append(Spacer(1, 8))

    # Informações compactas em duas colunas
    info_compacta = [
        ['Proprietários: Camilo R. Gusso, Camila C. Gusso, Reinaldo José Gusso', 'Locatário: VIVALDO VALÉRIO DA SILVA'],
        ['Imóvel: Condomínio Alameda Club - Apt 207 Bloco A', 'Venc: 07/07/2025 | Pago: 04/08/2025']
    ]

    info_table = Table(info_compacta, colWidths=[3.5*inch, 3.5*inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP')
    ]))
    story.append(info_table)
    story.append(Spacer(1, 10))

    # Restante com espaçamentos menores

    def myPages(canvas, doc):
        criar_cabecalho_clean(canvas, doc, estilo)
        criar_rodape_clean(canvas, doc, estilo)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"Opcao 3 gerada: {filename}")

def gerar_opcao_4_detalhada():
    """OPÇÃO 4: Layout Detalhado"""
    filename = 'COBIMOB_Opcao_4_Detalhada.pdf'
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=35, leftMargin=35, topMargin=80, bottomMargin=80)
    estilo = criar_estilo_clean_cobimob()
    dados = criar_dados_comuns()
    story = []

    # Layout com mais detalhes e seções
    story.append(Paragraph("PRESTAÇÃO DE CONTAS DETALHADA", estilo['titulo_principal']))
    story.append(Spacer(1, 15))

    # Seção de dados bancários para repasse
    dados_bancarios = [
        ['DADOS BANCÁRIOS PARA REPASSE'],
        ['Camilo - chave(s) PIX: telefone 41996840799'],
        ['Camila - chave(s) PIX: telefone 41984411620'],
        ['Reinaldo - chave(s) PIX: Cpf 089.166.619-27'],
        ['REPASSE REALIZADO EM: 06/08/2025']
    ]

    dados_table = Table(dados_bancarios, colWidths=[7*inch])
    dados_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), estilo['cores']['cinza_escuro']),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 6)
    ]))
    story.append(dados_table)

    def myPages(canvas, doc):
        criar_cabecalho_clean(canvas, doc, estilo)
        criar_rodape_clean(canvas, doc, estilo)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"Opcao 4 gerada: {filename}")

def gerar_opcao_5_moderna():
    """OPÇÃO 5: Layout Moderno com Elementos Sutis"""
    filename = 'COBIMOB_Opcao_5_Moderna.pdf'
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=80, bottomMargin=80)
    estilo = criar_estilo_clean_cobimob()
    dados = criar_dados_comuns()
    story = []

    # Layout moderno com seções bem definidas
    story.append(Paragraph("PRESTAÇÃO DE CONTAS", estilo['titulo_principal']))
    story.append(Paragraph("Relatório Mensal • Maio/2025", estilo['texto_normal']))
    story.append(Spacer(1, 20))

    # Cards de resumo no topo
    resumo_cards = [
        ['RESUMO EXECUTIVO'],
        ['Total Cobrado: R$ 3.280,76', 'Total Retido: R$ 1.563,63', 'Total Repasse: R$ 1.717,13']
    ]

    resumo_table = Table(resumo_cards, colWidths=[7*inch])
    resumo_table.setStyle(TableStyle([
        ('SPAN', (0, 0), (2, 0)),
        ('BACKGROUND', (0, 0), (2, 0), estilo['cores']['teal']),
        ('TEXTCOLOR', (0, 0), (2, 0), colors.white),
        ('ALIGN', (0, 0), (2, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (2, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (2, 0), 12),
        ('FONTNAME', (0, 1), (2, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (2, 1), 10),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 1), (2, 1), estilo['cores']['cinza_claro'])
    ]))
    story.append(resumo_table)

    def myPages(canvas, doc):
        criar_cabecalho_clean(canvas, doc, estilo)
        criar_rodape_clean(canvas, doc, estilo)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"Opcao 5 gerada: {filename}")

if __name__ == "__main__":
    print("Gerando 5 opcoes CLEAN de PDF para Prestacao de Contas - COBIMOB...")
    print("Visual moderno mas minimalista, baseado no estilo CONDO")
    print()

    gerar_opcao_1_minimalista()
    gerar_opcao_2_corporativa()
    gerar_opcao_3_compacta()
    gerar_opcao_4_detalhada()
    gerar_opcao_5_moderna()

    print()
    print("Todas as 5 opcoes clean foram geradas com sucesso!")
    print("Arquivos salvos na pasta exemplos_pdf/")