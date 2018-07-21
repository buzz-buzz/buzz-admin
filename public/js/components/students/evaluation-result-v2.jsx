import * as React from 'react';
import { Table } from "semantic-ui-react";

export default class EvaluationV2 extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            result: {
                "questions": [
                    { "title": "亲爱的学员，你已经学了多久的英语?", "items": ["没有学过", "少于一年", "1-2年", "2-3年", "3年以上"] },
                    { "title": "在英语会话过程中，以下哪种描述情况与你相似?", "items": ["需要翻译听懂常用指令,能简短介绍个人和兴趣爱好", "能听懂常用指令对话并做出反应，能清楚地介绍自己，能简单描述一件事", "能简单描述一件事或事物", "能比较有条理地描述个人体验和表达个人想法"] },
                    { "title": "与首次相识的人交流中，你是否是容易或热衷于的与人沟通。", "items": ["是的，我就是", "有时候是", "完全不是"] },
                    { "title": "挑选2张你善于描述的场景并进行各不少于30秒的描述。" },
                    { "title": "请根据下图，进行30秒 - 60秒的描述。" },
                    { "title": "请根据下图，进行30秒 - 60秒的描述。" }
                ],
                "answers": [
                    "2-3年",
                    "能简单描述一件事或事物",
                    "完全不是",
                    ["//cdn-corner.resource.buzzbuzzenglish.com/placement/6.jpg", "//cdn-corner.resource.buzzbuzzenglish.com/placement/5.jpg"],
                    "https://buzz-corner.user.resource.buzzbuzzenglish.com/FjPE9M_GnqOxWRClpAt-e0L0pkwj",
                    "https://buzz-corner.user.resource.buzzbuzzenglish.com/FhCjuMPjQKRKzJefhcBSWheB263z"
                ],
                "version": 2
            }
        }

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
                        this.state.result && this.state.result.questions && this.state.result.answers &&
                        this.state.result.questions.length && this.state.result.answers.length ?
                        this.state.result.questions.map((item, index) => {
                            <Table.Row key={index}>
                                <Table.Cell>
                                    <h3>{item.title}</h3>
                                    {
                                        item.items && item.items.length &&
                                        <ol>
                                            {
                                                item.items.map((m, n) => {
                                                    <li key={n}>{m}</li>
                                                })
                                            }
                                        </ol>
                                    }
                                </Table.Cell>
                                <Table.Cell>
                                    {
                                        this.state.result.answers[index] && typeof (this.state.result.answers[index]) === 'string' && this.state.result.answers[index].indexOf('//') === -1 ?
                                        this.state.result.answers[index]
                                            :
                                            ( this.state.result.answers[index] ? this.renderMedia(this.state.result.answers, index) : '')
                                    }
                                </Table.Cell>
                            </Table.Row>
                        }) : '----'
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