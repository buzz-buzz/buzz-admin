import * as React from "react";

export default class Layout extends React.Component {
    constructor() {
        super();
    }

    render() {
        return (
            <html>
            <head>
                <title>{this.props.title}</title>
                <link rel="stylesheet" href="/css/main.css"/>
            </head>
            <body>
            {this.props.children}
            <script src="/js/bundle.js"></script>
            </body>
            </html>
        );
    }
}