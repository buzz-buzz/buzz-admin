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
        const profile = await CachableProxy.get({
            body: {
                uri: `{buzzService}/api/v1/users/${this.props.userId}`
            }
        })

        this.setState({profile})
    }

    render() {
        const props = this.props
        return <span>
            <object data={`/avatar/${props.userId}`} type="image/png"
                    className="ui image avatar" title={props.userId} alt={props.userId}>
                <Image avatar alt={props.userId} title={props.userId}
                       src={`/images/empty_avatar.jpg`}
                />
            </object>
            <span>{this.state.profile.name}</span>
            <span>&emsp;</span>
        </span>
    }
}