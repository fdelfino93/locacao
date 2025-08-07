export interface PlanoLocacao {
  id: number;
  codigo: string;
  nome: string;
  categoria: 'COMPLETO' | 'BASICO';
  opcao: 1 | 2;
  taxa_primeiro_aluguel: number;
  taxa_demais_alugueis: number;
  taxa_administracao: number;
  descricao?: string;
}
