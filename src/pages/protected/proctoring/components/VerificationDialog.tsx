import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import type { Examinee, Screenshot } from '../../../../data/data.types';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import { getAppDataServices } from '../../../../data';
import { getChipAppearance } from '../Detail';
import { useSnackbar } from 'notistack';
import Divider from '@mui/material/Divider';
import Chip, { type ChipProps } from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import InputLabel from '@mui/material/InputLabel';
import SaveIcon from '@mui/icons-material/Save';
import NextIcon from '@mui/icons-material/NavigateNext';
import PreviousIcon from '@mui/icons-material/NavigateBefore';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { stringAvatar } from './ExamineeList';
import WarningIcon from '@mui/icons-material/Warning';
import { useVerification } from '../../../../data/VerificationProvider';
import CircularProgress from '@mui/material/CircularProgress';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Fade from '@mui/material/Fade';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  }
}));

interface VerificationDialogProps {
  open: boolean;
  onClose: () => void;
  data: Screenshot[];
}

export default function VerificationDialog({ open, onClose, data }: VerificationDialogProps) {
  const [currentId, setCurrentId] = React.useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = React.useState(false);

  const [lastOpen, setLastOpen] = React.useState(open);

  React.useEffect(() => {
    // If dialog just opened (transition from false to true)
    if (open && !lastOpen && data.length > 0) {
      setCurrentId(data[0].id);
    }
    // If dialog is open and no currentId is set (initial laod)
    else if (open && data.length > 0 && !currentId) {
      setCurrentId(data[0].id);
    }
    // Handle stable navigation: if currentId is set but no longer in data
    else if (open && data.length > 0 && currentId) {
      const exists = data.find(d => d.id === currentId);
      if (!exists) {
        setCurrentId(data[0].id);
      }
    }
    setLastOpen(open);
  }, [open, data, currentId, lastOpen]);

  const currentIndex = React.useMemo(() => {
    return data.findIndex(d => d.id === currentId);
  }, [data, currentId]);

  const log = currentIndex !== -1 ? data[currentIndex] : data[0];

  React.useEffect(() => {
    setImgLoaded(false);
  }, [log?.id]);
  const { setWarningDialogOpen, setWarningData } = useVerification();
  const { examId, roomId } = useParams()
  const queryClient = useQueryClient();
  const examinees = queryClient.getQueryData<Examinee[]>(['examinees', roomId]) ?? [];
  const examinee = examinees.find(e => e.lmsUserId?.toString() === log?.userId?.toString());
  // State for the editable proctor classification
  const [proctorDecision, setProctorDecision] = React.useState(log?.proctorClassificationResult?.final_decision ?? 'Decision');
  const [proctorCategory, setProctorCategory] = React.useState(log?.proctorClassificationResult?.category ?? 'Category');
  // State for the saving button)
  const [isSaving, setIsSaving] = React.useState(false);
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
  const multiResult = log?.multiClassificationResult;
  const multiChip = getChipAppearance(multiResult?.final_decision ?? '');

  const acceptAIVerdict = () => {
    setProctorDecision(log?.multiClassificationResult?.final_decision ?? 'Decision');
    setProctorCategory(log?.multiClassificationResult?.category ?? 'Category');
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

    console.log(proctorCategory, proctorDecision)
    // console.log(log)
    setIsSaving(true);

    // Determine next ID to jump to before current is removed
    let nextId = null;
    if (data.length > 1) {
      // If there's a next item, take it. 
      // If we are at the end, take the previous item.
      // If we are essentially removing the current item, 
      // the item at currentIndex + 1 will shift to currentIndex (if it exists).
      // So checking index + 1 is checking the valid neighbor.
      if (currentIndex < data.length - 1) {
        nextId = data[currentIndex + 1].id;
      } else if (currentIndex > 0) {
        nextId = data[currentIndex - 1].id;
      }
    }

    // Simulate an API call
    await getAppDataServices().setProctorClassificationResult(examId!, log?.id, { final_decision: proctorDecision, category: proctorCategory})

    setIsSaving(false);
    setProctorCategory("Category");
    setProctorDecision("Decision");

    if (nextId) {
      setCurrentId(nextId);
    }

    enqueueSnackbar(`Proctor verification saved!`, { variant: 'success' });

  };
  // Format the timestamp for the title ---
  const createdAtDate = new Date(log?.createdAt.toMillis());
  const formattedTitle = createdAtDate.toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });


  return (
    <BootstrapDialog
      onClose={onClose}
      aria-labelledby="customized-dialog-title"
      open={open}
      maxWidth="lg"

    >
      <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
        {log?.multiClassificationResult?.final_decision} Activity Verification
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent dividers>
        <Card sx={{ m: 1.5, display: 'flex', height: 'calc(100% - 24px)' }} elevation={2}>
          {data.length > 0 ?
            <Fade in={true} key={log?.id} timeout={500}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <Grid container>
                  {/* --- Column 1: Screenshot Preview --- */}

                  <Grid size={{ xs: 12, md: 4 }} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 200 }}>
                    {!imgLoaded && (
                      <Box sx={{ position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <CircularProgress />
                      </Box>
                    )}
                    <img
                      src={imageUrl}
                      onLoad={() => setImgLoaded(true)}
                      onError={() => setImgLoaded(true)}
                      alt={`Screenshot for user ${log?.userId}`}
                      style={{ 
                        ...imageUrl.includes("_ro-0_")? { maxHeight: '380px'}:{ maxWidth: '380px', transform:'rotate(-90deg)'}, 
                        objectFit: 'contain', 
                        borderRadius: '8px', 
                        display: imgLoaded ? 'block' : 'none' }}
                    />
                  </Grid>

                  {/* --- Column 2: Classification Details --- */}
                  <Grid size={{ xs: 12, md: 8 }} >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                        <Typography variant="h6" color="text.primary">{formattedTitle}</Typography>
                        <Box>
                          <Stack
                            direction="row"
                            sx={{
                              py: 1,
                              gap: 1,
                              alignItems: 'center',
                              // borderTop: '1px solid',
                              // borderColor: 'divider',
                            }}
                          >
                            <Avatar {...stringAvatar(examinee?.name ?? '')} sx={{ ...stringAvatar(examinee?.name ?? '').sx, ...{ width: 50, height: 50 } }} />

                            <Box sx={{ mr: 'auto' }}>
                              <Typography variant="body2" sx={{ fontSize: 14 }}>Examinee: {examinee?.name}</Typography>
                              <Typography variant="body2" sx={{ fontSize: 12 }}>Code: {examinee?.code}</Typography>

                            </Box>
                          </Stack>

                          <Button
                            startIcon={<WarningIcon />}
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              setWarningData(examinee ?? null)
                              setWarningDialogOpen(true)
                            }}
                          >
                            Send Warning Message
                          </Button>
                        </Box>
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
                      </Box>
                      <Divider sx={{ my: 1.5 }} />

                      {/* Stage 3: Proctor Verification */}
                      <Box>
                        <Typography variant="overline" color="text.secondary"> Human Proctor Verification</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>

                          <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel id={`category-select-label-${log?.id}`} sx={{ top: -6 }}>Screen Category</InputLabel>
                            <Select
                              labelId={`category-select-label-${log?.id}`}
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
                            <InputLabel id={`decision-select-label-${log?.id}`} sx={{ top: -6 }}>Decision</InputLabel>

                            <Select
                              labelId={`decision-select-label-${log?.id}`}
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
                            size="small"
                            sx={{ color: multiChip.color === 'warning' ? 'white' : undefined }}
                            onClick={acceptAIVerdict}
                            startIcon={<CheckIcon />}
                            color={multiChip.color as any}
                          >
                            Accept AI Verdict
                          </Button>
                        </Box>
                        <Typography sx={{ mt: 1 }}>Classification Guide:</Typography>
                        <ol style={{ marginTop: 0 }}>
                          <Typography component="li"><span style={{ fontWeight: "bold", color: 'green' }}>Clean</span>. The screenshots depict normal activities with no
                            indication of dishonest behavior by the participant.</Typography>
                          <Typography component="li"><Box component="span" sx={{ fontWeight: "bold", color: 'warning.main' }}>Suspicious</Box>. The screenshots reflect unusual and suspicious behaviors, though it does not definitively indicate
                            cheating.
                          </Typography>
                          <Typography component="li">
                            <span style={{ fontWeight: "bold", color: 'red' }}>Dishonest</span> The screenshots reveal cheating behaviors
                            carried out by the participants.
                          </Typography>
                        </ol>
                      </Box>
                    </CardContent>
                  </Grid>

                </Grid>
              </Box>
            </Fade>
            :
            <Grid container sx={{ minWidth: 500 }}>
              <Grid size={{ xs: 12 }}>
                <CardContent>
                  <Box sx={{ justifyContent: 'center', alignItems: 'center', display: 'flex', flexDirection: "column" }}>
                    <CheckCircleOutlineIcon sx={{ color: "green", fontSize: 100 }} />
                    <Typography variant="h6" sx={{ my: 1 }}> Nothing to verify — all clear!</Typography>


                  </Box>
                </CardContent>
              </Grid>
            </Grid>
          }

        </Card>
      </DialogContent>
      {data.length > 0 ? <DialogActions>
        <Button

          onClick={() => {
            const newIndex = currentIndex - 1;
            if (newIndex >= 0) setCurrentId(data[newIndex].id);
          }}
          disabled={currentIndex <= 0}   // disable if already at first item
          startIcon={<PreviousIcon />} variant='outlined'>
          Preivous
        </Button>
        <Button
          onClick={() => {
            const newIndex = currentIndex + 1;
            if (newIndex < data.length) setCurrentId(data[newIndex].id);
          }}
          variant='outlined'
          disabled={currentIndex === data.length - 1 || data.length === 0}  // disable if already at last item
          endIcon={<NextIcon />} >
          Next
        </Button>
        <Button
          startIcon={<SaveIcon />}
          autoFocus
          onClick={handleProctorSave}  // <-- call your save function
          variant="contained"

        >
          {isSaving ? "Saving..." : "Save Verification"}
        </Button>

      </DialogActions>
        :
        <DialogActions>
          <Button variant='outlined' onClick={() => onClose}>Close</Button>
        </DialogActions>
      }
    </BootstrapDialog>
  );
}