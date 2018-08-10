import React from 'react'
import {ClassStatusCode} from "../../common/ClassStatus";

export default ({user}) => <div>
    <div>
        <a
            title="总课时数"><strong>{(user.class_hours + user.booked_class_hours) || 0}</strong></a>
        {
            user.consumed_class_hours &&

            <a title="已消费课时，点击查看消费详情"
               style={{color: 'lightgray'}}
               href={`/classes/?userIds=${user.user_id}&statuses=${ClassStatusCode.Ended}&start_time=1990-1-1`}
               target="_blank"
               onClick={(event) => event.stopPropagation()}>（{user.consumed_class_hours || 0}）</a>
        }
    </div>
    <div
        style={{whiteSpace: 'nowrap'}}>
        <a title="可用课时数">{user.class_hours || 0}</a>
        {
            user.booked_class_hours &&
            <a style={{color: 'gray'}}
               href={`/classes/?userIds=${user.user_id}&statuses=${ClassStatusCode.Opened}&statuses=${ClassStatusCode.Cancelled}&start_time=1990-1-1`}
               target="_blank"
               title="冻结课时数，点击查看详情"
               onClick={(event) => event.stopPropagation()}
            >（{user.booked_class_hours || 0}）</a>
        }
    </div>
</div>
