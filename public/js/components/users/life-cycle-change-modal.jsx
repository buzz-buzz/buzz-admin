import React from "react";
import {Button, Form, Header, Icon, Modal, Select, TextArea} from "semantic-ui-react";
import {StudentLifeCyclesMapping} from "../../common/LifeCycles";
import Grades from "../../common/Grades";
import DatePicker from "react-datepicker/es/index";
import ServiceProxy from "../../service-proxy";
import ErrorHandler from "../../common/ErrorHandler";

export default class LifeCycleChangeModal extends React.Component {
    state = {
        followup: '',
        class_hours: null,
        grade: null,
        demo_time: null,
        training_time: null
    };

    handleChange = (event, {name, value}) => this.setState({[name]: value})

    render() {
        const {user, newState} = this.props;

        let classHours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(h => ({key: h, value: h, text: `${h} 课时`}));

        return <Modal closeIcon open={this.props.open} onClose={this.props.onClose} size="tiny">
            <Header content="流程处理"/>
            <Modal.Content>
                <p>当前流程状态：{StudentLifeCyclesMapping[(user || {}).state]}</p>
                <p>新流程状态：{StudentLifeCyclesMapping[newState]}</p>
                <Form>
                    <Form.Group widths="equal">
                        <Form.Field control={Select} label="充值课时" placeholder="充值课时" options={classHours} value={this.state.class_hours} onChange={this.handleChange} name="class_hours"/>
                        <Form.Field control={Select} label="年级" placeholder="用户当前年级" options={Grades.list} value={this.state.grade} onChange={this.handleChange} name="grade"/>
                    </Form.Group>
                    <Form.Group widths="equal">
                        <Form.Field>
                            <label>入门时间</label>
                            <DatePicker showTimeSelect
                                        selected={this.state.training_time}
                                        name="training_time" isClearable={true}
                                        dateFormat={'YYYY-MM-DD HH:mm'}
                                        placeholderText={"约定入门时间"}
                                        onChange={date => this.handleChange(null, {name: 'training_time', value: date})}/>
                        </Form.Field>
                        <Form.Field>
                            <label>体验时间</label>
                            <DatePicker showTimeSelect
                                        selected={this.state.demo_time}
                                        name="demo_time" isClearable={true}
                                        dateFormat={'YYYY-MM-DD HH:mm'}
                                        placeholderText={"预定体验时间"}
                                        onChange={date => this.handleChange(null, {name: 'demo_time', value: date})}/>
                        </Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                        <Form.Field autoHeight control={TextArea} label="跟进记录" name="followup" placeholder="必填" value={this.state.followup} onChange={this.handleChange}/>
                    </Form.Group>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color="red" onClick={this.props.onClose}>
                    <Icon name="remove"/>
                    取消
                </Button>
                <Button color="green" disabled={!this.state.followup || !this.state.demo_time || !this.state.training_time} onClick={async () => {
                    try {
                        await ServiceProxy.proxyTo({
                            body: {
                                uri: `{buzzService}/api/v1/users/${user.user_id}`,
                                json: {grade: this.state.grade},
                                method: 'put'
                            },
                        });
                        await ServiceProxy.proxyTo({
                            body: {
                                uri: `{buzzService}/api/v1/user-balance/${user.user_id}`,
                                json: {class_hours: this.state.class_hours, remark: `在处理用户流程到Demo状态时，充值课时`},
                                method: 'put'
                            },
                        });
                        await ServiceProxy.proxyTo({
                            body: {
                                uri: `{buzzService}/api/v1/user-demo/${user.user_id}`,
                                json: {
                                    training_time: this.state.training_time,
                                    demo_time: this.state.demo_time
                                },
                                method: 'post'
                            }
                        });
                        user.grade = this.state.grade;
                        user.class_hours += this.state.class_hours;
                        this.props.changeUserState(user, newState, this.state.followup);
                        this.props.onClose()
                    } catch (ex) {
                        ErrorHandler.handle(ex)
                    }
                }}>
                    <Icon name="checkmark"/>
                    确定
                </Button>
            </Modal.Actions>
        </Modal>
    }
}
