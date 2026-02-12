import { Box, Chip, Tooltip } from '@mui/material';
import { useMemo } from 'react';
import { getBaseUrl } from '../../api/config';

function formatBaseUrl(baseUrl: string) {
  try {
    const u = new URL(baseUrl);
    return u.host;
  } catch {
    return baseUrl;
  }
}

export function ServerIndicator() {
  const info = useMemo(() => {
    try {
      const baseUrl = getBaseUrl();
      return { baseUrl, host: formatBaseUrl(baseUrl) };
    } catch {
      return null;
    }
  }, []);

  if (!info) {
    return (
      <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
        <Chip
          label="Server: not configured"
          size="small"
          variant="outlined"
          sx={{ display: 'flex' }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Tooltip title={info.baseUrl}>
        <Chip label={`Server: ${info.host}`} size="small" variant="outlined" sx={{ display: 'flex' }} />
      </Tooltip>
    </Box>
  );
}
