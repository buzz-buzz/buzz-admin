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

export default class UserListTableRow extends React.Component {
    render() {
        const {state, match, userType, user, openProfile, openClassHours, openIntegral, openLevelModal, openSchedulePreferenceModal, changeState} = this.props

        switch (state) {
            case StudentLifeCycleKeys.potential:
                return this.renderPotential(openProfile, user, match)
            case StudentLifeCycleKeys.lead:
                return this.renderLeads(openProfile, user, match, changeState)
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
        return <Table.Cell onClick={() => openProfile(user)}>{user.follower}</Table.Cell>
    }
}
