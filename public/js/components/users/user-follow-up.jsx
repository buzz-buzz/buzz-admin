import React from "react";
import ServiceProxy from "../../service-proxy";
import {Button, Form, Popup, Table, TextArea} from "semantic-ui-react";
import CurrentUser from "../../common/CurrentUser";
import ErrorHandler from "../../common/ErrorHandler";
import moment from "moment";
import {Avatar} from "../../common/Avatar";

export default class UserFollowup extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            followup: ''
        }
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

    saveFollowup = async () => {
        if (confirm('一旦提交，就不能修改了哦')) {
            this.setState({loading: true});

            try {
                await ServiceProxy.proxyTo({
                    body: {
                        uri: `{buzzService}/api/v1/follow-up/${this.props.userId}`,
                        json: {
                            remark: this.state.followup
                        },
                        method: 'POST'
                    }
                });

                this.setState({
                    rows: [{
                        timestamp: new Date(),
                        followed_by: (await CurrentUser.getInstance()).userId,
                        remark: this.state.followup
                    }, ...this.state.rows]
                }, () => {
                    this.setState({followup: ''})
                })
            } catch (ex) {
                ErrorHandler.handle(ex)
            } finally {
                this.setState({loading: false})
            }
        }
    };

    handleChange = (event, {name, value}) => {
        this.setState({[name]: value})
    };

    render() {
        return (<div>
                <Popup hoverable trigger={<div dangerouslySetInnerHTML={{__html: (this.state.rows || []).map(r => r.remark).join('<br />')}}/>}>
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
                                    <Table.Cell style={{whiteSpace: 'nowrap'}}>{moment(r.timestamp).fromNow()}</Table.Cell>
                                    <Table.Cell><Avatar link={true} avatarOnly={true} userId={r.followed_by}/></Table.Cell>
                                    <Table.Cell>{r.remark}</Table.Cell>
                                </Table.Row>)
                            }
                        </Table.Body>
                    </Table>
                </Popup>
                <Popup hoverable trigger={<Button className="" color="yellow">添加跟进记录</Button>}>
                    <Form onSubmit={this.saveFollowup} loading={this.state.loading}>
                        <TextArea autoHeight placeholder="有什么要备注的吗？" value={this.state.followup} onChange={this.handleChange} name="followup" rows={1}/>
                        <div>&nbsp;</div>
                        <Button className="" color="yellow">保存</Button>
                    </Form>
                </Popup>
            </div>
        )
    }
}
