import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import AppTheme from './theme/AppTheme.tsx';
import PublicLayout from './pages/public/PublicLayout.tsx';
import SignInPage from './pages/public/signin/SignInPage.tsx';
import ProtectedLayout from './pages/protected/ProtectedLayout.tsx';
import HomePage from './pages/protected/home/HomePage.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';
import SignInByToken from './pages/public/signin/SignInByToken.tsx';
import ProctoringPage from './pages/protected/proctoring/ProctoringPage.tsx';
import Summary from './pages/protected/proctoring/Summary.tsx';
import Detail from './pages/protected/proctoring/Detail.tsx';
import {SnackbarProvider} from 'notistack';
const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
      <AppTheme>
      <CssBaseline/>
      <SnackbarProvider autoHideDuration={3000} anchorOrigin={{
    vertical: 'bottom',
    horizontal: 'right',
  }}>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedLayout/>} >
              <Route index element={<HomePage/>}/>
              <Route path="/proctoring/:examId/room/:roomId" element={<ProctoringPage/>}>
                <Route index element={<Summary/>}/>
                <Route path="user/:userId" element={<Detail/>}/>
              </Route>
          </Route>
          <Route element={<PublicLayout/>}>
              <Route path='sign-in' element={<SignInPage/>}/>
              <Route path='sign-in-by-token' element={<SignInByToken/>}/>
          </Route>
           <Route path="*" element={<h1>404 Not Found</h1>} />
        </Routes>
      </BrowserRouter>
      </SnackbarProvider>
      </AppTheme>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
)
