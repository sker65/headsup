import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/router';
import { ToasterProvider } from './ui/Toaster/useToaster';
import { ColorModeProvider, useColorMode } from './theme/colorMode';
import { createAppTheme } from './theme/createAppTheme';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing #root element');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <ColorModeProvider>
      <ToasterProvider>
        <AppThemedRouter />
      </ToasterProvider>
    </ColorModeProvider>
  </React.StrictMode>,
);

function AppThemedRouter() {
  const { mode } = useColorMode();
  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
