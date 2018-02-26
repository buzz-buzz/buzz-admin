import * as React from "react";
import {Button, Form, Header, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class EventDetail extends React.Component {
    constructor() {
        super();

        this.state = {};
        this.cancelEvent = this.cancelEvent.bind(this);
    }

    render() {
        return (
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={true}
                   onClose={this.props.onClose}>
                <Header content="事件明细"></Header>
                <Modal.Content>
                    {JSON.stringify(this.props.event)}
                    <Form loading={this.state.loading} error={this.state.error}>
                        <Message error header="出错了" content={this.state.message}/>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    <Button icon='close' content='取消' onClick={this.cancelEvent}/>
                </Modal.Actions>
            </Modal>
        )
    }

    async cancelEvent() {
        this.setState({loading: true});
        try {
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/student-class-schedule/${this.props.event.user_id}`,
                    method: 'PUT',
                    json: {
                        start_time: this.props.event.start_time
                    }
                }
            })

            console.log('result = ', result);

        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result)});
        } finally {
            this.setState({loading: false});
        }
    }
}