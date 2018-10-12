import React from "react";
import {Button, Form, Header, Icon, Modal} from "semantic-ui-react";
import DatePicker from "react-datepicker/es/index";
import ServiceProxy from "../../service-proxy";
import ErrorHandler from "../../common/ErrorHandler";

export default class UserDemoTime extends React.Component {
    state = {
        followup: '',
        class_hours: null,
        grade: null,
        demo_time: null,
        training_time: null
    };

    handleChange = (event, {name, value}) => this.setState({[name]: value})

    render() {
        const {user} = this.props;

        return <Modal open={this.props.open} size="tiny">
            <Header content="修改信息"/>
            <Modal.Content>
                <Form>
                    <Form.Group widths="equal">
                        <Form.Field>
                            <label>入门时间</label>
                            <DatePicker 
                                        selected={this.state.training_time}
                                        name="training_time" isClearable={true}
                                        dateFormat={'YYYY-MM-DD'}
                                        placeholderText={"约定入门时间"}
                                        onChange={date => this.handleChange(null, {name: 'training_time', value: date})}/>
                        </Form.Field>
                        <Form.Field>
                            <label>体验时间</label>
                            <DatePicker 
                                        selected={this.state.demo_time}
                                        name="demo_time" isClearable={true}
                                        dateFormat={'YYYY-MM-DD'}
                                        placeholderText={"预定体验时间"}
                                        onChange={date => this.handleChange(null, {name: 'demo_time', value: date})}/>
                        </Form.Field>
                    </Form.Group>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color="red" onClick={this.props.onClose}>
                    <Icon name="remove"/>
                    取消
                </Button>
                <Button color="green" disabled={ !this.state.demo_time || !this.state.training_time} onClick={async () => {
                    try {
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
                        
                        this.setState({
                            demo_time: null,
                            training_time: null
                        }, () => {
                            this.props.onClose()
                        })
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
