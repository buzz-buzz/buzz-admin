import React from "react";
import ServiceProxy from "../../service-proxy";
import {LOAD_CLASS} from "../../redux/actions/index";
import store from '../../redux/store/index';
import {connect} from 'react-redux';
import {Breadcrumb, Card, Container, Image} from "semantic-ui-react";
import moment from 'moment';
import ClassDetail from "../classes/detail";

moment.locale('zh-cn');

class FeedbackDetail extends React.Component {
    async componentDidMount() {
    }

    render() {

        return <Container>
            <ClassDetail match={this.props.match}/>
        </Container>
    }
}

export default connect(null)(FeedbackDetail)