import React from 'react'
import {Table} from "semantic-ui-react";
import {connect} from 'react-redux';

const history = ({userId, classHourHistory}) => <Table striped>
    <Table.Header>
        <Table.Row>
            <Table.HeaderCell>时间</Table.HeaderCell>
            <Table.HeaderCell>事件</Table.HeaderCell>
            <Table.HeaderCell>金额</Table.HeaderCell>
            <Table.HeaderCell>备注</Table.HeaderCell>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {
            classHourHistory && classHourHistory[userId] && classHourHistory[userId].map(r =>
                <Table.Row
                    key={r.timestamp}>
                    <Table.Cell>{r.timestamp}</Table.Cell>
                    <Table.Cell>{r.event}</Table.Cell>
                    <Table.Cell>{r.amount}</Table.Cell>
                    <Table.Cell>{r.remark}</Table.Cell>
                </Table.Row>)
        }
    </Table.Body>
</Table>

export default connect(store => ({
    classHourHistory: store.classHourHistory
}), null)(history)
