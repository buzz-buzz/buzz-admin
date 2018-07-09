export const LOAD_CLASS = 'LOAD_CLASS'

export function loadClass(classInfo) {
    return {
        type: LOAD_CLASS,
        payload: classInfo
    }
}