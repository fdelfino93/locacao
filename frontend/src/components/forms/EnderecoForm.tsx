import React from 'react';
import { InputWithIcon } from '../ui/input-with-icon';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { MapPin, Building, Navigation, Hash } from 'lucide-react';
import type { Endereco } from '../../types';

interface EnderecoFormProps {
  endereco: Endereco;
  onChange: (endereco: Endereco) => void;
  prefixo?: string;
}

const estadosBrasil = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

export const EnderecoForm: React.FC<EnderecoFormProps> = ({ 
  endereco, 
  onChange, 
  prefixo = '' 
}) => {
  
  const handleChange = (field: keyof Endereco, value: string) => {
    onChange({
      ...endereco,
      [field]: value
    });
  };

  const formatarCEP = (valor: string) => {
    // Remove caracteres não numéricos
    const numeros = valor.replace(/\D/g, '');
    
    // Aplica a máscara XXXXX-XXX
    if (numeros.length <= 5) {
      return numeros;
    } else {
      return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
    }
  };

  const buscarCEP = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          onChange({
            ...endereco,
            cep: formatarCEP(cepLimpo),
            rua: data.logradouro || endereco.rua,
            bairro: data.bairro || endereco.bairro,
            cidade: data.localidade || endereco.cidade,
            estado: data.uf || endereco.estado
          });
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-600" />
        {prefixo ? `${prefixo} - ` : ''}Endereço
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* CEP */}
        <div>
          <Label htmlFor={`${prefixo}cep`}>CEP *</Label>
          <InputWithIcon
            id={`${prefixo}cep`}
            type="text"
            value={endereco.cep}
            onChange={(e) => {
              const cepFormatado = formatarCEP(e.target.value);
              handleChange('cep', cepFormatado);
            }}
            onBlur={() => buscarCEP(endereco.cep)}
            placeholder="00000-000"
            icon={Hash}
            maxLength={9}
            required
          />
        </div>

        {/* Estado */}
        <div>
          <Label htmlFor={`${prefixo}estado`}>Estado *</Label>
          <Select value={endereco.estado} onValueChange={(value) => handleChange('estado', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {estadosBrasil.map((estado) => (
                <SelectItem key={estado.value} value={estado.value}>
                  {estado.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cidade */}
        <div className="md:col-span-2">
          <Label htmlFor={`${prefixo}cidade`}>Cidade *</Label>
          <InputWithIcon
            id={`${prefixo}cidade`}
            type="text"
            value={endereco.cidade}
            onChange={(e) => handleChange('cidade', e.target.value)}
            placeholder="Nome da cidade"
            icon={Building}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Rua */}
        <div className="md:col-span-2">
          <Label htmlFor={`${prefixo}rua`}>Rua/Logradouro *</Label>
          <InputWithIcon
            id={`${prefixo}rua`}
            type="text"
            value={endereco.rua}
            onChange={(e) => handleChange('rua', e.target.value)}
            placeholder="Nome da rua, avenida, etc."
            icon={MapPin}
            required
          />
        </div>

        {/* Número */}
        <div>
          <Label htmlFor={`${prefixo}numero`}>Número *</Label>
          <InputWithIcon
            id={`${prefixo}numero`}
            type="text"
            value={endereco.numero}
            onChange={(e) => handleChange('numero', e.target.value)}
            placeholder="123"
            icon={Hash}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bairro */}
        <div>
          <Label htmlFor={`${prefixo}bairro`}>Bairro *</Label>
          <InputWithIcon
            id={`${prefixo}bairro`}
            type="text"
            value={endereco.bairro}
            onChange={(e) => handleChange('bairro', e.target.value)}
            placeholder="Nome do bairro"
            icon={Navigation}
            required
          />
        </div>

        {/* Complemento */}
        <div>
          <Label htmlFor={`${prefixo}complemento`}>Complemento</Label>
          <InputWithIcon
            id={`${prefixo}complemento`}
            type="text"
            value={endereco.complemento || ''}
            onChange={(e) => handleChange('complemento', e.target.value)}
            placeholder="Apto, Casa, Bloco, etc."
            icon={Building}
          />
        </div>
      </div>
    </div>
  );
};