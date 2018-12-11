import moment from "moment/moment";
import React from "react";

export default ({timestamp, format, timeFix}) => timestamp ? <div>
                                <span
                                    style={{whiteSpace: 'nowrap'}}>{!timeFix ? moment(timestamp).format(format || 'LL') : moment(timestamp).subtract(8, 'h') }</span><br/>
    <span
        style={{color: 'lightgray'}}>{!timeFix ? moment(timestamp).calendar() : moment(timestamp).subtract(8, 'h').calendar() }</span>，
    <span
        style={{color: 'lightgray'}}>{!timeFix ? moment(timestamp).fromNow() : moment(timestamp).subtract(8, 'h').fromNow() }</span>
</div> : null
