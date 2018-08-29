export const LOAD_CLASS = 'LOAD_CLASS';
export const LOAD_FEEDBACK = 'LOAD_FEEDBACK';
export const LOAD_CLASS_HOUR_HISTORY = 'LOAD_CLASS_HOUR_HISTORY';
export const LOAD_CREDITS_HISTORY = 'LOAD_CREDITS_HISTORY';
export const CLEAR_CREDITS_HISTORY = 'CLEAR_CREDITS_HISTORY';
export const CLEAR_CLASS_HOUR_HISTORY = 'CLEAR_CLASS_HOUR_HISTORY';
export const CHANGE_USER_STATE = 'CHANGE_USER_STATE';
export const LOAD_ALL_SALES = 'LOAD_ALL_SALES';
export const ADD_USER_DEMO = 'ADD_USER_DEMO';
export const ADD_FIRST_CLASS = 'ADD_FIRST_CLASS';
export const ADD_LATEST_CLASS = 'ADD_LATEST_CLASS';

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

export function changeUserState(user, newState, remark) {
    console.log('dispatching...', user, newState, remark)
    return {
        type: CHANGE_USER_STATE,
        user: user,
        newState: newState,
        remark
    }
}

export function loadAllSales(users) {
    return {
        type: LOAD_ALL_SALES,
        payload: users
    }
}


export function addUserDemo(userId, userDemo) {
    return {
        type: ADD_USER_DEMO,
        userId: userId,
        userDemo
    }
}

export function addFirstClass(userId, firstClass) {
    return {
        type: ADD_FIRST_CLASS,
        userId: userId,
        firstClass
    }
}

export function addLatestEndClass(userId, latestEndClass) {
    return {
        type: ADD_LATEST_CLASS,
        userId,
        latestEndClass
    }
}
