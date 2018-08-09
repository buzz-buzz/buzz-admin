import React from 'react'
import {Table} from "semantic-ui-react";
import BuzzPagination from "../common/BuzzPagination";
import TimeDisplay from '../common/time-display';

const history = ({userId, classHourHistory, pagination, paginationChanged}) =>
    <Table striped>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>时间</Table.HeaderCell>
                <Table.HeaderCell>操作人</Table.HeaderCell>
                <Table.HeaderCell>事件</Table.HeaderCell>
                <Table.HeaderCell>金额</Table.HeaderCell>
                <Table.HeaderCell>备注</Table.HeaderCell>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {
                classHourHistory && classHourHistory[`${userId}-${pagination.current_page}`] && classHourHistory[`${userId}-${pagination.current_page}`].map(r =>
                    <Table.Row
                        key={r.timestamp}>
                        <Table.Cell>
                            <TimeDisplay timestamp={r.timestamp} format="LLL"/>
                        </Table.Cell>
                        <Table.Cell>
                            {r.by}
                        </Table.Cell>
                        <Table.Cell>{r.event}</Table.Cell>
                        <Table.Cell>{r.amount}</Table.Cell>
                        <Table.Cell>{r.remark}</Table.Cell>
                    </Table.Row>)
            }
        </Table.Body>
        <Table.Footer>
            <Table.Row>
                <BuzzPagination colSpan={5}
                                pagination={pagination}
                                paginationChanged={paginationChanged}
                                gotoPage={(e, {activePage}) => {
                                    paginationChanged({
                                        ...pagination,
                                        current_page: activePage
                                    })
                                }}/>
            </Table.Row>
        </Table.Footer>
    </Table>

export default history
