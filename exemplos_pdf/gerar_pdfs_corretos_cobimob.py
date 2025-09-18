"""
Gerador CORRETO de PDFs para Prestação de Contas - COBIMOB
Usando logo REAL e papel carta REAL com informações COMPLETAS
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch, mm
from reportlab.graphics.shapes import Drawing, Rect
from reportlab.graphics import renderPDF
import os

def criar_estilo_cobimob_real():
    """Estilos clean baseados na identidade REAL COBIMOB"""
    styles = getSampleStyleSheet()

    # Cores exatas da COBIMOB (baseadas na logo real)
    TEAL_COBIMOB = colors.Color(0.118, 0.624, 0.561)  # Verde água da logo
    PURPLE_COBIMOB = colors.Color(0.419, 0.275, 0.757)  # Roxo da logo
    PINK_COBIMOB = colors.Color(0.925, 0.282, 0.600)  # Rosa da logo
    CINZA_TEXTO = colors.Color(0.2, 0.2, 0.2)  # Cinza escuro para texto
    CINZA_FUNDO = colors.Color(0.97, 0.97, 0.97)  # Cinza muito claro

    titulo_principal = ParagraphStyle(
        'TituloPrincipal',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=CINZA_TEXTO,
        alignment=1,  # Center
        spaceAfter=12,
        fontName='Helvetica-Bold'
    )

    subtitulo = ParagraphStyle(
        'Subtitulo',
        parent=styles['Normal'],
        fontSize=10,
        textColor=CINZA_TEXTO,
        alignment=1,
        spaceAfter=15,
        fontName='Helvetica'
    )

    return {
        'titulo_principal': titulo_principal,
        'subtitulo': subtitulo,
        'normal': styles['Normal'],
        'cores': {
            'teal': TEAL_COBIMOB,
            'purple': PURPLE_COBIMOB,
            'pink': PINK_COBIMOB,
            'texto': CINZA_TEXTO,
            'fundo': CINZA_FUNDO
        }
    }

def criar_cabecalho_com_logo_real(canvas, doc, estilo):
    """Cria cabeçalho usando a logo REAL da COBIMOB"""
    canvas.saveState()

    # Tentar carregar a logo real
    try:
        logo_path = "Cobimob logos-01.png"
        if os.path.exists(logo_path):
            # Logo real no canto superior esquerdo
            logo = Image(logo_path, width=120, height=35)
            logo.drawOn(canvas, 50, A4[1] - 70)
        else:
            # Fallback caso não encontre a logo
            canvas.setFont('Helvetica-Bold', 24)
            canvas.setFillColor(estilo['cores']['teal'])
            canvas.drawString(50, A4[1] - 50, "CobiMob")
    except:
        # Fallback em caso de erro
        canvas.setFont('Helvetica-Bold', 24)
        canvas.setFillColor(estilo['cores']['teal'])
        canvas.drawString(50, A4[1] - 50, "CobiMob")

    # Linha divisória sutil
    canvas.setStrokeColor(estilo['cores']['fundo'])
    canvas.setLineWidth(1)
    canvas.line(50, A4[1] - 75, A4[0] - 50, A4[1] - 75)

    canvas.restoreState()

def criar_rodape_papel_carta_real(canvas, doc, estilo):
    """Cria rodapé IGUAL ao papel carta COBIMOB"""
    canvas.saveState()

    # Faixa geométrica igual ao papel carta (parte inferior)
    # Recriar os elementos geométricos da carta

    # Faixa colorida inferior - padrão do papel carta
    faixa_altura = 20
    faixa_y = 15

    # Padrão de retângulos coloridos alternados (igual papel carta)
    cores_faixa = [
        estilo['cores']['teal'],
        estilo['cores']['purple'],
        estilo['cores']['pink']
    ]

    largura_segmento = A4[0] / 21  # 21 segmentos como no papel carta
    for i in range(21):
        cor_index = i % 3
        canvas.setFillColor(cores_faixa[cor_index])
        canvas.rect(i * largura_segmento, faixa_y, largura_segmento, faixa_altura, fill=1, stroke=0)

    # Informações de contato (igual papel carta)
    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(estilo['cores']['texto'])

    # Lado esquerdo
    canvas.drawString(50, 50, "R. Presidente Faria, 431 | q 42 | 4° andar | Centro | Curitiba | PR")
    canvas.drawString(50, 65, "www.cobimob.com.br")

    # Lado direito
    canvas.drawRightString(A4[0] - 50, 50, "contato@cobimob.com.br")
    canvas.drawRightString(A4[0] - 50, 65, "☎ +1 3501 5601")

    # Logo pequena CbMb (igual papel carta)
    canvas.setFont('Helvetica-Bold', 14)
    canvas.setFillColor(estilo['cores']['teal'])
    canvas.drawString(50, 35, "Cb")
    canvas.setFillColor(estilo['cores']['purple'])
    canvas.drawString(73, 35, "Mb")

    canvas.restoreState()

def criar_dados_completos_prestacao():
    """Dados COMPLETOS como nas prestações CONDO de referência"""
    return {
        # Informações do cabeçalho
        'proprietarios': [
            {'nome': 'Camilo R. Gusso', 'cpf': '098.602.089-30'},
            {'nome': 'Camila C. Gusso', 'cpf': '129.665.399-41'},
            {'nome': 'Reinaldo José Gusso', 'cpf': '089.166.619-27'}
        ],
        'locatario': {
            'nome': 'VIVALDO VALÉRIO DA SILVA',
            'cpf': '123.456.789-00'
        },
        'imovel': {
            'endereco': 'CONDOMÍNIO ALAMEDA CLUB RESIDENCIAL - APARTAMENTO 207 BLOCO A, VAGA DE GARAGEM Nº 203',
            'endereco_completo': 'SITO A RUA JOÃO ALENCAR GUIMARÃES, Nº 2580, CAMPO COMPRIDO, CURITIBA/PR, CEP: 81.220-190'
        },
        'periodo': {
            'mes_referencia': 'Maio',
            'vencimento': '07/07/2025',
            'pagamento': '04/08/2025'
        },

        # Valores cobrados (COMPLETO como CONDO)
        'valores_cobrados': [
            {'item': 'Aluguel', 'valor': 1877.91},
            {'item': 'Seguro fiança (22/27)', 'valor': 165.00},
            {'item': 'Taxa de Condomínio - Ref ao vencimento 10/06/25', 'valor': 929.16},
            {'item': 'FCI - Fundo de Conservação', 'valor': 93.90},
            {'item': 'IPTU - Apartamento parcela 04/10', 'valor': 52.42},
            {'item': 'IPTU - Garagem parcela 04/07', 'valor': 20.82},
            {'item': 'Bonificação - Pagamento até o vencimento', 'valor': 0.00, 'tipo': 'bonificacao'},
            {'item': 'Reembolso - Fundo de Reserva', 'valor': -43.64, 'tipo': 'reembolso'},
            {'item': 'Reembolso - Fundo de obras', 'valor': -10.00, 'tipo': 'reembolso'},
            {'item': 'Reembolso - Reforma do Hall - Parc 06/24', 'valor': -127.89, 'tipo': 'reembolso'},
            {'item': 'Acréscimos por atraso (+) ref ao Aluguel', 'valor': 193.27, 'tipo': 'acrescimo'},
            {'item': 'Acréscimos por atraso (+) ref ao Seguro Fiança', 'valor': 16.98, 'tipo': 'acrescimo'},
            {'item': 'Acréscimos por atraso (+) taxa de condomínio', 'valor': 95.62, 'tipo': 'acrescimo'},
            {'item': 'Acréscimos por atraso (+) FCI', 'valor': 9.67, 'tipo': 'acrescimo'},
            {'item': 'Acréscimos por atraso (+) IPTU', 'valor': 7.54, 'tipo': 'acrescimo'}
        ],

        # Valores retidos (COMPLETO como CONDO)
        'valores_retidos': [
            {'item': 'Taxa de administração (5%)', 'valor': 150.02},
            {'item': 'Registro boleto', 'valor': 2.50},
            {'item': 'Transferência bancária adicional - R$10,00 (Qtd 2)', 'valor': 20.00},
            {'item': 'Valor retido para pagamento FCI (-)', 'valor': 103.57},
            {'item': 'Valor retido para pagamento IPTU (-)', 'valor': 80.78},
            {'item': 'Valor retido para pagamento Condomínio (-)', 'valor': 1024.78},
            {'item': 'Valor retido para pagamento Seguro Fiança (-)', 'valor': 181.98}
        ],

        # Repasses (COMPLETO como CONDO)
        'repasses': [
            {'proprietario': 'Camilo R. Gusso', 'valor': 572.38, 'pix': 'telefone 41996840799'},
            {'proprietario': 'Reinaldo José Gusso', 'valor': 572.38, 'pix': 'CPF 089.166.619-27'},
            {'proprietario': 'Camila C. Gusso', 'valor': 572.37, 'pix': 'telefone 41984411620'}
        ],

        # Totais calculados
        'totais': {
            'valor_total_acrescimos': 323.08,
            'valor_total_cobrado': 3280.76,
            'valor_total_retido': 1563.63,
            'valor_total_repasse': 1717.13,
            'data_repasse': '06/08/2025'
        }
    }

def gerar_opcao_1_clean_moderna():
    """OPÇÃO 1: Clean e Moderna - Foco na Legibilidade"""
    filename = 'COBIMOB_OPCAO_1_Clean_Moderna.pdf'

    doc = SimpleDocTemplate(
        filename,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=90,
        bottomMargin=90
    )

    estilo = criar_estilo_cobimob_real()
    dados = criar_dados_completos_prestacao()
    story = []

    # TÍTULO PRINCIPAL
    story.append(Paragraph("PRESTAÇÃO DE CONTAS", estilo['titulo_principal']))
    story.append(Spacer(1, 8))

    # INFORMAÇÕES PRINCIPAIS EM CAIXAS (estilo CONDO)
    info_boxes = [
        [f"PROPRIETÁRIO: {dados['proprietarios'][0]['nome']} - CPF: {dados['proprietarios'][0]['cpf']}"],
        [f"PROPRIETÁRIO: {dados['proprietarios'][1]['nome']} - CPF: {dados['proprietarios'][1]['cpf']}"],
        [f"PROPRIETÁRIO: {dados['proprietarios'][2]['nome']} - CPF: {dados['proprietarios'][2]['cpf']}"],
        [f"LOCATÁRIO: {dados['locatario']['nome']}"],
        [f"IMÓVEL: {dados['imovel']['endereco']}"],
        [f"{dados['imovel']['endereco_completo']}"],
        [f"MÊS DE REFERÊNCIA: {dados['periodo']['mes_referencia']}"]
    ]

    info_table = Table(info_boxes, colWidths=[7*inch])
    info_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white)
    ]))
    story.append(info_table)
    story.append(Spacer(1, 15))

    # DATAS DE VENCIMENTO E PAGAMENTO
    datas_data = [
        ['VENCIMENTO', dados['periodo']['vencimento']],
        ['PAGAMENTO REALIZADO EM:', dados['periodo']['pagamento']]
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

    # VALORES COBRADOS JUNTO AO ALUGUEL
    story.append(Paragraph("Valores cobrados junto ao aluguel", estilo['subtitulo']))

    valores_data = [['Descrição', 'Valor']]
    for item in dados['valores_cobrados']:
        if item['valor'] >= 0:
            valores_data.append([item['item'], f"R$ {item['valor']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')])
        else:
            valores_data.append([item['item'], f"-R$ {abs(item['valor']):,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')])

    # Adicionar subtotal de acréscimos
    valores_data.append(['Valor total Acréscimos', f"R$ {dados['totais']['valor_total_acrescimos']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')])
    valores_data.append(['Valor total', f"R$ {dados['totais']['valor_total_cobrado']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')])

    valores_table = Table(valores_data, colWidths=[5*inch, 1.5*inch])
    valores_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), estilo['cores']['fundo']),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -3), 'Helvetica'),
        ('FONTNAME', (0, -2), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, -2), (-1, -1), estilo['cores']['fundo'])
    ]))
    story.append(valores_table)
    story.append(Spacer(1, 15))

    # VALORES RETIDOS DO TOTAL PAGO
    story.append(Paragraph("Valores retidos do total pago", estilo['subtitulo']))

    retidos_data = [['Descrição', 'Valor']]
    for item in dados['valores_retidos']:
        retidos_data.append([item['item'], f"R$ {item['valor']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')])
    retidos_data.append(['Valor total retido', f"R$ {dados['totais']['valor_total_retido']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')])

    retidos_table = Table(retidos_data, colWidths=[5*inch, 1.5*inch])
    retidos_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), estilo['cores']['fundo']),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, -1), (-1, -1), estilo['cores']['fundo'])
    ]))
    story.append(retidos_table)
    story.append(Spacer(1, 15))

    # VALOR TOTAL A SER REPASSADO
    story.append(Paragraph("Valor total a ser repassado", estilo['subtitulo']))

    repasse_data = [['Proprietário', 'Valor']]
    for repasse in dados['repasses']:
        repasse_data.append([repasse['proprietario'], f"R$ {repasse['valor']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')])
    repasse_data.append(['Valor total a ser repassado:', f"R$ {dados['totais']['valor_total_repasse']:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')])

    repasse_table = Table(repasse_data, colWidths=[5*inch, 1.5*inch])
    repasse_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), estilo['cores']['fundo']),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -2), 'Helvetica'),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 4),
        ('BACKGROUND', (0, -1), (-1, -1), estilo['cores']['fundo'])
    ]))
    story.append(repasse_table)
    story.append(Spacer(1, 15))

    # DADOS BANCÁRIOS PARA REPASSE
    story.append(Paragraph("Dados Bancários", estilo['subtitulo']))

    bancarios_data = []
    for repasse in dados['repasses']:
        nome_curto = repasse['proprietario'].split()[0]  # Primeiro nome
        bancarios_data.append([f"DADOS BANCÁRIOS: {nome_curto} - chave(s) PIX: {repasse['pix']}"])
    bancarios_data.append([f"REPASSE REALIZADO EM: {dados['totais']['data_repasse']}"])

    bancarios_table = Table(bancarios_data, colWidths=[7*inch])
    bancarios_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
        ('PADDING', (0, 0), (-1, -1), 6)
    ]))
    story.append(bancarios_table)

    # Build PDF
    def myPages(canvas, doc):
        criar_cabecalho_com_logo_real(canvas, doc, estilo)
        criar_rodape_papel_carta_real(canvas, doc, estilo)

    doc.build(story, onFirstPage=myPages, onLaterPages=myPages)
    print(f"OPCAO 1 gerada: {filename}")
    return filename

if __name__ == "__main__":
    print("Gerando PDFs CORRETOS com logo REAL e informacoes COMPLETAS...")
    print()

    # Gerar primeira opção correta
    gerar_opcao_1_clean_moderna()

    print()
    print("PDF com informacoes completas gerado!")
    print("Usando logo REAL da COBIMOB e rodape do papel carta")