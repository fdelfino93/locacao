import React from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface MetricasChartProps {
  data?: any[];
  type?: 'line' | 'area' | 'bar';
  title: string;
  color?: string;
}

export const MetricasChart: React.FC<MetricasChartProps> = ({
  data = [],
  type = 'line',
  title,
  color = '#3b82f6'
}) => {
  // Dados mockados para demonstração
  const defaultData = [
    { mes: 'Jan', receita: 42000, contratos: 12, ocupacao: 75 },
    { mes: 'Fev', receita: 44500, contratos: 13, ocupacao: 78 },
    { mes: 'Mar', receita: 43800, contratos: 14, ocupacao: 82 },
    { mes: 'Abr', receita: 46200, contratos: 14, ocupacao: 80 },
    { mes: 'Mai', receita: 48900, contratos: 15, ocupacao: 85 },
    { mes: 'Jun', receita: 51200, contratos: 16, ocupacao: 88 },
    { mes: 'Jul', receita: 49800, contratos: 15, ocupacao: 86 },
    { mes: 'Ago', receita: 45780, contratos: 15, ocupacao: 85 }
  ];

  const chartData = data.length > 0 ? data : defaultData;

  // Customização do tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: entry.color }} />
              <span className="text-sm text-muted-foreground">
                {entry.name}: {
                  entry.name === 'Receita' 
                    ? `R$ ${entry.value.toLocaleString('pt-BR')}`
                    : entry.name === 'Ocupação'
                    ? `${entry.value}%`
                    : entry.value
                }
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mes" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="receita"
                stroke={color}
                fillOpacity={1}
                fill="url(#colorReceita)"
                strokeWidth={2}
                name="Receita"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mes" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="contratos" fill="#8b5cf6" radius={[8, 8, 0, 0]} name="Contratos" />
              <Bar dataKey="ocupacao" fill="#10b981" radius={[8, 8, 0, 0]} name="Ocupação" />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="mes" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="receita"
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Receita"
              />
              <Line
                type="monotone"
                dataKey="ocupacao"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Ocupação (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600">+12.5%</span>
          </div>
        </div>
        {renderChart()}
      </CardContent>
    </Card>
  );
};