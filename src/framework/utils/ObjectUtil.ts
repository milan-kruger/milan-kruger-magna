export default class ObjectUtil {
    static hasChanged = (obj: any, compare: any): boolean => {
        if (Array.isArray(obj) && Array.isArray(compare)) {
            if (obj.length !== compare.length) {
                return true;
            }

            for (let i = 0; i < obj.length; i++) {
                if (ObjectUtil.hasChanged(obj[i], compare[i])) {
                    return true;
                }
            }

            return false;
        }

        for (const key in obj) {
            const value = obj[key];
            const compareValue = compare?.[key];

            if (value instanceof Object && !(value instanceof Date)) {
                // Recurse only if both are objects and not null
                const result = (compareValue === null || compareValue === undefined)
                    ? true
                    : ObjectUtil.hasChanged(value, compareValue);
                if (result) return true;
            } else {
                const normalized = ObjectUtil.normalize(value);
                const normalizedCompare = ObjectUtil.normalize(compareValue);
                if (normalized !== normalizedCompare) {
                    return true;
                }
            }
        }

        // Also check for extra keys in 'compare' that are not in 'obj'
        for (const key in compare) {
            if (typeof obj === 'object' && !(key in obj)) {
                const normalizedCompare = ObjectUtil.normalize(compare[key]);
                if (normalizedCompare !== ObjectUtil.normalize(null)) {
                    return true;
                }
            }
        }

        return false;
    };

    static normalize(value: any): string {
        if (value === null || value === undefined || String(value).trim() === '') {
            return 'null'; // Treat null, undefined, and empty as equal
        }
        return String(value).trim().toLowerCase();
    }
}
