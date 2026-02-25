import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import { FormControl, Select, SelectChangeEvent, Stack, useTheme } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import { ConfigContext } from '../../../../config/ConfigContext';
import { setActiveTenant } from '../../../../config/configSlice';
import { useAppDispatch } from '../../../../redux/hooks';
import { titleCaseWord, toCamelCaseWords } from '../../../../utils';
import TmListItemText from '../../../list/TmListItemText';
import TmMenuItem from '../../../menu/TmMenuItem';
import TmCheckbox from '../../../selection/TmCheckbox';
import TmTypography from '../../../typography/TmTypography';

type Props = {
    isMobile?: boolean;
}

export function TenantFilter({ isMobile } : Readonly<Props>) {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const config = useContext(ConfigContext);
    const options = Object.entries(config.tenancy.tenants).map(([key]) => titleCaseWord(key));
    const [selectedTenant, setSelectedTenant] = useState(titleCaseWord(config.tenancy.tenant));
    const handleTenantSelect = useCallback((event: SelectChangeEvent<typeof selectedTenant>) => {
        setSelectedTenant(event.target.value);
        dispatch(setActiveTenant(event.target.value));
    }, [dispatch]);

    const textColor = !isMobile ? theme.palette.primary.contrastText : theme.palette.text.primary;

    if (config.tenancy.hideTenancySelector) {
        return null;
    }
    return (
        <FormControl variant='standard'>
            <Select
                test-id='tenantFilter'
                value={selectedTenant}
                renderValue={(selected) => (
                    <Stack direction='row' gap={3}>
                        <RemoveRedEyeOutlinedIcon
                            id='tenantFilterIcon'
                            sx={{ color: textColor + '!important' }}
                        />
                        <TmTypography testid='tenantFilterText'>
                            {selected}
                        </TmTypography>
                    </Stack>
                )}
                onChange={handleTenantSelect}
                sx={{
                    '& .MuiSvgIcon-root': {
                        color: textColor
                    },
                    '& .MuiTypography-root': {
                        color: textColor
                    },
                    '&.MuiInputBase-root::before': {
                        borderBottom: 'none !important'
                    },
                    paddingX: !isMobile ? 0 : 10.5
                }}
            >
                {options.map((tenant) => (
                    <TmMenuItem
                        testid={toCamelCaseWords('tenantFilterItem', tenant)}
                        key={tenant}
                        value={tenant}
                    >
                        <TmCheckbox
                            testid={toCamelCaseWords('tenantFilterCheckbox', tenant)}
                            checked={selectedTenant.indexOf(tenant) > -1}
                        />
                        <TmListItemText
                            testid={toCamelCaseWords('tenantFilterTitle', tenant)}
                            primary={tenant}
                        />
                    </TmMenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
