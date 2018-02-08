import StudentList from "./components/students/list";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import ClassList from "./components/classes/list";

var React = require('react');// Don't delete this line!
var ReactDOM = require('react-dom');

function initApp() {
    var container = document.getElementById('content');
    // reuse server side render result
    ReactDOM.render(
        <BrowserRouter>
            <Switch>
                <Route path='/students' component={StudentList}/>
                <Route path="/classes" component={ClassList}/>
            </Switch>
        </BrowserRouter>,
        container
    );
}

initApp();
