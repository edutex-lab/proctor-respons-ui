import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useVerification } from "../../../data/VerificationProvider";
import WarningIcon from '@mui/icons-material/Warning';
import Button from "@mui/material/Button";
import ViewIcon from "@mui/icons-material/Visibility";
import CircularProgress from "@mui/material/CircularProgress";
export default function Summary() {
        const { data, setDialogOpen, setVerificationType } = useVerification();

        const suspiciousCount = data.filter(d => d.multiClassificationResult?.final_decision === 'Suspicious').length;
        const dishonestCount = data.filter(d => d.multiClassificationResult?.final_decision === 'Dishonest').length;

        const handleReview = (type: string) => {
                setVerificationType(type);
                setDialogOpen(true);
        };

        return <Box sx={{ width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: "column" }}>

                {data.length > 0 ?
                        <>
                                <WarningIcon sx={{ color: "red", fontSize: 100 }} />
                                <Typography variant="h6" sx={{ my: 1 }}>  Suspicious or Dishonest Activity Detected!</Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: 300 }}>
                                        {dishonestCount > 0 && (
                                                <Button
                                                        variant="contained"
                                                        color="error"
                                                        onClick={() => handleReview('Dishonest')}
                                                >
                                                        Review {dishonestCount} Dishonest Activit{dishonestCount === 1 ? 'y' : 'ies'}
                                                </Button>
                                        )}
                                        {suspiciousCount > 0 && (
                                                <Button
                                                        variant="contained"
                                                        color="warning"
                                                        onClick={() => handleReview('Suspicious')}
                                                        sx={{ color: 'white' }}
                                                >
                                                        Review {suspiciousCount} Suspicious Activit{suspiciousCount === 1 ? 'y' : 'ies'}
                                                </Button>
                                        )}
                                        <Button
                                                variant="outlined"
                                                onClick={() => handleReview('all')}
                                        >
                                                Review All ({data.length})
                                        </Button>
                                </Box>

                        </>
                        :
                        <>
                                <ViewIcon sx={{ color: "green", fontSize: 100 }} />
                                <Typography variant="h6" sx={{ my: 1 }}><CircularProgress size={20} /> Waiting for Suspicious or Dishonest Activity!</Typography>

                        </>

                }
        </Box>
}