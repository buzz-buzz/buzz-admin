import * as React from 'react';
import {Dropdown, Form, Header, Image, Message, Modal, Popup, TextArea} from "semantic-ui-react";
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

//option list ... language,age,english-exp
const languageList = [
    {key: 0, value: 'None', text: 'None'},
    {key: 1, value: 'Chinese', text: 'Chinese'},
    {key: 2, value: 'German', text: 'German'},
    {key: 3, value: 'French', text: 'French'},
    {key: 4, value: 'Russian', text: 'Russian'},
    {key: 5, value: 'Spanish', text: 'Spanish'},
    {key: 6, value: 'Japanese', text: 'Japanese'},
    {key: 7, value: 'Arabic', text: 'Arabic'},
    {key: 8, value: 'Korean', text: 'Korean'},
    {key: 9, value: 'Punjabi', text: 'Punjabi'}
];

const ChildAge = [
    {key: 0, value: '4岁以下', text: '4岁以下'},
    {key: 1, value: '4岁', text: '4岁'},
    {key: 2, value: '5岁', text: '5岁'},
    {key: 3, value: '6岁', text: '6岁'},
    {key: 4, value: '7岁', text: '7岁'},
    {key: 5, value: '8岁', text: '8岁'},
    {key: 6, value: '9岁', text: '9岁'},
    {key: 7, value: '10岁', text: '10岁'},
    {key: 8, value: '11岁', text: '11岁'},
    {key: 9, value: '12岁', text: '12岁'},
    {key: 10, value: '13岁', text: '13岁'},
    {key: 11, value: '14岁', text: '14岁'},
    {key: 12, value: '15岁', text: '15岁'},
    {key: 13, value: '16岁', text: '16岁'},
    {key: 14, value: '16岁以上', text: '16岁以上'}
];

const EnExp = [
    {key: 0, value: '没有', text: '没有'},
    {key: 1, value: '1年以下', text: '1年以下'},
    {key: 2, value: '1-2年', text: '1-2年'},
    {key: 3, value: '2-3年', text: '2-3年'},
    {key: 4, value: '3年以上', text: '3年以上'}
];

