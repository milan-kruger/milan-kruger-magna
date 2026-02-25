import { IDType } from './IDType';

export function isValidSouthAfricanID(idNumber: string, idType: IDType): boolean {
    return isValidLuhnAlgorithm(idNumber, idType) && IsValidIdentificationLength(idNumber.length, idType) && isValidPassportFormat(idNumber, idType);
}

function IsValidIdentificationLength(length: number, idType: IDType): boolean {
    if (idType ==='DRIVING_LICENCE' && length !== 12) {
        return false;
    }
    else if (idType === 'NATIONAL_ID' && length !== 13) {
        return false;
    }
    else if (idType ==='PASSPORT' && length !== 9) {
        return false;
    }
    return true;
}

function isValidPassportFormat(passportNumber: string, idType: IDType): boolean {
    if (idType ==='PASSPORT' && !['M', 'E', 'A'].includes(passportNumber.charAt(0))) {
        return false;
    }
    return true;
}

function isValidLuhnAlgorithm(idNumber: string, idType: IDType): boolean {
    if (idType === 'NATIONAL_ID') {
        const reverseNumber = idNumber.split('').reverse().join('');
        let sum = 0;
        let isSecondDigit = false;
        for (const digit of reverseNumber) {
            if (isSecondDigit) {
                let doubleDigit = parseInt(digit) * 2;
                if (doubleDigit > 9) {
                    doubleDigit -= 9;
                }
                sum += doubleDigit;
            }
            else {
                sum += parseInt(digit);
            }
            isSecondDigit = !isSecondDigit;
        }
        return sum % 10 === 0;
    }
    return true;
}