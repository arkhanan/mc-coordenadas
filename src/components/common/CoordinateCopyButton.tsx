import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';
import { Dimension } from '../../types';

interface CoordinateCopyButtonProps {
  x: number;
  y: number;
  z: number;
  dimension: Dimension;
  variant?: 'simple' | 'command';
  className?: string;
}

export const CoordinateCopyButton: React.FC<CoordinateCopyButtonProps> = ({
  x,
  y,
  z,
  dimension,
  variant = 'simple',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const getDimensionId = (dim: Dimension) => {
    switch (dim) {
      case 'Nether':
        return 'minecraft:the_nether';
      case 'The End':
        return 'minecraft:the_end';
      default:
        return 'minecraft:overworld';
    }
  };

  const command = `/execute in ${getDimensionId(dimension)} run tp @s ${x} ${y} ${z}`;
  const simpleText = `${x} ${y} ${z}`;
  const textToCopy = variant === 'command' ? command : `/tp ${x} ${y} ${z}`;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar coordenadas:', err);
    }
  };

  if (variant === 'command') {
    return (
      <button
        onClick={handleCopy}
        title="Copiar comando completo de teletransporte"
        className={`group relative flex items-center justify-between w-full px-3 py-2 bg-discord-darkest/70 hover:bg-discord-darkest border border-discord-border/50 hover:border-discord-blurple/50 rounded-lg text-xs font-mono text-discord-text-muted hover:text-white transition-all ${className}`}
      >
        <div className="flex items-center gap-2 truncate">
          <Terminal size={14} className="text-discord-blurple flex-shrink-0" />
          <span className="truncate">{command}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-2 text-xs flex-shrink-0 font-sans">
          {copied ? (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Check size={13} /> ¡Copiado!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-discord-text-muted group-hover:text-white">
              <Copy size={13} /> Copiar
            </span>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      title={`Copiar /tp ${x} ${y} ${z}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-discord-card/80 hover:bg-discord-secondary border border-discord-border/60 hover:border-discord-blurple/50 text-discord-text-normal hover:text-white font-mono text-xs transition-colors ${className}`}
    >
      <span className="font-semibold text-discord-blurple">XYZ:</span>
      <span>{simpleText}</span>
      {copied ? (
        <Check size={13} className="text-emerald-400 ml-1" />
      ) : (
        <Copy size={13} className="text-discord-text-muted ml-1 opacity-70 group-hover:opacity-100" />
      )}
    </button>
  );
};
