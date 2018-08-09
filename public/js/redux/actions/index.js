export const LOAD_CLASS = 'LOAD_CLASS';
export const LOAD_FEEDBACK = 'LOAD_FEEDBACK';
export const LOAD_CLASS_HOUR_HISTORY = 'LOAD_CLASS_HOUR_HISTORY';
export const LOAD_CREDITS_HISTORY = 'LOAD_CREDITS_HISTORY';

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

export function loadClassHourHistory(userId, history, pagination) {
    return {
        type: LOAD_CLASS_HOUR_HISTORY,
        userId: userId,
        history: history,
        pagination: pagination
    }
}

export function loadCreditsHistory(userId, history, pagination) {
    return {
        type: LOAD_CREDITS_HISTORY,
        userId: userId,
        history: history,
        pagination: pagination
    }
}
