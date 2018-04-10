import moment from 'moment-timezone'

function padZero(x) {
    x = '' + x;
    return '00'.substring(0, 2 - x.length) + x;
}

function toLocalDateTime(date) {
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}T${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
}

export default {
    toLocalDateTime: toLocalDateTime,
    tzShift(dateTime, oldTz, newTz){
      // console.log({dateTime, oldTz, newTz})
      return moment.tz(dateTime, oldTz).tz(newTz)
    },
    momentLocalDateTime(m) {
      return m.format('YYYY-MM-DDTHH:mm:ss')
    },
}
