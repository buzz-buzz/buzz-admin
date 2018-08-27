import React from "react";
import {Dropdown, Form} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";
import {connect} from 'react-redux';
import {loadAllSales} from "../../redux/actions";
import {Avatar} from "../../common/Avatar";

class UserDropdownSingle extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            allSales: [],
            fetchingAllUsers: false
        }
    }

    handleUsersChange = async (event, {name, value}) => {
        this.props.changeFollowerTo(value)

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
        return <div>
            <Dropdown trigger={this.props.selectedUserId ? <Avatar userId={this.props.selectedUserId}/> : '待分配'} name="userId"
                      value={this.props.selectedUserId}
                      onChange={this.handleUsersChange}
                      onClick={this.fetchSales}
                      search
                      options={this.state.allSales}
                      loading={this.state.fetchingAllUsers} icon={null}
                      placeholder="待分配"
            />
            {this.props.selectedUserId ? <a style={{cursor: 'pointer'}} onClick={() => this.handleUsersChange(null, {name: 'userId', value: null})}>清除</a> : null}
        </div>
    }
}

export default connect(store => ({allSales: store.allSales}), dispatch => {
    return {
        loadAllSales: (users) => dispatch(loadAllSales(users))
    }
})(UserDropdownSingle)
