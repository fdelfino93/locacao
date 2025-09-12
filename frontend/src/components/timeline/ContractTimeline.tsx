import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  Plus,
  FileText,
  DollarSign,
  AlertCircle,
  Edit3,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select } from '../ui/select';

interface TimelineEvent {
  id: number;
  tipo_evento: string;
  data_evento: string;
  titulo: string;
  descricao?: string;
  valor?: number;
  status: string;
  metadados?: any;
}

interface ContractTimelineProps {
  contratoId: number;
  onEventClick?: (event: TimelineEvent) => void;
  onEventEdit?: (event: TimelineEvent) => void;
  onEventDelete?: (eventId: number) => void;
  className?: string;
}

const timelineApi = {
  getTimeline: async (contratoId: number, filters?: any) => {
    const params = new URLSearchParams({ 
      contrato_id: contratoId.toString(),
      ...filters 
    });
    const response = await fetch(`http://localhost:8000/api/contratos/${contratoId}/timeline?${params}`);
    if (!response.ok) throw new Error('Erro ao carregar timeline');
    return response.json();
  },

  createEvent: async (contratoId: number, event: any) => {
    const response = await fetch(`http://localhost:8000/api/contratos/${contratoId}/eventos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!response.ok) throw new Error('Erro ao criar evento');
    return response.json();
  },

  updateEvent: async (eventId: number, updates: any) => {
    const response = await fetch(`http://localhost:8000/api/eventos/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Erro ao atualizar evento');
    return response.json();
  },

  deleteEvent: async (eventId: number) => {
    const response = await fetch(`http://localhost:8000/api/eventos/${eventId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Erro ao deletar evento');
    return response.json();
  },

  getEventTypes: async () => {
    const response = await fetch('http://localhost:8000/api/eventos/tipos');
    if (!response.ok) throw new Error('Erro ao carregar tipos de eventos');
    return response.json();
  }
};

const ContractTimeline: React.FC<ContractTimelineProps> = ({
  contratoId,
  onEventClick,
  onEventEdit,
  onEventDelete,
  className = ""
}) => {
  const [filters, setFilters] = useState({
    tipo_evento: '',
    data_inicio: '',
    data_fim: ''
  });
  const [showNewEventForm, setShowNewEventForm] = useState(false);

  const queryClient = useQueryClient();

  // Carregar timeline
  const { data: timelineData, isLoading, error } = useQuery({
    queryKey: ['timeline', contratoId, filters],
    queryFn: () => timelineApi.getTimeline(contratoId, filters),
    staleTime: 2 * 60 * 1000,
  });

  // Carregar tipos de eventos
  const { data: eventTypesData } = useQuery({
    queryKey: ['eventTypes'],
    queryFn: timelineApi.getEventTypes,
    staleTime: 10 * 60 * 1000,
  });

  // Mutação para criar evento
  const createEventMutation = useMutation({
    mutationFn: (event: any) => timelineApi.createEvent(contratoId, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', contratoId] });
      setShowNewEventForm(false);
    },
  });

  // Mutação para atualizar evento
  // const updateEventMutation = useMutation({
  //   mutationFn: ({ eventId, updates }: { eventId: number; updates: any }) =>
  //     timelineApi.updateEvent(eventId, updates),
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['timeline', contratoId] });
  //   },
  // });

  // Mutação para deletar evento
  const deleteEventMutation = useMutation({
    mutationFn: timelineApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline', contratoId] });
    },
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'Data inválida';
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return '';
      return format(date, 'HH:mm', { locale: ptBR });
    } catch {
      return '';
    }
  };

  const getEventIcon = (tipo: string) => {
    switch (tipo) {
      case 'contrato_assinado':
      case 'contrato_renovado':
        return <FileText className="w-4 h-4" />;
      case 'pagamento':
      case 'reajuste_aplicado':
        return <DollarSign className="w-4 h-4" />;
      case 'vistoria':
      case 'manutencao':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  const getEventColor = (tipo: string, status: string) => {
    if (status === 'pendente') return 'border-yellow-200 bg-yellow-50';
    if (status === 'cancelado') return 'border-red-200 bg-red-50';
    
    switch (tipo) {
      case 'contrato_assinado':
      case 'contrato_renovado':
        return 'border-green-200 bg-green-50';
      case 'pagamento':
        return 'border-blue-200 bg-blue-50';
      case 'reajuste_aplicado':
        return 'border-purple-200 bg-purple-50';
      case 'vistoria':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    const getVariant = (status: string) => {
      switch (status) {
        case 'ativo':
        case 'concluido':
          return 'default';
        case 'pendente':
          return 'secondary';
        case 'cancelado':
          return 'destructive';
        default:
          return 'default';
      }
    };

    return (
      <Badge variant={getVariant(status)}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleDeleteEvent = (eventId: number) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      deleteEventMutation.mutate(eventId);
      onEventDelete?.(eventId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Erro ao carregar timeline. Tente novamente.
      </div>
    );
  }

  const events = timelineData?.data || [];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header com filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Timeline do Termo</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            value={filters.tipo_evento}
            onValueChange={(value) => setFilters(prev => ({ ...prev, tipo_evento: value }))}
          >
            <option value="">Todos os tipos</option>
            {eventTypesData?.data?.map((tipo: string) => (
              <option key={tipo} value={tipo}>
                {tipo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </Select>
          
          <Button
            onClick={() => setShowNewEventForm(true)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <div>Nenhum evento encontrado</div>
            <div className="text-sm">Adicione o primeiro evento à timeline</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Linha vertical da timeline */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            {events.map((event: TimelineEvent, index: number) => (
              <div key={event.id} className="relative flex gap-4">
                {/* Ícone do evento */}
                <div className={`
                  flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 bg-white
                  ${getEventColor(event.tipo_evento, event.status).split(' ')[0]}
                `}>
                  {getEventIcon(event.tipo_evento)}
                </div>

                {/* Conteúdo do evento */}
                <Card className={`flex-1 p-4 ${getEventColor(event.tipo_evento, event.status)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{event.titulo}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span>{formatDate(event.data_evento)}</span>
                        {formatTime(event.data_evento) && (
                          <>
                            <span>•</span>
                            <span>{formatTime(event.data_evento)}</span>
                          </>
                        )}
                        <span>•</span>
                        {getStatusBadge(event.status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {event.valor && (
                        <div className="text-sm font-medium text-gray-700">
                          R$ {event.valor.toLocaleString()}
                        </div>
                      )}
                      
                      <div className="relative group">
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        
                        <div className="absolute right-0 top-full mt-1 bg-white rounded-md shadow-lg border py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                          <button
                            onClick={() => onEventEdit?.(event)}
                            className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-50 w-full text-left"
                          >
                            <Edit3 className="w-3 h-3" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-gray-50 w-full text-left text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                            Excluir
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {event.descricao && (
                    <p className="text-sm text-gray-700 mt-2">{event.descricao}</p>
                  )}
                  
                  {event.metadados && Object.keys(event.metadados).length > 0 && (
                    <div className="mt-3 p-2 bg-white/50 rounded border-l-2 border-gray-300">
                      <div className="text-xs text-gray-600">
                        {Object.entries(event.metadados).map(([key, value]) => (
                          <div key={key}>
                            <strong>{key}:</strong> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => onEventClick?.(event)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Ver detalhes →
                  </button>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Formulário de novo evento (modal simples) */}
      {showNewEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Novo Evento</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const event = {
                  contrato_id: contratoId,
                  tipo_evento: formData.get('tipo_evento'),
                  titulo: formData.get('titulo'),
                  descricao: formData.get('descricao'),
                  data_evento: formData.get('data_evento'),
                  valor: formData.get('valor') ? parseFloat(formData.get('valor') as string) : null,
                  status: 'ativo'
                };
                createEventMutation.mutate(event);
              }}
              className="space-y-4"
            >
              <Select name="tipo_evento" required>
                <option value="">Selecione o tipo</option>
                {eventTypesData?.data?.map((tipo: string) => (
                  <option key={tipo} value={tipo}>
                    {tipo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </Select>
              
              <input
                name="titulo"
                placeholder="Título do evento"
                required
                className="w-full p-2 border rounded"
              />
              
              <textarea
                name="descricao"
                placeholder="Descrição (opcional)"
                className="w-full p-2 border rounded"
                rows={3}
              />
              
              <input
                name="data_evento"
                type="datetime-local"
                required
                className="w-full p-2 border rounded"
              />
              
              <input
                name="valor"
                type="number"
                step="0.01"
                placeholder="Valor (opcional)"
                className="w-full p-2 border rounded"
              />
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewEventForm(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createEventMutation.isPending}>
                  {createEventMutation.isPending ? 'Criando...' : 'Criar'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ContractTimeline;