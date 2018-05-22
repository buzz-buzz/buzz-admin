import * as React from 'react';
import _ from 'lodash';
import {Dropdown, Form, Header, Image, Message, Modal, TextArea} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import * as Countries from "../../common/Countries";
import Cities from "../../common/Cities";
import Genders from "../../common/Genders";
import Grades from "../../common/Grades";
import Timezones from "../../common/Timezones";
import TimeHelper from "../../common/TimeHelper";
import {MemberType, MemberTypeChinese} from "../../common/MemberType";

export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            mobile: '',
            parentName: '',
            name: '',
            country: '',
            city: '',
            remark: '',
            avatar: '',
            gender: '',
            grade: '',
            date_of_birth: '',
            school_name: '',
            time_zone: '',
            user: {},
            display_name: '',
            weekly_schedule_requirements: 1
        };

        this.handleChange = this.handleChange.bind(this);
        this.close = this.close.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.createUser = this.createUser.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.changeRole = this.changeRole.bind(this);
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
                city: this.state.user.city || '',
                remark: this.state.user.remark || '',
                avatar: this.state.user.avatar || '',
                gender: this.state.user.gender || '',
                grade: this.state.user.grade || '',
                school_name: this.state.user.school_name || '',
                time_zone: this.state.user.time_zone || '',
                date_of_birth: this.state.user.date_of_birth && TimeHelper.toLocalDateTime(new Date(this.state.user.date_of_birth)),
                display_name: this.state.user.display_name || '',
                theOtherRole: Profile.theOtherRole(this.state.user.role),
                weekly_schedule_requirements: this.state.user.weekly_schedule_requirements || 1
            });
        })
    }

    close() {
        this.props.onCloseCallback();
    }

    async updateProfile(userId = this.state.user.user_id, updatedUser = {
        mobile: this.state.mobile,
        email: this.state.email,
        parent_name: this.state.parentName,
        name: this.state.name,
        country: this.state.country,
        city: this.state.city,
        gender: this.state.gender,
        remark: this.state.remark,
        avatar: this.state.avatar,
        grade: this.state.grade,
        school_name: this.state.school_name,
        time_zone: this.state.time_zone,
        date_of_birth: this.state.date_of_birth && new Date(this.state.date_of_birth),
        display_name: this.state.display_name,
        weekly_schedule_requirements: this.state.weekly_schedule_requirements
    }) {
        try {
            this.setState({loading: true});

            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/${userId}`,
                    json: updatedUser,
                    method: 'PUT'
                }
            })

            this.props.profileUpdateCallback(result);
            this.setState({error: false});

            return true
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result)});

            return false
        } finally {
            this.setState({loading: false});
        }
    }

    async deleteUser() {
        let userId = window.prompt('这个操作不可恢复，一旦删除，与该用户相关的所有资料都将被永久删除。如果你确定要删除，请输入该用户的唯一 ID 号：')

        if (String(userId) !== String(this.state.user.user_id)) {
            window.alert('删除操作已取消')
            return
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
            await this.props.onUserDeleted(userId);

            this.close();
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result || error)})
        } finally {
            this.setState({loading: false});
        }
    }

    async changeRole() {
        let newRole = this.state.theOtherRole
        let confirmed = window.confirm(`确认要将该用户（${this.state.display_name || this.state.name}）从 ${MemberTypeChinese[this.state.user.role]} 切换成 ${MemberTypeChinese[newRole]} 吗？`
        )

        if (!confirmed) {
            window.alert('切换角色操作已取消')
            return
        }

        let success = await this.updateProfile(this.state.user.user_id, {
            role: newRole
        })

        if (success) {
            window.location.href = `${{
                [MemberType.Student]: '/students',
                [MemberType.Companion]: '/companions'
            }[newRole]}/${this.state.user.user_id}`
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
                    uri:
                        `{buzzService}/api/v1/users/`
                    ,
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
                    <Image src={this.state.avatar} avatar alt={this.state.user.user_id}
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
                        <Form.Group>
                            <Form.Input placeholder="备注名称(eg: 小明宝妈)" name="display_name" value={this.state.display_name}
                                        onChange={this.handleChange} label="备注名（内部使用，对用户不可见）"/>
                            <Form.Input placeholder="周上课频率" name="weekly_schedule_requirements"
                                        value={this.state.weekly_schedule_requirements} onChange={this.handleChange}
                                        label="周上课频率" type="number"/>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>国籍</label>
                                <Dropdown selection multiple={false} search={true} name="country"
                                          options={Countries.list}
                                          value={this.state.country} placeholder="国籍" onChange={this.handleChange}
                                          onSearchChange={this.handleSearchChange}/>
                            </Form.Field>
                            {
                                this.state.user.role === 's' ? (
                                    <Form.Field>
                                        <label>所在城市</label>
                                        <Dropdown selection multiple={false} search={true} name="city"
                                                  options={Cities.list}
                                                  value={this.state.city} placeholder="所在城市"
                                                  onChange={this.handleChange}
                                                  onSearchChange={this.handleSearchChange}/>
                                    </Form.Field>

                                ) : (
                                    <Form.Input placeholder="所在城市" name="city" value={this.state.city} label="所在城市"
                                                onChange={this.handleChange}/>
                                )
                            }
                            {
                                this.state.user.role !== 's' && (
                                    <Form.Field>
                                        <label>时区</label>
                                        <Dropdown selection multiple={false} search={true} name="time_zone"
                                                  options={Timezones.list}
                                                  value={this.state.time_zone} placeholder="时区"
                                                  onChange={this.handleChange}
                                                  onSearchChange={this.handleSearchChange}/>
                                    </Form.Field>

                                )
                            }
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>性别</label>
                                <Dropdown selection multiple={false} search={true} name="gender"
                                          options={Genders.list}
                                          value={this.state.gender} placeholder="性别" onChange={this.handleChange}
                                          onSearchChange={this.handleSearchChange}/>
                            </Form.Field>
                            <Form.Input label="生日" placeholder="生日" value={this.state.date_of_birth}
                                        type="datetime-local" name="date_of_birth" onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Input label="学校名称" placeholder="学校名称" value={this.state.school_name}
                                        name="school_name" onChange={this.handleChange}/>
                            <Form.Field>
                                <label>年级</label>
                                <Dropdown selection multiple={false} search={true} name="grade"
                                          options={Grades.list}
                                          value={this.state.grade} placeholder="年级" onChange={this.handleChange}
                                          onSearchChange={this.handleSearchChange}/>
                            </Form.Field>
                            <Form.Input placeholder="兴趣爱好" name="interests" value={this.state.user.interests || ''}
                                        label="兴趣爱好" readOnly width={12}/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input placeholder="微信昵称" name="wechat_name" value={this.state.user.wechat_name || ''}
                                        label="微信昵称" readOnly width={3}/>

                            <Form.Input placeholder="Facebook 名称" name="facebookName"
                                        value={this.state.user.facebook_name || ''} label="Facebook 名称" width={3}/>
                            <Form.Input placeholder="头像" name="avatar" value={this.state.avatar} label="头像 URL"
                                        onChange={this.handleChange} width={10}/>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>备注</label>
                                <TextArea autoHeight placeholder="备注" rows={3} value={this.state.remark} name="remark"
                                          onChange={this.handleChange}/>
                            </Form.Field>
                        </Form.Group>
                        <Form.Group>
                            {
                                this.state.user.user_id ?
                                    <Form.Button primary content="修改" type="submit"/> :
                                    <Form.Button positive content="创建" type="button" onClick={this.createUser}/>
                            }
                            <Form.Button negative content="删除" type="button" onClick={this.deleteUser}/>
                            <Form.Button color="black"
                                         content={`切换成 ${MemberTypeChinese[this.state.theOtherRole]}`}
                                         type="button"
                                         onClick={this.changeRole}/>
                        </Form.Group>
                    </Form>
                </Modal.Content>
            </Modal>
        );
    }

    static theOtherRole(role) {
        if (role === MemberType.Student) {
            return MemberType.Companion
        }

        if (role === MemberType.Companion) {
            return MemberType.Student
        }
    }
}
