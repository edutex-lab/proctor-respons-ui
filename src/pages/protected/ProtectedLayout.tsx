
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import AppNavbar from './components/AppNavbar';
import Header from './components/Header';
// import SideMenu from './components/SideMenu';
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../auth/AuthProvider';
import VerificationProvider from '../../data/VerificationProvider';

export default function ProtectedLayout() {

 const {user} = useAuth();
  if (!user) {
    
    // redirect to signin and save current path
    return (
      <Navigate
        to={`/sign-in?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  
  }
  return (
  <VerificationProvider>
      <Box sx={{ 
        display: 'flex',
        flexDirection:'column',
        px: 2,
         }}>
        {/* <SideMenu /> */}
        {/* <AppNavbar /> */}
        {/* Main content */}
        <Header />
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              // mt: { xs: 8 },
            }}
          >
            
            <Outlet/>
          </Stack>
        </Box>
      </Box>
      </VerificationProvider>
  );
}

