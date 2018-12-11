import moment from "moment/moment";
import React from "react";

export default ({timestamp, format, timeFix}) => timestamp ? <div>
                                <span
                                    style={{whiteSpace: 'nowrap'}}>{!timeFix ? moment(timestamp).format(format || 'LL') : moment(timestamp).subtract(8, 'hours').format(format || 'LL') }</span><br/>
    <span
        style={{color: 'lightgray'}}>{!timeFix ? moment(timestamp).calendar() : moment(timestamp).subtract(8, 'hours').calendar() }</span>，
    <span
        style={{color: 'lightgray'}}>{!timeFix ? moment(timestamp).fromNow() : moment(timestamp).subtract(8, 'hours').fromNow() }</span>
</div> : null
