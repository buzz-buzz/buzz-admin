import * as React from "react";
import {
    Button,
    Container,
    Dropdown,
    Form,
    Menu,
    Segment,
    Table,
    Message
} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import ClassDetail from "./class-detail-modal";
import ClassEvaluation from "./class-evaluation-modal";
import {ClassStatusCode} from "../../common/ClassStatus";
import * as _ from "lodash";
import {BuzzPaginationData} from "../common/BuzzPagination";
import BuzzPagination from "../common/BuzzPagination";
import {Avatar} from "../../common/Avatar";
import CurrentUser from "../../common/CurrentUser";
import moment from 'moment';
import DatePicker from 'react-datepicker';
import TimeDisplay from '../common/time-display';
import ClassRoomDisplay from "./ClassRoomDisplay";

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
    handleStatusChange = (event, {value}) => {
        let {searchParams} = this.state;
        searchParams.statuses = value;

        this.setState({
            searchParams,
        })
    };

    handleUsersChange = (event, {value}) => {
        this.setState({
            searchParams: {
                ...this.state.searchParams,
                user_ids: value
            }
        })
    };

    fetchAllUsers = async () => {
        if (!this.state.allUsersLoaded) {
            await this.getAllUsers()
        }
    };

    constructor() {
        super();

        let query = new URLSearchParams(window.location.search);
        let statuses = query.getAll('statuses').length ? query.getAll('statuses') : [ClassStatusCode.Opened];
        this.state = {
            classes: [],
            loading: false,
            searchParams: {
                start_time: query.get('start_time') || moment().subtract(30, 'days'),
                end_time: '',
                statuses: statuses,
                user_ids: query.getAll('userIds').map(id => Number(id)),
                orderby: 'diff ASC'
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
            allSales: []
        };

        this.openClassDetail = this.openClassDetail.bind(this);
        this.onClassDetailClosed = this.onClassDetailClosed.bind(this);
        this.onClassSaved = this.onClassSaved.bind(this);
        this.openClassDetail = this.openClassDetail.bind(this);
        this.openAdminNeueClassDetail = this.openAdminNeueClassDetail.bind(this);

        this.handleChange = this.handleChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.searchClasses = this.searchClasses.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.openFeedback = this.openFeedback.bind(this);
        this.onClassEvaluationClosed = this.onClassEvaluationClosed.bind(this);

        this.switchToStatus = this.switchToStatus.bind(this);
        this.handleSort = this.handleSort.bind(this);
        this.gotoPage = this.gotoPage.bind(this);
    }

    async updateStatus() {
        this.setState({loading: true});
        try {
            await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/class-schedule`,
                    method: 'PUT'
                }
            });

            this.setState({error: false});
            this.setState({error: false});
            await this.searchClasses();
        } catch (error) {
            this.setState({
                error: true,
                message: JSON.stringify(error.result || error.message || error)
            })
        } finally {
            this.setState({loading: false})
        }
    }

    handleChange(event, {name, value}) {
        let clonedSearchParams = this.state.searchParams;
        clonedSearchParams[name] = value;

        this.setState({
            searchParams: clonedSearchParams
        })
    }

    handleDateChange(attr, date) {
        this.setState({
            searchParams: {
                ...this.state.searchParams,
                [attr]: date || ''
            }
        })
    }

    switchToStatus(status) {
        this.setState({
            classes: this.state.classes,
            currentStatuses: [status],
            direction: null,
            column: null
        })
    }

    async searchClasses() {
        this.setState({loading: true})
        try {
            console.log('pagination = ', this.state.pagination);
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
                    c.subscribers = (c.subscribers || '').split(',').filter(uniqueFilter);
                    return c;
                }),
                currentStatuses: this.state.searchParams.statuses,
                error: false,
            })
        } catch (ex) {
            this.setState({
                error: true,
                message: ex.message || JSON.stringify(ex)
            })
        } finally {
            this.setState({loading: false})
        }
    }

    async getAllUsers() {
        this.setState({fetchingAllUsers: true})
        let result = await ServiceProxy.proxyTo({
            body: {uri: `{buzzService}/api/v1/users`}
        });
        this.setState({
            fetchingAllUsers: false, allSales: result.map(u => ({
                key: u.user_id,
                value: u.user_id,
                text: u.name || u.display_name || u.wechat_name,
                // description: u.display_name,
                image: {avatar: true, src: u.avatar}
            }))
        }, () => {
            this.setState({
                searchParams: {
                    ...this.state.searchParams,
                    user_ids: new URLSearchParams(window.location.search).getAll('userIds').map(id => Number(id))
                },
                allUsersLoaded: true
            })
        });
    }

    async componentWillMount() {
        await this.searchClasses();
        this.setState({
            currentUser: await CurrentUser.getInstance()
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
        this.setState({detailOpen: false})
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

        this.setState({classes: classes, currentClass: savedClass});
    }

    openFeedback(c) {
        this.setState({
            evaluationOpen: true,
            currentClass: c,
        })
    }

    onClassEvaluationClosed() {
        this.setState({evaluationOpen: false})
    }

    render() {
        return (
            <Container>
                {this.renderSearchForm()}
                {this.renderClassStatuses()}
                {/*{this.renderPagination()}*/}
                {this.renderTable()}
                {this.renderPagination()}
                {
                    (process.env.NODE_NEV !== 'production') &&

                    <ClassDetail open={this.state.detailOpen}
                                 onClose={this.onClassDetailClosed}
                                 onClassSaved={this.onClassSaved}
                                 class={this.state.currentClass}
                                 buttonDisabled={this.state.buttonDisabled}/>
                }


                <ClassEvaluation open={this.state.evaluationOpen}
                                 onClose={this.onClassEvaluationClosed}
                                 evaluation={this.state.currentClass}
                                 classInfo={this.state.currentClass}/>
            </Container>
        );
    }

    renderTable() {
        return <Table celled sortable selectable striped>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell
                        sorted={this.state.column === 'class_id' ? this.state.direction : null}
                        onClick={() => this.handleSort('class_id')}>班级ID</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'name' ? this.state.direction : null}
                        onClick={() => this.handleSort('name')}>班级名称</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'topic' ? this.state.direction : null}
                        onClick={() => this.handleSort('topic')}>主题名</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'topic_level' ? this.state.direction : null}
                        onClick={() => this.handleSort('topic_level')}>级别 </Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'start_time' ? this.state.direction : null}
                        onClick={() => this.handleSort('start_time')}>开课日期</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'start_time' ? this.state.direction : null}
                        onClick={() => this.handleSort('start_time')}>开始时间</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'end_time' ? this.state.direction : null}
                        onClick={() => this.handleSort('end_time')}>结束时间</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'room_url' ? this.state.direction : null}
                        onClick={() => this.handleSort('room_url')}>教室（链接）</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'companions' ? this.state.direction : null}
                        onClick={() => this.handleSort('companions')}>外籍伙伴</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'students' ? this.state.direction : null}
                        onClick={() => this.handleSort('students')}>中方用户</Table.HeaderCell>
                    <Table.HeaderCell
                        sorted={this.state.column === 'subscribers' ? this.state.direction : null}
                        onClick={() => this.handleSort('subscribers')}>运营人员</Table.HeaderCell>
                    <Table.HeaderCell>操作</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {
                    this.state.classes.filter(c => this.state.currentStatuses.length === 0 || this.state.currentStatuses.indexOf(c.status) >= 0).map((c) =>
                        <Table.Row key={c.class_id} style={{cursor: 'pointer'}}
                                   onClick={() => process.env.NODE_ENV !== 'production' ? this.openClassDetail(c) : this.openAdminNeueClassDetail(c)}>
                            <Table.Cell>
                                {c.class_id}
                            </Table.Cell>
                            <Table.Cell>
                                <strong>{c.name}</strong><br/>
                                <span
                                    style={{color: 'gainsboro'}}>{c.status}</span><br/>
                                <span style={{color: 'lightgray'}}>$</span>
                                <span
                                    style={{color: c.class_hours > 1 ? 'red' : c.class_hours < 1 ? 'gray' : 'black'}}>{c.class_hours}</span>
                            </Table.Cell>
                            <Table.Cell>
                                {c.topic}
                            </Table.Cell>
                            <Table.Cell>
                                {c.topic_level}
                            </Table.Cell>
                            <Table.Cell>
                                <TimeDisplay timestamp={c.start_time}/>
                            </Table.Cell>
                            <Table.Cell>
                                {new Date(c.start_time).toLocaleTimeString()}<br/>
                                <span
                                    style={{color: 'lightgray'}}>{moment(c.start_time).format('LT')}</span>
                            </Table.Cell>
                            <Table.Cell>
                                {new Date(c.end_time).toLocaleTimeString()}<br/>
                                <span
                                    style={{color: 'lightgray'}}>{moment(c.end_time).format('LT')}</span>
                            </Table.Cell>
                            <Table.Cell style={{
                                whiteSpace: 'normal',
                                wordWrap: 'break-word'
                            }}>
                                <ClassRoomDisplay roomUrl={c.room_url}/>
                            </Table.Cell>
                            <Table.Cell>
                                {
                                    c.companions.map(userId => <a
                                        href={`/companions/${userId}`}
                                        target="_blank"
                                        key={userId}>
                                        <Avatar userId={userId}/>
                                    </a>)
                                }
                            </Table.Cell>
                            <Table.Cell
                                onClick={(event) => event.stopPropagation()}>
                                {
                                    c.students.map(userId => <a
                                        href={`/students/${userId}`}
                                        target="_blank"
                                        key={userId}>
                                        <Avatar userId={userId}/>
                                    </a>)
                                }
                            </Table.Cell>
                            <Table.Cell
                                onClick={event => event.stopPropagation()}>
                                {
                                    c.subscribers.map(userId => <a
                                        href={`/users/${userId}`}
                                        target="_blank" key={userId}>
                                        <Avatar userId={userId}/>
                                    </a>)
                                }
                            </Table.Cell>
                            <Table.Cell onClick={(e) => {
                                e.stopPropagation();
                            }}>
                                <p>
                                    <a className="ui green button"
                                       target="_blank"
                                       href={`/admin-neue/classDetail/${c.class_id}`}
                                       style={{whiteSpace: 'nowrap'}}>编辑详情</a>
                                </p>
                                <p>
                                    <a className="ui green button"
                                       target="_blank"
                                       href={`/feedbacks/${c.class_id}`}
                                       style={{whiteSpace: 'nowrap'}}>
                                        查看评价
                                    </a>
                                </p>
                            </Table.Cell>
                        </Table.Row>
                    )
                }
            </Table.Body>
        </Table>;
    }

    renderClassStatuses() {
        return <Menu fluid widths={Object.keys(ClassStatusCode).length}>
            {
                Object.keys(ClassStatusCode).map(
                    key => (
                        <Menu.Item name={key}
                                   active={this.state.currentStatuses.indexOf(ClassStatusCode[key]) >= 0}
                                   onClick={() => this.searchClassesByStatus(ClassStatusCode[key])}
                                   key={key}/>
                    )
                )
            }
        </Menu>;
    }

    renderSearchForm() {
        return <Segment loading={this.state.loading}>
            <Form onSubmit={this.searchClasses} error={this.state.error}>
                <Message error>
                    <p>{this.state.message}</p>
                </Message>
                <Form.Group widths="equal">
                    <Form.Field>
                        <label>开班开始时间</label>
                        <DatePicker showTimeSelect
                                    selected={this.state.searchParams.start_time ? moment(this.state.searchParams.start_time) : null}
                                    name="start_time" isClearable={true}
                                    dateFormat={"YYYY-MM-DD HH:mm"}
                                    placeholderText={"开班开始时间"}
                                    onChange={date => this.handleDateChange('start_time', date)}/>
                    </Form.Field>
                    <Form.Field>
                        <label>开班结束时间</label>
                        <DatePicker showTimeSelect
                                    selected={this.state.searchParams.end_time ? moment(this.state.searchParams.end_time) : null}
                                    name="end_time"
                                    isClearable={true}
                                    dateFormat={"YYYY-MM-DD HH:mm"}
                                    placeholderText={"开班结束时间"}
                                    onChange={date => this.handleDateChange('end_time', date)}/>
                    </Form.Field>
                    <Form.Field control={Dropdown} label="状态" name="status"
                                value={this.state.searchParams.statuses}
                                onChange={this.handleStatusChange} multiple
                                search selection
                                options={this.state.allStatuses}/>
                    <Form.Field control={Dropdown} label="参与者" name="users"
                                value={this.state.searchParams.user_ids}
                                onChange={this.handleUsersChange}
                                onClick={this.fetchAllUsers}
                                multiple search selection
                                options={this.state.allSales}
                                loading={this.state.fetchingAllUsers}
                    />
                    <Form.Field control={Dropdown} label="排序方式" name="orderby"
                                value={this.state.searchParams.orderby}
                                onChange={this.handleChange}
                                options={[{
                                    key: 'diff ASC',
                                    value: 'diff ASC',
                                    text: '开课时间越近越靠前'
                                }, {
                                    key: 'start_time DESC',
                                    value: 'start_time DESC',
                                    text: '开课时间倒序'
                                }]} selection/>
                </Form.Group>
            </Form>
            <Form.Group>
                <Button type="submit" onClick={this.searchClasses}>查询</Button>
                {
                    process.env.NODE_ENV !== 'production' &&
                    <Button onClick={() => this.openClassDetail()}
                            type="button">创建班级</Button>
                }
                <a className="ui button green"
                   href={`/admin-neue/classDetail/create`}
                   target="_blank">创建班级</a>
                {
                    this.state.currentUser.super &&
                    <Button onClick={this.updateStatus}
                            type="button">批量更新班级结束状态</Button>
                }
            </Form.Group>
        </Segment>;
    }

    renderPagination() {
        return (
            <Table>
                <Table.Header>
                    <Table.Row>
                        <BuzzPagination pagination={this.state.pagination}
                                        gotoPage={this.gotoPage}
                                        paginationChanged={(newPagination) => {
                                            window.localStorage.setItem('pagination.per_page', newPagination.per_page);
                                            this.setState({pagination: newPagination}, async () => {
                                                await this.searchClasses();
                                            })
                                        }} colSpan={11}/>
                    </Table.Row>
                </Table.Header>
            </Table>
        )
    }

    handleSort(clickedColumn) {
        const {column, direction, classes} = this.state;

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

    async gotoPage(e, {activePage}) {
        let p = this.state.pagination;
        p.current_page = activePage;

        this.setState({pagination: p}, async () => {
            await this.searchClasses();
        })
    }

    searchClassesByStatus(status) {
        let searchParams = this.state.searchParams
        searchParams.statuses = [status]

        this.setState({
            searchParams,
            pagination: BuzzPaginationData
        }, async () => {
            await this.searchClasses()
        })
    }

    openAdminNeueClassDetail() {

    }
}
