import * as React from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Breadcrumbs, { breadcrumbsClasses } from '@mui/material/Breadcrumbs';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { useLocation, Link as RouterLink } from 'react-router';

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

const breadcrumbs: Record<string, string> = {
  "proctoring": "Proctoring Dashboard",
  "room": "Room",
  "user": "Examinee Log"
}

export default function NavbarBreadcrumbs() {
  const location = useLocation();
  const [lmsBackUrl, setLmsBackUrl] = React.useState<string>('https://edunex.itb.ac.id/exam');
   const pathnames = location.pathname.split("/").filter((x) => x);

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
         {/* Generate dynamic breadcrumbs */}
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 2).join("/")}`;
        const isLast = index === pathnames.length - 1;
       
        if(!isNaN(Number(value))){
          return null;
        }
        return isLast || index === 0 ? (
          <Typography
            key={to}
            variant="body1"
            sx={{ color: "text.primary", fontWeight: 600 }}
          >
            {breadcrumbs[`${decodeURIComponent(value)}`]}
          </Typography>
        ) : (
          <Link
            component={RouterLink}
            underline="hover"
            color="inherit"
            to={to}
            key={to}
          >
            {breadcrumbs[decodeURIComponent(value)]}
          </Link>
        );
      })}
    </StyledBreadcrumbs>
  );
}
