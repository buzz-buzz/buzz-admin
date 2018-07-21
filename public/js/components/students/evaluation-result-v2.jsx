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
                                        item.items.map((m, n) => <p key={n}>{n + 1 + ':' + m}</p>)
                                    }
                                </div>
                            }
                        </Table.Cell>
                        <Table.Cell>
                            {
                                this.props.result.answers[index] && typeof (this.props.result.answers[index]) === 'string' && this.props.result.answers[index].indexOf('//') === -1 ?
                                this.props.result.answers[index]
                                    :
                                    ( this.props.result.answers[index] ? this.renderMedia(this.props.result.answers, index) : '--未作答--')
                            }
                        </Table.Cell>
                    </Table.Row>)
                    }
                </Table.Body>
            </Table>
        )
    }

    renderMedia(answers, index) {
        if(index === 3 && answers[index] && answers[index].length === 2){
            return <div>
                <img src={answers[index][0]} style={{width: '160px', marginRight: '20px'}} alt=""/>
                <img src={answers[index][1]} style={{width: '160px'}} alt=""/>
            </div>
        }else if(index > 3 ){
            return <div>
                <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center' }}>
                    <audio controls src={answers[index]}>
                    </audio>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <a href={`https://buzz-corner.user.resource.buzzbuzzenglish.com/amr/index.html?url=${encodeURIComponent(answers[index]).replace('%3Favvod%2Fm3u8', '')}`}
                       target="_blank" rel="no-opener">在线播放</a>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <a href={`/m3u8/index.html?url=${encodeURIComponent(answers[index])}`}
                       target="_blank" rel="no-opener">在线播放二</a>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <a href={answers[index]}
                       target="_blank" rel="no-opener">原始音频文件下载</a>
                </div>
            </div>
        }
    }
}