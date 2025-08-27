import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, RadialBarChart, RadialBar } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Building2, Store } from 'lucide-react';

interface OcupacaoChartProps {
  data?: any[];
  title?: string;
  type?: 'pie' | 'radial';
}

export const OcupacaoChart: React.FC<OcupacaoChartProps> = ({
  data = [],
  title = 'Distribuição de Imóveis',
  type = 'pie'
}) => {
  // Dados mockados para demonstração
  const defaultData = [
    { name: 'Apartamentos', value: 12, ocupados: 10, color: '#3b82f6' },
    { name: 'Casas', value: 5, ocupados: 4, color: '#8b5cf6' },
    { name: 'Comercial', value: 3, ocupados: 3, color: '#10b981' },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  // Dados para o gráfico radial
  const radialData = chartData.map(item => ({
    name: item.name,
    value: (item.ocupados / item.value) * 100,
    fill: item.color
  }));

  // Customização do tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name || data.payload.name}</p>
          <p className="text-sm text-muted-foreground">
            {type === 'pie' 
              ? `Total: ${data.value}`
              : `Ocupação: ${data.value.toFixed(1)}%`
            }
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}`;
  };

  const getIcon = (name: string) => {
    switch(name.toLowerCase()) {
      case 'apartamentos':
        return <Building2 className="w-4 h-4" />;
      case 'casas':
        return <Home className="w-4 h-4" />;
      case 'comercial':
        return <Store className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        {type === 'pie' ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-6 space-y-3">
              {chartData.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex items-center gap-2">
                      {getIcon(item.name)}
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {item.ocupados}/{item.value}
                    </span>
                    <span className="text-sm font-medium">
                      {((item.ocupados / item.value) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <RadialBarChart 
                cx="50%" 
                cy="50%" 
                innerRadius="30%" 
                outerRadius="100%" 
                data={radialData}
                startAngle={90}
                endAngle={450}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={10}
                  fill="#8884d8"
                  background={{ fill: '#f3f4f6' }}
                />
                <Tooltip content={<CustomTooltip />} />
              </RadialBarChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              {chartData.map((item: any, index: number) => (
                <div key={index} className="space-y-1">
                  <div 
                    className="text-2xl font-bold" 
                    style={{ color: item.color }}
                  >
                    {((item.ocupados / item.value) * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-muted-foreground">{item.name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};