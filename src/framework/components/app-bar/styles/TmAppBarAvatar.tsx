import { Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const TmAppBarAvatar = styled(Avatar)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.secondary.dark : theme.palette.secondary.light,
    color: theme.palette.secondary.contrastText
}));

export default TmAppBarAvatar;
