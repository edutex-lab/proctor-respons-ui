
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import ExamineeList from './components/ExamineeList';
import ExamInfo from './components/ExamInfo';
import { Outlet } from 'react-router';
export default function ProctoringPage(){
    
    return (<Grid container sx={{
        width:"100%",
         maxWidth:"100%",
         
         }} spacing={2}>
        <Grid 
                size={{xs:12, md:4}}
                sx={{
                    minHeight:"70vh",
                    // border: '1px solid',
                    // borderColor: 'divider',
                    // borderRadius: 1,
                    // bgcolor: 'background.paper',
                    // color: 'text.secondary',
                }}
            >
                <ExamInfo/>
                <ExamineeList/>
            </Grid>
            
            
            <Grid
                size={{xs:12, md: 8}}
                sx={{
                    minHeight:"70vh"
                }}
            >
               <Outlet/>
            </Grid>
        </Grid>
        )
}