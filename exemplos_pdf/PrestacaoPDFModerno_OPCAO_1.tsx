import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import ExportarPrestacaoPDF from './ExportarPrestacaoPDF';

// OPÇÃO 1: MINIMALISTA CLEAN - COBIMOB
const PrestacaoContasPDF_Opcao1: React.FC = () => {
  const elementId = "prestacao-opcao-1";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Botão Exportar */}
      <div className="mb-4">
        <ExportarPrestacaoPDF
          elementId={elementId}
          fileName="prestacao-cobimob-opcao1-minimalista.pdf"
        />
      </div>

      {/* Documento PDF */}
      <div id={elementId} className="bg-white p-8 min-h-screen">

        {/* Header com Logo COBIMOB */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b-4 border-teal-600">
          <div className="text-4xl font-bold">
            <span className="text-teal-600">Cobi</span>
            <span className="text-pink-500">M</span>
            <span className="text-purple-600">ob</span>
          </div>
          <div className="text-right">
            <h1 className="text-2xl font-bold text-purple-600 mb-2">PRESTAÇÃO DE CONTAS</h1>
            <div className="text-sm text-gray-600">Maio/2025</div>
            <div className="text-xs text-gray-500">Vencimento: 07/07/2025</div>
            <div className="text-xs text-gray-500">Pagamento: 04/08/2025</div>
          </div>
        </div>

        {/* Informações Principais */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-teal-600">
            <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-3">Proprietários</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Camilo R. Gusso</strong> - CPF: 098.602.089-30</p>
              <p><strong>Camila C. Gusso</strong> - CPF: 129.665.399-41</p>
              <p><strong>Reinaldo José Gusso</strong> - CPF: 089.166.619-27</p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-teal-600">
            <h3 className="text-sm font-bold text-purple-600 uppercase tracking-wide mb-3">Locatário & Imóvel</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Vivaldo Valério da Silva</strong></p>
              <p>Condomínio Alameda Club Residencial</p>
              <p>Apartamento 207 - Bloco A, Vaga 203</p>
              <p>Curitiba/PR - CEP: 81.220-190</p>
            </div>
          </div>
        </div>

        {/* Valores Cobrados */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-teal-600 to-purple-600 text-white px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">📋 Valores Cobrados junto ao Aluguel</h2>
          </div>
          <table className="w-full border border-gray-200 rounded-b-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Descrição</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 w-32">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Aluguel</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 1.877,91</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Seguro fiança (22/27)</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 165,00</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Taxa de Condomínio - Ref ao vencimento 10/06/25</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 929,16</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">FCI - Fundo de Conservação</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 93,90</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">IPTU - Apartamento parcela 04/10</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 52,42</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">IPTU - Garagem parcela 04/07</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 20,82</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Reembolso - Fundo de Reserva</td>
                <td className="px-4 py-2 text-right font-semibold text-red-600">-R$ 43,64</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Reembolso - Fundo de obras</td>
                <td className="px-4 py-2 text-right font-semibold text-red-600">-R$ 10,00</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Reembolso - Reforma do Hall - Parc 06/24</td>
                <td className="px-4 py-2 text-right font-semibold text-red-600">-R$ 127,89</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Acréscimos por atraso (+) ref ao Aluguel</td>
                <td className="px-4 py-2 text-right font-semibold text-orange-600">R$ 193,27</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Acréscimos por atraso (+) ref ao Seguro Fiança</td>
                <td className="px-4 py-2 text-right font-semibold text-orange-600">R$ 16,98</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Acréscimos por atraso (+) taxa de condomínio</td>
                <td className="px-4 py-2 text-right font-semibold text-orange-600">R$ 95,62</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Acréscimos por atraso (+) FCI</td>
                <td className="px-4 py-2 text-right font-semibold text-orange-600">R$ 9,67</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Acréscimos por atraso (+) IPTU</td>
                <td className="px-4 py-2 text-right font-semibold text-orange-600">R$ 7,54</td>
              </tr>
              <tr className="bg-gray-100 border-t-2 border-teal-600">
                <td className="px-4 py-3 font-bold">VALOR TOTAL</td>
                <td className="px-4 py-3 text-right font-bold text-lg">R$ 3.280,76</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Valores Retidos */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">🏛️ Valores Retidos do Total Pago</h2>
          </div>
          <table className="w-full border border-gray-200 rounded-b-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Descrição</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 w-32">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Taxa de administração (5%)</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 150,02</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Registro boleto</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 2,50</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Transferência bancária adicional - R$10,00 (Qtd 2)</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 20,00</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Valor retido para pagamento FCI (-)</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 103,57</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Valor retido para pagamento IPTU (-)</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 80,78</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Valor retido para pagamento Condomínio (-)</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 1.024,78</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">Valor retido para pagamento Seguro Fiança (-)</td>
                <td className="px-4 py-2 text-right font-semibold">R$ 181,98</td>
              </tr>
              <tr className="bg-gray-100 border-t-2 border-purple-600">
                <td className="px-4 py-3 font-bold">VALOR TOTAL RETIDO</td>
                <td className="px-4 py-3 text-right font-bold text-lg">R$ 1.563,63</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Repasse */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">💰 Valor a ser Repassado</h2>
          </div>
          <table className="w-full border border-gray-200 rounded-b-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Proprietário</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-700 w-32">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div>
                    <div className="font-semibold">Camilo R. Gusso</div>
                    <div className="text-xs text-gray-600">PIX: 41996840799</div>
                  </div>
                </td>
                <td className="px-4 py-2 text-right font-semibold text-green-600">R$ 572,38</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div>
                    <div className="font-semibold">Reinaldo José Gusso</div>
                    <div className="text-xs text-gray-600">PIX: CPF 089.166.619-27</div>
                  </div>
                </td>
                <td className="px-4 py-2 text-right font-semibold text-green-600">R$ 572,38</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div>
                    <div className="font-semibold">Camila C. Gusso</div>
                    <div className="text-xs text-gray-600">PIX: 41984411620</div>
                  </div>
                </td>
                <td className="px-4 py-2 text-right font-semibold text-green-600">R$ 572,37</td>
              </tr>
              <tr className="bg-green-50 border-t-2 border-green-600">
                <td className="px-4 py-3 font-bold">TOTAL A SER REPASSADO</td>
                <td className="px-4 py-3 text-right font-bold text-lg text-green-700">R$ 1.717,13</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Dados do Repasse */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-sm">
            <p><strong>Repasse realizado em:</strong> 06/08/2025</p>
            <p><strong>Mês de referência:</strong> Maio</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t-2 border-gray-200 text-center">
          <div className="flex justify-between items-center text-xs text-gray-600">
            <div className="font-bold text-lg">
              <span className="text-teal-600">Cb</span><span className="text-purple-600">Mb</span>
            </div>
            <div>R. Presidente Faria, 431 | q 42 | 4° andar | Centro | Curitiba | PR</div>
            <div>contato@cobimob.com.br | ☎ +1 3501 5601</div>
          </div>
        </div>

        {/* Elementos geométricos sutis */}
        <div className="absolute top-20 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 opacity-20"></div>
        <div className="absolute top-36 right-16 w-0 h-0 border-l-8 border-r-8 border-b-14 border-transparent border-b-pink-200 opacity-30"></div>
      </div>
    </div>
  );
};

export default PrestacaoContasPDF_Opcao1;