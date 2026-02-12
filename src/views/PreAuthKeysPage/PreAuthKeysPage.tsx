import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import { useApi } from '../../api/ApiProvider';
import type { V1PreAuthKey, V1User } from '../../api/types';
import { ConfirmDialog } from '../../ui/Dialogs/ConfirmDialog';
import { SecretRevealDialog } from '../../ui/Dialogs/SecretRevealDialog';
import { ServerIndicator } from '../../ui/Server/ServerIndicator';
import { MobileMenuIconButton } from '../../ui/Theme/MobileMenuIconButton';
import { ThemeToggleIconButton } from '../../ui/Theme/ThemeToggleIconButton';
import { useToaster } from '../../ui/Toaster/useToaster';

export function PreAuthKeysPage() {
  const { api } = useApi();
  const toaster = useToaster();

  const [rows, setRows] = useState<V1PreAuthKey[]>([]);
  const [users, setUsers] = useState<V1User[]>([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createUser, setCreateUser] = useState<V1User | null>(null);
  const [reusable, setReusable] = useState(false);
  const [ephemeral, setEphemeral] = useState(false);
  const [expiration, setExpiration] = useState<string>('');
  const [aclTags, setAclTags] = useState<string[]>([]);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [k, u] = await Promise.all([api.listPreAuthKeys(), api.listUsers()]);
      setRows(k.preAuthKeys ?? []);
      setUsers(u.users ?? []);
    } catch (e) {
      toaster.show(e instanceof Error ? e.message : 'Failed to load preauth keys', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cols = useMemo<GridColDef<V1PreAuthKey>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 110 },
      {
        field: 'user',
        headerName: 'User',
        width: 220,
        valueGetter: (_, row) => row.user?.name ?? '-',
      },
      { field: 'reusable', headerName: 'Reusable', width: 110 },
      { field: 'ephemeral', headerName: 'Ephemeral', width: 120 },
      { field: 'used', headerName: 'Used', width: 90 },
      { field: 'expiration', headerName: 'Expiration', width: 200 },
      {
        field: 'aclTags',
        headerName: 'ACL Tags',
        flex: 1,
        minWidth: 240,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', py: 1 }}>
            {(params.row.aclTags ?? []).map((t) => (
              <Chip key={t} label={t} size="small" />
            ))}
          </Stack>
        ),
      },
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
              <Typography variant="h6">PreAuth Keys</Typography>
              <Typography variant="body2" color="text.secondary">
                Create and manage enrollment keys
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <MobileMenuIconButton />
              <ServerIndicator />
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
              getRowId={(r) => r.id ?? `${r.user?.id ?? 'k'}-${Math.random()}`}
              disableRowSelectionOnClick
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create preauth key</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Autocomplete
              options={users}
              getOptionLabel={(u) => `${u.name ?? ''}${u.id ? ` (#${u.id})` : ''}`}
              value={createUser}
              onChange={(_, v) => setCreateUser(v)}
              renderInput={(params) => <TextField {...params} label="User" required />}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <FormControlLabel control={<Switch checked={reusable} onChange={(e) => setReusable(e.target.checked)} />} label="Reusable" />
              <FormControlLabel control={<Switch checked={ephemeral} onChange={(e) => setEphemeral(e.target.checked)} />} label="Ephemeral" />
            </Stack>
            <TextField
              label="Expiration"
              type="datetime-local"
              value={expiration}
              onChange={(e) => setExpiration(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText="Leave empty for server default"
            />
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={aclTags}
              onChange={(_, v) => setAclTags(v)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => <Chip variant="outlined" label={option} {...getTagProps({ index })} key={option} />)
              }
              renderInput={(params) => <TextField {...params} label="ACL tags" placeholder="tag:admin" />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!createUser?.id}
            onClick={async () => {
              try {
                const res = await api.createPreAuthKey({
                  user: createUser?.id,
                  reusable,
                  ephemeral,
                  expiration: expiration ? new Date(expiration).toISOString() : undefined,
                  aclTags: aclTags.length ? aclTags : undefined,
                });
                const secret = res.preAuthKey?.key;
                if (!secret) {
                  toaster.show('Key created, but secret was not returned by server', 'warning');
                } else {
                  setRevealedSecret(secret);
                }

                toaster.show('Preauth key created', 'success');
                setCreateOpen(false);
                setReusable(false);
                setEphemeral(false);
                setExpiration('');
                setAclTags([]);
                await load();
              } catch (e) {
                toaster.show(e instanceof Error ? e.message : 'Failed to create preauth key', 'error');
              }
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete preauth key"
        description="This key will be deleted."
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await api.deletePreAuthKey(deleteId);
            toaster.show('Preauth key deleted', 'success');
            setDeleteId(null);
            await load();
          } catch (e) {
            toaster.show(e instanceof Error ? e.message : 'Failed to delete preauth key', 'error');
          }
        }}
      />

      <SecretRevealDialog
        open={Boolean(revealedSecret)}
        title="Preauth key created"
        secretLabel="Preauth key"
        secret={revealedSecret ?? ''}
        onCopy={() => toaster.show('Copied to clipboard', 'success')}
        onClose={() => setRevealedSecret(null)}
      />
    </Stack>
  );
}
