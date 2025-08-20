import React, { useState, useEffect } from 'react';

const ConnectionTest: React.FC = () => {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name: string, url: string) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      setResults((prev: any) => ({
        ...prev,
        [name]: {
          status: response.ok ? 'SUCCESS' : 'ERROR',
          data: data,
          statusCode: response.status
        }
      }));
    } catch (error) {
      setResults((prev: any) => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          error: error.message,
          statusCode: 'CONNECTION_ERROR'
        }
      }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults({});

    // Testar diferentes endpoints
    await Promise.all([
      testEndpoint('Root API', '/'),
      testEndpoint('Health Check', '/health'),
      testEndpoint('Locadores', '/api/locadores'),
      testEndpoint('Locatários', '/api/locatarios'),
      testEndpoint('Imóveis', '/api/imoveis'),
      testEndpoint('Direct Backend', 'http://localhost:8000/api/locadores'),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">🔍 Teste de Conectividade API</h2>
        
        <button 
          onClick={runAllTests}
          disabled={loading}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Novamente'}
        </button>

        <div className="space-y-4">
          {Object.entries(results).map(([name, result]: [string, any]) => (
            <div key={name} className="border rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{name}</h3>
                <span 
                  className={`px-2 py-1 rounded text-sm ${
                    result.status === 'SUCCESS' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {result.status} ({result.statusCode})
                </span>
              </div>
              
              {result.error && (
                <div className="text-red-600 text-sm mb-2">
                  Erro: {result.error}
                </div>
              )}
              
              {result.data && (
                <div className="text-sm">
                  <strong>Dados recebidos:</strong>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {Object.keys(results).length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            Nenhum teste executado ainda
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionTest;