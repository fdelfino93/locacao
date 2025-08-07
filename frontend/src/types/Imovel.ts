import type { Endereco } from './';

export interface Imovel {
  id_cliente: number;
  id_inquilino: number;
  tipo: string;
  endereco?: Endereco;
  valor_aluguel: number;
  iptu: number;
  condominio: number;
  taxa_incendio: number;
  status: string;
  matricula_imovel: string;
  area_imovel: string;
  dados_imovel: string;
  permite_pets: boolean;
  info_iptu: string;
  observacoes_condominio: string;
  copel_unidade_consumidora: string;
  sanepar_matricula: string;
  tem_gas: boolean;
  info_gas: string;
  boleto_condominio: boolean;
}
