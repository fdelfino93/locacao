import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Save, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

export const ConfiguracoesPerfil: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Estados para os formulários
  const [nomeForm, setNomeForm] = useState({
    nome: user?.nome || '',
  });

  const [senhaForm, setSenhaForm] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const handleNomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await axios.put('/api/auth/perfil/nome', {
        nome: nomeForm.nome,
      });

      setMessage({ type: 'success', text: 'Nome alterado com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao alterar nome. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSenhaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    if (senhaForm.novaSenha !== senhaForm.confirmarSenha) {
      setMessage({ type: 'error', text: 'As senhas não coincidem!' });
      setIsLoading(false);
      return;
    }

    if (senhaForm.novaSenha.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres!' });
      setIsLoading(false);
      return;
    }

    try {
      await axios.put('/api/auth/perfil/senha', {
        senhaAtual: senhaForm.senhaAtual,
        novaSenha: senhaForm.novaSenha,
      });

      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setSenhaForm({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || 'Erro ao alterar senha. Verifique a senha atual.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-4"
        >
          <User className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Configurações do Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais e segurança da conta</p>
      </div>

      {/* Mensagens */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alterar Nome */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Alterar Nome</h2>
            </div>

            <form onSubmit={handleNomeSubmit} className="space-y-4">
              <div>
                <label htmlFor="nome" className="text-sm font-medium text-foreground block mb-2">
                  Nome Completo
                </label>
                <Input
                  id="nome"
                  type="text"
                  value={nomeForm.nome}
                  onChange={(e) => setNomeForm({ nome: e.target.value })}
                  placeholder="Digite seu nome completo"
                  required
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !nomeForm.nome.trim()}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Nome'}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Alterar Senha */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Alterar Senha</h2>
            </div>

            <form onSubmit={handleSenhaSubmit} className="space-y-4">
              {/* Senha Atual */}
              <div>
                <label htmlFor="senhaAtual" className="text-sm font-medium text-foreground block mb-2">
                  Senha Atual
                </label>
                <div className="relative">
                  <Input
                    id="senhaAtual"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={senhaForm.senhaAtual}
                    onChange={(e) => setSenhaForm(prev => ({ ...prev, senhaAtual: e.target.value }))}
                    placeholder="Digite sua senha atual"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nova Senha */}
              <div>
                <label htmlFor="novaSenha" className="text-sm font-medium text-foreground block mb-2">
                  Nova Senha
                </label>
                <div className="relative">
                  <Input
                    id="novaSenha"
                    type={showNewPassword ? 'text' : 'password'}
                    value={senhaForm.novaSenha}
                    onChange={(e) => setSenhaForm(prev => ({ ...prev, novaSenha: e.target.value }))}
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label htmlFor="confirmarSenha" className="text-sm font-medium text-foreground block mb-2">
                  Confirmar Nova Senha
                </label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={senhaForm.confirmarSenha}
                    onChange={(e) => setSenhaForm(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                    placeholder="Confirme a nova senha"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !senhaForm.senhaAtual || !senhaForm.novaSenha || !senhaForm.confirmarSenha}
                className="w-full"
                variant="destructive"
              >
                <Lock className="w-4 h-4 mr-2" />
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Informações da Conta */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Informações da Conta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2 font-medium">{user?.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Empresa ID:</span>
              <span className="ml-2 font-medium">{user?.empresa_id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Perfil ID:</span>
              <span className="ml-2 font-medium">{user?.perfil_id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ID do Usuário:</span>
              <span className="ml-2 font-medium">{user?.user_id}</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};