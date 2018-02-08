import * as React from "react";

export default class StudentList extends React.Component {
    clickMe() {
        alert('ai');
    }

    render() {
        return (
            <div>
                <h1>Hello Students Client side!</h1>
                <button onClick={this.clickMe}>Click me</button>
            </div>
        )
    }
}