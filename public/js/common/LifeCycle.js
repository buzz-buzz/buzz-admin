import React from 'react'
import {Dropdown} from "semantic-ui-react";
import {StudentLifeCyclesMapping} from "./LifeCycles";

export default class LifeCycle extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            state: props.user.state
        }
    }

    handleChange = (event, data) => {
        if (this.props.user.state !== data.value) {
            this.props.changeState(data.value)
            this.setState({
                state: data.value
            })
        }
    };

    render() {
        const options = Object.keys(StudentLifeCyclesMapping).map(state => ({
            key: state,
            text: StudentLifeCyclesMapping[state],
            value: state
        }))
        return <div><Dropdown name="state" trigger={<span>{StudentLifeCyclesMapping[this.state.state]}</span>} options={options} value={this.state.state} onChange={this.handleChange} on={['hover']}/></div>
    }
}
