import * as React from "react";
import UserList from "../users/list";
import {UserTypes} from "../users/config";

export default class StudentList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }


    render() {
        return (
            <UserList user-type={UserTypes.student} match={this.props.match}/>
        )
    }
}
