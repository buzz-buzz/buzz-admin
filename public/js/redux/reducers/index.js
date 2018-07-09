import {combineReducers} from 'redux'
import {LOAD_CLASS} from '../actions'

function classReducer(state = {}, action) {
    switch (action.type) {
        case LOAD_CLASS:
            return {
                ...action.classInfo,
                student_ids: action.classInfo.students.split(','),
                companion_id: action.classInfo.companions.split(',')[0]
            }

        default:
            return state
    }
}

export default combineReducers({
    classState: classReducer
})