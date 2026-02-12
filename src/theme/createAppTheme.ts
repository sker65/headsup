import { createTheme } from '@mui/material/styles';
import type { ColorMode } from './colorMode';

export function createAppTheme(mode: ColorMode) {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#7c5cff',
      },
      secondary: {
        main: '#2dd4bf',
      },
      ...(mode === 'light'
        ? {
            background: {
              default: '#f6f7fb',
              paper: '#ffffff',
            },
          }
        : {
            background: {
              default: '#0b0b10',
              paper: '#12121a',
            },
          }),
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    },
  });
}
