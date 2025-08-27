import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  margin: theme.spacing(1, 0),
  [`& .${breadcrumbsClasses.separator}`]: {
    color: (theme.vars || theme).palette.action.disabled,
    margin: 1,
  },
  [`& .${breadcrumbsClasses.ol}`]: {
    alignItems: 'center',
  },
}));

export default function NavbarBreadcrumbs() {
  const [lmsBackUrl, setLmsBackUrl] = React.useState<string>('https://edunex.itb.ac.id/exam');

  React.useEffect(() => {
    // Get LMS back URL from session storage
    const storedUrl = window.sessionStorage.getItem('lms-back-url');
    if (storedUrl) {
      setLmsBackUrl(storedUrl);
    }
  }, []);

  return (
    <StyledBreadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNextRoundedIcon fontSize="small" />}
    >
      <Link underline="hover" color="inherit" href={lmsBackUrl}>
        Back to LMS
      </Link>
      <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
        Proctoring Dashboard
      </Typography>
    </StyledBreadcrumbs>
  );
}
