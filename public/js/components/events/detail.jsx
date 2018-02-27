import * as React from "react";
import {Button, Form, Header, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class EventDetail extends React.Component {
    constructor() {
        super();

        this.state = {};
        this.cancelEvent = this.cancelEvent.bind(this);
    }

    async componentWillReceiveProps(nextProps) {
        this.setState({
            event: nextProps.event || {}
        });
    }

    render() {
        return (
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={true}
                   onClose={this.props.onClose}>
                <Header content="事件明细"></Header>
                <Modal.Content>
                    {JSON.stringify(this.state.event)}
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
        this.setState({loading: true, error: false});
        try {
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/student-class-schedule/${this.state.event.user_id}`,
                    method: 'PUT',
                    json: {
                        start_time: this.state.event.start_time
                    }
                }
            })

            console.log('result = ', result);

            let event = this.state.event;
            event.status = result.status;
            this.setState({
                event: event
            });

            this.props.onEventCancelled(event);
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result)});
        } finally {
            this.setState({loading: false});
        }
    }
}