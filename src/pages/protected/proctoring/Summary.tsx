import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useVerification } from "../../../data/VerificationProvider";
import WarningIcon from '@mui/icons-material/Warning';
import Button from "@mui/material/Button";
import ViewIcon from "@mui/icons-material/Visibility";
import CircularProgress from "@mui/material/CircularProgress";
export default function Summary(){
        const {data, setDialogOpen} = useVerification()
     return <Box sx={{ width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection :"column"}}>
           
             {data.length > 0?
              <>
                <WarningIcon  sx={{color:"red", fontSize:100}}/>
             <Typography variant="h6" sx={{my:1}}>  Suspicious or Dishonest Activity Detected!</Typography>
             <Button variant="contained" sx={{my:1}} onClick={()=>setDialogOpen(true)}>Review {data.length} Activit{data.length === 1 ? 'y' : 'ies'} </Button>
          
             </>
             :
             <>
            <ViewIcon  sx={{color:"green", fontSize:100}}/>
            <Typography variant="h6" sx={{my:1}}><CircularProgress size={20}/> Waiting for Suspicious or Dishonest Activity!</Typography>
            
             </>
            
             }
            </Box>
}