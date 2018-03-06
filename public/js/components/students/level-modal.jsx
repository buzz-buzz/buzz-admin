import * as React from 'react';
import {Form, Header, Message, Modal, TextArea} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class LevelModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            level: '',
            levelDetail: '正在加载中……'
        }

        this.handleChange = this.handleChange.bind(this);
        this.close = this.close.bind(this);
        this.saveLevel = this.saveLevel.bind(this);
    }

    handleChange(e, {name, value}) {
        this.setState({
            [name]: value
        })
    }

    componentDidMount() {

    }

    async componentWillReceiveProps(nextProps) {
        this.setState({
            level: nextProps.user ? (nextProps.user.level || '') : '',
            userId: nextProps.user ? nextProps.user.user_id : 0
        })

        if (nextProps.user && nextProps.user.user_id && !this.state.detail) {
            this.setState({loading: true});

            try {
                let result = await ServiceProxy.proxyTo({
                    body: {
                        uri: `{buzzService}/api/v1/user-placement-tests/${nextProps.user.user_id}`,
                        method: 'GET'
                    }
                })

                console.log('result = ', result);
                this.setState({levelDetail: result.detail});
            } catch (error) {

            } finally {
                this.setState({loading: false})
            }
        }
    }

    async saveLevel() {
        try {
            this.setState({loading: true, error: false});
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/user-placement-tests/${this.state.userId}`,
                    method: 'PUT',
                    json: {
                        level: this.state.level
                    }
                }
            });

            console.log('result = ', result);
            this.setState({
                level: result.level
            })

            this.props.onLevelUpdated(result);
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
        const {level} = this.state;
        return (
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={false} onClose={this.close}>
                <Header content="能力评级"></Header>
                <Modal.Content>
                    <p>当前评级：{this.state.level}</p>
                    <Form error={this.state.error} loading={this.state.loading}>
                        <Message error header="出错了" content={this.state.message}/>
                        <Form.Group>
                            <TextArea autoHeight rows={3} value={this.state.levelDetail}></TextArea>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input placeholder="等级" name="level" value={level} onChange={this.handleChange}/>
                            <Form.Button content="保存" type="button" onClick={this.saveLevel}/>
                            <Form.Button className="right floated" content="取消" type="button" onClick={this.close}/>
                        </Form.Group>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
};