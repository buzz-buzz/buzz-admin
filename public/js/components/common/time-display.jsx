import moment from "moment/moment";
import React from "react";

export default ({timestamp, format}) => timestamp ? <div>
                                <span
                                    style={{whiteSpace: 'nowrap'}}>{moment(timestamp).format(format || 'LL')}</span><br/>
    <span
        style={{color: 'lightgray'}}>{moment(timestamp).calendar()}</span>，
    <span
        style={{color: 'lightgray'}}>{moment(timestamp).fromNow()}</span>
</div> : null
