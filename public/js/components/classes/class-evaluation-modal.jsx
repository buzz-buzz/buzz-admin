import * as React from "react";
import {Button, Image, Modal, Rating, Segment, Table} from 'semantic-ui-react'
import ServiceProxy from "../../service-proxy";

export default class ClassEvaluation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            feedbacks: [],
        }

        this.close = this.close.bind(this);
        this.searchClassesEvaluation = this.searchClassesEvaluation.bind(this);
    }

    async componentDidMount() {
    }

    async componentWillReceiveProps(nextProps) {
        if (nextProps.classInfo && nextProps.classInfo.class_id) {
            await this.searchClassesEvaluation(nextProps.classInfo.class_id);
        }
    }

    async searchClassesEvaluation(classId) {
        let result = await ServiceProxy.proxyTo({
            body: {
                uri: `{buzzService}/api/v1/class-feedback/admin-list/${classId}`,
                method: 'GET',
            }
        })

        this.setState({
            loading: false,
            feedbacks: result.filter(f => f.class_id)
        })
    }

    close() {
        this.props.onClose();
    }

    render() {
        return (
            <Modal
                closeOnDimmerClick={false}
                open={this.props.open}
                onClose={this.close}

            >
                <Modal.Header>课后评价</Modal.Header>
                <Modal.Content scrolling>
                    <Segment loading={this.state.loading}>
                        <Table celled padded>

                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell>评价人</Table.HeaderCell>
                                    <Table.HeaderCell>评价对象</Table.HeaderCell>
                                    <Table.HeaderCell>评价星级</Table.HeaderCell>
                                    <Table.HeaderCell>评价内容</Table.HeaderCell>
                                    <Table.HeaderCell>评价时间</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>

                            <Table.Body>
                                {
                                    this.state.feedbacks.map((c, i) =>
                                        <Table.Row key={i}>
                                            <Table.Cell>
                                                {
                                                    <Image avatar alt={c.from_user_id}
                                                           title={c.from_user_id}
                                                           src={`/avatar/${c.from_user_id}`}
                                                           key={c.from_user_id}/>
                                                }
                                            </Table.Cell>
                                            <Table.Cell>
                                                {
                                                    <Image avatar alt={c.to_user_id}
                                                           title={c.to_user_id}
                                                           src={`/avatar/${c.to_user_id}`}
                                                           key={c.to_user_id}/>
                                                }
                                            </Table.Cell>
                                            <Table.Cell>
                                                <Rating disabled icon='star' defaultRating={c.score} maxRating={5}/>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {c.comment}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {c.feedback_time}
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                }

                            </Table.Body>

                        </Table>
                    </Segment>
                </Modal.Content>
                <Modal.Actions>
                    <Button content='关闭' onClick={this.close}/>
                </Modal.Actions>
            </Modal>
        )
    }
}