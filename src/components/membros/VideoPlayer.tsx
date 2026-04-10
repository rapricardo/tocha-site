import { useState } from 'react';
import { CheckCircle, Play } from 'lucide-react';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

interface VideoPlayerProps {
  videoId: string;
  lessonSlug: string;
  isLoggedIn: boolean;
}

const VideoPlayer = ({ videoId, lessonSlug, isLoggedIn }: VideoPlayerProps) => {
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMarkComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonSlug }),
      });

      if (!res.ok) {
        throw new Error('Falha ao marcar aula');
      }

      setCompleted(true);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'lesson_complete',
        lesson_slug: lessonSlug,
      });
    } catch {
      setError('Erro ao salvar progresso. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Player */}
      <div className="relative w-full bg-black" style={{ aspectRatio: '16/9' }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Video da aula"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Ações */}
      {isLoggedIn && (
        <div className="mt-6 flex items-center gap-4">
          {error && (
            <span className="text-red-400 text-sm">{error}</span>
          )}

          {completed ? (
            <button
              disabled
              className="bg-green-500/10 border border-green-500/30 text-green-500 font-bold py-3 px-6 uppercase tracking-widest text-sm flex items-center gap-2 cursor-default"
            >
              <CheckCircle className="w-4 h-4" />
              Aula concluída
            </button>
          ) : (
            <button
              onClick={handleMarkComplete}
              disabled={loading}
              className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 uppercase tracking-widest text-sm flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                'Salvando...'
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Marcar como concluída
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
