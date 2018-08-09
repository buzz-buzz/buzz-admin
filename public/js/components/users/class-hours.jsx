import * as React from 'react';
import Balance from "./balance";
import {clearClassHourHistory, loadClassHourHistory} from "../../redux/actions";

export default class ClassHours extends React.Component {
    render() {
        return <Balance open={this.props.open}
                        user={this.props.user}
                        balanceUpdatedCallback={this.props.classHoursUpdateCallback}
                        onCloseCallback={this.props.onCloseCallback}
                        balanceHistoryStoreName='classHourHistory'
                        balanceApi='{buzzService}/api/v1/user-balance/'
                        historyApi='{buzzService}/api/v1/user-balance/h/'
                        loadBalanceHistoryToStore={loadClassHourHistory}
                        clearBalanceHistory={clearClassHourHistory}
                        balanceType={'class_hours'}
        />
    }
};
