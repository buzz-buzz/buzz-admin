import * as React from 'react';
import {Form, Header, Icon, Message, Modal, TextArea, Dropdown} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

export default class LevelModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            level: '',
            levelDetail: '',
            jsonDetail: {},
            update_level: ''
        }

        this.handleChange = this.handleChange.bind(this);
        this.close = this.close.bind(this);
        this.saveLevel = this.saveLevel.bind(this);
    }

    handleChange(e, {name, value}) {
        this.setState({
            [name]: value
        })
    }

    componentDidMount() {
    }

    async componentWillReceiveProps(nextProps) {
        this.setState({
            level: nextProps.user ? (nextProps.user.level || '') : '',
            update_level: nextProps.user ? (nextProps.user.level || '') : '',
            userId: nextProps.user ? nextProps.user.user_id : 0
        })

        if (nextProps.user && nextProps.user.user_id && !this.state.detail) {
            this.setState({loading: true});

            try {
                let result = await ServiceProxy.proxyTo({
                    body: {
                        uri: `{buzzService}/api/v1/user-placement-tests/${nextProps.user.user_id}`,
                        method: 'GET'
                    }
                })

                console.log('result = ', result);
                this.setState({levelDetail: result.detail});

                if (result.detail) {
                    this.setState({
                        jsonDetail: JSON.parse(result.detail)
                    })
                } else {
                    this.setState({
                        jsonDetail: {}
                    })
                }

            } catch (error) {
                this.setState({error: true, message: JSON.stringify(error.result || error.message || error)});
            } finally {
                this.setState({loading: false})
            }
        }
    }

    async saveLevel() {
        try {
            this.setState({loading: true, error: false});
            let result = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/user-placement-tests/${this.state.userId}`,
                    method: 'PUT',
                    json: {
                        level: this.state.update_level
                    }
                }
            });

            console.log('result = ', result);
            this.setState({
                level: result.level
            })

            this.props.onLevelUpdated(result);
        } catch (error) {
            this.setState({
                error: true,
                message: JSON.stringify(error.result)
            })
        } finally {
            this.setState({loading: false})
        }
    }

    close() {
        this.props.onCloseCallback();
    }

    render() {
        const {level} = this.state;
        return (
            <Modal open={this.props.open} closeOnEscape={true} closeOnRootNodeClick={false} onClose={this.close}>
                <Header content="能力评级"></Header>
                <Modal.Content>
                    <p>当前评级：{this.state.level}</p>
                    <Form error={this.state.error} loading={this.state.loading}>
                        <Message error header="出错了" content={this.state.message}/>
                        {
                            !this.state.jsonDetail.questions &&

                            <Form.Group>
                                <TextArea autoHeight rows={3} value={this.state.levelDetail}
                                          placeholder="答题详情"></TextArea>
                            </Form.Group>
                        }
                        <Form.Group>
                            <Form.Field>
                                        <label>能力评级</label>
                                        <Dropdown selection name="update_level"  onChange={this.handleChange}
                                                  options={[{key: '1', value: '1', text: '1'},
                                                  {key: '2', value: '2', text: '2'},
                                                  {key: '3', value: '3', text: '3'},
                                                  {key: '4', value: '4', text: '4'},
                                                  {key: '5', value: '5', text: '5'},
                                                  {key: '6', value: '6', text: '6'},]}
                                                  value={this.state.update_level} placeholder="能力评级"/>
                            </Form.Field>
                            <Form.Button content="保存" type="button" onClick={this.saveLevel}/>
                            <Form.Button className="right floated" content="取消" type="button" onClick={this.close}/>
                        </Form.Group>
                    </Form>
                    <ol>
                        {
                            this.state.jsonDetail && this.state.jsonDetail.questions && this.state.jsonDetail.questions.map((q, k) =>
                                <li key={k}>
                                    <h3>{q.title}</h3>
                                    <ul>
                                        {
                                            q.items.map((item, i) =>
                                                <li key={i}>
                                                    {
                                                        this.state.jsonDetail.answers[i].charCodeAt(0) + i - 'A'.charCodeAt(0) === 0 &&
                                                        <Icon name="checkmark box"/>
                                                    }
                                                    {item}
                                                </li>
                                            )
                                        }
                                    </ul>
                                </li>
                            )
                        }
                        {
                            this.state.jsonDetail.answers &&
                            <li>
                                <audio controls
                                       src={typeof this.state.jsonDetail.answers[this.state.jsonDetail.questions.length] === 'object' ? this.state.jsonDetail.answers[this.state.jsonDetail.questions.length].url : this.state.jsonDetail.answers[this.state.jsonDetail.questions.length]}>
                                </audio>
                                <a href={typeof this.state.jsonDetail.answers[this.state.jsonDetail.questions.length] === 'object' ? this.state.jsonDetail.answers[this.state.jsonDetail.questions.length].url : this.state.jsonDetail.answers[this.state.jsonDetail.questions.length]}
                                   target="_blank" rel="no-opener">原始音频文件</a>
                                   &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <a href={`/m3u8/index.html?url=${encodeURIComponent(typeof this.state.jsonDetail.answers[this.state.jsonDetail.questions.length] === 'object' ? this.state.jsonDetail.answers[this.state.jsonDetail.questions.length].url : this.state.jsonDetail.answers[this.state.jsonDetail.questions.length])}`}
                                   target="_blank" rel="no-opener">在线播放</a>
                            </li>
                        }
                    </ol>
                </Modal.Content>
            </Modal>
        );
    }
};
