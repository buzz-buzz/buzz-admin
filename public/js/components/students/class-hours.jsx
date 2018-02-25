import * as React from 'react';
import {Form, Header, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class ClassHours extends React.Component {
    constructor(props) {
        super(props);

        console.log('props', props);
        this.state = {
            charge: 0,
            consume: 0,
        }

        this.handleChange = this.handleChange.bind(this);
        this.charge = this.charge.bind(this);
        this.consume = this.consume.bind(this);
        this.close = this.close.bind(this);
    }

    handleChange(e, {name, value}) {
        this.setState({
            [name]: value
        })
    }

    componentDidMount() {

    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            classHours: nextProps.student ? (nextProps.student.class_hours || 0) : 0,
            userId: nextProps.student ? nextProps.student.user_id : 0
        })
    }

    async charge() {
        try {
            this.setState({loading: true, error: false});
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/user-balance/${this.state.userId}`,
                    method: 'PUT',
                    json: {
                        class_hours: this.state.charge
                    }
                }
            });

            console.log('result = ', result);
            this.setState({
                classHours: result.class_hours
            })

            this.props.classHoursUpdateCallback(result.class_hours);
        } catch (error) {
            console.log('charge error = ', error);
            this.setState({
                error: true,
                message: JSON.stringify(error.result)
            })
        } finally {
            this.setState({loading: false})
        }
    }

    async consume() {
        try {
            this.setState({loading: true, error: false});
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/user-balance/${this.state.userId}`,
                    method: 'DELETE',
                    json: {
                        class_hours: this.state.consume
                    }
                }
            });

            console.log('consume result = ', result);
            this.setState({
                classHours: result.class_hours
            })
            this.props.classHoursUpdateCallback(result.class_hours);
        } catch (error) {
            console.log('error = ', error);
            this.setState({
                error: true,
                message: JSON.stringify(error.result)
            })
        } finally {
            this.setState({loading: false})
        }
    }

    close() {
        this.props.onCloseCallback();
    }

    render() {
        const {charge, consume} = this.state;
        return (
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={true} onClose={this.close}>
                <Header content="课时明细"></Header>
                <Modal.Content>
                    <p>当前余额：{this.state.classHours}</p>
                    <Form error={this.state.error} loading={this.state.loading}>
                        <Message error header="出错了" content={this.state.message}/>
                        <Form.Group>
                            <Form.Input placeholder="课时数" name="charge" value={charge} onChange={this.handleChange}
                                        type="number"/>
                            <Form.Button content="充值" type="button" onClick={this.charge}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input placeholder="课时数" name="consume" value={consume} onChange={this.handleChange}
                                        type="number"/>
                            <Form.Button content="消费" type="button" onClick={this.consume}/>
                        </Form.Group>
                    </Form>
                    <p>Here you can check class hour details (Under development)</p>
                </Modal.Content>
            </Modal>
        );
    }
};