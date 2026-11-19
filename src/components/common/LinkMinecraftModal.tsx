import React, { useState } from 'react';
import { Gamepad2, Copy, Check, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { minecraftLinkService } from '../../services/minecraftLinkService';

interface LinkMinecraftModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkMinecraftModal: React.FC<LinkMinecraftModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const newCode = await minecraftLinkService.generateCode();
      setCode(newCode);
    } catch (err: any) {
      setError(err.message || 'No se pudo generar el código. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCommand = () => {
    if (!code) return;
    navigator.clipboard.writeText(`/minecoords link ${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-discord-card border border-discord-border/80 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-discord-blurple/20 border border-discord-blurple/40 flex items-center justify-center text-discord-blurple">
            <Gamepad2 size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Vincular Minecraft con Discord
              <Sparkles size={16} className="text-amber-400" />
            </h3>
            <p className="text-xs text-discord-text-muted">
              Sincroniza tus coordenadas del juego con tu perfil de Discord
            </p>
          </div>
        </div>

        {/* Current Status */}
        {profile?.minecraft_username ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-400">
                  Estado actual
                </p>
                <p className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Vinculado como: <span className="text-emerald-300 font-mono">{profile.minecraft_username}</span>
                </p>
              </div>
            </div>
            <p className="text-xs text-discord-text-muted mt-2">
              Cualquier coordenada que publiques con el mod aparecerá automáticamente con tu perfil de Discord.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-6">
            <p className="text-xs text-discord-text-normal leading-relaxed">
              Genera un código temporal e ingrésalo en Minecraft para asociar tu usuario con esta cuenta de Discord (
              <strong className="text-white">{profile?.username || 'Usuario'}</strong>).
            </p>

            {/* Generated Code Display */}
            {code ? (
              <div className="bg-discord-darkest/90 border border-discord-blurple/50 rounded-xl p-4 text-center">
                <p className="text-[11px] font-semibold text-discord-text-muted uppercase tracking-wider mb-1">
                  Tu código de vinculación (Válido por 15 min)
                </p>
                <div className="text-2xl font-mono font-bold tracking-widest text-discord-blurple my-2 select-all">
                  {code}
                </div>

                <p className="text-xs text-discord-text-muted mb-3">
                  Escribe en el chat de Minecraft:
                </p>

                <button
                  onClick={handleCopyCommand}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-discord-secondary/80 hover:bg-discord-secondary border border-discord-border/80 rounded-lg text-xs font-mono text-white transition-all"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400 font-bold">¡Comando copiado al portapapeles!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="text-discord-text-muted" />
                      <span>/minecoords link {code}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateCode}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-discord-blurple hover:bg-discord-blurple/80 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-discord-blurple/25 flex items-center justify-center gap-2"
              >
                <Gamepad2 size={16} />
                {loading ? 'Generando código...' : 'Generar Código de Vinculación'}
              </button>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            {/* Step by step instructions */}
            <div className="bg-discord-secondary/30 rounded-xl p-3.5 border border-discord-border/50 text-xs space-y-2">
              <p className="font-semibold text-discord-text-header">Pasos para vincular:</p>
              <ol className="list-decimal list-inside space-y-1 text-discord-text-muted">
                <li>Entra a Minecraft con el mod <span className="text-white font-mono">MineCoords</span> instalado.</li>
                <li>Abre el chat o presiona la tecla <span className="text-amber-400 font-bold">K</span>.</li>
                <li>Escribe <span className="text-white font-mono">/minecoords link &lt;CÓDIGO&gt;</span>.</li>
                <li>¡Listo! Tu Discord quedará asociado a tu jugador de por vida.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-discord-border/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-discord-text-muted hover:text-white hover:bg-discord-secondary rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
