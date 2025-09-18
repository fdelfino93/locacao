"""
Gerador de PDFs MODERNOS e CLEAN para Prestação de Contas - COBIMOB
Usando LOGO REAL como imagem e tabelas bonitas mas clean
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
import os

def criar_estilo_moderno_clean():
    """Estilos modernos mas clean"""
    styles = getSampleStyleSheet()

    # Cores modernas e clean
    AZUL_MODERNO = colors.Color(0.2, 0.3, 0.5)  # Azul escuro elegante
    CINZA_CLARO = colors.Color(0.96, 0.97, 0.98)  # Cinza muito claro
    CINZA_MEDIO = colors.Color(0.85, 0.87, 0.9)  # Cinza médio
    TEXTO_ESCURO = colors.Color(0.15, 0.15, 0.15)  # Quase preto

    titulo_principal = ParagraphStyle(
        'TituloPrincipal',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=AZUL_MODERNO,
        alignment=1,
        spaceAfter=20,
        fontName='Helvetica-Bold',
        leading=26
    )

    subtitulo_secao = ParagraphStyle(
        'SubtituloSecao',
        parent=styles['Heading2'],
        fontSize=11,
        textColor=TEXTO_ESCURO,
        alignment=0,
        spaceBefore=18,
        spaceAfter=8,
        fontName='Helvetica-Bold',
        backColor=CINZA_CLARO,
        leftIndent=8,
        rightIndent=8,
        topPadding=6,
        bottomPadding=6
    )

    return {
        'titulo_principal': titulo_principal,
        'subtitulo_secao': subtitulo_secao,
        'normal': styles['Normal'],
        'cores': {
            'azul_moderno': AZUL_MODERNO,
            'cinza_claro': CINZA_CLARO,
            'cinza_medio': CINZA_MEDIO,
            'texto': TEXTO_ESCURO
        }
    }

def criar_cabecalho_com_logo_real_moderno(canvas, doc, estilo):
    """Cabeçalho moderno com logo REAL da COBIMOB"""
    canvas.saveState()

    # Usar a logo REAL como imagem
    try:
        logo_path = "Cobimob logos-01.png"
        if os.path.exists(logo_path):
            # Inserir logo real com tamanho adequado
            canvas.drawImage(logo_path, 50, A4[1] - 65, width=140, height=40)
        else:
            # Fallback caso não encontre
            canvas.setFont('Helvetica-Bold', 28)
            canvas.setFillColor(estilo['cores']['azul_moderno'])
            canvas.drawString(50, A4[1] - 50, "CobiMob")
    except Exception as e:
        print(f"Erro ao carregar logo: {e}")
        # Fallback
        canvas.setFont('Helvetica-Bold', 28)
        canvas.setFillColor(estilo['cores']['azul_moderno'])
        canvas.drawString(50, A4[1] - 50, "CobiMob")

    # Linha moderna e sutil
    canvas.setStrokeColor(estilo['cores']['cinza_medio'])
    canvas.setLineWidth(2)
    canvas.line(50, A4[1] - 75, A4[0] - 50, A4[1] - 75)

    canvas.restoreState()

def criar_rodape_moderno_clean(canvas, doc, estilo):
    """Rodapé moderno igual ao papel carta"""
    canvas.saveState()

    # Faixa geométrica colorida moderna (igual papel carta)
    cores_faixa = [
        colors.Color(0.118, 0.624, 0.561),  # Teal
        colors.Color(0.419, 0.275, 0.757),  # Roxo
        colors.Color(0.925, 0.282, 0.600),  # Rosa
    ]

    # Faixa mais elegante
    faixa_altura = 18
    faixa_y = 20
    largura_segmento = A4[0] / 24  # Mais segmentos = mais elegante

    for i in range(24):
        cor_index = i % 3
        canvas.setFillColor(cores_faixa[cor_index])
        canvas.rect(i * largura_segmento, faixa_y, largura_segmento, faixa_altura, fill=1, stroke=0)

    # Informações de contato modernas
    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(estilo['cores']['texto'])

    # Layout moderno das informações
    canvas.drawString(50, 55, "R. Presidente Faria, 431 | q 42 | 4° andar | Centro | Curitiba | PR")
    canvas.drawString(50, 70, "www.cobimob.com.br")

    canvas.drawRightString(A4[0] - 50, 55, "contato@cobimob.com.br")
    canvas.drawRightString(A4[0] - 50, 70, "☎ +1 3501 5601")

    # Logo pequena moderna
    canvas.setFont('Helvetica-Bold', 12)
    canvas.setFillColor(colors.Color(0.118, 0.624, 0.561))
    canvas.drawString(50, 40, "Cb")
    canvas.setFillColor(colors.Color(0.419, 0.275, 0.757))
    canvas.drawString(68, 40, "Mb")

    canvas.restoreState()

def criar_tabela_moderna_clean(data, colWidths, header_color=None, zebra=True):
    """Cria tabela moderna e clean"""
    table = Table(data, colWidths=colWidths)

    # Estilo base moderno
    style_commands = [
        # Header
        ('BACKGROUND', (0, 0), (-1, 0), header_color or colors.Color(0.2, 0.3, 0.5)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),

        # Corpo da tabela
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TEXTCOLOR', (0, 1), (-1, -1), colors.Color(0.15, 0.15, 0.15)),

        # Alinhamentos
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),

        # Bordas modernas
        ('BOX', (0, 0), (-1, -1), 0.5, colors.Color(0.8, 0.8, 0.8)),
        ('INNERGRID', (0, 0), (-1, -1), 0.3, colors.Color(0.9, 0.9, 0.9)),

        # Padding moderno
        ('PADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
    ]

    # Efeito zebra sutil
    if zebra and len(data) > 2:
        for i in range(2, len(data), 2):  # Começar da linha 2 (pular header)
            style_commands.append(
                ('BACKGROUND', (0, i), (-1, i), colors.Color(0.98, 0.98, 0.99))
            )

    # Última linha destacada (totais)
    if len(data) > 1:
        style_commands.extend([
            ('BACKGROUND', (0, -1), (-1, -1), colors.Color(0.94, 0.96, 0.98)),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('TOPPADDING', (0, -1), (-1, -1), 10),
            ('BOTTOMPADDING', (0, -1), (-1, -1), 10),
        ])

    table.setStyle(TableStyle(style_commands))
    return table

def gerar_opcao_1_moderno_clean():
    """OPÇÃO 1: Moderno Clean com tabelas bonitas"""
    filename = 'COBIMOB_OPCAO_1_Moderno_Clean.pdf'

    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=35,
        leftMargin=35,
        topMargin=85,
        bottomMargin=95
    )

    estilo = criar_estilo_moderno_clean()
    story = []

    # TÍTULO PRINCIPAL MODERNO
    story.append(Paragraph("PRESTAÇÃO DE CONTAS", estilo['titulo_principal']))
    story.append(Spacer(1, 5))

    # INFORMAÇÕES PRINCIPAIS EM CARDS MODERNOS
    info_cards_data = [
        ['INFORMAÇÕES DO CONTRATO'],
        ['Proprietários', 'Camilo R. Gusso (CPF: 098.602.089-30), Camila C. Gusso (CPF: 129.665.399-41), Reinaldo José Gusso (CPF: 089.166.619-27)'],
        ['Locatário', 'VIVALDO VALÉRIO DA SILVA'],
        ['Imóvel', 'Condomínio Alameda Club Residencial - Apartamento 207 Bloco A, Vaga 203'],
        ['Endereço', 'R. João Alencar Guimarães, 2580, Campo Comprido, Curitiba/PR, CEP: 81.220-190'],
        ['Mês de Referência', 'Maio/2025'],
        ['Vencimento', '07/07/2025'],
        ['Pagamento Realizado', '04/08/2025']
    ]

    info_table = criar_tabela_moderna_clean(
        info_cards_data,
        colWidths=[2*inch, 4.5*inch],
        header_color=colors.Color(0.118, 0.624, 0.561),
        zebra=False
    )
    story.append(info_table)
    story.append(Spacer(1, 20))

    # VALORES COBRADOS - TABELA MODERNA
    story.append(Paragraph("Valores cobrados junto ao aluguel", estilo['subtitulo_secao']))

    valores_data = [
        ['Descrição', 'Valor'],
        ['Aluguel', 'R$ 1.877,91'],
        ['Seguro fiança (22/27)', 'R$ 165,00'],
        ['Taxa de Condomínio - Ref ao vencimento 10/06/25', 'R$ 929,16'],
        ['FCI - Fundo de Conservação', 'R$ 93,90'],
        ['IPTU - Apartamento parcela 04/10', 'R$ 52,42'],
        ['IPTU - Garagem parcela 04/07', 'R$ 20,82'],
        ['Bonificação - Pagamento até o vencimento', 'R$ -'],
        ['Reembolso - Fundo de Reserva', '-R$ 43,64'],
        ['Reembolso - Fundo de obras', '-R$ 10,00'],
        ['Reembolso - Reforma do Hall - Parc 06/24', '-R$ 127,89'],
        ['Acréscimos por atraso (+) ref ao Aluguel', 'R$ 193,27'],
        ['Acréscimos por atraso (+) ref ao Seguro Fiança', 'R$ 16,98'],
        ['Acréscimos por atraso (+) taxa de condomínio', 'R$ 95,62'],
        ['Acréscimos por atraso (+) FCI', 'R$ 9,67'],
        ['Acréscimos por atraso (+) IPTU', 'R$ 7,54'],
        ['Valor total Acréscimos', 'R$ 323,08'],
        ['VALOR TOTAL', 'R$ 3.280,76']
    ]

    valores_table = criar_tabela_moderna_clean(
        valores_data,
        colWidths=[4.5*inch, 1.5*inch],
        header_color=colors.Color(0.2, 0.3, 0.5)
    )
    story.append(valores_table)
    story.append(Spacer(1, 20))

    # VALORES RETIDOS - TABELA MODERNA
    story.append(Paragraph("Valores retidos do total pago", estilo['subtitulo_secao']))

    retidos_data = [
        ['Descrição', 'Valor'],
        ['Taxa de administração (5%)', 'R$ 150,02'],
        ['Registro boleto', 'R$ 2,50'],
        ['Transferência bancária adicional - R$10,00 (Qtd 2)', 'R$ 20,00'],
        ['Valor retido para pagamento FCI (-)', 'R$ 103,57'],
        ['Valor retido para pagamento IPTU (-)', 'R$ 80,78'],
        ['Valor retido para pagamento Condomínio (-)', 'R$ 1.024,78'],
        ['Valor retido para pagamento Seguro Fiança (-)', 'R$ 181,98'],
        ['VALOR TOTAL RETIDO', 'R$ 1.563,63']
    ]

    retidos_table = criar_tabela_moderna_clean(
        retidos_data,
        colWidths=[4.5*inch, 1.5*inch],
        header_color=colors.Color(0.419, 0.275, 0.757)
    )
    story.append(retidos_table)
    story.append(Spacer(1, 20))

    # REPASSE - TABELA MODERNA
    story.append(Paragraph("Valor total a ser repassado", estilo['subtitulo_secao']))

    repasse_data = [
        ['Proprietário', 'Dados PIX', 'Valor'],
        ['Camilo R. Gusso', 'telefone 41996840799', 'R$ 572,38'],
        ['Reinaldo José Gusso', 'CPF 089.166.619-27', 'R$ 572,38'],
        ['Camila C. Gusso', 'telefone 41984411620', 'R$ 572,37'],
        ['TOTAL A SER REPASSADO', 'Repasse realizado em: 06/08/2025', 'R$ 1.717,13']
    ]

    repasse_table = criar_tabela_moderna_clean(
        repasse_data,
        colWidths=[2.2*inch, 2.5*inch, 1.3*inch],
        header_color=colors.Color(0.925, 0.282, 0.600)
    )
    story.append(repasse_table)

    # Build PDF
    def myPages(canvas, doc):
        criar_cabecalho_com_logo_real_moderno(canvas, doc, estilo)
        criar_rodape_moderno_clean(canvas, doc, estilo)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"OPCAO 1 MODERNA gerada: {filename}")
    return filename

if __name__ == "__main__":
    print("Gerando PDF MODERNO e CLEAN com logo REAL...")
    print("Tabelas bonitas mas mantendo formato clean")
    print()

    gerar_opcao_1_moderno_clean()

    print()
    print("PDF moderno e clean gerado com sucesso!")
    print("Usando logo REAL da COBIMOB como imagem")