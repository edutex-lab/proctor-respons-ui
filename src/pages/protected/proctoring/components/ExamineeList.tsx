import * as React from 'react';
import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import type { Examinee } from '../../../../data/data.types';
import { useQuery } from '@tanstack/react-query';
import { getLMSDataService } from '../../../../data';
import { Link, useNavigate, useParams } from 'react-router';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Loading from './Loading';

export function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

export function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
      marginLeft:1,
    },
    children: `${name.split(' ')[0][0]}${name.split(' ')[1]?.[0]??''}`,
  };
}

function renderRow(props: ListChildComponentProps) {
  const { index, style, data }:{data:Examinee[], index:number, style:React.CSSProperties} = props;
  const {userId} = useParams()
  const navigate = useNavigate();
  return (
    <ListItem style={style} key={index} component="div" disablePadding>
      <ListItemButton onClick={()=>{
        navigate( `user/${data[index].lmsUserId}`)
        
      }} selected={userId === data[index].lmsUserId}>
      <ListItemAvatar>
          <Avatar {...stringAvatar(data[index].name)} />
        </ListItemAvatar>
        <ListItemText primary={data[index].name} secondary={data[index].code} />
      </ListItemButton>
    </ListItem>
  );
}

export default function ExamineeList() {
  const {roomId, examId} = useParams();
  const [search, setSearch] = React.useState('');
  const {data, isLoading} = useQuery({
    queryKey: ['examinees',roomId],
    queryFn: async ()=>{
       const data = await getLMSDataService().getExaminees(examId!,roomId!);
      return data;
    },
  })

  const filterData =data?.filter((item: Examinee) => (item.name.toLowerCase().includes(search.toLowerCase()) || item.code.toLowerCase().includes(search.toLowerCase())) );

  if (isLoading) {
    return <Loading/>
  }
  return (
    <Box
      sx={{ width: '100%', 
        // height: 400, maxWidth: 360, 
        px:1,
        // bgcolor: 'background.paper' 
      }}
    >
      <Typography variant="h6" sx={{my:1}}>Examinee List ({data?.length ?? 0})</Typography>
      <TextField
        placeholder="Search Examinee Name or Code..."
        fullWidth
        onChange={(e) => {setSearch(e.target.value)}}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      <Divider sx={{my:1}}/>
      <FixedSizeList
        height={350}
        width="100%"
        itemSize={60}
        itemCount={filterData?.length ?? 0}
        overscanCount={5}
        itemData={filterData ?? []}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
  );
}
