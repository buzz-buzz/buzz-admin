import * as React from 'react';
import {Dropdown, Form, Header, Image, Message, Modal} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import * as Countries from "../../common/Countries";

export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            mobile: '',
            parentName: '',
            name: '',
            country: '',
            user: {}
        };

        this.handleChange = this.handleChange.bind(this);
        this.close = this.close.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.createUser = this.createUser.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
    }

    handleChange(e, {name, value}) {
        this.setState({
            [name]: value
        })
    }

    handleSearchChange(e, {search}) {
        this.setState({
            search: search
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
                parentName: this.state.user.parent_name || '',
                name: this.state.user ? this.state.user.name || this.state.user.display_name || '' : '',
                country: this.state.user.country || '',
            });
        })
    }

    close() {
        this.props.onCloseCallback();
    }

    async updateProfile(userId = this.state.user.user_id) {
        try {
            this.setState({loading: true});

            let updatedUser = {
                mobile: this.state.mobile,
                email: this.state.email,
                parent_name: this.state.parentName,
                name: this.state.name,
                display_name: this.state.name,
                country: this.state.country
            };

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

    async deleteUser() {
        let userId = window.prompt('这个操作不可恢复，一旦删除，与该用户相关的所有资料都将被永久删除。如果你确定要删除，请输入该用户的唯一 ID 号：')

        if (String(userId) !== String(this.state.user.user_id)) {
            window.alert('删除操作已取消')
            return;
        }

        try {
            this.setState({loading: true});

            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/${this.state.user.user_id}`,
                    method: 'DELETE',
                },
                accept: '*/*'
            })

            this.setState({error: false});
            this.props.onUserDeleted(userId);

            this.close();
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result || error)})
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
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={false} onClose={this.close}
                   closeIcon>
                <Header content="用户资料"></Header>
                <Modal.Content>
                    <Image src={this.state.user.avatar} avatar alt={this.state.user.user_id}
                           title={this.state.user.user_id}/>
                    <span>{this.state.user.display_name}</span>
                    <Form error={this.state.error} loading={this.state.loading} onSubmit={() => this.updateProfile()}>
                        <Message error header="出错了" content={this.state.message}/>
                        <Form.Group>
                            <Form.Input placeholder="英文名" name="name" value={this.state.name}
                                        onChange={this.handleChange} label="（孩子）英文名"/>
                            <Form.Input placeholder="父母名称" name="parentName" value={this.state.parentName}
                                        onChange={this.handleChange}
                                        label="父母名称"/>
                            <Form.Input placeholder="手机号" name="mobile" value={this.state.mobile}
                                        onChange={this.handleChange}
                                        type="number" label="手机号"/>
                            <Form.Input placeholder="邮箱" name="email" value={this.state.email}
                                        onChange={this.handleChange} type="email" label="邮箱"/>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>国籍</label>
                                <Dropdown selection multiple={false} search={true} name="country"
                                          options={Countries.list}
                                          value={this.state.country} placeholder="国籍" onChange={this.handleChange}
                                          onSearchChange={this.handleSearchChange}/>
                            </Form.Field>
                            <Form.Input placeholder="所在城市" name="city" value={this.state.user.city || ''}
                                        label="所在城市" readOnly/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input placeholder="性别" name="gender"
                                        value={this.state.user.gender === 'm' ? '男' : (this.state.user.gender === 'f' ? '女' : '')}
                                        label="性别"
                                        readOnly/>
                            <Form.Input placeholder="生日" name="birthday"
                                        value={new Date(this.state.user.date_of_birth).toLocaleDateString() || ''}
                                        label="生日"
                                        readOnly/>
                            <Form.Input placeholder="年级" name="grade" value={this.state.user.grade || ''} label="年级"
                                        readOnly/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input placeholder="兴趣爱好" name="interests" value={this.state.user.interests || ''}
                                        label="兴趣爱好" readOnly/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input placeholder="微信昵称" name="wechat_name" value={this.state.user.wechat_name || ''}
                                        label="微信昵称" readOnly/>

                            <Form.Input placeholder="Facebook 名称" name="facebookName"
                                        value={this.state.user.facebook_name || ''} label="Facebook 名称"/>
                        </Form.Group>
                        <Form.Group>
                            {
                                this.state.user.user_id ?
                                    <Form.Button content="修改" type="submit"/> :
                                    <Form.Button content="创建" type="button" onClick={this.createUser}/>
                            }
                            <Form.Button content="删除" type="button" onClick={this.deleteUser}/>
                        </Form.Group>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }
};