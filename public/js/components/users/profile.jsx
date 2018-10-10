import * as React from 'react';
import {Button, Dropdown, Form, Header, Image, Message, Modal, Popup, TextArea} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import * as Countries from "../../common/Countries";
import Cities from "../../common/Cities";
import Genders from "../../common/Genders";
import Grades from "../../common/Grades";
import Timezones from "../../common/Timezones";
import TimeHelper from "../../common/TimeHelper";
import {MemberType, MemberTypeChinese} from "../../common/MemberType";
import WechatProfile from "./wechat-profile";
import UserTags from "./user-tags";
import {ClassStatusCode} from "../../common/ClassStatus";
import {StudentLifeCyclesMapping} from "../../common/LifeCycles";
import moment from "moment/moment";
import ClassHourDisplay from "../common/ClassHourDisplay";
import UserDropdownSingle from "./UserDropdownSingle";
import UserFollowup from "./user-follow-up";

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
            order_remark: '',
            rookie_room_url: '',
            avatar: '',
            gender: '',
            grade: '',
            date_of_birth: '',
            school_name: '',
            time_zone: '',
            user: {},
            display_name: '',
            weekly_schedule_requirements: 1,
            password: '',
            source: '',
            follower: 0
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
                name: this.state.user ? this.state.user.name || '' : '',
                country: this.state.user.country || '',
                city: this.state.user.city || '',
                remark: this.state.user.remark || '',
                order_remark: this.state.user.order_remark || '',
                rookie_room_url: this.state.user.rookie_room_url || '',
                avatar: this.state.user.avatar || '',
                gender: this.state.user.gender || '',
                grade: this.state.user.grade || '',
                school_name: this.state.user.school_name || '',
                time_zone: this.state.user.time_zone || '',
                date_of_birth: this.state.user.date_of_birth && TimeHelper.toLocalDateTime(new Date(this.state.user.date_of_birth)),
                display_name: this.state.user.display_name || '',
                theOtherRole: Profile.theOtherRole(this.state.user.role),
                weekly_schedule_requirements: this.state.user.weekly_schedule_requirements,
                password: this.state.user.password || '',
                source: this.state.user.source || '',
                follower: this.state.user.follower || 0,
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
        order_remark: this.state.order_remark,
        rookie_room_url: this.state.rookie_room_url,
        avatar: this.state.avatar,
        grade: this.state.grade,
        school_name: this.state.school_name,
        time_zone: this.state.time_zone,
        date_of_birth: this.state.date_of_birth && new Date(this.state.date_of_birth),
        display_name: this.state.display_name,
        weekly_schedule_requirements: this.state.weekly_schedule_requirements,
        password: this.state.password,
        source: this.state.source,
        follower: this.state.follower,

        wechat_openid: this.state.user.wechat_openid,
        wechat_unionid: this.state.user.wechat_unionid,
        wechat_data: this.state.user.wechat_data,
        wechat_name: this.state.user.wechat_name
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
        let confirmed = window.confirm(`确认要将该用户（${this.state.name || this.state.display_name}）从 ${MemberTypeChinese[this.state.user.role]} 切换成 ${MemberTypeChinese[newRole]} 吗？`
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
                role: MemberType.Companion,
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
                <Header content={
                    <div>
                        用户信息 - {this.state.user.user_id}
                        &emsp;
                        {StudentLifeCyclesMapping[this.state.user.state]}：
                        {this.state.user.state_timestamp ? moment(this.state.user.state_timestamp).format('LLLL') : null}
                        &emsp;<a style={{float: 'right'}}
                                 href={`/classes?userIds=${this.state.user.user_id}&statuses=${ClassStatusCode.Opened}&statuses=${ClassStatusCode.Cancelled}&statuses=${ClassStatusCode.Ended}`}
                                 target="_blank">查看课程历史</a>
                    </div>
                }/>
                <Modal.Content>
                    <object data={this.state.avatar} type="image/png" className="ui image avatar"
                            title={this.state.user.user_id} alt={this.state.user.user_id}>

                        <Image src="/images/empty_avatar.jpg" avatar title={this.state.user.user_id}
                               alt={this.state.user.user_id}/>
                    </object>
                    <span>{this.state.user.display_name}</span>
                    <UserTags userId={this.state.user.user_id}/>
                    <Form error={this.state.error} loading={this.state.loading} onSubmit={() => this.updateProfile()}>
                        <Message error header="出错了" content={this.state.message}/>
                        <Form.Group>
                            <Form.Input placeholder="英文名" name="name" value={this.state.name}
                                        onChange={this.handleChange} label="（孩子）英文名"/>
                            <Form.Input placeholder="父母名称" name="parentName" value={this.state.parentName}
                                        onChange={this.handleChange}
                                        label="父母名称"/>

                            <Form.Input placeholder="备注名称(eg: 小明宝妈)" name="display_name" value={this.state.display_name}
                                        onChange={this.handleChange} label="备注名（内部使用，对用户不可见）"/>
                            <Form.Input placeholder="渠道来源" name="source" value={this.state.source} onChange={this.handleChange} label="渠道来源"/>
                        </Form.Group>

                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>性别</label>
                                <Dropdown selection multiple={false} search={true} name="gender"
                                          options={Genders.list}
                                          value={this.state.gender} placeholder="性别" onChange={this.handleChange}
                                          onSearchChange={this.handleSearchChange}/>
                            </Form.Field>

                            <Form.Field>
                                <label>在读年级</label>
                                <Dropdown selection multiple={false} search={true} name="grade"
                                          options={Grades.list}
                                          value={this.state.grade} placeholder="年级" onChange={this.handleChange}
                                          onSearchChange={this.handleSearchChange}/>
                            </Form.Field>
                            <Form.Input label="生日" placeholder="生日" value={this.state.date_of_birth}
                                        type="datetime-local" name="date_of_birth" onChange={this.handleChange}/>

                            <Form.Input placeholder="兴趣爱好" name="interests" value={this.state.user.interests || ''}
                                        label="兴趣爱好" readOnly width={12}/>
                        </Form.Group>

                        <Form.Group>
                            <Popup trigger={
                                <Form.Input placeholder="微信昵称" name="wechat_name"
                                            value={this.state.user.wechat_name || ''}
                                            label="微信昵称" readOnly width={3}/>
                            } on="focus" header="微信详细资料" content={
                                <WechatProfile userId={this.state.user.user_id} user={this.state.user}
                                               profileUpdateCallback={this.props.profileUpdateCallback}
                                               wechatProfileUpdated={this.wechatProfileUpdated}/>
                            }/>

                            <Form.Input placeholder="Facebook 名称" name="facebookName"
                                        value={this.state.user.facebook_name || ''} label="Facebook 名称" width={3}/>


                            <Form.Input placeholder="手机号" name="mobile" value={this.state.mobile}
                                        onChange={this.handleChange}
                                        type="number" label="手机号"/>

                            <Form.Input label="登录密码" placeholder="用户密码,不小于6位" value={this.state.password}
                                        name="password" onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <Form.Field>
                                <label>国籍：{this.state.country}</label>
                                <Dropdown selection multiple={false} search={true} name="country"
                                          options={Countries.list}
                                          value={this.state.country.toLowerCase()} placeholder="国籍" onChange={this.handleChange}
                                          onSearchChange={this.handleSearchChange}/>
                            </Form.Field>
                            {
                                this.state.user.role === MemberType.Student ? (
                                    <Form.Field>
                                        <label>所在城市: {this.state.city}</label>
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
                                this.state.user.role !== MemberType.Student && (
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

                            <Form.Input label="学校名称" placeholder="学校名称" value={this.state.school_name}
                                        name="school_name" onChange={this.handleChange}/>
                        </Form.Group>

                        <Form.Group>
                            <Form.Input placeholder="周上课频率" name="weekly_schedule_requirements"
                                        value={this.state.weekly_schedule_requirements} onChange={this.handleChange}
                                        label="周上课频率" type="number"/>
                            <Form.Field>
                                <label>余额（消费）<br/>可用（冻结）</label>
                                <ClassHourDisplay user={this.props.user}/>
                            </Form.Field>
                            <Form.Input placeholder="当前积分（累计积分）" label="当前积分（累计积分）" value={`${(this.props.user || {}).integral || 0}（待开发）`}/>
                            <Form.Field>
                                <label>销售跟进人</label>
                                <UserDropdownSingle selectedUserId={this.state.follower} changeFollowerTo={async (follower) => {
                                    this.setState({
                                        follower
                                    })
                                }}/>
                            </Form.Field>
                        </Form.Group>
                        <Form.Group  widths="equal">
                            <Form.Field control={TextArea} label='备注' placeholder='order_remark' value={this.state.order_remark} name='order_remark'
                                onChange={this.handleChange}/>
                        </Form.Group>
                        <Form.Group  widths="equal">
                            <Form.Input placeholder="eg: https://zoom.us/j/2019579072" name="rookie_room_url" value={this.state.rookie_room_url}
                                        onChange={this.handleChange} label="入门指导课教室链接"/>
                        </Form.Group>
                        <Form.Group widths="equal">
                            <UserFollowup userId={this.state.user.user_id}/>
                        </Form.Group>
                        <Form.Group>
                            {
                                this.state.user.user_id ?
                                    <Form.Button primary content="修改" type="submit"/> :
                                    <Form.Button positive content="创建" type="button" onClick={this.createUser}/>
                            }
                            {
                                (this.state.user.user_id && (!process.env.NODE_ENV || process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'qa' || window.location.host.startsWith('admin-test'))) &&
                                <Form.Button negative content="删除" type="button" onClick={this.deleteUser}/>
                            }
                            {
                                this.state.user.user_id &&
                                <Form.Button color="black"
                                             content={`切换成 ${MemberTypeChinese[this.state.theOtherRole]}`}
                                             type="button"
                                             onClick={this.changeRole}/>
                            }
                        </Form.Group>
                    </Form>
                </Modal.Content>
                <Modal.Actions>
                    注册时间：{moment(this.state.user.created_at).format('LLLL')}
                </Modal.Actions>
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

    wechatProfileUpdated = (wechatProfile) => {
        this.setState({user: wechatProfile})
    }
}
