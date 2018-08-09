import * as React from 'react';
import Balance from "./balance";
import {loadClassHourHistory} from "../../redux/actions";

export default class ClassHours extends React.Component {

    render() {
        return <Balance open={this.props.open}
                        user={this.props.user}
                        balanceUpdatedCallback={this.props.classHoursUpdateCallback}
                        onCloseCallback={this.props.onCloseCallback}
                        balanceHistoryStoreName='classHourHistory'
                        historyApi='{buzzService}/api/v1/class-hours/history/'
                        balanceApi='{buzzService}/api/v1/user-balance/'
                        loadBalanceHistoryToStore={loadClassHourHistory}
                        balanceType={'class_hours'}
        />
    }
};
