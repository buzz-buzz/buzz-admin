import * as React from "react";
import {Button, Dropdown, Form, Header, Message, Modal, TextArea} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import TimeHelper from "../../common/TimeHelper";
import ClassEvaluation from './class-evaluation-modal';


export default class ClassDetail extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            className: '',
            classroomUrl: '',
            startTime: '',
            endTime: '',
            companions: [],
            students: [],
            exercises: '',
            remark: '',
            availableStudents: [],
            availableCompanions: [],
            error: false,
            companion: '0',
            dirty: false,
            topic_level: '',
            topic: '',
        }

        this.close = this.close.bind(this);
        this.saveClass = this.saveClass.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSearchStudentChange = this.handleSearchStudentChange.bind(this);
        this.handleSearchCompanionChange = this.handleSearchCompanionChange.bind(this);
        this.getAvailableCompanions = this.getAvailableCompanions.bind(this);

        this.openClassEvaluation = this.openClassEvaluation.bind(this);
        this.onClassEvaluationClosed = this.onClassEvaluationClosed.bind(this);
    }

    close() {
        if (this.state.dirty) {
            if (window.confirm('有改动未保存，确认关闭吗？')) {
                this.setState({dirty: false}, this.props.onClose);
            }
        } else {
            this.props.onClose();
        }
    }


    handleChange(event, {name, value}) {
        if (name === 'companion') {
            this.setState({companions: [value]})
        }

        this.setState({[name]: value, dirty: true});
        if (name === 'topic') {
            var reg = /(^\s*)(\s*$)/;
            console.log(reg.test(event.target.value));
            if (reg.test(event.target.value)) {
                event.target.value = '';
                this.setState({topic: '', buttonDisabled: true});
            }
            else {
                this.setState({topic: event.target.value, buttonDisabled: false});
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        let exercises = nextProps.class ? nextProps.class.exercises : '';
        let startTime = nextProps.class ? nextProps.class.start_time : '';
        let endTime = nextProps.class ? nextProps.class.end_time : '';
        let students = nextProps.class ? nextProps.class.students.map(userId => Number(userId)) : [];
        let companions = nextProps.class ? nextProps.class.companions.map(userId => Number(userId)) : [];

        try {
            if (exercises) {
                exercises = JSON.parse(exercises).join('\n');
            }
            startTime = TimeHelper.toLocalDateTime(new Date(startTime));
            endTime = TimeHelper.toLocalDateTime(new Date(endTime));
        } catch (error) {
            console.error(error);
        } finally {
            this.setState({
                className: nextProps.class ? nextProps.class.name : '',
                classroomUrl: nextProps.class ? nextProps.class.room_url : '',
                startTime: startTime,
                endTime: endTime,
                companions: companions,
                students: students,
                exercises: exercises,
                remark: nextProps.class ? nextProps.class.remark || '' : '',
                class_id: nextProps.class ? nextProps.class.class_id : '',
                companion: companions[0] || '',
                topic_level: nextProps.class ? nextProps.class.topic_level : '',
                topic: nextProps.class ? nextProps.class.topic : '',
                buttonDisabled: nextProps.buttonDisabled || true
            }, () => {
                console.log(this.state)
            });
        }
    }

    openClassEvaluation() {
        this.setState({
            evaluationOpen: true,
            currentEvaluation: this.state,
        })
    }

    onClassEvaluationClosed() {
        this.setState({evaluationOpen: false})
    }

    async saveClass() {
        this.setState({loading: true});

        try {
            let json = {
                companions: [this.state.companion],
                students: this.state.students.filter(s => Number(s) > 0),
                start_time: new Date(this.state.startTime),
                end_time: new Date(this.state.endTime),
                status: 'opened',
                name: this.state.className,
                exercises: JSON.stringify(this.state.exercises.split(/\r?\n/)),
                room_url: this.state.classroomUrl,
                remark: this.state.remark,
                adviser_id: this.state.remark,
                class_id: this.state.class_id,
                topic_level: this.state.topic_level,
                topic: this.state.topic
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
                class_id: result.class_id,
                error: false,
                dirty: false
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

    async componentWillMount() {
        let availableStudents = await this.getAvailableStudents();
        let availableCompanions = await this.getAvailableCompanions();
        this.setState({
            availableStudents: availableStudents,
            availableCompanions: availableCompanions
        });
    }

    render() {
        console.log('render = ', this.state);
        return (
            <Modal open={this.props.open} onClose={this.close} closeOnDimmerClick={false} closeIcon>
                <Header>班级详情</Header>
                <Modal.Content scrolling>
                    <Form loading={this.state.loading} error={this.state.error} unstackable={true}>
                        <Message error content={this.state.message} header="出错啦"></Message>
                        <Form.Group widths="equal">
                            <Form.Input label="课程名称" placeholder="课程名称" value={this.state.className} name="className"
                                        onChange={this.handleChange}/>
                            <Form.Input label="等级" placeholder="等级" value={this.state.topic_level} name="topic_level"
                                        onChange={this.handleChange}/>
                            <Form.Input label="教室链接" placeholder="教室链接" value={this.state.classroomUrl}
                                        name="classroomUrl" onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field required>
                                <label>话题</label>
                                <Form.Input placeholder="话题" value={this.state.topic} name="topic"
                                            onChange={this.handleChange}/>
                            </Form.Field>
                            <Form.Input label="开始时间" placeholder="开始时间" value={this.state.startTime}
                                        type="datetime-local" name="startTime" onChange={this.handleChange}/>
                            <Form.Input label="结束时间" placeholder="结束时间" value={this.state.endTime}
                                        type="datetime-local" name="endTime" onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>外籍伙伴</label>
                                <Dropdown selection multiple={false}
                                          search={true} name="companion"
                                          options={this.state.availableCompanions}
                                          value={this.state.companion}
                                          placeholder="设置伙伴" onChange={this.handleChange}
                                          onSearchChange={this.handleSearchCompanionChange}
                                          disabled={this.state.loading}
                                          loading={this.state.loading} label="外籍伙伴"/>
                            </Form.Field>
                            <Form.Field>
                                <label>中国学生</label>
                                <Dropdown selection multiple={true} search={true} name="students"
                                          options={this.state.availableStudents}
                                          value={this.state.students}
                                          placeholder="添加学生" onChange={this.handleChange}
                                          onSearchChange={this.handleSearchStudentChange} disabled={this.state.loading}
                                          loading={this.state.loading} label="中国学生"/>
                            </Form.Field>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>练习音频链接</label>
                                <TextArea autoHeight placeholder="练习音频链接，一行一个" rows="3"
                                          value={this.state.exercises} name="exercises"
                                          onChange={this.handleChange} label="练习音频链接"></TextArea>
                            </Form.Field>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input label="备注" placeholder="备注" value={this.state.remark} name="remark"
                                        onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group>


                            {this.state.class_id && <Button onClick={this.openClassEvaluation}>课后评价</Button>}

                            <ClassEvaluation open={this.state.evaluationOpen} onClose={this.onClassEvaluationClosed}
                                             evaluation={this.state.currentEvaluation} classInfo={this.state}/>


                        </Form.Group>
                        <Form.Group>
                            {this.state.class_id ?
                                <Button onClick={this.saveClass}
                                        disabled={!this.state.dirty && this.state.buttonDisabled}>保存</Button>
                                :
                                <Button onClick={this.saveClass}
                                        disabled={!this.state.dirty && this.state.buttonDisabled}>创建</Button>
                            }
                        </Form.Group>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }

    async getAvailableStudents() {
        this.setState({loading: true});
        let students = await ServiceProxy.proxyTo({
            body: {
                uri: '{buzzService}/api/v1/users?role=s'
            }
        });

        this.setState({loading: false});
        return students.map(s => {
            return {
                key: s.user_id,
                text: s.name || s.wechat_name,
                value: s.user_id
            }
        })
    }

    handleSearchStudentChange(e, {search}) {
        this.setState({searchStudent: search, dirty: true});
    }

    handleSearchCompanionChange(e, {search}) {
        this.setState({searchCompanion: search, dirty: true});
    }

    async getAvailableCompanions() {
        this.setState({loading: true});
        let companions = await ServiceProxy.proxyTo({
            body: {
                uri: '{buzzService}/api/v1/users?role=c'
            }
        });

        this.setState({loading: false});
        return companions.map(s => {
            return {
                key: s.user_id,
                text: s.name || s.wechat_name,
                value: s.user_id
            }
        })
    }
}