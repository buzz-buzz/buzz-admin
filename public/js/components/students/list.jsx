import * as React from "react";
import {Button, Container, Form, Icon, Image, Input, Menu, Table} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class StudentList extends React.Component {
    constructor() {
        super();

        this.state = {
            searchParams: {
                wechatNickName: '',
                userName: '',
                mobile: '',
                email: ''
            },
            loading: false,
            students: []
        };

        this.clickMe = this.clickMe.bind(this);
        this.searchUsers = this.searchUsers.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
    }

    async componentDidMount() {
        this.setState({loading: true});
        let students = await ServiceProxy.proxyTo({
            body: {
                uri: '{buzzService}/api/v1/users'
            }
        });

        console.log('students = ', students);
        this.setState({loading: false, students: students});
    }

    clickMe() {
        alert('ai');
    }

    searchUsers() {
        console.log('searching with ', this.state.searchParams);
        this.setState({loading: true});
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
                        <Form.Field control={Input} label="微信昵称" name="wechatNickName"
                                    value={this.state.searchParams.wechatNickName}
                                    onChange={this.handleTextChange}></Form.Field>
                        <Form.Field control={Input} label="用户名称" value={this.state.searchParams.userName}
                                    name="userName"
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
                            <Table.HeaderCell>课时数</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            this.state.students.map((student, i) =>
                                <Table.Row key={student.user_id}>
                                    <Table.Cell>
                                        <Image src={student.avatar} avatar/>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {student.name}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {student.display_name}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {student.mobile}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {student.email}
                                    </Table.Cell>
                                    <Table.Cell>
                                        0
                                    </Table.Cell>
                                </Table.Row>
                            )
                        }
                    </Table.Body>
                    <Table.Footer>
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
            </Container>
        )
    }
}