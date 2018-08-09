import {combineReducers} from 'redux'
import {CLEAR_CLASS_HOUR_HISTORY, CLEAR_CREDITS_HISTORY, LOAD_CLASS, LOAD_CLASS_HOUR_HISTORY, LOAD_CREDITS_HISTORY, LOAD_FEEDBACK} from '../actions'

function classReducer(state = {}, action) {
    switch (action.type) {
        case LOAD_CLASS:
            return {
                ...state,
                [action.classInfo.class_id]: {
                    ...action.classInfo,
                    student_ids: action.classInfo.students.split(','),
                    companion_id: action.classInfo.companions.split(',')[0]
                }
            };

        default:
            return state
    }
}

function feedbackReducer(state = {}, action) {
    switch (action.type) {
        case LOAD_FEEDBACK:
            let result = {...state};
            action.feedbacks && action.feedbacks.map(f => result[`${f.class_id}-${f.from_user_id}-${f.to_user_id}-${f.type}`] = f);
            return result;

        default:
            return state
    }
}

function classHourHistory(state = {}, action) {
    switch (action.type) {
        case LOAD_CLASS_HOUR_HISTORY:
            return {
                ...state,
                [`${action.userId}-${action.pagination.current_page}`]: action.history,
            }
        case CLEAR_CLASS_HOUR_HISTORY:
            return {}
        default:
            return state
    }
}

function creditsHistory(state = {}, action) {
    switch (action.type) {
        case LOAD_CREDITS_HISTORY:
            return {
                ...state,
                [`${action.userId}-${action.pagination.current_page}`]: action.history,
            }
        case CLEAR_CREDITS_HISTORY:
            return {}
        default:
            return state
    }
}

export default combineReducers({
    classes: classReducer,
    feedbacks: feedbackReducer,
    classHourHistory: classHourHistory,
    creditsHistory: creditsHistory,
})
