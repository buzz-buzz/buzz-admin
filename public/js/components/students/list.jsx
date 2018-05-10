import * as React from "react";
import UserList from "../users/list";
import {MemberType} from "../../common/MemberType";

export default class StudentList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }


    render() {
        return (
            <UserList user-type={MemberType.Student} match={this.props.match}/>
        )
    }
}
