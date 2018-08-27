import React from "react";
import {Dropdown, Form} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import {connect} from 'react-redux';
import {loadAllSales} from "../../redux/actions";

class UserDropdownSingle extends React.Component {
    state = {
        userId: 0,
        allSales: [],
        fetchingAllUsers: false
    }

    handleUsersChange = (event, {name, value}) => {
        this.setState({
            [name]: value
        })
    }

    fetchSales = async () => {
        this.setState({fetchingAllUsers: true})
        let result = this.props.allSales || await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v1/users`,
                qs: {
                    tags: ['销售']
                },
                useQuerystring: true
            }
        });
        this.props.loadAllSales(result)
        this.setState({
            fetchingAllUsers: false,
            allSales: result.map(u => ({
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
                           onClick={this.fetchSales}
                           search selection
                           options={this.state.allSales}
                           loading={this.state.fetchingAllUsers}/>
    }
}

export default connect(store => ({allSales: store.allSales}), dispatch => {
    return {
        loadAllSales: (users) => dispatch(loadAllSales(users))
    }
})(UserDropdownSingle)
