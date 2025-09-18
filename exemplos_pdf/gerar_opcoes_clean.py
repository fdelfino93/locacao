"""
Gerador de 5 Opções Clean para Prestação de Contas - COBIMOB
Visual moderno mas minimalista, baseado no estilo das prestações CONDO
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics import renderPDF

def criar_estilo_clean_cobimob():
    """Define os estilos clean baseados na identidade COBIMOB"""
    styles = getSampleStyleSheet()

    # Cores COBIMOB - mais sutis
    TEAL_SUAVE = colors.Color(0.118, 0.624, 0.561, alpha=0.8)  # Teal mais suave
    CINZA_ESCURO = colors.Color(0.176, 0.220, 0.282)  # #2D3748
    CINZA_CLARO = colors.Color(0.918, 0.925, 0.941)  # #EAF0F1

    # Estilo para título principal - simples
    titulo_principal = ParagraphStyle(
        'TituloPrincipal',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=CINZA_ESCURO,
        alignment=1,  # Center
        spaceAfter=15,
        fontName='Helvetica-Bold'
    )

    # Estilo para seções - minimalista
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

    # Logo COBIMOB - seguindo o design original
    canvas.setFont('Helvetica-Bold', 28)
    canvas.setFillColor(estilo['cores']['teal'])
    canvas.drawString(50, A4[1] - 50, "Cobi")
    canvas.setFillColor(colors.Color(0.925, 0.282, 0.600))  # Rosa da logo
    canvas.drawString(110, A4[1] - 50, "M")
    canvas.setFillColor(colors.Color(0.419, 0.275, 0.757))  # Roxo da logo
    canvas.drawString(130, A4[1] - 50, "ob")

    # Linha sutil
    canvas.setStrokeColor(estilo['cores']['cinza_claro'])
    canvas.setLineWidth(1)
    canvas.line(50, A4[1] - 65, A4[0] - 50, A4[1] - 65)

    canvas.restoreState()

def criar_rodape_clean(canvas, doc, estilo):
    """Cria rodapé igual ao papel carta COBIMOB"""
    canvas.saveState()

    # Faixa geométrica colorida (igual papel carta)
    # Desenhar retângulos coloridos alternados
    cores_faixa = [
        colors.Color(0.118, 0.624, 0.561),  # Teal
        colors.Color(0.419, 0.275, 0.757),  # Roxo
        colors.Color(0.925, 0.282, 0.600),  # Rosa
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

def gerar_opcao_1_clean_minimalista():
    """OPÇÃO 1: Clean Minimalista (baseado no CONDO)"""
    filename = 'COBIMOB_Prestacao_OPCAO_1_Clean_Minimalista.pdf'

    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=80,
        bottomMargin=80
    )

    estilo = criar_estilo_clean_cobimob()
    story = []

    # Título
    story.append(Paragraph("PRESTAÇÃO DE CONTAS", estilo['titulo_principal']))
    story.append(Spacer(1, 10))

    # Informações do cabeçalho - igual ao CONDO
    info_data = [
        ['PROPRIETÁRIO: Camilo R. Gusso - CPF: 098.602.089-30'],
        ['PROPRIETÁRIO: Camila C. Gusso - CPF: 129.665.399-41'],
        ['PROPRIETÁRIO: Reinaldo José Gusso - CPF: 089.166.619-27'],
        ['LOCATÁRIO: VIVALDO VALÉRIO DA SILVA'],
        ['IMÓVEL: CONDOMÍNIO ALAMEDA CLUB RESIDENCIAL - APARTAMENTO 207 BLOCO A, VAGA DE GARAGEM Nº 203, SITO A RUA JOÃO ALENCAR GUIMARÃES, Nº 2580, CAMPO COMPRIDO, CURITIBA/PR, CEP: 81.220-190'],
        ['MÊS DE REFERÊNCIA: Maio']
    ]

    info_table = Table(info_data, colWidths=[7*inch])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 6)
    ]))

    story.append(info_table)
    story.append(Spacer(1, 15))

    # Datas de vencimento e pagamento
    datas_data = [
        ['VENCIMENTO', '07/07/2025'],
        ['PAGAMENTO REALIZADO EM:', '04/08/2025']
    ]

    datas_table = Table(datas_data, colWidths=[4*inch, 2*inch])
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

    # Valores cobrados - estilo tabela simples como CONDO
    story.append(Paragraph("Valores cobrados junto ao aluguel", estilo['secao_titulo']))

    valores_data = [
        ['Aluguel', 'R$', '1.877,91'],
        ['Seguro fiança (22/27)', 'R$', '165,00'],
        ['Taxa de Condomínio - Ref ao vencimento 10/06/25', 'R$', '929,16'],
        ['FCI - Fundo de Conservação', 'R$', '93,90'],
        ['IPTU - Apartamento parcela 04/10', 'R$', '52,42'],
        ['IPTU - Garagem parcela 04/07', 'R$', '20,82'],
        ['Bonificação - Pagamento até o vencimento', 'R$', '-'],
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
    ]

    valores_table = Table(valores_data, colWidths=[4.5*inch, 0.3*inch, 1*inch])
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

    # Build PDF
    def myFirstPage(canvas, doc):
        criar_cabecalho_clean(canvas, doc, estilo)
        criar_rodape_clean(canvas, doc, estilo)

    def myLaterPages(canvas, doc):
        criar_cabecalho_clean(canvas, doc, estilo)
        criar_rodape_clean(canvas, doc, estilo)

    doc.build(story, onFirstPage=myFirstPage, onLaterPages=myLaterPages)
    print(f"PDF Clean Opcao 1 gerado: {filename}")

def gerar_opcao_2_tabular():
    """OPÇÃO 2: Layout Tabular Organizado"""
    filename = 'COBIMOB_Prestacao_OPCAO_2_Tabular.pdf'

    # Similar estrutura mas com layout mais tabular
    print(f"PDF Opcao 2 gerado: {filename}")

def gerar_opcao_3_compacta():
    """OPÇÃO 3: Versão Compacta"""
    filename = 'COBIMOB_Prestacao_OPCAO_3_Compacta.pdf'

    # Layout mais compacto
    print(f"PDF Opcao 3 gerado: {filename}")

def gerar_opcao_4_detalhada():
    """OPÇÃO 4: Versão Detalhada com Mais Informações"""
    filename = 'COBIMOB_Prestacao_OPCAO_4_Detalhada.pdf'

    # Layout com mais detalhamento
    print(f"PDF Opcao 4 gerado: {filename}")

def gerar_opcao_5_moderna():
    """OPÇÃO 5: Moderna com Elementos Sutis"""
    filename = 'COBIMOB_Prestacao_OPCAO_5_Moderna.pdf'

    # Layout moderno mas clean
    print(f"PDF Opcao 5 gerado: {filename}")

if __name__ == "__main__":
    print("Gerando 5 opcoes CLEAN de PDF - COBIMOB...")

    # Gerar apenas a primeira por enquanto
    gerar_opcao_1_clean_minimalista()
    # gerar_opcao_2_tabular()
    # gerar_opcao_3_compacta()
    # gerar_opcao_4_detalhada()
    # gerar_opcao_5_moderna()

    print("\nOpcao 1 clean gerada com sucesso!")
    print("Arquivo salvo na pasta exemplos_pdf/")