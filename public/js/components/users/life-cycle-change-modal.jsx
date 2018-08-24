import React from "react";
import {Button, Header, Icon, Modal} from "semantic-ui-react";
import {StudentLifeCyclesMapping} from "../../common/LifeCycles";

export default class LifeCycleChangeModal extends React.Component {
    render() {
        const {user, newState} = this.props

        return <Modal closeIcon open={this.props.open} onClose={this.props.onClose} size="mini">
            <Header content="流程处理"/>
            <Modal.Content>
                <p>当前流程状态：{StudentLifeCyclesMapping[(user || {}).state]}</p>
                <p>新流程状态：{StudentLifeCyclesMapping[newState]}</p>
            </Modal.Content>
            <Modal.Actions>
                <Button color="red" onClick={this.props.onClose}>
                    <Icon name="remove"/>
                    取消
                </Button>
                <Button color="green" onClick={() => {
                    this.props.changeUserState(user, newState);
                    this.props.onClose()
                }}>
                    <Icon name="checkmark"/>
                    确定
                </Button>
            </Modal.Actions>
        </Modal>
    }
}
