export const LOAD_CLASS = 'LOAD_CLASS';
export const LOAD_FEEDBACK = 'LOAD_FEEDBACK';
export const LOAD_CLASS_HOUR_HISTORY = 'LOAD_CLASS_HOUR_HISTORY';
export const LOAD_CREDITS_HISTORY = 'LOAD_CREDITS_HISTORY';
export const CLEAR_CREDITS_HISTORY = 'CLEAR_CREDITS_HISTORY';
export const CLEAR_CLASS_HOUR_HISTORY = 'CLEAR_CLASS_HOUR_HISTORY';
export const CHANGE_USER_STATE = 'CHANGE_USER_STATE';

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

export function clearClassHourHistory(userId, pagination) {
    return {
        type: CLEAR_CLASS_HOUR_HISTORY,
        userId: userId,
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

export function clearCreditsHistory(userId, pagination) {
    return {
        type: CLEAR_CREDITS_HISTORY,
        userId: userId,
        pagination: pagination
    }
}

export function changeUserState(user, newState) {
    return {
        type: CHANGE_USER_STATE,
        user: user,
        newState: newState
    }
}
