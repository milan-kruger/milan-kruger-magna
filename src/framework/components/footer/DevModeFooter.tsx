import ColorLensIcon from '@mui/icons-material/ColorLens';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PrintIcon from '@mui/icons-material/Print';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, Link, Stack, Tab, Tooltip, Typography, useTheme } from '@mui/material';
import { useCallback, useContext, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import AuthService from '../../auth/authService';
import { ConfigContext, ConfigContextState } from '../../config/ConfigContext';
import { selectActiveAuthority, selectConfig } from '../../config/configSlice';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { setActiveTheme } from '../../ui/uiSlice';
import TmTextField from '../textfield/TmTextField';

export function DevModeFooter() {
    const config = useContext(ConfigContext);
    const authority = useAppSelector(selectActiveAuthority);
    // const weighbridgeCode = useAppSelector(selectActiveWeighbridgeCode);
    const [openDevDialog, setOpenDevDialog] = useState(false);
    const [tab, setTab] = useState('info');
    useHotkeys('CTRL+SHIFT+ENTER', () => setOpenDevDialog(true), {
        preventDefault: true,
        description: 'DEV MODE POPUP'
    });
    return (
        <>
            <Tooltip title='DEV MODE'>
                <Link onClick={() => setOpenDevDialog(true)} lineHeight={1}>
                    <Typography variant='caption'>
                        DEV MODE
                    </Typography>
                </Link>
            </Tooltip>
            <Dialog onClose={() => setOpenDevDialog(false)} open={openDevDialog} id='print-dialog'>
                <DialogTitle>Developer Information</DialogTitle>
                <DialogContent>
                    <TabContext value={tab}>
                        <TabList onChange={(_event: React.SyntheticEvent, newValue: string) => setTab(newValue)} className='no-print'>
                            <Tab value='info' label='Basic Info' />
                            <Tab value='token' label='Token' />
                            <Tab value='parsed' label='Parsed Token' />
                            <Tab value='config' label='Config' />
                            <Tab value='theme' label='Theme' />
                        </TabList>
                        <TabPanel value='info'>
                            <Typography variant='body1'>
                                User: {(AuthService.getUserName() ?? '').toUpperCase()}
                            </Typography>
                            <Typography variant='body1'>
                                Authority (Core): {config.tenancy.coreTenant}
                            </Typography>
                            <Typography variant='body1'>
                                Authority (Self): {config.tenancy.tenant}
                            </Typography>
                            <Typography variant='body1'>
                                Authority (Active): {authority}
                            </Typography>
                            {/* <Typography variant='body1'>
                                Weighbridge (Active): {weighbridgeCode}
                            </Typography> */}
                        </TabPanel>
                        <TabPanel value='token'>
                            <Button
                                type='submit'
                                variant='outlined'
                                color={'info'}
                                size='large'
                                startIcon={<ContentCopyIcon />}
                                onClick={() => navigator.clipboard.writeText(AuthService.getToken() ?? 'unknown token')}
                            >
                                Copy to clipboard
                            </Button>
                            <Typography
                                variant='caption'
                                component='pre'
                                fontFamily='monospace'
                                sx={{
                                    wordBreak: 'break-all',
                                    overflowWrap: 'anywhere',
                                    textWrap: 'wrap'
                                }}
                            >
                                {AuthService.getToken() ?? 'No Token'}
                            </Typography>
                        </TabPanel>
                        <JsonContent tabId='parsed' obj={AuthService.getToken() ?? ''} />
                        <JsonContent tabId='config' obj={config ?? {}} />
                        <TabPanel value='theme'>
                            <ThemePicker />
                        </TabPanel>
                    </TabContext>
                </DialogContent>
            </Dialog>
        </>
    );
}

type JsonContentProps = {
    tabId: string;
    obj: object | string;
}

function JsonContent({ tabId, obj }: Readonly<JsonContentProps>) {
    return (
        <TabPanel value={tabId}>
            <Typography
                variant='caption'
                component='pre'
                fontFamily='monospace'
                sx={{
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere',
                    textWrap: 'wrap'
                }}
            >
                {JSON.stringify(obj, null, 4)}
            </Typography>
            <Button
                type='submit'
                variant='outlined'
                color={'info'}
                size='large'
                startIcon={<ContentCopyIcon />}
                onClick={() => navigator.clipboard.writeText(AuthService.getToken() ?? 'unknown token')}
            >
                Copy to clipboard
            </Button>
        </TabPanel>
    );
}

function ThemePicker() {
    const dispatch = useAppDispatch();
    const theme = useTheme();
    const { config: { theme: configTheme } } = useAppSelector(selectConfig);
    const { control, handleSubmit, reset } = useForm<ConfigContextState['theme']>({
        defaultValues: {
            ...configTheme,
            primary: theme.palette.primary.main,
            secondary: theme.palette.secondary.main,
            success: theme.palette.success.main,
            error: theme.palette.error.main,
            warning: theme.palette.warning.main,
            info: theme.palette.info.main,
            scrollbar: configTheme.scrollbar
        }
    });
    const handleThemeOverwrite: SubmitHandler<ConfigContextState['theme']> = useCallback((data) => {
        dispatch(setActiveTheme({ ...data }));
    }, [dispatch]);
    const handleReset = useCallback(() => {
        dispatch(setActiveTheme({ ...configTheme }));
        reset();
    }, [dispatch, configTheme, reset]);
    return (
        <Stack>
            <Typography variant='body1' fontWeight='bold' marginTop={4} marginBottom={8}>
                Trafman Theme
            </Typography>
            <form onSubmit={handleSubmit(handleThemeOverwrite)}>
                <Grid container spacing={2} marginBottom={8}>
                    {Object.keys(configTheme).map((key) => (
                        typeof configTheme[key as keyof ConfigContextState['theme']] === 'string'
                            ? (
                                <Grid size={{ xs: 6, sm: 4 }} key={key}>
                                    <Controller
                                        name={key as keyof ConfigContextState['theme']}
                                        control={control}
                                        render={({ field }) => (
                                            <Stack gap={1} margin={4}>
                                                <TmTextField
                                                    testid='devModeTheme'
                                                    {...field}
                                                    label={key}
                                                    fullWidth
                                                    type='color'
                                                    className={`print-background-${field.name}`}
                                                    sx={{
                                                        '& .MuiInputLabel-root': {
                                                            margin: 2,
                                                            paddingY: 1,
                                                            paddingX: 4,
                                                            borderRadius: 4,
                                                            color: '#000',
                                                            backgroundColor: '#FFF'
                                                        },
                                                        '& .MuiInput-input': {
                                                            marginTop: 4,
                                                            height: '3em !important'
                                                        }
                                                    }}
                                                />
                                                {/* TODO: Make this text look the same, but editable (to easily copy/paste to/from clipboard) */}
                                                <Typography color={field.value as string} alignSelf='center' fontWeight='bold' variant='h5'>
                                                    {field.value as string}
                                                </Typography>
                                                <style>
                                                    {`
                                                        @media print {
                                                            .print-background-${field.name} {
                                                                background-color: ${field.value} !important;
                                                                -webkit-print-color-adjust: exact;
                                                                print-color-adjust: exact;
                                                                border-radius: 4px;
                                                                padding: 8px
                                                            }
                                                        }
                                                    `}
                                                </style>
                                            </Stack>
                                        )}
                                    />
                                </Grid>
                            )
                            : null
                    ))}
                </Grid>
                <Button
                    type='submit'
                    variant='outlined'
                    color='primary'
                    size='large'
                    startIcon={<ColorLensIcon />}
                    fullWidth
                    className='no-print'
                >
                    Apply New Theme
                </Button>
            </form>
            <Box flex={1} marginTop={4}>
                {/* TODO: Also print light and dark variants? */}
                <Button
                    type='submit'
                    variant='outlined'
                    color='info'
                    size='large'
                    startIcon={<PrintIcon />}
                    onClick={() => window.print()}
                    className='no-print'
                    fullWidth
                >
                    Print Pallette
                </Button>
                <style>
                    {`
                        @media print {

                            .no-print {
                                display: none !important;
                            }

                            body * {
                                visibility: hidden;
                            }

                            #print-dialog, #print-dialog * {
                                visibility: visible;
                            }

                            #print-dialog {
                                position: absolute;
                                left: 0;
                                top: 0;
                            }

                        }
                    `}
                </style>
            </Box>
            <Typography variant='body1' fontWeight='bold' marginTop={24} marginBottom={4} className='no-print'>
                Original Config Theme
            </Typography>
            <Button
                type='submit'
                variant='outlined'
                color='secondary'
                size='large'
                startIcon={<RestartAltIcon />}
                onClick={handleReset}
                className='no-print'
            >
                Reset to Config Theme
            </Button>
            <Typography
                variant='caption'
                component='pre'
                fontFamily='monospace'
                sx={{
                    wordBreak: 'break-all',
                    overflowWrap: 'anywhere',
                    textWrap: 'wrap'
                }}
                className='no-print'
            >
                {JSON.stringify(configTheme, null, 4)}
            </Typography>
        </Stack>
    );
}
