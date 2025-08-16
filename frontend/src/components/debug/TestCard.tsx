import React from 'react';
import { EnhancedSmartCard } from '../navigation/EnhancedSmartCard';

const TestCard: React.FC = () => {
  const testLocatario = {
    id: 1,
    nome: "Fernanda Carolini",
    cpf_cnpj: "6885582913",
    telefone: "41995234464",
    email: "fernandacarolini@hotmail.com",
    endereco: "",
    ativo: true
  };

  const testImovel = {
    id: 3,
    endereco: "Rua Martin Afonso, 1168",
    endereco_completo: "Rua Martin Afonso, 1168",
    tipo: "Apartamento",
    valor_aluguel: 1000.0,
    status: "Ativo",
    quartos: 0,
    banheiros: 0,
    vagas_garagem: 0,
    area_total: 0,
    locador: { nome: "Fernando" }
  };

  const testContrato = {
    id: 1,
    data_inicio: "2025-02-14",
    data_fim: "2025-12-18",
    valor_aluguel: 0,
    imovel_endereco: "Rua Martin Afonso, 1168",
    locador: "Fernando",
    locatario: "Locatário #3",
    status: "ATIVO"
  };

  return (
    <div className="p-8 space-y-8 bg-background min-h-screen">
      <h1 className="text-2xl font-bold">Teste dos Cards Aprimorados</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Locatário</h2>
          <EnhancedSmartCard
            tipo="locatario"
            dados={testLocatario}
            showActions={true}
            compact={false}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Imóvel</h2>
          <EnhancedSmartCard
            tipo="imovel"
            dados={testImovel}
            showActions={true}
            compact={false}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Contrato</h2>
          <EnhancedSmartCard
            tipo="contrato"
            dados={testContrato}
            showActions={true}
            compact={false}
          />
        </div>
      </div>
    </div>
  );
};

export default TestCard;