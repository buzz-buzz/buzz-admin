import * as React from 'react';
import Balance from "./balance";
import {loadCreditsHistory} from "../../redux/actions";

export default (props) => <Balance open={props.open}
                                   user={props.user}
                                   balanceUpdatedCallback={props.integralUpdateCallback}
                                   onCloseCallback={props.onCloseCallback}
                                   balanceHistoryStoreName='creditsHistory'
                                   balanceApi='{buzzService}/api/v1/user-balance/integral/'
                                   historyApi='{buzzService}/api/v1/user-balance/'
                                   loadBalanceHistoryToStore={loadCreditsHistory}
                                   balanceType={'integral'}

/>
