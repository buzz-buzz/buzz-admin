import * as React from "react";

import Layout from "../layout";

export default class StudentList extends React.Component {
    render() {
        return (
            <Layout title={this.props.title}>
                <p>Hello Students!</p>
            </Layout>
        );
    }
}