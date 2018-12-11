import React from 'react'
import {Table} from "semantic-ui-react";
import BuzzPagination from "../common/BuzzPagination";
import TimeDisplay from '../common/time-display';
import {Avatar} from "../../common/Avatar";
import RemarkDisplay from "../common/RemarkDisplay";

const history = ({userId, history, pagination, paginationChanged, clearData, timeFix}) =>
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
                history && history[`${userId}-${pagination.current_page}`] && history[`${userId}-${pagination.current_page}`].map(r =>
                    <Table.Row
                        key={r.timestamp}>
                        <Table.Cell>
                            <TimeDisplay timestamp={r.timestamp} timeFix={timeFix} format="LLLL"/>
                        </Table.Cell>
                        <Table.Cell>
                            <Avatar userId={r.by}></Avatar>
                        </Table.Cell>
                        <Table.Cell>{r.event}</Table.Cell>
                        <Table.Cell>{r.amount}</Table.Cell>
                        <Table.Cell>
                            <RemarkDisplay remark={r.remark}/>
                        </Table.Cell>
                    </Table.Row>)
            }
        </Table.Body>
        <Table.Footer>
            <Table.Row>
                <BuzzPagination colSpan={5}
                                pagination={pagination}
                                paginationChanged={(pagination) => {
                                    clearData()
                                    paginationChanged({...pagination, current_page: 1})
                                }}
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
