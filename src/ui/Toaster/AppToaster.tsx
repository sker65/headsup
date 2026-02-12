import { Alert, Snackbar } from '@mui/material';
import { useToaster } from './useToaster';

export function AppToaster() {
  const { state, hide } = useToaster();

  return (
    <Snackbar
      open={state.open}
      autoHideDuration={4500}
      onClose={hide}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={hide} severity={state.severity} variant="filled" sx={{ width: '100%' }}>
        {state.message}
      </Alert>
    </Snackbar>
  );
}
