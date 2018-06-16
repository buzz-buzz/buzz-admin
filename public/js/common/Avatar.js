import React from "react";
import {Image} from "semantic-ui-react";
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
            const profile = await CachableProxy.get({
                body: {
                    uri: `{buzzService}/api/v1/users/${this.props.userId}`
                }
            })

            this.setState({profile})
        }
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
            <span style={{color: 'green'}}>{this.state.profile.wechat_name}</span>
            <span style={{color: 'blue'}}>{this.state.profile.facebook_name}</span>
            <span style={{color: 'darkgray'}}>{this.state.profile.display_name}</span>
            <span>&emsp;</span>
        </span> :
            null
    }
}