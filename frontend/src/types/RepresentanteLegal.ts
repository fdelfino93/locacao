import type { Endereco } from './';

export interface RepresentanteLegal {
  nome: string;
  cpf: string;
  rg: string;
  telefone?: string;
  email?: string;
  endereco?: Endereco;
  data_nascimento?: string;
  nacionalidade?: string;
  estado_civil?: string;
  profissao?: string;
}
