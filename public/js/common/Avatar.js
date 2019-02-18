import React from "react";
import {Image, Label, Popup} from "semantic-ui-react";
import CachableProxy from "../CachableProxy";

export class Avatar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            profile: {}
        }
    }

    async componentWillMount() {
        if(this.props.profile && this.props.profile.name){
            this.setState({
                pofile: this.props.profile,
                avatar: this.props.avatar
            });
        }else if(this.props.userId) {
            this.setState({userId: this.props.userId})
            await this.loadProfile()
        }
    }

    async componentWillReceiveProps(nextProps) {
        if (nextProps.profile) {
            return this.setState({profile: nextProps.profile})
        }

        if (nextProps.userId && nextProps.userId !== this.state.userId) {
            await this.loadProfile();
        }
    }

    async loadProfile() {
        this.setState({
            profile: this.props.userId ? await CachableProxy.get({
                body: {
                    uri: `{buzzService}/api/v1/users/${this.props.userId}`
                }
            }) : {}
        })
    }

    componentWillUnmount() {
        CachableProxy.cancelAll()
    }

    render() {
        const props = this.props

        return props.userId ? <a href={props.link === true ? `/users/${props.userId}` : 'javascript:void(0)'} target="_blank">
                <Popup trigger={
                    this.state.profile.avatar ? <Image avatar alt={props.userId} title={props.userId}
                    src={this.state.profile.avatar}
                    />  : <object data={`/avatar/${props.userId}`} type="image/png"
                            className="ui image avatar" title={props.userId} alt={props.userId}>
                        <Image avatar alt={props.userId} title={props.userId}
                               src={`/images/empty_avatar.jpg`}
                        />
                    </object>
                } content={props.userId} >
                    {this.displayUserName()}
                </Popup>
                {
                    props.avatarOnly !== true &&
                    this.displayUserName()
                }
                {this.props.children}
            </a> :
            null
    }

    displayUserName() {
        return <span>{[this.state.profile.name, this.state.profile.wechat_name, this.state.profile.display_name].filter(item => !!item).join(' | ')}</span>;
    }
}
