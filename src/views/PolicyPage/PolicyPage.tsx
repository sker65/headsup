import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useApi } from '../../api/ApiProvider';
import { MobileMenuIconButton } from '../../ui/Theme/MobileMenuIconButton';
import { ThemeToggleIconButton } from '../../ui/Theme/ThemeToggleIconButton';
import { useToaster } from '../../ui/Toaster/useToaster';

export function PolicyPage() {
  const { api } = useApi();
  const toaster = useToaster();

  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.getPolicy();
      setPolicy(res.policy ?? '');
    } catch (e) {
      toaster.show(e instanceof Error ? e.message : 'Failed to load policy', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h6">Policy</Typography>
              <Typography variant="body2" color="text.secondary">
                View and update ACL policy
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <MobileMenuIconButton />
              <ThemeToggleIconButton />
              <Button onClick={load} color="inherit">
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await api.setPolicy({ policy });
                    toaster.show('Policy saved', 'success');
                  } catch (e) {
                    toaster.show(e instanceof Error ? e.message : 'Failed to save policy', 'error');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <TextField
            value={policy}
            onChange={(e) => setPolicy(e.target.value)}
            placeholder="{" 
            label="Policy"
            multiline
            minRows={18}
            fullWidth
            disabled={loading}
            InputProps={{ sx: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' } }}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
