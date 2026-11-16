import React, { useState } from 'react';
import { Copy, Check, Terminal, MapPin } from 'lucide-react';
import { Dimension } from '../../types';

interface CoordinateActionsProps {
  x: number;
  y: number;
  z: number;
  dimension: Dimension;
  className?: string;
}

export const CoordinateActions: React.FC<CoordinateActionsProps> = ({
  x,
  y,
  z,
  dimension,
  className = '',
}) => {
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

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

  const rawCoordinates = `X: ${x}, Y: ${y}, Z: ${z}`;
  const teleportCommand = `/execute in ${getDimensionId(dimension)} run tp @s ${x} ${y} ${z}`;

  const handleCopyRaw = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(rawCoordinates);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    } catch (err) {
      console.error('Error al copiar coordenadas:', err);
    }
  };

  const handleCopyCommand = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(teleportCommand);
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    } catch (err) {
      console.error('Error al copiar comando /tp:', err);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Box con los números X, Y, Z bien visibles */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-discord-darkest/90 border border-discord-border/60 font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="text-discord-text-muted text-[11px] font-sans font-bold flex items-center gap-1">
            <MapPin size={13} className="text-emerald-400" />
            Coords:
          </span>
          <div className="flex items-center gap-2 font-bold">
            <span className="text-discord-blurple">X: <span className="text-white">{x}</span></span>
            <span className="text-emerald-400">Y: <span className="text-white">{y}</span></span>
            <span className="text-amber-400">Z: <span className="text-white">{z}</span></span>
          </div>
        </div>

        {/* Botón principal: Copiar Coordenadas solas */}
        <button
          onClick={handleCopyRaw}
          title={`Copiar ${rawCoordinates} al portapapeles`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-sans font-bold transition-all ${
            copiedCoords
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-discord-card hover:bg-discord-hover text-discord-text-normal hover:text-white border border-discord-border/70'
          }`}
        >
          {copiedCoords ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span>¡Copiadas!</span>
            </>
          ) : (
            <>
              <Copy size={12} className="text-emerald-400" />
              <span>Copiar Coordenadas</span>
            </>
          )}
        </button>
      </div>

      {/* Botón secundario: Copiar comando /tp Minecraft */}
      <button
        onClick={handleCopyCommand}
        title={`Copiar comando de teletransporte: ${teleportCommand}`}
        className={`group relative flex items-center justify-between w-full px-3 py-1.5 bg-discord-secondary/70 hover:bg-discord-secondary border border-discord-border/50 hover:border-discord-blurple/50 rounded-lg text-[11px] font-mono text-discord-text-muted hover:text-white transition-all`}
      >
        <div className="flex items-center gap-1.5 truncate">
          <Terminal size={13} className="text-discord-blurple flex-shrink-0" />
          <span className="truncate">{teleportCommand}</span>
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0 font-sans text-xs">
          {copiedCmd ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Check size={12} /> ¡Comando copiado!
            </span>
          ) : (
            <span className="flex items-center gap-1 text-discord-text-muted group-hover:text-white">
              <Copy size={12} /> Copiar /tp
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

// Mantener compatibilidad con CoordinateCopyButton
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
  const textToCopy = variant === 'command' ? command : `X: ${x}, Y: ${y}, Z: ${z}`;

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
      title={`Copiar coordenadas: X: ${x}, Y: ${y}, Z: ${z}`}
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
