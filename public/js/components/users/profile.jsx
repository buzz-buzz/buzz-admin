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
                            <Form.Input placeholder="微信昵称" name="wechat_name" value={this.state.user.wechat_name || ''}
                                        label="微信昵称" readOnly/>
                            <Form.Input placeholder="性别" name="gender"
                                        value={this.state.user.gender === 'm' ? '男' : (this.state.user.gender === 'f' ? '女' : '')}
                                        label="性别"
                                        readOnly/>
                            <Form.Input placeholder="手机号" name="mobile" value={this.state.mobile}
                                        onChange={this.handleChange}
                                        type="number" label="手机号"/>
                            <Form.Input placeholder="邮箱" name="email" value={this.state.email}
                                        onChange={this.handleChange} type="email" label="邮箱"/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input placeholder="生日" name="birthday" value={this.state.user.birthday || ''}
                                        label="生日"
                                        readOnly/>
                            <Form.Input placeholder="年级" name="grade" value={this.state.user.grade || ''} label="年级"
                                        readOnly/>
                            <Form.Input placeholder="所在城市" name="location" value={this.state.user.location || ''}
                                        label="所在城市" readOnly/>
                            <Form.Input placeholder="兴趣爱好" name="interests" value={this.state.user.interests || ''}
                                        label="兴趣爱好" readOnly/>
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