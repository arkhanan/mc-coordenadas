import React, { createContext, useContext, useEffect, useState } from 'react';
import { ServerConfig, serverConfigService } from '../services/serverConfigService';

interface ServerConfigContextType {
  config: ServerConfig;
  isLoading: boolean;
  updateConfig: (newConfig: Partial<ServerConfig>) => Promise<ServerConfig>;
  reloadConfig: () => Promise<void>;
}

const ServerConfigContext = createContext<ServerConfigContextType | undefined>(undefined);

export const ServerConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ServerConfig>({
    server_ip: import.meta.env.VITE_MC_SERVER_IP || 'play.minecraft-comunidad.net',
    server_name: import.meta.env.VITE_APP_NAME || 'MineCoords Community',
    server_version: import.meta.env.VITE_MC_SERVER_VERSION || '26.3 Survival',
    maintenance_mode: false,
    maintenance_message: 'La plataforma se encuentra en mantenimiento temporal. Solo el equipo de Staff tiene acceso.',
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadConfig = async () => {
    try {
      const data = await serverConfigService.getConfig();
      setConfig(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const updateConfig = async (newConfig: Partial<ServerConfig>) => {
    const updated = await serverConfigService.updateConfig(newConfig);
    setConfig(updated);
    return updated;
  };

  return (
    <ServerConfigContext.Provider
      value={{
        config,
        isLoading,
        updateConfig,
        reloadConfig: loadConfig,
      }}
    >
      {children}
    </ServerConfigContext.Provider>
  );
};

export const useServerConfig = () => {
  const context = useContext(ServerConfigContext);
  if (!context) {
    throw new Error('useServerConfig debe ser usado dentro de un ServerConfigProvider');
  }
  return context;
};
