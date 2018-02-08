import StudentList from "./components/students/list";
import {BrowserRouter, Route} from 'react-router-dom';

var React = require('react');// Don't delete this line!
var ReactDOM = require('react-dom');

function initApp() {
    var container = document.getElementById('content');
    // reuse server side render result
    ReactDOM.render(
        <BrowserRouter>
            <Route path='/students' component={StudentList}/>
        </BrowserRouter>,
        container
    );
}

initApp();
