import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../ui/AppShell/AppShell';
import { HealthPage } from '../views/HealthPage/HealthPage';
import { UsersPage } from '../views/UsersPage/UsersPage';
import { NodesPage } from '../views/NodesPage/NodesPage';
import { PreAuthKeysPage } from '../views/PreAuthKeysPage/PreAuthKeysPage';
import { ApiKeysPage } from '../views/ApiKeysPage/ApiKeysPage';
import { PolicyPage } from '../views/PolicyPage/PolicyPage';

export const router: ReturnType<typeof createBrowserRouter> = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />, 
    children: [
      { index: true, element: <Navigate to="/nodes" replace /> },
      { path: 'health', element: <HealthPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'nodes', element: <NodesPage /> },
      { path: 'preauth-keys', element: <PreAuthKeysPage /> },
      { path: 'api-keys', element: <ApiKeysPage /> },
      { path: 'policy', element: <PolicyPage /> },
    ],
  },
]);
