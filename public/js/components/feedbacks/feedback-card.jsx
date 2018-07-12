import React from "react";
import {connect} from 'react-redux';
import {Card, Image, Dimmer, Rating} from "semantic-ui-react";
import store from '../../redux/store/index';
import ServiceProxy from "../../service-proxy";
import {loadFeedbacks} from "../../redux/actions";
import moment from "moment";
import {Avatar} from "../../common/Avatar";

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
        const feedback = feedbacks[`${classId}-${fromUserId}-${toUserId}-`];
        return <Dimmer.Dimmable as={Card} dimmed={!feedbacks}>
            <Card.Content>
                <a href={`/users/${toUserId}`} target="_blank">
                    <Avatar floated="right" userId={toUserId} href={`/users/${toUserId}`}/>
                </a>
                <Card.Meta>
                    {feedback && feedback.feedback_time ? moment(feedback.feedback_time).format('llll') : null}
                </Card.Meta>
                <Card.Description>
                    {
                        feedback &&
                        <div>
                            <span>课堂表现：</span>
                            <Rating icon='star' defaultRating={feedback.score} maxRating={5} disabled/>
                            （{feedback.score}）
                        </div>
                    }
                </Card.Description>
                <Card.Description style={{fontWeight: 'bold'}}>
                    {feedback && feedback.comment}
                </Card.Description>
                <Card.Description>
                    {
                        feedbacks &&
                        Object.keys(feedbacks).filter(f => feedbacks[f].type).map(f => (
                            <div key={f} style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span>{feedbacks[f].type}：</span>
                                <Rating icon="star"
                                        defaultRating={feedbacks[f].score}
                                        maxRating={5} disabled/>
                                （{feedbacks[f].score}）
                            </div>
                        ))
                    }
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <a href={`/users/${fromUserId}`} target="_blank">
                    <span>来自</span>
                    <Avatar userId={fromUserId}/>
                </a>
            </Card.Content>
            <Dimmer active={!feedback} inverted/>
        </Dimmer.Dimmable>
    }
}

export default connect(store => ({feedbacks: store.feedbacks}))(FeedbackCard)