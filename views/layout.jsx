import * as React from "react";
import Header from "./header";
import cdn from "./cdn";
import {Container} from "semantic-ui-react";

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
                      href="/css/semantic.min.css"/>
                <link rel="stylesheet"
                      href={cdn("/react-big-calendar/lib/css/react-big-calendar.css", this.props.v)}/>
                <link rel={"stylesheet"}
                      href={cdn('/react-datepicker/dist/react-datepicker.min.css', this.props.v)}/>
                <link rel="stylesheet" href="/css/style.css"/>
            </head>
            <body>
            <Header title={this.props.title} path={this.props.path} user={this.props.user}/>
            <Container style={{marginTop: '7em'}}>
                {this.props.children}
            </Container>
            <script src={cdn("/js/bundle.js", this.props.v)}></script>
            </body>
            </html>
        )
            ;
    }
}
