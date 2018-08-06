import * as React from 'react';
import {Form, Header, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import ClassHourHistory from './class-hour-history'
import {loadClassHourHistory} from "../../redux/actions";
import store from "../../redux/store/index";

export default class ClassHours extends React.Component {
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
        this.setState({pagination: pagination}, async () => {
            await this.searchHistory();
        })
    }

    async componentWillReceiveProps(nextProps) {
        this.setState({
            classHours: nextProps.student ? (nextProps.student.class_hours || 0) : 0,
            userId: nextProps.student ? nextProps.student.user_id : 0
        }, async () => {
            await this.searchHistory();
        })
    }

    async searchHistory() {
        window.store = store;
        console.log(store.getState().classHourHistory);

        if (this.state.userId && !store.getState().classHourHistory[`${this.state.userId}-${this.state.pagination.current_page}`]) {
            let history = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/class-hours/history/${this.state.userId}`,
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
            store.dispatch(loadClassHourHistory(this.state.userId, history.data, this.state.pagination))
        }
    }

    componentDidMount() {
    }

    async charge() {
        try {
            this.setState({loading: true, error: false});
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/user-balance/${this.state.userId}`,
                    method: 'PUT',
                    json: {
                        class_hours: this.state.charge
                    }
                }
            });

            this.setState({
                classHours: result.class_hours
            })

            this.props.classHoursUpdateCallback(result.class_hours);
        } catch (error) {
            this.setState({
                error: true,
                message: JSON.stringify(error.result)
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
                    uri: `{buzzService}/api/v1/user-balance/${this.state.userId}`,
                    method: 'DELETE',
                    json: {
                        class_hours: this.state.consume
                    }
                }
            });

            this.setState({
                classHours: result.class_hours
            })
            this.props.classHoursUpdateCallback(result.class_hours);
        } catch (error) {
            this.setState({
                error: true,
                message: JSON.stringify(error.result)
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
                <Header content={`课时明细 —— 当前可用余额：${this.state.classHours}`}/>
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
                            <Form.Input placeholder="课时数" name="consume"
                                        value={consume}
                                        onChange={this.handleChange}
                                        type="number"/>
                            <Form.Button content="消费" type="button"
                                         onClick={this.consume}/>
                        </Form.Group>
                    </Form>
                    <h3>课时变化历史</h3>
                    <ClassHourHistory userId={this.state.userId}
                                      pagination={this.state.pagination}
                                      paginationChanged={this.paginationChanged}/>
                </Modal.Content>
            </Modal>
        );
    }
};
