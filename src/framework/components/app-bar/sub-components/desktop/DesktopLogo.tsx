import { useTheme } from '@mui/material';
import { NavLink } from 'react-router-dom';
import DarkTrafman from '../../../../assets/images/Dark-Trafman.svg';
import LightTrafman from '../../../../assets/images/Light-Trafman.svg';
import { DesktopScreenBox } from '../../styles/NormalScreenBox';

export function DesktopLogo() {
    const theme = useTheme();
    return (
        <NavLink to='home' id='desktopTrafmanLogo'>
            <DesktopScreenBox>
                <img
                    src={theme.palette.mode === 'dark' ? DarkTrafman : LightTrafman}
                    style={{ height: '2.1rem' }}
                    alt='trafman title logo'
                />
            </DesktopScreenBox>
        </NavLink>
    );
};
