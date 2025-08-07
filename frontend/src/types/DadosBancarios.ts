export interface DadosBancarios {
  tipo_recebimento: 'PIX' | 'TED' | 'Conta Corrente' | 'Conta Poupança';
  chave_pix?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: 'Corrente' | 'Poupança' | 'Conta Digital';
  titular?: string;
  cpf_titular?: string;
}
