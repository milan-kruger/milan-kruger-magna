import { Theme, useMediaQuery, useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import DarkTrafman from '../../../../assets/images/Dark-Trafman.svg';
import LightTrafman from '../../../../assets/images/Light-Trafman.svg';
import { MobileScreenBox } from '../../styles/MobileScreenBox';

export function MobileLogo() {
    const theme = useTheme();
    const isMiniMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
    if (isMiniMobile) {
        return null;
    }
    return (
        <NavLink to='home'>
            <MobileScreenBox marginLeft={2} marginRight={4}>
                <img
                    src={theme.palette.mode === 'dark' ? DarkTrafman : LightTrafman}
                    style={{ height: '2.1rem' }}
                    alt='trafman title logo'
                />
            </MobileScreenBox>
        </NavLink>
    );
};
