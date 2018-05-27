import * as React from "react";
import {Container, Menu} from "semantic-ui-react";

export default class Header extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const activeItem = this.props.path;
        return (
            <Menu fixed="top" inverted>
                <Container>
                    <Menu.Item name="students" active={activeItem.startsWith('/students')}
                               href="/students">中方学生列表</Menu.Item>
                    <Menu.Item name="/companions" active={activeItem.startsWith('/companions')}
                               href="/companions">外籍伙伴列表</Menu.Item>
                    <Menu.Item name="classes" active={activeItem.startsWith('/classes')}
                               href="/classes">班级课程列表</Menu.Item>
                    <Menu.Item name="content-list" active={activeItem === '/content-list'}
                               href="/admin-neue/content-list" target="_blank">内容管理</Menu.Item>
                </Container>
            </Menu>
        )
    }
}
