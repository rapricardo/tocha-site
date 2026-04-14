import { useState } from 'react';
import { Send, Lock } from 'lucide-react';

interface Props {
  erro?: string | null;
}

const MENSAGENS_ERRO: Record<string, string> = {
  'senha-curta': 'A senha deve ter pelo menos 6 caracteres.',
  'senhas-diferentes': 'As senhas não coincidem.',
  'falha-atualizacao': 'Erro ao atualizar senha. Tente novamente.',
  'sessao-expirada': 'Sua sessão expirou. Solicite um novo link.',
};

export default function RedefinirSenhaForm({ erro }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-md mx-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />

      <div className="text-center mb-10">
        <h1 className="text-2xl font-bold font-industrial text-white mb-2 uppercase">
          Criar Nova Senha
        </h1>
        <p className="text-gray-500 text-sm">
          Digite sua nova senha abaixo
        </p>
      </div>

      {erro && (
        <p className="text-red-500 text-sm text-center mb-4">
          {MENSAGENS_ERRO[erro] || 'Erro ao atualizar senha.'}
        </p>
      )}

      <form
        method="POST"
        action="/api/auth/atualizar-senha"
        className="space-y-6"
        onSubmit={() => setLoading(true)}
      >
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Nova senha
          </label>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Confirmar senha
          </label>
          <input
            type="password"
            name="confirmPassword"
            required
            minLength={6}
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors"
            placeholder="Repita a senha"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : '[ Salvar Nova Senha ]'}
          {!loading && <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 mt-4">
          <Lock className="w-3 h-3" />
          <span>Sua senha fica criptografada</span>
        </div>
      </form>
    </div>
  );
}
