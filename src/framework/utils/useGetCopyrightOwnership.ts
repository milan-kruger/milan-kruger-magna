import { selectConfig } from '../config/configSlice';
import { useAppSelector } from '../redux/hooks';

export function useGetCopyrightOwnership() {
    const { config: { clientName } } = useAppSelector(selectConfig);

    const ownership = clientName.en.includes('Fischer') ? 'FCA' : 'Magna';
    const ownershipFullName = ownership === 'FCA' ? 'FCA Limited' : 'Magna BC';
    
    return {ownership, ownershipFullName};
}
