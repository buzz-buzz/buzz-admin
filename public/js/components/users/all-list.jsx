import * as React from "react";
import UserList from "../users/list";

export default class AllUserList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }


    render() {
        return (
            <UserList match={this.props.match}/>
        )
    }
}
