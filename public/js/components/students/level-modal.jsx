import * as React from 'react';
import {Form, Header, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class LevelModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            level: '',
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

    componentWillReceiveProps(nextProps) {
        this.setState({
            level: nextProps.user ? (nextProps.user.level || '') : '',
            userId: nextProps.user ? nextProps.user.user_id : 0
        })
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
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={true} onClose={this.close}>
                <Header content="能力评级"></Header>
                <Modal.Content>
                    <p>当前评级：{this.state.level}</p>
                    <Form error={this.state.error} loading={this.state.loading}>
                        <Message error header="出错了" content={this.state.message}/>
                        <Form.Group>
                            <Form.Input placeholder="等级" name="level" value={level} onChange={this.handleChange}/>
                            <Form.Button content="保存" type="button" onClick={this.saveLevel}/>
                        </Form.Group>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
};