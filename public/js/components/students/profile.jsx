import * as React from 'react';
import {Form, Header, Image, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            mobile: '',
            user: {}
        };

        this.handleChange = this.handleChange.bind(this);
        this.close = this.close.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
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
            user: nextProps.user || {}
        }, () => {
            this.setState({
                email: this.state.user.email || '',
                mobile: this.state.user.mobile || ''
            });
        })
    }

    close() {
        this.props.onCloseCallback();
    }

    async updateProfile() {
        try {
            this.setState({loading: true});

            let updatedUser = Object.assign(this.state.user, {mobile: this.state.mobile, email: this.state.email});

            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/${this.state.user.user_id}`,
                    json: updatedUser,
                    method: 'PUT'
                }
            })

            console.log(result);

            this.props.profileUpdateCallback(result);
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result)});
        } finally {
            this.setState({loading: false});
        }
    }

    render() {
        return (
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={true} onClose={this.close}>
                <Header content="用户资料"></Header>
                <Modal.Content>
                    <Image src={this.state.user.avatar} avatar/>
                    <span>{this.state.user.display_name}</span>
                    <Form error={this.state.error} loading={this.state.loading} onSubmit={this.updateProfile}>
                        <Message error header="出错了" content={this.state.message}/>
                        <Form.Group>
                            <Form.Input placeholder="手机号" name="mobile" value={this.state.mobile}
                                        onChange={this.handleChange}
                                        type="number"/>
                            <Form.Input placeholder="邮箱" name="email" value={this.state.email}
                                        onChange={this.handleChange} type="email"/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Button content="修改" type="submit"/>
                        </Form.Group>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
};