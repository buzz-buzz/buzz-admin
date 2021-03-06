import {combineReducers} from 'redux'
import {ADD_FIRST_CLASS, ADD_LATEST_CLASS, ADD_USER_DEMO, CHANGE_USER_STATE, CLEAR_CLASS_HOUR_HISTORY, CLEAR_CREDITS_HISTORY, LOAD_ALL_SALES, LOAD_CLASS, LOAD_CLASS_HOUR_HISTORY, LOAD_CREDITS_HISTORY, LOAD_FEEDBACK} from '../actions'
import ServiceProxy from "../../service-proxy";

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

async function changeUserState(state = {}, action) {
    switch (action.type) {
        case CHANGE_USER_STATE:
            console.log('changing user state)')
            const result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/user-states/${action.user.user_id}`,
                    json: {
                        newState: action.newState,
                        remark: action.remark
                    },
                    method: 'PUT'
                }
            })
            console.log('result = ', result)
            return {
                ...state,
                [action.user.user_id]: {...action.user, state: result.state}
            }
        default:
            return state
    }
}

function loadAllSales(state = null, action) {
    switch (action.type) {
        case LOAD_ALL_SALES:
            return [...action.payload]
        default:
            return state
    }
}

function userDemoReducer(state = {}, action) {
    switch (action.type) {
        case ADD_USER_DEMO:
            return {
                ...state,
                [action.userId]: action.userDemo
            };
        default:
            return state;
    }
}

function userFirstClassReducer(state = {}, action) {
    switch (action.type) {
        case ADD_FIRST_CLASS:
            return {
                ...state,
                [action.userId]: action.firstClass
            };

        default:
            return state;
    }
}

function userLatestEndClassReducer(state = {}, action) {
    switch (action.type) {
        case ADD_LATEST_CLASS:
            return {
                ...state,
                [action.userId]: action.latestEndClass
            };

        default:
            return state;
    }
}

export default combineReducers({
    classes: classReducer,
    feedbacks: feedbackReducer,
    classHourHistory: classHourHistory,
    creditsHistory: creditsHistory,
    users: changeUserState,
    allSales: loadAllSales,
    userDemo: userDemoReducer,
    firstClass: userFirstClassReducer,
    latestEndClass: userLatestEndClassReducer,
})
