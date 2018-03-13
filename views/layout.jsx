import * as React from "react";
import Header from "./header";

export default class Layout extends React.Component {
    constructor() {
        super();
    }

    render() {
        console.log('path in layout: ', this.props);
        return (
            <html>
            <head>
                <title>{this.props.title}</title>
                <link rel="stylesheet"
                      href="/css/semantic.min.css"></link>
                <link rel="stylesheet" href="/css/react-big-calendar.css"></link>
            </head>
            <body>
            <Header title={this.props.title} path={this.props.path}/>
            {this.props.children}
            <script src="https://buzz-admin.herokuapp.com/js/bundle.js"></script>
            </body>
            </html>
        )
            ;
    }
}