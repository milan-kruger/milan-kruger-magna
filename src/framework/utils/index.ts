import { t } from "i18next";

export default function toCamelCase(input: string): string {
    const words = input.replace(/_/g, ' ').replace(/[()]/g, '').trim().split(/\s+/);
    return toCamelCaseWords(...words);
}

export function toCamelCaseWords(...words: string[]) {
    const camelCaseWords = words.map((word, index) => {
        if (index === 0) {
            // return word.toLowerCase();
            return word;
        }
        // const capitalized = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    return camelCaseWords.join('').replace(/[()]/g, '');
}

export function titleCaseWord(word: string) {
    if (!word) return word;
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

export function toTitleCase(input?: string | null): string {
    if (!input) return '';
    return input.split(' ').map(titleCaseWord).join(' ');
}

export function containsSpecialCharacters(value: string | undefined) {
    const regEx = /^[\d\w\s]*$/gm;
    return value ? value.includes('_') || !regEx.test(value) : false;
}

export function fieldsWidth(isMobile: boolean) {
    return isMobile ? '9em' : '14em'
}

export function removeUnderscores(value: string) {
    // Replace underscores with spaces without changing the case of the letters
    return value.replace(/_/g, ' ');
}

export function localiseCourtName(name: string): string {
    return name.replaceAll("Court", `${t("court")}`);
}
