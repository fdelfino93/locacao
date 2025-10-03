import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { InputWithIcon } from '../ui/input-with-icon';
import {
  Plus,
  Trash2,
  Users,
  CreditCard,
  Percent,
  AlertCircle,
  CheckCircle,
  Star,
  TrendingUp,
  Heart,
  MapPin
} from 'lucide-react';
import type { ContratoLocador, ContaBancariaLocador, LocadorOption } from '../../types';
import { apiService } from '../../services/api';
import { getApiUrl } from '@/config/api';

interface ContractLandlordsFormProps {
  locadores: ContratoLocador[];
  onChange: (locadores: ContratoLocador[]) => void;
  readonly?: boolean;
}

export const ContractLandlordsForm: React.FC<ContractLandlordsFormProps> = ({
  locadores,
  onChange,
  readonly = false
}) => {
  const [locadoresOptions, setLocadoresOptions] = useState<LocadorOption[]>([]);
  const [contasBancarias, setContasBancarias] = useState<Record<number, ContaBancariaLocador[]>>({});
  const [loading, setLoading] = useState(false);
  const [somaPercentual, setSomaPercentual] = useState(0);

  useEffect(() => {
    console.log('🔥 VERSÃO NOVA DO COMPONENTE - SEM ENDEREÇO! 🔥');
    carregarLocadoresAtivos();
  }, []);

  useEffect(() => {
    // Recalcular soma das porcentagens
    const soma = locadores.reduce((acc, locador) => acc + (locador.porcentagem || 0), 0);
    setSomaPercentual(soma);
  }, [locadores]);

  // Carregar contas bancárias para locadores existentes no modo edição
  useEffect(() => {
    console.log('🔍 useEffect contas bancárias disparado:');
    console.log('readonly:', readonly);
    console.log('locadores.length:', locadores.length);
    console.log('locadores:', locadores);
    
    if (locadores.length > 0) {
      // Carregar contas bancárias para todos os locadores que têm ID válido
      locadores.forEach((locador, index) => {
        console.log(`🔍 Verificando locador ${index}:`, locador);
        if (locador.locador_id && locador.locador_id > 0) {
          console.log(`📞 Carregando contas para locador ${locador.locador_id}`);
          carregarContasBancarias(locador.locador_id);
        }
      });
    }
  }, [locadores]);

  const carregarLocadoresAtivos = async () => {
    try {
      setLoading(true);
      // Usar apiService que funciona corretamente
      const response = await apiService.listarLocadores();
      if (response.success && response.data) {
        setLocadoresOptions(response.data);
        console.log('Locadores carregados:', response.data.length);
      } else {
        console.error('Erro na resposta da API:', response);
      }
    } catch (error) {
      console.error('Erro ao carregar locadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarContasBancarias = async (locadorId: number) => {
    console.log(`🏦 CARREGANDO contas bancárias para locador ${locadorId}`);
    try {
      const response = await fetch(getApiUrl(`/locadores/${locadorId}/contas-bancarias`));
      
      if (response.ok) {
        const result = await response.json();
        // A API retorna {data: [...], success: true}, então precisamos acessar result.data
        const contas = result.data || [];
        
        // Criar descrição para cada conta se não existir
        const contasFormatadas = contas.map((conta: any) => ({
          ...conta,
          descricao: conta.descricao || 
            (conta.tipo_recebimento === 'PIX' && conta.chave_pix ? 
              `PIX - ${conta.chave_pix}` : 
              conta.tipo_recebimento === 'TED' && conta.banco ? 
              `TED - ${conta.banco} Ag: ${conta.agencia || ''} CC: ${conta.conta || ''}` :
              `${conta.tipo_recebimento || 'Conta'} ${conta.principal ? '(Principal)' : ''}`)
        }));
        
        setContasBancarias(prev => ({
          ...prev,
          [locadorId]: contasFormatadas
        }));
        
        console.log(`Contas bancárias carregadas para locador ${locadorId}:`, contasFormatadas.length);
      } else {
        // Locador sem contas bancárias cadastradas ou endpoint não existe
        console.warn(`Sem contas bancárias para locador ${locadorId}`);
        setContasBancarias(prev => ({
          ...prev,
          [locadorId]: []
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar contas bancárias:', error);
      // Em caso de erro, definir array vazio para não quebrar a interface
      setContasBancarias(prev => ({
        ...prev,
        [locadorId]: []
      }));
    }
  };

  const adicionarLocador = (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevenir submit do formulário
    const novoLocador: ContratoLocador = {
      locador_id: 0,
      conta_bancaria_id: 1,
      porcentagem: 0,
      responsabilidade_principal: locadores.length === 0 // Primeiro locador é sempre principal
    };
    onChange([...locadores, novoLocador]);
  };

  const removerLocador = (index: number, e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevenir submit do formulário
    const novosLocadores = locadores.filter((_, i) => i !== index);
    onChange(novosLocadores);
  };

  const atualizarLocador = (index: number, campo: keyof ContratoLocador, valor: any) => {
    const novosLocadores = [...locadores];
    novosLocadores[index] = {
      ...novosLocadores[index],
      [campo]: valor
    };

    // Se mudou o locador, resetar a conta bancária e carregar novas contas
    if (campo === 'locador_id') {
      novosLocadores[index].conta_bancaria_id = 1;
      if (valor > 0) {
        carregarContasBancarias(valor);
      }
    }

    onChange(novosLocadores);
  };

  const distribuirPercentualIgualmente = (e?: React.MouseEvent) => {
    e?.preventDefault(); // Prevenir submit do formulário
    if (locadores.length === 0) return;
    
    const percentualPorLocador = 100 / locadores.length;
    const novosLocadores = locadores.map((locador, index) => {
      // Para os primeiros locadores, usar o valor arredondado para baixo
      if (index < locadores.length - 1) {
        return {
          ...locador,
          porcentagem: Math.floor(percentualPorLocador * 100) / 100
        };
      }
      // Para o último locador, calcular o resto para garantir soma exata de 100%
      const somaAnteriores = Math.floor(percentualPorLocador * 100) / 100 * (locadores.length - 1);
      return {
        ...locador,
        porcentagem: Math.round((100 - somaAnteriores) * 100) / 100
      };
    });
    
    onChange(novosLocadores);
  };

  const getStatusValidacao = () => {
    if (locadores.length === 0) {
      return { 
        tipo: 'error', 
        mensagem: 'É obrigatório ter pelo menos um locador',
        icone: AlertCircle,
        cor: 'text-red-600'
      };
    }

    // Verificar se há um responsável principal
    const temResponsavelPrincipal = locadores.some(l => l.responsabilidade_principal === true);
    
    if (!temResponsavelPrincipal) {
      return {
        tipo: 'error',
        mensagem: 'É necessário ter um locador como responsável principal',
        icone: AlertCircle,
        cor: 'text-red-600'
      };
    }

    // Verificar se todos os campos estão preenchidos
    const temCamposVazios = locadores.some(l => 
      l.locador_id === 0 || l.porcentagem <= 0
    );

    if (temCamposVazios) {
      return {
        tipo: 'warning',
        mensagem: 'Preencha todos os campos dos locadores',
        icone: AlertCircle,
        cor: 'text-yellow-600'
      };
    }

    // Verificar duplicatas
    const locadoresIds = locadores.map(l => l.locador_id);
    const temDuplicatas = locadoresIds.length !== new Set(locadoresIds).size;

    if (temDuplicatas) {
      return {
        tipo: 'error',
        mensagem: 'Não é possível ter o mesmo locador duplicado',
        icone: AlertCircle,
        cor: 'text-red-600'
      };
    }

    // Validação rigorosa: soma deve ser exatamente 100%
    if (somaPercentual !== 100) {
      const diferenca = (100 - somaPercentual).toFixed(2);
      const sinalDiferenca = somaPercentual > 100 ? '-' : '+';
      return {
        tipo: 'error',
        mensagem: `A soma deve ser exatamente 100%. Atual: ${somaPercentual.toFixed(2)}% (${sinalDiferenca}${Math.abs(Number(diferenca))}%)`,
        icone: AlertCircle,
        cor: 'text-red-600'
      };
    }

    return {
      tipo: 'success',
      mensagem: 'Configuração válida!',
      icone: CheckCircle,
      cor: 'text-green-600'
    };
  };

  const status = getStatusValidacao();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Clientes (Proprietários)
          </h2>
          <div className="flex gap-2">
            <Button 
              type="button"
              onClick={distribuirPercentualIgualmente}
              disabled={locadores.length === 0}
              variant="outline"
              size="sm"
              className="btn-outline hover:bg-primary hover:text-primary-foreground transition-colors"
              title="Distribui automaticamente 100% entre todos os locadores de forma igual"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Distribuir 100% Igualmente
            </Button>
            <Button 
              type="button"
              onClick={adicionarLocador}
              size="sm"
              className="btn-outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Locador
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          Selecione os proprietários (locadores) do imóvel, suas contas bancárias para recebimento dos aluguéis e a porcentagem de participação de cada um.
        </p>

        {/* Indicador de Progresso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`card-glass rounded-xl p-4 border ${
            status.tipo === 'success' 
              ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50' 
              : status.tipo === 'warning'
              ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50'
              : 'border-red-200 bg-gradient-to-r from-red-50 to-rose-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <status.icone className={`w-5 h-5 ${status.cor}`} />
              <span className={`font-medium ${status.cor}`}>
                {status.mensagem}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-muted-foreground" />
              <span className={`text-lg font-bold ${
                Math.abs(somaPercentual - 100) < 0.01 ? 'text-green-600' : 'text-red-600'
              }`}>
                {somaPercentual.toFixed(2)}%
              </span>
              <span className="text-sm text-muted-foreground">de 100%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lista de Locadores */}
      <div className="space-y-6">
        {locadores.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 card-glass rounded-xl border border-dashed border-border"
          >
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum proprietário adicionado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              É obrigatório ter pelo menos um proprietário no contrato
            </p>
            {!readonly && (
              <Button type="button" onClick={adicionarLocador} className="btn-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Proprietário
              </Button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence>
            {locadores.map((locador, index) => {
              const locadorOption = locadoresOptions.find(l => l.id === locador.locador_id);
              const contasDoLocador = Array.isArray(contasBancarias[locador.locador_id]) ? contasBancarias[locador.locador_id] : [];

              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="card-interactive p-6 rounded-xl border shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <motion.div 
                        className="p-3 rounded-xl shadow-lg bg-gradient-to-r from-blue-500 to-purple-500"
                        whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <Users className="w-5 h-5 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          Proprietário {index + 1}
                        </h3>
                        {locadorOption && (
                          <p className="text-sm text-muted-foreground">
                            {locadorOption.nome} {locadorOption.cpf_cnpj ? `- ${locadorOption.cpf_cnpj}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {!readonly && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          type="button"
                          onClick={(e) => removerLocador(index, e)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Seleção do Locador */}
                    <div>
                      <Label>Locador *</Label>
                      <Select 
                        value={locador.locador_id > 0 ? locador.locador_id.toString() : ""}
                        onValueChange={(value) => atualizarLocador(index, 'locador_id', parseInt(value))}
                      >
                        <SelectTrigger className="bg-muted/50 border-border text-foreground">
                          <SelectValue placeholder="Selecione o locador" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          {loading ? (
                            <SelectItem value="0" disabled>Carregando...</SelectItem>
                          ) : locadoresOptions.length === 0 ? (
                            <SelectItem value="0" disabled>Nenhum locador encontrado</SelectItem>
                          ) : (
                            locadoresOptions.map((locadorOpt) => (
                              <SelectItem key={locadorOpt.id} value={locadorOpt.id ? locadorOpt.id.toString() : ""} className="text-foreground hover:bg-accent">
                                {locadorOpt.nome} {locadorOpt.cpf_cnpj ? `- ${locadorOpt.cpf_cnpj}` : ''}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Seleção da Conta Bancária */}
                    <div>
                      <Label>Conta Bancária *</Label>
                      <Select 
                        value={locador.conta_bancaria_id ? locador.conta_bancaria_id.toString() : ""}
                        onValueChange={(value) => atualizarLocador(index, 'conta_bancaria_id', parseInt(value))}
                        disabled={!locador.locador_id || contasDoLocador.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !locador.locador_id 
                              ? "Selecione o locador primeiro"
                              : contasDoLocador.length === 0
                              ? "Sem contas cadastradas"
                              : "Selecione a conta"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {contasDoLocador.map((conta) => (
                            <SelectItem key={conta.id} value={conta.id ? conta.id.toString() : ""}>
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                <span>{conta.descricao}</span>
                                {conta.principal && (
                                  <Star className="w-3 h-3 text-yellow-500" />
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {locador.locador_id > 0 && contasDoLocador.length === 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Este locador não possui contas bancárias cadastradas
                        </p>
                      )}
                    </div>

                    {/* Porcentagem */}
                    <div>
                      <Label>Porcentagem (%) *</Label>
                      <InputWithIcon
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={locador.porcentagem || ''}
                        onChange={(e) => atualizarLocador(index, 'porcentagem', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        icon={Percent}
                      />
                    </div>

                    {/* Responsável Principal */}
                    <div>
                      <Label>Responsabilidade</Label>
                      <div className="flex items-center space-x-2 h-10 px-3 py-2 border rounded-md">
                        <input
                          type="checkbox"
                          id={`principal_${index}`}
                          checked={locador.responsabilidade_principal || false}
                          onChange={(e) => {
                            // Se está marcando como principal, desmarcar todos os outros
                            if (e.target.checked) {
                              const novosLocadores = locadores.map((loc, i) => ({
                                ...loc,
                                responsabilidade_principal: i === index
                              }));
                              onChange(novosLocadores);
                            } else {
                              atualizarLocador(index, 'responsabilidade_principal', false);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`principal_${index}`} className="text-sm font-normal cursor-pointer">
                          Responsável Principal
                        </Label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Resumo da Configuração */}
      {locadores.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="card-elevated p-6 lg:p-8 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${
              status.tipo === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
              status.tipo === 'warning' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' :
              'bg-gradient-to-br from-red-500 to-rose-600'
            } shadow-lg`}>
              <status.icone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-foreground">
                Resumo da Configuração
              </h4>
              <p className="text-sm text-muted-foreground">
                Validação dos proprietários e porcentagens
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Total de Locadores</span>
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{locadores.length}</p>
            </div>
            
            <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Soma das Porcentagens</span>
                <Percent className="w-4 h-4 text-primary" />
              </div>
              <p className={`text-2xl font-bold ${
                somaPercentual === 100 ? 'text-green-600' : 'text-red-600'
              }`}>
                {somaPercentual.toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-background rounded-lg p-4 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Status da Validação</span>
                <status.icone className="w-4 h-4 text-primary" />
              </div>
              <p className={`text-sm font-semibold ${status.cor}`}>
                {status.mensagem}
              </p>
            </div>
          </div>

          {/* Progresso visual da porcentagem */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Progresso das Porcentagens</span>
              <span className={`text-sm font-bold ${
                somaPercentual === 100 ? 'text-green-600' : 
                somaPercentual > 100 ? 'text-red-600' : 'text-yellow-600'
              }`}>
                {somaPercentual.toFixed(2)}% / 100%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(somaPercentual, 100)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full transition-colors ${
                  somaPercentual === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                  somaPercentual > 100 ? 'bg-gradient-to-r from-red-500 to-rose-600' :
                  'bg-gradient-to-r from-yellow-500 to-orange-600'
                } shadow-lg`}
              />
            </div>
            {somaPercentual > 100 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span className="text-sm text-red-700">
                  Excesso de {(somaPercentual - 100).toFixed(2)}% - Ajuste as porcentagens
                </span>
              </motion.div>
            )}
            {somaPercentual < 100 && somaPercentual > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                <span className="text-sm text-yellow-700">
                  Faltam {(100 - somaPercentual).toFixed(2)}% para completar 100%
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
