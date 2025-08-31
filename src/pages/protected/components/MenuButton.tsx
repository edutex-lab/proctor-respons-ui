import * as React from 'react';
import Badge, { badgeClasses } from '@mui/material/Badge';
import IconButton, { type IconButtonProps } from '@mui/material/IconButton';

export interface MenuButtonProps extends IconButtonProps {
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
}

export default function MenuButton({
  showBadge = false,
  badgeContent=0,
  ...props
}: MenuButtonProps) {
  return (
    <Badge
      color="error"
      variant="standard"
      badgeContent={badgeContent}
      invisible={!showBadge}
      sx={{ [`& .${badgeClasses.badge}`]: { right: 2, top: 2 } }}
    >
      <IconButton size="small" {...props} />
    </Badge>
  );
}
