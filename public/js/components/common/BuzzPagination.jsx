import React from "react";
import {Dropdown, Form, Icon, Pagination, Segment, Table} from "semantic-ui-react";

export let BuzzPaginationData = {
    current_page: 1,
    per_page: Number(window.localStorage.getItem('pagination.per_page')) || 10,
    total: 1,
    last_page: 1
};

export default class BuzzPagination extends React.Component {
    state = {
        per_page: this.props.pagination.per_page
    };

    handleInputChange = (e, {name, value}) => {
        this.setState({[name]: value}, () => {
            this.props.paginationChanged(Object.assign({}, this.props.pagination, this.state))
        });
    };

    render() {
        return (
            <Table.HeaderCell colSpan={this.props.colSpan}>
                <label>每页条数：</label>
                <Dropdown compact search searchInput={{type: 'number'}} selection options={[{
                    key: 10, text: '10', value: 10
                }, {
                    key: 20, text: '20', value: 20
                }, {
                    key: 50, text: '50', value: 50
                }, {
                    key: 100, text: '100', value: 100
                }, {
                    key: 1000, text: '1000', value: 1000
                }]} placeholder="选择每页条数" value={this.state.per_page}
                          onChange={(e, {value}) => this.handleInputChange(e, {name: 'per_page', value})}/>
                &emsp;
                <Pagination
                    defaultActivePage={1}
                    ellipsisItem={{
                        content: <Icon name='ellipsis horizontal'/>,
                        icon: true
                    }}
                    firstItem={{
                        content: <Icon name='angle double left'/>,
                        icon: true
                    }}
                    lastItem={{
                        content: <Icon name='angle double right'/>,
                        icon: true
                    }}
                    prevItem={{
                        content: <Icon name='angle left'/>,
                        icon: true
                    }}
                    nextItem={{
                        content: <Icon name='angle right'/>,
                        icon: true
                    }}
                    totalPages={this.props.pagination.last_page}
                    onPageChange={this.props.gotoPage}
                ></Pagination>
            </Table.HeaderCell>
        )
    }
}