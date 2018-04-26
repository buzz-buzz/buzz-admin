import * as React from "react";
import {Table} from "semantic-ui-react";

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
                        (this.props.events || []).map(evt => {
                            return (
                                <Table.Row>
                                    <Table.Cell>yyy</Table.Cell>
                                    <Table.Cell>
                                        {evt.start_time.toISOString()}
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