import React from "react";
import {connect} from 'react-redux';
import {Card, Image, Dimmer} from "semantic-ui-react";
import store from '../../redux/store/index';
import ServiceProxy from "../../service-proxy";
import {loadFeedbacks} from "../../redux/actions";
import moment from "moment";

class FeedbackCard extends React.Component {
    async componentWillMount() {
        let feedbacks = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v1/class-feedback/${this.props.classId}/${this.props.fromUserId}/evaluate/${this.props.toUserId}`
            }
        });

        store.dispatch(loadFeedbacks(feedbacks));
    }

    render() {
        const {fromUserId, toUserId, classId, feedbacks} = this.props;
        const feedback = feedbacks[`${classId}-${fromUserId}-${toUserId}`];
        return <Dimmer.Dimmable as={Card} dimmed={!feedback}>
            <Card.Content>
                <Image floated="right" size="mini" src={`/avatar/${toUserId}`} as='a' href={`/users/${toUserId}`}
                       target="_blank"/>
                <Card.Header>给 {feedback && feedback.to_name}</Card.Header>
                <Card.Meta>
                    {feedback && feedback.feedback_time ? moment(feedback.feedback_time).format('llll') : null}
                </Card.Meta>
                <Card.Description>
                    {feedback && feedback.comment}
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <a href={`/users/${fromUserId}`} target="_blank">
                    <span>来自</span>
                    <Image avatar src={`/avatar/${fromUserId}`}/>
                    <span>{feedback && feedback.from_name}</span>
                </a>
            </Card.Content>
            <Dimmer active={!feedback} inverted/>
        </Dimmer.Dimmable>
    }
}

export default connect(store => ({feedbacks: store.feedbacks}))(FeedbackCard)