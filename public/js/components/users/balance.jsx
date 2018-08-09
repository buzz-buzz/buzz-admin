import * as React from 'react';
import {Form, Header, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import ClassHourHistory from './class-hour-history'
import CreditsHistory from './credits-history'
import store from "../../redux/store/index";

const displayNameMap = {
    class_hours: '课时',
    integral: '积分'
}

export default class Balance extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            charge: 0,
            consume: 0,
            pagination: {
                current_page: 1,
                per_page: 10,
                total: 1,
                last_page: 1
            }
        }

        this.handleChange = this.handleChange.bind(this);
        this.charge = this.charge.bind(this);
        this.consume = this.consume.bind(this);
        this.close = this.close.bind(this);
        this.paginationChanged = this.paginationChanged.bind(this);
    }

    handleChange(e, {name, value}) {
        this.setState({
            [name]: value
        })
    }

    async componentWillMount() {
    }

    async paginationChanged(pagination) {
        console.log('pa = ', pagination)
        this.setState({pagination: pagination}, async () => {
            await this.searchHistory();
        })
    }

    async componentWillReceiveProps(nextProps) {
        this.setState({
            balance: nextProps.user ? (nextProps.user[this.props.balanceType] || 0) : 0,
            userId: nextProps.user ? nextProps.user.user_id : 0
        }, async () => {
            await this.searchHistory();
        })
    }

    async searchHistory() {
        if (this.state.userId && !store.getState()[this.props.balanceHistoryStoreName][`${this.state.userId}-${this.state.pagination.current_page}`]) {
            let history = await ServiceProxy.proxyTo({
                body: {
                    uri: `${this.props.historyApi}${this.state.userId}`,
                    qs: {
                        pageSize: this.state.pagination.per_page,
                        currentPage: this.state.pagination.current_page
                    },
                    method: 'GET'
                }
            })

            this.setState({
                pagination: {
                    total: history.total,
                    current_page: history.current_page,
                    per_page: history.per_page,
                    last_page: history.last_page
                }
            })
            store.dispatch(this.props.loadBalanceHistoryToStore(this.state.userId, history.data, this.state.pagination))
        }
    }

    componentDidMount() {
    }

    async charge() {
        try {
            this.setState({loading: true, error: false});
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `${this.props.balanceApi}${this.state.userId}`,
                    method: 'PUT',
                    json: {
                        [this.props.balanceType]: this.state.charge
                    }
                }
            });

            this.setState({
                balance: result[this.props.balanceType]
            })

            await this.searchHistory()
            this.props.balanceUpdatedCallback(result[this.props.balanceType]);
        } catch (error) {
            this.setState({
                error: true,
                message: error.message || error.toString()
            })
        } finally {
            this.setState({loading: false})
        }
    }

    async consume() {
        try {
            this.setState({loading: true, error: false});
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `${this.props.balanceApi}${this.state.userId}`,
                    method: 'DELETE',
                    json: {
                        [this.props.balanceType]: this.state.consume
                    }
                }
            });

            this.setState({
                balance: result[this.props.balanceType],
                error: false
            })
            await this.searchHistory()
            this.props.balanceUpdatedCallback(result[this.props.balanceType]);
        } catch (error) {
            this.setState({
                error: true,
                message: error.message || error.toString()
            })
        } finally {
            this.setState({loading: false})
        }
    }

    close() {
        this.props.onCloseCallback();
    }

    render() {
        const {charge, consume} = this.state;
        return (
            <Modal open={this.props.open} closeOnEscape={true}
                   closeOnRootNodeClick={true} onClose={this.close} closeIcon>
                <Header
                    content={`${displayNameMap[this.props.balanceType]}明细 —— 当前可用余额：${this.state.balance}`}/>
                <Modal.Content>
                    <Form error={this.state.error} loading={this.state.loading}>
                        <Message error header="出错了"
                                 content={this.state.message}/>
                        <Form.Group>
                            <Form.Input placeholder="课时数" name="charge"
                                        value={charge}
                                        onChange={this.handleChange}
                                        type="number"/>
                            <Form.Button
                                content="充值"
                                type="button"
                                onClick={this.charge}/>
                            <Form.Input
                                placeholder={`${displayNameMap[this.props.balanceType]}数`}
                                name="consume"
                                value={consume}
                                onChange={this.handleChange}
                                type="number"/>
                            <Form.Button content="消费" type="button"
                                         onClick={this.consume}/>
                        </Form.Group>
                    </Form>
                    <h3>{displayNameMap[this.props.balanceType]}变化历史</h3>
                    {
                        this.props.balanceType === 'class_hours' &&
                        <ClassHourHistory userId={this.state.userId}
                                          pagination={this.state.pagination}
                                          paginationChanged={this.paginationChanged}
                                          clearData={() => {
                                              this.setState({
                                                  pagination: {
                                                      ...this.state.pagination,
                                                      current_page: 1
                                                  }
                                              })
                                              store.dispatch(this.props.clearBalanceHistory(this.state.userId, this.state.pagination))
                                          }}
                        />
                    }
                    {
                        this.props.balanceType === 'integral' &&
                        <CreditsHistory userId={this.state.userId} pagination={this.state.pagination} paginationChanged={this.paginationChanged}
                                        clearData={() => {
                                            this.setState({
                                                pagination: {
                                                    ...this.state.pagination,
                                                    current_page: 1
                                                }
                                            })
                                            store.dispatch(this.props.clearBalanceHistory(this.state.userId, this.state.pagination))
                                        }}/>
                    }
                </Modal.Content>
            </Modal>
        );
    }
};
