import * as React from "react";
import {Button, Container, Icon, Image, Menu, Segment, Table} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import ClassDetail from "./class-detail-modal";

export default class ClassList extends React.Component {
    constructor() {
        super();

        this.state = {
            classes: []
        };

        this.openClassDetail = this.openClassDetail.bind(this);
        this.onClassDetailClosed = this.onClassDetailClosed.bind(this);
        this.onClassSaved = this.onClassSaved.bind(this);
    }

    async componentDidMount() {
        this.setState({loading: true})
        let result = await ServiceProxy.proxyTo({
            body: {
                uri: '{buzzService}/api/v1/class-schedule',
                method: 'GET'
            }
        })

        this.setState({
            loading: false, classes: result.map(c => {
                let uniqueFilter = (value, index, self) => self.indexOf(value) === index;
                c.companions = c.companions.split(',').filter(uniqueFilter);
                c.students = c.students.split(',').filter(uniqueFilter);
                return c;
            })
        })
    }

    openClassDetail(c) {
        this.setState({
            detailOpen: true,
            currentClass: c
        })
    }

    onClassDetailClosed() {
        this.setState({detailOpen: false})
    }

    onClassSaved(savedClass) {
        let classes = Object.assign([], this.state.classes);
        if (classes.map(c => c.class_id).indexOf(savedClass.class_id) < 0) {
            classes.push(savedClass);
        } else {
            classes = classes.map(c => {
                if (c.class_id === savedClass.class_id) {
                    return savedClass;
                }

                return c;
            })
        }

        this.setState({classes: classes, currentClass: savedClass});
    }

    render() {
        return (
            <Container>
                <Segment loading={this.state.loading}>
                    <Button onClick={this.openClassDetail}>创建班级</Button>
                </Segment>
                <Table celled>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>课程名称</Table.HeaderCell>
                            <Table.HeaderCell>班级状态</Table.HeaderCell>
                            <Table.HeaderCell>开课日期</Table.HeaderCell>
                            <Table.HeaderCell>开始时间</Table.HeaderCell>
                            <Table.HeaderCell>结束时间</Table.HeaderCell>
                            <Table.HeaderCell>教室（链接）</Table.HeaderCell>
                            <Table.HeaderCell>外籍伙伴</Table.HeaderCell>
                            <Table.HeaderCell>中方用户</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            this.state.classes.map((c, i) =>
                                <Table.Row key={c.class_id} style={{cursor: 'pointer'}}
                                           onClick={() => this.openClassDetail(c)}>
                                    <Table.Cell>
                                        {c.name}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {c.status}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {new Date(c.start_time).toLocaleDateString()}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {new Date(c.start_time).toLocaleTimeString()}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {new Date(c.end_time).toLocaleTimeString()}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {c.room_url}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {c.companions.map(userId => <Image avatar alt={userId} title={userId}
                                                                           src={`/avatar/${userId}`} key={userId}/>)}
                                    </Table.Cell>
                                    <Table.Cell onClick={(event) => event.stopPropagation()}>
                                        {c.students.map(userId => <a href={`/students/${userId}`} target="_blank"
                                                                     key={userId}>
                                            <Image avatar alt={userId} title={userId}
                                                   src={`/avatar/${userId}`}
                                                   key={userId}/></a>)}
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
                <ClassDetail open={this.state.detailOpen} onClose={this.onClassDetailClosed}
                             onClassSaved={this.onClassSaved} class={this.state.currentClass}></ClassDetail>
            </Container>
        );
    }
}