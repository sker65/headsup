import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../../api/ApiProvider';
import type { ListApiKeysResponse } from '../../api/types';
import { ConfirmDialog } from '../../ui/Dialogs/ConfirmDialog';
import { SecretRevealDialog } from '../../ui/Dialogs/SecretRevealDialog';
import { MobileMenuIconButton } from '../../ui/Theme/MobileMenuIconButton';
import { ThemeToggleIconButton } from '../../ui/Theme/ThemeToggleIconButton';
import { useToaster } from '../../ui/Toaster/useToaster';

type ApiKeyRow = NonNullable<ListApiKeysResponse['apiKeys']>[number];

export function ApiKeysPage() {
  const { api } = useApi();
  const toaster = useToaster();

  const [rows, setRows] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [expiration, setExpiration] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<{ prefix: string; id?: string } | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listApiKeys();
      setRows(res.apiKeys ?? []);
    } catch (e) {
      toaster.show(e instanceof Error ? e.message : 'Failed to load api keys', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cols = useMemo<GridColDef<ApiKeyRow>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 110 },
      { field: 'prefix', headerName: 'Prefix', width: 220 },
      { field: 'createdAt', headerName: 'Created', width: 200 },
      { field: 'lastSeen', headerName: 'Last seen', width: 200 },
      { field: 'expiration', headerName: 'Expiration', width: 200 },
      {
        field: 'actions',
        headerName: '',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (!params.row.prefix) return;
              setDeleteTarget({ prefix: params.row.prefix, id: params.row.id });
            }}
            disabled={!params.row.prefix}
          >
            Delete
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Box>
              <Typography variant="h6">API Keys</Typography>
              <Typography variant="body2" color="text.secondary">
                Keys for headscale API access
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <MobileMenuIconButton />
              <ThemeToggleIconButton />
              <Button onClick={load} color="inherit">
                Refresh
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                Create key
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div style={{ height: 580, width: '100%' }}>
            <DataGrid
              rows={rows}
              loading={loading}
              columns={cols}
              getRowId={(r) => r.id ?? `${r.prefix ?? 'k'}-${Math.random()}`}
              disableRowSelectionOnClick
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create API key</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Expiration"
              type="datetime-local"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty for no/ default expiration"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              try {
                const res = await api.createApiKey({
                  expiration: expiration ? new Date(expiration).toISOString() : undefined,
                });
                if (res.apiKey) setRevealedSecret(res.apiKey);
                toaster.show('API key created', 'success');
                setCreateOpen(false);
                setExpiration('');
                await load();
              } catch (e) {
                toaster.show(e instanceof Error ? e.message : 'Failed to create api key', 'error');
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete API key"
        description="This key will be deleted."
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          try {
            await api.deleteApiKey(deleteTarget.prefix, deleteTarget.id);
            toaster.show('API key deleted', 'success');
            setDeleteTarget(null);
            await load();
          } catch (e) {
            toaster.show(e instanceof Error ? e.message : 'Failed to delete api key', 'error');
          }
        }}
      />

      <SecretRevealDialog
        open={Boolean(revealedSecret)}
        title="API key created"
        secretLabel="API key"
        secret={revealedSecret ?? ''}
        onCopy={() => toaster.show('Copied to clipboard', 'success')}
        onClose={() => setRevealedSecret(null)}
      />
    </Stack>
  );
}
