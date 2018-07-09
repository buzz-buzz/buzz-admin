import React from "react";
import ServiceProxy from "../../service-proxy";
import store from '../../redux/store/index';
import {connect} from 'react-redux';
import {Breadcrumb, Card, Image} from "semantic-ui-react";
import moment from 'moment';
import {loadClass} from "../../redux/actions";

moment.locale('zh-cn');

class ClassDetail extends React.Component {
    async componentWillMount() {
        let classInfo = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v2/class-schedule/${this.props.match.params.class_id}`
            }
        });

        store.dispatch(loadClass(classInfo))
    }

    render() {
        const {class_id} = this.props.match.params;
        const classInfo = this.props.classes[class_id];

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


export default connect(store => ({classes: store.classes}))(ClassDetail)