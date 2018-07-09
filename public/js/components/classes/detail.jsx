import React from "react";
import ServiceProxy from "../../service-proxy";
import {LOAD_CLASS} from "../../redux/actions/index";
import store from '../../redux/store/index';
import {connect} from 'react-redux';
import {Breadcrumb, Card, Image} from "semantic-ui-react";
import moment from 'moment';

moment.locale('zh-cn');

class ClassDetail extends React.Component {
    async componentDidMount() {
        let classInfo = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v2/class-schedule/${this.props.match.params.class_id}`
            }
        });

        store.dispatch({
            type: LOAD_CLASS,
            classInfo: classInfo
        })
    }

    render() {
        const {classInfo} = this.props;
        const {class_id} = this.props.match.params;

        if (!classInfo) {
            return null
        }

        return <Card fluid>
            <Card.Content>
                <Image floated="right" size="mini" src={classInfo.companion_avatar}/>
                <Card.Header>
                    {classInfo.companion_name}
                </Card.Header>
                <Card.Meta>({class_id}) {classInfo.name}</Card.Meta>
                <Card.Meta>
                    <Breadcrumb>
                        <Breadcrumb.Section>{classInfo.module}</Breadcrumb.Section>
                        <Breadcrumb.Divider/>
                        <Breadcrumb.Section>{classInfo.topic}</Breadcrumb.Section>
                        <Breadcrumb.Divider/>
                        <Breadcrumb.Section>{classInfo.topic_level}</Breadcrumb.Section>
                    </Breadcrumb>
                </Card.Meta>
                <Card.Meta>
                    {moment(classInfo.start_time).format('llll')} - {moment(classInfo.end_time).format('LT')}
                </Card.Meta>
                <Card.Description>
                    {
                        classInfo.student_ids &&
                        classInfo.student_ids.map(id =>
                            <Image src={`/avatar/${id}`} as={'a'} size={'mini'}
                                   href={`/users/${id}`}
                                   target="_blank" key={id}/>)
                    }
                </Card.Description>
            </Card.Content>
            <Card.Content extra>
                <a className="ui yellow button" href={classInfo.room_url}
                   target="_blank">进入教室</a>
            </Card.Content>
        </Card>
    }
}


export default connect(store => ({classInfo: store.classState}))(ClassDetail)