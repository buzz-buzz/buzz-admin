import {combineReducers} from 'redux'
import {LOAD_CLASS, LOAD_FEEDBACK} from '../actions'

function classReducer(state = {}, action) {
    switch (action.type) {
        case LOAD_CLASS:
            console.log('loading ...', action);
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
            action.feedbacks && action.feedbacks.map(f => result[`${f.class_id}-${f.from_user_id}-${f.to_user_id}`] = f);
            return result;

        default:
            return state
    }
}

export default combineReducers({
    classes: classReducer,
    feedbacks: feedbackReducer,
})