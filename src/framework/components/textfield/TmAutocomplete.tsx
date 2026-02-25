/* eslint-disable react-hooks/refs */
/* eslint-disable @typescript-eslint/no-explicit-any */
import HelpCenterOutlinedIcon from '@mui/icons-material/HelpCenterOutlined';
import {
    Autocomplete,
    autocompleteClasses,
    AutocompleteProps,
    AutocompleteRenderInputParams,
    Box,
    InputAdornment,
    Popper,
    styled,
    TextField,
    Tooltip,
    tooltipClasses,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import Flag from 'react-world-flags';
import {
    createContext,
    Dispatch,
    forwardRef,
    Fragment,
    HTMLAttributes,
    memo,
    ReactElement,
    ReactNode,
    SetStateAction,
    Suspense,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import { useTranslation } from 'react-i18next';
import { List, RowComponentProps } from 'react-window';
import tinycolor from 'tinycolor2';
import { LookupResponse } from '../../../project/redux/api/coreApi';
import toCamelCase, { toCamelCaseWords } from '../../utils';
import TmLoadingSpinner from '../progress/TmLoadingSpinner';
import ErrorIcon from '@mui/icons-material/Error';
import { getSharedSxStyles } from '../../utils/SharedStyles';

type CustomProps = {
    readonly?: boolean;
};

const StyledAutocomplete = styled(Autocomplete, {
    shouldForwardProp: (prop) => prop !== 'readonly'
})<CustomProps>(({ theme, readonly, value }) => ({
    '& .MuiInputLabel-root': {
        color: readonly && value !== null ? `${theme.palette.text.primary} !important` : undefined
    },
    '& .MuiInputBase-input': {
        WebkitTextFillColor: readonly ? `${theme.palette.text.primary} !important` : undefined
    },
    '& .MuiInputBase-root.MuiInput-root.Mui-disabled::before': {
        borderBottom: readonly ? 'none' : undefined
    },
    '& .MuiAutocomplete-endAdornment': {
        display: readonly ? 'none' : 'inherit'
    }
}));

const StyledPopper = styled(Popper)({
    '& .MuiPaper-root': {
        width: 'fit-content',
        '& .MuiAutocomplete-listbox': {
            overflowX: 'hidden !important'
        }
    },
    [`& .${autocompleteClasses.listbox}`]: {
        boxSizing: 'border-box',
        '& ul': {
            padding: 0,
            margin: 0
        }
    }
});

type LookupPagination = {
    isCountry?: boolean;
    testid: string;
    isNextPageLoading?: boolean;
    getNextPage?: () => void;
    hasNextPage?: boolean;
    boxWidth: number;
    setBoxWidth: Dispatch<SetStateAction<number>>;
    autoCompleteWidth: number | undefined;
    renderPaginatedOptionItem?: (data: unknown) => string;
};

const PaginationContext = createContext<LookupPagination>({
    isCountry: false,
    testid: '',
    isNextPageLoading: false,
    getNextPage: () => {
    },
    hasNextPage: false,
    boxWidth: 100,
    setBoxWidth: () => {
    },
    autoCompleteWidth: 0
});

const LISTBOX_PADDING = 8;

const RenderRowItem = (props: any) => {
    const { index, style, data } = props;
    const { t } = useTranslation();
    const {
        isCountry,
        testid,
        isNextPageLoading,
        boxWidth,
        setBoxWidth,
        renderPaginatedOptionItem
    } = useContext(PaginationContext);
    const dataSet = data[index];
    const option = dataSet ? dataSet[1] : undefined;

    const boxRef = useRef<HTMLDivElement>(null);

    const inlineStyle = {
        ...style,
        top: (typeof style.top === 'number' && !isNaN(style.top)) ? style.top + LISTBOX_PADDING : LISTBOX_PADDING
    };

    useEffect(() => {
        if (boxRef.current) {
            if (boxWidth < boxRef.current.offsetWidth) {
                setBoxWidth(boxRef.current.offsetWidth);
            }
        }
    }, [ boxWidth, setBoxWidth ]);

    return option && renderPaginatedOptionItem ? (
        <Tooltip title={<span style={{ fontSize: 'medium' }}>{renderPaginatedOptionItem(option)}</span>} arrow
                 placement='top-start' disableInteractive>
            <Box
                component='li'
                ref={boxRef}
                {...dataSet[0]}
                style={inlineStyle}
                sx={{
                    '& > img': { mr: 2, flexShrink: 0 },
                    '&.MuiAutocomplete-option': {
                        // width: `fit-content !important`,
                        minWidth: '100% !important'
                    }
                }}
                id={toCamelCaseWords(testid, toCamelCase(renderPaginatedOptionItem(option).split(' - ')[1]), 'ListItem')}
                key={dataSet[0].key ?? option.id}
            >
                {isCountry ? (
                    <Suspense fallback={<TmLoadingSpinner testid='transgressionPageLoading' size={10}/>}
                              key={renderPaginatedOptionItem(option).split(' - ')[0].replace(' ', '')}>
                        <Flag
                            code={renderPaginatedOptionItem(option).split(' - ')[0].replace(' ', '')}
                            width={25}
                            style={{ boxShadow: '0px 0px 1px 1px #7f7f7f', width: '1.4rem', height: 'auto' }}
                            fallback={<HelpCenterOutlinedIcon
                                style={{ alignSelf: 'center', marginLeft: 1, marginRight: 2 }}/>}
                        />
                    </Suspense>
                ) : null}
                <Typography noWrap key='renderPaginatedOptionItem(option)'>
                    {renderPaginatedOptionItem(option)}
                </Typography>
            </Box>
        </Tooltip>
    ) : (
        isNextPageLoading && (
            <Typography component='li' noWrap id='loading...' paddingLeft={8} style={inlineStyle}>
                {t('loading')}...
            </Typography>
        )
    );
};

const ListBoxComponent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLElement>>(function ListBoxComponent(props, ref) {
    const { children, ...other } = props;
    const { isNextPageLoading, hasNextPage, getNextPage, boxWidth, autoCompleteWidth } = useContext(PaginationContext);
    const itemData: ReactElement[] = [];
    (children as ReactElement[]).forEach((item: ReactElement & { children?: ReactElement[] }) => {
        itemData.push(item);
        itemData.push(...(item.children || []));
    });

    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), {
        noSsr: true
    });
    const itemCount = hasNextPage ? itemData.length + 1 : itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getHeight = () => {
        if (itemCount > 6) {
            return 6 * itemSize;
        }
        return itemData.map(() => itemSize).reduce((a, b) => a + b, 0);
    };

    return (
        <div ref={ref} {...other}>
            <List
                rowCount={itemCount}
                rowHeight={itemSize}
                style={{
                    width: autoCompleteWidth && autoCompleteWidth > boxWidth ? autoCompleteWidth : boxWidth,
                    height: getHeight() + 2 * LISTBOX_PADDING
                }}
                overscanCount={5}
                tagName='ul'
                rowComponent={(rowProps: RowComponentProps) => <RenderRowItem {...rowProps} />}
                rowProps={{ data: itemData }}
                onRowsRendered={({ stopIndex }) => {
                    if (hasNextPage && !isNextPageLoading && stopIndex >= itemCount - 1) {
                        if (typeof getNextPage === 'function') getNextPage();
                    }
                }}
            />
        </div>
    );
});

