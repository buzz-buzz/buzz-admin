import React from "react";
import {connect} from 'react-redux';
import {Card, Container, Grid} from "semantic-ui-react";
import ClassDetail from "../classes/detail";
import FeedbackCard from './feedback-card';

class FeedbackDetail extends React.Component {
    async componentDidMount() {
    }

    render() {
        const classInfo = this.props.classes[this.props.match.params.class_id];

        return <Container fluid>
            <ClassDetail match={this.props.match}/>
            <h2>外籍语伴对中方学生的评价</h2>
            <Grid columns='equal'>
                {
                    classInfo &&
                    classInfo.student_ids &&
                    classInfo.student_ids.map(id => <Grid.Column key={id}>
                            <FeedbackCard key={id} fromUserId={classInfo.companion_id}
                                          toUserId={id}
                                          classId={classInfo.class_id}/>
                        </Grid.Column>
                    )
                }
            </Grid>
            <h2>中方学生对外籍语伴的评价</h2>
            <Grid columns='equal'>
                {
                    classInfo &&
                    classInfo.student_ids &&
                    classInfo.student_ids.map(id => <Grid.Column key={id}>
                        <FeedbackCard key={id} fromUserId={id}
                                      toUserId={classInfo.companion_id}
                                      classId={classInfo.class_id}/></Grid.Column>)
                }
            </Grid>
        </Container>
    }
}

export default connect(store => ({classes: store.classes}))(FeedbackDetail)
