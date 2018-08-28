import React from "react";
import {Avatar} from "../../common/Avatar";
import moment from "moment/moment";

export default class ClassAvatar extends React.Component {
    render() {
        let {classInfo} = this.props
        if (!classInfo) {
            classInfo = {}
        }

        return classInfo.class_id ? <div onClick={(event) => ClassAvatar.gotoClassDetail(event, classInfo.class_id)}>
            <div style={{whiteSpace: 'nowrap', cursor: 'pointer'}}>Tutor：
                {
                    (classInfo.tutors || '').split(',').filter(i => isFinite(i)).map(tutorId => <Avatar key={tutorId} userId={tutorId}/>)
                }
            </div>
            <div style={{whiteSpace: 'nowrap'}}>
                话题：{classInfo.topic}
            </div>
            <div style={{whiteSpace: 'nowrap'}}>
                时间：{moment(classInfo.start_time).format('LL')} {moment(classInfo.start_time).format('LT')} - {moment(classInfo.end_time).format('LT')}
            </div>
        </div> : null
    }

    static gotoClassDetail(event, class_id) {
        if (class_id) {
            event.stopPropagation()
            window.open(`/admin-neue/classDetail/${class_id}`, '_blank')
        }
    }
}
