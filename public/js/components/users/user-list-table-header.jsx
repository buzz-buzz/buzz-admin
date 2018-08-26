import {MemberType} from "../../common/MemberType";
import {Icon, Table} from "semantic-ui-react";
import React from "react";

export default class UserListTableHeader extends React.Component {
    render() {
        const {userType, downloadLink, filename, onExport} = this.props
        return <Table.Header>
            <Table.Row>
                <Table.HeaderCell colSpan={11}>
                    <a href={downloadLink} className="ui button right floated"
                       download={filename} onClick={onExport}
                       style={{cursor: 'pointer'}}>
                        <Icon name="download"/>
                        导出
                    </a>
                </Table.HeaderCell>
            </Table.Row>
            <Table.Row>
                <Table.HeaderCell>用户编号</Table.HeaderCell>
                <Table.HeaderCell>头像-昵称</Table.HeaderCell>
                {
                    userType === MemberType.Companion &&
                    <Table.HeaderCell>国籍</Table.HeaderCell>
                }
                <Table.HeaderCell>联系信息<br/>手机号<br/>邮箱</Table.HeaderCell>
                <Table.HeaderCell>年级</Table.HeaderCell>
                <Table.HeaderCell>
                    总课时 <span style={{color: 'lightgray'}}> (已消费) </span>
                    <br/>
                    可用(冻结)
                </Table.HeaderCell>
                <Table.HeaderCell>
                    积分
                </Table.HeaderCell>
                {
                    userType === MemberType.Student &&
                    <Table.HeaderCell>能力评级</Table.HeaderCell>
                }
                <Table.HeaderCell>预约/排课</Table.HeaderCell>
                <Table.HeaderCell>标签</Table.HeaderCell>
                <Table.HeaderCell>流程状态</Table.HeaderCell>
                <Table.HeaderCell>
                    跟进情况
                </Table.HeaderCell>
            </Table.Row>
        </Table.Header>
    }
}