type PaginatedProps = {
    paginated: true;
    getNextPage: () => void;
    isNextPageLoading: boolean;
    hasNextPage: boolean;
    onInputChange: (event: any, value: string) => void;
    isOptionEqualToValue: (option: any, value: any) => boolean;
    renderPaginatedOptionItem: (data: any) => string;
};

type NonPaginatedProps = {
    paginated?: false;
    getNextPage?: () => void;
    isNextPageLoading?: boolean;
    hasNextPage?: boolean;
    onInputChange?: (event: any, value: string) => void;
    isOptionEqualToValue?: (option: any, value: any) => boolean;
    renderPaginatedOptionItem?: (data: any) => string;
};

type CommonProps = {
    label: string;
    testid: string;
    tabIndex?: number;
    required?: boolean;
    error?: boolean;
    helperText?: string;
    alternative?: boolean; // small label, slighter larger input font size
    allowEnterAsTab?: boolean;
    isCountry?: boolean;
    disabled?: boolean;
    isUpdateOnWeigh?: boolean;
    showtooltippopup?: boolean;
} & CustomProps &
    AutocompleteProps<any, boolean, boolean, boolean>;

type Props = CommonProps & (PaginatedProps | NonPaginatedProps);

const TmAutocomplete = ({
                            label,
                            testid,
                            tabIndex,
                            required,
                            error,
                            helperText,
                            alternative,
                            paginated,
                            getNextPage,
                            isNextPageLoading,
                            hasNextPage,
                            isCountry,
                            renderPaginatedOptionItem,
                            isUpdateOnWeigh,
                            showtooltippopup,
                            disabled = false,
                            onChange: onChangeProp,
                            value: valueProp,
                            sx: sxProp,
                            ...otherProps
                        }: Props) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const [ boxWidth, setBoxWidth ] = useState(0);
    const [ lookupCode, setLookupCode ] = useState<string | undefined>(valueProp?.lookupCode);

    const autoCompleteRef = useRef<HTMLDivElement>(null);

    const width = 'fit-content';
    const boxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (boxRef.current) {
            if (boxWidth < boxRef.current.offsetWidth) {
                setBoxWidth(boxRef.current.offsetWidth);
            }
        }
    }, [ boxWidth, setBoxWidth ]);

    const handleOnChange = useCallback(
        (event: React.SyntheticEvent, value: any, reason: any) => {
            onChangeProp?.(event, value, reason);
            setLookupCode(value ? (value as LookupResponse).lookupCode : undefined);
        },
        [ onChangeProp ]
    );
    useEffect(() => {
        if (valueProp?.lookupCode) {
            setLookupCode(valueProp.lookupCode);
        } else {
            setLookupCode(undefined);
        }
    }, [ valueProp ])

    const tooltipValue = useMemo(() => {
        let tooltipText = '';
        if (valueProp && typeof valueProp.lookupValue === 'string') {
            tooltipText = valueProp.lookupCode + ' - ' + valueProp.lookupValue;
        } else if (valueProp && typeof valueProp.name === 'string') {
            tooltipText = t(valueProp.name);
        }

        if (tooltipText && !disabled) {
            return <span style={{ fontSize: 'medium' }}>{tooltipText}</span>;
        } else if (tooltipText && isUpdateOnWeigh && showtooltippopup) {
            return (
                <span style={{ fontSize: 'medium', display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: '10px', color: '#FF851A' }}>
                        <ErrorIcon/>
                    </span>
                    {t('tooltipForWeighInfo')}
                </span>
            );
        } else {
            return '';
        }
    }, [valueProp, disabled, isUpdateOnWeigh, showtooltippopup, t]);

    const tooltipSx = useMemo(() => ({
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: showtooltippopup && isUpdateOnWeigh ? '#fff' : '',
            color: showtooltippopup && isUpdateOnWeigh ? 'rgba(0, 0, 0, 0.87)' : '',
            maxWidth: showtooltippopup && isUpdateOnWeigh ? 220 : 'unset',
            border: showtooltippopup && isUpdateOnWeigh ? '1px solid #000' : ''
        }
    }), [showtooltippopup, isUpdateOnWeigh]);

    const autocompleteSx = useMemo(() => {
        const errorBg = error ? tinycolor(theme.palette.error.light).setAlpha(0.2).toRgbString() : 'inherit';
        return {
            ...sxProp,
            '& .MuiInputBase-root': {
                backgroundColor: errorBg
            }
        };
    }, [sxProp, error, theme.palette.error.light]);

    // Memoize textfield sx styles
    const textFieldSx = useMemo(() => getSharedSxStyles({
        alternative,
        error: error,
        theme,
        props: { sx: sxProp },
    }), [alternative, error, theme, sxProp]);

    return (
        <PaginationContext.Provider
            value={useMemo(
                () => ({
                    isCountry,
                    testid,
                    getNextPage,
                    isNextPageLoading,
                    hasNextPage,
                    boxWidth,
                    setBoxWidth,
                    autoCompleteWidth: autoCompleteRef.current?.offsetWidth,
                    renderPaginatedOptionItem
                }),
                [ boxWidth, getNextPage, hasNextPage, isCountry, isNextPageLoading, renderPaginatedOptionItem, testid ]
            )}
        >
            <StyledAutocomplete
                {...(otherProps as any)}
                value={valueProp}
                ref={autoCompleteRef}
                openOnFocus
                filterOptions={paginated ? (x) => x : undefined}
                disableListWrap={!!paginated}
                onChange={paginated ? handleOnChange : onChangeProp}
                slots={{
                    popper: paginated ? StyledPopper : Popper
                }}
                slotProps={{
                    popper: { style: { width: width } },
                    listbox: {
                        component: paginated ? ListBoxComponent : undefined
                    }
                }}
                noOptionsText={isNextPageLoading ? t('loading') + '...' : t('noOptions')}
                disabled={disabled}
                sx={autocompleteSx}
                renderInput={(params: AutocompleteRenderInputParams) => (
                    <Tooltip
                        sx={tooltipSx}
                        title={tooltipValue !== '' ? <Fragment>{tooltipValue}</Fragment> : ''}
                        arrow
                        placement='top-start'
                        disableInteractive
                    >
                        <TextField
                            {...params}
                            required={required}
                            label={label}
                            variant='standard'
                            error={error}
                            helperText={helperText !== ' ' ?
                                <span id={testid + 'ErrorMessage'}>{helperText}</span> : ' '}
                            slotProps={{
                                htmlInput: {
                                    tabIndex: tabIndex,
                                    ...params.inputProps,
                                    id: testid,
                                    'data-testid': testid
                                },
                                input: {
                                    ...params.InputProps,
                                    startAdornment:
                                        isCountry && lookupCode ? (
                                            <InputAdornment position='start'>
                                                <Suspense fallback={<TmLoadingSpinner testid='transgressionPageLoading'
                                                                                      size={20}/>}>
                                                    <Flag
                                                        code={lookupCode}
                                                        width={25}
                                                        style={{
                                                            boxShadow: '0px 0px 1px 1px #7f7f7f',
                                                            width: '1.4rem',
                                                            height: 'auto'
                                                        }}
                                                        fallback={<HelpCenterOutlinedIcon style={{
                                                            alignSelf: 'center',
                                                            marginLeft: 1,
                                                            marginRight: 2
                                                        }}/>}
                                                    />
                                                </Suspense>
                                            </InputAdornment>
                                        ) : params.InputProps.startAdornment
                                }
                            }}
                            sx={textFieldSx}
                        />
                    </Tooltip>
                )}
                renderOption={(props, option, state, ownerState) =>
                    paginated ? (
                        ([ props, option, state.index ] as ReactNode)
                    ) : (
                        <Box component='li' {...props} data-testid={testid}
                             id={testid + ownerState.getOptionLabel(option).replace(/\s/g, '').trim()}
                             key={props.key ?? ownerState.getOptionLabel(option)}>
                            {ownerState.getOptionLabel(option)}
                        </Box>
                    )
                }
            />
        </PaginationContext.Provider>
    );
};

export default memo(TmAutocomplete);
