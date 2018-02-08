import * as React from "react";
import Header from "./header";

export default class Layout extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <html>
            <head>
                <title>{this.props.title}</title>
                <link rel="stylesheet"
                      href="/node_modules/semantic-ui-css/semantic.min.css"></link>
            </head>
            <body>
            <Header title={this.props.title} path={this.props.path}/>
            <p>{this.props.path}</p>
            {this.props.children}
            <script src="/js/bundle.js"></script>
            </body>
            </html>
        )
            ;
    }
}