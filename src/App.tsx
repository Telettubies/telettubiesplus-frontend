import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/shared/hooks/useAuth';
import { ThemeProvider } from '@/shared/hooks/useTheme';
import { AppRouter } from '@/routes/AppRouter';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

