import React from "react";
import ServiceProxy from "../../service-proxy";
import {Button, Form, Popup, Table, TextArea, Modal, Header} from "semantic-ui-react";
import CurrentUser from "../../common/CurrentUser";
import ErrorHandler from "../../common/ErrorHandler";
import moment from "moment";
import {Avatar} from "../../common/Avatar";
import BuzzPagination, {BuzzPaginationData} from "../common/BuzzPagination";

export default class UserFollowup extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            followup: '',
            pagination: BuzzPaginationData
        }
    }

    async componentWillMount() {
        await this.searchFollowups();
    }

    async searchFollowups() {
        let history = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v1/follow-up/${this.props.userId}`,
                useQuerystring: true,
                qs: this.state.pagination
            }
        })

        this.setState({
            rows: history.data,
            pagination: {...history, data: null}
        })
    }

    gotoPage = (evt, {activePage}) => {
        let p = this.state.pagination;
        p.current_page = activePage;

        this.setState({pagination: p}, async () => {
            await this.searchFollowups();
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
                            remark: this.state.followup,
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

    render(){
        return (
            <div className="buzz-follow">
                <Modal trigger={<Button className="" color="yellow">添加跟进记录</Button>}>
                    <Modal.Header>添加用户跟进信息</Modal.Header>
                    <Modal.Content>
                        <Form onSubmit={this.saveFollowup} loading={this.state.loading}>
                                <TextArea autoHeight placeholder="填写新的跟进内容" value={this.state.followup} onChange={this.handleChange} name="followup" rows={1}/>
                                <div>&nbsp;</div>
                                <Button className="" color="yellow">保存记录</Button>
                        </Form>
                        <div style={{marginBottom: '30px'}}></div>
                        <Modal.Description>
                                <Header>历史跟进记录</Header>
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
                                    <Table.Footer>
                                        <Table.Row>
                                            <BuzzPagination pagination={this.state.pagination}
                                                            gotoPage={this.gotoPage}
                                                            paginationChanged={(newPagination) => {
                                                                window.localStorage.setItem('pagination.per_page', newPagination.per_page);
                                                                this.setState({pagination: newPagination}, async () => {
                                                                    await this.searchFollowups();
                                                                });
                                                            }}
                                                            colSpan={3}/>
                                        </Table.Row>
                                    </Table.Footer>
                                </Table>
                        </Modal.Description>
                    </Modal.Content>
                </Modal>
            </div>
        )
    }

    renderOld() {
        return (<div>
                <Popup hoverable trigger={<div dangerouslySetInnerHTML={{__html: ((this.state.rows && this.state.rows.length) ? this.state.rows[0].remark : '')}}/>}>
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
                        <Table.Footer>
                            <Table.Row>
                                <BuzzPagination pagination={this.state.pagination}
                                                gotoPage={this.gotoPage}
                                                paginationChanged={(newPagination) => {
                                                    window.localStorage.setItem('pagination.per_page', newPagination.per_page);
                                                    this.setState({pagination: newPagination}, async () => {
                                                        await this.searchFollowups();
                                                    });
                                                }}
                                                colSpan={3}/>
                            </Table.Row>
                        </Table.Footer>
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
