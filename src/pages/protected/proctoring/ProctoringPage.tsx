
import Grid from '@mui/material/Grid';
import ExamineeList from './components/ExamineeList';
import ExamInfo from './components/ExamInfo';
import { Outlet} from 'react-router';
import VerificationDialog from './components/VerificationDialog';
import { useVerification } from '../../../data/VerificationProvider';
import SendWarningDialog from './components/SendWarningDialog';
export default function ProctoringPage(){
    const {dialogOpen, setDialogOpen, data, warningDialogOpen, setWarningDialogOpen} = useVerification();

    return (<><Grid container sx={{
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
        <VerificationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} data={data}/>
        <SendWarningDialog open={warningDialogOpen} onClose={() => setWarningDialogOpen(false)}  />
        </>
        )
}