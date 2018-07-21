import * as React from 'react';
import { Table } from "semantic-ui-react";

export default class EvaluationV2 extends React.Component {
    constructor(props) {
        super(props);

        this.renderMedia = this.renderMedia.bind(this);
    }

    render() {
        let result = this.props.data;

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
                        result && result.questions && result.answers &&
                        result.questions.length && result.answers.length &&
                        result.questions.map((item, index) => {
                            <Table.Row key={index}>
                                <Table.Cell>
                                    <h3>{item.title}</h3>
                                    {
                                        item.items && item.items.length &&
                                        <ol>
                                            {
                                                item.items.map((m, n)=>{
                                                    <li key={n}>{m}</li>
                                                })
                                            }
                                        </ol>
                                    }
                                </Table.Cell>
                                <Table.Cell>
                                    {
                                        result.answers[index] && typeof(result.answers[index]) === 'string' && result.answers[index].indexOf('//') === -1 ?
                                        result.answers[index] 
                                        :
                                        this.renderMedia(result.answers, index)
                                    }
                                </Table.Cell>
                            </Table.Row>
                        })
                    }
                </Table.Body>
            </Table>
        )
    }

    renderMedia(answers, index){
        return answers[index] + '----media'
    }
}