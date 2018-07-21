import * as React from 'react';
import { Table } from "semantic-ui-react";

export default class EvaluationV2 extends React.Component {
    constructor(props) {
        super(props);

        this.renderMedia = this.renderMedia.bind(this);
    }

    render() {
        return (
            <Table compact>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>问题</Table.HeaderCell>
                        <Table.HeaderCell>答案</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {
                        this.props.result && this.props.result.questions && this.props.result.answers &&
                        this.props.result.questions.length && this.props.result.answers.length &&
                        this.props.result.questions.map((item, index) => <Table.Row key={index}>
                        <Table.Cell>
                            <h3>{item.title}</h3>
                            {
                                item.items && item.items.length &&
                                <div>
                                    {
                                        item.items.map((m, n) => <p key={n}>{m}</p>)
                                    }
                                </div>
                            }
                        </Table.Cell>
                        <Table.Cell>
                            {
                                this.props.result.answers[index] && typeof (this.props.result.answers[index]) === 'string' && this.props.result.answers[index].indexOf('//') === -1 ?
                                this.props.result.answers[index]
                                    :
                                    ( this.props.result.answers[index] ? this.renderMedia(this.props.result.answers, index) : '')
                            }
                        </Table.Cell>
                    </Table.Row>)
                    }
                </Table.Body>
            </Table>
        )
    }

    renderMedia(answers, index) {
        if(index === 3){

        }

        return answers[index] + '----media';
    }
}