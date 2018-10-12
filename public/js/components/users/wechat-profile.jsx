import React from "react";
import ServiceProxy from "../../service-proxy";
import {Button, Container, Form, Icon, Input, Message, TextArea} from "semantic-ui-react";

export default class WechatProfile extends React.Component {
    formStatus = {success: null, message: ''}

    constructor(props) {
        super()

        this.state = {
            facebook_data: '',
            facebook_id: '',
            wechat_data: '',
            wechat_name: '',
            wechat_openid: '',
            wechat_unionid: ''
        }
    }

    async componentWillMount() {
        const {user} = this.props
        if (user.wechat_data) {
            this.setState({
                wechat_data: user.wechat_data,
                wechat_name: user.wechat_name,
                wechat_openid: user.wechat_openid,
                wechat_unionid: user.wechat_unionid
            })
            return;
        }

        if (!this.props.userId) {
            return;
        }

        let res = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v1/users/social-account-profile/${this.props.userId}`
            }
        })

        this.setState({
            facebook_data: res.facebook_data || '',
            facebook_id: res.facebook_id || '',
            wechat_data: res.wechat_data || '',
            wechat_name: res.wechat_name || '',
            wechat_openid: res.wechat_openid || '',
            wechat_unionid: res.wechat_unionid || ''
        })
    }

    handleChange = (e, {name, value}) => {
        this.setState({[name]: value}, () => {
            this.props.wechatProfileUpdated(this.state)
        })
    }

    saveSocialAccountProfile = async () => {
        try {
            let updations = {
                wechat_data: this.state.wechat_data,
                wechat_name: this.state.wechat_name,
                wechat_openid: this.state.wechat_openid,
                wechat_unionid: this.state.wechat_unionid
            }

            if (this.props.user.avatar && (this.props.user.avatar.startsWith(`//thirdwx`) || this.props.user.avatar.startsWith(`http://thirdwx`) || this.props.user.avatar.startsWith(`https://thirdwx`)) && this.wechatData.headimgurl && this.props.user.avatar !== this.wechatData.headimgurl) {
                updations.avatar = this.wechatData.headimgurl.replace('http://', '//')
            }

            let p = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/${this.props.userId}`,
                    method: 'PUT',
                    json: updations
                }
            })

            this.formStatus.success = true
            this.formStatus.message = '保存成功！'

            this.props.profileUpdateCallback(p)
        } catch (ex) {
            this.formStatus.success = false;
            this.formStatus.message = ex.result || ex.message || ex.toString()
        } finally {
            this.forceUpdate()
        }
    }

    syncWithWechat = async () => {
        try {
            let res = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/wechat/batch-get-users`,
                    qs: {
                        openids: this.state.wechat_openid
                    }
                }
            })

            this.wechatData = res

            this.setState({
                wechat_openid: res.openid,
                wechat_unionid: res.unionid,
                wechat_name: res.nickname,
                wechat_data: JSON.stringify(res)
            })

            this.formStatus.success = true
            this.formStatus.message = "同步微信信息成功"
        } catch (error) {
            this.formStatus.success = false
            this.formStatus.message = error.result || error.message || error.toString()

            if (error.result && error.result.startsWith('invalid openid hint')) {
                this.formStatus.message += ` 该用户最初是通过扫码登录 BuzzBuzz 系统，所以其 openid 与公众号下的 openid 不同，无法主动获取用户微信基本信息，只能在下次用户自行授权时获得。`
            }
        } finally {
            this.forceUpdate()
        }
    }

    render() {
        const props = this.props;
        const readOnly = props.userId !== undefined
        return (
            <div>
                <Form onSubmit={this.saveSocialAccountProfile} success={this.formStatus.success === true}
                      error={this.formStatus.success === false}>
                    <Message success={this.formStatus.success} error={!this.formStatus.success} header={this.formStatus.success ? "操作完成" : '操作失败'}
                             content={this.formStatus.message}/>
                    <Form.Group>
                        <Form.Field control={Input} label='微信昵称' placeholder='微信昵称' value={this.state.wechat_name} name='wechat_name'
                                    onChange={this.handleChange}
                                    readOnly={readOnly}/>
                        <Form.Field control={Input} label='openid' placeholder='openid' value={this.state.wechat_openid}
                                    readOnly={readOnly} name='wechat_openid' onChange={this.handleChange}/>
                        <Form.Field control={Input} label='unionid' placeholder='unionid'
                                    value={this.state.wechat_unionid} readOnly={readOnly} name='wechat_unionid' onChange={this.handleChange}/>
                    </Form.Group>
                    <Form.Field control={TextArea} label='其他' placeholder='其他' value={this.state.wechat_data} name='wechat_data'
                                readOnly={readOnly} onChange={this.handleChange}/>

                    <Button.Group icon>
                        <Button onClick={this.syncWithWechat} type="button">
                            <Icon name="shuffle"/>
                        </Button>
                        <Button type="submit">保存</Button>
                    </Button.Group>
                </Form>
            </div>
        )
    }
}
