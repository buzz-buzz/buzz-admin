import moment from "moment/moment";
import React from "react";

export default ({timestamp}) => <div>
                                <span
                                    style={{whiteSpace: 'nowrap'}}>{moment(timestamp).format('LL')}</span><br/>
    <span
        style={{color: 'lightgray'}}>{moment(timestamp).calendar()}</span><br/>
    {moment(timestamp).format('dddd')}<br/>
    <span
        style={{color: 'lightgray'}}>{moment(timestamp).fromNow()}</span>
</div>
