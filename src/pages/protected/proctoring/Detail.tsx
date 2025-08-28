import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { memo, useEffect, useState } from "react";
import type { Screenshot } from "../../../data/data.types";
import { getAppDataServices } from "../../../data";
import { useParams } from "react-router";
import { FixedSizeList, type ListChildComponentProps } from "react-window";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import Chip, { type ChipProps } from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { useSnackbar } from "notistack";


// --- Helper function to get chip color based on decision
const getChipAppearance = (decision:string) => {
  switch (decision) {
    case 'Suspicious':
      return { color: 'default', icon: <WarningIcon /> };
    case 'Dishonest':
        return { color: 'error', icon: <WarningIcon /> };
    case 'Cean':
    default:
      return { color: 'success', icon: <CheckCircleIcon /> };
  }
};


// ##########################################################################
// ##  LogItem: Renders a single screenshot log                          ##
// ##########################################################################
const LogItem = memo((props: ListChildComponentProps) => {
const { index , style, data }:{data:Screenshot[], index:number, style:React.CSSProperties} = props;
  const log = data[index];
  // State for the editable proctor classification
  const [proctorDecision, setProctorDecision] = useState(log?.proctorClassificationResult?.final_decision ??'Decision');
  const [proctorCategory, setProctorCategory] = useState(log?.proctorClassificationResult?.category ??'Category');
  // State for the saving button)
  const [isSaving, setIsSaving] = useState(false);
    const {enqueueSnackbar} = useSnackbar();
  // Construct the full image URL from bucket and path
   const encodedPath = encodeURIComponent(log?.filePath);
const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${log?.fileBucket}/o/${encodedPath}?alt=media`;


//   // --- Binary Classification (1st Stage) ---
//   const binaryResult = {
//     label: log.binaryClassificationResult.label === 0 ? 'Non Exam Screens' : 'Suspicious',
//     probability: (log.binaryClassificationResult.result_prob * 100).toFixed(2),
//   };
//   const binaryChip = getChipAppearance(binaryResult.label);


  // --- Multi-Classification (2nd Stage) ---
  const multiResult = log.multiClassificationResult;
  const multiChip = getChipAppearance(multiResult?.final_decision ??'');

  // --- Proctor Classification (Human Verification) ---
  const handleProctorSave = async () => {
    if(isSaving) return;

    if(proctorCategory === "Category"){
        enqueueSnackbar("Please select a category", {variant:'warning'});
        return;
    }

    if(proctorDecision === "Decision"){
        enqueueSnackbar("Please select a decision", {variant:'warning'});
        return;
    }

    console.log(proctorCategory, proctorDecision)
    // console.log(log)
    setIsSaving(true);
    // Simulate an API call
    await getAppDataServices().setProctorClassificationResult(log.id, { final_decision: proctorDecision })
    
    setIsSaving(false);
    enqueueSnackbar(`Proctor verification saved!`,{variant:'success'});
    
  };
// Format the timestamp for the title ---
  const createdAtDate = new Date(log.createdAt.toMillis());
  const formattedTitle = createdAtDate.toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'medium'
  });

  return (
    <div style={style}>
      <Card sx={{ m: 1.5, display: 'flex', height: 'calc(100% - 24px)' }} elevation={2}>
        
        <Grid container>
          {/* --- Column 1: Screenshot Preview --- */}
          <Grid  size={{xs:12, md: 4}}  sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              loading="lazy"
              src={imageUrl}
              alt={`Screenshot for user ${log.userId}`}
              style={{  maxHeight: '380px', objectFit: 'contain', borderRadius: '8px' }}
            />
          </Grid>

          {/* --- Column 2: Classification Details --- */}
          <Grid size={{xs:12, md: 8}} >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h6" color="text.primary">{formattedTitle}</Typography>
                </Box>
                <Divider/>
              {/* Stage 1: Binary Classifier */}
              {/* <Box>
                <Typography variant="overline" color="text.secondary">Stage 1: Binary Classifier</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                  <Chip
                    label={binaryResult.label}
                    // color={binaryChip.color}
                    icon={binaryChip.icon}
                    variant="outlined"
                  />
                  <Typography variant="body2">
                    Confidence: <strong>{binaryResult.probability}%</strong>
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 1.5 }}/> */}

              {/* Stage 2: Multi-class Classifier */}
              <Box>
                <Typography variant="overline" color="text.secondary"> AI Verdict</Typography>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                   <Chip
                    label={multiResult?.final_decision}
                    color={multiChip.color as ChipProps['color']}
                    icon={multiChip.icon}
                  />
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    Screen Category: {multiResult?.category}
                  </Typography>
                 </Box>
                 <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    <strong>AI Rationale (CoT):</strong> {multiResult?.chain_of_thought}
                 </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }}/>
              
              {/* Stage 3: Proctor Verification */}
              <Box>
                <Typography variant="overline" color="text.secondary"> Human Proctor Verification</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                  
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    {/* <InputLabel id={`proctor-select-label-${log.id}`}>Decision</InputLabel> */}
                    <Select
                      labelId={`proctor-select-label-${log.id}`}
                      value={proctorCategory}
                      label="Category"
                      onChange={(e) => setProctorCategory(e.target.value)}
                    >
                      <MenuItem value="Category">Category</MenuItem>        
                        <MenuItem value="Exam Multiple Choice Question">Exam Multiple Choice Question</MenuItem>
                        <MenuItem value="Exam Content Loading">Exam Content Loading</MenuItem>
                        <MenuItem value="Exam Confirmation Modal">Exam Confirmation Modal</MenuItem>
                        <MenuItem value="Exam Question Navigation">Exam Question Navigation</MenuItem>
                        <MenuItem value="Exam List/Exam List Loading">Exam List/Exam List Loading</MenuItem>
                        <MenuItem value="Recent Apps">Recent Apps</MenuItem>
                        <MenuItem value="Notification Panel">Notification Panel</MenuItem>
                        <MenuItem value="App Drawer and Home Screens">App Drawer and Home Screens</MenuItem>
                        <MenuItem value="Floating Notification">Floating Notification</MenuItem>
                        <MenuItem value="Blank/Splash Screen">Blank/Splash Screen</MenuItem>
                        <MenuItem value="Gallery">Gallery</MenuItem>
                        <MenuItem value="Social Media Feed">Social Media Feed</MenuItem>
                        <MenuItem value="Settings and Quick Settings">Settings and Quick Settings</MenuItem>
                        <MenuItem value="App Marketplace/Store">App Marketplace/Store</MenuItem>
                        <MenuItem value="Search Engine">Search Engine</MenuItem>
                        <MenuItem value="Web Page/Browser">Web Page/Browser</MenuItem>
                        <MenuItem value="AI Assistant">AI Assistant</MenuItem>
                        <MenuItem value="Screen Capture">Screen Capture</MenuItem>
                        <MenuItem value="Advance AI Tools: OCR">Advance AI Tools: OCR</MenuItem>
                        <MenuItem value="Floating Windows: AI Assistant, Search Engine, Etc.">Floating Windows: AI Assistant, Search Engine, Etc.</MenuItem>
                        <MenuItem value="Communication App">Communication App</MenuItem>
                        <MenuItem value="Subject-specific App">Subject-specific App</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    {/* <InputLabel id={`proctor-select-label-${log.id}`}>Decision</InputLabel> */}
                    <Select
                      labelId={`proctor-select-label-${log.id}`}
                      value={proctorDecision}
                      label="Decision"
                      onChange={(e) => setProctorDecision(e.target.value)}
                    >
                      <MenuItem value="Decision">Decision</MenuItem>
                      <MenuItem value="Clean">Clean</MenuItem>
                      <MenuItem value="Suspicious">Suspicious</MenuItem>
                      <MenuItem value="Dishonest">Dishonest</MenuItem>

                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    size="medium"
                   
                    onClick={handleProctorSave}
                    startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>
    </div>
  );
});

export default function Detail(){
    const [data,setData] = useState<Screenshot[]>([]);
    const {examId, userId} = useParams();
    useEffect(()=>{
        setData([]);
        if(!examId || !userId) return;

        let unsubscribe  = getAppDataServices().getListenScreenshotsByUserId(examId, userId,(querySnapshot)=>{

            querySnapshot?.forEach((doc)=>{
                
                setData(prev=>[...prev,{...doc.data() as Screenshot, id:doc.id}])
            })
        })

        return ()=>{
            unsubscribe();
        }

    },[examId, userId])

    return   <Box sx={{ width: '100%', height: '100vh' }}>
         <Typography variant="h6" sx={{my:1}}>Non Exam Screens Log ({data.length})</Typography>
      <FixedSizeList
        height={window.innerHeight} // Full screen height
        width="100%"
        itemSize={500} // Height of a single LogItem card
        itemCount={data.length}
        itemData={data} // Pass all data to the list
      >
        {LogItem}
      </FixedSizeList>
    </Box>
}