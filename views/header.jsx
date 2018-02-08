import * as React from "react";
import {Menu} from "semantic-ui-react";

export default class Header extends React.Component {
    state = {}
    handleItemClick = (e, {name}) => this.setState({activeItem: name})

    render() {
        const {activeItem} = this.state
        return (
            <Menu>
                <Menu.Item name="students" active={activeItem === 'students'}
                           onClick={this.handleItemClick}>Students</Menu.Item>
                <Menu.Item name="classes" active={activeItem === 'classes'}
                           onClick={this.handleItemClick}>Classes</Menu.Item>
            </Menu>
        )
    }
}