import * as React from "react";
import {Container, Dropdown, Image, Menu} from "semantic-ui-react";
import CurrentUser from "./common/CurrentUser";
import {Avatar} from "./common/Avatar";

export default class Header extends React.Component {
    constructor(props) {
        super(props);

        this.state = {user: {profile: {}}};
    }

    async componentWillMount() {
        this.setState({
            user: await CurrentUser.getInstance()
        })
    }

    render() {
        const activeItem = window.location.pathname;
        const {user} = this.state;

        return (
            <Menu fixed="top" inverted>
                <Container fluid>
                    <Menu.Item name="users" active={activeItem.startsWith('/users')} href="/users">所有用户列表</Menu.Item>
                    <Menu.Item name="students" active={activeItem.startsWith('/students')}
                               href="/students">中方学生列表</Menu.Item>
                    <Menu.Item name="/companions" active={activeItem.startsWith('/companions')}
                               href="/companions">外籍伙伴列表</Menu.Item>
                    <Menu.Item name="classes" active={activeItem.startsWith('/classes')}
                               href="/classes">班级课程列表</Menu.Item>
                    <Menu.Item name="content-list" active={activeItem === '/content-list'}
                               href="/admin-neue/content-list" target="_blank">内容管理</Menu.Item>
                    <Menu.Item name="banner-list" active={activeItem === '/banner-list'} href="/admin-neue/bannerList"
                               target="_blank">运营位管理</Menu.Item>
                    <Menu.Item name="faq-list" active={activeItem === '/faq-list'} href="/admin-neue/faq-list"
                               target="_blank">常见问题管理</Menu.Item>
                    <Menu.Item name="importUser" active={activeItem === '/importUser'} href="/admin-neue/importUser"
                               target="_blank">导入用户</Menu.Item>
                    <Menu.Item name="weappList" active={activeItem === '/weappList'} href="/admin-neue/weappList"
                               target="_blank">小程序配置</Menu.Item>
                    <Menu.Menu position="right">
                        <Dropdown item trigger={<Avatar userId={user.userId} profile={user.profile} icon={null}/>}>
                            <Dropdown.Menu>
                                <Dropdown.Item as='a' href={`/users/${user.userId}`}>账号</Dropdown.Item>
                                <Dropdown.Item as='a' href='/sign-out'>退出登录</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Menu.Menu>
                </Container>
            </Menu>
        )
    }
}
