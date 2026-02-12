import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
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

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.listNodes();
      setRows(res.nodes ?? []);
    } catch (e) {
      toaster.show(e instanceof Error ? e.message : 'Failed to load nodes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
              <Typography variant="h6">Nodes</Typography>
              <Typography variant="body2" color="text.secondary">
                Machines registered in headscale
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <MobileMenuIconButton />
              <ServerIndicator />
              <ThemeToggleIconButton />
              <Button onClick={load} color="inherit">
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
    </Stack>
  );
}
