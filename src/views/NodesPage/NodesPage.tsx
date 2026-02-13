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
  Tooltip,
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

function formatRelativeTime(iso?: string) {
  if (!iso) return '-';
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;

  const diffMs = Date.now() - t;
  if (diffMs < 0) return 'in the future';

  const sec = Math.floor(diffMs / 1000);
  if (sec < 10) return 'just now';
  if (sec < 60) return `${sec}s ago`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;

  const days = Math.floor(hr / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

export function NodesPage() {
  const { api } = useApi();
  const toaster = useToaster();

  const [rows, setRows] = useState<V1Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [cleanupOpen, setCleanupOpen] = useState(false);

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

  const cleanupCandidates = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return rows.filter((n) => {
      if (!n.id) return false;
      if (n.online !== false) return false;
      if (!n.lastSeen) return false;
      const t = Date.parse(n.lastSeen);
      if (!Number.isFinite(t)) return false;
      return t < cutoff;
    });
  }, [rows]);

  const cleanupDisabled = cleanupCandidates.length === 0;

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
        field: 'tags',
        headerName: 'Tags',
        flex: 1,
        minWidth: 220,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', py: 1 }}>
            {(params.row.tags ?? []).map((t) => (
              <Chip key={t} label={t} size="small" />
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
      {
        field: 'lastSeen',
        headerName: 'Last seen',
        width: 160,
        renderCell: (params) => (
          <Tooltip title={params.row.lastSeen ?? '-'}>
            <span>{formatRelativeTime(params.row.lastSeen)}</span>
          </Tooltip>
        ),
      },
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
              <Tooltip
                title={cleanupDisabled ? 'No offline nodes with Last seen older than 24 hours' : ''}
                disableHoverListener={!cleanupDisabled}
                disableFocusListener={!cleanupDisabled}
                disableTouchListener={!cleanupDisabled}
              >
                <span>
                  <Button onClick={() => setCleanupOpen(true)} color="inherit" disabled={cleanupDisabled}>
                    Cleanup offline
                  </Button>
                </span>
              </Tooltip>
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

      <Dialog open={cleanupOpen} onClose={() => setCleanupOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cleanup offline nodes</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2">
              This will delete <strong>{cleanupCandidates.length}</strong> nodes where <strong>Online = false</strong> and{' '}
              <strong>Last seen</strong> is older than <strong>24 hours</strong>.
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
              {cleanupCandidates.slice(0, 20).map((n) => (
                <Chip key={n.id} label={`#${n.id}${n.name ? ` ${n.name}` : ''}`} size="small" />
              ))}
              {cleanupCandidates.length > 20 ? <Chip label={`+${cleanupCandidates.length - 20} more`} size="small" /> : null}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCleanupOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={async () => {
              const ids = cleanupCandidates
                .map((n) => n.id)
                .filter((id): id is string => Boolean(id));

              if (!ids.length) {
                setCleanupOpen(false);
                return;
              }

              try {
                const results = await Promise.allSettled(ids.map((id) => api.deleteNode(id)));
                const deleted = results.filter((r) => r.status === 'fulfilled').length;
                const failed = results.length - deleted;

                if (failed) {
                  toaster.show(`Deleted ${deleted} nodes, ${failed} failed`, 'warning');
                } else {
                  toaster.show(`Deleted ${deleted} nodes`, 'success');
                }
              } catch (e) {
                toaster.show(e instanceof Error ? e.message : 'Failed to cleanup nodes', 'error');
              } finally {
                setCleanupOpen(false);
                await load();
              }
            }}
            variant="contained"
            color="error"
            disabled={cleanupCandidates.length === 0}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
