export interface DadosBancarios {
  tipo_recebimento: 'PIX' | 'TED';
  chave_pix?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: 'Conta Corrente' | 'Conta Poupança';
  titular?: string;
  cpf_titular?: string;
}
