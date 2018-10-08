import React from 'react';

function getZoomRoomId(zoomUrl) {
    return zoomUrl? zoomUrl.replace('https://zoom.us/j/', '') : ''
}

export default ({roomUrl}) => <a onClick={e => e.stopPropagation()}
                                 href={ roomUrl && (roomUrl.startsWith('http://') || roomUrl.startsWith('https://') || roomUrl.startsWith('//')) ? roomUrl : 'javascript: void(0)'}
                                 target="_blank"
                                 rel="noreferrer noopener">{getZoomRoomId(roomUrl)}</a>
