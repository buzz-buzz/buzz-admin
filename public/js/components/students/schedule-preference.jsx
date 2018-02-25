import * as React from 'react';
import {Header, Modal, Segment} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class SchedulePreference extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {}
        };

        this.close = this.close.bind(this);
    }

    async componentWillReceiveProps(nextProps) {
        this.setState({
            user: nextProps.user || {}
        }, async () => {
            console.log('user set', nextProps.user)

            if (!nextProps.user) {
                return;
            }

            try {
                this.setState({loading: true})
                console.log('current user = ', this.state.user);

                let result = await
                    ServiceProxy.proxyTo({
                        body: {
                            uri: `{buzzService}/api/v1/student-class-schedule/${this.state.user.user_id}`,
                            method: 'GET'
                        }
                    });

                console.log(result);
            } catch (error) {
                this.setState({
                    error: true,
                    message: JSON.stringify(error.result)
                });
            } finally {
                this.setState({loading: false})
            }
        })
    }

    async componentDidMount() {
    }

    close() {
        this.props.onCloseCallback();
    }

    async updateProfile() {
        try {
            this.setState({loading: true});

            let updatedUser = Object.assign(this.state.user, {mobile: this.state.mobile, email: this.state.email});

            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/${this.state.user.user_id}`,
                    json: updatedUser,
                    method: 'PUT'
                }
            })

            console.log(result);

            this.props.profileUpdateCallback(result);
        } catch (error) {
            this.setState({error: true, message: JSON.stringify(error.result)});
        } finally {
            this.setState({loading: false});
        }
    }

    render() {
        return (
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={true} onClose={this.close}>
                <Header content="时间偏好"></Header>
                <Modal.Content>
                    <Segment loading={this.state.loading}>
                        <p>time</p>
                    </Segment>
                </Modal.Content>
            </Modal>
        );
    }
};