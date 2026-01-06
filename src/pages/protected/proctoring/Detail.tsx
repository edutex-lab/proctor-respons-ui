import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { memo, useEffect, useState } from "react";
import type { Examinee, Screenshot } from "../../../data/data.types";
import { getAppDataServices, getLMSDataService } from "../../../data";
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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useSnackbar } from "notistack";
import { useQueryClient } from "@tanstack/react-query";
import Avatar from "@mui/material/Avatar";
import { stringAvatar } from "./components/ExamineeList";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useVerification } from "../../../data/VerificationProvider";


// --- Helper function to get chip color based on decision
export const getChipAppearance = (decision: string) => {
  switch (decision) {
    case 'Suspicious':
      return { color: 'warning', icon: <WarningIcon /> };
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
  const { index, style, data }: { data: Screenshot[], index: number, style: React.CSSProperties } = props;
  const log = data[index];
  // State for the editable proctor classification
  const [proctorDecision, setProctorDecision] = useState(log?.proctorClassificationResult?.final_decision ?? 'Decision');
  const [proctorCategory, setProctorCategory] = useState(log?.proctorClassificationResult?.category ?? 'Category');
  // State for the saving button)
  const [isSaving, setIsSaving] = useState(false);
  const { examId } = useParams();
  const { enqueueSnackbar } = useSnackbar();
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
  const multiChip = getChipAppearance(multiResult?.final_decision ?? '');

  const acceptAIVerdict = () => {
    setProctorDecision(multiResult?.final_decision ?? 'Decision');
    setProctorCategory(multiResult?.category ?? 'Category');
  }

  // --- Proctor Classification (Human Verification) ---
  const handleProctorSave = async () => {
    if (isSaving) return;

    if (proctorCategory === "Category") {
      enqueueSnackbar("Please select a category", { variant: 'warning' });
      return;
    }

    if (proctorDecision === "Decision") {
      enqueueSnackbar("Please select a decision", { variant: 'warning' });
      return;
    }


    // console.log(log)
    setIsSaving(true);
    // Simulate an API call
    await getAppDataServices().setProctorClassificationResult(examId!, log.id, {
      final_decision: proctorDecision,
      category: proctorCategory

    })

    setIsSaving(false);
    enqueueSnackbar(`Proctor verification saved!`, { variant: 'success' });

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
          <Grid size={{ xs: 12, md: 4 }} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              loading="lazy"
              src={imageUrl}
              alt={`Screenshot for user ${log.userId}`}
              style={{ 
                
                ...imageUrl.includes("_ro-0_")? { maxHeight: '380px'}:{ maxWidth: '380px', transform:'rotate(-90deg)'},
                 objectFit: 'contain', 
                 borderRadius: '8px' 
                }}
            />
          </Grid>

          {/* --- Column 2: Classification Details --- */}
          <Grid size={{ xs: 12, md: 8 }} >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" color="text.primary">{formattedTitle}</Typography>
              </Box>
              <Divider />
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
                <Typography variant="overline" color="text.secondary"> AI Proctor Verdict</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                  <Chip
                    label={multiResult?.final_decision}
                    color={multiChip.color as ChipProps['color']}
                    icon={multiChip.icon}
                    sx={{ color: multiChip.color === 'warning' ? 'white' : undefined }}
                  />
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    Screen Category: {multiResult?.category}
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: 100, overflowY: 'auto', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    <strong>AI Rationale (CoT):</strong> {multiResult?.chain_of_thought}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={acceptAIVerdict}
                  startIcon={<CheckCircleOutlineIcon />}
                  sx={{ mt: 1, color: multiChip.color === 'warning' ? 'white' : undefined }}
                  color={multiChip.color as any}
                >
                  Accept AI Verdict
                </Button>
              </Box>
              <Divider sx={{ my: 1.5 }} />

              {/* Stage 3: Proctor Verification */}
              <Box>
                <Typography variant="overline" color="text.secondary"> Human Proctor Verification</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>

                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    {/* <InputLabel id={`proctor-select-label-${log.id}`}>Decision</InputLabel> */}
                    <InputLabel id={`category-select-label-${log?.id}`} sx={{ top: -6 }}>Screen Category</InputLabel>
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
                    <InputLabel id={`decision-select-label-${log?.id}`} sx={{ top: -6 }}>Decision</InputLabel>
                    <Select
                      labelId={`decision-select-label-${log.id}`}
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

export default function Detail() {
  const [data, setData] = useState<Screenshot[]>([]);
  const { examId, roomId, userId, examineeId } = useParams();
  const { setWarningDialogOpen, setWarningData } = useVerification()
  const queryClient = useQueryClient();
  const examinees = queryClient.getQueryData<Examinee[]>(['examinees', roomId]) ?? [];


  const examineeCache = examinees.find(e => e.lmsUserId === userId);

  const [examinee, setExaminee] = useState<Examinee | undefined>(examineeCache);

  useEffect(() => {

    if (!examId || !userId || !examineeId) return;

    getLMSDataService().getExamineeInfo(examId, userId, examineeId)
      .then((examineeInfo) => {
        setExaminee(examineeInfo)
      })
      .catch((error) => {
        console.log(error)
      })
    // setExaminee(examinees.find(e => e.lmsUserId === userId));
  }, [userId])

  useEffect(() => {
    setData([]);
    if (!examId || !userId || !examineeId) return;

    const unsubscribe = getAppDataServices().getListenScreenshotsByUserId(examId, userId, (querySnapshot) => {

      const docs: Screenshot[] = [];
      querySnapshot?.forEach((doc) => {
        docs.push({ ...(doc.data() as Screenshot), id: doc.id });
      });
      setData(docs); // replace instead of append
    })

    return () => {
      unsubscribe();
    }

  }, [examId, userId, examineeId])



  const countDishonest = data.filter(d => d.proctorClassificationResult?.final_decision === 'Dishonest').length;
  const countSuspicious = data.filter(d => d.proctorClassificationResult?.final_decision === 'Suspicious').length;

  // Calculate Cheating Score
  // CS = alpha * (S/T) + (D/T)
  // alpha = 0.5
  let totalScreens = data.length;
  let averageInterval = 18.692; // average inference time
  if (examinee?.start_at && examinee?.finished_at) {
    const start = new Date(examinee.start_at).getTime();
    const end = new Date(examinee.finished_at).getTime();
    const durationInSeconds = (end - start) / 1000;
    if (durationInSeconds > 0) {
      totalScreens = durationInSeconds / averageInterval;
    }
  }

  const alpha = 0.1;
  const rawCheatingScore = totalScreens > 0
    ? (alpha * (countSuspicious / totalScreens) + (countDishonest / totalScreens))
    : 0;

  const cheatingScore = rawCheatingScore.toFixed(4);

  useEffect(() => {
    if (!examId || !userId || !examinee) return;
    const stats = {
      cheatingScore: rawCheatingScore,
      estimatedTotalScreens: totalScreens,
      start_at: examinee.start_at || '',
      finished_at: examinee.finished_at || '',
    };
    getAppDataServices().updateExamineeStats(examId, userId, stats).catch(console.error);
  }, [examId, userId, rawCheatingScore, totalScreens, examinee?.start_at, examinee?.finished_at]);


  if (data.length === 0) {
    return <Box sx={{ width: '100%', height: '100vh', justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: "column" }}>
      {examinee?.lmsUserId && <>
        <Avatar {...stringAvatar(examinee?.name)} sx={{ ...stringAvatar(examinee?.name).sx, ...{ width: 50, height: 50 } }} />
        <Typography variant="body2" sx={{ my: 1, fontSize: 18 }}>Examinee: {examinee?.name}</Typography>
        <Typography variant="body2" sx={{ my: 1, fontSize: 18 }}>Code: {examinee?.code}</Typography>
      </>}

      <Typography variant="h6" sx={{ my: 1 }}> All Clean, No Suspicious or Dishonest Activity Detected!</Typography>
      <CheckCircleOutlineIcon sx={{ color: "green", fontSize: 100 }} />
    </Box>
  }
  return (
    <Box sx={{ width: '100%', minHeight: '100vh' }}>

      <Typography variant="h6" sx={{ my: 1 }}>
        Non Exam Screens Log ({data.length}) -
        <Typography component="span" variant="h6" sx={{ ml: 1, color: rawCheatingScore > 0 ? 'error.main' : 'inherit' }}>
          Cheating Score: {cheatingScore}
        </Typography>
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left section: examinee info + counters */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {examinee?.lmsUserId && (
            <>
              <Typography variant="body2" fontWeight="500">
                Examinee: <Typography component="span" fontWeight="bold">{examinee?.name}</Typography>
              </Typography>
              <Typography variant="body2" fontWeight="500">
                Code: <Typography component="span" fontWeight="bold">{examinee?.code}</Typography>
              </Typography>
            </>
          )}

          <Typography variant="body2" color="warning.main" fontWeight="600">
            Suspicious: {countSuspicious}
          </Typography>
          <Typography variant="body2" color="error.main" fontWeight="600">
            Dishonest: {countDishonest}
          </Typography>
        </Box>

        {/* Right section: action button */}
        {examinee?.lmsUserId && <Button
          variant="outlined"
          size="small"
          startIcon={<WarningAmberIcon />}
          onClick={() => {
            setWarningDialogOpen(true)
            setWarningData(examinee)
          }}
        >
          Send Warning
        </Button>}
      </Box>
      <Divider sx={{ mt: 1 }} />
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
  )
}