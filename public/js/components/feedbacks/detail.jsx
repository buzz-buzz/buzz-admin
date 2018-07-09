import React from "react";
import {connect} from 'react-redux';
import {Card, Container} from "semantic-ui-react";
import ClassDetail from "../classes/detail";
import FeedbackCard from './feedback-card';

class FeedbackDetail extends React.Component {
    async componentDidMount() {
    }

    render() {
        const classInfo = this.props.classes[this.props.match.params.class_id];

        return <Container>
            <ClassDetail match={this.props.match}/>
            <h2>外籍语伴对中方学生的评价</h2>
            <Card.Group>
                {
                    classInfo &&
                    classInfo.student_ids &&
                    classInfo.student_ids.map(id => <FeedbackCard key={id} fromUserId={classInfo.companion_id}
                                                                  toUserId={id}
                                                                  classId={classInfo.class_id}/>)
                }
            </Card.Group>
            <h2>中方学生对外籍语伴的评价</h2>
            <Card.Group>
                {
                    classInfo &&
                    classInfo.student_ids &&
                    classInfo.student_ids.map(id => <FeedbackCard key={id} fromUserId={id}
                                                                  toUserId={classInfo.companion_id}
                                                                  classId={classInfo.class_id}/>)
                }
            </Card.Group>
        </Container>
    }
}

export default connect(store => ({classes: store.classes}))(FeedbackDetail)