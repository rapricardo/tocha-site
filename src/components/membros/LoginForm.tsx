import { useState } from 'react';
import { LogIn, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  erro?: string | null;
  msg?: string | null;
}

const ERROR_MAP: Record<string, string> = {
  'campos-obrigatorios': 'Preencha todos os campos obrigatórios.',
  'credenciais-invalidas': 'E-mail ou senha incorretos. Tente novamente.',
};

const MSG_MAP: Record<string, string> = {
  'confirme-email': 'Verifique sua caixa de entrada para confirmar seu e-mail antes de entrar.',
};

const LoginForm = ({ erro, msg }: LoginFormProps) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const errorText = erro ? ERROR_MAP[erro] || 'Erro desconhecido. Tente novamente.' : null;
  const msgText = msg ? MSG_MAP[msg] || null : null;

  return (
    <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-md w-full mx-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold font-industrial text-white mb-2 uppercase">
          Acesse sua conta
        </h2>
        <p className="text-gray-500 text-sm">
          Entre para acessar a área de membros.
        </p>
      </div>

      {errorText && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 mb-6">
          {errorText}
        </div>
      )}

      {msgText && (
        <div className="bg-blue-500/10 border border-blue-500/30 text-blue-400 text-sm p-3 mb-6">
          {msgText}
        </div>
      )}

      <form
        method="POST"
        action="/api/auth/login"
        onSubmit={() => setLoading(true)}
        className="space-y-6"
      >
        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            E-mail
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-500 mb-1 uppercase tracking-wider">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              className="w-full bg-[#0a0a0a] border border-gray-700 text-white p-4 pr-12 focus:border-yellow-500 focus:outline-none transition-colors placeholder-gray-800"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : '[ Entrar ]'}
          {!loading && <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-sm">
        <a href="/membros/recuperar-senha" className="text-gray-500 hover:text-yellow-500 transition-colors">
          Esqueci minha senha
        </a>
        <a href="/membros/cadastro" className="text-gray-500 hover:text-yellow-500 transition-colors">
          Criar conta
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
