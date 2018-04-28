import * as React from "react";
import {Table} from "semantic-ui-react";
import moment from "moment";

export default class BookingTable extends React.Component {
    render() {
        return (
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>预约</Table.HeaderCell>
                        <Table.HeaderCell>开始日期</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {
                        (this.props.events || []).map((evt, i) => {
                            return (
                                <Table.Row key={i}>
                                    <Table.Cell>
                                        <span style={{whiteSpace: 'nowrap'}}>
                                            {
                                                evt.batch_id ?
                                                    <strong>每周 </strong>
                                                    :
                                                    <span>星期 </span>
                                            }
                                            <strong>{{
                                                1: '一',
                                                2: '二',
                                                3: '三',
                                                4: '四',
                                                5: '五',
                                                6: '六',
                                                7: '日',
                                                0: '日'
                                            }[moment(evt.start_time).weekday()]}</strong>
                                            &nbsp;&nbsp;
                                            {moment(evt.start_time).format(moment.HTML5_FMT.TIME)}
                                            -
                                            {moment(evt.end_time).format(moment.HTML5_FMT.TIME)}
                                        </span>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <span
                                            style={{whiteSpace: 'nowrap'}}>{moment(evt.start_time).format(moment.HTML5_FMT.DATE)}</span>
                                    </Table.Cell>
                                </Table.Row>
                            )
                        })
                    }
                </Table.Body>
            </Table>
        )
    }
}