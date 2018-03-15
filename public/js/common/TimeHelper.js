function padZero(x) {
    x = '' + x;
    return '00'.substring(0, 2 - x.length) + x;
}

function toLocalDateTime(date) {
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}T${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
}

export default {
    toLocalDateTime: toLocalDateTime
}