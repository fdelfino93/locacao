import type { Endereco } from './Endereco';

export interface InformacoesIPTU {
  titular: string;
  inscricao_imobiliaria: string;
  indicacao_fiscal: string;
}

export interface DadosGeraisImovel {
  quartos: number;
  suites: number;
  banheiros: number;
  salas: number;
  cozinha: number;
  tem_garagem: boolean;
  qtd_garagem?: number;
  tem_sacada: boolean;
  qtd_sacada?: number;
  tem_churrasqueira: boolean;
  qtd_churrasqueira?: number;
  mobiliado: 'sim' | 'nao' | 'parcialmente';
  permite_pets: boolean;
}

export interface Imovel {
  id?: number;
  id_cliente: number;
  id_inquilino: number;
  tipo: string;
  endereco: Endereco;
  informacoes_iptu: InformacoesIPTU;
  dados_gerais: DadosGeraisImovel;
  valor_aluguel: number;
  iptu: number;
  condominio: number;
  taxa_incendio: number;
  status: string;
  matricula_imovel: string;
  area_imovel: string;
  area_total?: number;
  dados_imovel: string;
  info_iptu: string;
  observacoes_condominio: string;
  copel_unidade_consumidora: string;
  sanepar_matricula: string;
  tem_gas: boolean;
  info_gas: string;
  boleto_condominio: boolean;
}
