import * as React from "react";
import {Button, Form, Header, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

function validateEvent(newEvent) {
    console.log('new Event = ', newEvent);
    newEvent.start_time = new Date(newEvent.start_time);
    if (isNaN(newEvent.start_time.getTime())) {
        throw new Error('开始时间格式不对');
    }

    newEvent.end_time = new Date(newEvent.end_time);
    if (isNaN(newEvent.end_time.getTime())) {
        throw new Error('结束时间格式不对');
    }
}

export default class EventDetail extends React.Component {
    constructor() {
        super();

        this.state = {event: {}};
        this.cancelEvent = this.cancelEvent.bind(this);
        this.saveEvent = this.saveEvent.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
    }

    async componentWillReceiveProps(nextProps) {
        let event = nextProps.event || {}
        console.log('event = ', event);
        event.start_time = new Date(event.start_time || null).toISOString().slice(0, -1);
        event.end_time = new Date(event.end_time || null).toISOString().slice(0, -1);
        this.setState({
            event
        });
    }

    handleTimeChange(event, {name, value}) {
        let e = this.state.event;
        e[name] = value;

        this.setState({event: e});
    }

    render() {
        return (
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={true}
                   onClose={this.props.onClose}>
                <Header content="事件明细"></Header>
                <Modal.Content>
                    <Form loading={this.state.loading} error={this.state.error}>
                        <Message error header="出错了" content={this.state.message}/>
                        <Form.Group>
                            <p>{this.state.event.status}</p>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Input fluid label="Start Time" placeholder="Start Time" name="start_time"
                                        value={this.state.event.start_time} onChange={this.handleTimeChange}
                                        readOnly={this.state.event.saved !== false} type="datetime-local"/>
                            <Form.Input fluid label="End Time" placeholder="End Time" name="end_time"
                                        value={this.state.event.end_time} onChange={this.handleTimeChange}
                                        readOnly={this.state.event.saved !== false} type="datetime-local"/>
                        </Form.Group>
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
                        start_time: new Date(this.state.event.start_time)
                    }
                }
            })

            let event = this.state.event;
            event.start_time = new Date(event.start_time);
            event.end_time = new Date(event.end_time);
            event.status = result.status;
            this.setState({
                event: event
            });

            this.props.onEventCancelled(event);
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result || error.message || error)});
        } finally {
            this.setState({loading: false});
        }
    }

    async saveEvent() {
        this.setState({loading: true, error: false});
        try {
            let newEvent = {
                start_time: new Date(this.state.event.start_time),
                end_time: new Date(this.state.event.end_time),
                user_id: this.state.event.user_id,
                status: this.state.event.status
            };

            validateEvent(newEvent);

            await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/student-class-schedule/${this.state.event.user_id}`,
                    method: 'POST',
                    json: [newEvent]
                }
            });

            newEvent.title = newEvent.status;
            newEvent.saved = true;
            this.setState({
                event: newEvent
            });
            this.props.onEventSaved(newEvent);
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result || error.message || error)});
        } finally {
            this.setState({loading: false});
        }
    }
}