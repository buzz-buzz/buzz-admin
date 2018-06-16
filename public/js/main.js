import StudentList from "./components/students/list";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import ClassList from "./components/classes/list";
import CompanionList from "./components/companions/list";
import history from './components/common/history.js';
import {configureUrlQuery} from 'react-url-query';
import AllUserList from "./components/users/all-list";

var React = require('react');// Don't delete this line!
var ReactDOM = require('react-dom');

function initApp() {
    configureUrlQuery({history});

    var container = document.getElementById('content');

    // reuse server side render result
    ReactDOM.render(
        <BrowserRouter>
            <Switch>
                <Route path='/users/:userId?' component={AllUserList}/>
                <Route path='/students/:userId?' component={StudentList}/>
                <Route path="/companions/:userId?" component={CompanionList}/>
                <Route path="/classes" component={ClassList}/>
            </Switch>
        </BrowserRouter>
        ,
        container
    );
}

initApp();
