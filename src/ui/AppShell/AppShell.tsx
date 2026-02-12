import React, { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import PeopleIcon from '@mui/icons-material/People';
import DevicesIcon from '@mui/icons-material/Devices';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import KeyIcon from '@mui/icons-material/Key';
import PolicyIcon from '@mui/icons-material/Policy';
import { AppToaster } from '../Toaster/AppToaster';
import { ApiProvider } from '../../api/ApiProvider';
import { MobileNavContext } from './mobileNav';

const drawerWidth = 270;

type NavItem = {
  label: string;
  path: string;
  icon: React.ReactNode;
};

export function AppShell() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: 'Nodes', path: '/nodes', icon: <DevicesIcon /> },
      { label: 'Users', path: '/users', icon: <PeopleIcon /> },
      { label: 'PreAuth Keys', path: '/preauth-keys', icon: <VpnKeyIcon /> },
      { label: 'API Keys', path: '/api-keys', icon: <KeyIcon /> },
      { label: 'Policy', path: '/policy', icon: <PolicyIcon /> },
      { label: 'Health', path: '/health', icon: <MonitorHeartIcon /> },
    ],
    [],
  );

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.25, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
          HeadsUp
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Headscale UI
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 42 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Box sx={{ flex: 1 }} />
      <Divider />
      <Box sx={{ px: 2.25, py: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Configure via env vars: BASE_URL + APIKEY
        </Typography>
      </Box>
    </Box>
  );

  return (
    <ApiProvider>
      <MobileNavContext.Provider value={{ open: () => setMobileOpen(true) }}>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>

        <Box
          component="nav"
          sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
          aria-label="navigation"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: drawerWidth,
                borderRight: '1px solid rgba(255,255,255,0.08)',
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
          <Container maxWidth={false} sx={{ py: 3 }}>
            <Outlet />
          </Container>
        </Box>

        <AppToaster />
        </Box>
      </MobileNavContext.Provider>
    </ApiProvider>
  );
}
