import React from "react";
import {connect} from 'react-redux';
import {Card, Image} from "semantic-ui-react";

class FeedbackCard extends React.Component {
    render() {
        const {fromUserId, toUserId, classId} = this.props;
        return <Card>
            <Image floated="right" size="mini" src={`/avatar/${toUserId}`} as='a' href={`/users/${toUserId}`}
                   target="_blank"/>
            <Card.Content>
                <Card.Header></Card.Header>
                <Card.Meta></Card.Meta>
                <Card.Description></Card.Description>
            </Card.Content>
            <Card.Content extra>
                <a href={`/users/${fromUserId}`} target="_blank">
                    <Image avatar src={`/avatar/${fromUserId}`}/>
                </a>
            </Card.Content>
        </Card>
    }
}

export default connect()(FeedbackCard)