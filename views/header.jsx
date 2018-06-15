import * as React from "react";
import {Container, Image, Menu} from "semantic-ui-react";

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
                    <Menu.Menu position="right">
                        <Menu.Item href={`/users/${this.props.user.user_id}`}>
                            <object data={this.props.user.profile.avatar} type="image/png" className="ui image avatar"
                                    title={this.props.user.profile.name} alt={this.props.user.profile.name}>
                                <Image avatar src="/images/empty_avatar.jpg" title={this.props.user.profile.name}
                                       alt={this.props.user.profile.name}
                                       label={this.props.user.isSuper ? {
                                           as: 'a',
                                           color: 'red',
                                           corner: 'right',
                                           icon: 'heart'
                                       } : {}}
                                ></Image>
                            </object>
                        </Menu.Item>
                        <Menu.Item
                            name="退出登录"
                            active={activeItem === '/sign-out'}
                            href="/sign-out"
                        />
                    </Menu.Menu>
                </Container>
            </Menu>
        )
    }
}
