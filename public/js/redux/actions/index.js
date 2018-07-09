export const LOAD_CLASS = 'LOAD_CLASS';
export const LOAD_FEEDBACK = 'LOAD_FEEDBACK';

export function loadClass(classInfo) {
    return {
        type: LOAD_CLASS,
        classInfo: classInfo
    }
}

export function loadFeedbacks(feedbacks) {
    return {
        type: LOAD_FEEDBACK,
        feedbacks: feedbacks
    }
}