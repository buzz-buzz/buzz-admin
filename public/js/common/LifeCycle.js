import React from 'react'
import {Dropdown} from "semantic-ui-react";
import {StudentLifeCyclesMapping} from "./LifeCycles";

export default class LifeCycle extends React.Component {
    handleChange = (event, data) => {
        if (this.props.user.state !== data.value) {
            this.props.changeState(data.value)
        }
    };

    render() {
        const {user} = this.props

        const options = Object.keys(StudentLifeCyclesMapping).map(state => ({
            key: state,
            text: StudentLifeCyclesMapping[state],
            value: state
        }))
        return <Dropdown name="state" trigger={<span>{StudentLifeCyclesMapping[user.state]}</span>} options={options} value={user.state} onChange={this.handleChange} on={['hover']}/>
    }
}
