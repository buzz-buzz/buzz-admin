import React from 'react';

function getZoomRoomId(zoomUrl, MeetingId) {
    if(!zoomUrl && MeetingId){
        return MeetingId;
    }else{
        return zoomUrl ? zoomUrl.replace('https://zoom.us/j/', '') : (MeetingId || '');
    }
}

export default ({roomUrl, MeetingId}) => <a onClick={e => e.stopPropagation()}
                                 href={ roomUrl && (roomUrl.indexOf('http://') > -1 || roomUrl.indexOf('https://') > -1 || roomUrl.indexOf('//') > -1) ? roomUrl : ( MeetingId ? "https://zoom.us/j/" + MeetingId : 'javascript: void(0)')}
                                 target="_blank"
                                 rel="noreferrer noopener">{getZoomRoomId(roomUrl, MeetingId)}</a>
