import moment from 'moment-timezone'

function toLocalDateTime(date) {
    return moment(date).format(moment.HTML5_FMT.DATETIME_LOCAL);
}

export default {
    toLocalDateTime: toLocalDateTime,
    tzShift(dateTime, oldTz, newTz) {
        // console.log({dateTime, oldTz, newTz})
        return moment.tz(dateTime, oldTz).tz(newTz)
    },
    momentLocalDateTime(m) {
        return m.format('YYYY-MM-DDTHH:mm:ss')
    },
}
