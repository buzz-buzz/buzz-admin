import * as React from "react";
import {Button, Container, Form, Icon, Image, Input, Menu, Table} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import Profile from "./profile";
import SchedulePreference from "./schedule-preference";
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import {UserTypes} from "./config";
import ClassHours from "../students/class-hours";
import LevelModal from "../students/level-modal";

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))

function attachEvents(users) {
    let self = this;
    return users.map(user => {
        user.events = [];

        let uri = `{buzzService}/api/v1/student-class-schedule/${user.user_id}`;

        if (this.props['user-type'] === UserTypes.companion) {
            uri = `{buzzService}/api/v1/companion-class-schedule/${user.user_id}`;
        }

        ServiceProxy.proxyTo({
            body: {
                uri: uri,
                method: 'GET'
            }
        }).then((events) => {
            user.events = events.map(e => {
                e.start_time = new Date(e.start_time);
                e.end_time = new Date(e.end_time);
                return e;
            })

            self.forceUpdate();
        });

        return user;
    })
}

export default class UserList extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            searchParams: {
                wechat_name: '',
                display_name: '',
                mobile: '',
                email: ''
            },
            loading: false,
            students: []
        };

        this.searchUsers = this.searchUsers.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.openClassHours = this.openClassHours.bind(this);
        this.closeClassHoursModal = this.closeClassHoursModal.bind(this);
        this.classHoursUpdated = this.classHoursUpdated.bind(this);
        this.closeProfileModal = this.closeProfileModal.bind(this);
        this.profileUpdated = this.profileUpdated.bind(this);
        this.closeSchedulePreferenceModal = this.closeSchedulePreferenceModal.bind(this);
        this.onLevelUpdated = this.onLevelUpdated.bind(this);
        this.openLevelModal = this.openLevelModal.bind(this);
        this.onCloseLevelModal = this.onCloseLevelModal.bind(this);
    }

    classHoursUpdated(newClassHours) {
        let copy = Object.assign({}, this.state.currentStudent);
        copy.class_hours = newClassHours;

        let newStudents = this.state.students.map(s => {
            if (s.user_id === copy.user_id) {
                return copy;
            }

            return s;
        })

        this.setState({
            currentStudent: copy,
            students: newStudents
        })
    }

    async componentDidMount() {
        this.setState({loading: true});
        let students = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v1/users?role=${this.props['user-type']}`
            }
        });

        this.setState({loading: false, students: attachEvents.call(this, students)});

        if (this.props.match.params.userId) {
            let theStudents = students.filter(s => s.user_id === Number(this.props.match.params.userId));
            if (theStudents.length) {
                this.openProfile(theStudents[0]);
            }
        }
    }

    async searchUsers() {
        console.log('searching with ', this.state.searchParams);
        this.setState({loading: true});
        let students = await
            ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users?role=${this.props['user-type']}`,
                    qs: this.state.searchParams
                }
            });

        this.setState({loading: false, students: attachEvents.call(this, students)});
    }

    handleTextChange(event, {value, name}) {
        let clonedSearchParams = Object.assign(this.state.searchParams);
        clonedSearchParams[name] = value;

        this.setState({
            searchParams: clonedSearchParams
        });
    }

    render() {
        return (
            <Container>
                <Form onSubmit={this.searchUsers} loading={this.state.loading}>
                    <Form.Group widths='equal'>
                        <Form.Field control={Input} label="微信昵称" name="wechat_name"
                                    value={this.state.searchParams.wechat_name}
                                    onChange={this.handleTextChange}></Form.Field>
                        <Form.Field control={Input} label="用户名称" value={this.state.searchParams.display_name}
                                    name="display_name"
                                    onChange={this.handleTextChange}></Form.Field>
                        <Form.Field control={Input} label="手机号" value={this.state.searchParams.mobile}
                                    name="mobile" onChange={this.handleTextChange}></Form.Field>
                        <Form.Field control={Input} label="邮箱" value={this.state.email}
                                    name="email" onChange={this.handleTextChange}></Form.Field>
                    </Form.Group>
                    <Form.Group>
                        <Button type="submit">查询</Button>
                    </Form.Group>
                </Form>
                <Table celled>
                    {this.renderTableHeader()}
                    <Table.Body>
                        {
                            this.state.students.map((student, i) =>
                                <Table.Row key={student.user_id} style={{cursor: 'pointer'}}>
                                    <Table.Cell onClick={() => this.openProfile(student)}>
                                        <Image src={student.avatar} avatar title={student.user_id}
                                               alt={student.user_id}/>
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(student)}>
                                        {student.wechat_name}
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(student)}>
                                        {student.display_name || student.name || student.facebook_name}
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(student)}>
                                        {student.mobile}
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(student)}>
                                        {student.email}
                                    </Table.Cell>
                                    {
                                        this.props['user-type'] === UserTypes.student &&
                                        <Table.Cell onClick={() => this.openClassHours(student)}
                                                    style={{cursor: 'pointer'}}>
                                            {student.class_hours || 0}
                                        </Table.Cell>
                                    }
                                    {
                                        this.props['user-type'] === UserTypes.student &&
                                        <Table.Cell onClick={() => this.openLevelModal(student)}>
                                            {student.level}
                                        </Table.Cell>
                                    }
                                    <Table.Cell onClick={() => this.openSchedulePreferenceModal(student)}
                                                style={{height: '250px'}}>
                                        <BigCalendar
                                            events={student.events}
                                            startAccessor='start_time'
                                            endAccessor='end_time'
                                            defaultDate={new Date()}
                                            defaultView="agenda"
                                        />
                                    </Table.Cell>
                                </Table.Row>
                            )
                        }
                    </Table.Body>
                    <Table.Footer style={{display: 'none'}}>
                        <Table.Row>
                            <Table.HeaderCell colSpan="6">
                                <Menu floated="right" pagination>
                                    <Menu.Item as="a" icon>
                                        <Icon name="left chevron"/>
                                    </Menu.Item>
                                    <Menu.Item as="a">1</Menu.Item>
                                    <Menu.Item as="a">2</Menu.Item>
                                    <Menu.Item as="a">3</Menu.Item>
                                    <Menu.Item as="a">4</Menu.Item>
                                    <Menu.Item as="a">5</Menu.Item>
                                    <Menu.Item as="a" icon>
                                        <Icon name="right chevron"/>
                                    </Menu.Item>
                                </Menu>
                            </Table.HeaderCell>
                        </Table.Row>
                    </Table.Footer>
                </Table>
                <ClassHours open={this.state.classHoursModalOpen} student={this.state.currentStudent}
                            classHoursUpdateCallback={this.classHoursUpdated}
                            onCloseCallback={this.closeClassHoursModal}/>
                <LevelModal open={this.state.levelModalOpen} user={this.state.currentStudent}
                            onCloseCallback={this.onCloseLevelModal} onLevelUpdated={this.onLevelUpdated}/>
                <Profile open={this.state.profileModalOpen} user={this.state.currentStudent}
                         profileUpdateCallback={this.profileUpdated} onCloseCallback={this.closeProfileModal}/>
                <SchedulePreference open={this.state.schedulePreferenceModalOpen} user={this.state.currentStudent}
                                    onCloseCallback={this.closeSchedulePreferenceModal}/>
            </Container>
        )
    }

    renderTableHeader() {
        return <Table.Header>
            <Table.Row>
                <Table.HeaderCell>头像</Table.HeaderCell>
                <Table.HeaderCell>微信昵称</Table.HeaderCell>
                <Table.HeaderCell>用户名称</Table.HeaderCell>
                <Table.HeaderCell>手机号</Table.HeaderCell>
                <Table.HeaderCell>邮箱</Table.HeaderCell>
                {
                    (this.props['user-type'] === UserTypes.student) &&
                    <Table.HeaderCell>课时数</Table.HeaderCell>
                }
                {
                    this.props['user-type'] === UserTypes.student &&
                    <Table.HeaderCell>能力评级</Table.HeaderCell>
                }
                <Table.HeaderCell>课程安排</Table.HeaderCell>
            </Table.Row>
        </Table.Header>;
    }

    openClassHours(student) {
        this.setState({
            classHoursModalOpen: true,
            currentStudent: student
        });
    }

    closeClassHoursModal() {
        this.setState({classHoursModalOpen: false})
    }

    openProfile(student) {
        this.setState({
            profileModalOpen: true,
            currentStudent: student
        })
    }

    closeProfileModal() {
        this.setState({profileModalOpen: false});
    }

    openSchedulePreferenceModal(student) {
        this.setState({
            schedulePreferenceModalOpen: true,
            currentStudent: student
        })
    }

    closeSchedulePreferenceModal() {
        this.setState({
            schedulePreferenceModalOpen: false
        })
    }

    profileUpdated(newProfile) {
        let copy = Object.assign({}, this.state.currentStudent);
        copy.email = newProfile.email;
        copy.mobile = newProfile.mobile;

        let newStudents = this.state.students.map(s => {
            if (s.user_id === copy.user_id) {
                return copy;
            }

            return s;
        })

        this.setState({
            currentStudent: copy,
            students: newStudents
        })
    }

    openLevelModal(student) {
        this.setState({
            currentStudent: student,
            levelModalOpen: true
        })
    }

    onCloseLevelModal() {
        this.setState({
            levelModalOpen: false
        })
    }

    onLevelUpdated(placementTestResult) {
        let student = this.state.currentStudent;
        student.level = placementTestResult.level;
        let newStudents = this.state.students.map(s => {
            if (s.user_id === student.user_id) {
                return student;
            }

            return s;
        });
        this.setState({currentStudent: student, students: newStudents})
    }
}