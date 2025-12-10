import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
// import CustomDatePicker from './CustomDatePicker';
import NavbarBreadcrumbs from './NavbarBreadcrumbs';
import MenuButton from './MenuButton';
import { useAuth } from '../../../auth/AuthProvider';
import { useVerification } from '../../../data/VerificationProvider';
// import OptionsMenu from './OptionsMenu';
// import ColorModeIconDropdown from '.././theme/ColorModeIconDropdown';

// import Search from './Search';

export default function Header() {
  const { user } = useAuth();
  const { data, setDialogOpen, setVerificationType } = useVerification();

  const handleReview = (type: string) => {
    setVerificationType(type);
    setDialogOpen(true);
  };
  return (
    <Stack
      direction="row"
      sx={{
        display: { xs: 'flex' },
        width: '100%',
        alignItems: { xs: 'center' },
        justifyContent: 'space-between',
        maxWidth: { sm: '100%', md: '1700px' },
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
      spacing={2}
    >
      <NavbarBreadcrumbs />
      <Stack direction="row" sx={{ gap: 1 }}>
        {/* <Search /> */}
        {/* <CustomDatePicker /> */}
        <MenuButton onClick={() => { handleReview('all') }} showBadge={data?.length > 0} badgeContent={data?.length} aria-label="Open notifications">
          <NotificationsRoundedIcon />
        </MenuButton>

        {/* <ColorModeIconDropdown /> */}
        <Stack
          direction="row"
          sx={{
            // p: 2,
            gap: 1,
            // alignItems: 'center',
            // borderTop: '1px solid',
            // borderColor: 'divider',
          }}
        >
          <Avatar
            sizes="small"
            alt={user?.displayName ?? 'A'}
            src={user?.photoURL ?? ''}
            sx={{ width: 36, height: 36 }}
          />
          <Box sx={{ mr: 'auto' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: '16px' }}>
              {user?.displayName ?? ''}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.email?.split('@')[0] ?? ''}
            </Typography>
          </Box>
          {/* <OptionsMenu /> */}
        </Stack>
      </Stack>
    </Stack>
  );
}
