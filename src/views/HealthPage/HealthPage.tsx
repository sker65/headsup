import { Box, Card, CardContent, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useApi } from '../../api/ApiProvider';
import { MobileMenuIconButton } from '../../ui/Theme/MobileMenuIconButton';
import { ThemeToggleIconButton } from '../../ui/Theme/ThemeToggleIconButton';
import { useToaster } from '../../ui/Toaster/useToaster';

export function HealthPage() {
  const { api } = useApi();
  const toaster = useToaster();
  const [dbOk, setDbOk] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .health()
      .then((r) => {
        if (!mounted) return;
        setDbOk(Boolean(r.databaseConnectivity));
      })
      .catch((e) => {
        toaster.show(e instanceof Error ? e.message : 'Health check failed', 'error');
        setDbOk(false);
      });
    return () => {
      mounted = false;
    };
  }, [api, toaster]);

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h6">Health</Typography>
              <Typography variant="body2" color="text.secondary">
                Server status
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <MobileMenuIconButton />
              <ThemeToggleIconButton />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography color="text.secondary">
            Database connectivity: {dbOk === null ? '...' : dbOk ? 'OK' : 'Failed'}
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
