import * as React from "react";
import {Menu} from "semantic-ui-react";
import {ClassStatusCode} from "../../common/ClassStatus";

export default class ClassStatuses extends React.Component {
    constructor() {
        super();

        this.state = {
            statuses: [],
            counter: {},
            activeItem: ClassStatusCode.Opened
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && (typeof nextProps !== 'undefined')) {
            let counter = nextProps.classes.reduce((counter, c) => {
                if (typeof counter[c.status] === 'undefined') {
                    counter[c.status] = 1;
                } else {
                    counter[c.status] += 1;
                }

                return counter;
            }, {});

            let statuses = Object.keys(counter).sort();

            this.setState({
                counter,
                statuses,
                activeItem: nextProps.activeStatus
            })
        }
    }

    render() {
        return (<div>
            {
                this.state.statuses.length &&

                <Menu fluid widths={this.state.statuses.length}>
                    {
                        this.state.statuses.map(
                            status =>
                                <Menu.Item name={status} active={this.state.activeItem === status}
                                           onClick={() => this.switchTo(status)} key={status}/>
                        )
                    }
                </Menu>
            }
        </div>)
    }

    switchTo(status) {
        this.setState({activeItem: status}, () => {
            this.props.activeStatusChanged(status);
        });
    }
}