const levelOption = [
    { key: 0, value: '1', text: '1' },
    { key: 1, value: '2', text: '2' },
    { key: 2, value: '3', text: '3' },
    { key: 3, value: '4', text: '4' },
    { key: 4, value: '5', text: '5' },
    { key: 5, value: '6', text: '6' }
];

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
            follower: '',
            speak_chinese: '',
            second_foreign_language: '',
            video_introduction: '',
            referral: null,
            referrer: '',
            accent: '',
            level: '',
            color: '',
            campaign: '',
            child_age: '',
            en_exp: '',
            admin_code: '',
            admin_id: '',
            admin_name: '',
            channel_code: '',
            channel_id: '',
            channel_name: '',
            updateInfo: {}
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleLevelChange = this.handleLevelChange.bind(this);
        this.close = this.close.bind(this);
        this.updateProfile = this.updateProfile.bind(this);
        this.createUser = this.createUser.bind(this);
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.changeRole = this.changeRole.bind(this);
        this.classTagManage = this.classTagManage.bind(this);
    }

    handleChange(e, {name, value}) {
        let updateInfo = Object.assign({}, this.state.updateInfo);
        updateInfo[name] = value;

        this.setState({
            [name]: value,
            updateInfo: updateInfo
        })
    }

    async handleLevelChange(e, {name, value}){
        this.setState({
            level: value
        },async ()=>{
            try {
                await ServiceProxy.proxyTo({
                    body: {
                        uri: `{buzzService}/api/v1/user-placement-tests/${this.state.user.user_id}`,
                        method: 'PUT',
                        json: {
                            level: value
                        }
                    }
                });
            } catch (error) {
                this.setState({
                    error: true,
                    message: JSON.stringify(error.result)
                })
            }
        });
    }

    classTagManage(){
        window.open('/admin-neue/tagDetail/' + this.state.user.user_id);  
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
                follower: this.state.user.follower || '',
                speak_chinese: this.state.user.speak_chinese || '',
                second_foreign_language: this.state.user.second_foreign_language || '',
                video_introduction: this.state.user.video_introduction || '',
                referral: this.state.user.referral || null,
                referrer: this.state.user.referrer || '',
                color: this.state.user.color || '',
                accent: this.state.user.accent || '',
                campaign: this.state.user.campaign || '',
                child_age: this.state.user.child_age || '',
                en_exp: this.state.user.en_exp || '',
                level: this.state.user.level || '',     
                admin_code: this.state.user.admin_code || '',
                admin_id: this.state.user.admin_id || '',
                admin_name: this.state.user.admin_name || '',
                channel_code: this.state.user.channel_code || '',
                channel_id: this.state.user.channel_id || '',
                channel_name: this.state.user.channel_name || '',
            });
        })
    }

    close() {
        this.props.onCloseCallback();
    }

    async updateProfile(userId = this.state.user.user_id, updatedUser = this.state.updateInfo ) {
        try {
            this.setState({loading: true});
            let result = userId ? await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/${userId}`,
                    json: updatedUser,
                    method: 'PUT'
                }
            }) : {};

            this.props.profileUpdateCallback(result);
            this.setState({error: false, updateInfo: {}});

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

            await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/${this.state.user.user_id}`,
                    method: 'DELETE',
                },
                accept: '*/*'
            })

            this.setState({error: false});
            this.close();
            await this.props.onUserDeleted(userId);
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

        //new role = this.state.theOtherRole
        if(this.state.role){
            
        }

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
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={true} onClose={this.close}
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
                            {
                                this.state.user.role === MemberType.Companion && 
                                <Form.Input label="邮箱" placeholder="邮箱地址" value={this.state.email}
                                name="email" onChange={this.handleChange}/> 
                            }          
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
                                    let updateInfo = Object.assign({}, this.state.updateInfo);
                                    updateInfo.follower = follower;

                                    this.setState({
                                        follower: follower,
                                        updateInfo: updateInfo
                                    })
                                }}/>
                            </Form.Field>
                            <Form.Input placeholder="注册推荐人" name="referral" value={this.state.referral}
                                        onChange={this.handleChange} label="推荐人"/>
                        </Form.Group>
                        {
                            this.state.user.role === MemberType.Student &&
                            <Form.Group>
                                <Form.Field>
                                    <label>评级</label>
                                    <Dropdown selection multiple={false} name="level"
                                          options={levelOption}
                                          value={this.state.level} placeholder="能力评级" onChange={this.handleLevelChange}
                                          />
                                </Form.Field>
                                <Form.Input placeholder="活动来源" name="campaign" value={this.state.campaign} onChange={this.handleChange} label="活动来源"/>
                                <Form.Field>
                                    <label>孩子年龄</label>
                                    <Dropdown selection multiple={false} name="child_age"
                                          options={ChildAge}
                                          value={this.state.child_age} placeholder="孩子年龄" onChange={this.handleChange}
                                          />
                                </Form.Field>
                                <Form.Field>
                                    <label>英语学习经验</label>
                                    <Dropdown selection multiple={false} name="en_exp"
                                          options={EnExp}
                                          value={this.state.en_exp} placeholder="英语学习经验" onChange={this.handleChange}
                                          />
                                </Form.Field>
                        </Form.Group>
                        }
                        <Form.Group>
                            <Form.Input label="分销代码" placeholder="分销代码" value={this.state.admin_code}
                                        readOnly/>
                            <Form.Input label="分销id" placeholder="分销id" value={this.state.admin_id}
                                        readOnly/>
                            <Form.Input label="分销名称" placeholder="分销名称" value={this.state.admin_name}
                                        readOnly/>
                        </Form.Group>
                        <Form.Group>
                            <Form.Input label="渠道代码" placeholder="渠道代码" value={this.state.channel_code}
                                        readOnly/>
                            <Form.Input label="渠道id" placeholder="渠道id" value={this.state.channel_id}
                                        readOnly/>
                            <Form.Input label="渠道名称" placeholder="渠道名称" value={this.state.channel_name}
                                        readOnly/>
                        </Form.Group>
                        {
                            this.state.user.role === MemberType.Companion &&
                            <Form.Group  widths="equal">
                                <Form.Field>
                                    <label>是否会中文</label>
                                    <Dropdown selection multiple={false} name="speak_chinese"
                                          options={[{value: '', text: '', key: 0}, {value: 'No', text: 'No', key: 1},{value: 'Just a little', text: 'Just a little', key: 2},{value: 'Conversational', text: 'Conversational', key: 3},{value: 'Native language', text: 'Native language', key: 4}]}
                                          value={this.state.speak_chinese} placeholder="是否会中文" onChange={this.handleChange}
                                          />
                                </Form.Field>
                                <Form.Field>
                                    <label>第二语言</label>
                                    <Dropdown selection multiple={false} name="second_foreign_language"
                                          options={languageList}
                                          value={this.state.second_foreign_language} placeholder="第二语言" onChange={this.handleChange}
                                          />
                                </Form.Field>
                                <Form.Input placeholder="七牛云地址" name="video_introduction" value={this.state.video_introduction}
                                        onChange={this.handleChange} label="Tutor自我介绍视频地址"/>
                            </Form.Group>
                        }
                        {
                            this.state.user.role === MemberType.Companion &&
                            <Form.Group  widths="equal">
                                <Form.Field>
                                    <label>肤色(排课专用)</label>
                                    <Dropdown selection multiple={false} name="color"
                                          options={[{value: 'White', text: 'White', key: 0}, {value: 'Black', text: 'Black', key: 1},{value: 'Yellow', text: 'Yellow', key: 2},{value: 'Brown', text: 'Brown', key: 3}]}
                                          value={this.state.color} placeholder="肤色" onChange={this.handleChange}
                                          />
                                </Form.Field>
                                <Form.Field>
                                    <label>口音(排课专用)</label>
                                    <Dropdown selection multiple={false} name="accent"
                                          options={[{value: 'American', text: 'American', key: 0}, {value: 'British', text: 'British', key: 1},{value: 'A little', text: 'A little', key: 2},{value: 'Other', text: 'Other', key: 3}]}
                                          value={this.state.accent} placeholder="口音" onChange={this.handleChange}
                                          />
                                </Form.Field>
                                <Form.Input placeholder="tutor推荐人" name="referrer" value={this.state.referrer}
                                        onChange={this.handleChange} label="推荐人"/>
                            </Form.Group>
                        }
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
                            {
                                this.state.user.user_id &&
                                <Form.Button color="yellow"
                                             content={`排课标签管理`}
                                             type="button"
                                             onClick={this.classTagManage}/>
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
