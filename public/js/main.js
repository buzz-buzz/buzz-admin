var React = require('react');// Don't delete this line!
var ReactDOM = require('react-dom');

function initApp() {
    var container = document.getElementById('content');
    // reuse server side render result
    ReactDOM.render(
        <p>Hello</p>,
        container
    );
}

initApp();
