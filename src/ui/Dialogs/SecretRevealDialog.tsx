import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

export function SecretRevealDialog(props: {
  open: boolean;
  title: string;
  secretLabel: string;
  secret: string;
  onClose: () => void;
  onCopy?: () => void;
}) {
  const { open, title, secretLabel, secret, onClose, onCopy } = props;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="warning" variant="outlined">
            This secret is shown only once. Copy it now.
          </Alert>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {secretLabel}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.75 }}>
              <TextField value={secret} fullWidth inputProps={{ readOnly: true }} />
              <Tooltip title="Copy">
                <IconButton
                  onClick={async () => {
                    await navigator.clipboard.writeText(secret);
                    onCopy?.();
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}
