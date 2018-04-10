import * as React from "react";
import _ from "lodash";
import moment from 'moment-timezone'
import { Button, Form, Header, Message, Modal, Dropdown, Confirm } from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import TimeHelper from "../../common/TimeHelper";
import Timezones from "../../common/Timezones";

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

        this.state = {
          event: {}, error: false,
          timeZoneConfirmOpen: false,
          companion_time_zone: moment.tz.guess(),
          companion_start_time: null,
          companion_end_time: null,
        };
        this.cancelEvent = this.cancelEvent.bind(this);
        this.saveEvent = this.saveEvent.bind(this);
        this.handleTimeChange = this.handleTimeChange.bind(this);
        this.handleCompanionTimeChange = this.handleCompanionTimeChange.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleCompanionTimeZoneChange = this.handleCompanionTimeZoneChange.bind(this);
        this.updateTime = this.updateTime.bind(this);
        this.updateCompanionTime = this.updateCompanionTime.bind(this);
    }

    async componentWillReceiveProps(nextProps) {
        let event = nextProps.event || {}
        event.start_time = TimeHelper.toLocalDateTime(new Date(event.start_time || null));
        event.end_time = TimeHelper.toLocalDateTime(new Date(event.end_time || null));
        const state = _.assign({}, this.state, { event })
        if (event.time_zone) {
          state.companion_time_zone = event.time_zone
        }
        const oldTz = moment.tz.guess()
        const newTz = state.companion_time_zone
        state.companion_start_time = TimeHelper.momentLocalDateTime(TimeHelper.tzShift(event.start_time, oldTz, newTz))
        state.companion_end_time = TimeHelper.momentLocalDateTime(TimeHelper.tzShift(event.end_time, oldTz, newTz))
        this.setState(state)
    }

    handleCompanionTimeChange(event, {name, value}) {
        const companion_time = {
          companion_start_time: this.state.companion_start_time,
          companion_end_time: this.state.companion_end_time,
        }
        companion_time[name] = value
        this.setState({
            [name]: value
        })

        let e = this.state.event;
        const oldTz = this.state.companion_time_zone
        const newTz = moment.tz.guess()
        e.start_time = TimeHelper.momentLocalDateTime(TimeHelper.tzShift(companion_time.companion_start_time, oldTz, newTz))
        e.end_time = TimeHelper.momentLocalDateTime(TimeHelper.tzShift(companion_time.companion_end_time, oldTz, newTz))

        this.setState({event: e});
    }

    handleTimeChange(event, {name, value}) {
        let e = this.state.event;
        e[name] = value;

        this.setState({event: e});

        const oldTz = moment.tz.guess()
        const newTz = this.state.companion_time_zone
        this.setState({
            companion_start_time: TimeHelper.momentLocalDateTime(TimeHelper.tzShift(e.start_time, oldTz, newTz)),
            companion_end_time: TimeHelper.momentLocalDateTime(TimeHelper.tzShift(e.end_time, oldTz, newTz)),
        })
    }

    handleCompanionTimeZoneChange(e, {name, value}) {
        this.setState({
            [name]: value,
            timeZoneConfirmOpen: true,
        })
    }

    updateTime() {
      let e = this.state.event;
      const oldTz = this.state.companion_time_zone
      const newTz = moment.tz.guess()
      e.start_time = TimeHelper.momentLocalDateTime(TimeHelper.tzShift(this.state.companion_start_time, oldTz, newTz))
      e.end_time = TimeHelper.momentLocalDateTime(TimeHelper.tzShift(this.state.companion_end_time, oldTz, newTz))

      this.setState({event: e, timeZoneConfirmOpen: false});
    }
    updateCompanionTime () {
      const oldTz = moment.tz.guess()
      const newTz = this.state.companion_time_zone
      this.setState({
         timeZoneConfirmOpen: false,
          companion_start_time: TimeHelper.momentLocalDateTime(TimeHelper.tzShift(this.state.event.start_time, oldTz, newTz)),
          companion_end_time: TimeHelper.momentLocalDateTime(TimeHelper.tzShift(this.state.event.end_time, oldTz, newTz)),
      })
    }

    handleChange(e, {name, value}) {
        this.setState({
            [name]: value
        })
    }

    handleSearchChange(e, {search}) {
        this.setState({
            search: search
        })
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
                        <Form.Group>
                            <p>{ `你的时区: ${moment.tz.guess()}` }</p>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Input fluid label="Start Time" placeholder="Start Time" name="start_time"
                                        value={this.state.event.start_time} onChange={this.handleTimeChange}
                                        readOnly={this.state.event.saved !== false} type="datetime-local"/>
                            <Form.Input fluid label="End Time" placeholder="End Time" name="end_time"
                                        value={this.state.event.end_time} onChange={this.handleTimeChange}
                                        readOnly={this.state.event.saved !== false} type="datetime-local"/>
                        </Form.Group>
                        <Form.Group>
                          <p>{ `用户时区: ` }</p>
                          <Confirm
                            open={this.state.timeZoneConfirmOpen}
                            header='更改用户时区'
                            content='即将以某一方的时间为准, 更新另一方的时间'
                            confirmButton='改变用户时区的时间'
                            cancelButton='改变你时区的时间'
                            onConfirm={this.updateCompanionTime}
                            onCancel={this.updateTime}
                          />
                          <Dropdown selection multiple={false} search={true} name="companion_time_zone"
                                    options={Timezones.list}
                                    value={this.state.companion_time_zone} placeholder="时区" onChange={this.handleCompanionTimeZoneChange} onSearchChange={this.handleSearchChange}/>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Input fluid label="Start Time" placeholder="Start Time" name="companion_start_time"
                                        value={this.state.companion_start_time} onChange={this.handleCompanionTimeChange}
                                        readOnly={this.state.event.saved !== false} type="datetime-local"/>
                            <Form.Input fluid label="End Time" placeholder="End Time" name="companion_start_time"
                                        value={this.state.companion_end_time} onChange={this.handleCompanionTimeChange}
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
        console.log('cancelEvent', this.state.event)
        this.setState({loading: true, error: false});
        try {
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/${this.state.event.role==='s' ? 'student' : 'companion'}-class-schedule/${this.state.event.user_id}`,
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
                event: event,
                saved: false,
                error: false
            });

            this.props.onEventCancelled(event);
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result || error.message || error)});
        } finally {
            this.setState({loading: false});
        }
    }

    async saveEvent() {
        console.log('saveEvent', this.state.event)
        this.setState({loading: true, error: false});
        try {
            let newEvent = {
                start_time: new Date(this.state.event.start_time),
                end_time: new Date(this.state.event.end_time),
                user_id: this.state.event.user_id,
                status: this.state.event.status
            }

            validateEvent(newEvent);
            await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/${this.state.event.role==='s' ? 'student' : 'companion'}-class-schedule/${this.state.event.user_id}`,
                    method: 'POST',
                    json: [newEvent]
                }
            });

            newEvent.title = newEvent.status;
            newEvent.saved = true;
            const e = _.assign({}, this.state.event, newEvent)
            this.setState({
                event: e,
            });
            this.props.onEventSaved(e);
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result || error.message || error)});
        } finally {
            this.setState({loading: false});
        }
    }
}
