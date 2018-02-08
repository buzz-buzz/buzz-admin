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
                      href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.12/semantic.min.css"></link>
            </head>
            <body>
            <Header/>
            {this.props.children}
            </body>
            </html>
        );
    }
}