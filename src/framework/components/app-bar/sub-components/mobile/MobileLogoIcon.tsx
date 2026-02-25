import { NavLink } from 'react-router-dom';
import Logo from '../../../../assets/images/logo.svg';
import { MobileScreenBox } from '../../styles/MobileScreenBox';

export function MobileLogoIcon() {
    return (
        <NavLink to='home'>
            <MobileScreenBox>
                <img
                    src={Logo}
                    style={{ height: '2.5rem' }}
                    alt='trafman logo'
                />
            </MobileScreenBox>
        </NavLink>
    );
};
