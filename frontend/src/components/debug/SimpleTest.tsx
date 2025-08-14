import React, { useState, useEffect } from 'react';

const SimpleTest: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        console.log('Iniciando fetch...');
        const response = await fetch('/api/dashboard/metricas');
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Dados recebidos:', data);
        setMetrics(data);
      } catch (err) {
        console.error('Erro:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  console.log('Renderizando SimpleTest - Loading:', loading, 'Error:', error, 'Metrics:', metrics);

  if (loading) {
    return <div className="p-4 bg-yellow-100">Carregando...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-100">Erro: {error}</div>;
  }

  return (
    <div className="p-4 bg-green-100">
      <h2>Teste Simples - Dashboard</h2>
      <pre>{JSON.stringify(metrics, null, 2)}</pre>
    </div>
  );
};

export default SimpleTest;