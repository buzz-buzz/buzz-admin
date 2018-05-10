import * as React from "react";
import {Container} from "semantic-ui-react";
import UserList from "../users/list";
import {MemberType} from "../../common/MemberType";

export default class CompanionList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <Container>
                <UserList user-type={MemberType.Companion} match={this.props.match}></UserList>
            </Container>
        )
    }
}