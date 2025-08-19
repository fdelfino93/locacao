import type { Endereco } from './';

export interface RepresentanteLegal {
  nome: string;
  cpf: string;
  rg: string;
  telefones: string[];
  emails: string[];
  endereco?: Endereco;
  data_nascimento?: string;
  nacionalidade?: string;
  estado_civil?: 'Solteiro' | 'Casado' | 'Divorciado' | 'Viúvo' | 'União Estável';
  profissao?: string;
  
  // Campos legados para compatibilidade
  telefone?: string;
  email?: string;
}
