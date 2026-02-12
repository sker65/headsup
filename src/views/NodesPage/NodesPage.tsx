import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useApi } from '../../api/ApiProvider';
import type { V1Node } from '../../api/types';
import { ConfirmDialog } from '../../ui/Dialogs/ConfirmDialog';
import { ServerIndicator } from '../../ui/Server/ServerIndicator';
import { MobileMenuIconButton } from '../../ui/Theme/MobileMenuIconButton';
import { ThemeToggleIconButton } from '../../ui/Theme/ThemeToggleIconButton';
import { useToaster } from '../../ui/Toaster/useToaster';

export function NodesPage() {
  const { api } = useApi();
  const toaster = useToaster();

  const [rows, setRows] = useState<V1Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [renameNode, setRenameNode] = useState<V1Node | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.listNodes();
      setRows(res.nodes ?? []);
    } catch (e) {
      toaster.show(e instanceof Error ? e.message : 'Failed to load nodes', 'error');
    } finally {
      setLoading(false);
    }
  }, [api, toaster]);

  useEffect(() => {
    void load();
  }, [load]);

  const cols = useMemo<GridColDef<V1Node>[]>(
    () => [
      { field: 'id', headerName: 'ID', width: 110 },
      { field: 'name', headerName: 'Name', flex: 1, minWidth: 220 },
      {
        field: 'user',
        headerName: 'User',
        width: 200,
        valueGetter: (_, row) => row.user?.name ?? '-',
      },
      {
        field: 'ipAddresses',
        headerName: 'IPs',
        flex: 1,
        minWidth: 240,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', py: 1 }}>
            {(params.row.ipAddresses ?? []).slice(0, 4).map((ip) => (
              <Chip key={ip} label={ip} size="small" />
            ))}
          </Stack>
        ),
      },
      {
        field: 'online',
        headerName: 'Online',
        width: 110,
        renderCell: (params) => (
          <Chip label={params.row.online ? 'Online' : 'Offline'} color={params.row.online ? 'success' : 'default'} size="small" />
        ),
      },
      { field: 'lastSeen', headerName: 'Last seen', width: 200 },
      {
        field: 'actions',
        headerName: '',
        width: 210,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<EditIcon />}
              onClick={() => {
                setRenameNode(params.row);
                setRenameValue(params.row.name ?? '');
              }}
              disabled={!params.row.id}
            >
              Rename
            </Button>
            <Button
              color="error"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteId(params.row.id ?? null)}
              disabled={!params.row.id}
            >
              Delete
            </Button>
          </Stack>
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
              <Typography variant="h6">Nodes</Typography>
              <Typography variant="body2" color="text.secondary">
                Machines registered in headscale
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <MobileMenuIconButton />
              <ServerIndicator />
              <ThemeToggleIconButton />
              <Button onClick={() => void load()} color="inherit">
                Refresh
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
              getRowId={(r) => r.id ?? `${r.name ?? 'node'}-${Math.random()}`}
              disableRowSelectionOnClick
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25, page: 0 } } }}
            />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete node"
        description="This will remove the node from headscale."
        confirmLabel="Delete"
        danger
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          if (!deleteId) return;
          try {
            await api.deleteNode(deleteId);
            toaster.show('Node deleted', 'success');
            setDeleteId(null);
            await load();
          } catch (e) {
            toaster.show(e instanceof Error ? e.message : 'Failed to delete node', 'error');
          }
        }}
      />

      <Dialog
        open={Boolean(renameNode)}
        onClose={() => {
          setRenameNode(null);
          setRenameValue('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rename node</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Node" value={renameNode?.name ?? '-'} InputProps={{ readOnly: true }} />
            <TextField
              label="New name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setRenameNode(null);
              setRenameValue('');
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!renameNode?.id || !renameValue.trim()}
            onClick={async () => {
              if (!renameNode?.id) return;
              try {
                await api.renameNode(renameNode.id, renameValue.trim());
                toaster.show('Node renamed', 'success');
                setRenameNode(null);
                setRenameValue('');
                await load();
              } catch (e) {
                toaster.show(e instanceof Error ? e.message : 'Failed to rename node', 'error');
              }
            }}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
