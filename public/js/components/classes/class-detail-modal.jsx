import * as React from "react";
import {Button, Form, Header, Message, Modal, TextArea} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class ClassDetail extends React.Component {
    constructor() {
        super();

        this.state = {
            className: '',
            classroomUrl: '',
            startTime: '',
            endTime: '',
            companionId: '',
            students: '',
            exercises: '',
            remark: ''
        }

        this.close = this.close.bind(this);
        this.createClass = this.createClass.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.saveClass = this.saveClass.bind(this);
    }

    close() {
        this.props.onClose();
    }

    handleChange(event, {name, value}) {
        this.setState({[name]: value});
    }

    async saveClass() {
        await this.createClass();
    }

    componentWillReceiveProps(nextProps) {
        let exercises = nextProps.class ? nextProps.class.exercises : '';
        let startTime = nextProps.class ? nextProps.class.start_time : '';
        let endTime = nextProps.class ? nextProps.class.end_time : '';
        let students = nextProps.class ? (nextProps.class.students || []).join(',') : '';

        try {
            exercises = JSON.parse(exercises).join('\n');
            startTime = new Date(startTime).toISOString().slice(0, -1);
            endTime = new Date(endTime).toISOString().slice(0, -1);
        } catch (error) {

        } finally {
            this.setState({
                className: nextProps.class ? nextProps.class.name : '',
                classroomUrl: nextProps.class ? nextProps.class.room_url : '',
                startTime: startTime,
                endTime: endTime,
                companionId: nextProps.class ? nextProps.class.companion_id : '',
                students: students,
                exercises: exercises,
                remark: nextProps.class ? nextProps.class.remark : '',
                class_id: nextProps.class ? nextProps.class.class_id : ''
            });
        }
    }

    async createClass() {
        this.setState({loading: true});
        try {
            let json = {
                companions: [this.state.companionId],
                students: (this.state.students || '').split(','),
                start_time: new Date(this.state.startTime),
                end_time: new Date(this.state.endTime),
                status: 'opened',
                name: this.state.className,
                exercises: JSON.stringify(this.state.exercises.split(/\r?\n/)),
                room_url: this.state.classroomUrl,
                remark: this.state.remark,
                adviser_id: this.state.remark,
                class_id: this.state.class_id
            };
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/class-schedule`,
                    method: 'POST',
                    json: json
                }
            })

            json.start_time = json.start_time.toISOString();
            json.end_time = json.end_time.toISOString();
            json.class_id = result.class_id;
            this.setState({
                class_id: result.class_id
            })

            this.props.onClassSaved(json);
        } catch (error) {
            this.setState({
                error: true,
                message: JSON.stringify(error.result ? error.result : (error.message ? error.message : error))
            })
        } finally {
            this.setState({loading: false});
        }
    }

    render() {
        return (
            <Modal open={this.props.open} onClose={this.close}>
                <Header>班级详情</Header>
                <Modal.Content>
                    <Form loading={this.state.loading} error={this.state.error}>
                        <Message error content={this.state.message} header="出错啦"></Message>
                        <Form.Group>
                            <Form.Input label="课程名称" placeholder="课程名称" value={this.state.className} name="className"
                                        onChange={this.handleChange}/>
                            <Form.Input label="教室链接" placeholder="教室链接" value={this.state.classroomUrl}
                                        name="classroomUrl" onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input label="开始时间" placeholder="开始时间" value={this.state.startTime}
                                        type="datetime-local" name="startTime" onChange={this.handleChange}/>
                            <Form.Input label="结束时间" placeholder="结束时间" value={this.state.endTime}
                                        type="datetime-local" name="endTime" onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input label="外籍伙伴" placeholder="外籍伙伴" value={this.state.companionId}
                                        name="companionId" onChange={this.handleChange}/>
                            <Form.Input label="中国学生" placeholder="中国学生" value={this.state.students} name="students"
                                        onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group>
                            <TextArea autoHeight placeholder="练习音频链接，一行一个" rows="3"
                                      value={this.state.exercises} name="exercises"
                                      onChange={this.handleChange} label="练习音频链接"></TextArea>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input label="备注" placeholder="备注" value={this.state.remark} name="remark"
                                        onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group>
                            {this.state.class_id ?
                                <Button onClick={this.saveClass}>保存</Button>
                                :
                                <Button onClick={this.createClass}>创建</Button>
                            }
                        </Form.Group>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
}