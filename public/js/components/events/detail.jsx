import * as React from "react";
import {Button, Form, Header, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class EventDetail extends React.Component {
    constructor() {
        super();

        this.state = {event: {}};
        this.cancelEvent = this.cancelEvent.bind(this);
        this.saveEvent = this.saveEvent.bind(this);
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
                    {
                        this.state.event.saved !== false ?
                            <Button icon='close' content='取消' onClick={this.cancelEvent}/>
                            :
                            <Button icon='save' content='保存' onClick={this.saveEvent}/>
                    }
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

    async saveEvent() {
        this.setState({loading: true, error: false});
        try {
            let newEvent = {
                start_time: this.state.event.start_time,
                end_time: this.state.event.end_time,
                user_id: this.state.event.user_id,
                status: 'booking'
            };
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/student-class-schedule/${this.state.event.user_id}`,
                    method: 'POST',
                    json: [newEvent]
                }
            });

            console.log('save result = ', result);

            this.props.onEventSaved(newEvent);
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result)});
        } finally {
            this.setState({loading: false});
        }
    }
}