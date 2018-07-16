import React from "react";
import {connect} from 'react-redux';
import {Card, Image, Dimmer, Rating, Segment} from "semantic-ui-react";
import store from '../../redux/store/index';
import ServiceProxy from "../../service-proxy";
import {loadFeedbacks} from "../../redux/actions";
import moment from "moment";
import {Avatar} from "../../common/Avatar";
import BarChart from "./bar-chart";

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
        let key = `${classId}-${fromUserId}-${toUserId}-`;
        const feedback = feedbacks[key];
        const otherFeedbacks = Object.keys(feedbacks).filter(f => f.startsWith(key) && feedbacks[f].type).map(f => feedbacks[f]);
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
                        <Segment>
                            <span>总体评分：</span>
                            <Rating icon='star' defaultRating={feedback.score} maxRating={5} disabled/>
                            （{feedback.score}）
                        </Segment>
                    }
                    <Segment>
                        {feedback && feedback.comment}
                    </Segment>
                    {
                        otherFeedbacks.length > 0 &&
                        <Segment>
                            {
                                otherFeedbacks.map(f => (
                                    <div key={f.type} style={{display: 'flex', justifyContent: 'space-between'}}>
                                        <span>{f.type}：</span>
                                        <Rating icon="star"
                                                defaultRating={f.score}
                                                maxRating={5} disabled/>
                                        （{f.score}）
                                    </div>
                                ))
                            }
                        </Segment>
                    }
                    {
                        otherFeedbacks.length > 0 && false &&
                        <Segment>
                            <BarChart id={key} feedbacks={otherFeedbacks} size={[500, 500]}/>
                        </Segment>
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