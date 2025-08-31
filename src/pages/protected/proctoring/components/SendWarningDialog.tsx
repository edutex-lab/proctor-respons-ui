import * as React from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useVerification } from '../../../../data/VerificationProvider';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../../../auth/AuthProvider';
import { getAppDataServices } from '../../../../data';
import { useParams } from 'react-router';
import { useSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';

interface SendWarningDialogProps {
  open: boolean;
  onClose: () => void;
}
export default function SendWarningDialog({open, onClose}: SendWarningDialogProps) {
//   const [open, setOpen] = React.useState(false);
    const {warningData} = useVerification();
    const {user} = useAuth();
    const {examId} = useParams();
    const {enqueueSnackbar} = useSnackbar();
    const [isSending, setIsSending] = React.useState(false);
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if(isSending) return;
        
        const formData = new FormData(event.currentTarget);
        const formJson = Object.fromEntries((formData as any).entries());
        const message = formJson.message;
        setIsSending(true);
        try{
            await getAppDataServices().sendWarningMessage(examId!, warningData?.lmsUserId!,message, user!);
            enqueueSnackbar("Warning message sent", {variant: "success"});
            onClose();
        }catch(e){
            enqueueSnackbar("Failed to send warning message", {variant: "error"});
        }finally{
            setIsSending(false);
        }

    };

  return (
    
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Send Warning Message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Write warning message  to {warningData?.name} ({warningData?.code})
          </DialogContentText>
          <form onSubmit={handleSubmit} id="subscription-form">
            <TextField
              autoFocus
              required
              margin="dense"
              id="message"
              name="message"
              label="Warning Message"
              type="text"
              fullWidth
              variant="standard"
              multiline
              maxRows={4}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button  onClick={onClose}>Cancel</Button>
          <Button 
          variant='contained' 
          startIcon={isSending? <CircularProgress/> :<SendIcon />} 
          type="submit" form="subscription-form">
            {isSending? "Sending..." : "Send"}
          </Button>
        </DialogActions>
      </Dialog>
  );
}
