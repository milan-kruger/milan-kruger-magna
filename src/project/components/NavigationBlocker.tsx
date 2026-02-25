import React, { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationBlockerProps {
    children: ReactNode;
    allowedFromPaths: string[]; // List of allowed previous paths
    fallbackPath?: string; // Optional fallback path if not allowed
}

const NavigationBlocker: React.FC<NavigationBlockerProps> = ({ children, allowedFromPaths, fallbackPath }) => {
    const location = useLocation();
    const navigate = useNavigate();

    if (!allowedFromPaths.includes(location.state?.from)) {
        if (fallbackPath) {
            navigate(fallbackPath, {replace: true}); // Redirect to fallback path
        } else {
            navigate(-1); // Go back to the previous page
        }
    } else {
        return <>{children}</>;
    }
};

export default NavigationBlocker;
