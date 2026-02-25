import { NavLink } from 'react-router-dom';
import Logo from '../../../../assets/images/logo.svg';
import { DesktopScreenBox } from '../../styles/NormalScreenBox';

export function DesktopLogoIcon() {
    return (
        <NavLink to='home' id='desktopTrafmanLogoIcon'>
            <DesktopScreenBox marginLeft={4} marginRight={6}>
                <img
                    src={Logo}
                    style={{ height: '2.5rem' }}
                    alt='trafman logo'
                />
            </DesktopScreenBox>
        </NavLink>
    );
};
