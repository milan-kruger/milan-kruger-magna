import CancelIcon from '@mui/icons-material/Cancel';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { useHotkeysContext } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import TmButton from '../button/TmButton';
import toCamelCase, { toCamelCaseWords } from '../../utils';

type HotkeysDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    pageTitle: string;
};

type HotKey = {
    command: string;
    description: string;
};

export default function HotkeysDialog({ isOpen, onClose, pageTitle }: HotkeysDialogProps) {
    const { t } = useTranslation();
    const { hotkeys } = useHotkeysContext();

    let hotKeysArray: HotKey[] = [];
    hotkeys.forEach((hotKey) => {
        let command = '';
        if (hotKey.ctrl) {
            command += 'Ctrl + ';
        }
        if (hotKey.alt) {
            command += 'Alt + ';
        }
        if (hotKey.shift) {
            command += 'Shift + ';
        }
        if (hotKey.keys) {
            for (let i = 0; i < hotKey.keys.length; i++) {
                const key = hotKey.keys[i];
                command += key.charAt(0).toUpperCase() + key.slice(1);
                if (i !== hotKey.keys.length - 1) {
                    command += ' + '
                }
            }
        }

        const tempHotkey: HotKey = {
            // Slash on the keyboard is the key / but the libray misinterprets it as the key - which is actually a Dash
            command: command.replace(/slash/gi, "Dash"),
            description: hotKey.description ? hotKey.description : ''
        };

        // Append the description of similar commands
        const hotKeyCommandExists = hotKeysArray.find((hotKeyItem) => hotKeyItem.command === tempHotkey.command);
        if(hotKeyCommandExists && (tempHotkey.description !== hotKeyCommandExists.description)){
            hotKeyCommandExists.description = tempHotkey.description + ' ' + t('or') + ' ' + hotKeyCommandExists.description ;
        }
        // const hotKeyExists = hotKeysArray.some((hotKeyItem) => hotKeyItem.description === tempHotkey.description);
        if (!hotKeyCommandExists) {
            hotKeysArray.push(tempHotkey);
        }
    });

    return (
        <Dialog id={'hotkeysDialog'} open={isOpen} onClose={onClose}>
            <DialogTitle id={'hotkeysDialogTitle'}>{`${pageTitle} ${t('hotkeys')}`}</DialogTitle>
            <DialogContent>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell id={'hotkeysDialogHeaderKey'}>
                                    {t('hotkeys')}
                                </TableCell>
                                <TableCell id={'hotkeysDialogHeaderDescription'}>
                                    {t('description')}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {hotKeysArray.map((hotkey, index) => (
                                <TableRow
                                    key={`${index}-${hotkey.command}`}
                                >
                                    <TableCell
                                        id={toCamelCaseWords(`hotkeysDialogEntryKey${index}`, toCamelCase(hotkey.command))}
                                        style={{ whiteSpace: 'nowrap' }}
                                    >
                                        {hotkey.command}
                                    </TableCell>
                                    <TableCell
                                        id={toCamelCaseWords(`hotkeysDialogEntryDescription${index}`, toCamelCase(hotkey.command))}
                                    >
                                        {hotkey.description}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </DialogContent>
            <DialogActions>
                <TmButton
                    testid={'hotkeysDialogClose'}
                    startIcon={<CancelIcon />}
                    onClick={onClose}
                >
                    {t('close')}
                </TmButton>
            </DialogActions>
        </Dialog>
    );
}
