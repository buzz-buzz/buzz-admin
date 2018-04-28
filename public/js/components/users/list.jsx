import * as React from "react";
import {Button, Container, Form, Icon, Image, Input, Menu, Table} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import Profile from "./profile";
import SchedulePreference from "./schedule-preference";
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import {UserTypes} from "./config";
import ClassHours from "../students/class-hours";
import Integral from "../students/integral";
import LevelModal from "../students/level-modal";
import BookingTable from "./booking-table";
import queryString from 'query-string';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))

async function attachEvents(users) {
    let self = this;

    let userIdArray = users.map(u => u.user_id);

    let bookings = await ServiceProxy.proxyTo({
        body: {
            uri: `{buzzService}/api/v1/bookings/all?${queryString.stringify({users: userIdArray})}`,
            method: 'GET'
        }
    });

    return users.map(user => {
        user.events = [];

        bookings.filter(b => b.user_id === user.user_id).map(b => {
            b.start_time = new Date(b.start_time);
            b.end_time = new Date(b.end_time);
            user.events.push(b);

            return b;
        });

        return user;
    });
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
            users: []
        };

        this.searchUsers = this.searchUsers.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.openClassHours = this.openClassHours.bind(this);
        this.closeClassHoursModal = this.closeClassHoursModal.bind(this);
        this.classHoursUpdated = this.classHoursUpdated.bind(this);
        this.openIntegral = this.openIntegral.bind(this);
        this.closeIntegralModal = this.closeIntegralModal.bind(this);
        this.integralUpdated = this.integralUpdated.bind(this);
        this.closeProfileModal = this.closeProfileModal.bind(this);
        this.profileUpdated = this.profileUpdated.bind(this);
        this.closeSchedulePreferenceModal = this.closeSchedulePreferenceModal.bind(this);
        this.onLevelUpdated = this.onLevelUpdated.bind(this);
        this.openLevelModal = this.openLevelModal.bind(this);
        this.onCloseLevelModal = this.onCloseLevelModal.bind(this);
        this.createNewUser = this.createNewUser.bind(this);
        this.userCreated = this.userCreated.bind(this);
        this.onUserDeleted = this.onUserDeleted.bind(this);
    }

    classHoursUpdated(newClassHours) {
        let copy = Object.assign({}, this.state.currentUser);
        copy.class_hours = newClassHours;

        let newStudents = this.state.users.map(s => {
            if (s.user_id === copy.user_id) {
                return copy;
            }

            return s;
        })

        this.setState({
            currentUser: copy,
            users: newStudents
        })
    }

    integralUpdated(newIntegral) {
        let copy = Object.assign({}, this.state.currentUser);
        copy.integral = newIntegral;

        let newStudents = this.state.users.map(s => {
            if (s.user_id === copy.user_id) {
                return copy;
            }

            return s;
        })

        this.setState({
            currentUser: copy,
            users: newStudents
        })
    }

    async componentWillMount() {
        this.setState({loading: true});
        let users = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v1/users?role=${this.props['user-type']}`
            }
        });

        this.setState({loading: false, users: await attachEvents.call(this, users)});

        if (this.props.match.params.userId) {
            let theStudents = users.filter(s => s.user_id === Number(this.props.match.params.userId));
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
                    qs: Object.assign({}, this.state.searchParams, {
                        start_time: this.state.searchParams.start_time ? new Date(this.state.searchParams.start_time) : undefined,
                        end_time: this.state.searchParams.end_time ? new Date(this.state.searchParams.end_time) : undefined
                    })
                }
            });

        this.setState({loading: false, users: await attachEvents.call(this, students)});
    }

    handleTextChange(event, {value, name}) {
        let clonedSearchParams = this.state.searchParams;
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
                        <Form.Field control={Input} label="英文名" value={this.state.searchParams.display_name}
                                    name="display_name"
                                    onChange={this.handleTextChange}></Form.Field>
                        <Form.Field control={Input} label="手机号" value={this.state.searchParams.mobile}
                                    name="mobile" onChange={this.handleTextChange}></Form.Field>
                        <Form.Field control={Input} label="邮箱" value={this.state.email}
                                    name="email" onChange={this.handleTextChange}></Form.Field>
                    </Form.Group>
                    <Form.Group widths="equal">
                        <Form.Field control={Input} label="开始时间" name="start_time"
                                    value={this.state.searchParams.start_time}
                                    onChange={this.handleTextChange} type="datetime-local"></Form.Field>
                        <Form.Field control={Input} label="结束时间" name="end_time"
                                    value={this.state.searchParams.end_time}
                                    onChange={this.handleTextChange} type="datetime-local"></Form.Field>
                    </Form.Group>
                    <Form.Group>
                        <Button type="submit">查询</Button>
                        {
                            this.props['user-type'] === UserTypes.companion &&
                            <Button thpe="button" onClick={this.createNewUser}>创建新用户</Button>
                        }
                    </Form.Group>
                </Form>
                <Table celled>
                    {this.renderTableHeader()}
                    <Table.Body>
                        {
                            this.state.users.map((user, i) =>
                                <Table.Row key={user.user_id} style={{cursor: 'pointer'}}>
                                    <Table.Cell onClick={() => this.openProfile(user)}>
                                        <Image src={user.avatar} avatar title={user.user_id}
                                               alt={user.user_id}/>
                                    </Table.Cell>
                                    {
                                        this.props['user-type'] === UserTypes.companion &&

                                        <Table.Cell onClick={() => this.openProfile(user)}>
                                            {user.country}
                                        </Table.Cell>
                                    }
                                    <Table.Cell onClick={() => this.openProfile(user)}>
                                        {user.wechat_name}
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(user)}>
                                        {user.display_name || user.name || user.facebook_name}
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(user)}>
                                        {user.mobile}
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(user)}>
                                        {user.email}
                                    </Table.Cell>
                                    {
                                        this.props['user-type'] === UserTypes.student &&
                                        <Table.Cell onClick={() => this.openClassHours(user)}
                                                    style={{cursor: 'pointer'}}>
                                            {user.class_hours || 0}
                                        </Table.Cell>
                                    }
                                    {
                                        this.props['user-type'] === UserTypes.student &&
                                        <Table.Cell onClick={() => this.openIntegral(user)}
                                                    style={{cursor: 'pointer'}}>
                                            {user.integral || 0}
                                        </Table.Cell>
                                    }
                                    {
                                        this.props['user-type'] === UserTypes.student &&
                                        <Table.Cell onClick={() => this.openLevelModal(user)}>
                                            {user.level}
                                        </Table.Cell>
                                    }
                                    <Table.Cell onClick={() => this.openSchedulePreferenceModal(user)}>
                                        <BookingTable events={user.events} defaultDate={new Date()}></BookingTable>
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
                {
                    this.props['user-type'] === UserTypes.student &&

                    <ClassHours open={this.state.classHoursModalOpen} student={this.state.currentUser}
                                classHoursUpdateCallback={this.classHoursUpdated}
                                onCloseCallback={this.closeClassHoursModal}/>
                }
                {
                    this.props['user-type'] === UserTypes.student &&

                    <Integral open={this.state.integralModalOpen} student={this.state.currentUser}
                              integralUpdateCallback={this.integralUpdated}
                              onCloseCallback={this.closeIntegralModal}/>
                }
                {
                    this.props['user-type'] === UserTypes.student &&

                    <LevelModal open={this.state.levelModalOpen} user={this.state.currentUser}
                                onCloseCallback={this.onCloseLevelModal} onLevelUpdated={this.onLevelUpdated}/>
                }
                <Profile open={this.state.profileModalOpen} user={this.state.currentUser}
                         profileUpdateCallback={this.profileUpdated} onCloseCallback={this.closeProfileModal}
                         userCreatedCallback={this.userCreated} onUserDeleted={this.onUserDeleted}/>
                <SchedulePreference open={this.state.schedulePreferenceModalOpen} user={this.state.currentUser}
                                    onCloseCallback={this.closeSchedulePreferenceModal}/>
            </Container>
        )
    }

    renderTableHeader() {
        return <Table.Header>
            <Table.Row>
                <Table.HeaderCell>头像</Table.HeaderCell>
                {
                    this.props['user-type'] === UserTypes.companion &&
                    <Table.HeaderCell>国籍</Table.HeaderCell>
                }
                <Table.HeaderCell>微信昵称</Table.HeaderCell>
                <Table.HeaderCell>(孩子)英文名</Table.HeaderCell>
                <Table.HeaderCell>手机号</Table.HeaderCell>
                <Table.HeaderCell>邮箱</Table.HeaderCell>
                {
                    (this.props['user-type'] === UserTypes.student) &&
                    <Table.HeaderCell>课时数</Table.HeaderCell>
                }
                {
                    (this.props['user-type'] === UserTypes.student) &&
                    <Table.HeaderCell>积分</Table.HeaderCell>
                }
                {
                    this.props['user-type'] === UserTypes.student &&
                    <Table.HeaderCell>能力评级</Table.HeaderCell>
                }
                <Table.HeaderCell>预约/排课</Table.HeaderCell>
            </Table.Row>
        </Table.Header>;
    }

    openClassHours(student) {
        this.setState({
            classHoursModalOpen: true,
            currentUser: student
        });
    }

    closeClassHoursModal() {
        this.setState({classHoursModalOpen: false})
    }

    openIntegral(student) {
        this.setState({
            integralModalOpen: true,
            currentUser: student
        });
    }

    closeIntegralModal() {
        this.setState({integralModalOpen: false})
    }

    openProfile(student) {
        this.setState({
            profileModalOpen: true,
            currentUser: student
        })
    }

    closeProfileModal() {
        this.setState({profileModalOpen: false});
    }

    openSchedulePreferenceModal(user) {
        this.setState({
            schedulePreferenceModalOpen: true,
            currentUser: user
        })
    }

    closeSchedulePreferenceModal(user) {
        let users = this.state.users.map(u => {
            if (u.user_id === user.user_id) {
                return user;
            }

            return u;
        });

        this.setState({
            schedulePreferenceModalOpen: false,
            currentUser: user,
            users: users
        })
    }

    profileUpdated(newProfile) {
        let selectedUser = Object.assign({}, this.state.currentUser);
        selectedUser.email = newProfile.email;
        selectedUser.mobile = newProfile.mobile;
        selectedUser.name = newProfile.name;
        selectedUser.display_name = newProfile.display_name;
        selectedUser.parent_name = newProfile.parent_name;
        selectedUser.country = newProfile.country;
        selectedUser.city = newProfile.city;
        selectedUser.gender = newProfile.gender;
        selectedUser.remark = newProfile.remark;
        selectedUser.avatar = newProfile.avatar;
        selectedUser.grade = newProfile.grade;
        selectedUser.school_name = newProfile.school_name;
        selectedUser.time_zone = newProfile.time_zone;
        selectedUser.date_of_birth = newProfile.date_of_birth;

        let newUsers = this.state.users.map(s => {
            if (s.user_id === selectedUser.user_id) {
                return selectedUser;
            }

            return s;
        })

        this.setState({
            currentUser: selectedUser,
            users: newUsers
        })
    }

    async userCreated(newUserId) {
        let newUser = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v1/users/${newUserId}`,
                method: 'GET'
            }
        })

        let users = this.state.users;
        users.unshift(newUser);

        this.setState({
            currentUser: newUser,
            users: await attachEvents.call(this, users)
        });
    }

    async onUserDeleted(userId) {
        let users = this.state.users.filter(u => String(u.user_id) !== String(userId));

        this.setState({
            users: await attachEvents.call(this, users),
            currentUser: null
        })
    }

    openLevelModal(student) {
        this.setState({
            currentUser: student,
            levelModalOpen: true
        })
    }

    onCloseLevelModal() {
        this.setState({
            levelModalOpen: false
        })
    }

    onLevelUpdated(placementTestResult) {
        let student = this.state.currentUser;
        student.level = placementTestResult.level;
        let newStudents = this.state.users.map(s => {
            if (s.user_id === student.user_id) {
                return student;
            }

            return s;
        });
        this.setState({currentUser: student, users: newStudents})
    }

    createNewUser() {
        this.openProfile({});
    }
}
