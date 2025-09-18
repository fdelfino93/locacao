"""
Gerador FINAL de 5 Opções MODERNAS e CLEAN para Prestação de Contas - COBIMOB
Usando logo REAL como imagem e 5 estilos diferentes de tabelas bonitas mas clean
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
import os

def criar_cabecalho_com_logo_real(canvas, doc):
    """Cabeçalho com logo REAL da COBIMOB"""
    canvas.saveState()
    try:
        logo_path = "Cobimob logos-01.png"
        if os.path.exists(logo_path):
            canvas.drawImage(logo_path, 50, A4[1] - 65, width=140, height=40)
    except:
        canvas.setFont('Helvetica-Bold', 28)
        canvas.setFillColor(colors.Color(0.118, 0.624, 0.561))
        canvas.drawString(50, A4[1] - 50, "CobiMob")
    canvas.restoreState()

def criar_rodape_cobimob(canvas, doc):
    """Rodapé igual ao papel carta"""
    canvas.saveState()
    cores_faixa = [
        colors.Color(0.118, 0.624, 0.561),
        colors.Color(0.419, 0.275, 0.757),
        colors.Color(0.925, 0.282, 0.600),
    ]
    largura_segmento = A4[0] / 24
    for i in range(24):
        canvas.setFillColor(cores_faixa[i % 3])
        canvas.rect(i * largura_segmento, 20, largura_segmento, 18, fill=1, stroke=0)

    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(colors.Color(0.2, 0.2, 0.2))
    canvas.drawString(50, 55, "R. Presidente Faria, 431 | q 42 | 4° andar | Centro | Curitiba | PR")
    canvas.drawString(50, 70, "www.cobimob.com.br")
    canvas.drawRightString(A4[0] - 50, 55, "contato@cobimob.com.br")
    canvas.drawRightString(A4[0] - 50, 70, "☎ +1 3501 5601")
    canvas.restoreState()

def dados_completos():
    """Dados completos da prestação"""
    return {
        'valores_cobrados': [
            ['Descrição', 'Valor'],
            ['Aluguel', 'R$ 1.877,91'],
            ['Seguro fiança (22/27)', 'R$ 165,00'],
            ['Taxa de Condomínio - Ref ao vencimento 10/06/25', 'R$ 929,16'],
            ['FCI - Fundo de Conservação', 'R$ 93,90'],
            ['IPTU - Apartamento parcela 04/10', 'R$ 52,42'],
            ['IPTU - Garagem parcela 04/07', 'R$ 20,82'],
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
        ],
        'valores_retidos': [
            ['Descrição', 'Valor'],
            ['Taxa de administração (5%)', 'R$ 150,02'],
            ['Registro boleto', 'R$ 2,50'],
            ['Transferência bancária adicional (Qtd 2)', 'R$ 20,00'],
            ['Valor retido para pagamento FCI', 'R$ 103,57'],
            ['Valor retido para pagamento IPTU', 'R$ 80,78'],
            ['Valor retido para pagamento Condomínio', 'R$ 1.024,78'],
            ['Valor retido para pagamento Seguro Fiança', 'R$ 181,98'],
            ['VALOR TOTAL RETIDO', 'R$ 1.563,63']
        ],
        'repasses': [
            ['Proprietário', 'Dados PIX', 'Valor'],
            ['Camilo R. Gusso', 'tel: 41996840799', 'R$ 572,38'],
            ['Reinaldo José Gusso', 'CPF: 089.166.619-27', 'R$ 572,38'],
            ['Camila C. Gusso', 'tel: 41984411620', 'R$ 572,37'],
            ['TOTAL REPASSADO', 'Data: 06/08/2025', 'R$ 1.717,13']
        ]
    }

def gerar_opcao_1_elegante():
    """OPÇÃO 1: Elegante com bordas arredondadas (visual)"""
    filename = 'COBIMOB_OPCAO_1_Elegante.pdf'
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=35, leftMargin=35, topMargin=85, bottomMargin=95)

    styles = getSampleStyleSheet()
    titulo = ParagraphStyle('Titulo', parent=styles['Heading1'], fontSize=22,
                           textColor=colors.Color(0.2, 0.3, 0.5), alignment=1, spaceAfter=20)

    story = []
    story.append(Paragraph("PRESTAÇÃO DE CONTAS", titulo))
    story.append(Paragraph("Maio/2025 • Vencimento: 07/07/2025 • Pagamento: 04/08/2025", styles['Normal']))
    story.append(Spacer(1, 20))

    # Info box elegante
    info_data = [
        ['INFORMAÇÕES DO CONTRATO'],
        ['Proprietários: Camilo R. Gusso, Camila C. Gusso, Reinaldo José Gusso'],
        ['Locatário: VIVALDO VALÉRIO DA SILVA'],
        ['Imóvel: Condomínio Alameda Club - Apt 207 Bloco A, Vaga 203'],
        ['Endereço: R. João Alencar Guimarães, 2580, Curitiba/PR']
    ]

    info_table = Table(info_data, colWidths=[6.5*inch])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.118, 0.624, 0.561)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('BOX', (0, 0), (-1, -1), 1, colors.Color(0.8, 0.8, 0.8)),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.Color(0.9, 0.9, 0.9)),
        ('BACKGROUND', (0, 1), (-1, -1), colors.Color(0.98, 0.99, 1))
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))

    dados = dados_completos()

    # Tabelas com estilo elegante
    for secao, titulo_secao in [('valores_cobrados', 'Valores Cobrados'),
                               ('valores_retidos', 'Valores Retidos'),
                               ('repasses', 'Repasses')]:
        story.append(Paragraph(titulo_secao, styles['Heading2']))

        table = Table(dados[secao], colWidths=[4*inch, 2*inch] if secao != 'repasses' else [2*inch, 2*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.2, 0.3, 0.5)),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('PADDING', (0, 0), (-1, -1), 6),
            ('BOX', (0, 0), (-1, -1), 1, colors.Color(0.7, 0.7, 0.7)),
            ('INNERGRID', (0, 0), (-1, -1), 0.3, colors.Color(0.85, 0.85, 0.85)),
            ('BACKGROUND', (0, -1), (-1, -1), colors.Color(0.94, 0.96, 0.98)),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold')
        ]))

        # Efeito zebra
        for i in range(2, len(dados[secao])-1, 2):
            table.setStyle(TableStyle([('BACKGROUND', (0, i), (-1, i), colors.Color(0.97, 0.98, 0.99))]))

        story.append(table)
        story.append(Spacer(1, 15))

    def myPages(canvas, doc):
        criar_cabecalho_com_logo_real(canvas, doc)
        criar_rodape_cobimob(canvas, doc)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"Opcao 1 gerada: {filename}")

def gerar_opcao_2_minimalista():
    """OPÇÃO 2: Minimalista Sofisticado"""
    filename = 'COBIMOB_OPCAO_2_Minimalista.pdf'
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=85, bottomMargin=95)

    styles = getSampleStyleSheet()
    titulo = ParagraphStyle('Titulo', parent=styles['Heading1'], fontSize=20,
                           textColor=colors.Color(0.15, 0.15, 0.15), alignment=1, spaceAfter=25)

    story = []
    story.append(Paragraph("PRESTAÇÃO DE CONTAS", titulo))
    story.append(Spacer(1, 15))

    dados = dados_completos()

    # Estilo minimalista com linhas finas
    for secao, titulo_secao in [('valores_cobrados', 'Valores Cobrados junto ao Aluguel'),
                               ('valores_retidos', 'Valores Retidos do Total Pago'),
                               ('repasses', 'Valor Total a ser Repassado')]:

        # Título com linha embaixo
        story.append(Paragraph(titulo_secao, styles['Heading3']))
        story.append(Spacer(1, 5))

        table = Table(dados[secao], colWidths=[4.5*inch, 1.5*inch] if secao != 'repasses' else [2.5*inch, 2*inch, 1.5*inch])
        table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('PADDING', (0, 0), (-1, -1), 8),
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.Color(0.3, 0.3, 0.3)),
            ('LINEBELOW', (0, -1), (-1, -1), 1, colors.Color(0.3, 0.3, 0.3)),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('BACKGROUND', (0, -1), (-1, -1), colors.Color(0.96, 0.97, 0.98))
        ]))

        story.append(table)
        story.append(Spacer(1, 20))

    def myPages(canvas, doc):
        criar_cabecalho_com_logo_real(canvas, doc)
        criar_rodape_cobimob(canvas, doc)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"Opcao 2 gerada: {filename}")

def gerar_opcao_3_colorida_sutil():
    """OPÇÃO 3: Colorida Sutil (usando cores COBIMOB)"""
    filename = 'COBIMOB_OPCAO_3_Colorida_Sutil.pdf'
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=35, leftMargin=35, topMargin=85, bottomMargin=95)

    styles = getSampleStyleSheet()
    titulo = ParagraphStyle('Titulo', parent=styles['Heading1'], fontSize=21,
                           textColor=colors.Color(0.419, 0.275, 0.757), alignment=1, spaceAfter=20)

    story = []
    story.append(Paragraph("PRESTAÇÃO DE CONTAS", titulo))
    story.append(Spacer(1, 15))

    dados = dados_completos()
    cores_secoes = [
        colors.Color(0.118, 0.624, 0.561),  # Teal
        colors.Color(0.419, 0.275, 0.757),  # Roxo
        colors.Color(0.925, 0.282, 0.600),  # Rosa
    ]

    for i, (secao, titulo_secao) in enumerate([('valores_cobrados', 'Valores Cobrados'),
                                              ('valores_retidos', 'Valores Retidos'),
                                              ('repasses', 'Repasses')]):

        story.append(Paragraph(titulo_secao, styles['Heading3']))

        table = Table(dados[secao], colWidths=[4*inch, 2*inch] if secao != 'repasses' else [2*inch, 2*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), cores_secoes[i]),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('PADDING', (0, 0), (-1, -1), 7),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.Color(0.8, 0.8, 0.8)),
            ('INNERGRID', (0, 1), (-1, -2), 0.2, colors.Color(0.9, 0.9, 0.9)),
            ('BACKGROUND', (0, -1), (-1, -1), cores_secoes[i].clone(alpha=0.1)),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold')
        ]))

        story.append(table)
        story.append(Spacer(1, 18))

    def myPages(canvas, doc):
        criar_cabecalho_com_logo_real(canvas, doc)
        criar_rodape_cobimob(canvas, doc)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"Opcao 3 gerada: {filename}")

def gerar_opcao_4_compacta():
    """OPÇÃO 4: Compacta Eficiente"""
    filename = 'COBIMOB_OPCAO_4_Compacta.pdf'
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=30, leftMargin=30, topMargin=80, bottomMargin=85)

    styles = getSampleStyleSheet()
    titulo = ParagraphStyle('Titulo', parent=styles['Heading1'], fontSize=18,
                           textColor=colors.Color(0.2, 0.2, 0.2), alignment=1, spaceAfter=15)

    story = []
    story.append(Paragraph("PRESTAÇÃO DE CONTAS - Maio/2025", titulo))
    story.append(Paragraph("Venc: 07/07/2025 | Pago: 04/08/2025 | Locatário: VIVALDO VALÉRIO DA SILVA", styles['Normal']))
    story.append(Spacer(1, 15))

    dados = dados_completos()

    # Layout compacto com colunas
    for secao, titulo_secao in [('valores_cobrados', 'Valores Cobrados'),
                               ('valores_retidos', 'Valores Retidos'),
                               ('repasses', 'Repasses')]:

        table = Table(dados[secao], colWidths=[4.5*inch, 1.5*inch] if secao != 'repasses' else [2.5*inch, 1.5*inch, 1.5*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.25, 0.25, 0.25)),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.black),
            ('GRID', (0, 0), (-1, -1), 0.2, colors.Color(0.8, 0.8, 0.8)),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('BACKGROUND', (0, -1), (-1, -1), colors.Color(0.92, 0.92, 0.92))
        ]))

        story.append(table)
        story.append(Spacer(1, 12))

    def myPages(canvas, doc):
        criar_cabecalho_com_logo_real(canvas, doc)
        criar_rodape_cobimob(canvas, doc)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"Opcao 4 gerada: {filename}")

def gerar_opcao_5_detalhada():
    """OPÇÃO 5: Detalhada com Cards"""
    filename = 'COBIMOB_OPCAO_5_Detalhada.pdf'
    doc = SimpleDocTemplate(filename, pagesize=A4, rightMargin=35, leftMargin=35, topMargin=85, bottomMargin=95)

    styles = getSampleStyleSheet()
    titulo = ParagraphStyle('Titulo', parent=styles['Heading1'], fontSize=22,
                           textColor=colors.Color(0.118, 0.624, 0.561), alignment=1, spaceAfter=15)

    story = []
    story.append(Paragraph("PRESTAÇÃO DE CONTAS DETALHADA", titulo))
    story.append(Spacer(1, 10))

    # Card de resumo
    resumo_data = [
        ['RESUMO EXECUTIVO'],
        ['Total Cobrado: R$ 3.280,76 | Total Retido: R$ 1.563,63 | Total Repasse: R$ 1.717,13']
    ]

    resumo_table = Table(resumo_data, colWidths=[6.5*inch])
    resumo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.118, 0.624, 0.561)),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('PADDING', (0, 0), (-1, -1), 10),
        ('BOX', (0, 0), (-1, -1), 1, colors.Color(0.6, 0.6, 0.6)),
        ('BACKGROUND', (0, 1), (-1, -1), colors.Color(0.95, 0.98, 1))
    ]))
    story.append(resumo_table)
    story.append(Spacer(1, 20))

    dados = dados_completos()

    # Tabelas com estilo detalhado
    for secao, titulo_secao in [('valores_cobrados', 'Detalhamento - Valores Cobrados'),
                               ('valores_retidos', 'Detalhamento - Valores Retidos'),
                               ('repasses', 'Detalhamento - Repasses')]:

        story.append(Paragraph(titulo_secao, styles['Heading3']))

        table = Table(dados[secao], colWidths=[4*inch, 2*inch] if secao != 'repasses' else [2*inch, 2*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.Color(0.3, 0.3, 0.3)),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (-1, -1), 'RIGHT'),
            ('PADDING', (0, 0), (-1, -1), 7),
            ('BOX', (0, 0), (-1, -1), 1, colors.black),
            ('INNERGRID', (0, 0), (-1, -1), 0.3, colors.Color(0.7, 0.7, 0.7)),
            ('BACKGROUND', (0, -1), (-1, -1), colors.Color(0.9, 0.95, 1)),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold')
        ]))

        story.append(table)
        story.append(Spacer(1, 15))

    def myPages(canvas, doc):
        criar_cabecalho_com_logo_real(canvas, doc)
        criar_rodape_cobimob(canvas, doc)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"Opcao 5 gerada: {filename}")

if __name__ == "__main__":
    print("Gerando 5 OPCOES FINAIS - PDFs modernos e clean com logo REAL...")
    print("Cada opcao com estilo diferente de tabelas bonitas")
    print()

    gerar_opcao_1_elegante()
    gerar_opcao_2_minimalista()
    gerar_opcao_3_colorida_sutil()
    gerar_opcao_4_compacta()
    gerar_opcao_5_detalhada()

    print()
    print("TODAS as 5 opcoes finais foram geradas!")
    print("Cada uma com visual moderno, clean e logo REAL da COBIMOB")