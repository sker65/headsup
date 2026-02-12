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
import type { V1User } from '../../api/types';
import { ConfirmDialog } from '../../ui/Dialogs/ConfirmDialog';
import { MobileMenuIconButton } from '../../ui/Theme/MobileMenuIconButton';
import { ThemeToggleIconButton } from '../../ui/Theme/ThemeToggleIconButton';
import { useToaster } from '../../ui/Toaster/useToaster';

export function UsersPage() {
  const { api } = useApi();
  const toaster = useToaster();

  const [rows, setRows] = useState<V1User[]>([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');
  const [createEmail, setCreateEmail] = useState('');

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listUsers();
      setRows(res.users ?? []);
    } catch (e) {
      toaster.show(e instanceof Error ? e.message : 'Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cols = useMemo<GridColDef<V1User>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 110 },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 200 },
      { field: 'displayName', headerName: 'Display Name', flex: 1, minWidth: 220 },
      { field: 'email', headerName: 'Email', flex: 1, minWidth: 240 },
      { field: 'createdAt', headerName: 'Created', width: 200 },
      {
        field: 'actions',
        headerName: '',
        width: 110,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Button
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteId(params.row.id ?? null)}
            disabled={!params.row.id}
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
              <Typography variant="h6">Users</Typography>
              <Typography variant="body2" color="text.secondary">
                Manage headscale users
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <MobileMenuIconButton />
              <ThemeToggleIconButton />
              <Button onClick={load} color="inherit">
                Refresh
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
                Create User
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div style={{ height: 520, width: '100%' }}>
            <DataGrid
              rows={rows}
              loading={loading}
              columns={cols}
              getRowId={(r) => r.id ?? `${r.name ?? 'user'}-${Math.random()}`}
              disableRowSelectionOnClick
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create user</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={createName} onChange={(e) => setCreateName(e.target.value)} required />
            <TextField label="Display name" value={createDisplayName} onChange={(e) => setCreateDisplayName(e.target.value)} />
            <TextField label="Email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
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
                await api.createUser({
                  name: createName,
                  displayName: createDisplayName || undefined,
                  email: createEmail || undefined,
                });
                toaster.show('User created', 'success');
                setCreateOpen(false);
                setCreateName('');
                setCreateDisplayName('');
                setCreateEmail('');
                await load();
              } catch (e) {
                toaster.show(e instanceof Error ? e.message : 'Failed to create user', 'error');
              }
            }}
            disabled={!createName.trim()}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete user"
        description="This will remove the user."
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await api.deleteUser(deleteId);
            toaster.show('User deleted', 'success');
            setDeleteId(null);
            await load();
          } catch (e) {
            toaster.show(e instanceof Error ? e.message : 'Failed to delete user', 'error');
          }
        }}
      />
    </Stack>
  );
}
