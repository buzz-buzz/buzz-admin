import * as React from "react";
import {
    Button,
    Container,
    Dropdown,
    Form,
    Icon,
    Input,
    Label,
    Menu,
    Segment,
    Table
} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import Profile from "./profile";
import SchedulePreference from "./schedule-preference";
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import 'moment/locale/zh-cn'
import ClassHours from "./class-hours";
import Credits from "./credits";
import LevelModal from "../students/level-modal";
import queryString from 'query-string';
import {MemberType} from "../../common/MemberType";
import history from '../common/history';
import BuzzPagination, {BuzzPaginationData} from "../common/BuzzPagination";
import UserTags from "./user-tags";
import DatePicker from "react-datepicker/es/index";
import {StudentLifeCycleKeys, StudentLifeCycles} from "../../common/LifeCycles";
import ErrorHandler from "../../common/ErrorHandler";
import {connect} from 'react-redux';
import {changeUserState} from "../../redux/actions";
import LifeCycleChangeModal from "./life-cycle-change-modal";
import UserListTableHeader from "./user-list-table-header";
import UserListTableRow from "./user-list-table-row";

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

class UserList extends React.Component {
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
                follower: '',
                weekly_schedule_requirements: '',
                tags: [],
            },
            allTags: [],
            pagination: BuzzPaginationData,
            loading: false,
            users: [],
            currentLifeCycleChange: {},
        };

        this.searchUsers = this.searchUsers.bind(this);
        this.handleTextChange = this.handleTextChange.bind(this);
        this.openClassHours = this.openClassHours.bind(this);
        this.closeClassHoursModal = this.closeClassHoursModal.bind(this);
        this.classHoursUpdated = this.classHoursUpdated.bind(this);
        this.openIntegral = this.openIntegral.bind(this);
        this.openProfile = this.openProfile.bind(this);
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
            if (this.props.match.params.userId === 'undefined') {
                return this.createNewUser()
            }

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

    async searchUsers(orderBy = null, sortDirection = null) {
        if (!_.isString(orderBy)) {
          orderBy = null
        }
        if (!_.isString(sortDirection)) {
          sortDirection = null
        }
        this.setState({loading: true});
        try {
            let paginationData = await            ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users`,
                    useQuerystring: true,
                    qs: Object.assign({
                        role: this.props['user-type']
                    }, this.state.searchParams, {
                        start_time: this.state.searchParams.start_time ? new Date(this.state.searchParams.start_time) : undefined,
                        end_time: this.state.searchParams.end_time ? new Date(this.state.searchParams.end_time) : undefined,
                        orderBy,
                        orderDirection: sortDirection
                    }, this.state.pagination)
                }
            });

            let users = paginationData.data;

            this.setState({
                users: await attachEvents.call(this, users),
                pagination: {
                    current_page: paginationData.current_page,
                    from: paginationData.from,
                    last_page: paginationData.last_page,
                    offset: paginationData.offset,
                    per_page: paginationData.per_page,
                    to: paginationData.to,
                    total: paginationData.total
                }
            });
        } catch (ex) {
            ErrorHandler.handle(ex)
        } finally {
            this.setState({loading: false})
        }
    }

    handleTextChange(event, {value, name}) {
        let clonedSearchParams = this.state.searchParams;
        clonedSearchParams[name] = value;

        this.setState({
            searchParams: clonedSearchParams
        });
    }

    handleDateChange = (attr, date) => {
        this.setState({
            searchParams: {
                ...this.state.searchParams,
                [attr]: date || ''
            }
        })
    };

    render() {
        return (
            <Container fluid style={{overflow: 'auto'}}>
                {this.renderSearchForm()}
                {
                    this.props['user-type'] === MemberType.Student &&
                    this.renderStudentStates()
                }

                <Segment basic loading={this.state.loading}>
                    {this.renderListTable()}
                </Segment>
                <ClassHours open={this.state.classHoursModalOpen}
                            user={this.state.currentUser}
                            classHoursUpdateCallback={this.classHoursUpdated}
                            onCloseCallback={this.closeClassHoursModal}/>

                <Credits open={this.state.integralModalOpen}
                         user={this.state.currentUser}
                         integralUpdateCallback={this.integralUpdated}
                         onCloseCallback={this.closeIntegralModal}/>
                {
                    this.props['user-type'] === MemberType.Student &&

                    <LevelModal open={this.state.levelModalOpen}
                                user={this.state.currentUser}
                                onCloseCallback={this.onCloseLevelModal}
                                onLevelUpdated={this.onLevelUpdated}/>
                }
                <Profile open={this.state.profileModalOpen}
                         user={this.state.currentUser}
                         profileUpdateCallback={this.profileUpdated}
                         onCloseCallback={this.closeProfileModal}
                         userCreatedCallback={this.userCreated}
                         onUserDeleted={this.onUserDeleted}/>
                <SchedulePreference
                    open={this.state.schedulePreferenceModalOpen}
                    user={this.state.currentUser}
                    onCloseCallback={this.closeSchedulePreferenceModal}/>
                <LifeCycleChangeModal open={this.state.showLifecycleModal} onClose={() => this.setState({showLifecycleModal: false})} changeUserState={(user, newState, remark) => {
                    let index = -1
                    for (let i = 0; i < this.state.users.length; i++) {
                        if (this.state.users[i].user_id === user.user_id) {
                            index = i;
                        }
                    }
                    this.setState({
                        users: [...this.state.users.slice(0, index), {...user, state: newState}, ...this.state.users.slice(index + 1)]
                    })
                    this.props.changeUserState(user, newState, remark)
                }} user={this.state.currentLifeCycleChange.user} newState={this.state.currentLifeCycleChange.newState}/>
            </Container>
        )
    }


    changeState = (user, newState, i) => {
        if (newState === StudentLifeCycleKeys.demo) {
            this.setState({showLifecycleModal: true, currentLifeCycleChange: {newState: newState, user: user}});
        } else {
            const remark = window.prompt('请输入原因');
            if (remark !== null) {
                this.setState({
                    users: [...this.state.users.slice(0, i), {...user, state: newState}, ...this.state.users.slice(i + 1)],
                }, () => {
                    console.log('user new state = ', this.state.users)
                });

                this.props.changeUserState(user, newState, remark)
            }
        }
    }

    renderListTable() {

        return <Table celled selectable striped>
            <UserListTableHeader userType={this.props['user-type']} downloadLink={this.state.downloadLink} filename={this.state.filename} onExport={this.export} state={this.state.searchParams.state}/>
            <Table.Body>
                {
                    this.state.users.map((user, i) =>
                        <UserListTableRow key={user.user_id} match={this.props.match} userType={this.props['user-type']} user={user} openProfile={this.openProfile} openClassHours={this.openClassHours} openIntegral={this.openIntegral} openLevelModal={this.openLevelModal} openSchedulePreferenceModal={this.openSchedulePreferenceModal} changeState={(newState) => this.changeState(user, newState, i)} state={this.state.searchParams.state}/>
                    )
                }
            </Table.Body>
            <Table.Footer>
                <Table.Row>
                    <BuzzPagination pagination={this.state.pagination}
                                    gotoPage={this.gotoPage}
                                    paginationChanged={(newPagination) => {
                                        window.localStorage.setItem('pagination.per_page', newPagination.per_page);
                                        this.setState({pagination: newPagination}, async () => {
                                            await this.searchUsers();
                                        });
                                    }}
                                    colSpan={this.props['user-type'] === MemberType.Student ? UserListTableHeader.getColumnNumber(this.state.searchParams.state) : (this.props['user-type'] === MemberType.Companion ? 11 : 10)}/>
                </Table.Row>
            </Table.Footer>
        </Table>;
    }

    renderSearchForm() {
        return <Form onSubmit={this.searchUsers} loading={this.state.loading}>
            <div style={{padding: '0 15px'}}>
                <Form.Group widths='equal'>
                    <Form.Field control={Input} label="微信昵称" name="wechat_name"
                                value={this.state.searchParams.wechat_name}
                                onChange={this.handleTextChange}/>
                    <Form.Field control={Input} label="（孩子）英文名"
                                value={this.state.searchParams.name} name="name"
                                onChange={this.handleTextChange}>
                    </Form.Field>
                    <Form.Field control={Input} label="备注名（内部可见）"
                                value={this.state.searchParams.display_name}
                                name="display_name"
                                onChange={this.handleTextChange}/>
                    <Form.Field control={Input} label="手机号"
                                value={this.state.searchParams.mobile}
                                name="mobile" onChange={this.handleTextChange}/>
                    <Form.Field control={Input} label="邮箱"
                                value={this.state.searchParams.email}
                                name="email" onChange={this.handleTextChange}/>
                    <Form.Field control={Input} label="跟进人"
                                value={this.state.searchParams.follower}
                                name="follower" onChange={this.handleTextChange}/>
                </Form.Group>
                <Form.Group widths="equal">
                    <Form.Field>
                        <label>预约/排课时间段 开始时间</label>
                        <DatePicker showTimeSelect
                                    selected={this.state.searchParams.start_time ? moment(this.state.searchParams.start_time) : null}
                                    name="start_time" isClearable={true}
                                    dateFormat={'YYYY-MM-DD HH:mm'}
                                    placeholderText={"开始时间"}
                                    onChange={date => this.handleDateChange('start_time', date)}/>
                    </Form.Field>

                    <Form.Field>
                        <label>结束时间</label>
                        <DatePicker showTimeSelect
                                    selected={this.state.searchParams.end_time ? moment(this.state.searchParams.end_time) : null}
                                    name="end_time" isClearable={true}
                                    dateFormat={"YYYY-MM-DD HH:mm"}
                                    placeholderText={"结束时间"}
                                    onChange={date => this.handleDateChange('end_time', date)}/>
                    </Form.Field>

                    <Form.Field>
                        <label>注册开始时间段 开始时间</label>
                        <DatePicker
                            selected={this.state.searchParams.create_start_time ? moment(this.state.searchParams.create_start_time) : null}
                            name="create_start_time" isClearable={true}
                            dateFormat={"YYYY-MM-DD HH:mm"}
                            placeholderText={"注册开始时间段 开始时间"}
                            onChange={date => this.handleDateChange('create_start_time', date)}/>
                    </Form.Field>
                    <Form.Field>
                        <label>结束时间</label>
                        <DatePicker showTimeSelect
                                    selected={this.state.searchParams.create_end_time ? moment(this.state.searchParams.create_end_time) : null}
                                    name="create_end_time" isClearable={true}
                                    dateFormat={"YYYY-MM-DD HH:mm"}
                                    placeholderText={"结束时间"}
                                    onChange={date => this.handleDateChange('create_end_time', date)}/>
                    </Form.Field>
                    <Form.Field control={Dropdown} label="用户标签" name="tags"
                                value={this.state.searchParams.tags} multiple
                                options={this.state.allTags}
                                search selection
                                onChange={this.handleSelectedTagsChange}/>

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
                        }]} placeholder="排课状态"
                                     value={this.state.searchParams.weekly_schedule_requirements}
                                     name="weekly_schedule_requirements"
                                     onChange={this.handleTextChange}/>
                    </Form.Field>
                </Form.Group>
                <Form.Group>
                    <Button type="submit">
                        <Icon name="search"/>
                        查询
                    </Button>
                    {
                        this.props['user-type'] === MemberType.Companion &&
                        <Button type="button"
                                onClick={this.createNewUser}>创建新用户</Button>
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
            </div>
        </Form>
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

    openIntegral(user) {
        this.setState({
            integralModalOpen: true,
            currentUser: user
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
        selectedUser.order_remark = newProfile.order_remark;
        selectedUser.rookie_room_url = newProfile.rookie_room_url;
        selectedUser.avatar = newProfile.avatar;
        selectedUser.grade = newProfile.grade;
        selectedUser.school_name = newProfile.school_name;
        selectedUser.time_zone = newProfile.time_zone;
        selectedUser.date_of_birth = newProfile.date_of_birth;
        selectedUser.weekly_schedule_requirements = newProfile.weekly_schedule_requirements;
        selectedUser.password = newProfile.password;
        selectedUser.source = newProfile.source;
        selectedUser.follower = newProfile.follower;

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
                let value = u[key];
                if (key === 'mobile_country') {
                    value = u[key].country.country_full_name
                }
                line.push(encodeURIComponent(String(value).replace(/,/g, '|').replace(/[\r?\n]/g, '<br />')))
            })

            result.push(line.join(','))
        })

        return result.join('\n')
    }

    renderStudentStates = () => {
        return <Menu fluid widths={Object.keys(StudentLifeCycles).length}>
            {Object.keys(StudentLifeCycles).map(state => <Menu.Item name={StudentLifeCycles[state]} key={state}
                                                                    active={this.state.searchParams.state === state.toLowerCase()}
                                                                    onClick={() => this.filterUsersByState(state)}/>)}
        </Menu>
    };

    filterUsersByState = (state) => {
        let {searchParams} = this.state
        if (searchParams.state === state.toLowerCase()) {
            searchParams.state = ''
        } else {
            searchParams.state = state.toLowerCase()
        }

        this.setState({
            searchParams: searchParams,
            pagination: BuzzPaginationData
        }, async () => {
            await this.searchUsers('user_states.timestamp', 'desc')
        })
    }
}

export default connect(null, dispatch => ({
    changeUserState: (user, newState, remark) => dispatch(changeUserState(user, newState, remark))
}))(UserList)
