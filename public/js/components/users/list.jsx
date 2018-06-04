import * as React from "react";
import {
    Button,
    Container,
    Divider,
    Dropdown,
    Form,
    Icon,
    Image,
    Input,
    Label,
    Menu,
    Pagination, Segment,
    Table
} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import Profile from "./profile";
import SchedulePreference from "./schedule-preference";
import BigCalendar from 'react-big-calendar'
import moment from 'moment'
import ClassHours from "../students/class-hours";
import Integral from "../students/integral";
import LevelModal from "../students/level-modal";
import BookingTable from "./booking-table";
import queryString from 'query-string';
import {MemberType} from "../../common/MemberType";
import history from '../common/history';
import BuzzPagination, {BuzzPaginationData} from "../common/BuzzPagination";
import UserTags from "./user-tags";

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))

async function attachEvents(users) {
    let self = this;

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

    constructor(props) {
        super(props);

        this.state = {
            searchParams: {
                wechat_name: '',
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
                    uri: `{buzzService}/api/v1/users?role=${this.props['user-type']}`,
                    useQuerystring: true,
                    qs: Object.assign({
                        role: this.props['user-type']
                    }, this.state.searchParams, {
                        start_time: this.state.searchParams.start_time ? new Date(this.state.searchParams.start_time) : undefined,
                        end_time: this.state.searchParams.end_time ? new Date(this.state.searchParams.end_time) : undefined
                    }, this.state.pagination)
                }
            });

        let students = paginationData.data;

        this.setState({
            loading: false, users: await attachEvents.call(this, students), pagination: {
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
        return <Table celled>
            {this.renderTableHeader()}
            <Table.Body>
                {
                    this.state.users.map((user, i) =>
                        <Table.Row key={user.user_id} style={{cursor: 'pointer'}}>
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                {user.user_id}
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                <object data={user.avatar} type="image/png" className="ui image avatar"
                                        title={user.user_id} alt={user.user_id}>
                                    <Image src="/images/empty_avatar.jpg" avatar title={user.user_id}
                                           alt={user.user_id}/>
                                </object>
                            </Table.Cell>
                            {
                                this.props['user-type'] === MemberType.Companion &&

                                <Table.Cell onClick={() => this.openProfile(user)}>
                                    {user.country}
                                </Table.Cell>
                            }
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                {user.wechat_name}
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                {user.name || user.facebook_name}
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                {user.display_name}
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                {user.mobile}
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                {user.email}
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openClassHours(user)}
                                        style={{cursor: 'pointer'}}>
                                {user.class_hours || 0}
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openIntegral(user)}
                                        style={{cursor: 'pointer'}}>
                                {user.integral || 0}
                            </Table.Cell>
                            {
                                this.props['user-type'] === MemberType.Student &&
                                <Table.Cell onClick={() => this.openLevelModal(user)}>
                                    {user.level}
                                </Table.Cell>
                            }
                            <Table.Cell onClick={() => this.openProfile(user)}>
                                {user.weekly_schedule_requirements || '1'}
                            </Table.Cell>
                            <Table.Cell onClick={() => this.openSchedulePreferenceModal(user)}>
                                <BookingTable events={user.events} defaultDate={new Date()}></BookingTable>
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
                                        this.setState({pagination: newPagination})
                                    }}/>
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
                <Form.Field control={Input} label="(孩子)英文名/备注名（内部可见）"
                            value={this.state.searchParams.display_name}
                            name="display_name"
                            onChange={this.handleTextChange}></Form.Field>
                <Form.Field control={Input} label="手机号" value={this.state.searchParams.mobile}
                            name="mobile" onChange={this.handleTextChange}></Form.Field>
                <Form.Field control={Input} label="邮箱" value={this.state.searchParams.email}
                            name="email" onChange={this.handleTextChange}></Form.Field>
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
            </Form.Group>
            <Form.Group>
                <Button type="submit">查询</Button>
                {
                    this.props['user-type'] === MemberType.Companion &&
                    <Button thpe="button" onClick={this.createNewUser}>创建新用户</Button>
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
                <Table.HeaderCell>头像</Table.HeaderCell>
                {
                    this.props['user-type'] === MemberType.Companion &&
                    <Table.HeaderCell>国籍</Table.HeaderCell>
                }
                <Table.HeaderCell>微信昵称</Table.HeaderCell>
                <Table.HeaderCell>(孩子)英文名</Table.HeaderCell>
                <Table.HeaderCell>备注名（内部可见）</Table.HeaderCell>
                <Table.HeaderCell>手机号</Table.HeaderCell>
                <Table.HeaderCell>邮箱</Table.HeaderCell>
                <Table.HeaderCell>课时数</Table.HeaderCell>
                <Table.HeaderCell>积分</Table.HeaderCell>
                {
                    this.props['user-type'] === MemberType.Student &&
                    <Table.HeaderCell>能力评级</Table.HeaderCell>
                }
                {
                    this.props['user-type'] === MemberType.Student && <Table.HeaderCell>每周学习次数</Table.HeaderCell>
                }
                {
                    this.props['user-type'] === MemberType.Companion && <Table.HeaderCell>每周教学次数</Table.HeaderCell>
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
}
