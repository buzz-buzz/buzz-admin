import * as React from 'react';
import {Header, Modal, Segment} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import EventDetail from "../events/detail";

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))

export default class SchedulePreference extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {},
            events: []
        };

        this.close = this.close.bind(this);
        this.selectSlot = this.selectSlot.bind(this);
        this.selectEvent = this.selectEvent.bind(this);
        this.closeEventDetailModal = this.closeEventDetailModal.bind(this);
        this.eventCancelled = this.eventCancelled.bind(this);
        this.eventSaved = this.eventSaved.bind(this);
    }

    async componentWillReceiveProps(nextProps) {
        this.setState({
            user: nextProps.user || {}
        }, async () => {

            if (!nextProps.user) {
                return;
            }

            if (nextProps.user.events) {
                this.setState({
                    events: nextProps.user.events.map(e => {
                        e.title = e.status;
                        return e;
                    })
                });
                return;
            }

            try {
                this.setState({loading: true})

                let result = await
                    ServiceProxy.proxyTo({
                        body: {
                            uri: `{buzzService}/api/v1/student-class-schedule/${this.state.user.user_id}`,
                            method: 'GET'
                        }
                    });

                console.log(result);
                this.setState({
                    events: result.map(e => {
                        e.start_time = new Date(e.start_time);
                        e.end_time = new Date(e.end_time);
                        e.title = e.status;

                        console.log(e);
                        return e;
                    })
                })
            } catch (error) {
                this.setState({
                    error: true,
                    message: JSON.stringify(error.result)
                });
            } finally {
                this.setState({loading: false})
            }
        })
    }

    async componentDidMount() {
    }

    close() {
        this.props.onCloseCallback(this.state.user);
    }

    render() {
        return (
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={true} onClose={this.close}>
                <Header content="课程安排"></Header>
                <Modal.Content>
                    <Segment loading={this.state.loading} style={{height: '600px'}}>
                        <BigCalendar
                            selectable
                            events={this.state.events}
                            startAccessor='start_time'
                            endAccessor='end_time'
                            defaultDate={new Date()}
                            defaultView={'week'}
                            scrollToTime={new Date(1970, 1, 1, 6)}
                            onSelectEvent={event => this.selectEvent(event)}
                            onSelectSlot={slotInfo =>
                                this.selectSlot(slotInfo)
                            }
                        />
                    </Segment>
                </Modal.Content>
                <EventDetail open={this.state.eventDetailModalOpen} onClose={this.closeEventDetailModal}
                             event={this.state.selectedEvent} onEventCancelled={this.eventCancelled}
                             onEventSaved={this.eventSaved}/>
            </Modal>
        );
    }

    selectSlot(slotInfo) {
        console.log(slotInfo);
        this.setState({
            eventDetailModalOpen: true,
            selectedEvent: {
                start_time: slotInfo.start,
                end_time: slotInfo.end,
                saved: false,
                user_id: this.state.user.user_id,
                time_zone: this.state.user.time_zone,
                role: this.state.user.role,
                status: 'booking',
                title: 'booking'
            }
        })
    }

    selectEvent(event) {
        console.log(event);
        this.setState({
            eventDetailModalOpen: true,
            selectedEvent: Object.assign({}, event, {
                time_zone: this.state.user.time_zone,
                role: this.state.user.role,
                start_time: new Date(event.start_time),
                end_time: new Date(event.end_time)
            })
        })
    }

    closeEventDetailModal() {
        this.setState({
            eventDetailModalOpen: false
        })
    }

    eventCancelled(event) {
        let events = this.state.events;
        events = events.map(e => {
            if ((new Date(e.start_time).getTime() ) === (new Date(this.state.selectedEvent.start_time).getTime())) {
                console.log('cancelling ', e, ' in UI');
                e.status = event.status;
                e.title = event.status;
            }

            if (e.batch_id === event.batch_id) {
                e.status = event.status;
                e.title = event.status;
            }

            return e;
        }).filter(e => e.status !== 'cancelled');

        let user = this.state.user;
        user.events = events;
        this.setState({events: events, user: user})
    }

    eventSaved(event) {
        let events = this.state.events;
        events.push(event);

        let user = this.state.user;
        user.events = events;

        this.setState({
            events,
            selectedEvent: Object.assign({}, event, {
                time_zone: this.state.user.time_zone,
                role: this.state.user.role,
                start_time: event.start_time.toISOString(),
                end_time: event.end_time.toISOString()
            }),
            user: user
        });
    }
};
