// =====================================================
// FONTE ÚNICA DE DADOS PARA TODO O SISTEMA
// =====================================================
// IMPORTANTE: Este arquivo é a ÚNICA fonte de verdade
// para todos os dados mockados do sistema.
// Não criar dados duplicados em outros componentes!

import type { Fatura } from '@/types';

// =====================================================
// DADOS PRINCIPAIS - FONTE ÚNICA DE VERDADE
// =====================================================

// Interfaces para compatibilidade com módulos de busca
export interface Locador {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  endereco: string;
  ativo: boolean;
  qtd_imoveis: number;
  contratos_ativos: number;
}

export interface Locatario {
  id: number;
  nome: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  profissao: string;
  status_contrato: 'ativo' | 'inativo' | 'vencido';
  imovel_atual?: string | null;
  tipo_garantia?: string;
}

export interface Imovel {
  id: number;
  endereco: string;
  tipo: string;
  valor_aluguel: number;
  quartos: number;
  banheiros: number;
  area: number;
  status: 'ocupado' | 'disponivel';
  locador: { nome: string };
  locatario_atual?: string | null;
  status_ocupacao: 'ocupado' | 'livre';
}

export interface Contrato {
  id: number;
  data_inicio: string;
  data_fim: string;
  valor_aluguel: number;
  status: 'ativo' | 'vencido';
  locatario: { nome: string };
  imovel: { endereco: string };
  tipo_garantia: string;
  vencimento_dia: number;
  locador: { nome: string };
}

// DADOS VAZIOS - AGUARDANDO INTEGRAÇÃO COM BANCO DE DADOS REAL
export const LOCADORES: Locador[] = [];

export const LOCATARIOS: Locatario[] = [];

export const IMOVEIS: Imovel[] = [];

export const CONTRATOS: Contrato[] = [];

// FATURAS - LISTA VAZIA (AGUARDANDO DADOS REAIS)
export const FATURAS: Fatura[] = [];

// =====================================================
// FUNÇÕES HELPER PARA ACESSAR OS DADOS
// =====================================================

export const getLocadorById = (id: number): Locador | undefined => 
  LOCADORES.find(locador => locador.id === id);

export const getLocatarioById = (id: number): Locatario | undefined => 
  LOCATARIOS.find(locatario => locatario.id === id);

export const getImovelById = (id: number): Imovel | undefined => 
  IMOVEIS.find(imovel => imovel.id === id);

export const getContratoById = (id: number): Contrato | undefined => 
  CONTRATOS.find(contrato => contrato.id === id);

export const getFaturaById = (id: number): Fatura | undefined => 
  FATURAS.find(fatura => fatura.id === id);

export const getFaturaByNumero = (numero: string): Fatura | undefined => 
  FATURAS.find(fatura => fatura.numero_fatura === numero);

// Funções para compatibilidade com formato antigo
export const getMockData = () => ({
  locadores: LOCADORES,
  locatarios: LOCATARIOS,
  imoveis: IMOVEIS,
  contratos: CONTRATOS,
  faturas: FATURAS
});