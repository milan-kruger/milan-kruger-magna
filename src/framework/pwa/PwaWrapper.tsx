import { openDB } from 'idb';
import { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import packageJson from '../../../package.json';
import { BASE_URL } from '../const';

export type TerminalType =
    | 'standard'
    | 'scale'
    | 'prosecute'
    // | 'prestart'
    // | 'cashier'
    ;

export const terminalTypes: TerminalType[] = [
    'standard',
    'scale',
    'prosecute',
    // 'prestart', 
    // 'cashier',
];

export type PwaContextType = {
    isLaunchFileProcessed: boolean;
    terminalTypes: TerminalType[];
    isMacMatch: boolean;
    isPwa: boolean;
    showPwaInstallButton: boolean;
    handleInstallClick: () => Promise<void>;
    requestFileHandle: () => Promise<FileSystemFileHandle | undefined>;
}

export const PwaContext = createContext<PwaContextType>({
    isLaunchFileProcessed: false,
    terminalTypes: [],
    isMacMatch: false,
    isPwa: false,
    showPwaInstallButton: false,
    handleInstallClick: async () => Promise.resolve(),
    requestFileHandle: async () => Promise.resolve(undefined)
});

type Props = {
    children: ReactNode;
}

export function PwaWrapper({ children }: Readonly<Props>) {
    // Is PWA
    const isPwa = window.matchMedia('(display-mode: standalone)').matches;

    // PWA Install
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPwaInstallButton, setShowPwaInstallButton] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            console.log('PWA: Event received');
            // event.preventDefault(); // Show the browser default install UI as well
            setInstallPrompt(event as BeforeInstallPromptEvent);
            setShowPwaInstallButton(true);
        };

        const handleAppInstalled = () => {
            console.log('PWA: Installed');
            setInstallPrompt(null);
            setShowPwaInstallButton(false);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = useCallback(async () => {
        if (!installPrompt) return;
        const promptEvent = installPrompt;
        const result = await promptEvent.prompt();
        console.log(`PWA: The install prompt outcome is ${result.outcome}`);
        setInstallPrompt(null);
        setShowPwaInstallButton(false);
        window.location.reload();
    }, [installPrompt]);

    // Read File
    const [fileContents, setFileContents] = useState<string | null>(null);

    useEffect(() => {
        const initializeFileAccess = async () => {
            try {
                const fileHandle = await getFileHandleFromDB();
                if (fileHandle) {
                    const contents = await readFile(fileHandle);
                    setFileContents(contents);
                }
                else {
                    setFileContents(null);
                }
            }
            catch (error) {
                console.warn(error);
            }
        };
        initializeFileAccess();
    }, []);

    useEffect(() => {
        const handleFile = async () => {
            if (window.trafmanLaunchFile) {
                const fileHandle = window.trafmanLaunchFile;
                const validFile = await processFile(fileHandle);
                if (validFile) {
                    setFileContents(await readFile(fileHandle));
                }
            }
        };
        handleFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [window.trafmanLaunchFile]);

    const requestFileHandleWrapper = useCallback(async () => {
        const fileHandle = await requestFileHandle();
        if (fileHandle) {
            const validFile = await processFile(fileHandle);
            if (validFile) {
                setFileContents(await readFile(fileHandle));
            }
        }
        return fileHandle;
    }, []);

    // Load Terminal Types
    const [terminalTypes, setTerminalTypes] = useState<TerminalType[]>([]);
    const [fileMac, setFileMac] = useState('');
    useEffect(() => {
        if (fileContents) {
            try {
                const fileValues = atob(fileContents).split('->');
                setFileMac(fileValues[0].trim());
                setTerminalTypes(fileValues[1].trim().split(',').map(value => value.trim() as TerminalType));
            }
            catch (error) {
                console.error(error);
            }
        }
    }, [fileContents]);

    // Load MAC
    const [sysInfoMac, setSysInfoMac] = useState('');
    useEffect(() => {
        const loadSysInfo = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:7988?nocache=${new Date().getTime()}`, { cache: 'no-store' });
                const json = await response.json();
                setSysInfoMac(json.mac_address);
            }
            catch (error) {
                console.warn(error);
            }
        };
        loadSysInfo();
    }, [setSysInfoMac]);

    // RENDER
    return (
        <PwaContext.Provider value={
            useMemo<PwaContextType>(() => ({
                isLaunchFileProcessed: !!fileContents,
                terminalTypes: sysInfoMac === fileMac ? terminalTypes : [],
                isMacMatch: fileMac === sysInfoMac,
                isPwa,
                showPwaInstallButton,
                handleInstallClick,
                requestFileHandle: requestFileHandleWrapper
            }), [fileContents, terminalTypes, fileMac, sysInfoMac, isPwa, showPwaInstallButton, handleInstallClick, requestFileHandleWrapper])
        }>
            {children}
        </PwaContext.Provider>
    );
}

// PWA Install
type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<{ outcome: 'accepted' | 'dismissed', platform?: string }>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
    platforms?: Promise<string[]>;
}

// Read File
const DB_VERSION = 1;
const DB_NAME = 'file-handles';
const DB_STORE = 'files';
const DB_ENTRY = 'weighFile';

async function readFile(fileHandle: FileSystemFileHandle): Promise<TerminalType> {
    const file = await fileHandle.getFile();
    const contents = await file.text();
    return contents as TerminalType;
}

async function openDatabase() {
    return await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            db.createObjectStore(DB_STORE);
        }
    });
}

async function getFileHandleFromDB() {
    const db = await openDatabase();
    const fileHandle: FileSystemFileHandle = await db.get(DB_STORE, DB_ENTRY);
    return fileHandle;
}

async function storeFileHandleInDB(fileHandle: FileSystemFileHandle) {
    const db = await openDatabase();
    await db.put(DB_STORE, fileHandle, DB_ENTRY);
}

async function requestFileHandle() {
    const oldFileHandle = await getFileHandleFromDB();
    const options: ExtendedOpenFilePickerOptions = {
        types: [{
            description: 'Trafman Launch File',
            accept: { 'application/x-trafman': ['.trafman'] }
        }],
        startIn: oldFileHandle ?? 'documents',
        excludeAcceptAllOption: true
    };
    try {
        const [fileHandle] = await window.showOpenFilePicker(options);
        return fileHandle;
    }
    catch (error) {
        console.warn(error);
    }
    return undefined;
}

async function processFile(fileHandle: FileSystemFileHandle) {
    try {
        const manifestResponse = await fetch(`${BASE_URL}/manifest.json?v${packageJson.version}`, { cache: 'no-store' });
        const manifestData = await manifestResponse.json();
        const allowedFileName = manifestData['trafmanPwaLaunchFileName'];
        if (fileHandle) {
            const selectedFile = (await fileHandle.getFile()).name;
            if (allowedFileName === selectedFile) {
                await storeFileHandleInDB(fileHandle);
                return fileHandle;
            }
            else {
                console.error('Invalid file selected!', selectedFile, allowedFileName);
                alert(`Invalid file selected! Please use the ${allowedFileName} file.`);
            }
        }
    }
    catch (error) {
        console.warn(error);
    }
    return undefined;
}

type LaunchParams = {
    files: FileSystemFileHandle[];
}

type LaunchQueue = {
    setConsumer: (consumer: (launchParams: LaunchParams) => void) => void;
}

declare global {
    interface Window {
        launchQueue: LaunchQueue;
        trafmanLaunchFile?: FileSystemFileHandle;
    }
}

interface ExtendedOpenFilePickerOptions extends OpenFilePickerOptions {
    startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
}
