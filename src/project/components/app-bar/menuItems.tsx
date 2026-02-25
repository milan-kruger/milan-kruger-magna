import { BsUpcScan } from 'react-icons/bs';
import React, { useMemo } from 'react';
import { GiArchiveRegister } from "react-icons/gi";
import { LuScrollText } from "react-icons/lu";
import { PiListMagnifyingGlass, PiScalesFill } from "react-icons/pi";
import AuthService from "../../../framework/auth/authService";
import { ROUTE_NAMES } from "../../Routing";

export type MenuItemsType = {
    /** The `title` needs to match the key in the language file. */
    title: string;
    /** The navigation route URL to use. */
    url: string;
    /** Check if the menu item is disabled. */
    disabled?: boolean;
    /** An optional custom action that needs to be executed when the menu item is clicked. */
    action?: (e?: React.MouseEvent<HTMLAnchorElement>) => void;
    icon?: React.JSX.Element;
};

function useGeneratedMenuItems(): MenuItemsType[] {
    const menuItems = useMemo<MenuItemsType[]>(() => {
        const temp: MenuItemsType[] = [];
        const location = window.location.pathname;

        if (AuthService.hasRole('TRANSGRESSIONDETAILS_VIEW')) {
            if (location.includes('prosecuteTransgression')) {
                temp.push({
                    title: 'captureTransgression',
                    url: '#',
                    disabled: true,
                    action: (e) => e?.preventDefault()
                });
            }
            else {
                temp.push({
                    title: 'transgressions',
                    url: 'transgressions',
                    icon: <PiListMagnifyingGlass fontSize={25} />
                });
            }
        }
        if (((AuthService.hasRole('SUBMISSIONDETAILS_VIEW') &&
            AuthService.hasRole('REGISTERSUBMISSION_MAINTAIN') &&
            AuthService.hasRole('SUBMISSION_VIEW')) ||
            AuthService.hasRole('ADJUDICATION_MAINTAIN')) &&
            AuthService.isFeatureEnabled('SUBMISSION_AND_ADJUDICATION')) {
            if (!location.includes('prosecuteTransgression')) {
                temp.push({
                    title: 'submissionAndAdjudication',
                    url: 'submission-adjudication',
                    icon: <PiScalesFill fontSize={25}/>
                });
            }
        }
        if (AuthService.hasRole('COURT_VIEW') &&
            AuthService.hasRole('COURTREGISTER_MAINTAIN') &&
            AuthService.isFeatureEnabled('COURT')) {
            if (!location.includes('prosecuteTransgression')) {
                temp.push({
                    title: 'court',
                    url: 'court-documents',
                    icon: <LuScrollText fontSize={25}/>
                });
            }
        }
        if ((AuthService.hasRole('WARRANTOFARRESTREGISTER_MAINTAIN') ||
            AuthService.hasRole('WARRANTOFARRESTREGISTER_VIEW') ||
            AuthService.hasRole('WARRANTOFARREST_MAINTAIN') ||
            AuthService.hasRole('WARRANTOFARREST_VIEW')) &&
            AuthService.isFeatureEnabled('WARRANT_OF_ARREST')) {
            if (!location.includes('prosecuteTransgression')) {
                temp.push({
                    title: 'warrantOfArrest',
                    url: ROUTE_NAMES.warrantOfArrestTab,
                    icon: <GiArchiveRegister fontSize={25} />
                });
            }
        }
        if (AuthService.hasRole('MANUALPAYMENT_MAINTAIN') && AuthService.hasRole('MANUALPAYMENT_VIEW')){
            temp.push({
                title: 'manualPayments',
                url: ROUTE_NAMES.manualPayments
            })
        }

       /**NOTE: Add other notice management roles so this menu shows */
        if ((AuthService.hasRole('AARTONOTICENUMBER_MAINTAIN') && AuthService.isFeatureEnabled('AARTO_MANAGEMENT'))) {
            temp.push({
                title: 'noticeManagement.heading',
                url: ROUTE_NAMES.noticeManagement
            });
        }

        temp.push({
            title: 'barcodeScanner.menuTitle',
            url: ROUTE_NAMES.mobileTransgressions,
            icon: <BsUpcScan fontSize={25} />
        });

        return temp;
    }, []);
    return menuItems;
}

export default useGeneratedMenuItems;
