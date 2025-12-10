
// It's recommended to install these packages if you haven't already:
// npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

// MUI Components
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';

import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// MUI Icons - for better visual cues
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import { type ExamInfo } from '../../../../data/data.types';
import { useQuery } from '@tanstack/react-query';
import { getLMSDataService } from '../../../../data';
import { useNavigate, useParams } from 'react-router';
import Loading from './Loading';



const ExamInfoCard = ({ examData }: { examData: ExamInfo | undefined }) => {

  const { examId, roomId } = useParams()
  const navigate = useNavigate()

  // Helper function to format dates.
  // For production apps, consider using a robust library like date-fns or dayjs.
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const onClassroomChange = (event: { target: { value: any; }; }) => {
    const selectedRoomId = event.target.value;
    navigate(`/proctoring/${examId}/room/${selectedRoomId}`);
  }

  if (!examData) return null

  return (
    <Card sx={{ maxWidth: 450, boxShadow: 3, borderRadius: 3, m: 2 }}>
      {/* Card Header */}
      {/* <CardHeader
        title="Exam Info"
        slotProps={{title:{ variant: 'h6', fontWeight: 'bold' }}}
        sx={{ bgcolor: 'primary.main', color: 'white' }}
      /> */}

      {/* Course Thumbnail Image */}
      {/* {examData.courseThumbnail && (
        <CardMedia
          component="img"
          height="180"
          image={examData.courseThumbnail}
          alt={`${examData.courseName || 'Course'} thumbnail`}
          onError={(e) => { e.target?.style?.display = 'none'; }} // Hide if image fails to load
        />
      )} */}

      {/* Main Content Area */}
      <CardContent>
        <Stack spacing={1.5}>
          {/* Section 1: Exam and Course Name */}
          <Box>
            <Typography gutterBottom variant="h5" component="div" fontWeight="bold">
              {examData.name || 'Untitled Exam'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <SchoolIcon color="action" />
              <Typography variant="subtitle1" color="text.secondary">
                {examData.courseName || 'Unnamed Course'}
              </Typography>
              {examData.courseCode && <Chip label={examData.courseCode} size="small" variant="outlined" />}
            </Stack>
            {/* Classroom Dropdown */}
            <FormControl fullWidth>
              {/* <InputLabel id="classroom-select-label">Classroom</InputLabel> */}
              <Select
                labelId="classroom-select-label"
                id="classroom-select"
                value={roomId}
                label="Classroom"
                onChange={onClassroomChange}
                IconComponent={MeetingRoomIcon}
              >
                {examData.classRooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* Section 2: Timing and Duration Details */}
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TimerIcon color="action" />
              <Typography variant="body1">
                {examData.isDuration
                  ? `Duration: ${examData.duration} minutes`
                  : 'No time limit'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <EventAvailableIcon color="action" />
              <Typography variant="body1">
                <strong>Starts:</strong> {formatDate(examData.startAt)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <EventBusyIcon color="action" />
              <Typography variant="body1">
                <strong>Ends:</strong> {formatDate(examData.endAt)}
              </Typography>
            </Stack>
            {/* <Stack direction="row" spacing={2} alignItems="center">
              <VpnKeyIcon color="action" />
              <Typography variant="body2" color="text.secondary" sx={{ userSelect: 'all' }}>
                Exam ID: {examData.id || 'N/A'}
              </Typography>
            </Stack> */}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default function ExamInformation() {
  const { examId } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['examInfo', examId],
    queryFn: async () => {
      const exam = await getLMSDataService().getExamInfo(examId!);
      return exam;
    },
  })


  if (isLoading) {
    return <Loading />
  }
  return (
    <Box
      sx={{
        width: '100%',
        // height: 400, maxWidth: 360, 
        px: 1,
        // bgcolor: 'background.paper'
      }}
    >
      <Typography variant="h6" sx={{ my: 1 }}>Exam Info</Typography>
      <ExamInfoCard examData={data} />

    </Box>
  );
}
