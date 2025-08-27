import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Summary(){

    return <Box
      sx={{ width: '100%', 
        // height: 400, maxWidth: 360, 
        px:1,
        // bgcolor: 'background.paper'
    }}
    ><Typography variant="h6">Summary</Typography></Box>
}