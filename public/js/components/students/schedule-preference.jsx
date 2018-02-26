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
                    events: nextProps.user.events
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
        this.props.onCloseCallback();
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
                            onSelectSlot={slotInfo =>
                                this.selectSlot(slotInfo)
                            }
                            onSelectEvent={event => this.selectEvent(event)}
                        />
                    </Segment>
                </Modal.Content>
                <EventDetail open={this.state.eventDetailModalOpen} onClose={this.closeEventDetailModal}
                             event={this.state.selectedEvent}/>
            </Modal>
        );
    }

    selectSlot(slotInfo) {
        console.log(slotInfo);
    }

    selectEvent(event) {
        console.log(event);
        this.setState({
            eventDetailModalOpen: true,
            selectedEvent: event
        })
    }

    closeEventDetailModal() {
        this.setState({
            eventDetailModalOpen: false
        })
    }
};