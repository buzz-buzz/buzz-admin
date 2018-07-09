import React from "react";
import {connect} from 'react-redux';
import {Card, Image} from "semantic-ui-react";
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
        console.log('key = ', `${classId}-${fromUserId}-${toUserId}`);
        const feedback = feedbacks[`${classId}-${fromUserId}-${toUserId}`];
        console.log('feedback = ', feedback, feedbacks);
        return <Card>
            <Image floated="right" size="mini" src={`/avatar/${toUserId}`} as='a' href={`/users/${toUserId}`}
                   target="_blank"/>
            <Card.Content>
                <Card.Header></Card.Header>
                <Card.Meta>
                    {feedback && feedback.feedback_time ? moment(feedback.feedback_time).format('llll') : null}
                </Card.Meta>
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

export default connect(store => ({feedbacks: store.feedbacks}))(FeedbackCard)