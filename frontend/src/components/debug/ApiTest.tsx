import React, { useState, useEffect } from 'react';

const ApiTest: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Testar diretamente sem proxy primeiro
      console.log('Testando API diretamente...');
      const response = await fetch('http://localhost:8000/api/dashboard/metricas');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      console.log('Dados recebidos:', result);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      console.error('Erro na API:', err);
    } finally {
      setLoading(false);
    }
  };

  const testProxyApi = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Testar via proxy
      console.log('Testando API via proxy...');
      const response = await fetch('/api/dashboard/metricas');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
      console.log('Dados via proxy:', result);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMsg);
      console.error('Erro no proxy:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Componente ApiTest montado');
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Teste de API - Dashboard</h2>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={testApi}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar API Direta'}
        </button>
        
        <button 
          onClick={testProxyApi}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testando...' : 'Testar Via Proxy'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {data && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong>Sucesso!</strong>
          <pre className="mt-2 text-sm">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTest;