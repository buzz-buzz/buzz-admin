import * as React from "react";
import { Button, Container, Dropdown, Form, Input, Menu, Segment, Table } from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import ClassDetail from "./class-detail-modal";
import ClassEvaluation from "./class-evaluation-modal";
import { ClassStatusCode } from "../../common/ClassStatus";
import * as _ from "lodash";
import { BuzzPaginationData } from "../common/BuzzPagination";
import BuzzPagination from "../common/BuzzPagination";
import { Avatar } from "../../common/Avatar";
import CurrentUser from "../../common/CurrentUser";

function nearestToper(x, y) {
    let now = new Date();
    let startOfX = new Date(x.start_time);
    let startOfY = new Date(y.start_time);

    let diffOfX = Math.abs(now - startOfX);
    let diffOfY = Math.abs(now - startOfY);

    if (diffOfX < diffOfY) {
        return -1;
    }

    if (diffOfX > diffOfY) {
        return 1;
    }

    return 0;
}

export default class ClassList extends React.Component {
    handleStatusChange = ({ value }) => {
        let { searchParams } = this.state;
        searchParams.statuses = value;

        this.setState({
            searchParams,
        })
    };

    handleUsersChange = ({ value }) => {
        this.setState({
            searchParams: {
                ...this.state.searchParams,
                user_ids: value
            }
        })
    }

    constructor() {
        super();

        let query = new URLSearchParams(window.location.search);
        let statuses = query.getAll('statuses').length ? query.getAll('statuses') : [ClassStatusCode.Opened];
        this.state = {
            classes: [],
            loading: false,
            searchParams: {
                start_time: '',
                end_time: '',
                statuses: statuses,
                user_ids: query.getAll('userIds').map(id => Number(id))
            },
            currentStatuses: statuses,
            column: null,
            direction: null,
            pagination: BuzzPaginationData,
            allStatuses: Object.keys(ClassStatusCode).map(key => ({
                key: ClassStatusCode[key],
                value: ClassStatusCode[key],
                text: ClassStatusCode[key]
            })),
            currentUser: {},
            allUsers: []
        };

        this.openClassDetail = this.openClassDetail.bind(this);
        this.onClassDetailClosed = this.onClassDetailClosed.bind(this);
        this.onClassSaved = this.onClassSaved.bind(this);
        this.openClassDetail = this.openClassDetail.bind(this);
        this.openAdminNeueClassDetail = this.openAdminNeueClassDetail.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.searchClasses = this.searchClasses.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.openFeedback = this.openFeedback.bind(this);
        this.onClassEvaluationClosed = this.onClassEvaluationClosed.bind(this);

        this.switchToStatus = this.switchToStatus.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.gotoPage = this.gotoPage.bind(this);
    }

    async updateStatus() {
        this.setState({ loading: true });
        try {
            this.setState({ error: false });
            await this.searchClasses();
        } catch (error) {
            this.setState({
                error: true,
                message: JSON.stringify(error.result || error.message || error)
            })
        } finally {
            this.setState({ loading: false })
        }
    }

    handleChange({ name, value }) {
        let clonedSearchParams = this.state.searchParams;
        clonedSearchParams[name] = value;

        this.setState({
            searchParams: clonedSearchParams
        })
    }

    switchToStatus(status) {
        this.setState({
            classes: this.state.classes.sort(nearestToper),
            currentStatuses: [status],
            direction: null,
            column: null
        })
    }

    async searchClasses() {
        this.setState({ loading: true })
        let paginationData = await ServiceProxy.proxyTo({
            body: {
                uri: '{buzzService}/api/v1/class-schedule',
                method: 'GET',
                qs: Object.assign({}, this.state.searchParams, {
                    start_time: this.state.searchParams.start_time ? new Date(this.state.searchParams.start_time) : undefined,
                    end_time: this.state.searchParams.end_time ? new Date(this.state.searchParams.end_time) : undefined,
                    statuses: this.state.searchParams.statuses.length ? this.state.searchParams.statuses : undefined
                }, this.state.pagination),
                useQuerystring: true
            }
        })

        let result = paginationData.data;

        this.setState({
            loading: false,
            pagination: {
                current_page: paginationData.current_page,
                from: paginationData.from,
                last_page: paginationData.last_page,
                offset: paginationData.offset,
                per_page: paginationData.per_page,
                to: paginationData.to,
                total: paginationData.total
            },
            classes: result.map(c => {
                let uniqueFilter = (value, index, self) => self.indexOf(value) === index;
                c.companions = (c.companions || '').split(',').filter(uniqueFilter);
                c.students = (c.students || '').split(',').filter(uniqueFilter);
                return c;
            }).sort(nearestToper),
            currentStatuses: this.state.searchParams.statuses
        })
    }

    async getAllUsers() {
        this.setState({ loading: true })
        let result = await ServiceProxy.proxyTo({
            body: { uri: `{buzzService}/api/v1/users` }
        });
        this.setState({
            loading: false, allUsers: result.map(u => ({
                key: u.user_id,
                value: u.user_id,
                text: u.name || u.display_name || u.wechat_name,
                // description: u.display_name,
                image: { avatar: true, src: u.avatar }
            }))
        }, () => {
            this.setState({
                searchParams: {
                    ...this.state.searchParams,
                    user_ids: new URLSearchParams(window.location.search).getAll('userIds').map(id => Number(id))
                }
            })
        });
    }

    async componentWillMount() {
        await this.searchClasses();
        this.setState({
            currentUser: await CurrentUser.getProfile()
        }, async () => {
            await this.getAllUsers();
        })
    }

    openClassDetail(c) {
        this.setState({
            detailOpen: true,
            currentClass: c,
            buttonDisabled: !c,
        })
    }

    onClassDetailClosed() {
        this.setState({ detailOpen: false })
    }

    onClassSaved(savedClass) {
        let classes = Object.assign([], this.state.classes);
        if (classes.map(c => c.class_id).indexOf(savedClass.class_id) < 0) {
            classes.unshift(savedClass);
        } else {
            classes = classes.map(c => {
                if (c.class_id === savedClass.class_id) {
                    return savedClass;
                }

                return c;
            })
        }

        this.setState({ classes: classes, currentClass: savedClass });
    }

    openFeedback(c) {
        this.setState({
            evaluationOpen: true,
            currentClass: c,
        })
    }

    onClassEvaluationClosed() {
        this.setState({ evaluationOpen: false })
    }

    render() {
        console.log("rendering", this.state)
        return (
            <Container>
                <Segment loading={this.state.loading}>
                    <Form onSubmit={this.searchClasses}>
                        <Form.Group widths="equal">
                            <Form.Field control={Input} label="开始时间" name="start_time"
                                value={this.state.searchParams.start_time} onChange={this.handleChange}
                                type="datetime-local"></Form.Field>
                            <Form.Field control={Input} label="结束时间" name="end_time"
                                value={this.state.searchParams.end_time} onChange={this.handleChange}
                                type="datetime-local"></Form.Field>
                            <Form.Field control={Dropdown} label="状态" name="status"
                                value={this.state.searchParams.statuses}
                                onChange={this.handleStatusChange} multiple search selection
                                options={this.state.allStatuses}></Form.Field>
                            <Form.Field control={Dropdown} label="参与者" name="users"
                                value={this.state.searchParams.user_ids} onChange={this.handleUsersChange}
                                multiple search selection options={this.state.allUsers}></Form.Field>
                        </Form.Group>
                    </Form>
                    <Form.Group>
                        <Button type="submit" onClick={this.searchClasses}>查询</Button>
                        {
                            process.env.NODE_ENV !== 'production' &&
                            <Button onClick={() => this.openClassDetail()} type="button">创建班级</Button>
                        }
                        <a className="ui button green"
                            href={`/admin-neue/classDetail/create`}
                            target="_blank">创建班级</a>
                        {
                            this.state.currentUser.super &&
                            <Button onClick={this.updateStatus} type="button">批量更新班级结束状态</Button>
                        }
                    </Form.Group>
                </Segment>
                <Menu fluid widths={Object.keys(ClassStatusCode).length}>
                    {
                        Object.keys(ClassStatusCode).map(
                            key => (
                                <Menu.Item name={key}
                                    active={this.state.currentStatuses.indexOf(ClassStatusCode[key]) >= 0}
                                    onClick={() => this.searchClassesByStatus(ClassStatusCode[key])}
                                    key={key} />
                            )
                        )
                    }
                </Menu>
                <Table celled sortable fixed selectable striped>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell sorted={this.state.column === 'class_id' ? this.state.direction : null}
                                onClick={() => this.handleSort('class_id')}>班级ID</Table.HeaderCell>
                            <Table.HeaderCell sorted={this.state.column === 'name' ? this.state.direction : null}
                                onClick={() => this.handleSort('name')}>班级名称</Table.HeaderCell>
                            <Table.HeaderCell sorted={this.state.column === 'topic' ? this.state.direction : null}
                                onClick={() => this.handleSort('topic')}>主题名</Table.HeaderCell>
                            <Table.HeaderCell sorted={this.state.column === 'topic_level' ? this.state.direction : null}
                                onClick={() => this.handleSort('topic_level')}>级别 </Table.HeaderCell>
                            <Table.HeaderCell sorted={this.state.column === 'start_time' ? this.state.direction : null}
                                onClick={() => this.handleSort('start_time')}>开课日期</Table.HeaderCell>
                            <Table.HeaderCell sorted={this.state.column === 'start_time' ? this.state.direction : null}
                                onClick={() => this.handleSort('start_time')}>开始时间</Table.HeaderCell>
                            <Table.HeaderCell sorted={this.state.column === 'end_time' ? this.state.direction : null}
                                onClick={() => this.handleSort('end_time')}>结束时间</Table.HeaderCell>
                            <Table.HeaderCell sorted={this.state.column === 'room_url' ? this.state.direction : null}
                                onClick={() => this.handleSort('room_url')}>教室（链接）</Table.HeaderCell>
                            <Table.HeaderCell sorted={this.state.column === 'companions' ? this.state.direction : null}
                                onClick={() => this.handleSort('companions')}>外籍伙伴</Table.HeaderCell>
                            <Table.HeaderCell sorted={this.state.column === 'students' ? this.state.direction : null}
                                onClick={() => this.handleSort('students')}>中方用户</Table.HeaderCell>
                            <Table.HeaderCell>操作</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            this.state.classes.filter(c => this.state.currentStatuses.length === 0 || this.state.currentStatuses.indexOf(c.status) >= 0).map((c) =>
                                <Table.Row key={c.class_id} style={{ cursor: 'pointer' }}
                                    onClick={() => process.env.NODE_ENV !== 'production' ? this.openClassDetail(c) : this.openAdminNeueClassDetail(c)}>
                                    <Table.Cell>
                                        {c.class_id}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <strong>{c.name}</strong><br />
                                        <span style={{ color: 'gainsboro' }}>{c.status}</span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {c.topic}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {c.topic_level}
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
                                        {
                                            c.companions.map(userId => <a href={`/companions/${userId}`} target="_blank"
                                                key={userId}>
                                                <Avatar userId={userId} />
                                            </a>)
                                        }
                                    </Table.Cell>
                                    <Table.Cell onClick={(event) => event.stopPropagation()}>
                                        {
                                            c.students.map(userId => <a href={`/students/${userId}`} target="_blank"
                                                key={userId}>
                                                <Avatar userId={userId} />
                                            </a>)
                                        }
                                    </Table.Cell>
                                    <Table.Cell onClick={(e) => {
                                        e.stopPropagation();
                                    }}>
                                        <p>
                                            <a className="ui green button" target="_blank"
                                                href={`/admin-neue/classDetail/${c.class_id}`}
                                                style={{ whiteSpace: 'nowrap' }}>编辑详情</a>
                                        </p>
                                        <Button onClick={() => this.openFeedback(c)}>
                                            <span style={{ whiteSpace: 'nowrap' }}>查看评价</span>
                                        </Button>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        }
                    </Table.Body>
                    <Table.Footer>
                        <Table.Row>
                            <BuzzPagination pagination={this.state.pagination} gotoPage={this.gotoPage}
                                paginationChanged={(newPagination) => {
                                    window.localStorage.setItem('pagination.per_page', newPagination.per_page);
                                    this.setState({ pagination: newPagination }, async () => {
                                        await this.searchClasses();
                                    })
                                }} colSpan={11} />
                        </Table.Row>
                    </Table.Footer>
                </Table>

                {
                    (process.env.NODE_NEV !== 'production') &&

                    <ClassDetail open={this.state.detailOpen} onClose={this.onClassDetailClosed}
                        onClassSaved={this.onClassSaved} class={this.state.currentClass}
                        buttonDisabled={this.state.buttonDisabled}></ClassDetail>
                }


                <ClassEvaluation open={this.state.evaluationOpen} onClose={this.onClassEvaluationClosed}
                    evaluation={this.state.currentClass} classInfo={this.state.currentClass} />
            </Container>
        );
    }

    handleSort(clickedColumn) {
        const { column, direction, classes } = this.state;

        if (column !== clickedColumn) {
            this.setState({
                column: clickedColumn,
                classes: _.sortBy(classes, [clickedColumn]),
                direction: 'ascending'
            });

            return;
        }

        if (direction === 'ascending') {
            this.setState({
                classes: classes.reverse(),
                direction: 'descending'
            });

            return;
        }

        if (direction === 'descending') {
            this.setState({
                classes: classes.sort(nearestToper),
                direction: null,
                column: null
            });
        }
    }

    async gotoPage({ activePage }) {
        let p = this.state.pagination;
        p.current_page = activePage;

        this.setState({ pagination: p }, async () => {
            await this.searchClasses();
        })
    }

    searchClassesByStatus(status) {
        let searchParams = this.state.searchParams
        searchParams.statuses = [status]

        this.setState({ searchParams, pagination: BuzzPaginationData }, async () => {
            await this.searchClasses()
        })
    }

    openAdminNeueClassDetail() {

    }
}