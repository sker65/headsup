import MenuIcon from '@mui/icons-material/Menu';
import { IconButton, Tooltip } from '@mui/material';
import { useMobileNav } from '../AppShell/mobileNav';

export function MobileMenuIconButton() {
  const { open } = useMobileNav();

  return (
    <Tooltip title="Menu">
      <IconButton onClick={open} sx={{ display: { md: 'none' } }}>
        <MenuIcon />
      </IconButton>
    </Tooltip>
  );
}
