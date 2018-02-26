import * as React from "react";
import {Button, Container, Form, Icon, Image, Input, Menu, Table} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import ClassHours from "./class-hours";
import Profile from "./profile";
import SchedulePreference from "./schedule-preference";

export default class StudentList extends React.Component {
    constructor() {
        super();

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
                uri: '{buzzService}/api/v1/users?role=s'
            }
        });

        console.log('students = ', students);
        this.setState({loading: false, students: students});
    }

    async searchUsers() {
        console.log('searching with ', this.state.searchParams);
        this.setState({loading: true});
        let students = await
            ServiceProxy.proxyTo({
                body: {
                    uri: '{buzzService}/api/v1/users?role=s',
                    qs: this.state.searchParams
                }
            });

        this.setState({loading: false, students: students});
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
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>微信头像</Table.HeaderCell>
                            <Table.HeaderCell>微信昵称</Table.HeaderCell>
                            <Table.HeaderCell>用户名称</Table.HeaderCell>
                            <Table.HeaderCell>手机号</Table.HeaderCell>
                            <Table.HeaderCell>邮箱</Table.HeaderCell>
                            <Table.HeaderCell>时间偏好</Table.HeaderCell>
                            <Table.HeaderCell>课时数</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            this.state.students.map((student, i) =>
                                <Table.Row key={student.user_id} style={{cursor: 'pointer'}}>
                                    <Table.Cell onClick={() => this.openProfile(student)}>
                                        <Image src={student.avatar} avatar/>
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(student)}>
                                        {student.wechat_name}
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(student)}>
                                        {student.display_name}
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(student)}>
                                        {student.mobile}
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openProfile(student)}>
                                        {student.email}
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openSchedulePreferenceModal(student)}>
                                        ……
                                    </Table.Cell>
                                    <Table.Cell onClick={() => this.openClassHours(student)}
                                                style={{cursor: 'pointer'}}>
                                        {student.class_hours || 0}
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
                <Profile open={this.state.profileModalOpen} user={this.state.currentStudent}
                         profileUpdateCallback={this.profileUpdated} onCloseCallback={this.closeProfileModal}/>
                <SchedulePreference open={this.state.schedulePreferenceModalOpen} user={this.state.currentStudent}
                                    onCloseCallback={this.closeSchedulePreferenceModal}/>
            </Container>
        )
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
}