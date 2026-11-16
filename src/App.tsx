import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoordinatesPage } from './pages/CoordinatesPage';
import { CreateCoordinatePage } from './pages/CreateCoordinatePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { ModerationPage } from './pages/ModerationPage';
import { AdminPage } from './pages/AdminPage';

const AppRoutes: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-discord-bg flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-discord-blurple border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-discord-text-muted font-bold tracking-wider uppercase">
          Iniciando plataforma de Minecraft...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="coordenadas" element={<CoordinatesPage />} />
        <Route path="coordenadas/crear" element={<CreateCoordinatePage />} />
        <Route path="proyectos" element={<ProjectsPage />} />
        <Route path="proyectos/crear" element={<CreateProjectPage />} />
        <Route path="moderacion" element={<ModerationPage />} />
        <Route path="administracion" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
