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

export default class UserListTableRow extends React.Component {
    render() {
        const {match, userType, user, openProfile, openClassHours, openIntegral, openLevelModal, openSchedulePreferenceModal, changeState} = this.props

        return <Table.Row
            style={{cursor: 'pointer'}}>
            <Table.Cell onClick={() => openProfile(user)}>
                <p>{user.user_id}</p>
                <p style={{color: 'gainsboro'}}>
                    {
                        user.country &&
                        <Flag name={user.country.toLowerCase()}/>
                    }
                    {user.country} {user.city}
                </p>
            </Table.Cell>
            <Table.Cell onClick={() => openProfile(user)}>
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
            </Table.Cell>
            {
                userType === MemberType.Companion &&

                <Table.Cell
                    onClick={() => openProfile(user)}>
                    {user.country}
                </Table.Cell>
            }
            <Table.Cell onClick={() => openProfile(user)}>
                <p>{user.mobile}</p>
                <p>{user.email}</p>
            </Table.Cell>
            <Table.Cell onClick={() => openProfile(user)}>
                {Grades[user.grade]}
            </Table.Cell>
            <Table.Cell
                onClick={(e) => {
                    e.stopPropagation();
                    openClassHours(user);
                }}
                style={{cursor: 'pointer'}}>
                <ClassHourDisplay user={user}/>
            </Table.Cell>
            {
                <Table.Cell
                    onClick={() => openIntegral(user)}
                    style={{cursor: 'pointer'}}>
                    {user.integral || 0}
                </Table.Cell>
            }
            {
                userType === MemberType.Student && user.placement_test &&
                <Table.Cell
                    onClick={() => openLevelModal(user)}
                    style={{
                        whiteSpace: 'nowrap',
                        color: user.level ? 'black' : 'red'
                    }}>
                    {user.level ?
                        <strong>{user.level}</strong> : '待评级'}
                </Table.Cell>
            }
            {
                userType === MemberType.Student && !user.placement_test &&
                <Popup
                    trigger={
                        <Table.Cell style={{
                            color: 'gainsboro',
                            whiteSpace: 'nowrap'
                        }}>待测试</Table.Cell>
                    }
                    content={`${user.display_name || user.name || user.wechat_name} 还没有进行测试，请提醒 TA 完成。`}
                    on='click'
                />
            }
            <Table.Cell
                onClick={() => openSchedulePreferenceModal(user)}>
                <BookingTable events={user.events}
                              defaultDate={new Date()}/>
            </Table.Cell>
            <Table.Cell onClick={() => openProfile(user)}>
                <span>{user.tags}</span>
            </Table.Cell>
            <Table.Cell>
                <LifeCycle user={user} changeState={changeState}/>
            </Table.Cell>
            <Table.Cell>
                <UserFollowup userId={user.user_id}/>
            </Table.Cell>
        </Table.Row>
    }
}
