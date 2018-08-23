import React from "react";
import ServiceProxy from "../../service-proxy";
import {Button, Table} from "semantic-ui-react";

export default class UserFollowup extends React.Component {
    constructor(props) {
        super(props)

        this.state = {}
    }

    async componentWillMount() {
        let history = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v1/follow-up/${this.props.userId}`
            }
        })

        this.setState({
            rows: history.data,
            pagination: {...history, data: null}
        })
    }

    render() {
        return (<div>
                <Table>
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>时间</Table.HeaderCell>
                            <Table.HeaderCell>跟进人</Table.HeaderCell>
                            <Table.HeaderCell>内容</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {
                            this.state.rows && this.state.rows.map(r => <Table.Row key={r.timestamp}>
                                <Table.Cell>{r.timestamp}</Table.Cell>
                                <Table.Cell>{r.followed_by}</Table.Cell>
                                <Table.Cell>{r.remark}</Table.Cell>
                            </Table.Row>)
                        }
                        <Table.Row>
                            <Table.Cell colSpan={3}>
                                <Button className="" color="yellow">添加跟进记录</Button>
                            </Table.Cell>
                        </Table.Row>
                    </Table.Body>
                </Table>
            </div>
        )
    }
}
