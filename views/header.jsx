import * as React from "react";
import {Menu} from "semantic-ui-react";

export default class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const activeItem = this.props.path;
        console.log('path = ', this.props.path);
        return (
            <Menu>
                <Menu.Item name="students" active={(activeItem || '').startsWith('/students')}
                           href="/students">Students</Menu.Item>
                <Menu.Item name="/companions" active={(activeItem || '').startsWith('/companions')} href="/companions">Companions</Menu.Item>
                <Menu.Item name="classes" active={activeItem === '/classes'} href="/classes">Classes</Menu.Item>
            </Menu>
        )
    }
}
