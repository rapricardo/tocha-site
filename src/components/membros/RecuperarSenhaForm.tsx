import { useState } from 'react';
import { Mail, ArrowLeft } from 'lucide-react';

interface RecuperarSenhaFormProps {
  erro?: string | null;
  msg?: string | null;
}

const RecuperarSenhaForm = ({ erro, msg }: RecuperarSenhaFormProps) => {
  const [loading, setLoading] = useState(false);

  const isSuccess = msg === 'email-enviado';

  if (isSuccess) {
    return (
      <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-md w-full mx-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />

        <div className="text-center py-8">
          <Mail className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-industrial text-white mb-4 uppercase">
            E-mail enviado
          </h2>
          <p className="text-gray-400 mb-8">
            Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
          </p>
          <a
            href="/membros/login"
            className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-400 transition-colors font-mono text-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-gray-800 p-8 md:p-12 shadow-2xl relative overflow-hidden max-w-md w-full mx-auto">
      <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />

      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold font-industrial text-white mb-2 uppercase">
          Recuperar senha
        </h2>
        <p className="text-gray-500 text-sm">
          Informe seu e-mail para receber o link de redefinição.
        </p>
      </div>

      {erro && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 mb-6">
          Preencha o campo de e-mail.
        </div>
      )}

      <form
        method="POST"
        action="/api/auth/recuperar-senha"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 uppercase tracking-widest transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : '[ Enviar Link ]'}
          {!loading && <Mail className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        <a href="/membros/login" className="text-gray-500 hover:text-yellow-500 transition-colors inline-flex items-center gap-2">
          <ArrowLeft className="w-3 h-3" />
          Voltar ao login
        </a>
      </div>
    </div>
  );
};

export default RecuperarSenhaForm;
