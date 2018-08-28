import {MemberType} from "../../common/MemberType";
import {Icon, Table} from "semantic-ui-react";
import React from "react";
import {StudentLifeCycleKeys} from "../../common/LifeCycles";

export default class UserListTableHeader extends React.Component {
    render() {
        const {userType, downloadLink, filename, onExport, state} = this.props
        return <Table.Header>
            <Table.Row>
                <Table.HeaderCell colSpan={UserListTableHeader.getColumnNumber(state)}>
                    <a href={downloadLink} className="ui button right floated"
                       download={filename} onClick={onExport}
                       style={{cursor: 'pointer'}}>
                        <Icon name="download"/>
                        导出
                    </a>
                </Table.HeaderCell>
            </Table.Row>
            {UserListTableHeader.renderHeaderOfState(userType, state)}
        </Table.Header>
    }

    static renderHeaderOfState(userType, state) {
        switch (state) {
            case StudentLifeCycleKeys.potential:
                return UserListTableHeader.renderPotential()
            case StudentLifeCycleKeys.lead:
                return UserListTableHeader.renderLeads()
            case StudentLifeCycleKeys.demo:
                return UserListTableHeader.renderDemo()
            case StudentLifeCycleKeys.waiting_purchase:
                return UserListTableHeader.renderWaitingPurchase()
            default:
                return UserListTableHeader.renderGeneral(userType)
        }
    }

    static renderGeneral(userType) {
        return <Table.Row>
            {UserListTableHeader.renderID()}
            {UserListTableHeader.renderAvatar()}
            {
                userType === MemberType.Companion &&
                UserListTableHeader.renderCountry()
            }
            {UserListTableHeader.renderContactInfo()}
            {UserListTableHeader.renderGrade()}
            {UserListTableHeader.renderClassHours()}
            {UserListTableHeader.renderScore()}
            {
                userType === MemberType.Student &&
                UserListTableHeader.renderLevel()
            }
            {UserListTableHeader.renderBookings()}
            {UserListTableHeader.renderTag()}
            {UserListTableHeader.renderState()}
            {UserListTableHeader.renderFollowup()}
        </Table.Row>;
    }

    static renderFollowup() {
        return <Table.HeaderCell>
            跟进情况
        </Table.HeaderCell>;
    }

    static renderState() {
        return <Table.HeaderCell>流程状态</Table.HeaderCell>;
    }

    static renderTag() {
        return <Table.HeaderCell>标签</Table.HeaderCell>;
    }

    static renderBookings() {
        return <Table.HeaderCell>预约/排课</Table.HeaderCell>;
    }

    static renderLevel() {
        return <Table.HeaderCell>能力评级</Table.HeaderCell>;
    }

    static renderScore() {
        return <Table.HeaderCell>
            积分
        </Table.HeaderCell>;
    }

    static renderClassHours() {
        return <Table.HeaderCell>
            总课时 <span style={{color: 'lightgray'}}> (已消费) </span>
            <br/>
            可用(冻结)
        </Table.HeaderCell>;
    }

    static renderGrade() {
        return <Table.HeaderCell>年级</Table.HeaderCell>;
    }

    static renderContactInfo() {
        return <Table.HeaderCell>联系信息<br/>手机号<br/>邮箱</Table.HeaderCell>;
    }

    static renderCountry() {
        return <Table.HeaderCell>国籍</Table.HeaderCell>;
    }

    static renderAvatar() {
        return <Table.HeaderCell>头像-昵称</Table.HeaderCell>;
    }

    static renderID() {
        return <Table.HeaderCell>用户编号</Table.HeaderCell>;
    }

    static getColumnNumber(state) {
        switch (state) {
            case StudentLifeCycleKeys.potential:
                return 5;
            case StudentLifeCycleKeys.lead:
                return 10;
            case StudentLifeCycleKeys.demo:
                return 14;
            case StudentLifeCycleKeys.waiting_purchase:
                return 10;
            default:
                return 11;
        }
    }

    static renderPotential() {
        return <Table.Row>
            {UserListTableHeader.renderID()}
            {UserListTableHeader.renderAvatar()}
            {UserListTableHeader.renderSource()}
            {UserListTableHeader.renderTag()}
            {UserListTableHeader.renderState()}
        </Table.Row>
    }

    static renderSource() {
        return <Table.HeaderCell>来源</Table.HeaderCell>
    }

    static renderLeads() {
        return <Table.Row>
            {UserListTableHeader.renderID()}
            {UserListTableHeader.renderAvatar()}
            {UserListTableHeader.renderContactInfo()}
            {UserListTableHeader.renderGrade()}
            {UserListTableHeader.renderLevel()}
            {UserListTableHeader.renderSource()}
            {UserListTableHeader.renderFollower()}
            {UserListTableHeader.renderFollowup()}
            {UserListTableHeader.renderTag()}
            {UserListTableHeader.renderState()}
        </Table.Row>
    }

    static renderFollower() {
        return <Table.HeaderCell>跟进人</Table.HeaderCell>
    }

    static renderDemo() {
        return <Table.Row>
            {UserListTableHeader.renderID()}
            {UserListTableHeader.renderAvatar()}
            {UserListTableHeader.renderContactInfo()}
            {UserListTableHeader.renderGrade()}
            {UserListTableHeader.renderClassHours()}
            {UserListTableHeader.renderLevel()}
            {UserListTableHeader.renderSource()}
            {UserListTableHeader.renderFollowup()}
            {UserListTableHeader.renderTrainingTime()}
            {UserListTableHeader.renderDemoTime()}
            {UserListTableHeader.renderFirstClass()}
            {UserListTableHeader.renderFollower()}
            {UserListTableHeader.renderTag()}
            {UserListTableHeader.renderState()}
        </Table.Row>
    }

    static renderTrainingTime() {
        return <Table.HeaderCell>入门指导</Table.HeaderCell>
    }


    static renderDemoTime() {
        return <Table.HeaderCell>体验时间</Table.HeaderCell>
    }

    static renderFirstClass() {
        return <Table.HeaderCell>Demo 课</Table.HeaderCell>
    }

    static renderWaitingPurchase() {
        return <Table.Row>
            {UserListTableHeader.renderID()}
            {UserListTableHeader.renderAvatar()}
            {UserListTableHeader.renderContactInfo()}
            {UserListTableHeader.renderGrade()}
            {UserListTableHeader.renderLevel()}
            {UserListTableHeader.renderFirstClass()}
            {UserListTableHeader.renderFollower()}
            {UserListTableHeader.renderFollowup()}
            {UserListTableHeader.renderTag()}
            {UserListTableHeader.renderState()}
        </Table.Row>
    }
}
