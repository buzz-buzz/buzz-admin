import * as React from "react";
import {Container} from "semantic-ui-react";
import UserList from "../users/list";
import {UserTypes} from "../users/config";

export default class CompanionList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <Container>
                <UserList user-type={UserTypes.companion} match={this.props.match}></UserList>
            </Container>
        )
    }
}