import * as React from "react";
import {
    Button,
    Container,
    Dropdown,
    Flag,
    Form,
    Icon,
    Input,
    Label,
    Menu,
    Popup,
    Segment,
    Table
} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import Profile from "./profile";
import SchedulePreference from "./schedule-preference";
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/zh-cn'
import ClassHours from "../students/class-hours";
import Integral from "../students/integral";
import LevelModal from "../students/level-modal";
import BookingTable from "./booking-table";
import queryString from 'query-string';
import {MemberType, MemberTypeChinese} from "../../common/MemberType";
import history from '../common/history';
import BuzzPagination, {BuzzPaginationData} from "../common/BuzzPagination";
import UserTags from "./user-tags";
import {ClassStatusCode} from "../../common/ClassStatus";
import {Avatar} from "../../common/Avatar";
import {Grades} from '../../common/Grades';

moment.locale('zh-CN');
BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))

async function attachEvents(users) {
    let userIdArray = users.map(u => u.user_id);

    if (userIdArray && userIdArray.length) {
        let bookings = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v1/bookings/all?${queryString.stringify({users: userIdArray})}`,
                method: 'GET'
            }
        });

        bookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'ended');

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
    } else {
        return [];
    }
}

export default class UserList extends React.Component {
    handleSelectedTagsChange = (e, {value}) => {
        let {searchParams} = this.state;
        searchParams.tags = value;
        this.setState({
            searchParams
        })
    };
    searchUsersByTag = async (tag) => {
        let {searchParams} = this.state
        searchParams.tags = [tag]

        this.setState({
            searchParams: searchParams
        }, async () => {
            await this.searchUsers()
        })
    };
    export = () => {
        this.setState({
            downloadLink: `data:text/csv;charset=utf-8,\ufeff${this.generateCSV()}`,
            filename: 'users.csv'
        })
    };

    constructor(props) {
        super(props);

        this.state = {
            searchParams: {
                wechat_name: '',
                name: '',
                display_name: '',
                mobile: '',
                email: '',
                weekly_schedule_requirements: '',
                tags: [],
            },
            allTags: [],
            pagination: BuzzPaginationData,
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
        this.gotoPage = this.gotoPage.bind(this);
    }

    classHoursUpdated(newClassHours) {
        let copy = Object.assign({}, this.state.currentUser);
        copy.class_hours = newClassHours;

        let newUsers = this.state.users.map(s => {
            if (s.user_id === copy.user_id) {
                return copy;
            }

            return s;
        });

        this.setState({
            currentUser: copy,
            users: newUsers
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
        let searchParams = this.state.searchParams
        this.setState({
            allTags: (await UserTags.getAllTags()).map(t => {
                return {
                    key: t.tag,
                    value: t.tag,
                    text: t.tag
                }
            })
        })

        await this.searchUsers()

        await this.openSelectedUserProfile()
    }

    componentDidMount() {
        history.listen(() => this.forceUpdate());
    }

    async openSelectedUserProfile() {
        if (this.props.match.params.userId) {
            let theUsers = this.state.users.filter(s => s.user_id === Number(this.props.match.params.userId));
            if (theUsers.length) {
                this.openProfile(theUsers[0]);
            } else {
                let theUser = await ServiceProxy.proxyTo({
                    body: {
                        uri: `{buzzService}/api/v1/users/${this.props.match.params.userId}`
                    }
                });

                this.openProfile(theUser);
            }
        }
    }

    async searchUsers() {
        this.setState({loading: true});
        let paginationData = await
            ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users`,
                    useQuerystring: true,
                    qs: Object.assign({
                        role: this.props['user-type']
                    }, this.state.searchParams, {
                        start_time: this.state.searchParams.start_time ? new Date(this.state.searchParams.start_time) : undefined,
                        end_time: this.state.searchParams.end_time ? new Date(this.state.searchParams.end_time) : undefined
                    }, this.state.pagination)
                }
            });

        let users = paginationData.data;

        this.setState({
            loading: false, users: await attachEvents.call(this, users), pagination: {
                current_page: paginationData.current_page,
                from: paginationData.from,
                last_page: paginationData.last_page,
                offset: paginationData.offset,
                per_page: paginationData.per_page,
                to: paginationData.to,
                total: paginationData.total
            }
        });
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
                {this.renderSearchForm()}

                <Segment basic loading={this.state.loading}>
                    {this.renderListTable()}
                </Segment>
                <ClassHours open={this.state.classHoursModalOpen} student={this.state.currentUser}
                            classHoursUpdateCallback={this.classHoursUpdated}
                            onCloseCallback={this.closeClassHoursModal}/>

                <Integral open={this.state.integralModalOpen} student={this.state.currentUser}
                          integralUpdateCallback={this.integralUpdated}
                          onCloseCallback={this.closeIntegralModal}/>
                {
                    this.props['user-type'] === MemberType.Student &&

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

    renderListTable() {
        return <Table celled selectable striped>
            {this.renderTableHeader()}
            <Table.Body>
                {
                    this.state.users.map((user, i) =>
                        <Table.Row key={user.user_id} style={{cursor: 'pointer'}}
                                   onClick={() => this.setState({activeIndex: this.state.activeIndex === i ? null : i})}
                                   active={this.state.activeIndex === i}>
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                <p>{user.user_id}</p>
                                <p style={{color: 'gainsboro'}}>
                                    <Flag name={user.country}/>
                                    {user.country} {user.city}
                                </p>
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                <Menu text compact>
                                    <Menu.Item style={{maxWidth: '100%'}}>
                                        <Avatar userId={user.user_id}>
                                        </Avatar>
                                        {
                                            this.props.match.path === '/users/:userId?' &&
                                            <Label floating
                                                   color={user.role === MemberType.Student ? 'yellow' : 'black'}>
                                                <span
                                                    style={{whiteSpace: 'nowrap'}}>{MemberTypeChinese[user.role] ? MemberTypeChinese[user.role].substr(0, 1) : ''}</span>
                                            </Label>
                                        }
                                    </Menu.Item>
                                </Menu>

                                <div style={{color: 'gainsboro'}}>
                                    {user.created_at}<br/>
                                    <span
                                        style={{color: 'darkgray'}}>{moment(user.created_at).format('LLLL')}</span>
                                </div>
                            </Table.Cell>
                            {
                                this.props['user-type'] === MemberType.Companion &&

                                <Table.Cell onClick={() => this.openProfile(user)}>
                                    {user.country}
                                </Table.Cell>
                            }
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                <p>{user.mobile}</p>
                                <p>{user.email}</p>
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                {Grades[user.grade]}
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openClassHours(user)}
                                        style={{cursor: 'pointer'}}>
                                <div><a
                                    title="总课时数"><strong>{(user.class_hours + user.locked_class_hours) || 0}</strong></a>
                                </div>
                                <div
                                    style={{whiteSpace: 'nowrap'}}>
                                    <a title="可用课时数">{user.class_hours || 0}</a>
                                    （<a title="冻结课时数">{user.locked_class_hours || 0}</a>）
                                </div>
                            </Table.Cell>
                            {
                                <Table.Cell onClick={() => this.openIntegral(user)}
                                            style={{cursor: 'pointer'}}>
                                    {user.integral || 0}
                                </Table.Cell>
                            }
                            {
                                this.props['user-type'] === MemberType.Student && user.placement_test &&
                                <Table.Cell onClick={() => this.openLevelModal(user)}
                                            style={{whiteSpace: 'nowrap', color: user.level ? 'black' : 'red'}}>
                                    {user.level ? <strong>{user.level}</strong> : '待评级'}
                                </Table.Cell>
                            }
                            {
                                this.props['user-type'] === MemberType.Student && !user.placement_test &&
                                <Popup
                                    trigger={
                                        <Table.Cell style={{color: 'gainsboro', whiteSpace: 'nowrap'}}>待测试</Table.Cell>
                                    }
                                    content={`${user.display_name || user.name || user.wechat_name} 还没有进行测试，请提醒 TA 完成。`}
                                    on='click'
                                />
                            }
                            {/* <Table.Cell onClick={() => this.openProfile(user)}>
                                {user.weekly_schedule_requirements || '1'}
                            </Table.Cell> */}
                            <Table.Cell onClick={() => this.openSchedulePreferenceModal(user)}>
                                <BookingTable events={user.events} defaultDate={new Date()}></BookingTable>
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                <span>{user.tags}</span>
                            </Table.Cell>
                            <Table.Cell>
                                <a href={`/classes/?userIds=${user.user_id}&statuses=${ClassStatusCode.Opened}&statuses=${ClassStatusCode.Cancelled}&statuses=${ClassStatusCode.Ended}&start_time=1990-1-1`}
                                   target="_blank">课程历史</a>
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
                                        this.setState({pagination: newPagination}, async () => {
                                            await this.searchUsers();
                                        });
                                    }}
                                    colSpan={this.props['user-type'] === MemberType.Student ? 10 : (this.props['user-type'] === MemberType.Companion ? 10 : 9)}/>
                </Table.Row>
            </Table.Footer>
        </Table>;
    }

    renderSearchForm() {
        return <Form onSubmit={this.searchUsers} loading={this.state.loading}>
            <Form.Group widths='equal'>
                <Form.Field control={Input} label="微信昵称" name="wechat_name"
                            value={this.state.searchParams.wechat_name}
                            onChange={this.handleTextChange}></Form.Field>
                <Form.Field control={Input} label="（孩子）英文名" value={this.state.searchParams.name} name="name"
                            onChange={this.handleTextChange}>
                </Form.Field>
                <Form.Field control={Input} label="备注名（内部可见）"
                            value={this.state.searchParams.display_name}
                            name="display_name"
                            onChange={this.handleTextChange}></Form.Field>
                <Form.Field control={Input} label="手机号" value={this.state.searchParams.mobile}
                            name="mobile" onChange={this.handleTextChange}></Form.Field>
                <Form.Field control={Input} label="邮箱" value={this.state.searchParams.email}
                            name="email" onChange={this.handleTextChange}></Form.Field>
            </Form.Group>
            <Form.Group widths="equal">
                <Form.Field control={Input} label="预约/排课时间段 开始时间" name="start_time"
                            value={this.state.searchParams.start_time}
                            onChange={this.handleTextChange} type="datetime-local"></Form.Field>
                <Form.Field control={Input} label="结束时间" name="end_time"
                            value={this.state.searchParams.end_time}
                            onChange={this.handleTextChange} type="datetime-local"></Form.Field>
                <Form.Field control={Dropdown} label="用户标签" name="tags" value={this.state.searchParams.tags} multiple
                            options={this.state.allTags}
                            search selection
                            onChange={this.handleSelectedTagsChange}></Form.Field>

                <Form.Field>
                    <label>排课状态</label>
                    <Form.Select options={[{
                        key: 'all', text: '全部（不限）', value: ''
                    }, {
                        key: 'excess', text: '超额排课', value: 'excess'
                    }, {
                        key: 'no_need', text: '不可排课', value: 'no_need'
                    }, {
                        key: 'done', text: '排课完成', value: 'done'
                    }, {
                        key: 'need', text: '需排课', value: 'need'
                    }]} placeholder="排课状态" value={this.state.searchParams.weekly_schedule_requirements}
                                 name="weekly_schedule_requirements" onChange={this.handleTextChange}></Form.Select>
                </Form.Field>
            </Form.Group>
            <Form.Group>
                <Button type="submit">
                    <Icon name="search"/>
                    查询
                </Button>
                {
                    this.props['user-type'] === MemberType.Companion &&
                    <Button type="button" onClick={this.createNewUser}>创建新用户</Button>
                }

                <label>快捷方式：</label>
                <Label.Group color='blue'>
                    {
                        this.state.allTags.map(t => {
                            return (
                                <Label as="button" key={t.key} onClick={() => {
                                    this.searchUsersByTag(t.key)
                                }} style={{cursor: 'pointer'}}>
                                    {t.text}
                                </Label>
                            )
                        })
                    }
                </Label.Group>
            </Form.Group>
        </Form>
            ;
    }

    renderTableHeader() {
        return <Table.Header>
            <Table.Row>
                <Table.HeaderCell>用户编号</Table.HeaderCell>
                <Table.HeaderCell>头像-昵称</Table.HeaderCell>
                {
                    this.props['user-type'] === MemberType.Companion &&
                    <Table.HeaderCell>国籍</Table.HeaderCell>
                }
                <Table.HeaderCell>联系信息<br/>手机号<br/>邮箱</Table.HeaderCell>
                <Table.HeaderCell>年级</Table.HeaderCell>
                <Table.HeaderCell>
                    总课时
                    <br/>
                    可用(冻结)
                </Table.HeaderCell>
                <Table.HeaderCell>
                    积分
                </Table.HeaderCell>
                {
                    this.props['user-type'] === MemberType.Student &&
                    <Table.HeaderCell>能力评级</Table.HeaderCell>
                }
                {/* {
                    this.props['user-type'] === MemberType.Student && <Table.HeaderCell>每周学习次数</Table.HeaderCell>
                }
                {
                    this.props['user-type'] === MemberType.Companion && <Table.HeaderCell>每周教学次数</Table.HeaderCell>
                } */}
                <Table.HeaderCell>预约/排课</Table.HeaderCell>
                <Table.HeaderCell>标签</Table.HeaderCell>
                <Table.HeaderCell style={{cursor: 'pointer'}}>
                    <a href={this.state.downloadLink} download={this.state.filename} onClick={this.export}
                       style={{cursor: 'pointer'}}>导出</a>
                </Table.HeaderCell>
            </Table.Row>
        </Table.Header>
            ;
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

    openProfile(user) {
        this.setState({
            profileModalOpen: true,
            currentUser: user
        })

        history.push(this.props.match.path.replace(':userId?', user.user_id));
    }

    closeProfileModal() {
        this.setState({profileModalOpen: false});
        let url = this.props.match.path.replace('/:userId?', '');
        history.push(url);
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
        selectedUser.weekly_schedule_requirements = newProfile.weekly_schedule_requirements;
        selectedUser.password = newProfile.password;

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
        if (student.placement_test) {
            this.setState({
                currentUser: student,
                levelModalOpen: true
            })
        }
    }

    onCloseLevelModal() {
        this.setState({
            levelModalOpen: false
        })
    }

    onLevelUpdated(placementTestResult) {
        let currentUser = this.state.currentUser;
        currentUser.level = placementTestResult.level;
        let newUsers = this.state.users.map(s => {
            if (s.user_id === currentUser.user_id) {
                return currentUser;
            }

            return s;
        });
        this.setState({currentUser: currentUser, users: newUsers})
    }

    createNewUser() {
        this.openProfile({});
    }

    gotoPage(evt, {activePage}) {
        let p = this.state.pagination;
        p.current_page = activePage;

        this.setState({pagination: p}, async () => {
            await this.searchUsers();
        })
    }

    generateCSV() {
        const columnNames = {
            user_id: '用户编号',
            avatar: '用户头像',
            name: '小孩英文名',
            created_at: '注册时间',
            role: '角色',
            remark: '备注',
            display_name: '备注名',
            school_name: '学校',
            time_zone: '时区',
            order_remark: '订单备注',
            youzan_mobile: '有赞手机号',
            intro_done: '是否已完成新用户引导',
            weekly_schedule_requirements: '周上课频率需求',
            gender: '性别',
            date_of_birth: '生日',
            mobile: '手机号',
            email: '邮箱',
            language: '语言设置',
            location: '地址',
            description: '介绍',
            grade: '年级',
            parent_name: '父母姓名',
            country: '国家',
            city: '城市',
            facebook_id: 'Facebook 编号',
            wechat_name: '微信昵称',
            wechat_openid: '微信 openid',
            class_hours: '可用课时数',
            integral: '积分',
            level: '级别',
            interests: '兴趣',
            tags: '标签',
            locked_class_hours: '冻结课时数'
        }

        let headers = Object.keys(this.state.users[0]).filter(key => ['wechat_data', 'events', 'password', 'placement_test'].indexOf(key) < 0)

        let result = [];
        result.push(headers.map(h => columnNames[h] || h).join(','))

        this.state.users.forEach(u => {
            let line = []
            headers.forEach(key => {
                line.push(encodeURIComponent(String(u[key]).replace(/,/g, '|').replace(/[\r?\n]/g, '<br />')))
            })

            result.push(line.join(','))
        })

        return result.join('\n')
    }
}
