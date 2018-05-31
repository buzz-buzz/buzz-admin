import React from "react";
import {Dropdown} from "semantic-ui-react";
import ServiceProxy from "../../service-proxy";

const getOptions = () => {
    return []
}

export default class UserTags extends React.Component {
    state = {
        isFetching: false,
        allTags: [],
        currentTags: []
    }

    async componentWillMount() {
        this.setState({isFetching: true})

        try {
            let allTags = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/tags`
                }
            })

            let userTags = await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/tags/${this.props.userId}`
                }
            })

            this.setState({
                allTags: allTags.map(to => {
                    return {
                        key: to.tag,
                        text: to.tag,
                        value: to.tag
                    }
                }),
                currentTags: userTags.map(to => to.tag)
            })
        } catch (ex) {
            console.error(ex)
        } finally {
            this.setState({isFetching: false})
        }
    }

    handleAddTag = async (e, {value: tag}) => {
        this.setState({
            allTags: [{text: tag, value: tag, key: tag}, ...this.state.allTags]
        })
    }

    async saveNewTagsToServer(tags) {
        console.log('saving"")...')
        if (tags.length) {
            await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/tags/${this.props.userId}`,
                    json: tags,
                    method: 'POST'
                }
            })
        }
    }

    async deleteTagsFromServer(tags) {
        if (tags.length) {
            await ServiceProxy.proxyTo({
                body: {
                    uri: `{buzzService}/api/v1/users/tags/${this.props.userId}`,
                    json: tags,
                    method: 'DELETE'
                }
            })
        }
    }

    handleChange = async (e, {value}) => {
        console.log('handleing');
        try {
            this.setState({isFetching: true})

            await this.deleteTagsFromServer(this.state.currentTags.filter(tag => value.indexOf(tag) < 0))
            await this.saveNewTagsToServer(value.filter(tag => this.state.currentTags.indexOf(tag) < 0))

            this.setState({
                currentTags: value
            })
        } catch (ex) {
            console.error(ex)
        } finally {
            this.setState({isFetching: false})
        }
    }

    render() {
        const {isFetching, currentTags, allTags} = this.state

        return (
            <Dropdown multiple search selection options={allTags} value={currentTags} placeholder="标签" allowAdditions
                      loading={isFetching} onAddItem={this.handleAddTag} onChange={this.handleChange}/>)
    }
}