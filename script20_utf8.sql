USE [Cobimob]
GO
/****** Object:  Table [dbo].[Imoveis]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Imoveis](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_locador] [int] NULL,
	[endereco] [nvarchar](255) NULL,
	[tipo] [nvarchar](50) NULL,
	[valor_aluguel] [decimal](10, 2) NULL,
	[iptu] [decimal](10, 2) NULL,
	[condominio] [decimal](10, 2) NULL,
	[taxa_incendio] [decimal](10, 2) NULL,
	[status] [nvarchar](20) NULL,
	[matricula_imovel] [nvarchar](100) NULL,
	[area_imovel] [nvarchar](100) NULL,
	[dados_imovel] [nvarchar](max) NULL,
	[permite_pets] [bit] NULL,
	[info_iptu] [nvarchar](max) NULL,
	[observacoes_condominio] [nvarchar](max) NULL,
	[copel_unidade_consumidora] [nvarchar](50) NULL,
	[sanepar_matricula] [nvarchar](50) NULL,
	[tem_gas] [bit] NULL,
	[info_gas] [nvarchar](max) NULL,
	[boleto_condominio] [bit] NULL,
	[id_locatario] [int] NULL,
	[endereco_id] [int] NULL,
	[observacoes] [nvarchar](1000) NULL,
	[ativo] [bit] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
	[metragem_total] [decimal](8, 2) NULL,
	[metragem_construida] [decimal](8, 2) NULL,
	[ano_construcao] [int] NULL,
	[tipo_edificacao] [nvarchar](50) NULL,
	[quartos] [int] NULL,
	[banheiros] [int] NULL,
	[vagas_garagem] [int] NULL,
	[andar] [int] NULL,
	[elevador] [bit] NULL,
	[mobiliado] [bit] NULL,
	[aceita_pets] [bit] NULL,
	[area_total] [nvarchar](100) NULL,
	[area_privativa] [nvarchar](100) NULL,
	[suites] [int] NULL,
	[salas] [int] NULL,
	[cozinha] [int] NULL,
	[tem_sacada] [bit] NULL,
	[qtd_sacada] [int] NULL,
	[tem_churrasqueira] [bit] NULL,
	[qtd_churrasqueira] [int] NULL,
	[titular_iptu] [nvarchar](200) NULL,
	[inscricao_imobiliaria] [nvarchar](100) NULL,
	[indicacao_fiscal] [nvarchar](100) NULL,
	[nome_condominio] [nvarchar](200) NULL,
	[sindico_condominio] [nvarchar](200) NULL,
	[cnpj_condominio] [nvarchar](18) NULL,
	[email_condominio] [nvarchar](100) NULL,
	[telefone_condominio] [nvarchar](20) NULL,
	[caracteristicas] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Contratos]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Contratos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_imovel] [int] NULL,
	[id_locatario] [int] NULL,
	[data_inicio] [date] NULL,
	[data_fim] [date] NULL,
	[taxa_administracao] [decimal](5, 2) NULL,
	[fundo_conservacao] [decimal](5, 2) NULL,
	[tipo_reajuste] [nvarchar](10) NULL,
	[percentual_reajuste] [decimal](5, 2) NULL,
	[vencimento_dia] [int] NULL,
	[renovacao_automatica] [nvarchar](10) NULL,
	[seguro_obrigatorio] [nvarchar](10) NULL,
	[clausulas_adicionais] [varchar](max) NULL,
	[tipo_plano_locacao] [nvarchar](20) NULL,
	[valores_contrato] [nvarchar](max) NULL,
	[data_vigencia_segfianca] [date] NULL,
	[data_vigencia_segincendio] [date] NULL,
	[data_assinatura] [date] NULL,
	[ultimo_reajuste] [date] NULL,
	[proximo_reajuste] [date] NULL,
	[antecipacao_encargos] [bit] NULL,
	[aluguel_garantido] [bit] NULL,
	[mes_de_referencia] [nvarchar](20) NULL,
	[tipo_garantia] [nvarchar](50) NULL,
	[bonificacao] [decimal](5, 2) NULL,
	[retidos] [nvarchar](max) NULL,
	[info_garantias] [nvarchar](max) NULL,
	[id_plano_locacao] [int] NULL,
	[valor_aluguel] [decimal](10, 2) NULL,
	[valor_iptu] [decimal](10, 2) NULL,
	[valor_condominio] [decimal](10, 2) NULL,
	[taxa_locacao_calculada] [decimal](10, 2) NULL,
	[taxa_admin_calculada] [decimal](10, 2) NULL,
	[observacoes_plano] [nvarchar](500) NULL,
	[antecipa_condominio] [bit] NULL,
	[antecipa_seguro_fianca] [bit] NULL,
	[antecipa_seguro_incendio] [bit] NULL,
	[antecipa_iptu] [bit] NULL,
	[antecipa_taxa_lixo] [bit] NULL,
	[retido_fci] [bit] NULL,
	[retido_condominio] [bit] NULL,
	[retido_seguro_fianca] [bit] NULL,
	[retido_seguro_incendio] [bit] NULL,
	[retido_iptu] [bit] NULL,
	[retido_taxa_lixo] [bit] NULL,
	[valor_seguro_fianca] [decimal](10, 2) NULL,
	[valor_seguro_incendio] [decimal](10, 2) NULL,
	[valor_taxa_lixo] [decimal](10, 2) NULL,
	[valor_taxa_administracao] [decimal](10, 2) NULL,
	[valor_fundo_reserva] [decimal](10, 2) NULL,
	[seguro_fianca_inicio] [date] NULL,
	[seguro_fianca_fim] [date] NULL,
	[seguro_fianca_vencimento] [date] NULL,
	[seguro_incendio_inicio] [date] NULL,
	[seguro_incendio_fim] [date] NULL,
	[seguro_incendio_vencimento] [date] NULL,
	[seguradora_fianca] [nvarchar](200) NULL,
	[apolice_fianca] [nvarchar](100) NULL,
	[seguradora_incendio] [nvarchar](200) NULL,
	[apolice_incendio] [nvarchar](100) NULL,
	[valor_cobertura_fianca] [decimal](12, 2) NULL,
	[valor_cobertura_incendio] [decimal](12, 2) NULL,
	[observacoes_seguros] [nvarchar](1000) NULL,
	[dia_vencimento_aluguel] [int] NULL,
	[tolerancia_atraso_dias] [int] NULL,
	[percentual_multa_atraso] [decimal](5, 2) NULL,
	[percentual_juros_diario] [decimal](12, 6) NULL,
	[gerar_boleto_automatico] [bit] NULL,
	[enviar_lembrete_vencimento] [bit] NULL,
	[dias_antecedencia_lembrete] [int] NULL,
	[data_entrega_chaves] [date] NULL,
	[proximo_reajuste_automatico] [bit] NULL,
	[periodo_contrato] [int] NULL,
	[tempo_renovacao] [int] NULL,
	[tempo_reajuste] [int] NULL,
	[data_inicio_iptu] [date] NULL,
	[data_fim_iptu] [date] NULL,
	[parcelas_iptu] [int] NULL,
	[parcelas_seguro_fianca] [int] NULL,
	[parcelas_seguro_incendio] [int] NULL,
	[valor_fci] [decimal](10, 2) NULL,
	[tem_corretor] [bit] NULL,
	[corretor_nome] [nvarchar](200) NULL,
	[corretor_creci] [nvarchar](20) NULL,
	[corretor_cpf] [nvarchar](14) NULL,
	[corretor_telefone] [nvarchar](20) NULL,
	[corretor_email] [nvarchar](100) NULL,
	[obrigacao_manutencao] [bit] NULL,
	[obrigacao_pintura] [bit] NULL,
	[obrigacao_jardim] [bit] NULL,
	[obrigacao_limpeza] [bit] NULL,
	[obrigacao_pequenos_reparos] [bit] NULL,
	[obrigacao_vistoria] [bit] NULL,
	[multa_locador] [decimal](10, 2) NULL,
	[multa_locatario] [decimal](10, 2) NULL,
	[indice_reajuste] [nvarchar](50) NULL,
	[status] [nvarchar](20) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Pagamentos]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Pagamentos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NULL,
	[data_vencimento] [date] NULL,
	[data_pagamento] [date] NULL,
	[valor_aluguel] [decimal](10, 2) NULL,
	[valor_pago] [decimal](10, 2) NULL,
	[multa] [decimal](10, 2) NULL,
	[juros] [decimal](10, 2) NULL,
	[fci_pago] [decimal](10, 2) NULL,
	[status] [nvarchar](20) NULL,
	[encargos] [decimal](10, 2) NULL,
	[deducoes] [decimal](10, 2) NULL,
	[observacoes_manuais] [text] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Seguros]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Seguros](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NOT NULL,
	[seguradora] [varchar](255) NULL,
	[valor] [decimal](10, 2) NULL,
	[vigencia_inicio] [date] NULL,
	[vigencia_fim] [date] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Encargos]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Encargos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_imovel] [int] NOT NULL,
	[tipo] [varchar](100) NULL,
	[valor] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Taxas]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Taxas](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NOT NULL,
	[tipo] [varchar](100) NULL,
	[valor] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_TestePrestacaoContasImobiliaria]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [dbo].[vw_TestePrestacaoContasImobiliaria]
AS
SELECT
    p.id_contrato,
    p.data_vencimento AS mes_de_referencia,
    -- Boleto Bruto
    ISNULL(i.valor_aluguel, 0) +
    ISNULL(i.iptu, 0) +
    ISNULL(s.valor, 0) +
    ISNULL(i.taxa_incendio, 0) +
    ISNULL(i.condominio, 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Energia'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Gás'), 0) +
    ROUND((ISNULL(i.valor_aluguel, 0) -
           CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                          THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                          ELSE -ISNULL(c.bonificacao, 0) END
                ELSE 0 END) * (ISNULL(c.fundo_conservacao, 0) / 100), 2) +
    ISNULL(p.multa, 0) +
    ISNULL(p.juros, 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros1'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros2'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros3'), 0) AS Boleto_Bruto,

    -- Boleto Líquido
    ISNULL(i.valor_aluguel, 0) +
    ISNULL(i.iptu, 0) +
    ISNULL(s.valor, 0) +
    ISNULL(i.taxa_incendio, 0) +
    ISNULL(i.condominio, 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Energia'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Gás'), 0) +
    ROUND((ISNULL(i.valor_aluguel, 0) -
           CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                          THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                          ELSE -ISNULL(c.bonificacao, 0) END
                ELSE 0 END) * (ISNULL(c.fundo_conservacao, 0) / 100), 2) +
    ISNULL(p.multa, 0) +
    ISNULL(p.juros, 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros1'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros2'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros3'), 0) -
    CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
         THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                   THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                   ELSE -ISNULL(c.bonificacao, 0) END
         ELSE 0 END -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Benfeitoria1'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Benfeitoria2'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Benfeitoria3'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'FundoObras'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'FundoReserva'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'FundoIPTU'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'FundoOutros'), 0) AS Boleto_Liquido,

    -- Valor Retido
    ROUND((ISNULL(i.valor_aluguel, 0) + ISNULL(i.condominio, 0) + ISNULL(s.valor, 0) + ISNULL(i.taxa_incendio, 0) -
           CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                          THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                          ELSE -ISNULL(c.bonificacao, 0) END
                ELSE 0 END) * (ISNULL(c.taxa_administracao, 0) / 100), 2) +
    2.50 + -- Taxa de boleto
    10.00 + -- Taxa de TED
    CASE WHEN c.retidos LIKE '%IPTU%' THEN ISNULL(i.iptu, 0) ELSE 0 END +
    ROUND((ISNULL(i.valor_aluguel, 0) -
           CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                          THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                          ELSE -ISNULL(c.bonificacao, 0) END
                ELSE 0 END) * (ISNULL(c.fundo_conservacao, 0) / 100), 2) +
    CASE WHEN i.boleto_condominio = 1 AND ISNULL(i.status, 'Vago') != 'Vago' THEN ISNULL(i.condominio, 0) ELSE 0 END +
    ISNULL(s.valor, 0) +
    ISNULL(i.taxa_incendio, 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Energia'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Gás'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'HonorariosAdvogados'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'BoletoAdvogados'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros1'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros2'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros3'), 0) +
    CASE WHEN c.antecipacao_encargos = 1 AND ISNULL(i.condominio, 0) > 0
         THEN ROUND(ISNULL(i.condominio, 0) * (ISNULL(c.taxa_administracao, 0) / 100), 2)
         ELSE 0 END +
    CASE WHEN ISNULL(s.valor, 0) > 0
         THEN ROUND(ISNULL(s.valor, 0) * (ISNULL(c.taxa_administracao, 0) / 100), 2)
         ELSE 0 END +
    CASE WHEN ISNULL(i.taxa_incendio, 0) > 0
         THEN ROUND(ISNULL(i.taxa_incendio, 0) * (ISNULL(c.taxa_administracao, 0) / 100), 2)
         ELSE 0 END +
    CASE WHEN p.data_pagamento > p.data_vencimento AND (ISNULL(p.multa, 0) + ISNULL(p.juros, 0)) > 0
         THEN ROUND(
              (ISNULL(i.iptu, 0) + ISNULL(s.valor, 0) + ISNULL(i.taxa_incendio, 0) + ISNULL(i.condominio, 0) +
               ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Energia'), 0) +
               ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Gás'), 0) +
               ROUND((ISNULL(i.valor_aluguel, 0) -
                      CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                           THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                                     THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                                     ELSE -ISNULL(c.bonificacao, 0) END
                           ELSE 0 END) * (ISNULL(c.fundo_conservacao, 0) / 100), 2) +
               ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros1'), 0) +
               ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros2'), 0) +
               ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros3'), 0)) *
              (ISNULL(p.multa, 0) + ISNULL(p.juros, 0)) /
              NULLIF(
                  ISNULL(i.valor_aluguel, 0) + ISNULL(i.iptu, 0) + ISNULL(s.valor, 0) +
                  ISNULL(i.taxa_incendio, 0) + ISNULL(i.condominio, 0) +
                  ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Energia'), 0) +
                  ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Gás'), 0) +
                  ROUND((ISNULL(i.valor_aluguel, 0) -
                         CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                              THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                                        THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                                        ELSE -ISNULL(c.bonificacao, 0) END
                              ELSE 0 END) * (ISNULL(c.fundo_conservacao, 0) / 100), 2) +
                  ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros1'), 0) +
                  ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros2'), 0) +
                  ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros3'), 0),
                  0),
              2)
         ELSE 0 END AS Valor_Retido,

    -- Valor Repassado
    ISNULL(i.valor_aluguel, 0) +
    ISNULL(i.iptu, 0) +
    ISNULL(s.valor, 0) +
    ISNULL(i.taxa_incendio, 0) +
    ISNULL(i.condominio, 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Energia'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Gás'), 0) +
    ROUND((ISNULL(i.valor_aluguel, 0) -
           CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                          THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                          ELSE -ISNULL(c.bonificacao, 0) END
                ELSE 0 END) * (ISNULL(c.fundo_conservacao, 0) / 100), 2) +
    ISNULL(p.multa, 0) +
    ISNULL(p.juros, 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros1'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros2'), 0) +
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros3'), 0) -
    CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
         THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                   THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                   ELSE -ISNULL(c.bonificacao, 0) END
         ELSE 0 END -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Benfeitoria1'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Benfeitoria2'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Benfeitoria3'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'FundoObras'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'FundoReserva'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'FundoIPTU'), 0) -
    ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'FundoOutros'), 0) -
    (ROUND((ISNULL(i.valor_aluguel, 0) + ISNULL(i.condominio, 0) + ISNULL(s.valor, 0) + ISNULL(i.taxa_incendio, 0) -
            CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                 THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                           THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                           ELSE -ISNULL(c.bonificacao, 0) END
                 ELSE 0 END) * (ISNULL(c.taxa_administracao, 0) / 100), 2) +
     2.50 + -- Taxa de boleto
     10.00 + -- Taxa de TED
     CASE WHEN c.retidos LIKE '%IPTU%' THEN ISNULL(i.iptu, 0) ELSE 0 END +
     ROUND((ISNULL(i.valor_aluguel, 0) -
            CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                 THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                           THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                           ELSE -ISNULL(c.bonificacao, 0) END
                 ELSE 0 END) * (ISNULL(c.fundo_conservacao, 0) / 100), 2) +
     CASE WHEN i.boleto_condominio = 1 AND ISNULL(i.status, 'Vago') != 'Vago' THEN ISNULL(i.condominio, 0) ELSE 0 END +
     ISNULL(s.valor, 0) +
     ISNULL(i.taxa_incendio, 0) +
     ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Energia'), 0) +
     ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Gás'), 0) +
     ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'HonorariosAdvogados'), 0) +
     ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'BoletoAdvogados'), 0) +
     ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros1'), 0) +
     ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros2'), 0) +
     ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros3'), 0) +
     CASE WHEN c.antecipacao_encargos = 1 AND ISNULL(i.condominio, 0) > 0
          THEN ROUND(ISNULL(i.condominio, 0) * (ISNULL(c.taxa_administracao, 0) / 100), 2)
          ELSE 0 END +
     CASE WHEN ISNULL(s.valor, 0) > 0
          THEN ROUND(ISNULL(s.valor, 0) * (ISNULL(c.taxa_administracao, 0) / 100), 2)
          ELSE 0 END +
     CASE WHEN ISNULL(i.taxa_incendio, 0) > 0
          THEN ROUND(ISNULL(i.taxa_incendio, 0) * (ISNULL(c.taxa_administracao, 0) / 100), 2)
          ELSE 0 END +
     CASE WHEN p.data_pagamento > p.data_vencimento AND (ISNULL(p.multa, 0) + ISNULL(p.juros, 0)) > 0
          THEN ROUND(
               (ISNULL(i.iptu, 0) + ISNULL(s.valor, 0) + ISNULL(i.taxa_incendio, 0) + ISNULL(i.condominio, 0) +
                ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Energia'), 0) +
                ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Gás'), 0) +
                ROUND((ISNULL(i.valor_aluguel, 0) -
                       CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                            THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                                      THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                                      ELSE -ISNULL(c.bonificacao, 0) END
                            ELSE 0 END) * (ISNULL(c.fundo_conservacao, 0) / 100), 2) +
                ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros1'), 0) +
                ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros2'), 0) +
                ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros3'), 0)) *
               (ISNULL(p.multa, 0) + ISNULL(p.juros, 0)) /
               NULLIF(
                   ISNULL(i.valor_aluguel, 0) + ISNULL(i.iptu, 0) + ISNULL(s.valor, 0) +
                   ISNULL(i.taxa_incendio, 0) + ISNULL(i.condominio, 0) +
                   ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Energia'), 0) +
                   ISNULL((SELECT SUM(valor) FROM [dbo].[Encargos] e WHERE e.id_imovel = c.id_imovel AND e.tipo = 'Gás'), 0) +
                   ROUND((ISNULL(i.valor_aluguel, 0) -
                          CASE WHEN p.data_pagamento <= p.data_vencimento OR p.data_pagamento IS NULL
                               THEN CASE WHEN ISNULL(c.bonificacao, 0) <= 100
                                         THEN ISNULL(i.valor_aluguel, 0) * (ISNULL(c.bonificacao, 0) / 100)
                                         ELSE -ISNULL(c.bonificacao, 0) END
                               ELSE 0 END) * (ISNULL(c.fundo_conservacao, 0) / 100), 2) +
                   ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros1'), 0) +
                   ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros2'), 0) +
                   ISNULL((SELECT SUM(valor) FROM [dbo].[Taxas] t WHERE t.id_contrato = c.id AND t.tipo = 'Outros3'), 0),
                   0),
               2)
          ELSE 0 END) AS Valor_Repassado
FROM [dbo].[Pagamentos] p
INNER JOIN [dbo].[Contratos] c ON p.id_contrato = c.id
INNER JOIN [dbo].[Imoveis] i ON c.id_imovel = i.id
LEFT JOIN [dbo].[Seguros] s ON c.id = s.id_contrato;
GO
/****** Object:  Table [dbo].[Clientes]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Clientes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](100) NULL,
	[cpf_cnpj] [nvarchar](20) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](100) NULL,
	[endereco] [nvarchar](255) NULL,
	[tipo_recebimento] [nvarchar](20) NULL,
	[conta_bancaria] [nvarchar](100) NULL,
	[deseja_fci] [nvarchar](10) NULL,
	[deseja_seguro_fianca] [nvarchar](10) NULL,
	[rg] [nvarchar](255) NULL,
	[dados_empresa] [nvarchar](255) NULL,
	[representante] [nvarchar](255) NULL,
	[nacionalidade] [nvarchar](255) NULL,
	[estado_civil] [nvarchar](255) NULL,
	[profissao] [nvarchar](255) NULL,
	[deseja_seguro_incendio] [int] NULL,
	[existe_conjuge] [int] NULL,
	[nome_conjuge] [nvarchar](255) NULL,
	[cpf_conjuge] [nvarchar](255) NULL,
	[rg_conjuge] [nvarchar](255) NULL,
	[endereco_conjuge] [nvarchar](255) NULL,
	[telefone_conjuge] [nvarchar](255) NULL,
	[tipo_cliente] [nvarchar](50) NULL,
	[data_nascimento] [date] NULL,
	[endereco_id] [int] NULL,
	[dados_bancarios_id] [int] NULL,
	[tipo_pessoa] [nvarchar](2) NULL,
	[observacoes] [nvarchar](1000) NULL,
	[razao_social] [nvarchar](200) NULL,
	[nome_fantasia] [nvarchar](200) NULL,
	[inscricao_estadual] [nvarchar](50) NULL,
	[inscricao_municipal] [nvarchar](50) NULL,
	[atividade_principal] [nvarchar](200) NULL,
	[ativo] [bit] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
	[usa_multiplos_metodos] [bit] NULL,
	[usa_multiplas_contas] [bit] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Inquilinos]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Inquilinos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](100) NULL,
	[cpf_cnpj] [nvarchar](20) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](100) NULL,
	[tipo_garantia] [nvarchar](50) NULL,
	[responsavel_pgto_agua] [nvarchar](10) NULL,
	[responsavel_pgto_luz] [nvarchar](10) NULL,
	[responsavel_pgto_gas] [nvarchar](10) NULL,
	[rg] [nvarchar](255) NULL,
	[dados_empresa] [nvarchar](255) NULL,
	[representante] [nvarchar](255) NULL,
	[nacionalidade] [nvarchar](255) NULL,
	[estado_civil] [nvarchar](255) NULL,
	[profissao] [nvarchar](255) NULL,
	[dados_moradores] [int] NULL,
	[Endereco_inq] [nvarchar](255) NULL,
	[responsavel_inq] [int] NULL,
	[dependentes_inq] [int] NULL,
	[qtd_dependentes_inq] [int] NULL,
	[pet_inquilino] [int] NULL,
	[qtd_pet_inquilino] [int] NULL,
	[nome_conjuge] [nvarchar](255) NULL,
	[cpf_conjuge] [nvarchar](255) NULL,
	[rg_conjuge] [nvarchar](255) NULL,
	[endereco_conjuge] [nvarchar](255) NULL,
	[telefone_conjuge] [nvarchar](255) NULL,
	[porte_pet] [varchar](20) NULL,
	[endereco_id] [int] NULL,
	[dados_bancarios_id] [int] NULL,
	[tipo_pessoa] [nvarchar](2) NULL,
	[razao_social] [nvarchar](200) NULL,
	[nome_fantasia] [nvarchar](200) NULL,
	[inscricao_estadual] [nvarchar](50) NULL,
	[inscricao_municipal] [nvarchar](50) NULL,
	[atividade_principal] [nvarchar](200) NULL,
	[tem_moradores] [bit] NULL,
	[tem_fiador] [bit] NULL,
	[data_nascimento] [date] NULL,
	[observacoes] [nvarchar](1000) NULL,
	[ativo] [bit] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EnderecoImovel]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EnderecoImovel](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[rua] [nvarchar](200) NOT NULL,
	[numero] [nvarchar](10) NULL,
	[complemento] [nvarchar](100) NULL,
	[bairro] [nvarchar](100) NOT NULL,
	[cidade] [nvarchar](100) NOT NULL,
	[uf] [nvarchar](2) NULL,
	[cep] [nvarchar](10) NULL,
	[referencia] [nvarchar](200) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PlanosLocacao]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PlanosLocacao](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[codigo] [nvarchar](20) NOT NULL,
	[nome] [nvarchar](100) NOT NULL,
	[descricao] [nvarchar](500) NULL,
	[categoria] [nvarchar](20) NOT NULL,
	[opcao] [int] NOT NULL,
	[taxa_primeiro_aluguel] [decimal](5, 2) NOT NULL,
	[taxa_demais_alugueis] [decimal](5, 2) NOT NULL,
	[taxa_administracao] [decimal](5, 2) NULL,
	[aplica_taxa_unica] [bit] NULL,
	[ativo] [bit] NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED
(
	[codigo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_ContratosCompletos]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

            CREATE VIEW [dbo].[vw_ContratosCompletos] AS
            SELECT
                c.id,
                c.data_inicio,
                c.data_fim,

                -- Dados do Imóvel
                i.tipo as imovel_tipo,
                ei.rua + ISNULL(', ' + ei.numero, '') + ' - ' + ei.bairro + ' - ' + ei.cidade as imovel_endereco_completo,
                ei.rua as imovel_rua,
                ei.numero as imovel_numero,
                ei.bairro as imovel_bairro,
                ei.cidade as imovel_cidade,
                ei.cep as imovel_cep,

                -- Dados do Inquilino
                inq.nome as inquilino_nome,
                inq.cpf_cnpj as inquilino_documento,
                inq.telefone as inquilino_telefone,

                -- Dados do Cliente (Proprietário)
                cl.nome as proprietario_nome,
                cl.cpf_cnpj as proprietario_documento,

                -- Plano de Locação
                pl.nome as plano_nome,
                pl.categoria as plano_categoria,

                -- Valores
                c.valor_aluguel,
                c.valor_iptu,
                c.valor_condominio,
                c.valor_seguro_fianca,
                c.valor_seguro_incendio,
                c.taxa_locacao_calculada,
                c.taxa_admin_calculada,

                -- Antecipações
                c.antecipa_condominio,
                c.antecipa_seguro_fianca,
                c.antecipa_seguro_incendio,
                c.antecipa_iptu,

                -- Retidos
                c.retido_fci,
                c.retido_condominio,
                c.retido_seguro_fianca,
                c.retido_seguro_incendio,

                -- Seguros
                c.seguro_fianca_inicio,
                c.seguro_fianca_fim,
                c.seguro_incendio_inicio,
                c.seguro_incendio_fim,
                c.seguradora_fianca,
                c.seguradora_incendio,

                -- Cobrança
                c.dia_vencimento_aluguel,
                c.percentual_multa_atraso,
                c.percentual_juros_diario,

                -- Status calculado
                CASE
                    WHEN c.data_fim < GETDATE() THEN 'Vencido'
                    WHEN c.data_inicio > GETDATE() THEN 'Futuro'
                    ELSE 'Ativo'
                END as status_calculado

            FROM Contratos c
            LEFT JOIN Imoveis i ON c.id_imovel = i.id
            LEFT JOIN EnderecoImovel ei ON i.endereco_id = ei.id
            LEFT JOIN Inquilinos inq ON c.id_inquilino = inq.id
            LEFT JOIN Clientes cl ON i.id_cliente = cl.id
            LEFT JOIN PlanosLocacao pl ON c.id_plano_locacao = pl.id

GO
/****** Object:  Table [dbo].[TelefonesLocatario]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TelefonesLocatario](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[locatario_id] [int] NOT NULL,
	[telefone] [nvarchar](20) NOT NULL,
	[tipo] [nvarchar](20) NULL,
	[principal] [bit] NULL,
	[ativo] [bit] NULL,
	[whatsapp] [bit] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EmailsLocatario]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EmailsLocatario](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[locatario_id] [int] NOT NULL,
	[email] [nvarchar](255) NOT NULL,
	[tipo] [nvarchar](20) NULL,
	[principal] [bit] NULL,
	[ativo] [bit] NULL,
	[recebe_cobranca] [bit] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FormasEnvioCobranca]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FormasEnvioCobranca](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[locatario_id] [int] NOT NULL,
	[tipo] [varchar](20) NOT NULL,
	[contato] [nvarchar](255) NULL,
	[observacoes] [nvarchar](500) NULL,
	[principal] [bit] NULL,
	[ativo] [bit] NULL,
	[ordem] [int] NULL,
	[verificado] [bit] NULL,
	[data_verificacao] [datetime] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Locatarios]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Locatarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](200) NOT NULL,
	[cpf_cnpj] [nvarchar](18) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](100) NULL,
	[tipo_pessoa] [nvarchar](2) NULL,
	[rg] [nvarchar](15) NULL,
	[data_nascimento] [date] NULL,
	[nacionalidade] [nvarchar](50) NULL,
	[estado_civil] [nvarchar](20) NULL,
	[profissao] [nvarchar](100) NULL,
	[endereco_rua] [nvarchar](200) NULL,
	[endereco_numero] [nvarchar](10) NULL,
	[endereco_complemento] [nvarchar](100) NULL,
	[endereco_bairro] [nvarchar](100) NULL,
	[endereco_cidade] [nvarchar](100) NULL,
	[endereco_estado] [nvarchar](2) NULL,
	[endereco_cep] [nvarchar](10) NULL,
	[possui_conjuge] [bit] NULL,
	[conjuge_nome] [nvarchar](200) NULL,
	[conjuge_cpf] [nvarchar](14) NULL,
	[possui_inquilino_solidario] [bit] NULL,
	[possui_fiador] [bit] NULL,
	[qtd_pets] [int] NULL,
	[observacoes] [nvarchar](max) NULL,
	[ativo] [bit] NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
	[atividade_principal] [nvarchar](200) NULL,
	[cpf_conjuge] [nvarchar](255) NULL,
	[dados_bancarios_id] [int] NULL,
	[dados_empresa] [nvarchar](255) NULL,
	[dados_moradores] [int] NULL,
	[data_atualizacao] [datetime] NULL,
	[data_cadastro] [datetime] NULL,
	[dependentes_inq] [int] NULL,
	[endereco_conjuge] [nvarchar](255) NULL,
	[endereco_id] [int] NULL,
	[Endereco_inq] [nvarchar](255) NULL,
	[inscricao_estadual] [nvarchar](50) NULL,
	[inscricao_municipal] [nvarchar](50) NULL,
	[nome_conjuge] [nvarchar](255) NULL,
	[nome_fantasia] [nvarchar](200) NULL,
	[pet_inquilino] [int] NULL,
	[porte_pet] [varchar](20) NULL,
	[qtd_dependentes_inq] [int] NULL,
	[qtd_pet_inquilino] [int] NULL,
	[razao_social] [nvarchar](200) NULL,
	[representante] [nvarchar](255) NULL,
	[responsavel_inq] [int] NULL,
	[responsavel_pgto_agua] [nvarchar](10) NULL,
	[responsavel_pgto_gas] [nvarchar](10) NULL,
	[responsavel_pgto_luz] [nvarchar](10) NULL,
	[rg_conjuge] [nvarchar](255) NULL,
	[telefone_conjuge] [nvarchar](255) NULL,
	[tem_fiador] [bit] NULL,
	[tem_moradores] [bit] NULL,
	[tipo_garantia] [nvarchar](50) NULL,
	[regime_bens] [nvarchar](100) NULL,
	[data_constituicao] [date] NULL,
	[capital_social] [decimal](18, 2) NULL,
	[porte_empresa] [nvarchar](50) NULL,
	[regime_tributario] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EnderecoLocatario]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EnderecoLocatario](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[rua] [nvarchar](200) NULL,
	[numero] [nvarchar](10) NULL,
	[complemento] [nvarchar](100) NULL,
	[bairro] [nvarchar](100) NULL,
	[cidade] [nvarchar](100) NULL,
	[uf] [nvarchar](2) NULL,
	[cep] [nvarchar](10) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_locatarios_contatos_completos]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

    CREATE VIEW [dbo].[vw_locatarios_contatos_completos] AS
    SELECT
        l.id,
        l.nome,
        l.cpf_cnpj,
        l.tipo_pessoa,
        -- Telefone principal (para compatibilidade)
        (SELECT TOP 1 telefone FROM TelefonesLocatario
         WHERE locatario_id = l.id AND principal = 1 AND ativo = 1) as telefone_principal,
        -- Email principal (para compatibilidade)
        (SELECT TOP 1 email FROM EmailsLocatario
         WHERE locatario_id = l.id AND principal = 1 AND ativo = 1) as email_principal,
        -- Endereço completo
        CASE
            WHEN e.rua IS NOT NULL THEN
                e.rua +
                CASE WHEN e.numero IS NOT NULL THEN ', ' + e.numero ELSE '' END +
                CASE WHEN e.bairro IS NOT NULL THEN ' - ' + e.bairro ELSE '' END +
                CASE WHEN e.cidade IS NOT NULL THEN ' - ' + e.cidade ELSE '' END +
                CASE WHEN e.uf IS NOT NULL THEN '/' + e.uf ELSE '' END
            WHEN l.endereco_rua IS NOT NULL THEN
                l.endereco_rua +
                CASE WHEN l.endereco_numero IS NOT NULL THEN ', ' + l.endereco_numero ELSE '' END
            ELSE ISNULL(l.Endereco_inq, '')
        END as endereco_completo,
        -- Contagem de contatos
        (SELECT COUNT(*) FROM TelefonesLocatario
         WHERE locatario_id = l.id AND ativo = 1) as qtd_telefones,
        (SELECT COUNT(*) FROM EmailsLocatario
         WHERE locatario_id = l.id AND ativo = 1) as qtd_emails,
        (SELECT COUNT(*) FROM FormasEnvioCobranca
         WHERE locatario_id = l.id AND ativo = 1) as qtd_formas_cobranca,
        l.ativo,
        l.created_at,
        l.updated_at
    FROM Locatarios l
    LEFT JOIN EnderecoLocatario e ON l.endereco_id = e.id
GO
/****** Object:  Table [dbo].[Proprietarios]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Proprietarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](200) NOT NULL,
	[cpf_cnpj] [nvarchar](18) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](100) NULL,
	[tipo_pessoa] [nvarchar](2) NULL,
	[rg] [nvarchar](15) NULL,
	[data_nascimento] [date] NULL,
	[nacionalidade] [nvarchar](50) NULL,
	[estado_civil] [nvarchar](20) NULL,
	[profissao] [nvarchar](100) NULL,
	[existe_conjuge] [bit] NULL,
	[nome_conjuge] [nvarchar](200) NULL,
	[cpf_conjuge] [nvarchar](14) NULL,
	[rg_conjuge] [nvarchar](15) NULL,
	[endereco_conjuge] [nvarchar](500) NULL,
	[telefone_conjuge] [nvarchar](20) NULL,
	[endereco_rua] [nvarchar](200) NULL,
	[endereco_numero] [nvarchar](10) NULL,
	[endereco_complemento] [nvarchar](100) NULL,
	[endereco_bairro] [nvarchar](100) NULL,
	[endereco_cidade] [nvarchar](100) NULL,
	[endereco_estado] [nvarchar](2) NULL,
	[endereco_cep] [nvarchar](10) NULL,
	[dados_bancarios_tipo] [nvarchar](20) NULL,
	[dados_bancarios_pix] [nvarchar](200) NULL,
	[dados_bancarios_banco] [nvarchar](100) NULL,
	[dados_bancarios_agencia] [nvarchar](10) NULL,
	[dados_bancarios_conta] [nvarchar](20) NULL,
	[dados_bancarios_tipo_conta] [nvarchar](20) NULL,
	[observacoes] [nvarchar](max) NULL,
	[ativo] [bit] NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  View [dbo].[vw_Clientes]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

        CREATE VIEW [dbo].[vw_Clientes] AS
        SELECT
            id,
            nome,
            cpf_cnpj,
            telefone,
            email,
            tipo_pessoa,
            ativo,
            created_at,
            updated_at
        FROM Proprietarios

GO
/****** Object:  View [dbo].[vw_Inquilinos]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

        CREATE VIEW [dbo].[vw_Inquilinos] AS
        SELECT
            id,
            nome,
            cpf_cnpj,
            telefone,
            email,
            tipo_pessoa,
            ativo,
            created_at,
            updated_at
        FROM Locatarios

GO
/****** Object:  Table [dbo].[Clientes_BACKUP]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Clientes_BACKUP](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](100) NULL,
	[cpf_cnpj] [nvarchar](20) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](100) NULL,
	[endereco] [nvarchar](255) NULL,
	[tipo_recebimento] [nvarchar](20) NULL,
	[conta_bancaria] [nvarchar](100) NULL,
	[deseja_fci] [nvarchar](10) NULL,
	[deseja_seguro_fianca] [nvarchar](10) NULL,
	[rg] [nvarchar](255) NULL,
	[dados_empresa] [nvarchar](255) NULL,
	[representante] [nvarchar](255) NULL,
	[nacionalidade] [nvarchar](255) NULL,
	[estado_civil] [nvarchar](255) NULL,
	[profissao] [nvarchar](255) NULL,
	[deseja_seguro_incendio] [int] NULL,
	[existe_conjuge] [int] NULL,
	[nome_conjuge] [nvarchar](255) NULL,
	[cpf_conjuge] [nvarchar](255) NULL,
	[rg_conjuge] [nvarchar](255) NULL,
	[endereco_conjuge] [nvarchar](255) NULL,
	[telefone_conjuge] [nvarchar](255) NULL,
	[tipo_cliente] [nvarchar](50) NULL,
	[data_nascimento] [date] NULL,
	[endereco_id] [int] NULL,
	[dados_bancarios_id] [int] NULL,
	[tipo_pessoa] [nvarchar](2) NULL,
	[observacoes] [nvarchar](1000) NULL,
	[razao_social] [nvarchar](200) NULL,
	[nome_fantasia] [nvarchar](200) NULL,
	[inscricao_estadual] [nvarchar](50) NULL,
	[inscricao_municipal] [nvarchar](50) NULL,
	[atividade_principal] [nvarchar](200) NULL,
	[ativo] [bit] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContasBancarias]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContasBancarias](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_locador] [int] NOT NULL,
	[banco] [varchar](100) NULL,
	[agencia] [varchar](20) NULL,
	[conta] [varchar](30) NULL,
	[tipo_conta] [varchar](20) NULL,
	[chave_pix] [varchar](100) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContasBancariasLocador]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContasBancariasLocador](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[locador_id] [int] NOT NULL,
	[tipo_recebimento] [varchar](10) NOT NULL,
	[principal] [bit] NULL,
	[chave_pix] [varchar](200) NULL,
	[banco] [varchar](10) NULL,
	[agencia] [varchar](20) NULL,
	[conta] [varchar](30) NULL,
	[tipo_conta] [varchar](20) NULL,
	[titular] [varchar](200) NULL,
	[cpf_titular] [varchar](20) NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
	[ativo] [bit] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContratoDocumentos]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContratoDocumentos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[contrato_id] [int] NOT NULL,
	[tipo_documento] [nvarchar](50) NOT NULL,
	[nome_arquivo] [nvarchar](255) NOT NULL,
	[tipo_arquivo] [nvarchar](50) NULL,
	[tamanho_bytes] [bigint] NULL,
	[caminho_arquivo] [nvarchar](500) NULL,
	[url_arquivo] [nvarchar](500) NULL,
	[data_upload] [datetime2](7) NULL,
	[ativo] [bit] NULL,
	[observacoes] [text] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContratoLocadores]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContratoLocadores](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[contrato_id] [int] NOT NULL,
	[locador_id] [int] NOT NULL,
	[conta_bancaria_id] [int] NOT NULL,
	[porcentagem] [decimal](5, 2) NOT NULL,
	[data_criacao] [datetime2](7) NULL,
	[data_atualizacao] [datetime2](7) NULL,
	[ativo] [bit] NULL,
	[responsabilidade_principal] [bit] NULL,
	[observacoes] [text] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UC_ContratoLocadores_Unico] UNIQUE NONCLUSTERED
(
	[contrato_id] ASC,
	[locador_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContratoLocatarios]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContratoLocatarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[contrato_id] [int] NOT NULL,
	[locatario_id] [int] NOT NULL,
	[responsabilidade_principal] [bit] NULL,
	[percentual_responsabilidade] [decimal](5, 2) NULL,
	[data_entrada] [date] NULL,
	[data_saida] [date] NULL,
	[observacoes] [text] NULL,
	[ativo] [bit] NULL,
	[data_criacao] [datetime2](7) NULL,
	[data_atualizacao] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UC_ContratoLocatarios_Unico] UNIQUE NONCLUSTERED
(
	[contrato_id] ASC,
	[locatario_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContratoPets]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContratoPets](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[contrato_id] [int] NOT NULL,
	[nome] [nvarchar](100) NOT NULL,
	[especie] [nvarchar](50) NOT NULL,
	[raca] [nvarchar](100) NULL,
	[tamanho] [nvarchar](20) NULL,
	[idade] [int] NULL,
	[peso_kg] [decimal](5, 2) NULL,
	[cor] [nvarchar](50) NULL,
	[sexo] [nvarchar](10) NULL,
	[castrado] [bit] NULL,
	[vacinado] [bit] NULL,
	[observacoes] [text] NULL,
	[ativo] [bit] NULL,
	[data_cadastro] [datetime2](7) NULL,
	[data_atualizacao] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ContratosResumo]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ContratosResumo](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NOT NULL,
	[id_unidade_cond21] [int] NULL,
	[resumo] [text] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[CorretorContaBancaria]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[CorretorContaBancaria](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[contrato_id] [int] NOT NULL,
	[banco] [nvarchar](100) NULL,
	[agencia] [nvarchar](20) NULL,
	[conta] [nvarchar](30) NULL,
	[tipo_conta] [nvarchar](20) NULL,
	[chave_pix] [nvarchar](100) NULL,
	[titular] [nvarchar](200) NULL,
	[principal] [bit] NULL,
	[ativo] [bit] NULL,
	[data_criacao] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DadosBancarios]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DadosBancarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[tipo_recebimento] [nvarchar](20) NULL,
	[chave_pix] [nvarchar](255) NULL,
	[banco] [nvarchar](100) NULL,
	[agencia] [nvarchar](20) NULL,
	[conta] [nvarchar](30) NULL,
	[tipo_conta] [nvarchar](20) NULL,
	[titular] [nvarchar](255) NULL,
	[cpf_titular] [nvarchar](14) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DadosBancariosInquilino]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DadosBancariosInquilino](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[forma_recebimento] [nvarchar](20) NULL,
	[chave_pix] [nvarchar](200) NULL,
	[tipo_chave_pix] [nvarchar](20) NULL,
	[banco] [nvarchar](100) NULL,
	[agencia] [nvarchar](10) NULL,
	[conta] [nvarchar](20) NULL,
	[tipo_conta] [nvarchar](20) NULL,
	[titular] [nvarchar](200) NULL,
	[cpf_titular] [nvarchar](14) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DadosBancariosLocador]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DadosBancariosLocador](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[forma_recebimento] [nvarchar](20) NULL,
	[chave_pix] [nvarchar](200) NULL,
	[tipo_chave_pix] [nvarchar](20) NULL,
	[banco] [nvarchar](100) NULL,
	[agencia] [nvarchar](10) NULL,
	[conta] [nvarchar](20) NULL,
	[tipo_conta] [nvarchar](20) NULL,
	[titular] [nvarchar](200) NULL,
	[cpf_titular] [nvarchar](14) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DatasContrato]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DatasContrato](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NOT NULL,
	[data_ultimo_reajuste] [date] NULL,
	[data_vistoria] [date] NULL,
	[data_encerramento] [date] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DescontosDeducoes]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DescontosDeducoes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_pagamento] [int] NOT NULL,
	[tipo] [varchar](100) NOT NULL,
	[valor] [decimal](10, 2) NOT NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DistribuicaoRepasseLocadores]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DistribuicaoRepasseLocadores](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[prestacao_id] [int] NOT NULL,
	[locador_id] [int] NULL,
	[locador_nome] [nvarchar](255) NOT NULL,
	[percentual_participacao] [decimal](5, 2) NULL,
	[valor_repasse] [decimal](10, 2) NOT NULL,
	[responsabilidade_principal] [bit] NULL,
	[data_criacao] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
	[ativo] [bit] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DocumentosEmpresaLocador]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DocumentosEmpresaLocador](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_locador] [int] NULL,
	[contrato_social] [nvarchar](500) NULL,
	[cartao_cnpj] [nvarchar](500) NULL,
	[comprovante_renda] [nvarchar](500) NULL,
	[comprovante_endereco] [nvarchar](500) NULL,
	[inscricao_estadual] [nvarchar](50) NULL,
	[inscricao_municipal] [nvarchar](50) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DocumentosEmpresaLocatario]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DocumentosEmpresaLocatario](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_locatario] [int] NULL,
	[contrato_social] [nvarchar](500) NULL,
	[cartao_cnpj] [nvarchar](500) NULL,
	[comprovante_renda] [nvarchar](500) NULL,
	[comprovante_endereco] [nvarchar](500) NULL,
	[inscricao_estadual] [nvarchar](50) NULL,
	[inscricao_municipal] [nvarchar](50) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EmailsLocador]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EmailsLocador](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[locador_id] [int] NOT NULL,
	[email] [nvarchar](100) NOT NULL,
	[tipo] [nvarchar](20) NULL,
	[principal] [bit] NOT NULL,
	[ativo] [bit] NOT NULL,
	[data_cadastro] [datetime] NOT NULL,
 CONSTRAINT [PK_EmailsLocador] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[EnderecoLocador]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[EnderecoLocador](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[rua] [nvarchar](200) NULL,
	[numero] [nvarchar](10) NULL,
	[complemento] [nvarchar](100) NULL,
	[bairro] [nvarchar](100) NULL,
	[cidade] [nvarchar](100) NULL,
	[uf] [nvarchar](2) NULL,
	[cep] [nvarchar](10) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Enderecos]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Enderecos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[rua] [nvarchar](255) NULL,
	[numero] [nvarchar](20) NULL,
	[complemento] [nvarchar](100) NULL,
	[bairro] [nvarchar](100) NULL,
	[cidade] [nvarchar](100) NULL,
	[estado] [nvarchar](2) NULL,
	[cep] [nvarchar](10) NULL,
	[endereco_completo] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Fiadores]    Script Date: 29/09/2025 13:05:15 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Fiadores](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NOT NULL,
	[nome] [varchar](255) NULL,
	[cpf_cnpj] [varchar](20) NULL,
	[telefone] [varchar](20) NULL,
	[email] [varchar](255) NULL,
	[endereco] [varchar](255) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FiadorLocatario]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FiadorLocatario](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_locatario] [int] NULL,
	[nome] [nvarchar](200) NOT NULL,
	[cpf] [nvarchar](14) NOT NULL,
	[rg] [nvarchar](20) NULL,
	[endereco] [nvarchar](500) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](200) NULL,
	[profissao] [nvarchar](100) NULL,
	[renda] [decimal](10, 2) NULL,
	[estado_civil] [nvarchar](50) NULL,
	[conjuge_nome] [nvarchar](200) NULL,
	[conjuge_cpf] [nvarchar](14) NULL,
	[observacoes] [nvarchar](500) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[FormasRecebimentoLocador]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[FormasRecebimentoLocador](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[locador_id] [int] NOT NULL,
	[forma_recebimento] [nvarchar](20) NOT NULL,
	[ativo] [bit] NOT NULL,
	[data_cadastro] [datetime] NOT NULL,
 CONSTRAINT [PK_FormasRecebimentoLocador] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Garantias]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Garantias](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NOT NULL,
	[tipo] [varchar](50) NULL,
	[valor] [decimal](10, 2) NULL,
	[observacoes] [text] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[GarantiasIndividuais]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[GarantiasIndividuais](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[contrato_id] [int] NOT NULL,
	[pessoa_id] [int] NOT NULL,
	[pessoa_tipo] [nvarchar](20) NOT NULL,
	[tipo_garantia] [nvarchar](50) NOT NULL,
	[valor_garantia] [decimal](12, 2) NULL,
	[fiador_nome] [nvarchar](200) NULL,
	[fiador_cpf] [nvarchar](14) NULL,
	[fiador_telefone] [nvarchar](20) NULL,
	[fiador_endereco] [text] NULL,
	[caucao_tipo] [nvarchar](50) NULL,
	[caucao_descricao] [text] NULL,
	[caucao_data_devolucao] [date] NULL,
	[titulo_seguradora] [nvarchar](200) NULL,
	[titulo_numero] [nvarchar](100) NULL,
	[titulo_valor] [decimal](12, 2) NULL,
	[titulo_vencimento] [date] NULL,
	[apolice_seguradora] [nvarchar](200) NULL,
	[apolice_numero] [nvarchar](100) NULL,
	[apolice_valor_cobertura] [decimal](12, 2) NULL,
	[apolice_vigencia_inicio] [date] NULL,
	[apolice_vigencia_fim] [date] NULL,
	[observacoes] [text] NULL,
	[documentos_path] [nvarchar](500) NULL,
	[ativo] [bit] NULL,
	[data_criacao] [datetime2](7) NULL,
	[data_atualizacao] [datetime2](7) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[HistoricoContratos]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[HistoricoContratos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NOT NULL,
	[campo_alterado] [nvarchar](100) NOT NULL,
	[valor_anterior] [nvarchar](max) NULL,
	[valor_novo] [nvarchar](max) NULL,
	[tipo_operacao] [nvarchar](50) NOT NULL,
	[descricao_mudanca] [nvarchar](500) NULL,
	[data_alteracao] [datetime] NULL,
	[usuario] [nvarchar](100) NULL,
	[ip_usuario] [nvarchar](45) NULL,
	[observacoes] [nvarchar](500) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[ImovelLocadores]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ImovelLocadores](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[imovel_id] [int] NOT NULL,
	[locador_id] [int] NOT NULL,
	[porcentagem] [decimal](5, 2) NOT NULL,
	[responsabilidade_principal] [bit] NULL,
	[data_criacao] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
	[ativo] [bit] NULL,
 CONSTRAINT [PK_ImovelLocadores] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
 CONSTRAINT [UC_ImovelLocadores_Unico] UNIQUE NONCLUSTERED
(
	[imovel_id] ASC,
	[locador_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Inquilinos_BACKUP]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Inquilinos_BACKUP](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](100) NULL,
	[cpf_cnpj] [nvarchar](20) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](100) NULL,
	[tipo_garantia] [nvarchar](50) NULL,
	[responsavel_pgto_agua] [nvarchar](10) NULL,
	[responsavel_pgto_luz] [nvarchar](10) NULL,
	[responsavel_pgto_gas] [nvarchar](10) NULL,
	[rg] [nvarchar](255) NULL,
	[dados_empresa] [nvarchar](255) NULL,
	[representante] [nvarchar](255) NULL,
	[nacionalidade] [nvarchar](255) NULL,
	[estado_civil] [nvarchar](255) NULL,
	[profissao] [nvarchar](255) NULL,
	[dados_moradores] [int] NULL,
	[Endereco_inq] [nvarchar](255) NULL,
	[responsavel_inq] [int] NULL,
	[dependentes_inq] [int] NULL,
	[qtd_dependentes_inq] [int] NULL,
	[pet_inquilino] [int] NULL,
	[qtd_pet_inquilino] [int] NULL,
	[nome_conjuge] [nvarchar](255) NULL,
	[cpf_conjuge] [nvarchar](255) NULL,
	[rg_conjuge] [nvarchar](255) NULL,
	[endereco_conjuge] [nvarchar](255) NULL,
	[telefone_conjuge] [nvarchar](255) NULL,
	[porte_pet] [varchar](20) NULL,
	[endereco_id] [int] NULL,
	[dados_bancarios_id] [int] NULL,
	[tipo_pessoa] [nvarchar](2) NULL,
	[razao_social] [nvarchar](200) NULL,
	[nome_fantasia] [nvarchar](200) NULL,
	[inscricao_estadual] [nvarchar](50) NULL,
	[inscricao_municipal] [nvarchar](50) NULL,
	[atividade_principal] [nvarchar](200) NULL,
	[tem_moradores] [bit] NULL,
	[tem_fiador] [bit] NULL,
	[data_nascimento] [date] NULL,
	[observacoes] [nvarchar](1000) NULL,
	[ativo] [bit] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Inquilinos_BACKUP_20250109]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Inquilinos_BACKUP_20250109](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](100) NULL,
	[cpf_cnpj] [nvarchar](20) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](100) NULL,
	[tipo_garantia] [nvarchar](50) NULL,
	[responsavel_pgto_agua] [nvarchar](10) NULL,
	[responsavel_pgto_luz] [nvarchar](10) NULL,
	[responsavel_pgto_gas] [nvarchar](10) NULL,
	[rg] [nvarchar](255) NULL,
	[dados_empresa] [nvarchar](255) NULL,
	[representante] [nvarchar](255) NULL,
	[nacionalidade] [nvarchar](255) NULL,
	[estado_civil] [nvarchar](255) NULL,
	[profissao] [nvarchar](255) NULL,
	[dados_moradores] [int] NULL,
	[Endereco_inq] [nvarchar](255) NULL,
	[responsavel_inq] [int] NULL,
	[dependentes_inq] [int] NULL,
	[qtd_dependentes_inq] [int] NULL,
	[pet_inquilino] [int] NULL,
	[qtd_pet_inquilino] [int] NULL,
	[nome_conjuge] [nvarchar](255) NULL,
	[cpf_conjuge] [nvarchar](255) NULL,
	[rg_conjuge] [nvarchar](255) NULL,
	[endereco_conjuge] [nvarchar](255) NULL,
	[telefone_conjuge] [nvarchar](255) NULL,
	[porte_pet] [varchar](20) NULL,
	[endereco_id] [int] NULL,
	[dados_bancarios_id] [int] NULL,
	[tipo_pessoa] [nvarchar](2) NULL,
	[razao_social] [nvarchar](200) NULL,
	[nome_fantasia] [nvarchar](200) NULL,
	[inscricao_estadual] [nvarchar](50) NULL,
	[inscricao_municipal] [nvarchar](50) NULL,
	[atividade_principal] [nvarchar](200) NULL,
	[tem_moradores] [bit] NULL,
	[tem_fiador] [bit] NULL,
	[data_nascimento] [date] NULL,
	[observacoes] [nvarchar](1000) NULL,
	[ativo] [bit] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LancamentosLiquidos]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LancamentosLiquidos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_pagamento] [int] NOT NULL,
	[tipo] [varchar](100) NOT NULL,
	[valor] [decimal](10, 2) NOT NULL,
	[descricao] [varchar](500) NULL,
	[data_lancamento] [date] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LancamentosPrestacaoContas]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LancamentosPrestacaoContas](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[prestacao_id] [int] NOT NULL,
	[tipo] [varchar](50) NOT NULL,
	[descricao] [varchar](500) NOT NULL,
	[valor] [decimal](10, 2) NOT NULL,
	[data_lancamento] [date] NULL,
	[data_criacao] [datetime] NULL,
	[ativo] [bit] NULL,
	[categoria] [varchar](20) NULL,
	[origem] [varchar](20) NULL,
	[ordem_exibicao] [int] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Locadores]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Locadores](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](100) NULL,
	[cpf_cnpj] [nvarchar](20) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](100) NULL,
	[endereco] [nvarchar](255) NULL,
	[tipo_recebimento] [nvarchar](20) NULL,
	[conta_bancaria] [nvarchar](100) NULL,
	[deseja_fci] [nvarchar](10) NULL,
	[deseja_seguro_fianca] [nvarchar](10) NULL,
	[rg] [nvarchar](255) NULL,
	[dados_empresa] [nvarchar](255) NULL,
	[representante] [nvarchar](255) NULL,
	[nacionalidade] [nvarchar](255) NULL,
	[estado_civil] [nvarchar](255) NULL,
	[profissao] [nvarchar](255) NULL,
	[deseja_seguro_incendio] [int] NULL,
	[existe_conjuge] [int] NULL,
	[nome_conjuge] [nvarchar](255) NULL,
	[cpf_conjuge] [nvarchar](255) NULL,
	[rg_conjuge] [nvarchar](255) NULL,
	[endereco_conjuge] [nvarchar](255) NULL,
	[telefone_conjuge] [nvarchar](255) NULL,
	[tipo_cliente] [nvarchar](50) NULL,
	[data_nascimento] [date] NULL,
	[endereco_id] [int] NULL,
	[dados_bancarios_id] [int] NULL,
	[tipo_pessoa] [nvarchar](2) NULL,
	[observacoes] [nvarchar](1000) NULL,
	[razao_social] [nvarchar](200) NULL,
	[nome_fantasia] [nvarchar](200) NULL,
	[inscricao_estadual] [nvarchar](50) NULL,
	[inscricao_municipal] [nvarchar](50) NULL,
	[atividade_principal] [nvarchar](200) NULL,
	[ativo] [bit] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
	[usa_multiplos_metodos] [bit] NULL,
	[usa_multiplas_contas] [bit] NULL,
	[regime_bens] [nvarchar](100) NULL,
	[email_recebimento] [nvarchar](100) NULL,
	[data_constituicao] [date] NULL,
	[capital_social] [decimal](18, 2) NULL,
	[porte_empresa] [nvarchar](50) NULL,
	[regime_tributario] [nvarchar](50) NULL,
	[observacoes_especiais] [nvarchar](1000) NULL,
 CONSTRAINT [PK_Locadores] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Locatarios_BACKUP_20250109]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Locatarios_BACKUP_20250109](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](200) NOT NULL,
	[cpf_cnpj] [nvarchar](18) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](100) NULL,
	[tipo_pessoa] [nvarchar](2) NULL,
	[rg] [nvarchar](15) NULL,
	[data_nascimento] [date] NULL,
	[nacionalidade] [nvarchar](50) NULL,
	[estado_civil] [nvarchar](20) NULL,
	[profissao] [nvarchar](100) NULL,
	[endereco_rua] [nvarchar](200) NULL,
	[endereco_numero] [nvarchar](10) NULL,
	[endereco_complemento] [nvarchar](100) NULL,
	[endereco_bairro] [nvarchar](100) NULL,
	[endereco_cidade] [nvarchar](100) NULL,
	[endereco_estado] [nvarchar](2) NULL,
	[endereco_cep] [nvarchar](10) NULL,
	[possui_conjuge] [bit] NULL,
	[conjuge_nome] [nvarchar](200) NULL,
	[conjuge_cpf] [nvarchar](14) NULL,
	[possui_inquilino_solidario] [bit] NULL,
	[possui_fiador] [bit] NULL,
	[qtd_pets] [int] NULL,
	[observacoes] [nvarchar](max) NULL,
	[ativo] [bit] NULL,
	[created_at] [datetime2](7) NULL,
	[updated_at] [datetime2](7) NULL,
	[atividade_principal] [nvarchar](200) NULL,
	[cpf_conjuge] [nvarchar](255) NULL,
	[dados_bancarios_id] [int] NULL,
	[dados_empresa] [nvarchar](255) NULL,
	[dados_moradores] [int] NULL,
	[data_atualizacao] [datetime] NULL,
	[data_cadastro] [datetime] NULL,
	[dependentes_inq] [int] NULL,
	[endereco_conjuge] [nvarchar](255) NULL,
	[endereco_id] [int] NULL,
	[Endereco_inq] [nvarchar](255) NULL,
	[inscricao_estadual] [nvarchar](50) NULL,
	[inscricao_municipal] [nvarchar](50) NULL,
	[nome_conjuge] [nvarchar](255) NULL,
	[nome_fantasia] [nvarchar](200) NULL,
	[pet_inquilino] [int] NULL,
	[porte_pet] [varchar](20) NULL,
	[qtd_dependentes_inq] [int] NULL,
	[qtd_pet_inquilino] [int] NULL,
	[razao_social] [nvarchar](200) NULL,
	[representante] [nvarchar](255) NULL,
	[responsavel_inq] [int] NULL,
	[responsavel_pgto_agua] [nvarchar](10) NULL,
	[responsavel_pgto_gas] [nvarchar](10) NULL,
	[responsavel_pgto_luz] [nvarchar](10) NULL,
	[rg_conjuge] [nvarchar](255) NULL,
	[telefone_conjuge] [nvarchar](255) NULL,
	[tem_fiador] [bit] NULL,
	[tem_moradores] [bit] NULL,
	[tipo_garantia] [nvarchar](50) NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LocatariosExtras]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LocatariosExtras](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NOT NULL,
	[nome] [varchar](255) NULL,
	[cpf_cnpj] [varchar](20) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[LogAtualizacaoAcrescimos]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[LogAtualizacaoAcrescimos](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[prestacao_id] [int] NOT NULL,
	[valor_anterior] [decimal](10, 2) NULL,
	[valor_novo] [decimal](10, 2) NULL,
	[dias_atraso] [int] NULL,
	[data_atualizacao] [datetime] NULL,
	[origem] [varchar](50) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Logs]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Logs](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_usuario] [int] NULL,
	[acao] [nvarchar](255) NULL,
	[data] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MetodosPagamentoLocador]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MetodosPagamentoLocador](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[locador_id] [int] NOT NULL,
	[tipo] [varchar](20) NOT NULL,
	[principal] [bit] NULL,
	[ativo] [bit] NULL,
	[data_cadastro] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
	[chave_pix] [varchar](200) NULL,
	[tipo_chave] [varchar](20) NULL,
	[banco] [varchar](10) NULL,
	[agencia] [varchar](20) NULL,
	[conta] [varchar](30) NULL,
	[tipo_conta] [varchar](20) NULL,
	[titular] [varchar](200) NULL,
	[cpf_titular] [varchar](20) NULL,
	[convenio] [varchar](20) NULL,
	[carteira] [varchar](10) NULL,
	[observacoes] [text] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Moradores]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Moradores](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_imovel] [int] NULL,
	[id_contrato] [int] NULL,
	[nome] [varchar](255) NULL,
	[data_inicio] [date] NULL,
	[data_fim] [date] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[MoradoresLocatario]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[MoradoresLocatario](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_locatario] [int] NULL,
	[nome] [nvarchar](200) NOT NULL,
	[cpf] [nvarchar](14) NULL,
	[rg] [nvarchar](20) NULL,
	[parentesco] [nvarchar](50) NULL,
	[idade] [int] NULL,
	[profissao] [nvarchar](100) NULL,
	[telefone] [nvarchar](20) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PagamentosDetalhes]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PagamentosDetalhes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_pagamento] [int] NOT NULL,
	[mes_referencia] [int] NULL,
	[ano_referencia] [int] NULL,
	[qtd_boletos] [int] NULL,
	[qtd_teds] [int] NULL,
	[ap_vago] [bit] NULL,
	[pagamento_atrasado] [bit] NULL,
	[total_bruto] [decimal](10, 2) NULL,
	[total_liquido] [decimal](10, 2) NULL,
	[observacao] [text] NULL,
	[encargos] [decimal](10, 2) NULL,
	[deducoes] [decimal](10, 2) NULL,
	[valor_pago_detalhado] [decimal](10, 2) NULL,
	[valor_vencido] [decimal](10, 2) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[PrestacaoContas]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[PrestacaoContas](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[locador_id] [int] NOT NULL,
	[mes] [varchar](2) NOT NULL,
	[ano] [varchar](4) NOT NULL,
	[referencia] [varchar](10) NOT NULL,
	[valor_pago] [decimal](10, 2) NULL,
	[valor_vencido] [decimal](10, 2) NULL,
	[encargos] [decimal](10, 2) NULL,
	[deducoes] [decimal](10, 2) NULL,
	[total_bruto] [decimal](10, 2) NULL,
	[total_liquido] [decimal](10, 2) NULL,
	[status] [varchar](20) NULL,
	[pagamento_atrasado] [bit] NULL,
	[observacoes_manuais] [text] NULL,
	[observacoes] [text] NULL,
	[data_criacao] [datetime] NULL,
	[data_atualizacao] [datetime] NULL,
	[ativo] [bit] NULL,
	[contrato_id] [int] NULL,
	[valor_acrescimos] [decimal](10, 2) NULL,
	[dias_atraso] [int] NULL,
	[valor_total_com_acrescimos] [decimal](10, 2) NULL,
	[data_calculo_acrescimos] [datetime] NULL,
	[data_pagamento] [datetime] NULL,
	[valor_boleto] [decimal](10, 2) NULL,
	[total_retido] [decimal](10, 2) NULL,
	[valor_repasse] [decimal](10, 2) NULL,
	[tipo_calculo] [varchar](20) NULL,
	[multa_rescisoria] [decimal](10, 2) NULL,
	[detalhamento_json] [text] NULL,
	[dados_financeiros_json] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Reajustes]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Reajustes](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[tipo_indexador] [nvarchar](10) NULL,
	[mes_ano] [nvarchar](7) NULL,
	[percentual] [decimal](5, 2) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Repasses]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Repasses](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_cliente] [int] NULL,
	[data_repassado] [date] NULL,
	[valor_repassado] [decimal](10, 2) NULL,
	[desconto_adm] [decimal](10, 2) NULL,
	[fci_devolvido] [decimal](10, 2) NULL,
	[comprovante_path] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RepresentanteLegalLocador]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RepresentanteLegalLocador](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_locador] [int] NULL,
	[nome] [nvarchar](200) NOT NULL,
	[cpf] [nvarchar](14) NOT NULL,
	[rg] [nvarchar](20) NULL,
	[endereco] [nvarchar](500) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](200) NULL,
	[cargo] [nvarchar](100) NULL,
	[created_at] [datetime] NULL,
	[data_nascimento] [date] NULL,
	[nacionalidade] [nvarchar](50) NULL,
	[estado_civil] [nvarchar](30) NULL,
	[profissao] [nvarchar](100) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[RepresentanteLegalLocatario]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[RepresentanteLegalLocatario](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_locatario] [int] NULL,
	[nome] [nvarchar](200) NOT NULL,
	[cpf] [nvarchar](14) NOT NULL,
	[rg] [nvarchar](20) NULL,
	[endereco] [nvarchar](500) NULL,
	[telefone] [nvarchar](20) NULL,
	[email] [nvarchar](200) NULL,
	[cargo] [nvarchar](100) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[StatusContrato]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[StatusContrato](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NOT NULL,
	[status_atual] [varchar](100) NULL,
	[data_status] [date] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TelefonesLocador]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TelefonesLocador](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[locador_id] [int] NOT NULL,
	[telefone] [nvarchar](20) NOT NULL,
	[tipo] [nvarchar](20) NULL,
	[principal] [bit] NOT NULL,
	[ativo] [bit] NOT NULL,
	[data_cadastro] [datetime] NOT NULL,
 CONSTRAINT [PK_TelefonesLocador] PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[TempMapInquilinosLocatarios]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[TempMapInquilinosLocatarios](
	[id_inquilino] [int] NULL,
	[id_locatario] [int] NULL,
	[cpf_cnpj] [nvarchar](50) NULL,
	[nome] [nvarchar](255) NULL
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Usuarios]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Usuarios](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[nome] [nvarchar](100) NULL,
	[email] [nvarchar](100) NULL,
	[senha_hash] [nvarchar](255) NULL,
	[perfil] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY],
UNIQUE NONCLUSTERED
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Valores]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Valores](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_contrato] [int] NOT NULL,
	[tipo] [varchar](100) NULL,
	[valor] [decimal](10, 2) NULL,
	[data_inicio] [date] NULL,
	[data_fim] [date] NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Vistorias]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Vistorias](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[id_imovel] [int] NULL,
	[tipo] [nvarchar](10) NULL,
	[data] [date] NULL,
	[laudo_path] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Clientes] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[Clientes] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[Clientes] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[Clientes] ADD  DEFAULT ((0)) FOR [usa_multiplos_metodos]
GO
ALTER TABLE [dbo].[Clientes] ADD  DEFAULT ((0)) FOR [usa_multiplas_contas]
GO
ALTER TABLE [dbo].[ContasBancariasLocador] ADD  DEFAULT ((0)) FOR [principal]
GO
ALTER TABLE [dbo].[ContasBancariasLocador] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[ContasBancariasLocador] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[ContasBancariasLocador] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[ContratoDocumentos] ADD  DEFAULT (getdate()) FOR [data_upload]
GO
ALTER TABLE [dbo].[ContratoDocumentos] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[ContratoLocadores] ADD  DEFAULT (getdate()) FOR [data_criacao]
GO
ALTER TABLE [dbo].[ContratoLocadores] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[ContratoLocadores] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[ContratoLocadores] ADD  DEFAULT ((0)) FOR [responsabilidade_principal]
GO
ALTER TABLE [dbo].[ContratoLocatarios] ADD  DEFAULT ((0)) FOR [responsabilidade_principal]
GO
ALTER TABLE [dbo].[ContratoLocatarios] ADD  DEFAULT ((100.00)) FOR [percentual_responsabilidade]
GO
ALTER TABLE [dbo].[ContratoLocatarios] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[ContratoLocatarios] ADD  DEFAULT (getdate()) FOR [data_criacao]
GO
ALTER TABLE [dbo].[ContratoLocatarios] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[ContratoPets] ADD  DEFAULT ('Cão') FOR [especie]
GO
ALTER TABLE [dbo].[ContratoPets] ADD  DEFAULT ((0)) FOR [castrado]
GO
ALTER TABLE [dbo].[ContratoPets] ADD  DEFAULT ((0)) FOR [vacinado]
GO
ALTER TABLE [dbo].[ContratoPets] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[ContratoPets] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[ContratoPets] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [antecipa_condominio]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [antecipa_seguro_fianca]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [antecipa_seguro_incendio]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [antecipa_iptu]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [antecipa_taxa_lixo]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [retido_fci]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [retido_condominio]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [retido_seguro_fianca]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [retido_seguro_incendio]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [retido_iptu]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [retido_taxa_lixo]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((10)) FOR [dia_vencimento_aluguel]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((5)) FOR [tolerancia_atraso_dias]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((2.00)) FOR [percentual_multa_atraso]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0.033)) FOR [percentual_juros_diario]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((1)) FOR [gerar_boleto_automatico]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((1)) FOR [enviar_lembrete_vencimento]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((3)) FOR [dias_antecedencia_lembrete]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [tem_corretor]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [obrigacao_manutencao]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [obrigacao_pintura]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [obrigacao_jardim]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [obrigacao_limpeza]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [obrigacao_pequenos_reparos]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0)) FOR [obrigacao_vistoria]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0.00)) FOR [multa_locador]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ((0.00)) FOR [multa_locatario]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ('IPCA') FOR [indice_reajuste]
GO
ALTER TABLE [dbo].[Contratos] ADD  DEFAULT ('ativo') FOR [status]
GO
ALTER TABLE [dbo].[CorretorContaBancaria] ADD  DEFAULT ((1)) FOR [principal]
GO
ALTER TABLE [dbo].[CorretorContaBancaria] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[CorretorContaBancaria] ADD  DEFAULT (getdate()) FOR [data_criacao]
GO
ALTER TABLE [dbo].[DadosBancariosInquilino] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[DadosBancariosLocador] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[DistribuicaoRepasseLocadores] ADD  DEFAULT ((100.00)) FOR [percentual_participacao]
GO
ALTER TABLE [dbo].[DistribuicaoRepasseLocadores] ADD  DEFAULT ((0.00)) FOR [valor_repasse]
GO
ALTER TABLE [dbo].[DistribuicaoRepasseLocadores] ADD  DEFAULT ((0)) FOR [responsabilidade_principal]
GO
ALTER TABLE [dbo].[DistribuicaoRepasseLocadores] ADD  DEFAULT (getdate()) FOR [data_criacao]
GO
ALTER TABLE [dbo].[DistribuicaoRepasseLocadores] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[DocumentosEmpresaLocador] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[DocumentosEmpresaLocatario] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[EmailsLocador] ADD  DEFAULT ('Comercial') FOR [tipo]
GO
ALTER TABLE [dbo].[EmailsLocador] ADD  DEFAULT ((0)) FOR [principal]
GO
ALTER TABLE [dbo].[EmailsLocador] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[EmailsLocador] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[EmailsLocatario] ADD  DEFAULT ('Pessoal') FOR [tipo]
GO
ALTER TABLE [dbo].[EmailsLocatario] ADD  DEFAULT ((0)) FOR [principal]
GO
ALTER TABLE [dbo].[EmailsLocatario] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[EmailsLocatario] ADD  DEFAULT ((1)) FOR [recebe_cobranca]
GO
ALTER TABLE [dbo].[EmailsLocatario] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[EmailsLocatario] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[EnderecoImovel] ADD  DEFAULT ('PR') FOR [uf]
GO
ALTER TABLE [dbo].[EnderecoImovel] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[EnderecoLocador] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[EnderecoLocatario] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[FiadorLocatario] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[FormasEnvioCobranca] ADD  DEFAULT ((0)) FOR [principal]
GO
ALTER TABLE [dbo].[FormasEnvioCobranca] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[FormasEnvioCobranca] ADD  DEFAULT ((0)) FOR [ordem]
GO
ALTER TABLE [dbo].[FormasEnvioCobranca] ADD  DEFAULT ((0)) FOR [verificado]
GO
ALTER TABLE [dbo].[FormasEnvioCobranca] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[FormasEnvioCobranca] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[FormasRecebimentoLocador] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[FormasRecebimentoLocador] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[GarantiasIndividuais] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[GarantiasIndividuais] ADD  DEFAULT (getdate()) FOR [data_criacao]
GO
ALTER TABLE [dbo].[GarantiasIndividuais] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[HistoricoContratos] ADD  DEFAULT (getdate()) FOR [data_alteracao]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT ((0)) FOR [mobiliado]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT ((0)) FOR [aceita_pets]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT ((0)) FOR [suites]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT ((0)) FOR [salas]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT ((0)) FOR [cozinha]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT ((0)) FOR [tem_sacada]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT ((0)) FOR [qtd_sacada]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT ((0)) FOR [tem_churrasqueira]
GO
ALTER TABLE [dbo].[Imoveis] ADD  DEFAULT ((0)) FOR [qtd_churrasqueira]
GO
ALTER TABLE [dbo].[ImovelLocadores] ADD  DEFAULT ((100.00)) FOR [porcentagem]
GO
ALTER TABLE [dbo].[ImovelLocadores] ADD  DEFAULT ((0)) FOR [responsabilidade_principal]
GO
ALTER TABLE [dbo].[ImovelLocadores] ADD  DEFAULT (getdate()) FOR [data_criacao]
GO
ALTER TABLE [dbo].[ImovelLocadores] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[ImovelLocadores] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[Inquilinos] ADD  DEFAULT ((0)) FOR [tem_moradores]
GO
ALTER TABLE [dbo].[Inquilinos] ADD  DEFAULT ((0)) FOR [tem_fiador]
GO
ALTER TABLE [dbo].[Inquilinos] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[Inquilinos] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[Inquilinos] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[LancamentosLiquidos] ADD  DEFAULT (getdate()) FOR [data_lancamento]
GO
ALTER TABLE [dbo].[LancamentosPrestacaoContas] ADD  DEFAULT (getdate()) FOR [data_lancamento]
GO
ALTER TABLE [dbo].[LancamentosPrestacaoContas] ADD  DEFAULT (getdate()) FOR [data_criacao]
GO
ALTER TABLE [dbo].[LancamentosPrestacaoContas] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[Locadores] ADD  DEFAULT ((0)) FOR [usa_multiplos_metodos]
GO
ALTER TABLE [dbo].[Locadores] ADD  DEFAULT ((0)) FOR [usa_multiplas_contas]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT ('PF') FOR [tipo_pessoa]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT ('Brasileira') FOR [nacionalidade]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT ('Solteiro') FOR [estado_civil]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT ('PR') FOR [endereco_estado]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT ((0)) FOR [possui_conjuge]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT ((0)) FOR [possui_inquilino_solidario]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT ((0)) FOR [possui_fiador]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT ((0)) FOR [qtd_pets]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Locatarios] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[LogAtualizacaoAcrescimos] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[LogAtualizacaoAcrescimos] ADD  DEFAULT ('JOB_AUTOMATICO') FOR [origem]
GO
ALTER TABLE [dbo].[Logs] ADD  DEFAULT (getdate()) FOR [data]
GO
ALTER TABLE [dbo].[MetodosPagamentoLocador] ADD  DEFAULT ((0)) FOR [principal]
GO
ALTER TABLE [dbo].[MetodosPagamentoLocador] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[MetodosPagamentoLocador] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[MetodosPagamentoLocador] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[MoradoresLocatario] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Pagamentos] ADD  DEFAULT ((0.00)) FOR [encargos]
GO
ALTER TABLE [dbo].[Pagamentos] ADD  DEFAULT ((0.00)) FOR [deducoes]
GO
ALTER TABLE [dbo].[PagamentosDetalhes] ADD  DEFAULT ((0.00)) FOR [encargos]
GO
ALTER TABLE [dbo].[PagamentosDetalhes] ADD  DEFAULT ((0.00)) FOR [deducoes]
GO
ALTER TABLE [dbo].[PagamentosDetalhes] ADD  DEFAULT ((0.00)) FOR [valor_pago_detalhado]
GO
ALTER TABLE [dbo].[PagamentosDetalhes] ADD  DEFAULT ((0.00)) FOR [valor_vencido]
GO
ALTER TABLE [dbo].[PlanosLocacao] ADD  DEFAULT ((0.00)) FOR [taxa_administracao]
GO
ALTER TABLE [dbo].[PlanosLocacao] ADD  DEFAULT ((0)) FOR [aplica_taxa_unica]
GO
ALTER TABLE [dbo].[PlanosLocacao] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[PlanosLocacao] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((0.00)) FOR [valor_pago]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((0.00)) FOR [valor_vencido]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((0.00)) FOR [encargos]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((0.00)) FOR [deducoes]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((0.00)) FOR [total_bruto]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((0.00)) FOR [total_liquido]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ('pendente') FOR [status]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((0)) FOR [pagamento_atrasado]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT (getdate()) FOR [data_criacao]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((0)) FOR [valor_acrescimos]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((0)) FOR [dias_atraso]
GO
ALTER TABLE [dbo].[PrestacaoContas] ADD  DEFAULT ((0)) FOR [valor_total_com_acrescimos]
GO
ALTER TABLE [dbo].[Proprietarios] ADD  DEFAULT ('PF') FOR [tipo_pessoa]
GO
ALTER TABLE [dbo].[Proprietarios] ADD  DEFAULT ('Brasileira') FOR [nacionalidade]
GO
ALTER TABLE [dbo].[Proprietarios] ADD  DEFAULT ('Solteiro') FOR [estado_civil]
GO
ALTER TABLE [dbo].[Proprietarios] ADD  DEFAULT ((0)) FOR [existe_conjuge]
GO
ALTER TABLE [dbo].[Proprietarios] ADD  DEFAULT ('PR') FOR [endereco_estado]
GO
ALTER TABLE [dbo].[Proprietarios] ADD  DEFAULT ('PIX') FOR [dados_bancarios_tipo]
GO
ALTER TABLE [dbo].[Proprietarios] ADD  DEFAULT ('Corrente') FOR [dados_bancarios_tipo_conta]
GO
ALTER TABLE [dbo].[Proprietarios] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[Proprietarios] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[Proprietarios] ADD  DEFAULT (getdate()) FOR [updated_at]
GO
ALTER TABLE [dbo].[RepresentanteLegalLocador] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[RepresentanteLegalLocatario] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[TelefonesLocador] ADD  DEFAULT ('Celular') FOR [tipo]
GO
ALTER TABLE [dbo].[TelefonesLocador] ADD  DEFAULT ((0)) FOR [principal]
GO
ALTER TABLE [dbo].[TelefonesLocador] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[TelefonesLocador] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[TelefonesLocatario] ADD  DEFAULT ('Celular') FOR [tipo]
GO
ALTER TABLE [dbo].[TelefonesLocatario] ADD  DEFAULT ((0)) FOR [principal]
GO
ALTER TABLE [dbo].[TelefonesLocatario] ADD  DEFAULT ((1)) FOR [ativo]
GO
ALTER TABLE [dbo].[TelefonesLocatario] ADD  DEFAULT ((0)) FOR [whatsapp]
GO
ALTER TABLE [dbo].[TelefonesLocatario] ADD  DEFAULT (getdate()) FOR [data_cadastro]
GO
ALTER TABLE [dbo].[TelefonesLocatario] ADD  DEFAULT (getdate()) FOR [data_atualizacao]
GO
ALTER TABLE [dbo].[Clientes]  WITH CHECK ADD  CONSTRAINT [FK_Clientes_DadosBancarios] FOREIGN KEY([dados_bancarios_id])
REFERENCES [dbo].[DadosBancarios] ([id])
GO
ALTER TABLE [dbo].[Clientes] CHECK CONSTRAINT [FK_Clientes_DadosBancarios]
GO
ALTER TABLE [dbo].[Clientes]  WITH CHECK ADD  CONSTRAINT [FK_Clientes_Endereco] FOREIGN KEY([endereco_id])
REFERENCES [dbo].[Enderecos] ([id])
GO
ALTER TABLE [dbo].[Clientes] CHECK CONSTRAINT [FK_Clientes_Endereco]
GO
ALTER TABLE [dbo].[ContratoDocumentos]  WITH CHECK ADD  CONSTRAINT [FK_ContratoDocumentos_Contrato] FOREIGN KEY([contrato_id])
REFERENCES [dbo].[Contratos] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ContratoDocumentos] CHECK CONSTRAINT [FK_ContratoDocumentos_Contrato]
GO
ALTER TABLE [dbo].[ContratoLocatarios]  WITH CHECK ADD  CONSTRAINT [FK_ContratoLocatarios_Contrato] FOREIGN KEY([contrato_id])
REFERENCES [dbo].[Contratos] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ContratoLocatarios] CHECK CONSTRAINT [FK_ContratoLocatarios_Contrato]
GO
ALTER TABLE [dbo].[ContratoLocatarios]  WITH CHECK ADD  CONSTRAINT [FK_ContratoLocatarios_Locatario] FOREIGN KEY([locatario_id])
REFERENCES [dbo].[Locatarios] ([id])
GO
ALTER TABLE [dbo].[ContratoLocatarios] CHECK CONSTRAINT [FK_ContratoLocatarios_Locatario]
GO
ALTER TABLE [dbo].[ContratoPets]  WITH CHECK ADD  CONSTRAINT [FK_ContratoPets_Contrato] FOREIGN KEY([contrato_id])
REFERENCES [dbo].[Contratos] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ContratoPets] CHECK CONSTRAINT [FK_ContratoPets_Contrato]
GO
ALTER TABLE [dbo].[Contratos]  WITH CHECK ADD  CONSTRAINT [FK_Contratos_Locatarios] FOREIGN KEY([id_locatario])
REFERENCES [dbo].[Locatarios] ([id])
GO
ALTER TABLE [dbo].[Contratos] CHECK CONSTRAINT [FK_Contratos_Locatarios]
GO
ALTER TABLE [dbo].[ContratosResumo]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[CorretorContaBancaria]  WITH CHECK ADD  CONSTRAINT [FK_CorretorContaBancaria_Contrato] FOREIGN KEY([contrato_id])
REFERENCES [dbo].[Contratos] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[CorretorContaBancaria] CHECK CONSTRAINT [FK_CorretorContaBancaria_Contrato]
GO
ALTER TABLE [dbo].[DatasContrato]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[DescontosDeducoes]  WITH CHECK ADD FOREIGN KEY([id_pagamento])
REFERENCES [dbo].[Pagamentos] ([id])
GO
ALTER TABLE [dbo].[DistribuicaoRepasseLocadores]  WITH CHECK ADD  CONSTRAINT [FK_DistribuicaoRepasseLocadores_PrestacaoId] FOREIGN KEY([prestacao_id])
REFERENCES [dbo].[PrestacaoContas] ([id])
GO
ALTER TABLE [dbo].[DistribuicaoRepasseLocadores] CHECK CONSTRAINT [FK_DistribuicaoRepasseLocadores_PrestacaoId]
GO
ALTER TABLE [dbo].[DocumentosEmpresaLocador]  WITH CHECK ADD  CONSTRAINT [FK_DocEmp_Locador] FOREIGN KEY([id_locador])
REFERENCES [dbo].[Locadores] ([id])
GO
ALTER TABLE [dbo].[DocumentosEmpresaLocador] CHECK CONSTRAINT [FK_DocEmp_Locador]
GO
ALTER TABLE [dbo].[DocumentosEmpresaLocatario]  WITH CHECK ADD  CONSTRAINT [FK_DocEmp_Locatario] FOREIGN KEY([id_locatario])
REFERENCES [dbo].[Locatarios] ([id])
GO
ALTER TABLE [dbo].[DocumentosEmpresaLocatario] CHECK CONSTRAINT [FK_DocEmp_Locatario]
GO
ALTER TABLE [dbo].[EmailsLocador]  WITH CHECK ADD  CONSTRAINT [FK_EmailsLocador_Locador] FOREIGN KEY([locador_id])
REFERENCES [dbo].[Locadores] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[EmailsLocador] CHECK CONSTRAINT [FK_EmailsLocador_Locador]
GO
ALTER TABLE [dbo].[EmailsLocatario]  WITH CHECK ADD  CONSTRAINT [FK_EmailsLocatario_Locatario] FOREIGN KEY([locatario_id])
REFERENCES [dbo].[Locatarios] ([id])
GO
ALTER TABLE [dbo].[EmailsLocatario] CHECK CONSTRAINT [FK_EmailsLocatario_Locatario]
GO
ALTER TABLE [dbo].[Encargos]  WITH CHECK ADD FOREIGN KEY([id_imovel])
REFERENCES [dbo].[Imoveis] ([id])
GO
ALTER TABLE [dbo].[Fiadores]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[FormasEnvioCobranca]  WITH CHECK ADD  CONSTRAINT [FK_FormasEnvio_Locatario] FOREIGN KEY([locatario_id])
REFERENCES [dbo].[Locatarios] ([id])
GO
ALTER TABLE [dbo].[FormasEnvioCobranca] CHECK CONSTRAINT [FK_FormasEnvio_Locatario]
GO
ALTER TABLE [dbo].[FormasRecebimentoLocador]  WITH CHECK ADD  CONSTRAINT [FK_FormasRecebimentoLocador_Locador] FOREIGN KEY([locador_id])
REFERENCES [dbo].[Locadores] ([id])
GO
ALTER TABLE [dbo].[FormasRecebimentoLocador] CHECK CONSTRAINT [FK_FormasRecebimentoLocador_Locador]
GO
ALTER TABLE [dbo].[Garantias]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[GarantiasIndividuais]  WITH CHECK ADD  CONSTRAINT [FK_GarantiasIndividuais_Contrato] FOREIGN KEY([contrato_id])
REFERENCES [dbo].[Contratos] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[GarantiasIndividuais] CHECK CONSTRAINT [FK_GarantiasIndividuais_Contrato]
GO
ALTER TABLE [dbo].[HistoricoContratos]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Imoveis]  WITH CHECK ADD  CONSTRAINT [FK_Imoveis_Locadores] FOREIGN KEY([id_locador])
REFERENCES [dbo].[Locadores] ([id])
GO
ALTER TABLE [dbo].[Imoveis] CHECK CONSTRAINT [FK_Imoveis_Locadores]
GO
ALTER TABLE [dbo].[Imoveis]  WITH CHECK ADD  CONSTRAINT [FK_Imoveis_Locatarios] FOREIGN KEY([id_locatario])
REFERENCES [dbo].[Locatarios] ([id])
GO
ALTER TABLE [dbo].[Imoveis] CHECK CONSTRAINT [FK_Imoveis_Locatarios]
GO
ALTER TABLE [dbo].[ImovelLocadores]  WITH CHECK ADD  CONSTRAINT [FK_ImovelLocadores_Imovel] FOREIGN KEY([imovel_id])
REFERENCES [dbo].[Imoveis] ([id])
GO
ALTER TABLE [dbo].[ImovelLocadores] CHECK CONSTRAINT [FK_ImovelLocadores_Imovel]
GO
ALTER TABLE [dbo].[ImovelLocadores]  WITH CHECK ADD  CONSTRAINT [FK_ImovelLocadores_Locador] FOREIGN KEY([locador_id])
REFERENCES [dbo].[Locadores] ([id])
GO
ALTER TABLE [dbo].[ImovelLocadores] CHECK CONSTRAINT [FK_ImovelLocadores_Locador]
GO
ALTER TABLE [dbo].[Inquilinos]  WITH CHECK ADD  CONSTRAINT [FK_Inquilinos_DadosBancarios] FOREIGN KEY([dados_bancarios_id])
REFERENCES [dbo].[DadosBancariosInquilino] ([id])
GO
ALTER TABLE [dbo].[Inquilinos] CHECK CONSTRAINT [FK_Inquilinos_DadosBancarios]
GO
ALTER TABLE [dbo].[Inquilinos]  WITH CHECK ADD  CONSTRAINT [FK_Inquilinos_Endereco] FOREIGN KEY([endereco_id])
REFERENCES [dbo].[EnderecoLocatario] ([id])
GO
ALTER TABLE [dbo].[Inquilinos] CHECK CONSTRAINT [FK_Inquilinos_Endereco]
GO
ALTER TABLE [dbo].[LancamentosLiquidos]  WITH CHECK ADD FOREIGN KEY([id_pagamento])
REFERENCES [dbo].[Pagamentos] ([id])
GO
ALTER TABLE [dbo].[LancamentosPrestacaoContas]  WITH CHECK ADD FOREIGN KEY([prestacao_id])
REFERENCES [dbo].[PrestacaoContas] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Locatarios]  WITH CHECK ADD  CONSTRAINT [FK_Locatarios_EnderecoLocatario] FOREIGN KEY([endereco_id])
REFERENCES [dbo].[EnderecoLocatario] ([id])
GO
ALTER TABLE [dbo].[Locatarios] CHECK CONSTRAINT [FK_Locatarios_EnderecoLocatario]
GO
ALTER TABLE [dbo].[LocatariosExtras]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[Logs]  WITH CHECK ADD FOREIGN KEY([id_usuario])
REFERENCES [dbo].[Usuarios] ([id])
GO
ALTER TABLE [dbo].[Moradores]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[Moradores]  WITH CHECK ADD FOREIGN KEY([id_imovel])
REFERENCES [dbo].[Imoveis] ([id])
GO
ALTER TABLE [dbo].[Pagamentos]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[PagamentosDetalhes]  WITH CHECK ADD FOREIGN KEY([id_pagamento])
REFERENCES [dbo].[Pagamentos] ([id])
GO
ALTER TABLE [dbo].[RepresentanteLegalLocador]  WITH CHECK ADD  CONSTRAINT [FK_RepLegal_Locador] FOREIGN KEY([id_locador])
REFERENCES [dbo].[Locadores] ([id])
GO
ALTER TABLE [dbo].[RepresentanteLegalLocador] CHECK CONSTRAINT [FK_RepLegal_Locador]
GO
ALTER TABLE [dbo].[RepresentanteLegalLocatario]  WITH CHECK ADD  CONSTRAINT [FK_RepLegal_Locatario] FOREIGN KEY([id_locatario])
REFERENCES [dbo].[Locatarios] ([id])
GO
ALTER TABLE [dbo].[RepresentanteLegalLocatario] CHECK CONSTRAINT [FK_RepLegal_Locatario]
GO
ALTER TABLE [dbo].[Seguros]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[StatusContrato]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[Taxas]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[TelefonesLocador]  WITH CHECK ADD  CONSTRAINT [FK_TelefonesLocador_Locador] FOREIGN KEY([locador_id])
REFERENCES [dbo].[Locadores] ([id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[TelefonesLocador] CHECK CONSTRAINT [FK_TelefonesLocador_Locador]
GO
ALTER TABLE [dbo].[TelefonesLocatario]  WITH CHECK ADD  CONSTRAINT [FK_TelefonesLocatario_Locatario] FOREIGN KEY([locatario_id])
REFERENCES [dbo].[Locatarios] ([id])
GO
ALTER TABLE [dbo].[TelefonesLocatario] CHECK CONSTRAINT [FK_TelefonesLocatario_Locatario]
GO
ALTER TABLE [dbo].[Valores]  WITH CHECK ADD FOREIGN KEY([id_contrato])
REFERENCES [dbo].[Contratos] ([id])
GO
ALTER TABLE [dbo].[Vistorias]  WITH CHECK ADD FOREIGN KEY([id_imovel])
REFERENCES [dbo].[Imoveis] ([id])
GO
ALTER TABLE [dbo].[ContasBancariasLocador]  WITH CHECK ADD CHECK  (([tipo_recebimento]='TED' OR [tipo_recebimento]='PIX'))
GO
ALTER TABLE [dbo].[ContratoLocadores]  WITH CHECK ADD CHECK  (([porcentagem]>(0) AND [porcentagem]<=(100)))
GO
ALTER TABLE [dbo].[ContratoLocatarios]  WITH CHECK ADD  CONSTRAINT [CK_ContratoLocatarios_Percentual] CHECK  (([percentual_responsabilidade]>(0) AND [percentual_responsabilidade]<=(100)))
GO
ALTER TABLE [dbo].[ContratoLocatarios] CHECK CONSTRAINT [CK_ContratoLocatarios_Percentual]
GO
ALTER TABLE [dbo].[ContratoPets]  WITH CHECK ADD CHECK  (([tamanho]='Gigante' OR [tamanho]='Grande' OR [tamanho]='Médio' OR [tamanho]='Pequeno'))
GO
ALTER TABLE [dbo].[ContratoPets]  WITH CHECK ADD CHECK  (([sexo]='Fêmea' OR [sexo]='Macho'))
GO
ALTER TABLE [dbo].[Contratos]  WITH CHECK ADD  CONSTRAINT [CK_Contratos_DatasSeguroFianca] CHECK  (([seguro_fianca_fim] IS NULL OR [seguro_fianca_fim]>=[seguro_fianca_inicio]))
GO
ALTER TABLE [dbo].[Contratos] CHECK CONSTRAINT [CK_Contratos_DatasSeguroFianca]
GO
ALTER TABLE [dbo].[Contratos]  WITH CHECK ADD  CONSTRAINT [CK_Contratos_DatasSeguroIncendio] CHECK  (([seguro_incendio_fim] IS NULL OR [seguro_incendio_fim]>=[seguro_incendio_inicio]))
GO
ALTER TABLE [dbo].[Contratos] CHECK CONSTRAINT [CK_Contratos_DatasSeguroIncendio]
GO
ALTER TABLE [dbo].[Contratos]  WITH CHECK ADD  CONSTRAINT [CK_Contratos_DiaVencimento] CHECK  (([dia_vencimento_aluguel]>=(1) AND [dia_vencimento_aluguel]<=(31)))
GO
ALTER TABLE [dbo].[Contratos] CHECK CONSTRAINT [CK_Contratos_DiaVencimento]
GO
ALTER TABLE [dbo].[Contratos]  WITH CHECK ADD  CONSTRAINT [CK_Contratos_JurosDiario] CHECK  (([percentual_juros_diario]>=(0) AND [percentual_juros_diario]<=(10)))
GO
ALTER TABLE [dbo].[Contratos] CHECK CONSTRAINT [CK_Contratos_JurosDiario]
GO
ALTER TABLE [dbo].[Contratos]  WITH CHECK ADD  CONSTRAINT [CK_Contratos_MultaAtraso] CHECK  (([percentual_multa_atraso]>=(0) AND [percentual_multa_atraso]<=(100)))
GO
ALTER TABLE [dbo].[Contratos] CHECK CONSTRAINT [CK_Contratos_MultaAtraso]
GO
ALTER TABLE [dbo].[Contratos]  WITH CHECK ADD  CONSTRAINT [CK_Contratos_ToleranciaAtraso] CHECK  (([tolerancia_atraso_dias]>=(0) AND [tolerancia_atraso_dias]<=(30)))
GO
ALTER TABLE [dbo].[Contratos] CHECK CONSTRAINT [CK_Contratos_ToleranciaAtraso]
GO
ALTER TABLE [dbo].[CorretorContaBancaria]  WITH CHECK ADD CHECK  (([tipo_conta]='poupanca' OR [tipo_conta]='corrente'))
GO
ALTER TABLE [dbo].[DadosBancariosInquilino]  WITH CHECK ADD CHECK  (([forma_recebimento]='BOLETO' OR [forma_recebimento]='DOC' OR [forma_recebimento]='TED' OR [forma_recebimento]='PIX'))
GO
ALTER TABLE [dbo].[DadosBancariosInquilino]  WITH CHECK ADD CHECK  (([tipo_chave_pix]='ALEATORIA' OR [tipo_chave_pix]='TELEFONE' OR [tipo_chave_pix]='EMAIL' OR [tipo_chave_pix]='CNPJ' OR [tipo_chave_pix]='CPF'))
GO
ALTER TABLE [dbo].[DadosBancariosInquilino]  WITH CHECK ADD CHECK  (([tipo_conta]='POUPANCA' OR [tipo_conta]='CORRENTE'))
GO
ALTER TABLE [dbo].[DadosBancariosLocador]  WITH CHECK ADD CHECK  (([forma_recebimento]='BOLETO' OR [forma_recebimento]='DOC' OR [forma_recebimento]='TED' OR [forma_recebimento]='PIX'))
GO
ALTER TABLE [dbo].[DadosBancariosLocador]  WITH CHECK ADD CHECK  (([tipo_chave_pix]='ALEATORIA' OR [tipo_chave_pix]='TELEFONE' OR [tipo_chave_pix]='EMAIL' OR [tipo_chave_pix]='CNPJ' OR [tipo_chave_pix]='CPF'))
GO
ALTER TABLE [dbo].[DadosBancariosLocador]  WITH CHECK ADD CHECK  (([tipo_conta]='POUPANCA' OR [tipo_conta]='CORRENTE'))
GO
ALTER TABLE [dbo].[EnderecoImovel]  WITH CHECK ADD  CONSTRAINT [CK_EnderecoImovel_CEP] CHECK  (([cep] IS NULL OR len([cep])=(9) AND [cep] like '[0-9][0-9][0-9][0-9][0-9]-[0-9][0-9][0-9]'))
GO
ALTER TABLE [dbo].[EnderecoImovel] CHECK CONSTRAINT [CK_EnderecoImovel_CEP]
GO
ALTER TABLE [dbo].[FormasEnvioCobranca]  WITH CHECK ADD  CONSTRAINT [CK_FormasEnvio_Tipo] CHECK  (([tipo]='whatsapp' OR [tipo]='email' OR [tipo]='imovel'))
GO
ALTER TABLE [dbo].[FormasEnvioCobranca] CHECK CONSTRAINT [CK_FormasEnvio_Tipo]
GO
ALTER TABLE [dbo].[GarantiasIndividuais]  WITH CHECK ADD CHECK  (([pessoa_tipo]='LOCATARIO' OR [pessoa_tipo]='LOCADOR'))
GO
ALTER TABLE [dbo].[ImovelLocadores]  WITH CHECK ADD  CONSTRAINT [CK_ImovelLocadores_Porcentagem] CHECK  (([porcentagem]>(0) AND [porcentagem]<=(100)))
GO
ALTER TABLE [dbo].[ImovelLocadores] CHECK CONSTRAINT [CK_ImovelLocadores_Porcentagem]
GO
ALTER TABLE [dbo].[Inquilinos]  WITH CHECK ADD CHECK  (([tipo_pessoa]='PJ' OR [tipo_pessoa]='PF'))
GO
ALTER TABLE [dbo].[Locatarios]  WITH CHECK ADD CHECK  (([tipo_pessoa]='PJ' OR [tipo_pessoa]='PF'))
GO
ALTER TABLE [dbo].[MetodosPagamentoLocador]  WITH CHECK ADD CHECK  (([tipo]='Transferencia' OR [tipo]='Boleto' OR [tipo]='TED' OR [tipo]='PIX'))
GO
ALTER TABLE [dbo].[PlanosLocacao]  WITH CHECK ADD  CONSTRAINT [CK_PlanosLocacao_Taxa] CHECK  (([taxa_primeiro_aluguel]>=(0) AND [taxa_primeiro_aluguel]<=(100) AND [taxa_demais_alugueis]>=(0) AND [taxa_demais_alugueis]<=(100)))
GO
ALTER TABLE [dbo].[PlanosLocacao] CHECK CONSTRAINT [CK_PlanosLocacao_Taxa]
GO
ALTER TABLE [dbo].[Proprietarios]  WITH CHECK ADD CHECK  (([tipo_pessoa]='PJ' OR [tipo_pessoa]='PF'))
GO
/****** Object:  StoredProcedure [dbo].[sp_AdicionarLocatarioContrato]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_AdicionarLocatarioContrato]
    @contrato_id INT,
    @locatario_id INT,
    @principal BIT = 0,
    @percentual DECIMAL(5,2) = 100.00
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO ContratoLocatarios (contrato_id, locatario_id, responsabilidade_principal, percentual_responsabilidade)
    VALUES (@contrato_id, @locatario_id, @principal, @percentual);

    SELECT SCOPE_IDENTITY() as relacionamento_id;
END
GO
/****** Object:  StoredProcedure [dbo].[sp_AdicionarPetContrato]    Script Date: 29/09/2025 13:05:16 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[sp_AdicionarPetContrato]
    @contrato_id INT,
    @nome NVARCHAR(100),
    @especie NVARCHAR(50) = 'Cão',
    @raca NVARCHAR(100) = NULL,
    @tamanho NVARCHAR(20) = NULL,
    @idade INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO ContratoPets (contrato_id, nome, especie, raca, tamanho, idade)
    VALUES (@contrato_id, @nome, @especie, @raca, @tamanho, @idade);

    SELECT SCOPE_IDENTITY() as pet_id;
END
GO
