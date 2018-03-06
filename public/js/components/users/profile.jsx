import * as React from 'react';
import {Form, Header, Image, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            mobile: '',
            parentName: '',
            user: {}
        };

        this.handleChange = this.handleChange.bind(this);
        this.close = this.close.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.createUser = this.createUser.bind(this);
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
                mobile: this.state.user.mobile || '',
                parentName: this.state.user.parent_name || ''
            });
        })
    }

    close() {
        this.props.onCloseCallback();
    }

    async updateProfile(userId = this.state.user.user_id) {
        try {
            this.setState({loading: true});

            let updatedUser = Object.assign({
                mobile: this.state.mobile,
                email: this.state.email,
                parent_name: this.state.parentName
            });

            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/${userId}`,
                    json: updatedUser,
                    method: 'PUT'
                }
            })

            this.props.profileUpdateCallback(result);
            this.setState({error: false});
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result)});
        } finally {
            this.setState({loading: false});
        }
    }

    async createUser() {
        try {
            this.setState({loading: true});

            let newUser = {
                name: '',
                role: 'c',
            }

            let userId = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/`,
                    json: newUser,
                    method: 'POST'
                }
            })

            await this.updateProfile(userId);

            this.props.userCreatedCallback(userId);
            this.setState({error: false});
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result)});
        } finally {
            this.setState({loading: false});
        }
    }

    render() {
        return (
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={false} onClose={this.close}>
                <Header content="用户资料"></Header>
                <Modal.Content>
                    <Image src={this.state.user.avatar} avatar/>
                    <span>{this.state.user.display_name}</span>
                    <Form error={this.state.error} loading={this.state.loading} onSubmit={this.updateProfile}>
                        <Message error header="出错了" content={this.state.message}/>
                        <Form.Group>
                            <Form.Input placeholder="微信昵称" name="wechat_name" value={this.state.user.wechat_name || ''}
                                        label="微信昵称" readOnly/>

                            <Form.Input placeholder="父母名称" name="parentName" value={this.state.parentName}
                                        onChange={this.handleChange}
                                        label="父母名称"/>
                            <Form.Input placeholder="手机号" name="mobile" value={this.state.mobile}
                                        onChange={this.handleChange}
                                        type="number" label="手机号"/>
                            <Form.Input placeholder="邮箱" name="email" value={this.state.email}
                                        onChange={this.handleChange} type="email" label="邮箱"/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input placeholder="性别" name="gender"
                                        value={this.state.user.gender === 'm' ? '男' : (this.state.user.gender === 'f' ? '女' : '')}
                                        label="性别"
                                        readOnly/>
                            <Form.Input placeholder="生日" name="birthday" value={this.state.user.birthday || ''}
                                        label="生日"
                                        readOnly/>
                            <Form.Input placeholder="年级" name="grade" value={this.state.user.grade || ''} label="年级"
                                        readOnly/>
                            <Form.Input placeholder="所在城市" name="location" value={this.state.user.location || ''}
                                        label="所在城市" readOnly/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input placeholder="兴趣爱好" name="interests" value={this.state.user.interests || ''}
                                        label="兴趣爱好" readOnly/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input placeholder="Facebook 名称" name="facebookName"
                                        value={this.state.user.facebook_name || ''} label="Facebook 名称"/>
                        </Form.Group>
                        <Form.Group>
                            {
                                this.state.user.user_id ?
                                    <Form.Button content="修改" type="submit"/> :
                                    <Form.Button content="创建" type="button" onClick={this.createUser}/>
                            }
                            <Form.Button content="取消" type="button" onClick={this.close}/>
                        </Form.Group>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
};