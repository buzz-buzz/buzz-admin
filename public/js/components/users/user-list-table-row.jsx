import {MemberType, MemberTypeChinese} from "../../common/MemberType";
import moment from "moment/moment";
import {Grades} from "../../common/Grades";
import React from "react";
import {Flag, Menu, Popup, Table} from "semantic-ui-react";
import ClassHourDisplay from "../common/ClassHourDisplay";
import BookingTable from "./booking-table";
import LifeCycle from "../../common/LifeCycle";
import UserFollowup from "./user-follow-up";
import {Avatar} from "../../common/Avatar";
import {Label} from "recharts";
import {StudentLifeCycleKeys} from "../../common/LifeCycles";
import UserDropdownSingle from "./user-dropdown";
import ServiceProxy from "../../service-proxy";
import {connect} from 'react-redux';
import {addFirstClass, addLatestEndClass, addUserDemo} from "../../redux/actions";
import TimeDisplay from '../common/time-display';
import ClassAvatar from "../classes/class-avatar";

class UserListTableRow extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            user: props.user
        }
    }

    async componentWillMount() {
        const {userDemo, firstClass, latestEndClass, addUserDemoToStore, addFirstClassToStore, addLatestEndClassToStore} = this.props
        if (!userDemo[this.state.user.user_id]) {
            const userDemo = await ServiceProxy.proxyTo({
                body: {uri: `{buzzService}/api/v1/user-demo/${this.state.user.user_id}`}
            })

            addUserDemoToStore(this.state.user.user_id, userDemo)
        }

        if (!firstClass[this.state.user.user_id]) {
            const firstClass = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/student-class-schedule/demo-class/${this.state.user.user_id}`
                }
            })

            addFirstClassToStore(this.state.user.user_id, firstClass)
        }

        if (!latestEndClass[this.state.user.user_id]) {
            const latestEndClass = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/student-class-schedule/latest-end-class/${this.state.user.user_id}`
                }
            })

            addLatestEndClassToStore(this.state.user.user_id, latestEndClass)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.user) {
            this.setState({user: nextProps.user})
        }
    }

    render() {
        const {state, match, userType, openProfile, openClassHours, openIntegral, openLevelModal, openSchedulePreferenceModal, changeState, userDemo, firstClass, latestEndClass} = this.props
        const {user} = this.state

        switch (state) {
            case StudentLifeCycleKeys.potential:
                return this.renderPotential(openProfile, user, match)
            case StudentLifeCycleKeys.lead:
                return this.renderLeads(openProfile, user, match, changeState)
            case StudentLifeCycleKeys.demo:
                return this.renderDemoUsers(openProfile, user, match, changeState, userDemo, firstClass)
            case StudentLifeCycleKeys.waiting_purchase:
                return this.renderWaitingForPurchase(openProfile, openLevelModal, user, match, changeState, userDemo, firstClass)
            case StudentLifeCycleKeys.waiting_renewal:
                return this.renderWaitingForRenewal(openProfile, openLevelModal, user, match, openClassHours, changeState, latestEndClass)
            case StudentLifeCycleKeys.invalid:
                return this.renderInvalidUsers(openProfile, openLevelModal, user, match, openClassHours, changeState)
            default:
                return this.renderGeneral(openProfile, user, match, userType, openClassHours, openIntegral, openLevelModal, openSchedulePreferenceModal, changeState)
        }
    }

    renderGeneral(openProfile, user, match, userType, openClassHours, openIntegral, openLevelModal, openSchedulePreferenceModal, changeState) {
        return <Table.Row
            style={{cursor: 'pointer'}}>
            {this.renderID(openProfile, user)}
            {this.renderAvatar(openProfile, user, match)}
            {
                userType === MemberType.Companion &&

                this.renderCountry(openProfile, user)
            }
            {this.renderContact(openProfile, user)}
            {this.renderGrade(openProfile, user)}
            {this.renderClassHours(openClassHours, user)}
            {
                this.renderScore(openIntegral, user)
            }
            {
                userType === MemberType.Student && user.placement_test &&
                this.renderLevel(openLevelModal, user)
            }
            {
                userType === MemberType.Student && !user.placement_test &&
                UserListTableRow.renderPlacementTest(user)
            }
            {this.renderBookings(openSchedulePreferenceModal, user)}
            {this.renderTags(openProfile, user)}
            {UserListTableRow.renderState(user, changeState)}
            {UserListTableRow.renderFollowup(user)}
        </Table.Row>;
    }

    static renderFollowup(user) {
        return <Table.Cell>
            <UserFollowup userId={user.user_id}/>
        </Table.Cell>;
    }

    static renderState(user, changeState) {

        return <Table.Cell>
            <LifeCycle user={user} changeState={changeState}/>
        </Table.Cell>;
    }

    renderTags(openProfile, user) {
        return <Table.Cell onClick={() => openProfile(user)}>
            <span>{user.tags}</span>
        </Table.Cell>;
    }

    renderBookings(openSchedulePreferenceModal, user) {
        return <Table.Cell
            onClick={() => openSchedulePreferenceModal(user)}>
            <BookingTable events={user.events}
                          defaultDate={new Date()}/>
        </Table.Cell>;
    }

    static renderPlacementTest(user) {
        return <Popup
            trigger={
                <Table.Cell style={{
                    color: 'gainsboro',
                    whiteSpace: 'nowrap'
                }}>待测试</Table.Cell>
            }
            content={`${user.display_name || user.name || user.wechat_name} 还没有进行测试，请提醒 TA 完成。`}
            on='click'
        />;
    }

    renderLevel(openLevelModal, user) {
        return <Table.Cell
            onClick={() => openLevelModal(user)}
            style={{
                whiteSpace: 'nowrap',
                color: user.level ? 'black' : 'red'
            }}>
            {user.level ?
                <strong>{user.level}</strong> : '待评级'}
        </Table.Cell>;
    }

    renderScore(openIntegral, user) {
        return <Table.Cell
            onClick={() => openIntegral(user)}
            style={{cursor: 'pointer'}}>
            {user.integral || 0}
        </Table.Cell>;
    }

    renderClassHours(openClassHours, user) {
        return <Table.Cell
            onClick={(e) => {
                e.stopPropagation();
                openClassHours(user);
            }}
            style={{cursor: 'pointer'}}>
            <ClassHourDisplay user={user}/>
        </Table.Cell>;
    }

    renderGrade(openProfile, user) {
        return <Table.Cell onClick={() => openProfile(user)}>
            {Grades[user.grade]}
        </Table.Cell>;
    }

    renderContact(openProfile, user) {
        return <Table.Cell onClick={() => openProfile(user)}>
            <p>{user.mobile}</p>
            <p>{user.email}</p>
        </Table.Cell>;
    }

    renderCountry(openProfile, user) {
        return <Table.Cell
            onClick={() => openProfile(user)}>
            {user.country}
        </Table.Cell>;
    }

    renderAvatar(openProfile, user, match) {
        return <Table.Cell onClick={() => openProfile(user)}>
            <Menu text compact>
                <Menu.Item style={{maxWidth: '100%'}}>
                    <Avatar userId={user.user_id}>
                    </Avatar>
                    {
                        match.path === '/users/:userId?' &&
                        <Label floating
                               color={user.role === MemberType.Student ? 'yellow' : 'black'}>
                                                <span
                                                    style={{whiteSpace: 'nowrap'}}>{MemberTypeChinese[user.role] ? MemberTypeChinese[user.role].substr(0, 1) : ''}</span>
                        </Label>
                    }
                </Menu.Item>
            </Menu>

            <div>
                    <span
                        style={{color: 'darkgray'}}>{moment(user.created_at).format('LLLL')}</span>
            </div>
        </Table.Cell>;
    }

    renderID(openProfile, user) {
        return <Table.Cell onClick={() => openProfile(user)}>
            <p>{user.user_id}</p>
            <p style={{color: 'gainsboro'}}>
                {
                    user.country &&
                    <Flag name={user.country.toLowerCase()}/>
                }
                {user.country} {user.city}
            </p>
        </Table.Cell>;
    }

    renderPotential(openProfile, user, match) {
        return <Table.Row>
            {this.renderID(openProfile, user)}
            {this.renderAvatar(openProfile, user, match)}
            {this.renderSource(openProfile, user)}
            {this.renderTags(openProfile, user)}
            {UserListTableRow.renderState(user)}
        </Table.Row>
    }

    renderLeads(openProfile, user, match, changeState) {
        return <Table.Row>
            {this.renderID(openProfile, user)}
            {this.renderAvatar(openProfile, user, match)}
            {this.renderContact(openProfile, user)}
            {this.renderGrade(openProfile, user)}
            {this.renderLevel(openProfile, user)}
            {this.renderSource(openProfile, user)}
            {this.renderFollower(openProfile, user)}
            {UserListTableRow.renderFollowup(user)}
            {this.renderTags(openProfile, user)}
            {UserListTableRow.renderState(user, changeState)}
        </Table.Row>
    }

    renderSource(openProfile, user) {
        return <Table.Cell onClick={() => openProfile(user)}>{user.source}</Table.Cell>
    }

    renderFollower(openProfile, user) {
        return <Table.Cell>
            <UserDropdownSingle selectedUserId={user.follower} changeFollowerTo={async (follower) => {
                await ServiceProxy.proxyTo({
                    body: {
                        uri: `{buzzService}/api/v1/users/${user.user_id}`,
                        method: 'PUT',
                        json: {
                            follower: follower
                        }
                    }
                })

                this.setState({
                    user: {
                        ...user,
                        follower: follower
                    }
                })
            }}/>
        </Table.Cell>
    }

    renderDemoUsers(openProfile, user, match, changeState, userDemo, firstClass) {
        return <Table.Row>
            {this.renderID(openProfile, user)}
            {this.renderAvatar(openProfile, user, match)}
            {this.renderContact(openProfile, user)}
            {this.renderGrade(openProfile, user)}
            {this.renderClassHours(openProfile, user)}
            {UserListTableRow.renderPlacementTest(user)}
            {this.renderSource(openProfile, user)}
            {UserListTableRow.renderFollowup(user)}
            {UserListTableRow.renderTrainingTime(openProfile, user, userDemo[user.user_id])}
            {UserListTableRow.renderDemoTime(openProfile, user, userDemo[user.user_id])}
            {UserListTableRow.renderFirstClass(openProfile, user, firstClass)}
            {this.renderFollower(openProfile, user)}
            {this.renderTags(openProfile, user)}
            {UserListTableRow.renderState(user, changeState)}
        </Table.Row>
    }

    static renderTrainingTime(openProfile, user, userDemo) {
        return <Table.Cell onClick={openProfile}>
            {TimeDisplay({timestamp: (userDemo || {}).training_time, format: 'LL'})}
        </Table.Cell>
    }

    static renderDemoTime(openProfile, user, userDemo) {
        return <Table.Cell onClick={openProfile}>
            {TimeDisplay({timestamp: (userDemo || {}).demo_time, format: 'LL'})}
        </Table.Cell>
    }

    static renderFirstClass(openProfile, user, classInfo) {
        return <Table.Cell onClick={openProfile}>
            <ClassAvatar classInfo={classInfo[user.user_id]}/>
        </Table.Cell>
    }

    renderWaitingForPurchase(openProfile, openLevelModal, user, match, changeState, userDemo, firstClass) {
        return <Table.Row>
            {this.renderID(openProfile, user)}
            {this.renderAvatar(openProfile, user, match)}
            {this.renderContact(openProfile, user)}
            {this.renderGrade(openProfile, user)}
            {UserListTableRow.renderPlacementTest(user)}
            {UserListTableRow.renderFirstClass(openProfile, user, firstClass)}
            {this.renderFollower(openProfile, user)}
            {UserListTableRow.renderFollowup(user)}
            {this.renderTags(openProfile, user)}
            {UserListTableRow.renderState(user, changeState)}
        </Table.Row>
    }

    renderWaitingForRenewal(openProfile, openLevelModal, user, match, openClassHours, changeState, latestEndClass) {
        return <Table.Row>
            {this.renderID(openProfile, user)}
            {this.renderAvatar(openProfile, user, match)}
            {this.renderContact(openProfile, user)}
            {this.renderGrade(openProfile, user)}
            {UserListTableRow.renderPlacementTest(user)}
            {this.renderClassHours(openClassHours, user)}
            {UserListTableRow.renderFollowup(user)}
            {UserListTableRow.renderLatestEndClassFor(user, latestEndClass)}
            {this.renderFollower(openProfile, user)}
            {this.renderTags(openProfile, user)}
            {UserListTableRow.renderState(user, changeState)}
        </Table.Row>
    }

    static renderLatestEndClassFor(user, latestEndClass) {
        return <Table.Cell>
            <ClassAvatar classInfo={latestEndClass[user.user_id]}/>
        </Table.Cell>
    }

    renderInvalidUsers(openProfile, openLevelModal, user, match, openClassHours, changeState) {
        return <Table.Row>
            {this.renderID(openProfile, user)}
            {this.renderAvatar(openProfile, user, match)}
            {this.renderContact(openProfile, user)}
            {this.renderGrade(openProfile, user)}
            {UserListTableRow.renderPlacementTest(user)}
            {this.renderClassHours(openClassHours, user)}
            {this.renderSource(openProfile, user)}
            {UserListTableRow.renderFollowup(user)}
            {this.renderFollower(openProfile, user)}
            {this.renderTags(openProfile, user)}
            {UserListTableRow.renderState(user, changeState)}
        </Table.Row>
    }
}

export default connect(store => ({
    userDemo: store.userDemo,
    firstClass: store.firstClass,
    latestEndClass: store.latestEndClass,
}), dispatch => {
    return {
        addUserDemoToStore: (userId, userDemo) => dispatch(addUserDemo(userId, userDemo)),
        addFirstClassToStore: (userId, firstClass) => dispatch(addFirstClass(userId, firstClass)),
        addLatestEndClassToStore: (userId, latestEndClass) => dispatch(addLatestEndClass(userId, latestEndClass))
    }
})(UserListTableRow)
