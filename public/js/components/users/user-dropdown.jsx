import React from "react";
import {Dropdown, Form} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import {connect} from 'react-redux';
import {loadAllUsers} from "../../redux/actions";

class UserDropdownSingle extends React.Component {
    state = {
        userId: 0,
        allUsers: [],
        fetchingAllUsers: false
    }

    handleUsersChange = (event, {name, value}) => {
        this.setState({
            [name]: value
        })
    }

    fetchAllUsers = async () => {
        this.setState({fetchingAllUsers: true})
        let result = this.props.allUsers || await ServiceProxy.proxyTo({
            body: {uri: `{buzzService}/api/v1/users`}
        });
        this.props.loadAllUsers(result)
        this.setState({
            fetchingAllUsers: false,
            allUsers: result.map(u => ({
                key: u.user_id,
                value: u.user_id,
                text: u.name || u.display_name || u.wechat_name,
                // description: u.display_name,
                image: {avatar: true, src: u.avatar}
            }))
        });
    }

    render() {
        return <Form.Field control={Dropdown} name="userId"
                           value={this.state.userId}
                           onChange={this.handleUsersChange}
                           onClick={this.fetchAllUsers}
                           search selection
                           options={this.state.allUsers}
                           loading={this.state.fetchingAllUsers}/>
    }
}

export default connect(store => ({allUsers: store.allUsers}), dispatch => {
    return {
        loadAllUsers: (users) => dispatch(loadAllUsers(users))
    }
})(UserDropdownSingle)
