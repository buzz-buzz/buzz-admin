// var Content = require('../public/js/components/content');
// var escapeHtml = require('escape-html');
// var ReactDOMServer = require('react-dom/server');

import Layout from "./layout";
import * as React from "react";

export default class index extends React.Component {
    render() {
        // pass data to client side js
        // xss!!!
        // var dataScript = `window.__list__ = '${escapeHtml(JSON.stringify(this.props.list))}';`;
        // render as a dynamic react component
        // var contentString = ReactDOMServer.renderToString(<Content list={this.props.list}/>);

        return (
            <Layout title={this.props.title} path={this.props.path} v={this.props.v} config={this.props.config}>
                <p>v = {this.props.v}</p>
                <div id="content"></div>
            </Layout>
        );
    }
}
