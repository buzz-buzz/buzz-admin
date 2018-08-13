import React from "react";
import {Image, Label} from "semantic-ui-react";
import CachableProxy from "../CachableProxy";

export class Avatar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            profile: {}
        }
    }

    async componentWillMount() {
        if (this.props.userId) {
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
            profile: await CachableProxy.get({
                body: {
                    uri: `{buzzService}/api/v1/users/${this.props.userId}`
                }
            })
        })
    }

    render() {
        const props = this.props

        return props.userId ? <span>
            <object data={`/avatar/${props.userId}`} type="image/png"
                    className="ui image avatar" title={props.userId} alt={props.userId}>
                <Image avatar alt={props.userId} title={props.userId}
                       src={`/images/empty_avatar.jpg`}
                />
            </object>
            <span>{this.state.profile.name}</span>
                &emsp;
                <span style={{color: 'green'}}>{this.state.profile.wechat_name}</span>
                &emsp;
                <span style={{color: 'blue'}}>{this.state.profile.facebook_name}</span>
                &emsp;
                <span style={{color: 'darkgray'}}>{this.state.profile.display_name}</span>
            <span>&emsp;</span>
                {this.props.children}
        </span> :
            null
    }
}
